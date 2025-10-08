<#
Downloads specified Roboto woff2 files from Google Fonts and writes a local CSS file
Usage: In project root run: .\scripts\download-roboto.ps1
#>
param(
    [string[]]$weights = @("300","400","500","700","900"),
    [string]$outputCss = "public/fonts/roboto-local.css",
    [string]$outputDir = "public/fonts"
)

Write-Host "Creating output directory: $outputDir"
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir | Out-Null }

$base = "https://fonts.gstatic.com/s/roboto/v30"
# Map weights to file names (subset: latin) - these filenames are the pattern used by Google Fonts.
# We'll attempt to download woff2 files for latin subset. If a file 404s, script will skip it.
$weightFiles = @{
    "300" = "KFOlCnqEu92Fr1MmSU5vAw.woff2"
    "400" = "KFOmCnqEu92Fr1Me5Q.woff2"
    "500" = "KFOlCnqEu92Fr1MmEU9vAw.woff2"
    "700" = "KFOlCnqEu92Fr1MmWUlvAw.woff2"
    "900" = "KFOlCnqEu92Fr1MmYUtfAw.woff2"
}

$cssLines = @()
foreach ($w in $weights) {
    if (-not $weightFiles.ContainsKey($w)) { Write-Warning "Unknown weight $w - skipping"; continue }
    $file = $weightFiles[$w]
    $url = "$base/$file"
    $dest = Join-Path $outputDir $file
    Write-Host "Downloading Roboto weight $w from $url"
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
        Write-Host "Saved $dest"
        $cssLines += "@font-face {"
        $cssLines += "  font-family: 'Roboto';"
        $cssLines += "  font-style: normal;"
        $cssLines += "  font-weight: $w;"
        $cssLines += "  src: url('/fonts/$file') format('woff2');"
        $cssLines += "  font-display: swap;"
        $cssLines += "}"
        $cssLines += ""
    }
    catch {
        Write-Warning "Failed to download $url : $_"
    }
}

$cssPath = Join-Path (Get-Location) $outputCss
Write-Host "Writing local font CSS to $cssPath"
$cssLines -join "`n" | Out-File -FilePath $cssPath -Encoding UTF8
Write-Host "Done. Import '$outputCss' in your main CSS to use the local Roboto fonts."
