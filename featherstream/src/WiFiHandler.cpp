#include "WiFiHandler.hpp"

#include <Arduino.h>
#include <FlashStorage.h>
#include <WiFi101.h>
#include <stdlib.h>

#include "secrets.h"

// Explicitly re-check connection status this often. Unclear whether
// checking all the time would actually be an issue - WiFi101 does
// something with a pending-event list on each check, though.
#define CONNECTION_VALID_MS 5000

using namespace featherstream;

FlashStorage(ssid_storage, WiFiHandler::ssid_wrapper_t);

WiFiHandler::WiFiHandler() {
  this->isLoaded = false;
  this->lastVerifiedAt = -CONNECTION_VALID_MS;
  this->isLastConnectionToMaster = false;
}

WiFiHandler::~WiFiHandler() {
}

bool WiFiHandler::isPaired() const {
  return (this->getPairedSSID() != NULL);
}

bool WiFiHandler::ensureConnected() {
  if (this->isPaired()) {
    int32_t time = millis();

    if (time - this->lastVerifiedAt >= CONNECTION_VALID_MS) {
      uint8_t status = WiFi.status();
      if (status == WL_CONNECTED) {
        Serial.println("Verified WiFi connection.");
        this->lastVerifiedAt = time;
        return true;
      } else {
        Serial.println("Scanning networks...");
        int numSSIDs = WiFi.scanNetworks();
        if (numSSIDs == -1) {
          Serial.println("WiFi not available");
          return false;
        } else {
          bool foundPairedAP = false;
          bool foundMasterAP = false;

          for (int i = 0; i < numSSIDs; i++) {
            if (!foundPairedAP &&
                strcmp(this->getPairedSSID(), WiFi.SSID(i)) == 0) {
              foundPairedAP = true;
            }
            if (!foundMasterAP &&
                strcmp(this->getMasterSSID(), WiFi.SSID(i)) == 0) {
              foundMasterAP = true;
            }
          }

          if (foundPairedAP) {
            bool success = this->connect(this->getPairedSSID(), this->getPairedPassphrase());
            if (success) {
              this->isLastConnectionToMaster = false;
            }
            return success;
          } else if (foundMasterAP) {
            bool success = this->connect(this->getMasterSSID(), this->getMasterPassphrase());
            if (success) {
              this->isLastConnectionToMaster = true;
            }
            return success;
          } else {
            Serial.print("Could not find ");
            Serial.print(this->getPairedSSID());
            Serial.print(" or ");
            Serial.println(this->getMasterSSID());
            return false;
          }
        }
      }
    } else {
      // Recently verified.
      return true;
    }
  } else {
    Serial.println("Cannot connect to WiFi, we're not paired with a device.");
    return false;
  }
}

bool WiFiHandler::connect(const char *ssid, const char *passphrase) {
  uint32_t timeout = 10000;
  uint32_t startTime = millis();

  uint8_t status = WL_IDLE_STATUS;
  while (status != WL_CONNECTED) {
    if (millis() - startTime > timeout) {
      Serial.println("Connection timed out.");
      return false;
    }

    Serial.print("Current status is: ");
    Serial.print(status);
    Serial.print(". Attempting to connect to SSID: ");
    Serial.println(ssid);

    status = WiFi.begin(ssid, passphrase);

    if (status != WL_CONNECTED) {
      delay(2000);
    }
  }

  Serial.println("Successfully connected to WiFi");

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

  return true;
}

bool WiFiHandler::setPairedSSID(const char *ssid) {
  if (strlen(ssid) > SSID_MAX_LENGTH) {
    Serial.println("SSID is too long to store");
    return false;
  } else {
    memset(this->ssidWrapper.ssid, 0, sizeof(this->ssidWrapper.ssid));
    strcpy(ssidWrapper.ssid, ssid);
    strcpy(ssidWrapper.magic, WRAPPER_MAGIC);
    ssid_storage.write(ssidWrapper);

    return true;
  }
}

const char * WiFiHandler::getPairedSSID() const {
  #ifdef SECRET_PAIRED_SSID
  return SECRET_PAIRED_SSID;
  #else

  // Once a value is successfully loaded, we don't need to read it
  // again from flash (note we update the value manually in save
  // calls).
  if (this->isLoaded) {
    return this->ssidWrapper.ssid;
  } else {
    this->ssidWrapper = ssid_storage.read();
    if (strcmp(WRAPPER_MAGIC, this->ssidWrapper.magic) == 0) {
      this->isLoaded = true;
      return storedSSID.ssid;
    } else {
      return NULL;
    }
  }

  #endif
}

inline const char * WiFiHandler::getMasterSSID() const {
  return SECRET_MASTER_SSID;
}

inline const char * WiFiHandler::getPairedPassphrase() const {
  #ifdef SECRET_PAIRED_PASS
  return SECRET_PAIRED_PASS;
  #else
  return SECRET_PASS;
  #endif
}

inline const char * WiFiHandler::getMasterPassphrase() const {
  return SECRET_PASS;
}

IPAddress WiFiHandler::getServerAddress() const {
  if (this->isLastConnectionToMaster) {
    return SECRET_MASTER_SERVER_IP;
  } else {
    return SECRET_PAIRED_SERVER_IP;
  }
}