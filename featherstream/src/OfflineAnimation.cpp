#include "OfflineAnimation.hpp"

using namespace featherstream;

OfflineAnimation::OfflineAnimation(Renderer &renderer) : renderer(renderer) {
  this->twinkleStatuses = new twinkleStatus[renderer.getLength()];
  for (uint16_t i = 0; i < renderer.getLength(); i++) {
    this->twinkleStatuses[i].brightness = 0;
    this->twinkleStatuses[i].isIncreasing = true;
    this->twinkleStatuses[i].isActive = false;
  }
}

OfflineAnimation::~OfflineAnimation() {
  delete[] this->twinkleStatuses;
}

void OfflineAnimation::loop() {
  for (uint16_t i = 0; i < this->renderer.getLength(); i++) {
    // Randomly turn on twinkles.
    if (!this->twinkleStatuses[i].isActive && random(FRAMES_BETWEEN_TWINKLES) == 0) {
      this->twinkleStatuses[i].isActive = true;
      this->twinkleStatuses[i].isIncreasing = true;
      this->twinkleStatuses[i].brightness = MIN_BRIGHTNESS;
    }

    if (this->twinkleStatuses[i].isActive) {
      if (this->twinkleStatuses[i].isIncreasing) {
        this->twinkleStatuses[i].brightness += BRIGHTNESS_DELTA_PER_FRAME;
        if (this->twinkleStatuses[i].brightness >= MAX_BRIGHTNESS) {
          this->twinkleStatuses[i].brightness = MAX_BRIGHTNESS;
          this->twinkleStatuses[i].isIncreasing = false;
        }
      } else {
        this->twinkleStatuses[i].brightness -= min(this->twinkleStatuses[i].brightness, BRIGHTNESS_DELTA_PER_FRAME);
        if (this->twinkleStatuses[i].brightness == 0) {
          this->twinkleStatuses[i].isIncreasing = true;
          this->twinkleStatuses[i].isActive = false;
        }
      }
    }
    uint8_t renderedBrightness = (uint8_t)(this->twinkleStatuses[i].brightness / BRIGHTNESS_MULTIPLIER);
    this->renderer.setPixel(i, renderedBrightness, renderedBrightness, renderedBrightness);
  }
  this->renderer.commit();
  delay(LOOP_DELAY);
}