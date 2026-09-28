$path = "f:\tools-absen\index-rM_m-kIA.js"
$content = [System.IO.File]::ReadAllText($path)

function Find-Context {
    param($pattern)
    Write-Host "--- Searching for: $pattern ---"
    $index = $content.IndexOf($pattern)
    if ($index -ge 0) {
        $start = [Math]::Max(0, $index - 500)
        $length = [Math]::Min(2000, $content.Length - $start)
        Write-Host $content.Substring($start, $length)
        Write-Host "----------------------------"
    } else {
        Write-Host "Not found"
    }
}

Find-Context "Fetce ID Initialized"
Find-Context "Bypassed"
Find-Context "AuthContext"
 Find-Context "X-Device-ID"
