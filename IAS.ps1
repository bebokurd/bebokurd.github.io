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
    } else {
        Write-ColorOutput "  [*] $Message" "Yellow"
    }
}

# Function to display success message with icon
function Show-Success {
    param([string]$Message)
    Write-ColorOutput "  [✓] $Message" "Green"
}

# Function to display error message with icon
function Show-Error {
    param([string]$Message)
    Write-ColorOutput "  [✗] $Message" "Red"
}

# Function to display info message
function Show-Info {
    param([string]$Message)
    Write-ColorOutput "  [i] $Message" "Cyan"
}

# Function to display warning message
function Show-Warning {
    param([string]$Message)
    Write-ColorOutput "  [!] $Message" "Yellow"
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
}

# Display header
Show-Header

# Discord URL
$DiscordURL = 'https://discord.gg/qFQaJqv79r'

# CHYA Profile URL
$CHYAProfileURL = 'https://bebokurd.github.io/'

# Download URL
$DownloadURL = 'https://raw.githubusercontent.com/lstprjct/IDM-Activation-Script/main/IAS.cmd'

# ============================================================================
# Initialization Phase
# ============================================================================
Show-Section "Initialization"

# Enable TLSv1.2 for compatibility with older clients
Show-Progress "Configuring security protocols..." -NoSpinner
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
Start-Sleep -Milliseconds 200
Show-Success "Security protocols configured"

# Generate random number for file naming
Show-Progress "Preparing environment..." -NoSpinner
$rand = Get-Random -Maximum 99999999
Start-Sleep -Milliseconds 150

# Check admin privileges
$isAdmin = [bool]([Security.Principal.WindowsIdentity]::GetCurrent().Groups -match 'S-1-5-32-544')
$FilePath = if ($isAdmin) { 
    "$env:SystemRoot\Temp\IAS_$rand.cmd" 
} else { 
    "$env:TEMP\IAS_$rand.cmd" 
}

if ($isAdmin) {
    Show-Info "Running with administrator privileges"
} else {
    Show-Warning "Running without administrator privileges (may require elevation)"
}

Show-Success "Environment prepared successfully"
Write-Host ""

# ============================================================================
# Download Phase
# ============================================================================
Show-Section "Download & Setup"

# Download script
Show-Progress "Downloading IDM Activation Script from GitHub..." -NoSpinner
try {
    $response = Invoke-WebRequest -Uri $DownloadURL -UseBasicParsing -ErrorAction Stop
    Show-Success "Script downloaded successfully ($([math]::Round($response.Content.Length/1KB, 2)) KB)"
} catch {
    Show-Error "Failed to download script from primary URL"
    Write-ColorOutput "     Error Details: $($_.Exception.Message)" "Red"
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
} catch {
    Show-Error "Failed to create script file"
    Write-ColorOutput "     Error Details: $($_.Exception.Message)" "Red"
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
    Start-Process $FilePath $ScriptArgs -Wait -NoNewWindow
    Write-Host ""
    Show-Success "Script execution completed successfully"
} catch {
    Show-Error "Failed to execute script"
    Write-ColorOutput "     Error Details: $($_.Exception.Message)" "Red"
}

Write-Host ""

# ============================================================================
# Cleanup Phase
# ============================================================================
Show-Section "Cleanup"

# Cleanup temporary files
Show-Progress "Cleaning up temporary files..." -NoSpinner
try {
    $FilePaths = @("$env:TEMP\IAS*.cmd", "$env:SystemRoot\Temp\IAS*.cmd")
    $cleanedCount = 0
    foreach ($Path in $FilePaths) {
        $files = Get-Item $Path -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
            $cleanedCount++
        }
    }
    if ($cleanedCount -gt 0) {
        Show-Success "Removed $cleanedCount temporary file(s)"
    } else {
        Show-Info "No temporary files to clean up"
    }
} catch {
    Show-Warning "Some temporary files could not be removed (this is normal)"
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
Show-Separator "DarkGray"
Write-Host ""
Write-ColorOutput "  Press any key to exit..." "Yellow"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
