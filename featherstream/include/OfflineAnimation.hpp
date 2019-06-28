#pragma once

#include <Arduino.h>
#include "Renderer.hpp"

namespace featherstream {
  class OfflineAnimation {
  public:
    OfflineAnimation(Renderer &);
    virtual ~OfflineAnimation();

    void loop();

  private:
    struct twinkleStatus {
      uint16_t brightness;
      bool isIncreasing;
      bool isActive;
    };
    twinkleStatus *twinkleStatuses;

    Renderer &renderer;

    static const uint16_t FRAMES_BETWEEN_TWINKLES = 200;
    static const uint16_t BRIGHTNESS_DELTA_PER_FRAME = 3;
    static const uint16_t BRIGHTNESS_MULTIPLIER = 5;
    static const uint16_t MAX_BRIGHTNESS = 250;
    static const uint16_t MIN_BRIGHTNESS = 50;

    static const uint16_t LOOP_DELAY = 32;

  };
}