@echo off
REM ==============================================================================
REM QUICK START SCRIPT - School Management System Frontend (Windows)
REM ==============================================================================

echo.
echo 🚀 School Management System - Frontend Setup
echo ===============================================
echo.

REM Check Node.js
echo ✓ Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%
echo.

REM Check npm
echo ✓ Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install npm
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION%
echo.

REM Navigate to frontend
echo ✓ Changing to frontend directory...
cd /d "%~dp0frontend" || (
    echo ❌ Failed to navigate to frontend directory
    pause
    exit /b 1
)
echo ✓ In frontend directory
echo.

REM Install dependencies
echo 📦 Installing dependencies...
echo This may take a few minutes...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Check .env file
echo ✓ Checking configuration...
if not exist .env (
    echo ⚠️  .env file not found. Creating default...
    (
        echo VITE_API_BASE_URL=http://localhost:8080
    ) > .env
)
echo ✓ Configuration ready
echo.

REM Display startup message
echo ===============================================
echo ✅ Setup Complete!
echo ===============================================
echo.
echo 📝 To start the development server, run:
echo.
echo    npm run dev
echo.
echo Then open your browser to: http://localhost:3000
echo.
echo 💡 Quick Tips:
echo    - Make sure backend is running on http://localhost:8080
echo    - Use test credentials from your backend to login
echo    - Roles: ADMIN, TEACHER, STUDENT, PARENT
echo.
echo 📚 For more information:
echo    - See README.md for project overview
echo    - See FRONTEND_DOCUMENTATION.md for detailed architecture
echo    - See FRONTEND_BUILD_SUMMARY.md for implementation details
echo.
echo ===============================================
echo.

pause
