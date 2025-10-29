@echo off
setlocal enabledelayedexpansion

REM Batch script to copy dist folders from packages to root dist directory
REM Usage: copy-dist.bat
REM Copies packages\*\dist -> .\dist\{parent_folder_name}

echo [INFO] Starting dist folder copy process...
echo [INFO] Source: packages\*\dist
echo [INFO] Target: dist\{parent_folder_name}
echo.

REM Get current directory
set "SCRIPT_DIR=%~dp0"
set "PACKAGES_DIR=%SCRIPT_DIR%packages"
set "DIST_DIR=%SCRIPT_DIR%dist"

REM Check if packages directory exists
if not exist "%PACKAGES_DIR%" (
    echo [ERROR] Packages directory not found: %PACKAGES_DIR%
    pause
    exit /b 1
)

REM Create root dist directory if it doesn't exist
if not exist "%DIST_DIR%" (
    echo [INFO] Creating root dist directory: %DIST_DIR%
    mkdir "%DIST_DIR%"
)

REM Initialize counters
set /a COPIED_COUNT=0
set /a TOTAL_PACKAGES=0

REM Process each package directory
for /d %%D in ("%PACKAGES_DIR%\*") do (
    set /a TOTAL_PACKAGES+=1
    set "PACKAGE_NAME=%%~nxD"
    set "DIST_SOURCE=%%D\dist"
    set "DIST_TARGET=%DIST_DIR%\!PACKAGE_NAME!"
    
    echo [INFO] Processing package: !PACKAGE_NAME!
    
    REM Check if source dist directory exists
    if exist "!DIST_SOURCE!" (
        REM Remove existing target directory if it exists
        if exist "!DIST_TARGET!" (
            echo [WARNING] Removing existing target directory: !DIST_TARGET!
            rmdir /s /q "!DIST_TARGET!"
        )
        
        REM Copy the dist directory
        echo [INFO] Copying !DIST_SOURCE! -^> !DIST_TARGET!
        xcopy "!DIST_SOURCE!" "!DIST_TARGET!" /E /I /Y /Q > nul
        
        REM Check if copy was successful
        if exist "!DIST_TARGET!" (
            echo [SUCCESS] Copied !PACKAGE_NAME!
            set /a COPIED_COUNT+=1
        ) else (
            echo [ERROR] Failed to copy !PACKAGE_NAME!
        )
    ) else (
        echo [WARNING] No dist directory found for package: !PACKAGE_NAME!
        echo [WARNING] Expected: !DIST_SOURCE!
        echo [WARNING] Make sure to run 'npm run build' or 'bun run build' first
    )
    echo.
)

REM Summary
echo ===============================================
if !COPIED_COUNT! EQU 0 (
    echo [ERROR] No dist folders were copied!
    echo [WARNING] Make sure packages have been built first:
    echo [WARNING]   cd packages\host ^& npm run build
    echo [WARNING]   cd packages\vue-2 ^& npm run build  
    echo [WARNING]   cd packages\vue-3 ^& npm run build
    pause
    exit /b 1
) else if !COPIED_COUNT! EQU !TOTAL_PACKAGES! (
    echo [SUCCESS] All !COPIED_COUNT! package dist folders copied successfully!
) else (
    echo [WARNING] !COPIED_COUNT! out of !TOTAL_PACKAGES! package dist folders copied
)

REM Show final structure
echo.
echo [INFO] Final dist directory structure:
dir "%DIST_DIR%" /AD /B 2>nul | findstr /R ".*" && (
    for /f %%F in ('dir "%DIST_DIR%" /AD /B 2^>nul') do (
        echo   %%F\
    )
) || echo   ^(empty^)

echo.
echo [SUCCESS] Copy process completed!
pause