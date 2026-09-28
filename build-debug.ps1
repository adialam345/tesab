# Script Build APK Debug untuk Testing
# Lebih cepat dari Release

Write-Host "`n=== Building APK Debug ===" -ForegroundColor Cyan

# 1. Build Web
Write-Host "`n[1/3] Building web assets..." -ForegroundColor Yellow
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { 
    Write-Host "ERROR - Build failed!" -ForegroundColor Red
    exit 
}
Write-Host "OK - Web build complete" -ForegroundColor Green

# 2. Sync Android
Write-Host "`n[2/3] Syncing to Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { 
    Write-Host "ERROR - Sync failed!" -ForegroundColor Red
    exit 
}
Write-Host "OK - Android sync complete" -ForegroundColor Green

# 3. Build APK Debug
Write-Host "`n[3/3] Building APK Debug..." -ForegroundColor Yellow
Push-Location android
cmd /c "gradlew.bat assembleDebug"
$BUILD_RESULT = $LASTEXITCODE
Pop-Location

if ($BUILD_RESULT -ne 0) { 
    Write-Host "ERROR - APK build failed!" -ForegroundColor Red
    Write-Host "Coba buka Android Studio dan build dari sana." -ForegroundColor Yellow
    exit 
}

$APK_PATH = "android\app\build\outputs\apk\debug\app-debug.apk"
if (!(Test-Path $APK_PATH)) {
    Write-Host "ERROR - APK not found!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SUCCESS - APK Debug Built!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "APK Location:" -ForegroundColor White
Write-Host "  $APK_PATH" -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy APK ini ke HP untuk testing!" -ForegroundColor Yellow
Write-Host ""
