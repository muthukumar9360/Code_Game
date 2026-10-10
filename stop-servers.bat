@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 5000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; " ^
  "$lines = netstat -ano | Select-String ':(5000|5173)\s+.*LISTENING'; foreach ($l in $lines) { $p = ($l.Line.Trim() -split '\s+')[-1]; if ($p -match '^\d+$' -and $p -ne '0') { Stop-Process -Id [int]$p -Force -ErrorAction SilentlyContinue } }; " ^
  "Write-Host '[SUCCESS] All background services on Port 5000 and 5173 have been stopped!' -ForegroundColor Green"
echo All Battlix background services stopped successfully.
timeout /t 2
exit
