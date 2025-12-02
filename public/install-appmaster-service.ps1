# AppMaster Service Installer for Windows
# Installs the AppMaster agent as a Windows service using NSSM

param(
    [string]$InstallPath = "C:\Program Files\AppMaster",
    [string]$ApiUrl = "",
    [string]$DeviceToken = ""
)

$ErrorActionPreference = "Stop"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

Write-Host "===== AppMaster Service Installer =====" -ForegroundColor Cyan
Write-Host ""

# Prompt for required information if not provided
if ([string]::IsNullOrEmpty($ApiUrl)) {
    $ApiUrl = Read-Host "Enter AppMaster API URL (e.g., https://your-project.supabase.co/functions/v1)"
}

if ([string]::IsNullOrEmpty($DeviceToken)) {
    $DeviceToken = Read-Host "Enter Device Token" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DeviceToken)
    $DeviceToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

Write-Host "`nInstalling AppMaster to: $InstallPath" -ForegroundColor Green

# Create installation directory
New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
New-Item -ItemType Directory -Force -Path "$InstallPath\logs" | Out-Null
New-Item -ItemType Directory -Force -Path "$InstallPath\queue" | Out-Null
New-Item -ItemType Directory -Force -Path "$InstallPath\scripts" | Out-Null

# Download NSSM if not exists
$nssmPath = "$InstallPath\nssm.exe"
if (-not (Test-Path $nssmPath)) {
    Write-Host "Downloading NSSM..." -ForegroundColor Yellow
    $nssmUrl = "https://nssm.cc/ci/nssm-2.24-101-g897c7ad.zip"
    $nssmZip = "$env:TEMP\nssm.zip"
    Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip
    Expand-Archive -Path $nssmZip -DestinationPath "$env:TEMP\nssm" -Force
    
    # Copy appropriate architecture version
    $arch = if ([Environment]::Is64BitOperatingSystem) { "win64" } else { "win32" }
    Copy-Item "$env:TEMP\nssm\nssm-2.24-101-g897c7ad\$arch\nssm.exe" -Destination $nssmPath
    
    Remove-Item "$env:TEMP\nssm" -Recurse -Force
    Remove-Item $nssmZip -Force
}

# Copy agent script
$scriptSource = "$PSScriptRoot\appmaster-agent.ps1"
if (Test-Path $scriptSource) {
    Copy-Item $scriptSource -Destination "$InstallPath\appmaster-agent.ps1" -Force
} else {
    Write-Error "appmaster-agent.ps1 not found in current directory"
    exit 1
}

# Copy device-update-agent script
$updateAgentSource = "$PSScriptRoot\device-update-agent.ps1"
if (Test-Path $updateAgentSource) {
    Copy-Item $updateAgentSource -Destination "$InstallPath\device-update-agent.ps1" -Force
}

# Create configuration file
$config = @{
    api_url = $ApiUrl
    poll_interval = 30
    heartbeat_interval = 60
    update_sync_interval = 3600
} | ConvertTo-Json

Set-Content -Path "$InstallPath\appmaster-config.json" -Value $config

# Store device token securely
$DeviceToken | Out-File -FilePath "$InstallPath\.token" -NoNewline

# Set appropriate ACLs (only SYSTEM and Administrators can read)
$acl = Get-Acl "$InstallPath\.token"
$acl.SetAccessRuleProtection($true, $false)
$acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) }

$systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule("SYSTEM", "FullControl", "Allow")
$adminRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "FullControl", "Allow")

$acl.AddAccessRule($systemRule)
$acl.AddAccessRule($adminRule)
Set-Acl "$InstallPath\.token" $acl

Write-Host "Configuration and token stored securely" -ForegroundColor Green

# Check if service already exists
$existingService = Get-Service -Name "AppMaster" -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Removing existing AppMaster service..." -ForegroundColor Yellow
    & $nssmPath stop AppMaster
    & $nssmPath remove AppMaster confirm
    Start-Sleep -Seconds 2
}

# Install service
Write-Host "Installing AppMaster service..." -ForegroundColor Green
& $nssmPath install AppMaster "powershell.exe" "-ExecutionPolicy Bypass -NoProfile -File `"$InstallPath\appmaster-agent.ps1`""

# Configure service
& $nssmPath set AppMaster AppDirectory "$InstallPath"
& $nssmPath set AppMaster DisplayName "AppMaster Agent"
& $nssmPath set AppMaster Description "AppMaster device management and update automation agent"
& $nssmPath set AppMaster Start SERVICE_AUTO_START
& $nssmPath set AppMaster AppStdout "$InstallPath\logs\service-stdout.log"
& $nssmPath set AppMaster AppStderr "$InstallPath\logs\service-stderr.log"
& $nssmPath set AppMaster AppRotateFiles 1
& $nssmPath set AppMaster AppRotateOnline 1
& $nssmPath set AppMaster AppRotateBytes 10485760
& $nssmPath set AppMaster ObjectName "LocalSystem"

# Set failure actions (restart on failure)
& $nssmPath set AppMaster AppExit Default Restart
& $nssmPath set AppMaster AppRestartDelay 5000

Write-Host "Starting AppMaster service..." -ForegroundColor Green
& $nssmPath start AppMaster

Start-Sleep -Seconds 3

# Verify service is running
$service = Get-Service -Name "AppMaster"
if ($service.Status -eq "Running") {
    Write-Host "`n===== Installation Complete! =====" -ForegroundColor Green
    Write-Host "AppMaster service is now running" -ForegroundColor Green
    Write-Host "Service will start automatically at system boot" -ForegroundColor Green
    Write-Host "`nService Management:" -ForegroundColor Cyan
    Write-Host "  View Status:  Get-Service AppMaster" -ForegroundColor White
    Write-Host "  Stop Service: Stop-Service AppMaster" -ForegroundColor White
    Write-Host "  Start Service: Start-Service AppMaster" -ForegroundColor White
    Write-Host "  View Logs:    Get-Content '$InstallPath\logs\appmaster-agent.log' -Tail 50" -ForegroundColor White
} else {
    Write-Error "Service failed to start. Check logs at: $InstallPath\logs\"
    exit 1
}
