# Export Environment Variables for Vercel
# This script helps you prepare your environment variables for Vercel deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Scanezy - Vercel Deployment Helper  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "   Please create .env.local with your environment variables first." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Found .env.local file" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your Environment Variables:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

# Read and parse .env.local
$envVars = Get-Content ".env.local" | Where-Object { 
    $_ -match "^\s*[A-Z_]+=.+" -and $_ -notmatch "^\s*#" 
}

$requiredVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_MVP_USERNAME",
    "ADMIN_MVP_PASSWORD",
    "ADMIN_MVP_SECRET"
)

$foundRequired = @()
$missingRequired = @()
$optionalVars = @()

foreach ($line in $envVars) {
    if ($line -match '^([^=]+)=(.*)$') {
        $varName = $matches[1].Trim()
        $varValue = $matches[2].Trim()
        
        # Check if it's a required variable
        if ($requiredVars -contains $varName) {
            $foundRequired += $varName
            Write-Host "  ✅ $varName" -ForegroundColor Green
        } else {
            $optionalVars += $varName
            Write-Host "  ☐  $varName" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""

# Check for missing required variables
foreach ($reqVar in $requiredVars) {
    if ($foundRequired -notcontains $reqVar) {
        $missingRequired += $reqVar
    }
}

if ($missingRequired.Count -gt 0) {
    Write-Host "⚠️  Missing Required Variables:" -ForegroundColor Red
    foreach ($missing in $missingRequired) {
        Write-Host "  ❌ $missing" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  • Required variables found: $($foundRequired.Count)/$($requiredVars.Count)" -ForegroundColor $(if ($missingRequired.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  • Optional variables found: $($optionalVars.Count)" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Select your Scanezy project" -ForegroundColor White
Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Add each variable listed above" -ForegroundColor White
Write-Host "5. Set environment to: Production, Preview, Development" -ForegroundColor White
Write-Host "6. Redeploy your application" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  SECURITY WARNING:" -ForegroundColor Red
Write-Host "  • Never commit .env.local to git" -ForegroundColor Yellow
Write-Host "  • Never share these values publicly" -ForegroundColor Yellow
Write-Host "  • Keep your secrets secure" -ForegroundColor Yellow
Write-Host ""

Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   VERCEL_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host ""

# Offer to create a template file for Vercel CLI
Write-Host "Would you like to generate Vercel CLI commands? (Y/N): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    $cliCommands = "# Vercel CLI Commands`r`n# Run these commands after vercel login and vercel link`r`n`r`n"
    
    foreach ($line in $envVars) {
        if ($line -match '^([^=]+)=(.*)$') {
            $varName = $matches[1].Trim()
            $cliCommands += "vercel env add $varName production`r`n"
        }
    }
    
    $cliCommands | Out-File -FilePath "vercel-env-commands.txt" -Encoding UTF8
    
    Write-Host ""
    Write-Host "✅ Created vercel-env-commands.txt" -ForegroundColor Green
    Write-Host "   You can copy-paste these commands to set up environment variables via CLI" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🚀 Good luck with your deployment!" -ForegroundColor Green
Write-Host ""
