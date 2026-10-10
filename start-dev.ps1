# Battlix Code Game - PowerShell Development Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Battlix Dev Environment (Hot Reload Active)" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000 (watch mode)" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173 (Vite HMR)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Set-Location $PSScriptRoot
& "C:\Program Files\nodejs\npm.cmd" run dev
