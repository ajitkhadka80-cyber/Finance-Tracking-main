@echo off

set "BACKEND=E:\New folder\Finance-Tracking-main\backend"
set "FRONTEND=E:\New folder\Finance-Tracking-main\frontend"

echo ================================
echo Checking Node.js
echo ================================

node --version >nul 2>&1

if errorlevel 1 (
    echo Node.js is not installed.
    echo Installing Node.js...

    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements

    echo.
    echo Node.js installation completed.
    echo Please restart this script after installation.
    pause
    exit
)

echo Node.js is already installed.
node --version
echo.


echo ================================
echo Checking Backend
echo ================================

if not exist "%BACKEND%\node_modules" (
    echo Backend node_modules not found.
    echo Installing backend dependencies...

    cd /d "%BACKEND%"
    call npm i
)

echo Starting backend...
start "Backend" cmd /k "cd /d "%BACKEND%" && nodemon index.js"


echo ================================
echo Checking Frontend
echo ================================

if not exist "%FRONTEND%\node_modules" (
    echo Frontend node_modules not found.
    echo Installing frontend dependencies...

    cd /d "%FRONTEND%"
    call npm i
)

echo Starting frontend...
start "Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"

exit