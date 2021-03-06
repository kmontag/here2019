#pragma once

#define SSID_MAX_LENGTH 256
#define PASSPHRASE_MAX_LENGTH 256

#include <Arduino.h>
#include <WiFi101.h>

#include "FeatherstreamerManager.hpp"

namespace featherstream {
  /**
   * Tries to establish a connection with our paired pi,
   */
  class WiFiHandler {
  public:
    WiFiHandler(const FeatherstreamerManager &);
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
     * Set the default credentials and save them to permanent
     * storage. Don't call this too often - see
     * https://github.com/cmaglie/FlashStorage#limited-number-of-writes.
     * Return whether the set operation was successful.
     */
    bool setPairedSSID(const char *ssid);

    /**
     * Struct for FlashStorage.
     */
    struct credentials_t {
      char ssid[SSID_MAX_LENGTH];
      char passphrase[PASSPHRASE_MAX_LENGTH];

      // Use this to check whether the object is valid.
      uint16_t magic;
    };

    const char * getPairedSSID() const;
    const char * getMasterSSID() const;
    const char * getPairedPassphrase() const;
    const char * getMasterPassphrase() const;

  private:
    // Whether the credentials wrapper actually contains valid info.
    bool hasCredentials;
    credentials_t credentials;

    int32_t lastVerifiedAt;

    bool connect(const char *ssid, const char *passphrase);

    bool isLastConnectionToMaster;

    const FeatherstreamerManager &featherstreamerManager;

    static const uint16_t EXPECTED_MAGIC = 4255;
  };
}
