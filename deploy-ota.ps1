# Konfigurasi VPS aaPanel
$VPS_USER = "root"
$VPS_IP = "2407:6ac0:3:9d:abcd::1cf" 
$VPS_PATH = "/www/wwwroot/antarixa.qzz.io/ota"

# 1. Pilih Versi Baru
$NEW_VERSION = Read-Host "Masukkan Versi Baru (Contoh: 1.5.1)"
if (-not $NEW_VERSION) { Write-Host "Versi tidak boleh kosong!"; exit }

Write-Host "--- Memulai Proses OTA Update v$NEW_VERSION ---" -ForegroundColor Cyan

# 2. Build Project
Write-Host "1. Building Project..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build Gagal!"; exit }

# 3. Create dist.zip
Write-Host "2. Creating dist.zip..."
if (Test-Path "dist.zip") { Remove-Item "dist.zip" }
# Menggunakan perintah asli PowerShell untuk zip agar stabil
Compress-Archive -Path "dist/*" -DestinationPath "dist.zip" -Force

# 4. Create version.json
Write-Host "3. Creating version.json..."
$JSON_CONTENT = '{"version": "' + $NEW_VERSION + '"}'
$JSON_CONTENT | Out-File -FilePath "version.json" -Encoding ascii

# 5. Upload to VPS (Menggunakan format IPv6 yang benar untuk SCP)
Write-Host "4. Uploading to VPS (IPv6 Mode)..."
# Menambahkan -6 dan tanda kurung [] untuk IPv6
scp -6 "dist.zip" "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/dist.zip"
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Gagal Upload dist.zip! Pastikan SSH port 22 terbuka dan password benar." -ForegroundColor Red
    exit 
}

scp -6 "version.json" "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/version.json"
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Gagal Upload version.json!" -ForegroundColor Red
    exit 
}

Write-Host "--- Sukses! Update v$NEW_VERSION sudah tersedia di VPS ---" -ForegroundColor Green
