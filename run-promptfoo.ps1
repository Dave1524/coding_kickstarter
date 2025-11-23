# Load environment variables from .env.local and run promptfoo
# Usage: .\run-promptfoo.ps1

Write-Host "🔍 Loading environment variables from .env.local..." -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "❌ Error: .env.local file not found in current directory" -ForegroundColor Red
    Write-Host "   Please create .env.local with your OPENAI_API_KEY" -ForegroundColor Yellow
    exit 1
}

# Load all variables from .env.local into current PowerShell session
$loadedCount = 0
Get-Content .env.local | ForEach-Object {
    # Skip empty lines and comments
    if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present (handles both single and double quotes)
        $value = $value -replace '^["\']|["\']$', ''
        [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
        $loadedCount++
    }
}

Write-Host "✅ Loaded $loadedCount environment variable(s)" -ForegroundColor Green

# Verify OPENAI_API_KEY is loaded
if (-not $env:OPENAI_API_KEY) {
    Write-Host "❌ Error: OPENAI_API_KEY not found in .env.local" -ForegroundColor Red
    Write-Host "   Please add OPENAI_API_KEY=sk-your-key-here to .env.local" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ OPENAI_API_KEY is loaded (length: $($env:OPENAI_API_KEY.Length) characters)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Running promptfoo eval..." -ForegroundColor Cyan
Write-Host ""

# Run promptfoo with explicit environment variable
# Using $env: syntax ensures it's available to child processes
# The & operator should inherit environment variables, but if it doesn't work,
# we'll use the Start-Process method below as a fallback

# Try the simple approach first
try {
    & npx promptfoo eval -c promptfoo/promptfooconfig.yaml
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
        throw "Command failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "⚠️  Simple method failed, trying alternative approach..." -ForegroundColor Yellow
    Write-Host ""
    
    # Alternative: Use Start-Process with explicit environment variables
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "npx"
    $psi.Arguments = "promptfoo eval -c promptfoo/promptfooconfig.yaml"
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    
    # Copy all environment variables
    Get-ChildItem Env: | ForEach-Object {
        $psi.EnvironmentVariables[$_.Name] = $_.Value
    }
    
    # Explicitly ensure OPENAI_API_KEY is set
    $psi.EnvironmentVariables["OPENAI_API_KEY"] = $env:OPENAI_API_KEY
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    $process.Start() | Out-Null
    
    # Read output
    $output = $process.StandardOutput.ReadToEnd()
    $error = $process.StandardError.ReadToEnd()
    
    Write-Host $output
    if ($error) {
        Write-Host $error -ForegroundColor Red
    }
    
    $process.WaitForExit()
    exit $process.ExitCode
}
