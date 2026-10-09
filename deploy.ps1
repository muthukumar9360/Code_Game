param(
    [string]$Message = ""
)

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "   BATTLE ARENA (CODE_GAME) CONTROLLED DEPLOYMENT SCRIPT   " -ForegroundColor Yellow
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "This script safely pushes to the 'deploy' branch only when called." -ForegroundColor Gray
Write-Host "It prevents small development commits from wasting Render & Netlify build credits." -ForegroundColor Gray
Write-Host ""

if ([string]::IsNullOrWhiteSpace($Message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "deploy: production release $timestamp"
}

# 1. Check git status on current branch
Write-Host "[1/5] Checking current local git status..." -ForegroundColor Green
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Current active branch: $currentBranch" -ForegroundColor White

# 2. Stage and commit any pending changes on current branch
$hasChanges = (git status --porcelain)
if ($hasChanges) {
    Write-Host "[2/5] Staging and committing pending local changes..." -ForegroundColor Green
    git add .
    git commit -m $Message
    Write-Host "Committed changes on $currentBranch with message: '$Message'" -ForegroundColor Gray
} else {
    Write-Host "[2/5] Working tree is clean. Proceeding with existing commits." -ForegroundColor Gray
}

# 3. Push current branch (e.g. main)
Write-Host "[3/5] Pushing latest changes to origin/$currentBranch..." -ForegroundColor Green
git push origin $currentBranch

# 4. Sync and push to 'deploy' branch
Write-Host "[4/5] Synchronizing to 'deploy' branch for Netlify & Render..." -ForegroundColor Green
git checkout -B deploy $currentBranch
git push origin deploy --force

# 5. Return to original branch
Write-Host "[5/5] Returning to '$currentBranch' for local development..." -ForegroundColor Green
git checkout $currentBranch

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT PUSH COMPLETE!                               " -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
Write-Host "Branch 'deploy' has been updated on GitHub." -ForegroundColor White
Write-Host "Netlify (Frontend) and Render (Backend) will now build this release." -ForegroundColor Cyan
Write-Host "Normal coding will NOT trigger any builds until you run this script again." -ForegroundColor Yellow
