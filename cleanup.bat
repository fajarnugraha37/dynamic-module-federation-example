@echo off
REM Batch cleanup script to remove build artifacts and temporary files
REM Usage: cleanup.bat

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set DELETED_COUNT=0
set ERROR_COUNT=0

echo [INFO] Starting cleanup process...
echo [INFO] Project root: %SCRIPT_DIR%
echo.

REM Function to check if directory exists and delete it
:DELETE_DIR
set "TARGET_PATH=%~1"
set "DESCRIPTION=%~2"

if exist "%TARGET_PATH%" (
    echo [INFO] Deleting %DESCRIPTION%: %TARGET_PATH%
    rmdir /s /q "%TARGET_PATH%" 2>nul
    if errorlevel 1 (
        echo [ERROR] Failed to delete %DESCRIPTION%: %TARGET_PATH%
        set /a ERROR_COUNT+=1
    ) else (
        echo [SUCCESS] Deleted %DESCRIPTION%
        set /a DELETED_COUNT+=1
    )
) else (
    echo [WARNING] Not found: %DESCRIPTION% ^(%TARGET_PATH%^)
)
goto :eof

REM Main cleanup targets
echo Cleaning root directories...
call :DELETE_DIR "%SCRIPT_DIR%dist" "Root dist directory"
call :DELETE_DIR "%SCRIPT_DIR%commons\dist" "Commons dist directory"

echo.
echo Cleaning commons subdirectories...

REM Clean commons subdirectories
for /d %%D in ("%SCRIPT_DIR%commons\*") do (
    if exist "%%D\dist" (
        call :DELETE_DIR "%%D\dist" "Commons %%~nD dist directory"
    )
    if exist "%%D\.vite" (
        call :DELETE_DIR "%%D\.vite" "Commons %%~nD Vite cache"
    )
)

echo.
echo Cleaning package directories...

REM Clean packages subdirectories
if exist "%SCRIPT_DIR%packages" (
    for /d %%P in ("%SCRIPT_DIR%packages\*") do (
        set "PACKAGE_NAME=%%~nP"
        
        if exist "%%P\dist" (
            call :DELETE_DIR "%%P\dist" "!PACKAGE_NAME! dist directory"
        )
        
        if exist "%%P\__mf__temp" (
            call :DELETE_DIR "%%P\__mf__temp" "!PACKAGE_NAME! Module Federation temp files"
        )
        
        if exist "%%P\.vite" (
            call :DELETE_DIR "%%P\.vite" "!PACKAGE_NAME! Vite cache"
        )
        
        if exist "%%P\node_modules\.vite" (
            call :DELETE_DIR "%%P\node_modules\.vite" "!PACKAGE_NAME! Vite dependency cache"
        )
    )
) else (
    echo [WARNING] Packages directory not found: %SCRIPT_DIR%packages
)

REM Summary
echo.
echo ===============================================
if %DELETED_COUNT%==0 (
    echo [WARNING] No directories were deleted ^(already clean^)
) else (
    echo [SUCCESS] Cleanup completed!
    echo [SUCCESS] Deleted %DELETED_COUNT% directories
)

if %ERROR_COUNT% gtr 0 (
    echo [WARNING] Encountered %ERROR_COUNT% errors during cleanup
)

REM Additional cleanup suggestions
echo.
echo [INFO] Additional cleanup options:
echo   • Run 'bun pm cache rm' to clear bun cache
echo   • Run 'npm cache clean --force' to clear npm cache  
echo   • Delete node_modules manually if needed

REM Show current project structure (simplified)
echo.
echo [INFO] Current project structure:
for /d %%D in ("%SCRIPT_DIR%*") do (
    set "DIR_NAME=%%~nD"
    if not "!DIR_NAME!"=="node_modules" (
        if not "!DIR_NAME!"==".git" (
            if not "!DIR_NAME!"=="dist" (
                echo   📁 !DIR_NAME!\
            )
        )
    )
)

echo.
echo [SUCCESS] Cleanup process completed!

REM Help information
if "%1"=="-h" goto :HELP
if "%1"=="--help" goto :HELP
if "%1"=="/?" goto :HELP
goto :END

:HELP
echo.
echo USAGE:
echo     cleanup.bat [OPTIONS]
echo.
echo OPTIONS:
echo     -h, --help, /?    Show this help message
echo.
echo DESCRIPTION:
echo     This script cleans up build artifacts and temporary files including:
echo.
echo     • .\dist                          ^(Root distribution files^)
echo     • .\commons\dist                   ^(Commons distribution files^)
echo     • packages\*\dist                  ^(Package distribution files^)
echo     • packages\*\__mf__temp           ^(Module Federation temp files^)
echo     • packages\*\.vite                ^(Vite cache directories^)
echo     • commons\*\.vite                 ^(Commons Vite cache^)
echo.

:END
endlocal
pause