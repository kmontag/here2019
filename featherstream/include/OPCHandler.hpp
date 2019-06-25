#ifndef __OPC_HANDLER_HPP__
#define __OPC_HANDLER_HPP__

#include <Arduino.h>
#include <WiFi101.h>
#include "Renderer.hpp"

namespace featherstream {
  /**
   * Manages a connection to a featherstreamer OPC endpoint.
   */
  class OPCHandler {
  public:
    OPCHandler(Renderer &renderer);
    virtual ~OPCHandler();

    /**
     * Check if we're connected to the correct featherstreamer
     * (i.e. make sure we're not connected to someone else's "master"
     * network directly), and open a connection to the
     * featherstreamer's streaming endpoint. Returns true if both of
     * these steps succeed.
     */
    bool connect(uint8_t channel, const IPAddress &address, uint16_t port);

    bool isConnected();

    /**
     * Process any incoming data, and render it if appropriate. Return
     * false if the connection has dropped, true otherwise.
     */
    bool loop();

    /**
     * Set the OPC channel, from 1 to 255.
     */
    void setChannel(uint8_t);

  private:
    Renderer &renderer;
    WiFiClient client;

    // Getting decent interpolation and dithering REQUIRES frequent calls to
    // the magic() function.  This means we can't sit in a tight loop waiting
    // for an OPC packet to arrive.  Instead, loop() interneaves between the
    // two tasks: handling a single magic() call, then receiving a finite amount
    // of data from the OPC client.  A crude state machine cycles between three
    // states as needed: MODE_HEADER is waiting for a 4-byte OPC header to
    // arrive, MODE_DATA is receiving a pixel data 'payload' (typically only a
    // smaller chunk of this data is read on each pass through loop()), and
    // MODE_DISCARD which flushes unneeded data (either unsupported command
    // packets or excess pixel data beyond what magic() supports) from the
    // client (this also operates on smaller chunks per pass).
    uint8_t mode;

    // bytesToRead is the number of bytes remaining in current mode, while
    // bytesRead is the number read so far (used as an index into a destination
    // buffer).  bytesToDiscard is the number remaining when in MODE_DISCARD.
    int16_t bytesToRead = 0, bytesRead = 0, bytesToDiscard = 0,
      numLEDs, nextNumLEDs;

    // updates and priorSeconds are used for the updates-per-second
    // estimate.
    uint32_t updates = 0;
    uint32_t priorSeconds = 0;

    uint16_t consecutiveSecondsWithoutFrames = 0;

    uint32_t commits = 0;

    uint8_t discardBuf[512 * 3];
  };
}

#endif