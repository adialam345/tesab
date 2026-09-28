$path = "f:\tools-absen\index-rM_m-kIA.js"
$content = [System.IO.File]::ReadAllText($path)
$pattern = "X-Device-ID"

$index = $content.IndexOf($pattern)
while ($index -ne -1) {
    $start = [Math]::Max(0, $index - 200)
    $length = [Math]::Min(500, $content.Length - $start)
    Write-Host "--- Index: $index ---"
    Write-Host $content.Substring($start, $length)
    Write-Host "---------------------"
    $index = $content.IndexOf($pattern, $index + 1)
}
