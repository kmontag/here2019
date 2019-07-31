#include "TwinkleAnimation.hpp"

#include <FlashStorage.h>

using namespace featherstream;

FlashStorage(settings_storage, TwinkleAnimation::settings_t);

TwinkleAnimation::TwinkleAnimation(Renderer &renderer) : renderer(renderer) {
  this->settings = settings_storage.read();

  // Default to white for all colors.
  if (this->settings.magic != EXPECTED_MAGIC) {
    for (uint8_t i = 0; i < NUM_COLORS; i++) {
      for (uint8_t rgb = 0; rgb < 3; rgb++) {
        this->settings.colors[i][rgb] = 50;
      }
    }
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
  uint32_t initMillis = millis();
  for (uint16_t i = 0; i < this->renderer.getLength(); i++) {
    // Randomly turn on twinkles.
    if (!this->twinkleStatuses[i].isActive && random(FRAMES_BETWEEN_TWINKLES) == 0) {
      this->twinkleStatuses[i].isActive = true;
      this->twinkleStatuses[i].isIncreasing = true;
      this->twinkleStatuses[i].brightness = MIN_BRIGHTNESS;

      uint8_t colorIndex = (uint8_t)random(NUM_COLORS);
      this->twinkleStatuses[i].r = this->settings.colors[colorIndex][0];
      this->twinkleStatuses[i].g = this->settings.colors[colorIndex][1];
      this->twinkleStatuses[i].b = this->settings.colors[colorIndex][2];
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
    //uint8_t renderedBrightness = (uint8_t)(this->twinkleStatuses[i].brightness / BRIGHTNESS_MULTIPLIER);
    this->renderer.setPixel(
      i,
      (uint8_t)(this->twinkleStatuses[i].brightness * (uint16_t)this->twinkleStatuses[i].r / 255),
      (uint8_t)(this->twinkleStatuses[i].brightness * (uint16_t)this->twinkleStatuses[i].g / 255),
      (uint8_t)(this->twinkleStatuses[i].brightness * (uint16_t)this->twinkleStatuses[i].b / 255)
    );
  }
  this->renderer.commit();
  this->renderer.render();

  uint32_t finalMillis = millis();
  if (finalMillis - initMillis < FRAME_LENGTH_MS) {
    delay(FRAME_LENGTH_MS - (finalMillis - initMillis));
  }
}

void TwinkleAnimation::setColor(uint8_t index, uint8_t r, uint8_t g, uint8_t b) {
  if (index >= NUM_COLORS) {
    Serial.print("Color index ");
    Serial.print(index);
    Serial.print(" is not supported, ignoring.");
  } else {
    this->settings.colors[index][0] = r;
    this->settings.colors[index][1] = g;
    this->settings.colors[index][2] = b;
    this->settings.magic = EXPECTED_MAGIC;
  }

  settings_storage.write(this->settings);
}