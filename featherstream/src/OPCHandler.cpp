#include "OPCHandler.hpp"
#include "Renderer.hpp"

#include <Arduino.h>
#include <WiFi101.h>

using namespace featherstream;

#define MODE_DATA    0
#define MODE_HEADER  1
#define MODE_DISCARD 2

#define CMD_SET_8_BIT 0
#define CMD_SYSEX 255

OPCHandler::OPCHandler(
  Renderer &renderer
): renderer(renderer) {
  this->mode = MODE_HEADER;
  this->numLEDs = this->nextNumLEDs = renderer.getLength();

  byte macBytes[6];
  WiFi.macAddress(macBytes);
  String macString = "";

  for (int i = 5; i >= 0; i--) {
    // macString += sprintf("%02X", macBytes[i]);
    // if (mac[i] < 16) {
    //   macString += "0";
    // }

    // macString += mac[i], HEX);
    macString += macBytes[i];
    if (i > 0) {
      macString += ":";
    }
  }

  this->deviceId = "fs:" + macString;
}

OPCHandler::~OPCHandler() {
}

bool OPCHandler::connect(uint8_t channel, const IPAddress &address, uint16_t port) {
  this->client = WiFiClient();

  if (this->client.connect(address, port)) {
    this->client.print("GET /devices/");
    this->client.print(this->getDeviceID());
    this->client.println("/opc HTTP/1.0");
    this->client.println();

    return true;
  } else {
    return false;
  }
}

void OPCHandler::disconnect() {
  this->client.stop();
}

bool OPCHandler::isConnected() {
  return this->client.connected();
}

const String &OPCHandler::getDeviceID() const {
  return this->deviceId;
}

bool OPCHandler::loop() {
  if (this->client.connected() && this->consecutiveSecondsWithoutFrames < 5) {
    /**
     * Processing logic copied in from lightship demo.
     */
    uint32_t t, seconds;
    int16_t  a, bytesPending;

    // DITHER-AND-RECEIVE LOOP STARTS HERE -------------------------------

    // // Interpolation weight (0-255) is the ratio of the time since last
    // // frame arrived to the prior two frames' interval.
    // t                   = micros();          // Current time
    // timeSinceFrameStart = t - this->lastFrameTime; // Elapsed since data recv'd
    // w                   = (timeSinceFrameStart >= this->timeBetweenFrames) ? 255 :
    //   (255L * timeSinceFrameStart / this->timeBetweenFrames);

    t = micros();
    this->renderer.render();
    this->updates++;

    // Show approximate updates-per-second
    if((seconds = (t / 1000000)) != this->priorSeconds) { // 1 sec elapsed?
      Serial.print("OPC handler: ");
      Serial.print(this->updates);
      Serial.println(" updates/sec");
      Serial.print("OPC handler: ");
      Serial.print(this->commits);
      Serial.println(" frames/sec");
      this->priorSeconds = seconds;
      this->updates      = 0; // Reset counter

      if (this->commits == 0) {
        this->consecutiveSecondsWithoutFrames++;

      } else {
        this->consecutiveSecondsWithoutFrames = 0;
      }
      this->commits      = 0;
    }

    // Process up to 1/2 of pending data on stream.  Rather than waiting
    // for full packets to arrive, this interleaves Stream I/O with LED
    // dithering so the latter doesn't get too 'stuttery.'  It DOES
    // however limit the potential throughput; 256 LEDs seems fine at
    // 60 FPS, but with 512 you may need to limit it to 30 FPS.
    bytesPending = this->client.available();
    if(bytesPending) {  // Any incoming data?
      bytesPending = (bytesPending + 1) / 2; // Handle a fraction of it
      uint8_t *rgbBuf = this->renderer.getRGBBuffer();

      uint16_t maxLength = this->renderer.getLength() * 3;

      do {
        if(this->mode == MODE_DATA) { // Receiving pixel data, most likely case
          // Read size mustn't exceed remaining pixel payload size or pixel
          // buffer size. This avoids some ugly cases like the next pixel
          // header appearing mid-buffer, which would require nasty memmoves
          // and stuff.  We'll read some now and pick up the rest on the
          // next pass through.
          if(bytesPending > this->bytesToRead) bytesPending = this->bytesToRead;
          if(bytesPending > maxLength) bytesPending = maxLength;
          if((a = this->client.read(&rgbBuf[this->bytesRead],
                              bytesPending)) > 0) {
            bytesPending -= a;
            this->bytesToRead  -= a;
            if(this->bytesToRead <= 0) { // End of pixel payload?
              if (this->cmd == CMD_SET_8_BIT) {
                this->renderer.commit();
                this->commits++;
                this->numLEDs       = this->nextNumLEDs;
              } else if (this->cmd == CMD_SYSEX) {
                if (this->dataSize < 2) {
                  Serial.println("Sysex command payload size too small, ignoring...");
                } else {
                  uint16_t sysexCmd = *(uint16_t *)(&rgbBuf);

                  if (sysexCmd == 6) { // Change offline animation color.
                    if (this->dataSize == 5) {
                      uint8_t r = rgbBuf[2], g = rgbBuf[3], b = rgbBuf[4];
                      Serial.print("Setting offline animation color to R");
                      Serial.print(r);
                      Serial.print(" G");
                      Serial.print(g);
                      Serial.print(" B");
                      Serial.println(b);
                    } else {
                      Serial.println("Sysex command 6 requires exactly 5 bytes in payload, ignoring...");
                    }
                  }
                }
              }
              this->bytesRead           = 0; // Reset index
              this->mode = bytesToDiscard ? MODE_DISCARD : MODE_HEADER;
            } else {
              bytesRead += a; // Advance index & keep reading
            }
          } // else no data received
        } else if(this->mode == MODE_HEADER) {         // Receiving header data
          if(bytesPending > 4) bytesPending = 4; // Limit to header size
          if((a = this->client.read(&rgbBuf[this->bytesRead],
                              bytesPending)) > 0) {
            this->bytesRead    += a;
            bytesPending -= a;
            if(bytesPending <= 0) { // Full header received, parse it!
              this->bytesRead = 0;        // Reset read buffer index
              this->dataSize  = (rgbBuf[2] << 8) |
                rgbBuf[3];
              if(this->dataSize > 0) {           // Payload size > 0?
                this->mode = MODE_DISCARD;       // Assume DISCARD until validated,
                this->bytesToDiscard = this->dataSize; // may override below
                if(rgbBuf[0] <= 1) {   // Valid channel?
                  this->cmd = rgbBuf[1];
                  if(this->cmd == CMD_SET_8_BIT || this->cmd == CMD_SYSEX) { // Valid command?
                    // Valid!  Switch to DATA mode, set up counters...
                    this->mode = MODE_DATA;
                    if(this->dataSize <= maxLength) {    // <= MAX_LEDS
                      this->bytesToRead     = this->dataSize;          // Read all,
                      this->bytesToDiscard  = 0;                 // no discard
                    } else {                               // > MAX_LEDS
                      this->bytesToRead     = maxLength; // Read MAX_LEDS,
                      this->bytesToDiscard -= maxLength; // discard rest
                    }
                    this->nextNumLEDs = this->bytesToRead / 3; // Pixel count when done
                  } else {
                    Serial.print("Invalid command ");
                    Serial.print(this->cmd);
                    Serial.print(", discarding ");
                    Serial.print(this->bytesToDiscard);
                    Serial.println(" bytes of data.");
                  } // Endif valid command
                } // endif valid channel
              } // else 0-byte payload; remain in HEADER mode
            } // else full header not yet received; remain in HEADER mode
          } // else no data received
        } else { // MODE_DISCARD
          // Read size mustn't exceed discard size or pixel buffer size
          if(bytesPending>this->bytesToDiscard)    bytesPending=this->bytesToDiscard;
          if(bytesPending>(int)sizeof(this->discardBuf)) bytesPending=sizeof(this->discardBuf);;
          if((a = this->client.read(&this->discardBuf[0], bytesPending)) > 0) { // Poof!
            bytesPending -= a;
            if(bytesPending <= 0) { // End of DISCARD mode,
              this->mode = MODE_HEADER;   // switch back to HEADER mode
            }
          }
        } // end MODE_DISCARD
      } while(bytesPending > 0);
    } // end if client.available()

    return true;
    // DITHER-AND-RECEIVE LOOP ENDS HERE ---------------------------------
  } else { // end ifclient connected
    this->consecutiveSecondsWithoutFrames = 0;
    return false;
  }
}
