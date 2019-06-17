// Enable this #define if using Adafruit ATWINC (e.g. Feather M0 WiFi).
// If using Arduino Zero + WiFi Shield 101, comment it out:
#define ADAFRUIT_ATWINC

#include <Arduino.h>
#include <WiFi101.h>

// Store sensitive data in this file.
#include "secrets.h"

#include "OPCHandler.hpp"
#include "Renderer.hpp"
#include "WiFiHandler.hpp"

int led = LED_BUILTIN;
int status = WL_IDLE_STATUS;

// WiFiServer server(80);

void printWiFiStatus();
void printMacAddress(byte mac[]);
void printMacAddress();
void listNetworks();
void printEncryptionType(int thisType);

featherstream::Renderer *renderer;
featherstream::OPCHandler *opcHandler;
featherstream::WiFiHandler *wiFiHandler;

void setup() {
  //Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  Serial.println("== featherstream ==");

  pinMode(led, OUTPUT);      // set the LED pin mode

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

  renderer = new featherstream::Renderer(80);
  Serial.println("Created renderer");

  opcHandler = new featherstream::OPCHandler(*renderer);
  Serial.println("Created OPC handler");

  wiFiHandler = new featherstream::WiFiHandler();

  renderer->clear();
  renderer->commit();
  renderer->render();
  Serial.println("Turned off LEDs");
}

void loop() {
  if (wiFiHandler->isPaired()) {
    // Standard operative mode, when we're paired with a
    // featherstreamer.
    if (wiFiHandler->ensureConnected()) {

      bool opcConnected = opcHandler->isConnected();

      if (!opcConnected) {
        Serial.println("Establishing connection to OPC server.");
        opcConnected = opcHandler->connect(1, wiFiHandler->getServerAddress(), 44668);
      }

      if (opcConnected) {
        opcConnected = opcHandler->loop();
        if (!opcConnected) {
          Serial.println("Lost connection to OPC server.");
        }
      } else {
        Serial.println("Could not connect to OPC server.");
        delay(1000);
      }
    } else {
      Serial.println("Could not connect to WiFi.");
      delay(1000);
    }
  } else {
    Serial.println("TODO bootstrap mode");
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
