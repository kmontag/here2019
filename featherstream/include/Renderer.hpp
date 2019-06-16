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
     * Modifications to this array will have no effect until `commit`
     * is called, enabling `render` to be invoked "asynchronously"
     * (and dithering/smoothing applied) while an RGB buffer is being
     * filled.
     *
     * This value gets updated after every call to `commit`, and the
     * array should not be modified after such a call.
     */
    uint8_t * getRGBBuffer() const;

    /**
     * Convenience method to set a pixel value directly, rather than
     * having to deal with the current RGB buffer.
     *
     * Note that like direct modifications to the RGB buffer, this
     * method will have no visible effect until `commit` is called.
     */
    void setPixel(uint16_t index, uint8_t r, uint8_t g, uint8_t b);

    /**
     * Commit the current RGB buffer as a finished frame, which will
     * be displayed on the next call to `render`.
     */
    void commit();

    /**
     * Flush committed pixel data to the relevant pins, applying
     * dithering based on the current rate at which `commit` is being
     * called.
     */
    void render(uint8_t);

  private:
    const uint16_t length;

    /**
     * Two buffers for SPI data, rotated at each `render` call.
     */
    uint8_t ** spiBuffers;
    uint8_t currentSPIBufferIndex = 0;

    /**
     * Previously-displayed buffer, currently-displaying buffer, and
     * currently-filling buffer. We keep the first two around so we
     * can interpolate between them in `render` calls while the
     * current buffer is being filled.
     */
    uint8_t ** rgbBuffers;

    /**
     * After each `commit` call, rotate the roles of the RGB buffers
     * using this index.
     */
    uint8_t currentRGBBufferIndex = 0;
  };
}

#endif