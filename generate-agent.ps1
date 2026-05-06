Set-Location $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PAC and GO Travel - New Agent+ Generator  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Clones Robert Traversi's mini-site and replaces" -ForegroundColor Gray
Write-Host "his info with the new agent's info." -ForegroundColor Gray
Write-Host ""

# ── Collect info ──────────────────────────────────────────────────────────────

$name = Read-Host "Agent full name         (e.g. Patty Wells)"
if ([string]::IsNullOrWhiteSpace($name)) { Write-Host "Name is required." -ForegroundColor Red; exit }

$autoSlug = $name.ToLower() -replace "[^a-z0-9]", "-" -replace "-+", "-" -replace "^-|-$", ""
Write-Host "  -> Auto slug: $autoSlug" -ForegroundColor DarkCyan
$slugInput = Read-Host "URL slug (press Enter to accept, or type a different one)"
$slug = if ([string]::IsNullOrWhiteSpace($slugInput)) { $autoSlug } else { $slugInput.Trim() }

$email   = Read-Host "Email address           (e.g. patty@email.com)"
$tagline = Read-Host "Specialty tagline       (e.g. All-Inclusive and Caribbean Expert)"

$clia = Read-Host "CLIA number             (press Enter to keep 456611)"
if ([string]::IsNullOrWhiteSpace($clia)) { $clia = "456611" }

$sot = Read-Host "FL Seller of Travel #   (press Enter to keep 40802)"
if ([string]::IsNullOrWhiteSpace($sot)) { $sot = "40802" }

$photo = Read-Host "Profile photo filename  (place file in images\uploads\ first, e.g. patty-profile.jpg)"
if ([string]::IsNullOrWhiteSpace($photo)) { $photo = "agent-profile.jpg" }

# ── Copy template ─────────────────────────────────────────────────────────────

$src  = "$PSScriptRoot\agents\robert-traversi"
$dest = "$PSScriptRoot\agents\$slug"

Write-Host ""

if (Test-Path $dest) {
    Write-Host "WARNING: agents\$slug\ already exists." -ForegroundColor Yellow
    $ow = Read-Host "Overwrite? (y/n)"
    if ($ow -ne "y") { Write-Host "Cancelled." -ForegroundColor Red; exit }
    Remove-Item $dest -Recurse -Force
}

Write-Host "Copying template files..." -ForegroundColor Cyan
Copy-Item $src $dest -Recurse

# ── Replace values in all HTML files ─────────────────────────────────────────

Write-Host "Replacing values..." -ForegroundColor Cyan

Get-ChildItem "$dest\*.html" | ForEach-Object {
    $c = Get-Content $_.FullName -Raw -Encoding UTF8

    $c = $c -replace "robert-traversi",                        $slug
    $c = $c -replace "Robert Traversi",                        $name
    $c = $c -replace "pacandgorob@gmail\.com",                 $email
    $c = $c -replace "Travel Specialist · Cruise Expert · Adventure Seeker", $tagline
    $c = $c -replace "robandkaty-profile\.jpg",                $photo
    $c = $c -replace "CLIA #456611",                           "CLIA #$clia"
    $c = $c -replace "Florida Seller of Travel #40802",        "Florida Seller of Travel #$sot"

    Set-Content $_.FullName $c -Encoding UTF8 -NoNewline
}

# ── Create redirect shell at agents/slug.html ─────────────────────────────────

$shellSrc = "$PSScriptRoot\agents\robert-traversi.html"
if (Test-Path $shellSrc) {
    $sc = Get-Content $shellSrc -Raw -Encoding UTF8
    $sc = $sc -replace "robert-traversi", $slug
    $sc = $sc -replace "Robert Traversi",  $name
    Set-Content "$PSScriptRoot\agents\$slug.html" $sc -Encoding UTF8 -NoNewline
    Write-Host "Created redirect shell: agents\$slug.html" -ForegroundColor Gray
}

# ── Add to deploy script ──────────────────────────────────────────────────────

$deployFile = "$PSScriptRoot\deploy.ps1"
$deployContent = Get-Content $deployFile -Raw -Encoding UTF8
$copyLine = "    Copy-Item `"`$PSScriptRoot\agents\$slug`" `"`$dest\agents\`" -Recurse -Force"

if ($deployContent -notmatch [regex]::Escape("agents\$slug")) {
    $deployContent = $deployContent -replace `
        '(    Copy-Item "\$PSScriptRoot\\agents\\robert-traversi".*?-Force)', `
        "`$1`n$copyLine"
    Set-Content $deployFile $deployContent -Encoding UTF8 -NoNewline
    Write-Host "Added $slug to deploy.ps1 live promote." -ForegroundColor Gray
}

# ── Done ──────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "Done! Mini-site created at: agents\$slug\" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Edit the bio in agents\$slug\index.html (search for 'bio-text')"
Write-Host "  2. Edit specialties in agents\$slug\specialties.html"
Write-Host "  3. Place profile photo at: images\uploads\$photo"
Write-Host "  4. Add $name to the admin agent switcher — open admin\index.html"
Write-Host "     and search for 'agent-select', add:"
Write-Host "     <option value=`"$slug`">$name</option>" -ForegroundColor White
Write-Host ""
Write-Host "  5. Run this in the Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "     INSERT INTO settings (agent_id) VALUES ('$slug');" -ForegroundColor White
Write-Host ""
Write-Host "  6. Run deploy.ps1 to publish." -ForegroundColor Yellow
Write-Host ""
