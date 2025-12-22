#!/usr/bin/env pwsh
# Quick Vercel Deployment Test Script
# Purpose: Test if auto-deploy is working after private repo fix

Write-Host "`n🚀 Vercel Auto-Deploy Test Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "main") {
    Write-Host "⚠️  Warning: Not on main branch. Auto-deploy typically works on 'main' branch." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 0
    }
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
}

Write-Host "🔍 Testing auto-deploy with empty commit...`n" -ForegroundColor Cyan

# Create test commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "test: verify auto-deploy - $timestamp"

Write-Host "Creating commit: $commitMessage" -ForegroundColor Gray
git commit --allow-empty -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create commit" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit created`n" -ForegroundColor Green

# Push to remote
Write-Host "📤 Pushing to origin/$currentBranch..." -ForegroundColor Cyan
git push origin $currentBranch

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push. Check your git credentials." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Push successful`n" -ForegroundColor Green

# Instructions
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "1. Open Vercel Dashboard:" -ForegroundColor White
Write-Host "   https://vercel.com/dashboard`n" -ForegroundColor Gray

Write-Host "2. Go to your project (nlistplanet or mobile-nlistplanet)`n" -ForegroundColor White

Write-Host "3. Check 'Deployments' tab:" -ForegroundColor White
Write-Host "   ✅ New deployment should appear within 10-30 seconds" -ForegroundColor Gray
Write-Host "   ✅ Status should change: Queued → Building → Ready`n" -ForegroundColor Gray

Write-Host "4. If NO deployment appears:" -ForegroundColor Yellow
Write-Host "   → Go to Settings → Git" -ForegroundColor Gray
Write-Host "   → Click 'Disconnect'" -ForegroundColor Gray
Write-Host "   → Click 'Connect Git Repository'" -ForegroundColor Gray
Write-Host "   → Select GitHub → Authorize" -ForegroundColor Gray
Write-Host "   → Choose your PRIVATE repo" -ForegroundColor Gray
Write-Host "   → Click 'Install & Authorize'`n" -ForegroundColor Gray

Write-Host "5. Verify webhook in GitHub:" -ForegroundColor White
Write-Host "   Repo → Settings → Webhooks" -ForegroundColor Gray
Write-Host "   Should see Vercel webhook with recent delivery (200 OK)`n" -ForegroundColor Gray

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⏱️  Waiting 30 seconds before opening browser...`n" -ForegroundColor Yellow

# Countdown
for ($i = 30; $i -gt 0; $i--) {
    Write-Host "`r⏳ Opening in $i seconds... (Press Ctrl+C to cancel)" -NoNewline -ForegroundColor Cyan
    Start-Sleep -Seconds 1
}

Write-Host "`n"

# Open Vercel dashboard
Write-Host "🌐 Opening Vercel dashboard in browser..." -ForegroundColor Cyan
Start-Process "https://vercel.com/dashboard"

Write-Host "`n✅ Done! Check the browser for deployment status.`n" -ForegroundColor Green

# Summary
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Commit: $commitMessage" -ForegroundColor Gray
Write-Host "Branch: $currentBranch" -ForegroundColor Gray
Write-Host "Time: $timestamp" -ForegroundColor Gray
Write-Host "`nFor detailed troubleshooting, see:" -ForegroundColor White
Write-Host "→ VERCEL_PRIVATE_REPO_FIX.md" -ForegroundColor Gray
Write-Host "→ VERCEL_AUTODEPLOY.md`n" -ForegroundColor Gray
