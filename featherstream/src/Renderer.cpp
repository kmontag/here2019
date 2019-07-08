#include "Renderer.hpp"

#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_ZeroDMA.h>
#include "utility/dma.h"
#include "wiring_private.h" // pinPeripheral() function

using namespace featherstream;

#define NUM_RGB_BUFFERS 3
#define NUM_SPI_BUFFERS 2

/**
 * Global stuff copied in from the Adafruit lightship demo.
 */

// Declare second SPI peripheral 'SPI1':
SPIClass SPI1(      // 11/12/13 classic UNO-style SPI
  &sercom1,         // -> Sercom peripheral
  12,               // MISO pin
  13,               // SCK pin
  11,               // MOSI pin
  SPI_PAD_0_SCK_1,  // TX pad (for MOSI, SCK)
  SERCOM_RX_PAD_3); // RX pad (for MISO)

#define MAX_LEDS        512 // Upper limit; OK to receive data for fewer
// SPI buffer includes space for DotStar 32-bit '0' header, 32 bits per LED,
// and footer of 1 bit per 2 LEDs (rounded to next byte boundary, for SPI).
// For 512 pixels, that's 2084 bytes per SPI buffer (x2 = 4168 bytes total).

volatile bool spiReady       = true; // True when SPI DMA ready for new data

// These tables (computed at runtime) are used for gamma correction and
// dithering.  RAM used = 256*9+MAX_LEDS*3 bytes.  512 LEDs = 3840 bytes.
uint8_t loR[256], hiR[256], fracR[256], errR[MAX_LEDS],
  loG[256], hiG[256], fracG[256], errG[MAX_LEDS],
  loB[256], hiB[256], fracB[256], errB[MAX_LEDS];

// Order of color bytes as issued to the DotStar LEDs.  Current DotStars use
// BGR order (blue=first, green=second, red=last); pre-2015 DotStars use GBR
// order.  THESE RELATE ONLY TO THE LED STRIP; OPC data is always RGB order.
#define DOTSTAR_BLUEBYTE  0
#define DOTSTAR_GREENBYTE 1
#define DOTSTAR_REDBYTE   2

Adafruit_ZeroDMA myDMA; // For DMA transfers
DmacDescriptor  *desc;  // DMA descriptor address

void dma_callback(Adafruit_ZeroDMA *dma) {
  spiReady = true; // OK to issue next SPI DMA payload now!
}

// Compute gamma/dither tables for one color component.  Pass gamma and max
// brightness level (e.g. 2.7, 255) followed by pointers to 'lo', 'hi' and
// 'frac' tables to fill.  Typically will call this 3 times (R, G, B).
void fillGamma(float g, uint8_t m, uint8_t *lo, uint8_t *hi, uint8_t *frac) {
  uint16_t i, j, n;
  for(i=0; i<256; i++) {
    // Calc 16-bit gamma-corrected level
    n = (uint16_t)(pow((double)i / 255.0, g) * (double)m * 256.0 + 0.5);
    lo[i]   = n >> 8;   // Store as 8-bit brightness level
    frac[i] = n & 0xFF; // and 'dither up' probability (error term)
  }
  // Second pass, calc 'hi' level for each (based on 'lo' value)
  for(i=0; i<256; i++) {
    n = lo[i];
    for(j=i; (j<256) && (lo[j] <= n); j++);
    hi[i] = lo[j];
  }
}

void magic(
  uint8_t *rgbIn1,    // First RGB input buffer being interpolated
  uint8_t *rgbIn2,    // Second RGB input buffer being interpolated
  uint8_t  w2,        // Weighting (0-255) of second buffer in interpolation
  uint8_t *fillBuf,   // SPI data buffer being filled (DotStar-native order)
  uint16_t numLEDs    // Number of LEDs in buffer
) {
  uint8_t   mix;
  uint16_t  weight1, weight2, pixelNum, e;
  uint8_t  *fillPtr = fillBuf + 5; // Skip 4-byte header + 1 byte pixel marker

  weight2 = (uint16_t)w2 + 1; // 1-256
  weight1 = 257 - weight2;    // 1-256

  for(pixelNum = 0; pixelNum < numLEDs; pixelNum++, fillPtr += 4) {
    // Interpolate red from rgbIn1 and rgbIn2 based on weightings
    mix = (*rgbIn1++ * weight1 + *rgbIn2++ * weight2) >> 8;
    // fracR is the fractional portion (0-255) of the 16-bit gamma-
    // corrected value for a given red brightness...essentially it's
    // how far 'off' a given 8-bit brightness value is from its ideal.
    // This error is carried forward to the next frame in the errR
    // buffer...added to the fracR value for the current pixel...
    e = fracR[mix] + errR[pixelNum];
    // ...if this accumulated value exceeds 255, the resulting red
    // value is bumped up to the next brightness level and 256 is
    // subtracted from the error term before storing back in errR.
    // Diffusion dithering is the result.
    fillPtr[DOTSTAR_REDBYTE] = (e < 256) ? loR[mix] : hiR[mix];
    // If e exceeds 256, it *should* be reduced by 256 at this point...
    // but rather than subtract, we just rely on truncation in the 8-bit
    // store operation below to do this implicitly. (e & 0xFF)
    errR[pixelNum] = e;

    // Repeat same operations for green...
    mix = (*rgbIn1++ * weight1 + *rgbIn2++ * weight2) >> 8;
    e   = fracG[mix] + errG[pixelNum];
    fillPtr[DOTSTAR_GREENBYTE] = (e < 256) ? loG[mix] : hiG[mix];
    errG[pixelNum] = e;

    // ...and blue...
    mix = (*rgbIn1++ * weight1 + *rgbIn2++ * weight2) >> 8;
    e   = fracB[mix] + errB[pixelNum];
    fillPtr[DOTSTAR_BLUEBYTE] = (e < 256) ? loB[mix] : hiB[mix];
    errB[pixelNum] = e;
  }

  while(!spiReady); // Wait for prior SPI DMA transfer to complete

  // Modify the DMA descriptor using the newly-filled buffer as source...
  myDMA.changeDescriptor(desc,     // DMA descriptor address
                         fillBuf); // New src only; dst & count don't change

  spiReady = false;
  myDMA.startJob();
}

Renderer::Renderer() {
  // SPI buffer includes space for DotStar 32-bit '0' header, 32 bits per LED,
  // and footer of 1 bit per 2 LEDs (rounded to next byte boundary, for SPI).
  // For 512 pixels, that's 2084 bytes per SPI buffer (x2 = 4168 bytes total).
  uint16_t spiBufferLength = 4 + MAX_LEDS * 4 + ((MAX_LEDS / 2) + 7) / 8;

  fillGamma(2.7, 255, loR, hiR, fracR); // Initialize gamma tables to
  fillGamma(2.7, 255, loG, hiG, fracG); // default values (OPC data may
  fillGamma(2.7, 255, loB, hiB, fracB); // override this later).
  // err buffers don't need init, they'll naturally reach equilibrium

  SPI1.begin();                  // Init second SPI bus
  pinPeripheral(11, PIO_SERCOM); // Enable SERCOM MOSI on this pin
  pinPeripheral(13, PIO_SERCOM); // Ditto, SERCOM SCK
  SPI1.beginTransaction(SPISettings(12000000, MSBFIRST, SPI_MODE0));
  // Long DotStar stips may require reducing the SPI clock; if you see
  // glitching, try setting to 8 MHz above.

  // Configure DMA for SERCOM1 (our 'SPI1' port on 11/12/13)
  myDMA.setTrigger(SERCOM1_DMAC_ID_TX);
  myDMA.setAction(DMA_TRIGGER_ACTON_BEAT);
  myDMA.allocate();
  desc = myDMA.addDescriptor(
    NULL,                             // Source address (not set yet)
    (void *)(&SERCOM1->SPI.DATA.reg), // Dest address
    spiBufferLength,                  // Data count
    DMA_BEAT_SIZE_BYTE,               // Bytes/halfwords/words
    true,                             // Increment source address
    false);                           // Don't increment dest
  myDMA.setCallback(dma_callback);

  this->rgbBuffers = new uint8_t *[NUM_RGB_BUFFERS];
  for (int i = 0; i < NUM_RGB_BUFFERS; i++) {
    this->rgbBuffers[i] = new uint8_t[MAX_LEDS * 3];
    for (int j = 0; j < MAX_LEDS * 3; j++) {
      this->rgbBuffers[i][j] = 0;
    }
  }

  this->spiBuffers = new uint8_t *[NUM_SPI_BUFFERS];
  for (int i = 0; i < NUM_SPI_BUFFERS; i++) {
    this->spiBuffers[i] = new uint8_t[spiBufferLength];

    // Initialize SPI buffers.  Everything's set to 0xFF initially to cover
    // the per-pixel 0xFF marker and the end-of-data '1' bits, then the first
    // 4 bytes of each buffer are set to 0x00 as start-of-data marker.
    for (int j = 0; j < spiBufferLength; j++) {
      this->spiBuffers[i][j] = 0xFF;
    }
    for (int j = 0; j < 4; j++) {
      this->spiBuffers[i][j] = 0x00;
    }
  }
}

Renderer::~Renderer() {
  for (int i = 0; i < NUM_RGB_BUFFERS; i++) {
    delete[] this->rgbBuffers[i];
  }
  delete[] this->rgbBuffers;

  for (int i = 0; i < NUM_SPI_BUFFERS; i++) {
    delete[] this->spiBuffers[i];
  }
  delete[] this->spiBuffers;
}

uint8_t * Renderer::getRGBBuffer() const {
  return this->rgbBuffers[this->currentRGBBufferIndex];
}

void Renderer::setPixel(uint16_t index, uint8_t r, uint8_t g, uint8_t b) {
  uint8_t * const rgb = this->getRGBBuffer();
  rgb[3 * index + 0] = r;
  rgb[3 * index + 1] = g;
  rgb[3 * index + 2] = b;
}

void Renderer::commit() {
  uint32_t t = micros();
  this->timeBetweenFrames = t - this->lastFrameTime;
  this->lastFrameTime = t;

  const uint8_t prevRGBBufferIndex = this->currentRGBBufferIndex;
  this->currentRGBBufferIndex = (this->currentRGBBufferIndex + 1) % NUM_RGB_BUFFERS;

  // Copy all data from the current frame, so if we don't set all
  // pixels on the next frame, the ones that don't get set will
  // maintain their value from this frame.
  memcpy(this->getRGBBuffer(), this->rgbBuffers[prevRGBBufferIndex], MAX_LEDS * 3);

}

void Renderer::render() {
  uint32_t t, timeSinceFrameStart;
  uint8_t w;

  // Interpolation weight (0-255) is the ratio of the time since last
  // frame arrived to the prior two frames' interval.
  t                   = micros();          // Current time
  timeSinceFrameStart = t - this->lastFrameTime; // Elapsed since data recv'd
  w                   = (timeSinceFrameStart >= this->timeBetweenFrames) ? 255 :
    (255L * timeSinceFrameStart / this->timeBetweenFrames);

  uint8_t * const prev =
    this->rgbBuffers[(this->currentRGBBufferIndex + NUM_RGB_BUFFERS - 2) % NUM_RGB_BUFFERS];
  uint8_t * const current =
    this->rgbBuffers[(this->currentRGBBufferIndex + NUM_RGB_BUFFERS - 1) % NUM_RGB_BUFFERS];

  magic(prev, current, w, this->spiBuffers[this->currentSPIBufferIndex], MAX_LEDS);

  this->currentSPIBufferIndex = (this->currentSPIBufferIndex + 1) % NUM_SPI_BUFFERS;
}

void Renderer::clear() {
  memset(this->getRGBBuffer(), 0, MAX_LEDS * 3);
  this->commit();
  this->render();

  // Do this twice to force a full (non-dithered) blackout.
  memset(this->getRGBBuffer(), 0, MAX_LEDS * 3);
  this->commit();
  this->render();
}

uint16_t Renderer::getLength() const {
  return MAX_LEDS;
}