Write-Host "Starting AgriLink Backend..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\backend"
& ".\venv\Scripts\uvicorn.exe" app.main:app --host 127.0.0.1 --port 8000 --reload
