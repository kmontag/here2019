#pragma once

#include <Arduino.h>

namespace featherstream {
  class Renderer {
  public:
    Renderer();
    virtual ~Renderer();

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

    uint16_t getLength() const;

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
    void render();

    /**
     * Convenience method to commit and render a blank frame.
     */
    void clear();

  private:
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

    // For interpolation: lastFrameTime is the absolute time (in microseconds)
    // when the most recent OPC pixel data packet was fully read.
    // timeBetweenFrames is the interval (also in cycles) between lastFrameTime
    // and the frame before that.
    uint32_t lastFrameTime = 0;
    uint32_t timeBetweenFrames = 0;

  };
}
