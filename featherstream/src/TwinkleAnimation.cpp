#include "TwinkleAnimation.hpp"

#include <FlashStorage.h>

using namespace featherstream;

FlashStorage(settings_storage, TwinkleAnimation::settings_t);

TwinkleAnimation::TwinkleAnimation(Renderer &renderer) : renderer(renderer) {
  this->settings = settings_storage.read();

  // Default to white.
  if (this->settings.magic != EXPECTED_MAGIC) {
    this->settings.r = this->settings.g = this->settings.b = 255;
  }

  this->twinkleStatuses = new twinkleStatus[renderer.getLength()];
  for (uint16_t i = 0; i < renderer.getLength(); i++) {
    this->twinkleStatuses[i].brightness = 0;
    this->twinkleStatuses[i].isIncreasing = true;
    this->twinkleStatuses[i].isActive = false;
  }
}

TwinkleAnimation::~TwinkleAnimation() {
  delete[] this->twinkleStatuses;
}

void TwinkleAnimation::loop() {
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

void TwinkleAnimation::setColor(uint8_t r, uint8_t g, uint8_t b) {
  this->settings.r = r;
  this->settings.g = g;
  this->settings.b = b;
  this->settings.magic = EXPECTED_MAGIC;

  settings_storage.write(this->settings);
}