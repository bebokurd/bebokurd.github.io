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

# Function to display colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White",
        [string]$BackgroundColor = "Black"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor -BackgroundColor $BackgroundColor
}

# Function to display header
function Show-Header {
    Write-Host ""
    Write-ColorOutput "╔════════════════════════════════════════════════════════════════╗" "Cyan"
    Write-ColorOutput "║                                                                ║" "Cyan"
    Write-ColorOutput "║          IDM Activation Script (IAS) - Launcher v1.2          ║" "Cyan"
    Write-ColorOutput "║                                                                ║" "Cyan"
    Write-ColorOutput "╚════════════════════════════════════════════════════════════════╝" "Cyan"
    Write-Host ""
}

# Function to display progress
function Show-Progress {
    param(
        [string]$Message,
        [int]$Percent = -1
    )
    if ($Percent -ge 0) {
        Write-ColorOutput "[$Percent%] $Message" "Yellow"
    } else {
        Write-ColorOutput "[*] $Message" "Yellow"
    }
}

# Function to display success message
function Show-Success {
    param([string]$Message)
    Write-ColorOutput "[✓] $Message" "Green"
}

# Function to display error message
function Show-Error {
    param([string]$Message)
    Write-ColorOutput "[✗] $Message" "Red"
}

# Display header
Show-Header

# Enable TLSv1.2 for compatibility with older clients
Show-Progress "Configuring security protocols..."
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
Start-Sleep -Milliseconds 300

# Discord URL
$DiscordURL = 'https://discord.gg/qFQaJqv79r'

# Download URL
$DownloadURL = 'https://raw.githubusercontent.com/lstprjct/IDM-Activation-Script/main/IAS.cmd'

# Generate random number for file naming
Show-Progress "Preparing environment..."
$rand = Get-Random -Maximum 99999999
Start-Sleep -Milliseconds 200

# Check admin privileges
$isAdmin = [bool]([Security.Principal.WindowsIdentity]::GetCurrent().Groups -match 'S-1-5-32-544')
$FilePath = if ($isAdmin) { 
    "$env:SystemRoot\Temp\IAS_$rand.cmd" 
} else { 
    "$env:TEMP\IAS_$rand.cmd" 
}

Show-Success "Environment prepared successfully"
Write-Host ""

# Download script
Show-Progress "Downloading IDM Activation Script..."
try {
    $response = Invoke-WebRequest -Uri $DownloadURL -UseBasicParsing -ErrorAction Stop
    Show-Success "Script downloaded successfully"
} catch {
    Show-Error "Failed to download script from primary URL"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    Write-Host ""
    Write-ColorOutput "Press any key to exit..." "Yellow"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""

# Prepare script content
Show-Progress "Preparing script file..."
$ScriptArgs = "$args "
$prefix = "@REM $rand `r`n"
$content = $prefix + $response.Content

try {
    Set-Content -Path $FilePath -Value $content -ErrorAction Stop
    Show-Success "Script file prepared successfully"
} catch {
    Show-Error "Failed to create script file"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
    Write-Host ""
    Write-ColorOutput "Press any key to exit..." "Yellow"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""

# Auto-open Discord link
Show-Progress "Opening Discord community page..."
try {
    Start-Process $DiscordURL -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Show-Success "Discord page opened in your default browser"
} catch {
    Show-Error "Could not automatically open Discord page"
    Write-ColorOutput "Please visit manually: $DiscordURL" "Yellow"
}
Write-Host ""

# Launch the activation script
Show-Progress "Launching IDM Activation Script..."
Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Cyan"
Write-Host ""

try {
    Start-Process $FilePath $ScriptArgs -Wait -NoNewWindow
    Show-Success "Script execution completed"
} catch {
    Show-Error "Failed to execute script"
    Write-ColorOutput "Error: $($_.Exception.Message)" "Red"
}

Write-Host ""

# Cleanup temporary files
Show-Progress "Cleaning up temporary files..."
try {
    $FilePaths = @("$env:TEMP\IAS*.cmd", "$env:SystemRoot\Temp\IAS*.cmd")
    foreach ($Path in $FilePaths) {
        Get-Item $Path -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    }
    Show-Success "Cleanup completed"
} catch {
    Write-ColorOutput "[!] Some temporary files could not be removed (this is normal)" "Yellow"
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════════════" "Cyan"
Write-Host ""
Write-ColorOutput "Thank you for using IDM Activation Script!" "Green"
Write-ColorOutput "Join our Discord community: $DiscordURL" "Cyan"
Write-Host ""
Write-ColorOutput "Press any key to exit..." "Yellow"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
