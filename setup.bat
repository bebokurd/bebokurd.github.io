@echo off
title Cydia Elite Initial Setup
echo ===================================================
echo   Setting up Cydia Elite Admin Dashboard
echo ===================================================
echo.
echo Installing required Node.js dependencies (express, cors)...
call npm install
echo.

if %errorlevel% neq 0 (
    echo [ERROR] Setup failed! Please make sure you have Node.js installed on your system.
    echo Download it from: https://nodejs.org/
    echo.
    pause
    exit /b %errorlevel%
)

echo [SUCCESS] Setup is completely finished!
echo.
echo You can now double-click "start_admin.bat" to launch the dashboard.
echo.
pause
