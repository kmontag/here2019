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
#include "Server.hpp"
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
featherstream::Server *server;
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

  server = new featherstream::Server(*featherstreamerManager, *wiFiHandler);

  // If pairing credentials were provided at compile time, add them
  // here on first boot. Note we can still enter bootstrap mode later
  // to change them.
  #ifdef SECRET_PAIRED_SSID
  if (!wiFiHandler->isPaired()) {
    const char *passphrase = SECRET_PAIRED_PASSPHRASE;
    wiFiHandler->setPairedCredentials(SECRET_PAIRED_SSID, passphrase);
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

// void oldloop() {
//   // compare the previous status to the current status
//   if (status != WiFi.status()) {
//     // it has changed update the variable
//     status = WiFi.status();

//     if (status == WL_AP_CONNECTED) {
//       byte remoteMac[6];

//       // a device has connected to the AP
//       Serial.print("Device connected to AP, MAC address: ");
//       WiFi.APClientMacAddress(remoteMac);
//       printMacAddress(remoteMac);
//     } else {
//       // a device has disconnected from the AP, and we are back in listening mode
//       Serial.println("Device disconnected from AP");
//     }
//   }

//   WiFiClient client = server.available();   // listen for incoming clients

//   if (client) {                             // if you get a client,
//     Serial.println("new client");           // print a message out the serial port
//     String currentLine = "";                // make a String to hold incoming data from the client
//     while (client.connected()) {            // loop while the client's connected
//       if (client.available()) {             // if there's bytes to read from the client,
//         char c = client.read();             // read a byte, then
//         Serial.write(c);                    // print it out the serial monitor
//         if (c == '\n') {                    // if the byte is a newline character

//           // if the current line is blank, you got two newline characters in a row.
//           // that's the end of the client HTTP request, so send a response:
//           if (currentLine.length() == 0) {
//             // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
//             // and a content-type so the client knows what's coming, then a blank line:
//             client.println("HTTP/1.1 200 OK");
//             client.println("Content-type:text/html");
//             client.println();

//             // the content of the HTTP response follows the header:
//             client.print("Click <a href=\"/H\">here</a> turn the LED on<br>");
//             client.print("Click <a href=\"/L\">here</a> turn the LED off<br>");

//             // The HTTP response ends with another blank line:
//             client.println();
//             // break out of the while loop:
//             break;
//           }
//           else {      // if you got a newline, then clear currentLine:
//             currentLine = "";
//           }
//         }
//         else if (c != '\r') {    // if you got anything else but a carriage return character,
//           currentLine += c;      // add it to the end of the currentLine
//         }

//         // Check to see if the client request was "GET /H" or "GET /L":
//         if (currentLine.endsWith("GET /H")) {
//           digitalWrite(led, HIGH);               // GET /H turns the LED on
//         }
//         if (currentLine.endsWith("GET /L")) {
//           digitalWrite(led, LOW);                // GET /L turns the LED off
//         }
//       }
//     }
//     // close the connection:
//     client.stop();
//     Serial.println("client disconnected");
//   }
// }

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

  // If we don't already have network credentials, try to pull them
  // from the featherstreamer we're connected to.
  if (!wiFiHandler.isPaired()) {
    const char *ssid = featherstreamerManager->getReportedSSID(SECRET_BOOTSTRAP_SERVER_IP, SECRET_SERVER_PORT);
    const char *passphrase = featherstreamerManager->getReportedPassphrase(SECRET_BOOTSTRAP_SERVER_IP, SECRET_SERVER_PORT);

    if (ssid != NULL && passphrase != NULL) {
      wiFiManager->setCredentials(ssid, passphrase);
      Serial.println("Set credentials pulled from featherstreamer server");
    }
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
