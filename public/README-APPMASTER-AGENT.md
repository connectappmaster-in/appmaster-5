# AppMaster Agent - Installation & Usage Guide

## Overview

The **AppMaster** agent is a background service that runs on Windows (and optionally Linux) endpoints, providing:

- **Continuous connectivity** to the AppMaster dashboard
- **Automated action execution** (scripts, updates, reboots, etc.)
- **Real-time heartbeat** monitoring
- **Hourly update synchronization**
- **Secure token-based authentication**
- **Local queue with offline resilience**
- **Complete audit trail**

## Prerequisites

- **Windows 10/11 or Windows Server 2016+**
- **PowerShell 5.1+**
- **Administrator privileges**
- **Network access** to your AppMaster API endpoint
- **Device token** from AppMaster portal

## Quick Installation (Windows)

### Step 1: Download Agent Files

Download these files from your AppMaster portal or repository:
- `install-appmaster-service.ps1`
- `appmaster-agent.ps1`
- `device-update-agent.ps1`

### Step 2: Run Installer as Administrator

```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force

# Navigate to download directory
cd C:\Downloads

# Run installer
.\install-appmaster-service.ps1
```

### Step 3: Provide Configuration

The installer will prompt for:

1. **API URL**: Your AppMaster Supabase function URL
   ```
   Example: https://zxtpfrgsfuiwdppgiliv.supabase.co/functions/v1
   ```

2. **Device Token**: Unique token from portal (generate in Settings > Devices)

### Step 4: Verify Installation

```powershell
# Check service status
Get-Service AppMaster

# View recent logs
Get-Content "C:\Program Files\AppMaster\logs\appmaster-agent.log" -Tail 20
```

## Service Management

### Start/Stop Service
```powershell
Start-Service AppMaster
Stop-Service AppMaster
Restart-Service AppMaster
```

### View Service Status
```powershell
Get-Service AppMaster | Format-List *
```

### View Live Logs
```powershell
Get-Content "C:\Program Files\AppMaster\logs\appmaster-agent.log" -Wait
```

## Uninstallation

```powershell
# Run uninstaller as Administrator
.\uninstall-appmaster-service.ps1
```

This will:
1. Stop the AppMaster service
2. Remove the Windows service
3. Optionally remove installation directory

## How It Works

### Agent Lifecycle

1. **Service starts** at system boot
2. **Loads configuration** and device token
3. **Main loop** begins:
   - **Every 60 seconds**: Send heartbeat with system health
   - **Every 30 seconds**: Poll for pending actions
   - **Every hour**: Sync Windows updates status
4. **Executes actions** as they arrive from portal
5. **Reports results** back to server
6. **Auto-restart** on failure

### Supported Actions

| Action | Description |
|--------|-------------|
| `run_script` | Execute PowerShell script |
| `install_updates` | Install Windows updates |
| `reboot` | Scheduled system reboot |
| `set_wallpaper` | Set desktop wallpaper |
| `file_push` | Download file to endpoint |
| `file_pull` | Upload file from endpoint |
| `service_control` | Start/stop/restart services |
| `mark_update_completed` | Monthly update completion flag |

### Security Features

- **Token-based auth**: Unique per-device tokens with expiration
- **TLS enforced**: All communication over HTTPS
- **Secure token storage**: Protected with Windows ACLs
- **Script sandboxing**: Timeout limits and allowlists
- **Audit logging**: Every action logged with initiator
- **Approval workflows**: High-risk actions require approval

## File Locations

```
C:\Program Files\AppMaster\
├── appmaster-agent.ps1          # Main agent script
├── device-update-agent.ps1      # Update sync script
├── appmaster-config.json        # Configuration
├── .token                       # Device token (secured)
├── nssm.exe                     # Service wrapper
├── logs\
│   ├── appmaster-agent.log     # Agent logs
│   ├── service-stdout.log      # Service stdout
│   └── service-stderr.log      # Service stderr
├── queue\
│   └── pending-actions.json    # Offline queue
└── scripts\                    # Temporary script execution
```

## Configuration File

`appmaster-config.json`:
```json
{
  "api_url": "https://your-project.supabase.co/functions/v1",
  "poll_interval": 30,
  "heartbeat_interval": 60,
  "update_sync_interval": 3600
}
```

## Troubleshooting

### Service Won't Start

1. Check logs: `C:\Program Files\AppMaster\logs\service-stderr.log`
2. Verify token file exists and is readable
3. Test network connectivity to API URL
4. Ensure PowerShell execution policy allows scripts

### No Heartbeat in Dashboard

1. Verify API URL is correct
2. Check device token hasn't expired
3. Test manual heartbeat:
   ```powershell
   cd "C:\Program Files\AppMaster"
   .\appmaster-agent.ps1 -TestHeartbeat
   ```

### Actions Not Executing

1. Check action status in portal
2. Review agent logs for errors
3. Verify device token has required permissions
4. Check if actions require approval

### High CPU Usage

1. Review recent actions in logs
2. Check for stuck script execution
3. Restart service:
   ```powershell
   Restart-Service AppMaster
   ```

## Advanced Configuration

### Custom Installation Path

```powershell
.\install-appmaster-service.ps1 -InstallPath "D:\AppMaster"
```

### Manual Token Update

```powershell
$newToken = "your-new-token-here"
$tokenPath = "C:\Program Files\AppMaster\.token"
$newToken | Out-File -FilePath $tokenPath -NoNewline

# Restart service to apply
Restart-Service AppMaster
```

### Enable Debug Logging

Edit `appmaster-agent.ps1` and set:
```powershell
$DebugPreference = "Continue"
```

## Linux Installation (Optional)

### SystemD Unit File

Create `/etc/systemd/system/appmaster.service`:

```ini
[Unit]
Description=AppMaster Agent
After=network.target

[Service]
Type=simple
User=appmaster
ExecStart=/usr/local/bin/appmaster-agent.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable appmaster
sudo systemctl start appmaster
sudo systemctl status appmaster
```

## Support

For issues or questions:
- Check logs first
- Review troubleshooting section
- Contact your AppMaster administrator
- Submit ticket in portal

## Version History

- **1.0.0** - Initial release
  - Windows service support
  - Core action types
  - Heartbeat and polling
  - Secure token management
