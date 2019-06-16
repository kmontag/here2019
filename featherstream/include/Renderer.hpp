#ifndef __RENDERER_HPP__
#define __RENDERER_HPP__

#include <Arduino.h>

namespace featherstream {
  class Renderer {
  public:
    Renderer(uint16_t length);
    virtual ~Renderer();

    uint16_t getLength() const;

    /**
     * Get the raw current pixel data buffer. `setPixel` works by
     * filling this buffer behind the scenes, but it's exposed here so
     * it can be filled more efficiently if appropriate (e.g. via OPC
     * data read over the wire). This buffer is in "OPC format",
     * i.e. each group of three elements represents RGB for a pixel.
     *
     * This value gets updated after every call to `render`, and the
     * array should not be modified after such a call.
     */
    uint8_t * getRGBBuffer() const;

    /**
     * Convenience method to set a pixel value directly, rather than
     * having to deal with the current RGB buffer.
     */
    void setPixel(uint16_t index, uint8_t r, uint8_t g, uint8_t b);

    /**
     * Flush pixel data to the relevant pins.
     */
    void render();

  private:
    const uint16_t length;

    /**
     * Two buffers for SPI data, rotated at each `render` call.
     */
    uint8_t ** spiBuffers;
    uint8_t currentSPIBufferIndex = 0;

    /**
     * Get the current SPI buffer to fill.
     */
    uint8_t * getSPIBuffer() const;

    /**
     * Previously-displayed buffer, currently-displaying buffer, and
     * currently-filling buffer. We keep the first two around so we
     * can interpolate between them in `render` calls while the
     * current buffer is being filled.
     */
    uint8_t ** rgbBuffers;

    /**
     * After each `render` call, rotate the roles of the RGB buffers
     * using this index.
     */
    uint8_t currentRGBBufferIndex = 0;

    uint8_t * fillBuf;
  };
}

#endif