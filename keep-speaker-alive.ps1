# Script to keep Bluetooth speaker connected
# Plays short audible tone to prevent auto-shutdown every 10 minutes

# Define interval first
[int]$interval = 10 * 60  # 10 minutes = 600 seconds

function Play-SilentTone {
    <#
    .SYNOPSIS
    Plays a short, quiet audio through actual audio output device
    #>
    
    try {
        # Create a temporary WAV file with audible tone
        $tempWav = [System.IO.Path]::GetTempFileName() + ".wav"
        
        # Generate WAV file with 2 seconds of quiet but audible audio
        $sampleRate = 44100  # Standard CD quality
        $duration = 2.0  # 2 seconds
        $samples = [int]($sampleRate * $duration)
        $amplitude = 5000  # Increased amplitude (was 10, now ~15% of max)
        
        $bytes = New-Object System.Collections.Generic.List[byte]
        
        # WAV header (44 bytes)
        $bytes.AddRange([byte[]]@(0x52, 0x49, 0x46, 0x46))  # "RIFF"
        $fileSize = 36 + $samples * 2
        $bytes.AddRange([System.BitConverter]::GetBytes([int]$fileSize))
        $bytes.AddRange([byte[]]@(0x57, 0x41, 0x56, 0x45))  # "WAVE"
        $bytes.AddRange([byte[]]@(0x66, 0x6D, 0x74, 0x20))  # "fmt "
        $bytes.AddRange([System.BitConverter]::GetBytes([int]16))  # fmt chunk size
        $bytes.AddRange([System.BitConverter]::GetBytes([Int16]1))  # PCM
        $bytes.AddRange([System.BitConverter]::GetBytes([Int16]1))  # Mono
        $bytes.AddRange([System.BitConverter]::GetBytes([int]$sampleRate))
        $bytes.AddRange([System.BitConverter]::GetBytes([int]($sampleRate * 2)))
        $bytes.AddRange([System.BitConverter]::GetBytes([Int16]2))  # Block align
        $bytes.AddRange([System.BitConverter]::GetBytes([Int16]16))  # 16-bit
        $bytes.AddRange([byte[]]@(0x64, 0x61, 0x74, 0x61))  # "data"
        $bytes.AddRange([System.BitConverter]::GetBytes([int]($samples * 2)))
        
        # Generate pleasant tone: 440Hz (A note) with fade in/out
        for ($i = 0; $i -lt $samples; $i++) {
            # Fade envelope: fade in first 0.1s, fade out last 0.1s
            $fadeInSamples = [int]($sampleRate * 0.1)
            $fadeOutStart = $samples - $fadeInSamples
            $envelope = 1.0
            
            if ($i -lt $fadeInSamples) {
                $envelope = $i / $fadeInSamples
            } elseif ($i -gt $fadeOutStart) {
                $envelope = ($samples - $i) / $fadeInSamples
            }
            
            # 440Hz sine wave (musical note A)
            $value = [int]($amplitude * $envelope * [Math]::Sin(2 * [Math]::PI * 440 * $i / $sampleRate))
            $bytes.AddRange([System.BitConverter]::GetBytes([Int16]$value))
        }
        
        # Write WAV file
        [System.IO.File]::WriteAllBytes($tempWav, $bytes.ToArray())
        
        # Use SoundPlayer (more reliable than WMPlayer)
        Add-Type -AssemblyName System.Windows.Forms
        $player = New-Object System.Media.SoundPlayer
        $player.SoundLocation = $tempWav
        $player.PlaySync()  # Play and wait for completion
        
        # Cleanup
        $player.Dispose()
        Remove-Item $tempWav -ErrorAction SilentlyContinue
        
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ✓ Keep-alive signal sent (2s, 440Hz tone)"
    }
    catch {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] ✗ Playback failed: $_" -ForegroundColor Red
    }
}

# Display script information
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Bluetooth Speaker Keep-Alive Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Interval: 10 minutes ($interval seconds)"
Write-Host "Audio signal: 440Hz tone (musical note A)"
Write-Host "Duration: 2 seconds with fade in/out"
Write-Host "Start time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Script is running... (Press Ctrl+C to stop)" -ForegroundColor Green
Write-Host ""

# Play once immediately as a test
Write-Host "🔊 Initial test playback (you should hear a quiet tone)..."
Play-SilentTone

while ($true) {
    # Wait for interval
    Start-Sleep -Seconds $interval
    
    # Play keep-alive audio
    Play-SilentTone
}
