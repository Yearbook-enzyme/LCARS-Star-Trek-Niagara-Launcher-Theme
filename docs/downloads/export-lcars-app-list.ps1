param(
  [string]$Output = "lcars-launchable-components.txt"
)

$ErrorActionPreference = "Stop"

$Raw = $Output -replace "\.txt$", "-raw-query.txt"
$Packages = $Output -replace "\.txt$", "-packages.txt"

$adb = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adb) {
  Write-Host "adb was not found. Install Android platform-tools first."
  exit 1
}

adb start-server | Out-Null

$devices = adb devices | Select-String "`tdevice$"
if ($devices.Count -eq 0) {
  Write-Host "No authorized Android device found."
  Write-Host "Connect your phone, enable USB debugging, and accept the authorization prompt."
  exit 1
}

if ($devices.Count -gt 1) {
  Write-Host "More than one Android device is connected."
  Write-Host "Disconnect extras or set ANDROID_SERIAL before running this script."
  adb devices
  exit 1
}

$rawText = adb shell cmd package query-activities --brief -a android.intent.action.MAIN -c android.intent.category.LAUNCHER
$rawText = $rawText -replace "`r", ""
$rawText | Set-Content -Encoding UTF8 $Raw

$components = New-Object System.Collections.Generic.List[string]
$regex = [regex]'[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+/[^\s\}]+'

foreach ($line in $rawText -split "`n") {
  $match = $regex.Match($line)
  if (-not $match.Success) {
    continue
  }

  $component = $match.Value.Trim().TrimEnd(",", "}")
  $parts = $component.Split("/", 2)
  if ($parts.Count -ne 2) {
    continue
  }

  $pkg = $parts[0]
  $activity = $parts[1]

  if ($activity.StartsWith(".")) {
    $activity = "$pkg$activity"
  }

  $components.Add("$pkg/$activity")
}

$unique = $components | Sort-Object -Unique
$unique | Set-Content -Encoding UTF8 $Output
$unique | ForEach-Object { ($_ -split "/", 2)[0] } | Sort-Object -Unique | Set-Content -Encoding UTF8 $Packages

Write-Host ""
Write-Host "Created LCARS app list:"
Write-Host $Output
Write-Host ""
Write-Host "Launcher components found: $($unique.Count)"
Write-Host ""
Write-Host "Also created:"
Write-Host $Packages
Write-Host $Raw
Write-Host ""
Write-Host "Preview:"
$unique | Select-Object -First 30
