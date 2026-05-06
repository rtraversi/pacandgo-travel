Set-Location $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PAC and GO Travel - New Agent+ Generator  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Helper: parse a simple YAML frontmatter block ────────────────────────────
function Get-YamlFrontmatter($path) {
  if (-not (Test-Path $path)) { return $null }
  $lines = Get-Content $path -Encoding UTF8
  $inBlock = $false
  $yaml = @{}
  $bioLines = @()
  $inBio = $false
  $inSpecialties = $false
  $specialties = @()

  foreach ($line in $lines) {
    if ($line -eq '---') {
      if (-not $inBlock) { $inBlock = $true; continue }
      else { break }
    }
    if (-not $inBlock) { continue }

    # Specialties list
    if ($inSpecialties) {
      if ($line -match '^\s+-\s+(.+)$') { $specialties += $Matches[1].Trim(); continue }
      else { $inSpecialties = $false }
    }
    if ($line -match '^specialties:') { $inSpecialties = $true; continue }

    # Bio block scalar (>) — collect subsequent indented lines
    if ($inBio) {
      if ($line -match '^\s+(.*)$') { $bioLines += $Matches[1]; continue }
      else { $inBio = $false }
    }
    if ($line -match '^bio:\s*>') { $inBio = $true; continue }

    # Simple key: value
    if ($line -match '^(\w+):\s*"?([^"]*)"?\s*$') {
      $yaml[$Matches[1]] = $Matches[2].Trim()
    }
  }

  if ($specialties.Count -gt 0) { $yaml['specialties'] = $specialties -join ', ' }
  if ($bioLines.Count -gt 0)    { $yaml['bio'] = ($bioLines -join "`n").Trim() }
  return $yaml
}

# ── Collect: first & last name ────────────────────────────────────────────────
$firstName = Read-Host "Agent first name        (e.g. Patty)"
if ([string]::IsNullOrWhiteSpace($firstName)) { Write-Host "First name is required." -ForegroundColor Red; exit }

$lastName  = Read-Host "Agent last name         (e.g. Wells)"
if ([string]::IsNullOrWhiteSpace($lastName))  { Write-Host "Last name is required."  -ForegroundColor Red; exit }

$fullName = "$firstName $lastName"

# Auto-generate slug from full name
$autoSlug  = $fullName.ToLower() -replace "[^a-z0-9]", "-" -replace "-+", "-" -replace "^-|-$", ""
Write-Host "  -> Auto slug: $autoSlug" -ForegroundColor DarkCyan
$slugInput = Read-Host "URL slug (press Enter to accept, or type a different one)"
$slug      = if ([string]::IsNullOrWhiteSpace($slugInput)) { $autoSlug } else { $slugInput.Trim() }

# ── Check for existing _agents/{slug}.md ──────────────────────────────────────
$mdPath = "$PSScriptRoot\_agents\$slug.md"
$md     = Get-YamlFrontmatter $mdPath

if ($md) {
  Write-Host ""
  Write-Host "  Found _agents\$slug.md — pre-filling from it." -ForegroundColor Green
}

# ── Collect remaining fields (pre-filled from .md if available) ───────────────
function Prompt-Field($label, $mdKey, $default) {
  $pre = if ($md -and $md[$mdKey]) { $md[$mdKey] } else { $default }
  $hint = if ($pre) { " [$pre]" } else { "" }
  $input = Read-Host "$label$hint"
  return if ([string]::IsNullOrWhiteSpace($input)) { $pre } else { $input.Trim() }
}

$email   = Prompt-Field "Email address          " "email"   ""
$tagline = Prompt-Field "Specialty tagline      " "title"   "Travel Specialist"
$photo   = Prompt-Field "Profile photo filename " "photo"   "agent-profile.jpg"

$clia = Read-Host "CLIA number             (press Enter to keep 456611)"
if ([string]::IsNullOrWhiteSpace($clia)) { $clia = "456611" }

$sot  = Read-Host "FL Seller of Travel #   (press Enter to keep 40802)"
if ([string]::IsNullOrWhiteSpace($sot))  { $sot  = "40802"  }

# ── Copy template ─────────────────────────────────────────────────────────────
$src  = "$PSScriptRoot\agents\template"
$dest = "$PSScriptRoot\agents\$slug"

Write-Host ""

if (Test-Path $dest) {
  Write-Host "WARNING: agents\$slug\ already exists." -ForegroundColor Yellow
  $ow = Read-Host "Overwrite? (y/n)"
  if ($ow -ne "y") { Write-Host "Cancelled." -ForegroundColor Red; exit }
  Remove-Item $dest -Recurse -Force
}

Write-Host "Copying template..." -ForegroundColor Cyan
Copy-Item $src $dest -Recurse

# ── Replace tokens in all HTML files ─────────────────────────────────────────
Write-Host "Replacing tokens..." -ForegroundColor Cyan

# Clean up photo value — strip path, keep filename or full URL
$photoVal = if ($photo -match '^https?://') { $photo } else { [System.IO.Path]::GetFileName($photo) }

Get-ChildItem "$dest\*.html" | ForEach-Object {
  $c = Get-Content $_.FullName -Raw -Encoding UTF8

  $c = $c -replace '\{\{SLUG\}\}',  $slug
  $c = $c -replace '\{\{FULL\}\}',  $fullName
  $c = $c -replace '\{\{FIRST\}\}', $firstName
  $c = $c -replace '\{\{LAST\}\}',  $lastName
  $c = $c -replace '\{\{EMAIL\}\}', $email
  $c = $c -replace '\{\{TAGLINE\}\}',$tagline
  $c = $c -replace '\{\{PHOTO\}\}', $photoVal
  $c = $c -replace '\{\{CLIA\}\}',  $clia
  $c = $c -replace '\{\{SOT\}\}',   $sot

  # Fix photo src — if it's a URL keep as-is; if filename put in uploads path
  if ($photoVal -notmatch '^https?://') {
    $c = $c -replace 'agent-profile\.jpg', $photoVal
  } else {
    $c = $c -replace '../../images/uploads/agent-profile\.jpg', $photoVal
  }

  Set-Content $_.FullName $c -Encoding UTF8 -NoNewline
}

# ── If _agents MD had bio/specialties, write them into settings via SQL ───────
$bioSql = ''
$specSql = ''
if ($md) {
  if ($md['bio'])         { $bioSql  = $md['bio']  -replace "'", "''" }
  if ($md['specialties']) { $specSql = $md['specialties'] -replace "'", "''" }
}

# ── Rename template.html → slug.html inside the folder ───────────────────────
$innerTemplate = "$dest\template.html"
if (Test-Path $innerTemplate) {
  Rename-Item $innerTemplate "$dest\$slug.html"
}

# ── Create redirect shell at agents/slug.html ─────────────────────────────────
$shellContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=$slug/index.html" />
  <title>$fullName — PAC and GO Travel</title>
  <link rel="canonical" href="$slug/index.html" />
</head>
<body>
  <p>Redirecting to <a href="$slug/index.html">$fullName's page</a>…</p>
</body>
</html>
"@
Set-Content "$PSScriptRoot\agents\$slug.html" $shellContent -Encoding UTF8 -NoNewline
Write-Host "Created redirect shell: agents\$slug.html" -ForegroundColor Gray

# ── Add to deploy.ps1 ─────────────────────────────────────────────────────────
$deployFile    = "$PSScriptRoot\deploy.ps1"
$deployContent = Get-Content $deployFile -Raw -Encoding UTF8
$copyLine      = "    Copy-Item `"`$PSScriptRoot\agents\$slug`" `"`$dest\agents\`" -Recurse -Force"

if ($deployContent -notmatch [regex]::Escape("agents\$slug")) {
  $deployContent = $deployContent -replace `
    '(    Copy-Item "\$PSScriptRoot\\agents\\robert-traversi".*?-Force)', `
    "`$1`n$copyLine"
  Set-Content $deployFile $deployContent -Encoding UTF8 -NoNewline
  Write-Host "Added $slug to deploy.ps1." -ForegroundColor Gray
}

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Done! Mini-site created at: agents\$slug\" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Add $fullName to the admin agent switcher — open admin\index.html"
Write-Host "     and search for 'agentSwitcher', add:"
Write-Host "     <option value=`"$slug`">$fullName</option>" -ForegroundColor White
Write-Host ""
Write-Host "  2. Run this in the Supabase SQL Editor:" -ForegroundColor Yellow

$sql = "INSERT INTO settings (agent_id) VALUES ('$slug') ON CONFLICT (agent_id) DO NOTHING;"
if ($bioSql -or $specSql) {
  $updates = @()
  if ($bioSql)  { $updates += "bio = '$bioSql'" }
  if ($specSql) { $updates += "specialties = '$specSql'" }
  if ($photoVal -match '^https?://') { $updates += "photo_url = '$photoVal'" }
  if ($tagline) { $updates += "tagline = '$($tagline -replace "'","''")'" }
  $updateClause = $updates -join ", "
  $sql = "INSERT INTO settings (agent_id) VALUES ('$slug') ON CONFLICT (agent_id) DO UPDATE SET $updateClause;"
}
Write-Host "     $sql" -ForegroundColor White
Write-Host ""
Write-Host "  3. Open admin, go to Profile, and upload a photo / fill in bio." -ForegroundColor Yellow
Write-Host "  4. Edit specialties in agents\$slug\specialties.html" -ForegroundColor Yellow
Write-Host "  5. Run deploy.ps1 to publish." -ForegroundColor Yellow
Write-Host ""
