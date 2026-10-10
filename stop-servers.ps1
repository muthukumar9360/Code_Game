# Battlix Code Game - Stop All Background Services
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Stopping Battlix Background Services..." -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Stop Port 5000 (Backend)
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $port5000.OwningProcess | Select-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[OK] Stopped Backend (Port 5000)" -ForegroundColor Green
} else {
    Write-Host "[INFO] Port 5000 was already free" -ForegroundColor Gray
}

# 2. Stop Port 5173 (Frontend)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    $port5173.OwningProcess | Select-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[OK] Stopped Frontend (Port 5173)" -ForegroundColor Green
} else {
    Write-Host "[INFO] Port 5173 was already free" -ForegroundColor Gray
}

# 3. Fallback netstat check
$lines = netstat -ano | Select-String ":(5000|5173)\s+.*LISTENING"
foreach ($l in $lines) {
    $pidVal = ($l.Line.Trim() -split '\s+')[-1]
    if ($pidVal -match '^\d+$' -and $pidVal -ne '0') {
        Stop-Process -Id [int]$pidVal -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SUCCESS: All background services have been stopped!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
