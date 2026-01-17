---
description: Cara Build APK WebView AbsenTech
---

Ikuti langkah-langkah ini untuk merubah project Anda menjadi APK Android (WebView):

### 1. Persiapan Environment
Pastikan Anda sudah menginstal **Android Studio** di komputer lokal Anda.

### 2. Update URL Website (PENTING)
Buka file `capacitor.config.ts` dan pastikan bagian `url` sudah sesuai dengan domain website Anda:
```typescript
server: {
  url: 'https://domain-anda.com', // Ganti dengan URL VPS Anda
  ...
}
```

### 3. Sinkronisasi Kode
Jalankan perintah ini di terminal proyek Anda untuk menyiapkan folder build:
// turbo
```bash
npm run build
npx cap sync android
```

### 4. Build APK di Android Studio
1. Buka folder `android` proyek Anda menggunakan **Android Studio**.
2. Tunggu proses Gradle Sync selesai.
3. Klik menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. Setelah selesai, APK akan tersedia di: `android/app/build/outputs/apk/debug/app-debug.apk`.

### 5. Jalankan Langsung ke HP
Jika HP Android Anda sudah terhubung ke PC dan dalam mode Developer:
// turbo
```bash
npx cap run android
```

**Catatan:** Karena kita menggunakan WebView dengan `url` langsung ke VPS, APK ini akan selalu memuat versi terbaru dari website Anda secara otomatis.
