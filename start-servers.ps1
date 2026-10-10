# Battlix Code Game - Launch Services Independently
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Battlix Backend and Frontend Independently" -ForegroundColor Green
Write-Host "  (These will stay running even if Antigravity is closed)" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot

# Start Backend in independent window
Write-Host "[1/2] Starting Backend on http://localhost:5000 ..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$ProjectRoot\backend`" && npm run dev"

Start-Sleep -Seconds 2

# Start Frontend in independent window
Write-Host "[2/2] Starting Frontend on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList "/k cd /d `"$ProjectRoot\frontend`" && npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SUCCESS: Both services are running in separate windows!" -ForegroundColor Green
Write-Host "  - Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  You can now safely close Antigravity IDE and record." -ForegroundColor White
Write-Host "  When finished recording, run '.\stop-servers.ps1' or 'stop-servers.bat'." -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Green
