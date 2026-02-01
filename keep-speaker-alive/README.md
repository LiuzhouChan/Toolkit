# Keep Speaker Alive

Prevents Bluetooth speakers from auto-disconnecting due to inactivity by playing a quiet tone every 10 minutes.

## Features

- 🔊 Plays a subtle 440Hz tone (musical note A) every 10 minutes
- 🎵 2-second duration with smooth fade in/out
- 🔇 Runs completely hidden in background (no console window)
- 🚀 Auto-starts when Windows boots
- 💻 Minimal resource usage

## Files

- `keep-speaker-alive.ps1` - Main PowerShell script that plays the keep-alive tone
- `keep-speaker-alive-launcher.vbs` - VBScript launcher that runs PowerShell hidden in background

## Installation

### Manual Installation

1. **Create startup shortcut:**
   ```powershell
   # Get the current script directory
   $scriptDir = Split-Path -Parent $PSCommandPath
   if (-not $scriptDir) {
       $scriptDir = Get-Location
   }
   
   $WshShell = New-Object -ComObject WScript.Shell
   $Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\keep-speaker-alive.lnk")
   $Shortcut.TargetPath = Join-Path $scriptDir "keep-speaker-alive-launcher.vbs"
   $Shortcut.WorkingDirectory = $scriptDir
   $Shortcut.WindowStyle = 1
   $Shortcut.Description = "Keep Bluetooth Speaker Alive"
   $Shortcut.Save()
   Write-Host "Startup shortcut created successfully!" -ForegroundColor Green
   ```
   
   Run this from the `keep-speaker-alive` folder, or it will auto-detect the current directory.

2. **Verify installation:**
   - The shortcut will appear in: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`
   - Script will auto-start on next Windows boot

### AI Agent Installation

To install using an AI agent, use this prompt:

```
Install the keep-speaker-alive script to run at Windows startup. Follow these steps:

1. Create a startup shortcut that points to keep-speaker-alive-launcher.vbs
2. Set the working directory to the keep-speaker-alive folder
3. Verify the shortcut was created in the Windows Startup folder
4. Test by launching the VBS file manually
```

The agent will:
- Generate the necessary PowerShell commands
- Create the startup shortcut automatically
- Verify the installation

## Usage

### Start Manually

To test or start manually:
```powershell
# Run visible (for testing)
powershell.exe -ExecutionPolicy Bypass -File "keep-speaker-alive.ps1"

# Run hidden (production)
cscript.exe "keep-speaker-alive-launcher.vbs"
```

### Stop the Script

To stop the background script:
```powershell
# Find the process
Get-Process | Where-Object { 
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    $cmdLine -like "*keep-speaker-alive.ps1*"
} | Stop-Process
```

### Check if Running

```powershell
# Check for running process
Get-Process | Where-Object { 
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    $cmdLine -like "*keep-speaker-alive.ps1*"
} | Select-Object Id, ProcessName
```

## Configuration

Edit `keep-speaker-alive.ps1` to customize:

- **Interval**: Line 5 - Change `10 * 60` (10 minutes in seconds)
- **Frequency**: Line 55 - Change `440` (Hz, current is note A)
- **Duration**: Line 19 - Change `2.0` (seconds)
- **Volume**: Line 21 - Change `5000` (amplitude, range 0-32767)

## Uninstallation

1. **Remove startup shortcut:**
   ```powershell
   Remove-Item "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\keep-speaker-alive.lnk"
   ```

2. **Stop running process:**
   ```powershell
   Get-Process | Where-Object { 
       $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
       $cmdLine -like "*keep-speaker-alive.ps1*"
   } | Stop-Process
   ```

## Troubleshooting

### No sound playing
- Check if your Bluetooth speaker is connected and set as default audio device
- Test by running the script visibly to see error messages
- Verify audio isn't muted in Windows

### Script not starting at boot
- Check if shortcut exists in Startup folder
- Verify the shortcut's Target path points to the correct VBS file location
- Ensure the Working Directory is set correctly

### High CPU usage
- This shouldn't happen with the current implementation
- If it does, check Task Manager for multiple instances running
- Kill all instances and restart

## How It Works

1. The VBScript launcher starts PowerShell with `-WindowStyle Hidden` flag
2. PowerShell script generates a WAV file in memory with a 440Hz sine wave
3. The WAV file is written to a temporary location
4. `System.Media.SoundPlayer` plays the audio through the default device
5. Temporary file is cleaned up
6. Script sleeps for 10 minutes, then repeats

## Requirements

- Windows 10/11
- PowerShell 5.1 or later (pre-installed on Windows)
- No additional dependencies required
