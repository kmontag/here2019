#ifndef __RENDERER_HPP__
#define __RENDERER_HPP__

#include <Arduino.h>

namespace featherstream {
  class Renderer {
  public:
    Renderer(uint16_t length);
    virtual ~Renderer();

    uint16_t getLength() const;

    void setPixel(uint16_t index, uint8_t r, uint8_t g, uint8_t b);

    /**
     * Flush pixel data to the relevant pins.
     */
    void render();

  private:
    const uint16_t length;

    uint8_t * rgb1;
    uint8_t * rgb2;
    uint8_t * fillBuf;
  };
}

#endif