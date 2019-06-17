#ifndef __WI_FI_HANDLER_HPP__
#define __WI_FI_HANDLER_HPP__

#define WRAPPER_MAGIC "guardrail"
#define SSID_MAX_LENGTH 256

#include <Arduino.h>
#include <WiFi101.h>

namespace featherstream {
  /**
   * Tries to establish a connection with our paired pi,
   */
  class WiFiHandler {
  public:
    WiFiHandler();
    virtual ~WiFiHandler();

    /**
     * Whether we have a WiFi SSID stored in memory to try and connect
     * to.
     */
    bool isPaired() const;

    /**
     * Try to establish a connection to our paired featherstreamer
     * controller - either via its personal AP, or via the master
     * AP. Return whether the connection was successful.
     */
    bool ensureConnected();

    IPAddress getServerAddress() const;

    /**
     * Set the default SSID and save it to permanent storage. Don't
     * call this too often - see
     * https://github.com/cmaglie/FlashStorage#limited-number-of-writes.
     * Return whether the set operation was successful.
     */
    bool setPairedSSID(const char *);

    const char * getPairedSSID() const;

    /**
     * Struct for FlashStorage.
     */
    typedef struct {
      char ssid[SSID_MAX_LENGTH];
      char magic[sizeof(WRAPPER_MAGIC)];
    } ssid_wrapper_t;


  protected:
    const char * getMasterSSID() const;
    const char * getPairedPassphrase() const;
    const char * getMasterPassphrase() const;

  private:
    bool isLoaded;
    ssid_wrapper_t ssidWrapper;

    int32_t lastVerifiedAt;

    bool connect(const char *ssid, const char *passphrase);

    bool isLastConnectionToMaster;
  };
}

#endif