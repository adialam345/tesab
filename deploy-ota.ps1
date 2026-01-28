# Konfigurasi VPS aaPanel
$VPS_USER = "root"
$VPS_IP = "2407:6ac0:3:9d:abcd::1ba" 
$VPS_PATH = "/www/wwwroot/tesab/ota"

# 1. Pilih Versi Baru
$NEW_VERSION = Read-Host "Masukkan Versi Baru (Contoh: 1.5.1)"
if (-not $NEW_VERSION) { Write-Host "Versi tidak boleh kosong!"; exit }

Write-Host "--- Memulai Proses OTA Update v$NEW_VERSION ---" -ForegroundColor Cyan

# 2. Update Version in Files
Write-Host "1. Updating version labels..."
$CONSTANTS_PATH = "src/utils/constants.ts"
$PACKAGE_PATH = "package.json"

# Update constants.ts
$constants = Get-Content $CONSTANTS_PATH
$constants = $constants -replace "APP_VERSION = '.*?'", "APP_VERSION = '$NEW_VERSION'"
$constants | Set-Content $CONSTANTS_PATH

# Update package.json
$package = Get-Content $PACKAGE_PATH
$newPackageLine = "`"version`": `"$NEW_VERSION`","
$package = $package -replace '"version":\s*".*?",', $newPackageLine
$package | Set-Content $PACKAGE_PATH

# 3. Build Project
Write-Host "2. Building Project dengan Astro..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build Gagal!"; exit }

# Tunggu sampai file index muncul
Write-Host "Menunggu sinkronisasi file sistem..."
$timeout = 0
while (!(Test-Path "dist/index.html") -and $timeout -lt 10) {
    Start-Sleep -Seconds 1
    $timeout++
}
Start-Sleep -Seconds 2

# 4. Create version.json (Memperbaiki parameter yang salah)
Write-Host "3. Creating version.json..."
$JSON_CONTENT = '{"version": "' + $NEW_VERSION + '"}'
# Menggunakan Out-File dengan encoding yang aman (ascii/utf8)
$JSON_CONTENT | Out-File -FilePath "version.json" -Encoding ascii -Force

# 5. Create dist.zip
Write-Host "4. Creating dist.zip dari folder dist yang sudah lengkap..." -ForegroundColor Cyan
if (Test-Path "dist.zip") { Remove-Item "dist.zip" }
Compress-Archive -Path "dist/*" -DestinationPath "dist.zip" -Force

# 6. Upload to VPS
Write-Host "5. Uploading to VPS (IPv6 Mode)..."
scp -6 "dist.zip" "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/dist.zip"
if ($LASTEXITCODE -ne 0) { Write-Host "Gagal Upload dist.zip!"; exit }

scp -6 "version.json" "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/version.json"
if ($LASTEXITCODE -ne 0) { Write-Host "Gagal Upload version.json!"; exit }

Write-Host "--- SUKSES TOTAL! Update v$NEW_VERSION sudah siap di HP ---" -ForegroundColor Green
