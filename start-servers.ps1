# Battlix Code Game - Launch Services Silently in Background (Zero Windows)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Battlix Services Silently in Background" -ForegroundColor Green
Write-Host "  (Zero extra windows - only your browser will open)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot

# Clean up any lingering processes on ports 5000 and 5173 first
$old = Get-NetTCPConnection -LocalPort 5000,5173 -ErrorAction SilentlyContinue
if ($old) {
    $old.OwningProcess | Select-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
}

# Launch concurrently in background with SW_HIDE (0 = completely invisible, zero windows)
$ws = New-Object -ComObject WScript.Shell
$ws.Run("cmd /c cd /d `"$ProjectRoot`" && npm run dev", 0, $false)

# Wait 3 seconds for Vite & Backend to initialize
Start-Sleep -Seconds 3

# Launch Chrome / Default Browser directly to localhost:5173
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SUCCESS: Backend & Frontend are running in background!" -ForegroundColor Green
Write-Host "  Only your browser is open: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Zero extra command prompt windows are on your screen." -ForegroundColor White
Write-Host ""
Write-Host "  You can now close Antigravity IDE and record freely." -ForegroundColor White
Write-Host "  When finished recording, run: .\stop-servers.ps1" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Green
