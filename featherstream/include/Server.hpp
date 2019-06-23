#ifndef __SERVER_HPP__
#define __SERVER_HPP__

#include <WiFi101.h>
#include "WiFiHandler.hpp"

namespace featherstream {
  class Server {
  public:
    Server(const WiFiHandler &);
    virtual ~Server();

    void loop();

  private:
    const WiFiHandler &wiFiHandler;
    WiFiServer *server;
  };
}

#endif