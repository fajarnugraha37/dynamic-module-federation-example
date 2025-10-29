#!/bin/bash

# Script to copy dist folders from packages to root dist directory
# Usage: ./copy-dist.sh
# Copies packages/*/dist -> ./dist/{parent_folder_name}

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the script directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGES_DIR="$SCRIPT_DIR/packages"
DIST_DIR="$SCRIPT_DIR/dist"

print_status "Starting dist folder copy process..."
print_status "Source: $PACKAGES_DIR/*/dist"
print_status "Target: $DIST_DIR/{parent_folder_name}"

# Check if packages directory exists
if [[ ! -d "$PACKAGES_DIR" ]]; then
    print_error "Packages directory not found: $PACKAGES_DIR"
    exit 1
fi

# Create root dist directory if it doesn't exist
if [[ ! -d "$DIST_DIR" ]]; then
    print_status "Creating root dist directory: $DIST_DIR"
    mkdir -p "$DIST_DIR"
fi

# Counter for copied folders
copied_count=0
total_packages=0

# Find all package directories
for package_path in "$PACKAGES_DIR"/*; do
    if [[ -d "$package_path" ]]; then
        package_name=$(basename "$package_path")
        dist_source="$package_path/dist"
        dist_target="$DIST_DIR/$package_name"
        
        total_packages=$((total_packages + 1))
        
        print_status "Processing package: $package_name"
        
        # Check if source dist directory exists
        if [[ -d "$dist_source" ]]; then
            # Remove existing target directory if it exists
            if [[ -d "$dist_target" ]]; then
                print_warning "Removing existing target directory: $dist_target"
                rm -rf "$dist_target"
            fi
            
            # Copy the dist directory
            print_status "Copying $dist_source -> $dist_target"
            cp -r "$dist_source" "$dist_target"
            
            # Verify the copy was successful
            if [[ -d "$dist_target" ]]; then
                file_count=$(find "$dist_target" -type f | wc -l)
                print_success "Copied $package_name ($file_count files)"
                copied_count=$((copied_count + 1))
            else
                print_error "Failed to copy $package_name"
            fi
        else
            print_warning "No dist directory found for package: $package_name"
            print_warning "Expected: $dist_source"
            print_warning "Make sure to run 'npm run build' or 'bun run build' first"
        fi
        
        echo ""  # Empty line for readability
    fi
done

# Summary
echo "==============================================="
if [[ $copied_count -eq 0 ]]; then
    print_error "No dist folders were copied!"
    print_warning "Make sure packages have been built first:"
    print_warning "  cd packages/host && npm run build"
    print_warning "  cd packages/vue-2 && npm run build"
    print_warning "  cd packages/vue-3 && npm run build"
    exit 1
elif [[ $copied_count -eq $total_packages ]]; then
    print_success "All $copied_count package dist folders copied successfully!"
else
    print_warning "$copied_count out of $total_packages package dist folders copied"
fi

# List the final structure
print_status "Final dist directory structure:"
if command -v tree >/dev/null 2>&1; then
    tree "$DIST_DIR" -L 2
else
    ls -la "$DIST_DIR"
fi

print_success "Copy process completed!"