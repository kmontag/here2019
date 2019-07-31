#pragma once

#include <Arduino.h>
#include "Renderer.hpp"

#define __TWINKLE_ANIMATION_NUM_COLORS 3

namespace featherstream {
  class TwinkleAnimation {
  public:
    TwinkleAnimation(Renderer &);
    virtual ~TwinkleAnimation();

    void loop();

    /**
     * Persistently set the main colors of the animation. Index must
     * be within [0, NUM_COLORS).
     */
    void setColor(uint8_t index, uint8_t r, uint8_t g, uint8_t b);

    struct settings_t {
      // Arrays of R, G, B
      uint8_t colors[__TWINKLE_ANIMATION_NUM_COLORS][3];
      uint16_t magic;
    };

  private:
    struct twinkleStatus {
      uint16_t brightness;
      bool isIncreasing;
      bool isActive;

      uint8_t r;
      uint8_t g;
      uint8_t b;
    };
    twinkleStatus *twinkleStatuses;

    Renderer &renderer;

    static const uint8_t NUM_COLORS = __TWINKLE_ANIMATION_NUM_COLORS;

    static const uint16_t FRAMES_BETWEEN_TWINKLES = 200;

    static const uint16_t BRIGHTNESS_DELTA_PER_FRAME = 3;
    static const uint16_t MAX_BRIGHTNESS = 255;
    static const uint16_t MIN_BRIGHTNESS = 50;

    static const uint16_t FRAME_LENGTH_MS = 9;

    settings_t settings;
    static const uint16_t EXPECTED_MAGIC = 5250;

  };
}