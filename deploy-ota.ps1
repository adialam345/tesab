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
(Get-Content $CONSTANTS_PATH) -replace "APP_VERSION = '.*?'", "APP_VERSION = '$NEW_VERSION'" | Set-Content $CONSTANTS_PATH

# Update package.json
(Get-Content $PACKAGE_PATH) -replace '"version":\s*".*?"', "`"version`": `"$NEW_VERSION`"" | Set-Content $PACKAGE_PATH

# 3. Bersihkan Folder Lama
Write-Host "2. Membersihkan folder dist lama..." -ForegroundColor Gray
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "dist.zip") { Remove-Item -Force "dist.zip" }

# 4. Build Project (Synchronous)
Write-Host "3. Building Project dengan Astro (Mohon Tunggu...)" -ForegroundColor Yellow
# Menggunakan cmd /c untuk memastikan npm terpanggil dengan benar dan ditunggu sampai selesai
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Build Gagal!" -ForegroundColor Red
    exit 
}

# Verifikasi hasil build
Write-Host "Verifikasi file hasil build..."
if (!(Test-Path "dist/index.html")) {
    Write-Host "ERROR: File dist/index.html tidak ditemukan!" -ForegroundColor Red
    exit
}

# 4.5 Fix Absolute Paths (Use ./ prefix for Capacitor/OTA compatibility)
Write-Host "4.5 Fixing asset paths (making them relative with ./)..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path "dist" -Filter "*.html" -Recurse
foreach ($file in $htmlFiles) {
    (Get-Content $file.FullName -Raw) `
        -replace 'href="/', 'href="./' `
        -replace 'src="/', 'src="./' `
        -replace 'href="_astro/', 'href="./_astro/' `
        -replace 'src="_astro/', 'src="./_astro/' `
        | Set-Content $file.FullName -NoNewline
}
# Also fix any JS files that might reference absolute paths
$jsFiles = Get-ChildItem -Path "dist/_astro" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $jsFiles) {
    (Get-Content $file.FullName -Raw) `
        -replace '\"/_astro/', '"./_astro/' `
        -replace '''/_astro/', '''./_astro/' `
        | Set-Content $file.FullName -NoNewline
}

# 5. Create version.json
Write-Host "4. Creating version.json..."
$JSON_CONTENT = '{"version": "' + $NEW_VERSION + '"}'
$JSON_CONTENT | Out-File -FilePath "version.json" -Encoding ascii -Force

# 6. Create dist.zip
Write-Host "5. Creating dist.zip..." -ForegroundColor Cyan
Compress-Archive -Path "dist/*" -DestinationPath "dist.zip" -Force

# 7. Upload to VPS
Write-Host "6. Uploading to VPS (IPv6 Mode)..."
# Gunakan scp dengan -6 untuk IPv6
scp -6 "dist.zip" "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/dist.zip"
if ($LASTEXITCODE -ne 0) { Write-Host "Gagal Upload dist.zip!"; exit }

scp -6 "version.json" "$($VPS_USER)@[$($VPS_IP)]:$($VPS_PATH)/version.json"
if ($LASTEXITCODE -ne 0) { Write-Host "Gagal Upload version.json!"; exit }

Write-Host "--- SUKSES TOTAL! Update v$NEW_VERSION sudah siap di HP ---" -ForegroundColor Green
