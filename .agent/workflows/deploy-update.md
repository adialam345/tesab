---
description: Cara Deploy Update APK dengan Auto-Update
---

# Sistem Auto-Update APK

Sistem ini memungkinkan aplikasi untuk **auto-detect update** dan **download APK baru** tanpa menggunakan OTA Capacitor Updater yang bermasalah.

## 🎯 Cara Kerja

1. **Aplikasi cek versi** di server saat dibuka
2. **Jika ada update**, tampilkan notifikasi
3. **User klik "Download"**, APK baru diunduh
4. **User install APK** dari notifikasi/Downloads

## 📦 Cara Deploy Update Baru

### Langkah 1: Jalankan Script Deploy
// turbo
```powershell
.\deploy-apk.ps1
```

### Langkah 2: Masukkan Versi Baru
Contoh: `1.9.1`, `2.0.0`, dll.

### Langkah 3: Tunggu Proses Selesai
Script akan otomatis:
- ✅ Update versi di code
- ✅ Build web assets
- ✅ Sync ke Android
- ✅ Build APK release
- ✅ Upload APK ke server
- ✅ Upload version.json

### Langkah 4: Selesai!
User akan mendapat notifikasi update saat buka aplikasi.

## 🔧 Manual Build (Jika Script Gagal)

```powershell
# 1. Update versi di constants.ts dan package.json
# 2. Build web
npm run build

# 3. Sync ke Android
npx cap sync android

# 4. Build APK
cd android
.\gradlew.bat assembleRelease

# 5. APK ada di:
# android\app\build\outputs\apk\release\app-release.apk

# 6. Upload manual ke VPS
scp -6 android\app\build\outputs\apk\release\app-release.apk root@[2407:6ac0:3:9d:abcd::1ba]:/www/wwwroot/tesab/ota/app-release.apk
```

## 📱 Pengalaman User

1. Buka aplikasi
2. Muncul dialog: "🎉 Update Tersedia! Versi Baru: X.X.X"
3. Klik "OK" untuk download
4. APK otomatis terdownload
5. Buka APK dari notifikasi
6. Install update

## 🔐 Signing APK (Production)

Untuk production, Anda perlu sign APK dengan keystore:

```powershell
# Generate keystore (sekali saja)
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Simpan keystore di android/app/
# Edit android/app/build.gradle untuk add signing config
```

## 📝 File Penting

- `deploy-apk.ps1` - Script deploy otomatis
- `src/utils/appUpdater.ts` - Logic update checker
- `version.json` - Info versi di server
- `app-release.apk` - APK yang diupload ke server

## ⚠️ Catatan

- APK harus di-sign untuk production
- User harus enable "Install from Unknown Sources"
- Update check jalan setiap kali app dibuka
- Download menggunakan browser bawaan Android
