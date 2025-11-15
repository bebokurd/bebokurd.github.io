# ============================================================================
# IDM Activation Script (IAS) - PowerShell Launcher
# ============================================================================
# Check the instructions here on how to use it:
# https://github.com/lstprjct/IDM-Activation-Script/wiki
# ============================================================================

# Set error handling
$ErrorActionPreference = "Stop"

# Clear screen for better presentation
Clear-Host

# Set console window title
$Host.UI.RawUI.WindowTitle = "IDM Activation Script - Launcher v1.2"

# Function to display colored output with optional background
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White",
        [string]$BackgroundColor = "Black",
        [switch]$NoNewline
    )
    if ($NoNewline) {
        Write-Host $Message -NoNewline -ForegroundColor $ForegroundColor -BackgroundColor $BackgroundColor
    } else {
        Write-Host $Message -ForegroundColor $ForegroundColor -BackgroundColor $BackgroundColor
    }
}

# Function to display animated loading spinner
function Show-Spinner {
    param(
        [string]$Message,
        [int]$Duration = 500
    )
    $spinner = @('|', '/', '-', '\')
    $endTime = (Get-Date).AddMilliseconds($Duration)
    $index = 0
    
    while ((Get-Date) -lt $endTime) {
        $currentSpinner = $spinner[$index % $spinner.Length]
        Write-Host "`r[$currentSpinner] $Message" -NoNewline -ForegroundColor "Cyan"
        Start-Sleep -Milliseconds 100
        $index++
    }
    Write-Host ""
}

# Function to display beautiful header with ASCII art
function Show-Header {
    Write-Host ""
    Write-ColorOutput "╔═══════════════════════════════════════════════════════════════════════════╗" "Cyan"
    Write-ColorOutput "║                                                                           ║" "Cyan"
    Write-ColorOutput "║" -NoNewline "Cyan"
    Write-ColorOutput "     ██╗██████╗ ███╗   ███╗      █████╗  ██████╗████████╗██╗██╗   ██╗      " -NoNewline "Magenta"
    Write-ColorOutput "║" "Cyan"
    Write-ColorOutput "║" -NoNewline "Cyan"
    Write-ColorOutput "     ██║██╔══██╗████╗ ████║     ██╔══██╗██╔════╝╚══██╔══╝██║██║   ██║      " -NoNewline "Magenta"
    Write-ColorOutput "║" "Cyan"
    Write-ColorOutput "║" -NoNewline "Cyan"
    Write-ColorOutput "     ██║██║  ██║██╔████╔██║     ███████║██║        ██║   ██║██║   ██║      " -NoNewline "Magenta"
    Write-ColorOutput "║" "Cyan"
    Write-ColorOutput "║" -NoNewline "Cyan"
    Write-ColorOutput "     ██║██║  ██║██║╚██╔╝██║     ██╔══██║██║        ██║   ██║██║   ██║      " -NoNewline "Magenta"
    Write-ColorOutput "║" "Cyan"
    Write-ColorOutput "║" -NoNewline "Cyan"
    Write-ColorOutput "     ██║██████╔╝██║ ╚═╝ ██║     ██║  ██║╚██████╗   ██║   ██║╚██████╔╝      " -NoNewline "Magenta"
    Write-ColorOutput "║" "Cyan"
    Write-ColorOutput "║" -NoNewline "Cyan"
    Write-ColorOutput "     ╚═╝╚═════╝ ╚═╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝       " -NoNewline "Magenta"
    Write-ColorOutput "║" "Cyan"
    Write-ColorOutput "║                                                                           ║" "Cyan"
    Write-ColorOutput "║" -NoNewline "Cyan"
    Write-ColorOutput "                    Activation Script - Launcher v1.2                      " -NoNewline "Yellow"
    Write-ColorOutput "║" "Cyan"
    Write-ColorOutput "║                                                                           ║" "Cyan"
    Write-ColorOutput "╚═══════════════════════════════════════════════════════════════════════════╝" "Cyan"
    Write-Host ""
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "DarkGray"
    Write-Host ""
}

# Function to display progress with animated spinner
function Show-Progress {
    param(
        [string]$Message,
        [int]$Percent = -1,
        [switch]$NoSpinner
    )
    if (-not $NoSpinner) {
        Show-Spinner $Message 300
    }
    if ($Percent -ge 0) {
        Write-ColorOutput "  [$Percent%] $Message" "Yellow"
        Write-Log "INFO" "Progress: [$Percent%] $Message"
    } else {
        Write-ColorOutput "  [*] $Message" "Yellow"
        Write-Log "INFO" "Progress: $Message"
    }
}

# Function to display success message with icon
function Show-Success {
    param([string]$Message)
    Write-ColorOutput "  [✓] $Message" "Green"
    Write-Log "SUCCESS" $Message
}

# Function to display error message with icon
function Show-Error {
    param([string]$Message, [string]$Exception = "")
    Write-ColorOutput "  [✗] $Message" "Red"
    Write-Log "ERROR" $Message $Exception
}

# Function to display info message
function Show-Info {
    param([string]$Message)
    Write-ColorOutput "  [i] $Message" "Cyan"
    Write-Log "INFO" $Message
}

# Function to display warning message
function Show-Warning {
    param([string]$Message)
    Write-ColorOutput "  [!] $Message" "Yellow"
    Write-Log "WARNING" $Message
}

# Function to draw a separator line
function Show-Separator {
    param([string]$Color = "DarkGray")
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $Color
}

# Function to display section header
function Show-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "  ▶ $Title" "Cyan" "Black"
    Write-Host ""
    Write-Log "INFO" "Section: $Title"
}

# Function to download and play audio file asynchronously
function Start-AudioPlayback {
    param([string]$AudioUrl, [string]$AudioPath, [string]$LogFilePath)
    
    try {
        if ($LogFilePath) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
            $logEntry = "[$timestamp] [INFO] Downloading audio file from: $AudioUrl"
            Add-Content -Path $LogFilePath -Value $logEntry -ErrorAction SilentlyContinue
        }
        
        # Download audio file
        try {
            Invoke-WebRequest -Uri $AudioUrl -UseBasicParsing -OutFile $AudioPath -ErrorAction Stop | Out-Null
        } catch {
            # Try alternative download method if first fails
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($AudioUrl, $AudioPath)
            $webClient.Dispose()
        }
        
        if (-not (Test-Path $AudioPath)) {
            throw "Audio file was not downloaded successfully"
        }
        
        if ($LogFilePath) {
            $fileSize = (Get-Item $AudioPath).Length / 1KB
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
            $logEntry = "[$timestamp] [INFO] Audio file downloaded: $([math]::Round($fileSize, 2)) KB"
            Add-Content -Path $LogFilePath -Value $logEntry -ErrorAction SilentlyContinue
        }
        
        # Play audio using Windows Media Player COM object
        $mediaPlayer = New-Object -ComObject WMPlayer.OCX
        $mediaPlayer.URL = $AudioPath
        $mediaPlayer.settings.volume = 70
        $mediaPlayer.settings.autoStart = $true
        $mediaPlayer.settings.mute = $false
        $mediaPlayer.controls.play()
        
        if ($LogFilePath) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
            $logEntry = "[$timestamp] [INFO] Audio playback started"
            Add-Content -Path $LogFilePath -Value $logEntry -ErrorAction SilentlyContinue
        }
        
        # Keep player alive and return it
        return $mediaPlayer
    } catch {
        $errorMsg = $_.Exception.Message
        if ($LogFilePath) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
            $logEntry = "[$timestamp] [WARNING] Audio playback error: $errorMsg"
            Add-Content -Path $LogFilePath -Value $logEntry -ErrorAction SilentlyContinue
        }
        return $null
    }
}

# ============================================================================
# Logging System
# ============================================================================

# Check admin privileges first (needed for log file path)
$isAdmin = [bool]([Security.Principal.WindowsIdentity]::GetCurrent().Groups -match 'S-1-5-32-544')

# Create log file path
$LogFileName = "IAS_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$LogFilePath = if ($isAdmin) { 
    "$env:SystemRoot\Temp\$LogFileName" 
} else { 
    "$env:TEMP\$LogFileName" 
}

# Function to write log entries
function Write-Log {
    param(
        [string]$Level,
        [string]$Message,
        [string]$Exception = ""
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    if ($Exception) {
        $logEntry += " | Exception: $Exception"
    }
    
    # Write to log file
    try {
        Add-Content -Path $LogFilePath -Value $logEntry -ErrorAction SilentlyContinue
    } catch {
        # If logging fails, continue silently
    }
    
    # Also write to console for errors and warnings
    if ($Level -eq "ERROR") {
        Write-ColorOutput $logEntry "Red"
    } elseif ($Level -eq "WARNING") {
        Write-ColorOutput $logEntry "Yellow"
    }
}

# Initialize log file
try {
    $logHeader = @"
================================================================================
IDM Activation Script (IAS) - PowerShell Launcher v1.2
Log File Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Computer Name: $env:COMPUTERNAME
User: $env:USERNAME
OS Version: $([System.Environment]::OSVersion.VersionString)
PowerShell Version: $($PSVersionTable.PSVersion)
================================================================================

"@
    Set-Content -Path $LogFilePath -Value $logHeader -ErrorAction Stop
    Write-Log "INFO" "Logging system initialized"
    Write-Log "INFO" "Log file location: $LogFilePath"
} catch {
    # If log file creation fails, continue without logging
    $LogFilePath = $null
}

# Display header
Show-Header

# URLs Configuration
$DiscordURL = 'https://discord.gg/qFQaJqv79r'
$CHYAProfileURL = 'https://bebokurd.github.io/'
$AudioURL = 'https://r2.guns.lol/cb3828fe-a491-44bb-a4ef-cb70c9e628b6.mp3'

# Download URL
$DownloadURL = 'https://raw.githubusercontent.com/lstprjct/IDM-Activation-Script/main/IAS.cmd'

# Auto-play audio in background (non-blocking)
$global:AudioPlayer = $null
$global:AudioFilePath = if ($isAdmin) { 
    "$env:SystemRoot\Temp\IAS_Audio.mp3" 
} else { 
    "$env:TEMP\IAS_Audio.mp3" 
}

# Start audio playback asynchronously using runspace pool
try {
    if ($LogFilePath) {
        Write-Log "INFO" "Starting audio playback from: $AudioURL"
    }
    
    # Create runspace for audio playback (allows COM objects)
    $runspacePool = [RunspaceFactory]::CreateRunspacePool(1, 1)
    $runspacePool.ApartmentState = [System.Threading.ApartmentState]::STA
    $runspacePool.Open()
    
    $ps = [PowerShell]::Create()
    $ps.RunspacePool = $runspacePool
    
    # Add script to download and play audio
    [void]$ps.AddScript({
        param($AudioUrl, $AudioPath, $LogFilePath)
        
        function Write-Log-Audio {
            param([string]$Level, [string]$Message)
            if ($LogFilePath) {
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
                $logEntry = "[$timestamp] [$Level] $Message"
                try {
                    Add-Content -Path $LogFilePath -Value $logEntry -ErrorAction SilentlyContinue
                } catch {}
            }
        }
        
        try {
            Write-Log-Audio "INFO" "Downloading audio file from: $AudioUrl"
            
            # Download audio file
            try {
                Invoke-WebRequest -Uri $AudioUrl -UseBasicParsing -OutFile $AudioPath -ErrorAction Stop | Out-Null
            } catch {
                $webClient = New-Object System.Net.WebClient
                $webClient.DownloadFile($AudioUrl, $AudioPath)
                $webClient.Dispose()
            }
            
            if (Test-Path $AudioPath) {
                $fileSize = (Get-Item $AudioPath).Length / 1KB
                Write-Log-Audio "INFO" "Audio file downloaded: $([math]::Round($fileSize, 2)) KB"
                
                # Play audio using Windows Media Player COM object
                $mediaPlayer = New-Object -ComObject WMPlayer.OCX
                $mediaPlayer.URL = $AudioPath
                $mediaPlayer.settings.volume = 70
                $mediaPlayer.settings.autoStart = $true
                $mediaPlayer.settings.mute = $false
                $mediaPlayer.controls.play()
                
                Write-Log-Audio "INFO" "Audio playback started"
                
                # Keep player alive - return it
                return $mediaPlayer
            }
        } catch {
            Write-Log-Audio "WARNING" "Audio playback error: $($_.Exception.Message)"
            return $null
        }
    }).AddArgument($AudioURL).AddArgument($global:AudioFilePath).AddArgument($LogFilePath)
    
    # Invoke asynchronously (non-blocking)
    $handle = $ps.BeginInvoke()
    
    # Store handles for cleanup
    $global:AudioJobHandle = $handle
    $global:AudioPowerShell = $ps
    $global:AudioRunspacePool = $runspacePool
    
    # Try to get result if already completed (non-blocking check)
    if ($handle.IsCompleted) {
        try {
            $global:AudioPlayer = $ps.EndInvoke($handle)
            if ($LogFilePath) {
                if ($global:AudioPlayer) {
                    Write-Log "INFO" "Audio playback started successfully"
                } else {
                    Write-Log "WARNING" "Audio playback failed to start"
                }
            }
        } catch {
            if ($LogFilePath) {
                Write-Log "WARNING" "Error getting audio player result: $($_.Exception.Message)"
            }
        }
    }
    
    if ($LogFilePath) {
        Write-Log "INFO" "Audio playback initiated in background"
    }
} catch {
    if ($LogFilePath) {
        Write-Log "WARNING" "Audio playback initialization error: $($_.Exception.Message)"
    }
}

# ============================================================================
# Initialization Phase
# ============================================================================
Show-Section "Initialization"

# Enable TLSv1.2 for compatibility with older clients
Show-Progress "Configuring security protocols..." -NoSpinner
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
Start-Sleep -Milliseconds 200
Show-Success "Security protocols configured"
Write-Log "INFO" "TLS 1.2 protocol enabled"

# Generate random number for file naming
Show-Progress "Preparing environment..." -NoSpinner
$rand = Get-Random -Maximum 99999999
Start-Sleep -Milliseconds 150
Write-Log "INFO" "Generated random identifier: $rand"

# Set file path (isAdmin was already checked in logging section)
$FilePath = if ($isAdmin) { 
    "$env:SystemRoot\Temp\IAS_$rand.cmd" 
} else { 
    "$env:TEMP\IAS_$rand.cmd" 
}

if ($isAdmin) {
    Show-Info "Running with administrator privileges"
    Write-Log "INFO" "Running with administrator privileges"
} else {
    Show-Warning "Running without administrator privileges (may require elevation)"
    Write-Log "WARNING" "Running without administrator privileges"
}

Show-Success "Environment prepared successfully"
Write-Log "INFO" "Script file will be saved to: $FilePath"
Write-Host ""

# ============================================================================
# Download Phase
# ============================================================================
Show-Section "Download & Setup"

# Download script
Show-Progress "Downloading IDM Activation Script from GitHub..." -NoSpinner
try {
    $response = Invoke-WebRequest -Uri $DownloadURL -UseBasicParsing -ErrorAction Stop
    $fileSize = [math]::Round($response.Content.Length/1KB, 2)
    Show-Success "Script downloaded successfully ($fileSize KB)"
    Write-Log "INFO" "Downloaded script size: $fileSize KB from $DownloadURL"
} catch {
    $errorMsg = $_.Exception.Message
    $errorFull = $_.Exception.ToString()
    Show-Error "Failed to download script from primary URL" $errorFull
    Write-ColorOutput "     Error Details: $errorMsg" "Red"
    Write-Host ""
    Show-Separator "Red"
    Write-ColorOutput "  Please check your internet connection and try again." "Yellow"
    Write-Host ""
    Write-ColorOutput "  Press any key to exit..." "Yellow"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Prepare script content
Show-Progress "Preparing script file..." -NoSpinner
$ScriptArgs = "$args "
$prefix = "@REM $rand `r`n"
$content = $prefix + $response.Content

try {
    Set-Content -Path $FilePath -Value $content -ErrorAction Stop
    Show-Success "Script file prepared successfully"
    Write-Log "INFO" "Script file created at: $FilePath"
} catch {
    $errorMsg = $_.Exception.Message
    $errorFull = $_.Exception.ToString()
    Show-Error "Failed to create script file" $errorFull
    Write-ColorOutput "     Error Details: $errorMsg" "Red"
    Write-Host ""
    Show-Separator "Red"
    Write-ColorOutput "  Please ensure you have write permissions to the temp directory." "Yellow"
    Write-Host ""
    Write-ColorOutput "  Press any key to exit..." "Yellow"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""

# ============================================================================
# Community Integration
# ============================================================================
Show-Section "Community Access"

# Auto-open Discord link
Show-Progress "Opening Discord community page..." -NoSpinner
try {
    Start-Process $DiscordURL -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Show-Success "Discord page opened in your default browser"
    Show-Info "Join our community for support and updates!"
} catch {
    Show-Warning "Could not automatically open Discord page"
    Write-ColorOutput "     Please visit manually: " -NoNewline "Yellow"
    Write-ColorOutput $DiscordURL "Cyan"
}

# Auto-open CHYA Profile
Show-Progress "Opening CHYA profile page..." -NoSpinner
try {
    Start-Process $CHYAProfileURL -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Show-Success "CHYA profile page opened in your default browser"
    Show-Info "Check out CHYA's profile and projects!"
} catch {
    Show-Warning "Could not automatically open CHYA profile page"
    Write-ColorOutput "     Please visit manually: " -NoNewline "Yellow"
    Write-ColorOutput $CHYAProfileURL "Cyan"
}

Write-Host ""

# ============================================================================
# Execution Phase
# ============================================================================
Show-Section "Script Execution"

Show-Progress "Launching IDM Activation Script..." -NoSpinner
Write-Host ""
Show-Separator "Cyan"
Write-Host ""

try {
    Write-Log "INFO" "Starting IDM Activation Script execution with arguments: $ScriptArgs"
    Start-Process $FilePath $ScriptArgs -Wait -NoNewWindow
    Write-Host ""
    Show-Success "Script execution completed successfully"
    Write-Log "INFO" "IDM Activation Script execution completed"
} catch {
    $errorMsg = $_.Exception.Message
    $errorFull = $_.Exception.ToString()
    Show-Error "Failed to execute script" $errorFull
    Write-ColorOutput "     Error Details: $errorMsg" "Red"
}

Write-Host ""

# ============================================================================
# Cleanup Phase
# ============================================================================
Show-Section "Cleanup"

# Cleanup temporary files
Show-Progress "Cleaning up temporary files..." -NoSpinner
try {
    # Get audio player result if job completed
    if ($global:AudioJobHandle -and $global:AudioJobHandle.IsCompleted -and -not $global:AudioPlayer) {
        try {
            $global:AudioPlayer = $global:AudioPowerShell.EndInvoke($global:AudioJobHandle)
        } catch {
            Write-Log "WARNING" "Failed to get audio player result: $($_.Exception.Message)"
        }
    }
    
    # Stop and cleanup audio player
    if ($global:AudioPlayer) {
        try {
            $global:AudioPlayer.controls.stop()
            $global:AudioPlayer.close()
            Write-Log "INFO" "Audio player stopped and closed"
        } catch {
            Write-Log "WARNING" "Failed to stop audio player: $($_.Exception.Message)"
        }
    }
    
    # Cleanup audio runspace and PowerShell objects
    if ($global:AudioPowerShell) {
        try {
            if ($global:AudioJobHandle -and -not $global:AudioJobHandle.IsCompleted) {
                $global:AudioPowerShell.Stop()
            }
            $global:AudioPowerShell.Dispose()
            Write-Log "INFO" "Audio PowerShell object disposed"
        } catch {
            Write-Log "WARNING" "Failed to dispose audio PowerShell: $($_.Exception.Message)"
        }
    }
    
    if ($global:AudioRunspacePool) {
        try {
            $global:AudioRunspacePool.Close()
            $global:AudioRunspacePool.Dispose()
            Write-Log "INFO" "Audio runspace pool closed"
        } catch {
            Write-Log "WARNING" "Failed to close audio runspace pool: $($_.Exception.Message)"
        }
    }
    
    # Remove audio file
    if ($global:AudioFilePath -and (Test-Path $global:AudioFilePath)) {
        try {
            Remove-Item $global:AudioFilePath -Force -ErrorAction SilentlyContinue
            Write-Log "INFO" "Audio file removed: $global:AudioFilePath"
        } catch {
            Write-Log "WARNING" "Failed to remove audio file: $($_.Exception.Message)"
        }
    }
    
    $FilePaths = @("$env:TEMP\IAS*.cmd", "$env:SystemRoot\Temp\IAS*.cmd")
    $cleanedCount = 0
    foreach ($Path in $FilePaths) {
        $files = Get-Item $Path -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Write-Log "INFO" "Removing temporary file: $($file.FullName)"
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
            $cleanedCount++
        }
    }
    if ($cleanedCount -gt 0) {
        Show-Success "Removed $cleanedCount temporary file(s)"
        Write-Log "INFO" "Cleanup completed: $cleanedCount file(s) removed"
    } else {
        Show-Info "No temporary files to clean up"
        Write-Log "INFO" "No temporary files found for cleanup"
    }
} catch {
    $errorMsg = $_.Exception.Message
    Show-Warning "Some temporary files could not be removed (this is normal)"
    Write-Log "WARNING" "Cleanup warning: $errorMsg"
}

Write-Host ""

# ============================================================================
# Final Message
# ============================================================================
Show-Separator "Cyan"
Write-Host ""
Write-ColorOutput "  ╔═══════════════════════════════════════════════════════════════╗" "Green"
Write-ColorOutput "  ║                                                               ║" "Green"
Write-ColorOutput "  ║" -NoNewline "Green"
Write-ColorOutput "     Thank you for using IDM Activation Script!                " -NoNewline "White"
Write-ColorOutput "║" "Green"
Write-ColorOutput "  ║                                                               ║" "Green"
Write-ColorOutput "  ╚═══════════════════════════════════════════════════════════════╝" "Green"
Write-Host ""
Write-ColorOutput "  📢 Join our Discord community for support:" "Cyan"
Write-ColorOutput "     $DiscordURL" "Yellow"
Write-Host ""
Write-ColorOutput "  👤 Visit CHYA Profile:" "Cyan"
Write-ColorOutput "     $CHYAProfileURL" "Yellow"
Write-Host ""
Write-ColorOutput "  💡 Need help? Visit: https://github.com/lstprjct/IDM-Activation-Script/wiki" "Cyan"
Write-Host ""
if ($LogFilePath) {
    Write-ColorOutput "  📝 Log file saved to:" "Cyan"
    Write-ColorOutput "     $LogFilePath" "Yellow"
    Write-Host ""
    Write-Log "INFO" "Script execution completed successfully"
    Write-Log "INFO" "End of log file"
}
Show-Separator "DarkGray"
Write-Host ""
Write-ColorOutput "  Press any key to exit..." "Yellow"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
