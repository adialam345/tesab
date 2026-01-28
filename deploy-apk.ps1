# Script Deploy APK Update ke VPS
# Untuk sistem auto-update APK

# Konfigurasi VPS
$VPS_USER = "root"
$VPS_IP = "2407:6ac0:3:9d:abcd::1ba"
$VPS_PATH = "/www/wwwroot/tesab/ota"

# 1. Input Versi Baru
$NEW_VERSION = Read-Host "Masukkan Versi Baru (Contoh: 1.9.1)"
if (-not $NEW_VERSION) { 
    Write-Host "Versi tidak boleh kosong!" -ForegroundColor Red
    exit 
}

Write-Host "`n=== Memulai Proses Build & Deploy APK v$NEW_VERSION ===" -ForegroundColor Cyan

# 2. Update Version di Files
Write-Host "`n[1/6] Updating version labels..." -ForegroundColor Yellow
$CONSTANTS_PATH = "src/utils/constants.ts"
$PACKAGE_PATH = "package.json"

(Get-Content $CONSTANTS_PATH) -replace "APP_VERSION = '.*?'", "APP_VERSION = '$NEW_VERSION'" | Set-Content $CONSTANTS_PATH
(Get-Content $PACKAGE_PATH) -replace '"version":\s*".*?"', "`"version`": `"$NEW_VERSION`"" | Set-Content $PACKAGE_PATH

Write-Host "✓ Version updated to $NEW_VERSION" -ForegroundColor Green

# 3. Build Web Assets
Write-Host "`n[2/6] Building web assets..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 
}
Write-Host "✓ Web build complete" -ForegroundColor Green

# 4. Sync to Android
Write-Host "`n[3/6] Syncing to Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { 
    Write-Host "✗ Sync failed!" -ForegroundColor Red
    exit 
}
Write-Host "✓ Android sync complete" -ForegroundColor Green

# 5. Build APK
Write-Host "`n[4/6] Building APK (this may take a while)..." -ForegroundColor Yellow
Push-Location android
.\gradlew.bat assembleRelease
$BUILD_RESULT = $LASTEXITCODE
Pop-Location

if ($BUILD_RESULT -ne 0) { 
    Write-Host "✗ APK build failed!" -ForegroundColor Red
    exit 
}

$APK_PATH = "android\app\build\outputs\apk\release\app-release.apk"
if (!(Test-Path $APK_PATH)) {
    Write-Host "✗ APK not found at $APK_PATH" -ForegroundColor Red
    exit
}

Write-Host "✓ APK built successfully" -ForegroundColor Green

# 6. Create version.json
Write-Host "`n[5/6] Creating version.json..." -ForegroundColor Yellow
$VERSION_JSON = @{
    version = $NEW_VERSION
    apk_url = "https://antarixa.qzz.io/ota/app-release.apk"
    changelog = "Update ke versi $NEW_VERSION"
} | ConvertTo-Json

$VERSION_JSON | Out-File -FilePath "version.json" -Encoding utf8 -Force
Write-Host "✓ version.json created" -ForegroundColor Green

# 7. Upload to VPS
Write-Host "`n[6/6] Uploading to VPS..." -ForegroundColor Yellow

Write-Host "  → Uploading APK..." -ForegroundColor Gray
scp -6 $APK_PATH "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/app-release.apk"
if ($LASTEXITCODE -ne 0) { 
    Write-Host "✗ Failed to upload APK!" -ForegroundColor Red
    exit 
}

Write-Host "  → Uploading version.json..." -ForegroundColor Gray
scp -6 "version.json" "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/version.json"
if ($LASTEXITCODE -ne 0) { 
    Write-Host "✗ Failed to upload version.json!" -ForegroundColor Red
    exit 
}

Write-Host "✓ Upload complete" -ForegroundColor Green

# Summary
Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ APK v$NEW_VERSION DEPLOYED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nUsers will be notified to update on next app launch." -ForegroundColor White
Write-Host "APK URL: https://antarixa.qzz.io/ota/app-release.apk`n" -ForegroundColor Gray
