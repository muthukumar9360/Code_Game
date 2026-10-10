@echo off
title Battlix Code Game - Launch Services Silently
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Stop any previous processes on ports 5000 and 5173
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

:: Launch npm run dev completely hidden in the background (0 = SW_HIDE, zero windows)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $ws.Run('cmd /c cd /d ""%PROJECT_ROOT%"" && npm run dev', 0, $false)"

:: Wait 3 seconds for Vite and Backend to initialize
timeout /t 3 /nobreak >nul

:: Open Chrome directly to http://localhost:5173
start "" "http://localhost:5173"

exit
