#pragma once

#include <WiFi101.h>

namespace featherstream {
  /**
   * Manages communication with the upstream featherstreamer server,
   * outside of the generic OPC handling.
   */
  class FeatherstreamerManager {
  public:
    FeatherstreamerManager();
    virtual ~FeatherstreamerManager();
    /**
     * Make a request to the featherstreamer server, and return its
     * reported credentials, or the empty string if the request does
     * not succeed.
     */
    String getReportedSSID(const IPAddress &, uint16_t port) const;
    // const char *getReportedPassphrase(const IPAddress &, uint16_t port) const;
  };
}
