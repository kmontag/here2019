#ifndef __OPC_HANDLER_HPP__
#define __OPC_HANDLER_HPP__

#include <Arduino.h>
#include "Renderer.hpp"

namespace featherstream {
  class OPCHandler {
  public:
    OPCHandler(Renderer &);
    virtual ~OPCHandler();

    void loop();
  private:
    Renderer &renderer;
    bool isWhite;
  };
}

#endif