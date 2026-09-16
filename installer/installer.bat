@echo off

echo Checking backend...

if not exist "D:\coding\project\finance tracking\backend\node_modules" (
    echo Installing backend dependencies...
    cd /d "D:\coding\project\finance tracking\backend"
    npm i
) else (
    echo Backend node_modules already exists. Skipping...
)

echo.
echo Checking frontend...

if not exist "D:\coding\project\finance tracking\frontend\node_modules" (
    echo Installing frontend dependencies...
    cd /d "D:\coding\project\finance tracking\frontend"
    npm i
) else (
    echo Frontend node_modules already exists. Skipping...
)

echo.
echo Done!
pause