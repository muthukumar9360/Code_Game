@echo off
title Battlix Code Game - Stop Services
echo ========================================================
echo   Stopping Battlix Backend and Frontend Services...
echo ========================================================
echo.

:: 1. Terminate all processes listening on port 5000 (Backend)
powershell -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($conns) { $conns.OwningProcess | Select-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; Write-Host '[OK] Stopped Backend (Port 5000)' -ForegroundColor Green } else { Write-Host '[INFO] Port 5000 was already free' -ForegroundColor Yellow }"

:: 2. Terminate all processes listening on port 5173 (Frontend Vite)
powershell -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue; if ($conns) { $conns.OwningProcess | Select-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; Write-Host '[OK] Stopped Frontend (Port 5173)' -ForegroundColor Green } else { Write-Host '[INFO] Port 5173 was already free' -ForegroundColor Yellow }"

:: 3. Netstat fallback just in case
powershell -NoProfile -Command "$lines = netstat -ano | Select-String ':(5000|5173)\s+.*LISTENING'; foreach ($l in $lines) { $pidVal = ($l.Line.Trim() -split '\s+')[-1]; if ($pidVal -match '^\d+$' -and $pidVal -ne '0') { Stop-Process -Id [int]$pidVal -Force -ErrorAction SilentlyContinue } }"

:: 4. Close the external command prompt windows titled Battlix Backend or Battlix Frontend
taskkill /FI "WINDOWTITLE eq Battlix Backend*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq Battlix Frontend*" /F /T >nul 2>&1

echo.
echo ========================================================
echo   SUCCESS: All Battlix services have been stopped!
echo ========================================================
echo.
pause
