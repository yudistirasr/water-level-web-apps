#include <WiFi.h>
#include <FirebaseESP32.h>

// Konfigurasi WiFi
const char* ssid = "Yudistira";     // Ganti dengan SSID WiFi Anda
const char* password = "siduyyyy";  // Ganti dengan password WiFi Anda

// Konfigurasi Firebase
#define FIREBASE_HOST "https://water-level-project-c8fab-default-rtdb.firebaseio.com" // Ganti dengan host Firebase Anda
#define FIREBASE_AUTH "AIzaSyA8yxmpkgivvC5RzVxKuhAr3dpihf3nlQQ" // Tokennya
FirebaseData firebaseData;

// Definisi pin untuk ESP32 WEMOS
const int PIN_POTENTIOMETER = 34; // GPIO34 (ADC1_CH6) untuk potensiometer geser B10K

// Variabel untuk perhitungan ketinggian air dan kecepatan perubahan
float lastHeight = 0.0;     // Ketinggian sebelumnya (meter)
unsigned long lastTime = 0; // Waktu sebelumnya (milidetik)

void setup() {
  Serial.begin(115200);     // Inisialisasi serial dengan baud rate 115200

  // Mengatur mode pin
  pinMode(PIN_POTENTIOMETER, INPUT);  // Pin potensiometer

  // Menghubungkan ke WiFi
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi terhubung!");

  // Inisialisasi Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Membaca nilai ADC dari potensiometer
  int potValue = analogRead(PIN_POTENTIOMETER);  // ADC 12-bit (0-4095)
  
  // Mengonversi nilai ADC ke ketinggian air (0-3 meter)
  float height = (potValue / 4095.0) * 3.0;  // Skala dari 0-4095 ke 0-3 meter

  // Menghitung kecepatan perubahan ketinggian air (m/s)
  unsigned long currentTime = millis();
  float deltaTime = (currentTime - lastTime) / 1000.0;  // Selisih waktu dalam detik
  float rateOfChange = (deltaTime > 0) ? (height - lastHeight) / deltaTime : 0.0;

  // Menyimpan nilai untuk iterasi berikutnya
  lastHeight = height;
  lastTime = currentTime;

  // Menampilkan hasil ke Serial Monitor
  Serial.print("Ketinggian Air: ");
  Serial.print(height);
  Serial.print(" m    ");
  Serial.print("Kecepatan Perubahan Ketinggian: ");
  Serial.print(rateOfChange);
  Serial.println(" m/s");

  // Mengirim data ke Firebase
  if (Firebase.setFloat(firebaseData, "/water_level/height", height)) {
    Serial.println("Data ketinggian dikirim ke Firebase");
  } else {
    Serial.println("Gagal mengirim data ketinggian: " + firebaseData.errorReason());
  }
  if (Firebase.setFloat(firebaseData, "/water_level/rate", rateOfChange)) {
    Serial.println("Data kecepatan perubahan dikirim ke Firebase");
  } else {
    Serial.println("Gagal mengirim data kecepatan: " + firebaseData.errorReason());
  }

  delay(1000);  // Delay 1 detik untuk pembacaan berkala
}