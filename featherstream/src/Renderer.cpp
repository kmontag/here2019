#include "Renderer.hpp"

#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_ZeroDMA.h>
#include "utility/dma.h"
#include "wiring_private.h" // pinPeripheral() function

using namespace featherstream;

/**
 * Global stuff copied in from the Adafruit lightship demo.
 */

// Declare second SPI peripheral 'SPI1':
SPIClass SPI1(      // 11/12/13 classic UNO-style SPI
  &sercom1,         // -> Sercom peripheral
  12,               // MISO pin
  13,               // SCK pin
  11,               // MOSI pin
  SPI_PAD_0_SCK_1,  // TX pad (for MOSI, SCK)
  SERCOM_RX_PAD_3); // RX pad (for MISO)

#define MAX_LEDS        512 // Upper limit; OK to receive data for fewer
#define SPI_BUFFER_SIZE (4 + MAX_LEDS * 4 + ((MAX_LEDS / 2) + 7) / 8)
// SPI buffer includes space for DotStar 32-bit '0' header, 32 bits per LED,
// and footer of 1 bit per 2 LEDs (rounded to next byte boundary, for SPI).
// For 512 pixels, that's 2084 bytes per SPI buffer (x2 = 4168 bytes total).

// Two equal-size SPI buffers are allocated; one's being filled with new
// data as the other's being issued via DMA.
uint8_t spiBuffer[2][SPI_BUFFER_SIZE];
uint8_t spiBufferBeingFilled = 0;    // Index of currently-calculating buf
volatile bool spiReady       = true; // True when SPI DMA ready for new data

// Data for most-recently-received OPC color payload, payload before that,
// and new in-progress payload currently arriving.  Also, a 'sink' buffer
// for quickly discarding data.
uint8_t rgbBuf[4][MAX_LEDS * 3]; // 512 LEDs = 6144 bytes.

// These tables (computed at runtime) are used for gamma correction and
// dithering.  RAM used = 256*9+MAX_LEDS*3 bytes.  512 LEDs = 3840 bytes.
uint8_t loR[256], hiR[256], fracR[256], errR[MAX_LEDS],
  loG[256], hiG[256], fracG[256], errG[MAX_LEDS],
  loB[256], hiB[256], fracB[256], errB[MAX_LEDS];

// Order of color bytes as issued to the DotStar LEDs.  Current DotStars use
// BGR order (blue=first, green=second, red=last); pre-2015 DotStars use GBR
// order.  THESE RELATE ONLY TO THE LED STRIP; OPC data is always RGB order.
#define DOTSTAR_BLUEBYTE  0
#define DOTSTAR_GREENBYTE 1
#define DOTSTAR_REDBYTE   2

Adafruit_ZeroDMA myDMA; // For DMA transfers
DmacDescriptor  *desc;  // DMA descriptor address

void dma_callback(Adafruit_ZeroDMA *dma) {
  spiReady = true; // OK to issue next SPI DMA payload now!
}

// Compute gamma/dither tables for one color component.  Pass gamma and max
// brightness level (e.g. 2.7, 255) followed by pointers to 'lo', 'hi' and
// 'frac' tables to fill.  Typically will call this 3 times (R, G, B).
void fillGamma(float g, uint8_t m, uint8_t *lo, uint8_t *hi, uint8_t *frac) {
  uint16_t i, j, n;
  for(i=0; i<256; i++) {
    // Calc 16-bit gamma-corrected level
    n = (uint16_t)(pow((double)i / 255.0, g) * (double)m * 256.0 + 0.5);
    lo[i]   = n >> 8;   // Store as 8-bit brightness level
    frac[i] = n & 0xFF; // and 'dither up' probability (error term)
  }
  // Second pass, calc 'hi' level for each (based on 'lo' value)
  for(i=0; i<256; i++) {
    n = lo[i];
    for(j=i; (j<256) && (lo[j] <= n); j++);
    hi[i] = lo[j];
  }
}

void magic(
  uint8_t *rgbIn1,    // First RGB input buffer being interpolated
  uint8_t *rgbIn2,    // Second RGB input buffer being interpolated
  uint8_t  w2,        // Weighting (0-255) of second buffer in interpolation
  uint8_t *fillBuf,   // SPI data buffer being filled (DotStar-native order)
  uint16_t numLEDs    // Number of LEDs in buffer
) {
  uint8_t   mix;
  uint16_t  weight1, weight2, pixelNum, e;
  uint8_t  *fillPtr = fillBuf + 5; // Skip 4-byte header + 1 byte pixel marker

  weight2 = (uint16_t)w2 + 1; // 1-256
  weight1 = 257 - weight2;    // 1-256

  for(pixelNum = 0; pixelNum < numLEDs; pixelNum++, fillPtr += 4) {
    // Interpolate red from rgbIn1 and rgbIn2 based on weightings
    mix = (*rgbIn1++ * weight1 + *rgbIn2++ * weight2) >> 8;
    // fracR is the fractional portion (0-255) of the 16-bit gamma-
    // corrected value for a given red brightness...essentially it's
    // how far 'off' a given 8-bit brightness value is from its ideal.
    // This error is carried forward to the next frame in the errR
    // buffer...added to the fracR value for the current pixel...
    e = fracR[mix] + errR[pixelNum];
    // ...if this accumulated value exceeds 255, the resulting red
    // value is bumped up to the next brightness level and 256 is
    // subtracted from the error term before storing back in errR.
    // Diffusion dithering is the result.
    fillPtr[DOTSTAR_REDBYTE] = (e < 256) ? loR[mix] : hiR[mix];

    Serial.print("r: ");
    Serial.println(fillPtr[DOTSTAR_REDBYTE]);
    // If e exceeds 256, it *should* be reduced by 256 at this point...
    // but rather than subtract, we just rely on truncation in the 8-bit
    // store operation below to do this implicitly. (e & 0xFF)
    errR[pixelNum] = e;

    // Repeat same operations for green...
    mix = (*rgbIn1++ * weight1 + *rgbIn2++ * weight2) >> 8;
    e   = fracG[mix] + errG[pixelNum];
    fillPtr[DOTSTAR_GREENBYTE] = (e < 256) ? loG[mix] : hiG[mix];
    errG[pixelNum] = e;

    Serial.print("g: ");
    Serial.println(fillPtr[DOTSTAR_GREENBYTE]);

    // ...and blue...
    mix = (*rgbIn1++ * weight1 + *rgbIn2++ * weight2) >> 8;
    e   = fracB[mix] + errB[pixelNum];
    fillPtr[DOTSTAR_BLUEBYTE] = (e < 256) ? loB[mix] : hiB[mix];
    errB[pixelNum] = e;

    Serial.print("b: ");
    Serial.println(fillPtr[DOTSTAR_BLUEBYTE]);
  }

  while(!spiReady); // Wait for prior SPI DMA transfer to complete

  // Modify the DMA descriptor using the newly-filled buffer as source...
  myDMA.changeDescriptor(desc,     // DMA descriptor address
                         fillBuf); // New src only; dst & count don't change

  spiReady = false;
  myDMA.startJob();
}

Renderer::Renderer(uint16_t length) : length(length) {
  // Initialize SPI buffers.  Everything's set to 0xFF initially to cover
  // the per-pixel 0xFF marker and the end-of-data '1' bits, then the first
  // 4 bytes of each buffer are set to 0x00 as start-of-data marker.
  memset(spiBuffer, 0xFF, sizeof(spiBuffer));
  for(uint8_t b=0; b<2; b++) {
    for(uint8_t i=0; i<4; i++) spiBuffer[b][i] = 0x00;
  }

  fillGamma(2.7, 255, loR, hiR, fracR); // Initialize gamma tables to
  fillGamma(2.7, 255, loG, hiG, fracG); // default values (OPC data may
  fillGamma(2.7, 255, loB, hiB, fracB); // override this later).
  // err buffers don't need init, they'll naturally reach equilibrium

  memset(rgbBuf, 0, sizeof(rgbBuf)); // Clear receive buffers

  SPI1.begin();                  // Init second SPI bus
  pinPeripheral(11, PIO_SERCOM); // Enable SERCOM MOSI on this pin
  pinPeripheral(13, PIO_SERCOM); // Ditto, SERCOM SCK
  SPI1.beginTransaction(SPISettings(12000000, MSBFIRST, SPI_MODE0));
  // Long DotStar stips may require reducing the SPI clock; if you see
  // glitching, try setting to 8 MHz above.

  // Configure DMA for SERCOM1 (our 'SPI1' port on 11/12/13)
  myDMA.setTrigger(SERCOM1_DMAC_ID_TX);
  myDMA.setAction(DMA_TRIGGER_ACTON_BEAT);
  myDMA.allocate();
  desc = myDMA.addDescriptor(
    NULL,                             // Source address (not set yet)
    (void *)(&SERCOM1->SPI.DATA.reg), // Dest address
    SPI_BUFFER_SIZE,                  // Data count
    DMA_BEAT_SIZE_BYTE,               // Bytes/halfwords/words
    true,                             // Increment source address
    false);                           // Don't increment dest
  myDMA.setCallback(dma_callback);

  // Turn off LEDs
  magic(rgbBuf[0], rgbBuf[0], 0, spiBuffer[spiBufferBeingFilled], MAX_LEDS);
  spiBufferBeingFilled = 1 - spiBufferBeingFilled;

  this->rgb1 = new uint8_t[length * 3];
  this->rgb2 = new uint8_t[length * 3];
  for (int i = 0; i < length * 3; i++) {
    this->rgb1[i] = this->rgb2[i] = 0;
  }

  this->fillBuf = new uint8_t[SPI_BUFFER_SIZE];

  for (int i = 0; i < SPI_BUFFER_SIZE; i++) {
    this->fillBuf[i] = 0xFF;
  }
  for (int i = 0; i < 4; i++) {
    this->fillBuf[i] = 0x00;
  }
}

Renderer::~Renderer() {
  delete this->rgb1;
  delete this->rgb2;
  delete this->fillBuf;
}

uint16_t Renderer::getLength() const {
  return this->length;
}

void Renderer::setPixel(uint16_t index, uint8_t r, uint8_t g, uint8_t b) {
  this->rgb1[3 * index + 0] = r;
  this->rgb1[3 * index + 1] = g;
  this->rgb1[3 * index + 2] = b;

  this->rgb2[3 * index + 0] = r;
  this->rgb2[3 * index + 1] = g;
  this->rgb2[3 * index + 2] = b;
}

void Renderer::render() {
  Serial.println(this->getLength());
  magic(this->rgb1, this->rgb2, 0, this->fillBuf, this->getLength());
}