// Enable this #define if using Adafruit ATWINC (e.g. Feather M0 WiFi).
// If using Arduino Zero + WiFi Shield 101, comment it out:
#define ADAFRUIT_ATWINC

#include <Arduino.h>
#include <WiFi101.h>

// Store sensitive data in this file.
#include "secrets.h"

#include "FeatherstreamerManager.hpp"
#include "TwinkleAnimation.hpp"
#include "OPCHandler.hpp"
#include "Renderer.hpp"
#include "WiFiHandler.hpp"

#define LED_PIN A1
#define RANDOM_PIN A2
#define SWITCH_PIN A3

void printWiFiStatus();
void printEncryptionType(int thisType);

void blink(uint32_t identifier, uint32_t onDurationMs, uint32_t periodMs, uint32_t offsetMs);
void pairing();

featherstream::FeatherstreamerManager *featherstreamerManager;
featherstream::Renderer *renderer;
featherstream::OPCHandler *opcHandler;
featherstream::TwinkleAnimation *offlineAnimation;
featherstream::WiFiHandler *wiFiHandler;

int lastSwitchState = -1;

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  // while (!Serial) {
  //   ; // wait for serial port to connect. Needed for native USB port only
  // }

  Serial.println("== featherstream ==");

  pinMode(LED_PIN, OUTPUT);
  pinMode(RANDOM_PIN, INPUT);
  pinMode(SWITCH_PIN, INPUT_PULLUP);

  randomSeed(analogRead(RANDOM_PIN));

#ifdef ADAFRUIT_ATWINC
  WiFi.setPins(8, 7, 4, 2); // Pins for Adafruit ATWINC1500 Feather
#endif

  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue
    while (true);
  }

  featherstreamerManager = new featherstream::FeatherstreamerManager();
  renderer = new featherstream::Renderer();
  opcHandler = new featherstream::OPCHandler(*renderer);
  offlineAnimation = new featherstream::TwinkleAnimation(*renderer);
  wiFiHandler = new featherstream::WiFiHandler(*featherstreamerManager);

  Serial.print("My name is ");
  Serial.println(opcHandler->getDeviceID());

  // If pairing credentials were provided at compile time, add them
  // here on first boot. Note we can still enter pairing mode later
  // to change them.
#ifdef SECRET_PAIRED_SSID
  if (!wiFiHandler->isPaired()) {
    wiFiHandler->setPairedSSID(SECRET_PAIRED_SSID);
  }
#endif

  renderer->clear();
  Serial.println("Turned off LEDs");

  // Check for more than two clicks of the switch in 500ms to force pairing mode.
  uint32_t pairingPossibleUntil = millis() + 500;
  uint32_t numClicks = 0;

  int buttonState = digitalRead(SWITCH_PIN);

  while(millis() < pairingPossibleUntil) {
    int nextButtonState = digitalRead(SWITCH_PIN);
    if (nextButtonState != buttonState) {
      numClicks++;
    }
  }

  if (numClicks >= 2) {
    // This will run forever, so we'll never enter the main loop.
    pairing();
  }

}

void loop() {
  int switchState = digitalRead(SWITCH_PIN);
  if (switchState != lastSwitchState) {
    Serial.print("Entered switch state ");
    Serial.println(switchState);
    renderer->clear();
  }

  if (switchState == HIGH) {
    blink(550932, 100, 3000, 0);
    blink(552411, 100, 3000, 300);
    if (opcHandler->isConnected()) {
      opcHandler->disconnect();
    }
    offlineAnimation->loop();
  } else if (!wiFiHandler->isPaired()) {

    // Enter pairing mode, which runs forever.
    pairing();

  } else {

    // While connected, show a slow blink. While not connected, just
    // always keep the LED on.
    bool opcConnected = opcHandler->isConnected();
    if (opcConnected) {
      blink(552614, 100, 2000, 0);
    } else {
      blink(552415, 100, 100, 0);
    }

    if (wiFiHandler->ensureConnected()) {

      if (!opcConnected) {
        Serial.println("Establishing connection to OPC server.");
        opcConnected = opcHandler->connect(1, wiFiHandler->getServerAddress(), SECRET_SERVER_PORT);
      }

      if (opcConnected) {
        opcConnected = opcHandler->loop();
        if (!opcConnected) {
          renderer->clear();

          Serial.println("Lost connection to OPC server.");
        }
      } else {
        renderer->clear();
        const uint32_t delayMillis = 2000;
        uint32_t delayUntil = millis() + delayMillis;
        while (millis() < delayUntil) {
          for (uint8_t i = 0; i < 3; i++) {
            blink(556473, 100, delayMillis, 200 * i);
          }
          delay(40);
        }

        Serial.println("Could not connect to OPC server.");
      }
    } else {
      renderer->clear();

      Serial.println("Could not connect to WiFi.");

      const uint32_t delayMillis = 3000;
      uint32_t delayUntil = millis() + delayMillis;
      while (millis() < delayUntil) {
        for (uint8_t i = 0; i < 5; i++) {
          blink(551231, 100, delayMillis, 200 * i);
        }
      }
    }
  }

  lastSwitchState = switchState;
}

/**
 * Connect to the pairing network, try to pull credentials from the
 * featherstreamer server, and serve HTTP requests forever, presenting
 * a minimal UI to change device config.
 */
void pairing() {
  Serial.println("Entered pairing mode");

  // Connect to WiFi
  bool isLit = false;
  while (WiFi.begin(SECRET_PAIRING_SSID, SECRET_PAIRING_PASSPHRASE) != WL_CONNECTED) {
    Serial.print("Trying to connect to SSID ");
    Serial.println(SECRET_PAIRING_SSID);

    isLit = !isLit;
    digitalWrite(LED_PIN, isLit ? HIGH : LOW);

    delay(1000);
  }

  // Try to pull network credentials from the featherstreamer we're connected to.
  const String ssid = featherstreamerManager->getReportedSSID(SECRET_PAIRING_SERVER_IP, SECRET_SERVER_PORT);
  // const char *passphrase = featherstreamerManager->getReportedPassphrase(SECRET_PAIRING_SERVER_IP, SECRET_SERVER_PORT);

  if (ssid.length() > 0) { // && passphrase != NULL) {
    wiFiHandler->setPairedSSID(ssid.c_str());
    Serial.print("Pulled SSID from featherstreamer server: ");
    Serial.println(ssid);

    // Fast blink indicates success.
    while (true) {
      blink(551231, 100, 300, 0);
    }
  } else {
    // Slower blink indicates error.
    while(true) {
      blink(554244, 100, 1000, 0);
    }
  }
}

/**
 * Call this repeatedly to blink the notification LED. Pass a unique
 * consistent identifier (can be anything except 0) for each blink in
 * a series to prevent blinks from stomping on each other.
 */
uint32_t activeBlink = 0;
void blink(uint32_t identifier, uint32_t onDurationMs, uint32_t periodMs, uint32_t offsetMs) {
  uint32_t positionMs = (millis() + offsetMs) % periodMs;
  if (positionMs < onDurationMs) {
    if (activeBlink != identifier) {
      digitalWrite(LED_PIN, HIGH);
      activeBlink = identifier;
    }
  } else {
    if (activeBlink == identifier) {
      digitalWrite(LED_PIN, LOW);
      activeBlink = 0;
    }
  }
}

void printWiFiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  // print where to go in a browser:
  Serial.print("To see this page in action, open a browser to http://");
  Serial.println(ip);

}

void printEncryptionType(int thisType) {
  // read the encryption type and print out the name:
  switch (thisType) {
  case ENC_TYPE_WEP:
    Serial.println("WEP");
    break;
  case ENC_TYPE_TKIP:
    Serial.println("WPA");
    break;
  case ENC_TYPE_CCMP:
    Serial.println("WPA2");
    break;
  case ENC_TYPE_NONE:
    Serial.println("None");
    break;
  case ENC_TYPE_AUTO:
    Serial.println("Auto");
    break;
  }
}
