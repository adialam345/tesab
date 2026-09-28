# Script Deploy APK Update ke Supabase (Tanpa VPS)
# Untuk sistem auto-update APK

# ==========================================
# KONFIGURASI SUPABASE (WAJIB DIISI)
# ==========================================
$SUPABASE_URL = "https://aiyslkzvbzznfavpllwo.supabase.co"
# AMBIL KEY INI DARI: Settings -> API -> service_role secret
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeXNsa3p2Ynp6bmZhdnBsbHdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgzMDI0NSwiZXhwIjoyMDg0NDA2MjQ1fQ.UAv6Ew8gkJSh1foRrmcTFWgjMQrKfSrFwm60wadUSF4"
$BUCKET_NAME = "updates"

# 1. Input Versi & Changelog
$NEW_VERSION = Read-Host "Masukkan Versi Baru (Contoh: 1.9.7)"
if (-not $NEW_VERSION) { Write-Host "Versi tidak boleh kosong!"; exit }

$CHANGELOG = Read-Host "Apa yang baru di versi ini? (Contoh: Perbaikan UI Login)"
if (-not $CHANGELOG) { $CHANGELOG = "Peningkatan performa dan optimasi sistem." }

Write-Host "--- Memulai Proses Build & Deploy APK $NEW_VERSION ---" -ForegroundColor Cyan

# 2. Update Version di Files
Write-Host "1. Updating version labels..." -ForegroundColor Yellow
$CONSTANTS_PATH = "src/utils/constants.ts"
$PACKAGE_PATH = "package.json"

(Get-Content $CONSTANTS_PATH) -replace "APP_VERSION = '.*?'", "APP_VERSION = '$NEW_VERSION'" | Set-Content $CONSTANTS_PATH
(Get-Content $PACKAGE_PATH) -replace '"version":\s*".*?"', "`"version`": `"$NEW_VERSION`"" | Set-Content $PACKAGE_PATH

# 3. Build Web Assets
Write-Host "2. Building web assets..." -ForegroundColor Yellow
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { exit }

# 4. Sync to Android
Write-Host "3. Syncing to Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit }

# 5. Build APK
Write-Host "4. Building APK (Debug - Agar Bisa Langsung Diinstall)..." -ForegroundColor Yellow
Push-Location android
.\gradlew.bat assembleDebug
$BUILD_RESULT = $LASTEXITCODE
Pop-Location

if ($BUILD_RESULT -ne 0) { exit }

# Check for Debug APK (Sudah otomatis signed)
$APK_PATH = "android\app\build\outputs\apk\debug\app-debug.apk"

if (!(Test-Path $APK_PATH)) {
    Write-Host "ERROR: File APK tidak ditemukan!" -ForegroundColor Red
    exit
}

Write-Host "OK - APK Debug built successfully" -ForegroundColor Green

# 6. Upload APK ke Supabase
Write-Host "5. Uploading APK ke Supabase Storage..." -ForegroundColor Yellow
$FILE_NAME = "absen-tech-$NEW_VERSION.apk"
$UPLOAD_URL_APK = "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/$FILE_NAME"

# Kita tambahkan header x-upsert: true agar bisa menimpa file jika versinya sama
curl.exe -X POST -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/vnd.android.package-archive" -H "x-upsert: true" --data-binary "@$APK_PATH" $UPLOAD_URL_APK

$PUBLIC_APK_URL = "$SUPABASE_URL/storage/v1/object/public/$BUCKET_NAME/$FILE_NAME"

# 7. Create & Upload version.json ke Supabase
Write-Host "6. Uploading version.json ke Supabase Storage..." -ForegroundColor Yellow
$VERSION_JSON = @{
    version = $NEW_VERSION
    apk_url = $PUBLIC_APK_URL
    changelog = $CHANGELOG
} | ConvertTo-Json

$VERSION_JSON_PATH = "version.json"
$VERSION_JSON | Out-File -FilePath $VERSION_JSON_PATH -Encoding utf8 -Force

$UPLOAD_URL_JSON = "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/version.json"

# Kita hapus dulu file lama agar bisa di-overwrite
curl.exe -X DELETE -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" $UPLOAD_URL_JSON

# Upload yang baru dengan Cache-Control: no-cache
Write-Host "  Uploading version.json with no-cache..." -ForegroundColor Gray
curl.exe -X POST -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json" -H "x-upsert: true" -H "cache-control: no-cache" --data-binary "@$VERSION_JSON_PATH" $UPLOAD_URL_JSON

Write-Host "`n--- SELESAI ---" -ForegroundColor Cyan
Write-Host "Update v$NEW_VERSION Berhasil! Tanpa VPS!" -ForegroundColor Green
Write-Host "Link APK: $PUBLIC_APK_URL" -ForegroundColor Gray
