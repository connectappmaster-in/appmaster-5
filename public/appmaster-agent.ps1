# AppMaster Agent - Windows PowerShell Service
# Version: 1.0.0

param(
    [string]$ConfigFile = "$PSScriptRoot\appmaster-config.json"
)

$ErrorActionPreference = "Continue"
$AgentVersion = "1.0.0"
$LogFile = "$PSScriptRoot\logs\appmaster-agent.log"
$QueueFile = "$PSScriptRoot\queue\pending-actions.json"
$TokenFile = "$PSScriptRoot\.token"

# Create required directories
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\logs" | Out-Null
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\queue" | Out-Null
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\scripts" | Out-Null

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logMessage
    Write-Host $logMessage
}

function Load-Config {
    if (Test-Path $ConfigFile) {
        $config = Get-Content $ConfigFile | ConvertFrom-Json
        return $config
    }
    throw "Configuration file not found: $ConfigFile"
}

function Load-Token {
    if (Test-Path $TokenFile) {
        return Get-Content $TokenFile -Raw
    }
    throw "Token file not found. Run installer first."
}

function Send-Heartbeat {
    param($Config, $Token, $CurrentTaskId = $null, $CurrentTaskStatus = $null)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        }
        
        $systemHealth = @{
            cpu_usage = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
            memory_usage = (Get-CimInstance Win32_OperatingSystem | ForEach-Object { 
                [math]::Round((($_.TotalVisibleMemorySize - $_.FreePhysicalMemory) / $_.TotalVisibleMemorySize) * 100, 2)
            })
            disk_usage = (Get-PSDrive C | ForEach-Object { 
                [math]::Round((($_.Used / ($_.Used + $_.Free)) * 100), 2)
            })
            uptime = ((Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime).TotalSeconds
        }
        
        $body = @{
            agent_version = $AgentVersion
            current_task_id = $CurrentTaskId
            current_task_status = $CurrentTaskStatus
            system_health = $systemHealth
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$($Config.api_url)/device-heartbeat" -Method Post -Headers $headers -Body $body -TimeoutSec 10
        Write-Log "Heartbeat sent successfully"
        return $response
    }
    catch {
        Write-Log "Failed to send heartbeat: $_" "ERROR"
        return $null
    }
}

function Get-PendingActions {
    param($Config, $Token)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
        }
        
        $response = Invoke-RestMethod -Uri "$($Config.api_url)/device-actions-pending" -Method Get -Headers $headers -TimeoutSec 10
        Write-Log "Retrieved $($response.actions.Count) pending actions"
        return $response.actions
    }
    catch {
        Write-Log "Failed to retrieve pending actions: $_" "ERROR"
        return @()
    }
}

function Submit-ActionResult {
    param($Config, $Token, $ActionId, $Status, $Result, $Stdout, $Stderr, $ExitCode)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        }
        
        $body = @{
            action_id = $ActionId
            status = $Status
            result = $Result
            stdout = $Stdout
            stderr = $Stderr
            exit_code = $ExitCode
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$($Config.api_url)/device-action-result" -Method Post -Headers $headers -Body $body -TimeoutSec 10
        Write-Log "Action result submitted: $ActionId - $Status"
    }
    catch {
        Write-Log "Failed to submit action result: $_" "ERROR"
    }
}

function Execute-Action {
    param($Config, $Token, $Action)
    
    Write-Log "Executing action: $($Action.action_type) (ID: $($Action.id))"
    
    $result = @{}
    $stdout = ""
    $stderr = ""
    $exitCode = 0
    $status = "completed"
    
    try {
        switch ($Action.action_type) {
            "run_script" {
                $scriptContent = $Action.action_payload.script_content
                $scriptPath = "$PSScriptRoot\scripts\temp-$($Action.id).ps1"
                Set-Content -Path $scriptPath -Value $scriptContent
                
                $output = & powershell.exe -ExecutionPolicy Bypass -File $scriptPath 2>&1
                $exitCode = $LASTEXITCODE
                $stdout = $output | Where-Object { $_ -is [string] } | Join-String -Separator "`n"
                $stderr = $output | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] } | Join-String -Separator "`n"
                
                Remove-Item $scriptPath -Force
            }
            
            "install_updates" {
                Write-Log "Installing Windows updates..."
                Install-Module -Name PSWindowsUpdate -Force -SkipPublisherCheck -ErrorAction SilentlyContinue
                Import-Module PSWindowsUpdate
                
                $updates = Get-WindowsUpdate -AcceptAll -Install -IgnoreReboot
                $result = @{
                    updates_installed = $updates.Count
                    reboot_required = (Get-WURebootStatus).RebootRequired
                }
                $stdout = $updates | ConvertTo-Json
            }
            
            "reboot" {
                Write-Log "Initiating reboot..."
                $delay = $Action.action_payload.delay_seconds ?? 60
                shutdown /r /t $delay /c "AppMaster scheduled reboot"
                $result = @{ reboot_scheduled = $true, delay_seconds = $delay }
            }
            
            "set_wallpaper" {
                $wallpaperUrl = $Action.action_payload.wallpaper_url
                $wallpaperPath = "$env:TEMP\appmaster-wallpaper.jpg"
                Invoke-WebRequest -Uri $wallpaperUrl -OutFile $wallpaperPath
                
                Add-Type -TypeDefinition @"
                    using System;
                    using System.Runtime.InteropServices;
                    public class Wallpaper {
                        [DllImport("user32.dll", CharSet = CharSet.Auto)]
                        public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
                    }
"@
                [Wallpaper]::SystemParametersInfo(0x0014, 0, $wallpaperPath, 0x0001 -bor 0x0002)
                $result = @{ wallpaper_set = $true }
            }
            
            "file_push" {
                $sourceUrl = $Action.action_payload.source_url
                $destination = $Action.action_payload.destination_path
                Invoke-WebRequest -Uri $sourceUrl -OutFile $destination
                $result = @{ file_pushed = $true, destination = $destination }
            }
            
            "service_control" {
                $serviceName = $Action.action_payload.service_name
                $operation = $Action.action_payload.operation
                
                switch ($operation) {
                    "start" { Start-Service $serviceName }
                    "stop" { Stop-Service $serviceName }
                    "restart" { Restart-Service $serviceName }
                }
                
                $service = Get-Service $serviceName
                $result = @{ service = $serviceName, status = $service.Status }
            }
            
            "mark_update_completed" {
                Write-Log "Marking monthly update as completed"
                $result = @{ marked_completed = $true, month = (Get-Date -Format "yyyy-MM") }
            }
            
            default {
                throw "Unknown action type: $($Action.action_type)"
            }
        }
    }
    catch {
        $status = "failed"
        $stderr = $_.Exception.Message
        $exitCode = 1
        Write-Log "Action failed: $_" "ERROR"
    }
    
    Submit-ActionResult -Config $Config -Token $Token -ActionId $Action.id -Status $status -Result $result -Stdout $stdout -Stderr $stderr -ExitCode $exitCode
}

function Main-Loop {
    Write-Log "AppMaster Agent v$AgentVersion starting..."
    
    $config = Load-Config
    $token = Load-Token
    
    Write-Log "Configuration loaded. API URL: $($config.api_url)"
    
    $lastHeartbeat = [DateTime]::MinValue
    $lastActionPoll = [DateTime]::MinValue
    $lastUpdateSync = [DateTime]::MinValue
    
    while ($true) {
        try {
            $now = Get-Date
            
            # Heartbeat every 60 seconds
            if (($now - $lastHeartbeat).TotalSeconds -ge 60) {
                Send-Heartbeat -Config $config -Token $token
                $lastHeartbeat = $now
            }
            
            # Poll for actions every 30 seconds
            if (($now - $lastActionPoll).TotalSeconds -ge 30) {
                $actions = Get-PendingActions -Config $config -Token $token
                
                foreach ($action in $actions) {
                    Execute-Action -Config $config -Token $token -Action $action
                }
                
                $lastActionPoll = $now
            }
            
            # Sync updates every hour
            if (($now - $lastUpdateSync).TotalHours -ge 1) {
                Write-Log "Running hourly update sync..."
                & "$PSScriptRoot\device-update-agent.ps1"
                $lastUpdateSync = $now
            }
            
            Start-Sleep -Seconds 5
        }
        catch {
            Write-Log "Error in main loop: $_" "ERROR"
            Start-Sleep -Seconds 30
        }
    }
}

# Start the agent
Write-Log "===== AppMaster Agent Starting ====="
Main-Loop
