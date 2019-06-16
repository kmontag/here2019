#include "OPCHandler.hpp"
#include "Renderer.hpp"

#include <Arduino.h>

using namespace featherstream;

OPCHandler::OPCHandler(Renderer &renderer): renderer(renderer) {
  this->isWhite = false;
}

OPCHandler::~OPCHandler() {
}

void OPCHandler::loop() {
  delay(1000);
  Serial.println("boop");

  this->isWhite = !this->isWhite;

  for (uint16_t i = 0; i < this->renderer.getLength(); i++) {
    if (this->isWhite) {
      this->renderer.setPixel(i, 40, 40, 40);
    } else {
      this->renderer.setPixel(i, 40, 0, 0);
    }
  }

  Serial.println("bop");

  this->renderer.render();

  Serial.println("bleep");
}
