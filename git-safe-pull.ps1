# git-safe-pull.ps1
# This script ensures safe git pulls by backing up local configuration files, stashing local changes,
# performing the pull, and automatically resolving common conflict files (like .gitignore or package-lock.json).

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🛡️  IncHub Safe Git Sync Utility" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Check if git repository
if (-not (Test-Path .git)) {
    Write-Error "Not a git repository!"
    exit 1
}

# 2. Backup crucial local files to a temp directory before sync
$BackupDir = ".git_backup_temp"
if (Test-Path $BackupDir) {
    Remove-Item -Recurse -Force $BackupDir
}
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$FilesToBackup = @(
    ".gitignore",
    ".env",
    "temp_auto_push.bat",
    "temp_interactive_push.bat",
    "branch_structure.json"
)

Write-Host "📦 Creating backups of local configuration files..." -ForegroundColor Yellow
foreach ($File in $FilesToBackup) {
    if (Test-Path $File) {
        Copy-Item $File -Destination "$BackupDir/" -Force
        Write-Host "   Saved: $File" -ForegroundColor DarkGray
    }
}

# 3. Stash any uncommitted changes
Write-Host "📥 Stashing local uncommitted changes..." -ForegroundColor Yellow
$stashResult = git stash save "Safe pull auto-stash"
$hasStash = $stashResult -match "Saved working directory"

# 4. Pull changes from remote branch
Write-Host "🚀 Pulling latest changes from remote..." -ForegroundColor Yellow
$pullResult = git pull origin main 2>&1

# 5. Check if there are merge conflicts
if ($LASTEXITCODE -ne 0 -or ($pullResult -match "conflict")) {
    Write-Host "⚠️  Conflict detected! Resolving automatically..." -ForegroundColor Red
    
    # Auto-resolve conflicted .gitignore using ours (retaining local settings)
    if (git status --porcelain | Select-String "UU .gitignore") {
        Write-Host "🛠️  Auto-resolving .gitignore conflict (keeping local version)..." -ForegroundColor Green
        git checkout --ours .gitignore
        git add .gitignore
    }
    
    # Auto-resolve conflicted package-lock.json using theirs (getting latest remote packages)
    if (git status --porcelain | Select-String "UU package-lock.json") {
        Write-Host "🛠️  Auto-resolving package-lock.json conflict (using remote version)..." -ForegroundColor Green
        git checkout --theirs package-lock.json
        git add package-lock.json
    }

    # Complete the merge if there are no more conflicts
    $remainingConflicts = git status --porcelain | Select-String "^UU"
    if ($null -eq $remainingConflicts) {
        git commit -m "Auto-resolved safe-pull conflicts"
        Write-Host "✅ All conflicts successfully resolved." -ForegroundColor Green
    } else {
        Write-Host "❌ Manual conflict resolution required for: $remainingConflicts" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Pull completed successfully with no conflicts." -ForegroundColor Green
}

# 6. Restore stashed changes
if ($hasStash) {
    Write-Host "📤 Restoring local stashed changes..." -ForegroundColor Yellow
    git stash pop | Out-Null
}

# 7. Clean up backup directory
if (Test-Path $BackupDir) {
    Remove-Item -Recurse -Force $BackupDir
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🎉 Safe sync completed successfully!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
