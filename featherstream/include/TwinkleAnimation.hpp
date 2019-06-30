#pragma once

#include <Arduino.h>
#include "Renderer.hpp"

namespace featherstream {
  class TwinkleAnimation {
  public:
    TwinkleAnimation(Renderer &);
    virtual ~TwinkleAnimation();

    void loop();

    /**
     * Persistently set the main color of the animation.
     */
    void setColor(uint8_t r, uint8_t g, uint8_t b);

    struct settings_t {
      uint8_t r, g, b;
      uint16_t magic;
    };

  private:
    struct twinkleStatus {
      uint16_t brightness;
      bool isIncreasing;
      bool isActive;
    };
    twinkleStatus *twinkleStatuses;

    Renderer &renderer;

    static const uint16_t FRAMES_BETWEEN_TWINKLES = 200;

    // To avoid float math, we move brightness up and down by an
    // integral amount, then divide it by BRIGHTNESS_MULTIPLIER before
    // rendering.
    static const uint16_t BRIGHTNESS_DELTA_PER_FRAME = 3;
    static const uint16_t BRIGHTNESS_MULTIPLIER = 5;
    static const uint16_t MAX_BRIGHTNESS = 250;
    static const uint16_t MIN_BRIGHTNESS = 50;

    static const uint16_t LOOP_DELAY = 32;

    settings_t settings;
    static const uint16_t EXPECTED_MAGIC = 5250;

  };
}