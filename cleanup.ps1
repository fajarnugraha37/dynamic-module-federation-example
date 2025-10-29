# PowerShell cleanup script to remove build artifacts and temporary files
# Usage: .\cleanup.ps1

param(
    [switch]$Verbose = $false,
    [switch]$WhatIf = $false,
    [switch]$Force = $false
)

# Set error action preference
$ErrorActionPreference = "Continue"

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to get directory size
function Get-DirectorySize {
    param([string]$Path)
    
    if (Test-Path -Path $Path -PathType Container) {
        try {
            $size = (Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
                    Measure-Object -Property Length -Sum).Sum
            return $size
        } catch {
            return 0
        }
    }
    return 0
}

# Function to format bytes
function Format-Bytes {
    param([long]$Bytes)
    
    if ($Bytes -eq 0) { return "0 B" }
    
    $sizes = @("B", "KB", "MB", "GB", "TB")
    $order = [Math]::Floor([Math]::Log($Bytes, 1024))
    $size = [Math]::Round($Bytes / [Math]::Pow(1024, $order), 2)
    
    return "$size $($sizes[$order])"
}

# Function to count files
function Get-FileCount {
    param([string]$Path)
    
    if (Test-Path -Path $Path -PathType Container) {
        try {
            return (Get-ChildItem -Path $Path -Recurse -File -Force -ErrorAction SilentlyContinue).Count
        } catch {
            return 0
        }
    }
    return 0
}

try {
    # Get script directory (project root)
    $ScriptDir = $PSScriptRoot
    
    Write-Status "Starting cleanup process..."
    Write-Status "Project root: $ScriptDir"
    
    if ($WhatIf) {
        Write-Warning "Running in WhatIf mode - no actual changes will be made"
    }
    
    Write-Host ""

    # Initialize counters
    $DeletedCount = 0
    $TotalSize = 0
    $TotalFiles = 0

    # Define cleanup targets
    $CleanupTargets = @(
        @{ Path = "$ScriptDir\dist"; Description = "Root dist directory" }
        @{ Path = "$ScriptDir\commons\dist"; Description = "Commons dist directory" }
    )

    # Add package-specific cleanup targets
    $PackagesDir = "$ScriptDir\packages"
    if (Test-Path -Path $PackagesDir -PathType Container) {
        $PackageDirectories = Get-ChildItem -Path $PackagesDir -Directory
        
        foreach ($PackageDir in $PackageDirectories) {
            $PackageName = $PackageDir.Name
            
            # Add various cleanup targets for each package
            $CleanupTargets += @(
                @{ Path = "$($PackageDir.FullName)\dist"; Description = "$PackageName dist directory" }
                @{ Path = "$($PackageDir.FullName)\__mf__temp"; Description = "$PackageName Module Federation temp files" }
                @{ Path = "$($PackageDir.FullName)\.vite"; Description = "$PackageName Vite cache" }
                @{ Path = "$($PackageDir.FullName)\node_modules\.vite"; Description = "$PackageName Vite dependency cache" }
            )
        }
    }

    # Add commons-specific cleanup targets
    $CommonsDir = "$ScriptDir\commons"
    if (Test-Path -Path $CommonsDir -PathType Container) {
        $CommonsDirectories = Get-ChildItem -Path $CommonsDir -Directory
        
        foreach ($Dir in $CommonsDirectories) {
            $DirName = $Dir.Name
            
            $CleanupTargets += @(
                @{ Path = "$($Dir.FullName)\dist"; Description = "Commons $DirName dist directory" }
                @{ Path = "$($Dir.FullName)\.vite"; Description = "Commons $DirName Vite cache" }
            )
        }
    }

    # Perform cleanup
    foreach ($Target in $CleanupTargets) {
        $TargetPath = $Target.Path
        $Description = $Target.Description
        
        if (Test-Path -Path $TargetPath -PathType Container) {
            # Get stats before deletion
            $Size = Get-DirectorySize -Path $TargetPath
            $FileCount = Get-FileCount -Path $TargetPath
            
            Write-Status "Deleting $Description`: $TargetPath"
            Write-Status "  Files: $FileCount, Size: $(Format-Bytes $Size)"
            
            if (!$WhatIf) {
                try {
                    Remove-Item -Path $TargetPath -Recurse -Force -ErrorAction Stop
                    Write-Success "Deleted $Description"
                    $DeletedCount++
                    $TotalSize += $Size
                    $TotalFiles += $FileCount
                } catch {
                    Write-Error "Failed to delete $Description`: $($_.Exception.Message)"
                }
            } else {
                Write-Success "Would delete $Description"
                $DeletedCount++
                $TotalSize += $Size
                $TotalFiles += $FileCount
            }
        } else {
            Write-Warning "Not found: $Description ($TargetPath)"
        }
    }

    # Summary
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    
    if ($DeletedCount -eq 0) {
        Write-Warning "No directories were deleted (already clean)"
    } else {
        if ($WhatIf) {
            Write-Success "Would complete cleanup!"
            Write-Success "Would delete $DeletedCount directories"
            Write-Success "Would free $(Format-Bytes $TotalSize) of space"
            Write-Success "Would remove $TotalFiles files"
        } else {
            Write-Success "Cleanup completed!"
            Write-Success "Deleted $DeletedCount directories"
            Write-Success "Freed $(Format-Bytes $TotalSize) of space"
            Write-Success "Removed $TotalFiles files"
        }
    }

    # Additional cleanup suggestions
    Write-Host ""
    Write-Status "Additional cleanup options:"
    Write-Host "  • Run 'bun pm cache rm' to clear bun cache"
    Write-Host "  • Run 'npm cache clean --force' to clear npm cache"
    Write-Host "  • Delete node_modules: Remove-Item -Recurse -Force node_modules, packages\*\node_modules, commons\*\node_modules"

    # Show current project structure
    if (!$WhatIf) {
        Write-Host ""
        Write-Status "Current project structure:"
        
        try {
            Get-ChildItem -Path $ScriptDir -Directory | Where-Object { 
                $_.Name -notin @('node_modules', '.git', 'dist') 
            } | ForEach-Object {
                Write-Host "  📁 $($_.Name)\" -ForegroundColor Cyan
                
                $SubItems = Get-ChildItem -Path $_.FullName -ErrorAction SilentlyContinue | 
                           Where-Object { $_.Name -notin @('node_modules', 'dist', '.vite', '__mf__temp') } |
                           Select-Object -First 3
                
                foreach ($Item in $SubItems) {
                    $Icon = if ($Item.PSIsContainer) { "📁" } else { "📄" }
                    Write-Host "    $Icon $($Item.Name)"
                }
                
                $TotalItems = (Get-ChildItem -Path $_.FullName -ErrorAction SilentlyContinue).Count
                if ($TotalItems -gt 3) {
                    Write-Host "    ... and $($TotalItems - 3) more items" -ForegroundColor Gray
                }
            }
        } catch {
            Write-Warning "Could not display project structure"
        }
    }

    Write-Success "Cleanup process completed!"

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    if ($Verbose) {
        Write-Error "Stack trace: $($_.ScriptStackTrace)"
    }
    exit 1
}

# Help information
if ($args -contains "-h" -or $args -contains "--help") {
    Write-Host @"

USAGE:
    .\cleanup.ps1 [OPTIONS]

OPTIONS:
    -Verbose        Enable verbose output
    -WhatIf         Show what would be done without making changes
    -Force          Force deletion without confirmation
    -h, --help      Show this help message

EXAMPLES:
    .\cleanup.ps1                     # Clean all build artifacts
    .\cleanup.ps1 -WhatIf             # Preview what would be cleaned
    .\cleanup.ps1 -Verbose            # Enable detailed output
    .\cleanup.ps1 -Force              # Force cleanup without prompts

DESCRIPTION:
    This script cleans up build artifacts and temporary files including:
    
    • .\dist                          (Root distribution files)
    • .\commons\dist                   (Commons distribution files)
    • packages\*\dist                  (Package distribution files)  
    • packages\*\__mf__temp           (Module Federation temp files)
    • packages\*\.vite                (Vite cache directories)
    • commons\*\.vite                 (Commons Vite cache)

"@ -ForegroundColor Cyan
}