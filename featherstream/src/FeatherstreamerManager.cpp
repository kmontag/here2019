#include "FeatherstreamerManager.hpp"

#include <WiFi101.h>

using namespace featherstream;

FeatherstreamerManager::FeatherstreamerManager() {
}

FeatherstreamerManager::~FeatherstreamerManager() {
}


String FeatherstreamerManager::getReportedSSID(const IPAddress &address, uint16_t port) const {
  WiFiClient client;
  String response = "";
  const String errorResponse = "";

  Serial.println("Fetching SSID...");

  if (client.connect(address, port)) {
    client.println("GET /ssid HTTP/1.0");
    client.println();

    String currentLine = "";                // make a String to hold incoming data from the client
    bool isReceivingContent = false;
    bool isSuccessResponse = false;

    while (client.connected()) {
      if (client.available()) {
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        if (c == '\n' && !isReceivingContent) {      // if the byte is a newline character

          // The first line must be an HTTP success response. Bail
          // immediately otherwise.
          if (!isSuccessResponse) {
            if (currentLine.equals("HTTP/1.1 200 OK")) {
              isSuccessResponse = true;
            } else {
              Serial.print("got non-success response beginning with: ");
              Serial.println(currentLine);
              return errorResponse;
            }
          }

          // From here, we know we have a success response. If the
          // current line is blank, we got two newline characters in a
          // row. That means content is starting.
          if (currentLine.length() == 0) {
            isReceivingContent = true;
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

    if (isReceivingContent) {
      Serial.println();
      return currentLine;
    } else {
      return errorResponse;
    }

  } else {
    Serial.println("Could not connect to featherstreamer");
    return errorResponse;
  }
}

// const char *FeatherstreamerManager::getReportedPassphrase(const IPAddress &server, uint16_t port) const {
// }