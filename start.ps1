# MediVerse Startup Script for Windows (PowerShell)
# Checks prerequisites, sets up environment, and starts the application

# Colors for output
function Write-Info { 
    Write-Host "ℹ️  $args" -ForegroundColor Blue 
}
function Write-Success { 
    Write-Host "✅ $args" -ForegroundColor Green 
}
function Write-Warning { 
    Write-Host "⚠️  $args" -ForegroundColor Yellow 
}
function Write-Error { 
    Write-Host "❌ $args" -ForegroundColor Red 
}

function Write-Header {
    Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║         MediVerse - Startup Script                ║" -ForegroundColor Magenta
    Write-Host "║    Voice-Driven Anatomy Learning Platform         ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

# Check if command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    $missingTools = @()
    
    # Check Node.js
    if (Test-Command node) {
        $nodeVersion = node -v
        Write-Success "Node.js installed: $nodeVersion"
    } else {
        Write-Error "Node.js not found!"
        $missingTools += "Node.js (install from https://nodejs.org/)"
    }
    
    # Check npm
    if (Test-Command npm) {
        $npmVersion = npm -v
        Write-Success "npm installed: v$npmVersion"
    } else {
        Write-Error "npm not found!"
        $missingTools += "npm (usually comes with Node.js)"
    }
    
    # Check Docker
    if (Test-Command docker) {
        Write-Success "Docker installed"
    } else {
        Write-Warning "Docker not found (optional for database)"
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Error "Missing required tools:"
        $missingTools | ForEach-Object { Write-Host "  - $_" }
        exit 1
    }
    
    Write-Host ""
}

# Setup environment
function Initialize-Environment {
    Write-Info "Setting up environment..."
    
    if (-not (Test-Path .env)) {
        if (Test-Path .env.example) {
            Write-Warning ".env file not found, creating from .env.example"
            Copy-Item .env.example .env
            Write-Success ".env file created"
            Write-Warning "Please edit .env file with your GCP credentials before running again"
            exit 0
        } else {
            Write-Error ".env.example not found!"
            exit 1
        }
    } else {
        Write-Success ".env file exists"
    }
    
    Write-Host ""
}

# Install dependencies
function Install-Dependencies {
    Write-Info "Checking dependencies..."
    
    if (-not (Test-Path node_modules)) {
        Write-Info "Installing frontend dependencies..."
        npm install
        Write-Success "Frontend dependencies installed"
    } else {
        Write-Success "Frontend dependencies already installed"
    }
    
    if (-not (Test-Path server\node_modules)) {
        Write-Info "Installing server dependencies..."
        Push-Location server
        npm install
        Pop-Location
        Write-Success "Server dependencies installed"
    } else {
        Write-Success "Server dependencies already installed"
    }
    
    Write-Host ""
}

# Setup database
function Initialize-Database {
    Write-Info "Setting up database..."
    
    if (Test-Command docker) {
        Write-Info "Starting PostgreSQL in Docker..."
        docker-compose -f docker-compose.dev.yml up -d postgres
        Write-Info "Waiting for database to be ready..."
        Start-Sleep -Seconds 5
        Write-Success "Database container started"
    }
    
    # Generate Prisma client
    if (-not (Test-Path node_modules\.prisma)) {
        Write-Info "Generating Prisma client..."
        npm run zenstack
        npm run prisma:generate
        Write-Success "Prisma client generated"
    }
    
    # Push schema
    Write-Info "Pushing database schema..."
    npm run prisma:push 2>$null
    
    # Seed database
    Write-Info "Seeding database..."
    npm run db:seed 2>$null
    
    Write-Success "Database setup complete"
    Write-Host ""
}

# Start servers
function Start-Servers {
    Write-Info "Starting development servers..."
    Write-Host ""
    Write-Success "🚀 MediVerse is starting!"
    Write-Host ""
    Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
    Write-Host "API:       http://localhost:3000" -ForegroundColor Cyan
    Write-Host "WebSocket: http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
    Write-Host ""
    
    # Start in separate windows
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    Start-Sleep -Seconds 3
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run server"
    
    Write-Success "Servers started in separate windows"
}

# Main menu
function Show-Menu {
    Write-Host ""
    Write-Host "Choose startup mode:" -ForegroundColor Cyan
    Write-Host "1) Full setup + start (first time or after changes)"
    Write-Host "2) Quick start (skip setup, just run servers)"
    Write-Host "3) Database only (setup/reset database)"
    Write-Host "4) Docker mode (infrastructure only)"
    Write-Host "5) Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter choice [1-5]"
    Write-Host ""
    
    switch ($choice) {
        "1" {
            Write-Header
            Test-Prerequisites
            Initialize-Environment
            Install-Dependencies
            Initialize-Database
            Start-Servers
        }
        "2" {
            Write-Header
            Write-Info "Quick start mode - skipping setup checks"
            Write-Host ""
            Start-Servers
        }
        "3" {
            Write-Header
            Write-Info "Database setup mode"
            Write-Host ""
            Initialize-Database
            Write-Success "Database setup complete!"
        }
        "4" {
            Write-Header
            Write-Info "Starting Docker infrastructure..."
            docker-compose -f docker-compose.dev.yml up -d
            Write-Success "Docker containers started:"
            Write-Host ""
            docker-compose -f docker-compose.dev.yml ps
            Write-Host ""
            Write-Info "Now run: npm run dev (in another terminal)"
        }
        "5" {
            Write-Info "Exiting..."
            exit 0
        }
        default {
            Write-Error "Invalid choice!"
            Show-Menu
        }
    }
}

# Main execution
if ($args.Count -eq 0) {
    Show-Menu
} else {
    switch ($args[0]) {
        "--full" {
            Write-Header
            Test-Prerequisites
            Initialize-Environment
            Install-Dependencies
            Initialize-Database
            Start-Servers
        }
        "--quick" {
            Write-Header
            Start-Servers
        }
        "--db" {
            Write-Header
            Initialize-Database
        }
        "--docker" {
            Write-Header
            docker-compose -f docker-compose.dev.yml up -d
            docker-compose -f docker-compose.dev.yml ps
        }
        "--help" {
            Write-Host "MediVerse Startup Script"
            Write-Host ""
            Write-Host "Usage: .\start.ps1 [option]"
            Write-Host ""
            Write-Host "Options:"
            Write-Host "  (no args)   Show interactive menu"
            Write-Host "  --full      Full setup + start"
            Write-Host "  --quick     Quick start (skip setup)"
            Write-Host "  --db        Setup database only"
            Write-Host "  --docker    Start Docker containers only"
            Write-Host "  --help      Show this help"
        }
        default {
            Write-Error "Unknown option: $($args[0])"
            Write-Host "Use --help for usage information"
            exit 1
        }
    }
}

