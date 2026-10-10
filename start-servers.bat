@echo off
title Battlix Code Game - Launch Services
echo ========================================================
echo   Starting Battlix Backend and Frontend Independently
echo   (These will stay running even if Antigravity is closed)
echo ========================================================
echo.

set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Start Backend in a detached, persistent window
echo [1/2] Starting Backend on http://localhost:5000 ...
start "Battlix Backend (Port 5000)" cmd /k "cd /d "%PROJECT_ROOT%backend" && npm run dev"

:: Small delay to allow backend to bind port cleanly
timeout /t 2 /nobreak >nul

:: Start Frontend in a detached, persistent window
echo [2/2] Starting Frontend on http://localhost:5173 ...
start "Battlix Frontend (Port 5173)" cmd /k "cd /d "%PROJECT_ROOT%frontend" && npm run dev"

echo.
echo ========================================================
echo   SUCCESS: Both services are running in separate windows!
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:5173
echo.
echo   You can now safely close Antigravity IDE and record.
echo   When finished recording, run 'stop-servers.bat' to stop.
echo ========================================================
echo.
timeout /t 4
exit
