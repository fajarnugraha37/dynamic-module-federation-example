# PowerShell script to copy dist folders from packages to root dist directory
# Usage: .\copy-dist.ps1
# Copies packages\*\dist -> .\dist\{parent_folder_name}

param(
    [switch]$Verbose = $false,
    [switch]$WhatIf = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

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

try {
    # Get script directory (project root)
    $ScriptDir = $PSScriptRoot
    $PackagesDir = Join-Path $ScriptDir "packages"
    $DistDir = Join-Path $ScriptDir "dist"

    Write-Status "Starting dist folder copy process..."
    Write-Status "Source: $PackagesDir\*\dist"
    Write-Status "Target: $DistDir\{parent_folder_name}"

    if ($WhatIf) {
        Write-Warning "Running in WhatIf mode - no actual changes will be made"
    }

    # Check if packages directory exists
    if (!(Test-Path -Path $PackagesDir -PathType Container)) {
        Write-Error "Packages directory not found: $PackagesDir"
        exit 1
    }

    # Create root dist directory if it doesn't exist
    if (!(Test-Path -Path $DistDir -PathType Container)) {
        Write-Status "Creating root dist directory: $DistDir"
        if (!$WhatIf) {
            New-Item -Path $DistDir -ItemType Directory -Force | Out-Null
        }
    }

    # Counter for copied folders
    $CopiedCount = 0
    $TotalPackages = 0

    # Get all package directories
    $PackageDirectories = Get-ChildItem -Path $PackagesDir -Directory

    foreach ($PackageDir in $PackageDirectories) {
        $PackageName = $PackageDir.Name
        $DistSource = Join-Path $PackageDir.FullName "dist"
        $DistTarget = Join-Path $DistDir $PackageName
        
        $TotalPackages++
        
        Write-Status "Processing package: $PackageName"
        
        # Check if source dist directory exists
        if (Test-Path -Path $DistSource -PathType Container) {
            # Remove existing target directory if it exists
            if (Test-Path -Path $DistTarget -PathType Container) {
                Write-Warning "Removing existing target directory: $DistTarget"
                if (!$WhatIf) {
                    Remove-Item -Path $DistTarget -Recurse -Force
                }
            }
            
            # Copy the dist directory
            Write-Status "Copying $DistSource -> $DistTarget"
            if (!$WhatIf) {
                Copy-Item -Path $DistSource -Destination $DistTarget -Recurse -Force
            }
            
            # Verify the copy was successful (skip in WhatIf mode)
            if ($WhatIf -or (Test-Path -Path $DistTarget -PathType Container)) {
                if (!$WhatIf) {
                    $FileCount = (Get-ChildItem -Path $DistTarget -Recurse -File).Count
                    Write-Success "Copied $PackageName ($FileCount files)"
                } else {
                    Write-Success "Would copy $PackageName"
                }
                $CopiedCount++
            } else {
                Write-Error "Failed to copy $PackageName"
            }
        } else {
            Write-Warning "No dist directory found for package: $PackageName"
            Write-Warning "Expected: $DistSource"
            Write-Warning "Make sure to run 'npm run build' or 'bun run build' first"
        }
        
        Write-Host ""  # Empty line for readability
    }

    # Summary
    Write-Host "===============================================" -ForegroundColor Cyan
    
    if ($CopiedCount -eq 0) {
        Write-Error "No dist folders were copied!"
        Write-Warning "Make sure packages have been built first:"
        Write-Warning "  cd packages\host; npm run build"
        Write-Warning "  cd packages\vue-2; npm run build"
        Write-Warning "  cd packages\vue-3; npm run build"
        exit 1
    } elseif ($CopiedCount -eq $TotalPackages) {
        if ($WhatIf) {
            Write-Success "Would copy all $CopiedCount package dist folders successfully!"
        } else {
            Write-Success "All $CopiedCount package dist folders copied successfully!"
        }
    } else {
        if ($WhatIf) {
            Write-Warning "Would copy $CopiedCount out of $TotalPackages package dist folders"
        } else {
            Write-Warning "$CopiedCount out of $TotalPackages package dist folders copied"
        }
    }

    # List the final structure
    if (!$WhatIf -and (Test-Path -Path $DistDir)) {
        Write-Status "Final dist directory structure:"
        Get-ChildItem -Path $DistDir -Directory | ForEach-Object {
            Write-Host "  $($_.Name)/" -ForegroundColor Cyan
            $SubItems = Get-ChildItem -Path $_.FullName | Select-Object -First 5
            foreach ($Item in $SubItems) {
                $Icon = if ($Item.PSIsContainer) { "📁" } else { "📄" }
                Write-Host "    $Icon $($Item.Name)"
            }
            $Remaining = (Get-ChildItem -Path $_.FullName).Count - 5
            if ($Remaining -gt 0) {
                Write-Host "    ... and $Remaining more items" -ForegroundColor Gray
            }
            Write-Host ""
        }
    }

    Write-Success "Copy process completed!"

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}

# Help information
if ($args -contains "-h" -or $args -contains "--help") {
    Write-Host @"

USAGE:
    .\copy-dist.ps1 [OPTIONS]

OPTIONS:
    -Verbose        Enable verbose output
    -WhatIf         Show what would be done without making changes
    -h, --help      Show this help message

EXAMPLES:
    .\copy-dist.ps1                    # Copy all dist folders
    .\copy-dist.ps1 -WhatIf            # Preview what would be copied
    .\copy-dist.ps1 -Verbose           # Enable verbose output

DESCRIPTION:
    This script copies built dist folders from packages to the root dist directory.
    
    Source pattern: packages\*\dist
    Target pattern: dist\{package_name}
    
    For example:
    - packages\host\dist -> dist\host
    - packages\vue-2\dist -> dist\vue-2  
    - packages\vue-3\dist -> dist\vue-3

"@ -ForegroundColor Cyan
}