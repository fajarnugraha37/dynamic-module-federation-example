#!/bin/bash

# Cleanup script to remove build artifacts and temporary files
# Usage: ./cleanup.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# Function to get directory size
get_dir_size() {
    if [[ -d "$1" ]]; then
        du -sh "$1" 2>/dev/null | cut -f1
    else
        echo "0B"
    fi
}

# Function to count files in directory
count_files() {
    if [[ -d "$1" ]]; then
        find "$1" -type f 2>/dev/null | wc -l
    else
        echo "0"
    fi
}

# Get the script directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_status "Starting cleanup process..."
print_status "Project root: $SCRIPT_DIR"
echo ""

# Initialize counters
deleted_count=0
total_freed_space=""

# Define cleanup targets
declare -a cleanup_targets=(
    "$SCRIPT_DIR/dist:Root dist directory"
    "$SCRIPT_DIR/commons/dist:Commons dist directory"
)

# Add package-specific cleanup targets
PACKAGES_DIR="$SCRIPT_DIR/packages"
if [[ -d "$PACKAGES_DIR" ]]; then
    for package_dir in "$PACKAGES_DIR"/*; do
        if [[ -d "$package_dir" ]]; then
            package_name=$(basename "$package_dir")
            
            # Add various cleanup targets for each package
            cleanup_targets+=(
                "$package_dir/dist:$package_name dist directory"
                "$package_dir/__mf__temp:$package_name Module Federation temp files"
                "$package_dir/.vite:$package_name Vite cache"
                "$package_dir/node_modules/.vite:$package_name Vite dependency cache"
            )
        fi
    done
fi

# Add commons-specific cleanup targets  
COMMONS_DIR="$SCRIPT_DIR/commons"
if [[ -d "$COMMONS_DIR" ]]; then
    for commons_subdir in "$COMMONS_DIR"/*; do
        if [[ -d "$commons_subdir" ]]; then
            subdir_name=$(basename "$commons_subdir")
            
            cleanup_targets+=(
                "$commons_subdir/dist:Commons $subdir_name dist directory"
                "$commons_subdir/.vite:Commons $subdir_name Vite cache"
            )
        fi
    done
fi

# Perform cleanup
for target in "${cleanup_targets[@]}"; do
    IFS=':' read -r target_path description <<< "$target"
    
    if [[ -d "$target_path" ]]; then
        # Get stats before deletion
        size=$(get_dir_size "$target_path")
        files=$(count_files "$target_path")
        
        print_status "Deleting $description: $target_path"
        print_status "  Files: $files, Size: $size"
        
        rm -rf "$target_path"
        
        if [[ ! -d "$target_path" ]]; then
            print_success "Deleted $description"
            deleted_count=$((deleted_count + 1))
        else
            print_error "Failed to delete $description"
        fi
    else
        print_warning "Not found: $description ($target_path)"
    fi
done

# Summary
echo ""
echo "==============================================="

if [[ $deleted_count -eq 0 ]]; then
    print_warning "No directories were deleted (already clean)"
else
    print_success "Cleanup completed!"
    print_success "Deleted $deleted_count directories"
fi

# Additional cleanup suggestions
echo ""
print_status "Additional cleanup options:"
echo "  • Run 'bun pm cache rm' to clear bun cache"  
echo "  • Run 'npm cache clean --force' to clear npm cache"
echo "  • Delete node_modules: 'rm -rf node_modules packages/*/node_modules commons/*/node_modules'"

# Show final project structure (if tree is available)
echo ""
print_status "Current project structure:"
if command -v tree >/dev/null 2>&1; then
    tree -I 'node_modules|.git' -L 3
else
    find . -maxdepth 3 -type d -not -path './node_modules*' -not -path './.git*' | sort
fi

print_success "Cleanup process completed!"