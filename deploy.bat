@echo off
echo ===========================================================
echo    BATTLE ARENA (CODE_GAME) CONTROLLED DEPLOYMENT SCRIPT   
echo ===========================================================
echo Running PowerShell deployment script...
powershell -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
pause
