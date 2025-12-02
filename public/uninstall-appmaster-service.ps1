# AppMaster Service Uninstaller for Windows

param(
    [string]$InstallPath = "C:\Program Files\AppMaster"
)

$ErrorActionPreference = "Stop"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

Write-Host "===== AppMaster Service Uninstaller =====" -ForegroundColor Cyan
Write-Host ""

$nssmPath = "$InstallPath\nssm.exe"

# Check if service exists
$service = Get-Service -Name "AppMaster" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Stopping AppMaster service..." -ForegroundColor Yellow
    & $nssmPath stop AppMaster
    Start-Sleep -Seconds 2
    
    Write-Host "Removing AppMaster service..." -ForegroundColor Yellow
    & $nssmPath remove AppMaster confirm
    Write-Host "Service removed successfully" -ForegroundColor Green
} else {
    Write-Host "AppMaster service not found" -ForegroundColor Yellow
}

# Ask if user wants to remove installation directory
$response = Read-Host "`nRemove installation directory ($InstallPath)? This will delete all logs and configuration. (y/N)"
if ($response -eq 'y' -or $response -eq 'Y') {
    if (Test-Path $InstallPath) {
        Write-Host "Removing installation directory..." -ForegroundColor Yellow
        Remove-Item $InstallPath -Recurse -Force
        Write-Host "Installation directory removed" -ForegroundColor Green
    }
} else {
    Write-Host "Installation directory preserved at: $InstallPath" -ForegroundColor Cyan
}

Write-Host "`n===== Uninstallation Complete =====" -ForegroundColor Green
