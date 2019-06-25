#include "FeatherstreamerManager.hpp"

#include <WiFi101.h>

using namespace featherstream;

FeatherstreamerManager::FeatherstreamerManager() {
}

FeatherstreamerManager::~FeatherstreamerManager() {
}


const char *FeatherstreamerManager::getReportedSSID(const IPAddress &address, uint16_t port) const {
  WiFiClient client;
  String response = "";

  Serial.println("Fetching SSID...");

  if (client.connect(address, port)) {
    client.println("GET /ssid HTTP/1.0");
    client.println();

    const char *result = NULL;
    String currentLine = "";                // make a String to hold incoming data from the client

    while (client.connected() && result == NULL) {
      if (client.available()) {
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        if (c == '\n') {                    // if the byte is a newline character

          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // TODO
            break;
          }
          else {      // if you got a newline, then clear currentLine:
            currentLine = "";
          }
        }
        else if (c != '\r') {    // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
    }
    client.stop();

    return result;

  } else {
    Serial.println("Could not connect to featherstreamer");
    return NULL;
  }
}

// const char *FeatherstreamerManager::getReportedPassphrase(const IPAddress &server, uint16_t port) const {
// }