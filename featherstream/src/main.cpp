// Enable this #define if using Adafruit ATWINC (e.g. Feather M0 WiFi).
// If using Arduino Zero + WiFi Shield 101, comment it out:
#define ADAFRUIT_ATWINC

#include <Arduino.h>
#include <WiFi101.h>

// Store sensitive data in this file.
#include "secrets.h"

#include "FeatherstreamerManager.hpp"
#include "OPCHandler.hpp"
#include "Renderer.hpp"
#include "ConfigServer.hpp"
#include "WiFiHandler.hpp"

#define LED_PIN A1
#define RANDOM_PIN A2
#define SWITCH_PIN A3

// WiFiServer server(80);

void printWiFiStatus();
void printMacAddress(byte mac[]);
void printMacAddress();
void listNetworks();
void printEncryptionType(int thisType);

void blink(uint32_t onDurationMs, uint32_t periodMs, uint32_t offsetMs);
void bootstrap();

featherstream::FeatherstreamerManager *featherstreamerManager;
featherstream::Renderer *renderer;
featherstream::ConfigServer *server;
featherstream::OPCHandler *opcHandler;
featherstream::WiFiHandler *wiFiHandler;

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

  // Print WiFi MAC address:
  printMacAddress();

  // // scan for existing networks:
  // Serial.println("Scanning available networks...");
  // listNetworks();

  featherstreamerManager = new featherstream::FeatherstreamerManager();

  renderer = new featherstream::Renderer();
  // Serial.println("Created renderer");

  opcHandler = new featherstream::OPCHandler(*renderer);
  // Serial.println("Created OPC handler");

  wiFiHandler = new featherstream::WiFiHandler();

  server = new featherstream::ConfigServer(*wiFiHandler);

  // If pairing credentials were provided at compile time, add them
  // here on first boot. Note we can still enter bootstrap mode later
  // to change them.
  #ifdef SECRET_PAIRED_SSID
  if (!wiFiHandler->isPaired()) {
    wiFiHandler->setPairedSSID(SECRET_PAIRED_SSID);
  }
  #endif

  renderer->clear();
  Serial.println("Turned off LEDs");

  // Check if we should enter bootstrap mode.
  bool isBootstrapModeActive = false;
  if (!wiFiHandler->isPaired()) {
    isBootstrapModeActive = true;
  } else {
    // Check for more than two clicks of the switch in 500ms.
    uint32_t bootstrapPossibleUntil = millis() + 500;
    uint32_t numClicks = 0;

    int buttonState = digitalRead(SWITCH_PIN);

    while(millis() < bootstrapPossibleUntil) {
      int nextButtonState = digitalRead(SWITCH_PIN);
      if (nextButtonState != buttonState) {
        numClicks++;
      }
    }

    if (numClicks >= 2) {
      isBootstrapModeActive = true;
    }
  }

  if (isBootstrapModeActive) {
    // This will run forever, so we'll never enter the main loop.
    bootstrap();
  }
}

void loop() {
  // Handle any incoming requests.
  server->loop();

  if (wiFiHandler->ensureConnected()) {

    bool opcConnected = opcHandler->isConnected();

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

      Serial.println("Could not connect to OPC server.");
      delay(1000);
    }
  } else {
    renderer->clear();

    Serial.println("Could not connect to WiFi.");
    delay(1000);
  }
}

/**
 * Connect to the bootstrap network, try to pull credentials from the
 * featherstreamer server, and serve HTTP requests forever, presenting
 * a minimal UI to change device config.
 */
void bootstrap() {
  Serial.println("Entered bootstrap mode");

  // Connect to WiFi
  bool isLit = false;
  while (WiFi.begin(SECRET_BOOTSTRAP_SSID, SECRET_BOOTSTRAP_PASSPHRASE) != WL_CONNECTED) {
    Serial.print("Trying to connect to SSID ");
    Serial.println(SECRET_BOOTSTRAP_SSID);

    isLit = !isLit;
    digitalWrite(LED_PIN, isLit ? HIGH : LOW);

    delay(1000);
  }

  // Try to pull network credentials from the featherstreamer we're connected to.
  const char *ssid = featherstreamerManager->getReportedSSID(SECRET_BOOTSTRAP_SERVER_IP, SECRET_SERVER_PORT);
  // const char *passphrase = featherstreamerManager->getReportedPassphrase(SECRET_BOOTSTRAP_SERVER_IP, SECRET_SERVER_PORT);

  if (ssid != NULL) { // && passphrase != NULL) {
    wiFiHandler->setPairedSSID(ssid);
    Serial.println("Set credentials pulled from featherstreamer server");
  }

  while (true) {
    blink(100, 300, 0);
    server->loop();
  }
}

/**
 * Call this repeatedly to blink the notification LED.
 */
void blink(uint32_t onDurationMs, uint32_t periodMs, uint32_t offsetMs) {
  static bool blinkActive = false;

  if ((millis() + offsetMs) % periodMs < onDurationMs) {
    if (!blinkActive) {
      digitalWrite(LED_PIN, HIGH);
      blinkActive = true;
      // Serial.println("blink");
    }
  } else {
    if (blinkActive) {
      digitalWrite(LED_PIN, LOW);
      blinkActive = false;
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

void printMacAddress() {
  // the MAC address of your WiFi shield
  byte mac[6];

  // print your MAC address:
  WiFi.macAddress(mac);
  Serial.print("MAC: ");
  printMacAddress(mac);
}

void listNetworks() {
  // scan for nearby networks:
  Serial.println("** Scan Networks **");
  int numSsid = WiFi.scanNetworks();
  if (numSsid == -1)
  {
    Serial.println("Couldn't get a wifi connection");
    while (true);
  }

  // print the list of networks seen:
  Serial.print("number of available networks:");
  Serial.println(numSsid);

  // print the network number and name for each network found:
  for (int thisNet = 0; thisNet < numSsid; thisNet++) {
    Serial.print(thisNet);
    Serial.print(") ");
    Serial.print(WiFi.SSID(thisNet));
    Serial.print("\tSignal: ");
    Serial.print(WiFi.RSSI(thisNet));
    Serial.print(" dBm");
    Serial.print("\tEncryption: ");
    printEncryptionType(WiFi.encryptionType(thisNet));
    Serial.flush();
  }
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

void printMacAddress(byte mac[]) {
  for (int i = 5; i >= 0; i--) {
    if (mac[i] < 16) {
      Serial.print("0");
    }
    Serial.print(mac[i], HEX);
    if (i > 0) {
      Serial.print(":");
    }
  }
  Serial.println();
}
