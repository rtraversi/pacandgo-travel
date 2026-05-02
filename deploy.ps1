Set-Location $PSScriptRoot

Write-Host ""
Write-Host "PAC and GO Travel - Deploy Script" -ForegroundColor Cyan
Write-Host ""
Write-Host "Where do you want to deploy?" -ForegroundColor Yellow
Write-Host "  1. TEST only  (pacandgo-travel-mockup.netlify.app)"
Write-Host "  2. PROMOTE to LIVE  (pacandgo-travel.netlify.app)" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter 1 or 2"

if ($choice -ne "1" -and $choice -ne "2") {
    Write-Host "Invalid choice. Exiting." -ForegroundColor Red
    exit
}

$commitMsg = Read-Host "What did you change?"
if ([string]::IsNullOrWhiteSpace($commitMsg)) { $commitMsg = "Site update" }

Write-Host ""
Write-Host "Pushing to test site..." -ForegroundColor Cyan
git add .
git commit -m $commitMsg
git push

Write-Host ""
Write-Host "Test site deploying!" -ForegroundColor Green
Write-Host "https://pacandgo-travel-mockup.netlify.app" -ForegroundColor Yellow

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "Promoting to LIVE..." -ForegroundColor Magenta

    $dest = "C:\sites\pacnandgotravel-live"

    if (-not (Test-Path "$dest\agents")) {
        New-Item -ItemType Directory -Path "$dest\agents" | Out-Null
    }

    Copy-Item "$PSScriptRoot\*.html" $dest -Force
    Copy-Item "$PSScriptRoot\*.jpg"  $dest -Force -ErrorAction SilentlyContinue
    Copy-Item "$PSScriptRoot\*.png"  $dest -Force -ErrorAction SilentlyContinue
    Copy-Item "$PSScriptRoot\agents\*.html" "$dest\agents\" -Force

    Set-Location $dest
    git add .
    git commit -m "PROMOTE: $commitMsg"
    git push

    Write-Host ""
    Write-Host "Live site deploying!" -ForegroundColor Green
    Write-Host "https://pacandgo-travel.netlify.app" -ForegroundColor Yellow

    Set-Location $PSScriptRoot
}

Write-Host ""
Write-Host "Done! Netlify deploys in ~30 seconds." -ForegroundColor Cyan
Write-Host ""