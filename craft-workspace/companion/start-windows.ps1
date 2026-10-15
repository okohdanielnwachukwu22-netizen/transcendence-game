$ErrorActionPreference = "Stop"
$ConfigPath = Join-Path $PSScriptRoot "config.ps1"
if (Test-Path $ConfigPath) {
  . $ConfigPath
} else {
  Write-Host "Missing companion/config.ps1. Copy config.ps1.example to config.ps1 and edit the paths in Notepad." -ForegroundColor Yellow
  Read-Host "Press Enter to exit"
  exit 1
}
$ReadRoot = $env:CRAFT_PHOTOCRAFT_READ_ROOT
if ([string]::IsNullOrWhiteSpace($ReadRoot) -or !(Test-Path $ReadRoot -PathType Container)) {
  Write-Host "Create the approved read folder first, then set CRAFT_PHOTOCRAFT_READ_ROOT in config.ps1." -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}
node (Join-Path $PSScriptRoot "server.mjs")
if ($LASTEXITCODE -ne 0) {
  Read-Host "Companion exited. Press Enter to close"
}
