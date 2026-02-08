#include <WiFi.h>
#include <HTTPClient.h>

// Forward declaration
void sendStatus(String appliance, String state);

// ---------------- WIFI DETAILS ----------------
const char* ssid = "realme 5i";
const char* password = "9876543210";

// ---------------- SERVER URL ----------------
const char* serverCommandURL = "http://192.168.43.199:3000/device/command";
const char* serverStatusURL  = "http://192.168.43.199:3000/device/status";

// ---------------- RELAY PINS ----------------
#define RELAY_LIGHT  5
#define RELAY_FAN    18

// ---------------- DEVICE ID ----------------
String device_id = "home_esp32";

void setup() {
  Serial.begin(115200);

  // Relay pins
  pinMode(RELAY_LIGHT, OUTPUT);
  pinMode(RELAY_FAN, OUTPUT);

  digitalWrite(RELAY_LIGHT, LOW);
  digitalWrite(RELAY_FAN, LOW);

  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.println(WiFi.localIP());
}

void loop() {

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // 1️⃣ ASK SERVER FOR COMMAND
    http.begin(serverCommandURL + String("?device_id=") + device_id);
    int httpCode = http.GET();

    if (httpCode == 200) {
      String payload = http.getString();
      Serial.println("Command: " + payload);

      // SIMPLE COMMAND CHECK (for demo)
      if (payload == "LIGHT_ON") {
        digitalWrite(RELAY_LIGHT, HIGH);
        sendStatus("light", "ON");
      }
      else if (payload == "LIGHT_OFF") {
        digitalWrite(RELAY_LIGHT, LOW);
        sendStatus("light", "OFF");
      }
      else if (payload == "FAN_ON") {
        digitalWrite(RELAY_FAN, HIGH);
        sendStatus("fan", "ON");
      }
      else if (payload == "FAN_OFF") {
        digitalWrite(RELAY_FAN, LOW);
        sendStatus("fan", "OFF");
      }
    }

    http.end();
  }

  delay(3000); // Poll every 3 seconds
}

// ---------------- SEND STATUS FUNCTION ----------------
void sendStatus(String appliance, String state) {

  HTTPClient http;
  http.begin(serverStatusURL);
  http.addHeader("Content-Type", "application/json");

  String jsonData = "{";
  jsonData += "\"device_id\":\"" + device_id + "\",";
  jsonData += "\"" + appliance + "\":\"" + state + "\"";
  jsonData += "}";

  int httpCode = http.POST(jsonData);
  Serial.println("Status sent: " + jsonData);

  http.end();
}
