#ifndef __CONFIG_SERVER_HPP__
#define __CONFIG_SERVER_HPP__

#include <WiFi101.h>
#include "WiFiHandler.hpp"

namespace featherstream {
  class ConfigServer {
  public:
    ConfigServer(const WiFiHandler &);
    virtual ~ConfigServer();

    void loop();

  private:
    const WiFiHandler &wiFiHandler;
    WiFiServer *server;
  };
}

#endif