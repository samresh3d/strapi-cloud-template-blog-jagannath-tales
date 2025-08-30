# Force rebuild Strapi admin with custom theme
# Run this script whenever you update theme settings

# Stop all node processes
Write-Host "Stopping any running Node processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Clean cache and build files
Write-Host "Cleaning Strapi cache and build files..." -ForegroundColor Yellow
npm run clean

# Build admin panel
Write-Host "Building Strapi admin panel..." -ForegroundColor Yellow
npm run build

# Start in development mode
Write-Host "Starting Strapi in development mode..." -ForegroundColor Green
npm run develop
