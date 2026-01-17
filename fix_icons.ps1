Add-Type -AssemblyName System.Drawing
try {
    $path192 = "f:\tools-absen\public\icon-192.png"
    $img192 = [System.Drawing.Image]::FromFile($path192)
    $img192.Save("f:\tools-absen\public\icon-192-new.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $img192.Dispose()
    Move-Item -Force "f:\tools-absen\public\icon-192-new.png" $path192
    Write-Host "Converted 192 to real PNG"

    $path512 = "f:\tools-absen\public\icon-512.png"
    $img512 = [System.Drawing.Image]::FromFile($path512)
    $img512.Save("f:\tools-absen\public\icon-512-new.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $img512.Dispose()
    Move-Item -Force "f:\tools-absen\public\icon-512-new.png" $path512
    Write-Host "Converted 512 to real PNG"
} catch {
    Write-Error "Failed to convert images: $_"
}
