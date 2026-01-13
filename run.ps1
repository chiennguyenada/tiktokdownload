# TikTok Fact-Checker - Launch Script for Windows

Write-Host "Stopping existing services on ports 8000 and 5173..." -ForegroundColor Cyan
# Try to stop processes using these ports
function Stop-PortProcess ($port) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            $procId = $connection.OwningProcess
            # Skip System Idle Process (0) and checking if process typically exists
            if ($procId -gt 0) {
                Write-Host "Killing process $procId on port $port" -ForegroundColor DarkGray
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
    }
    catch {
        # Ignore errors if no process found or access denied
    }
}

Stop-PortProcess 8000
Stop-PortProcess 5173

# Check for Python
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python not found. Please install Python and add it to your PATH."
    exit
}

# Start Backend
Write-Host "`nStarting Backend on port 8000..." -ForegroundColor Green
Set-Location -Path "backend"

# Install/Update dependencies
Write-Host "Checking dependencies..." -ForegroundColor Gray
python -m pip install -r requirements.txt

# Start FastAPI in background
$backendJob = Start-Job -ScriptBlock {
    python -m uvicorn main:app --port 8000
}

Set-Location -Path ".."

# Start Frontend
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Green
$currentDir = Get-Location
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    python -m http.server 5173 --directory frontend
} -ArgumentList $currentDir

Write-Host "`nServices started!" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8000" -ForegroundColor Gray
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C to stop services and exit." -ForegroundColor White

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`nStopping services..." -ForegroundColor Red
    Stop-Job $backendJob
    Stop-Job $frontendJob
    Get-Process -Id (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Stopped." -ForegroundColor Gray
}
