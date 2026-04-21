#!/bin/bash

# ==============================================================================
# QUICK START SCRIPT - School Management System Frontend
# ==============================================================================

echo "🚀 School Management System - Frontend Setup"
echo "=============================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi
echo "✓ Node.js $(node --version)"
echo ""

# Check npm
echo "✓ Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi
echo "✓ npm $(npm --version)"
echo ""

# Navigate to frontend
cd "$(dirname "$0")/frontend" || exit
echo "✓ Changed to frontend directory"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Check .env file
echo "✓ Checking configuration..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating default..."
    echo "VITE_API_BASE_URL=http://localhost:8080" > .env
fi
echo "✓ Configuration ready"
echo ""

# Display startup message
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "📝 To start the development server, run:"
echo ""
echo "   npm run dev"
echo ""
echo "Then open your browser to: http://localhost:3000"
echo ""
echo "💡 Quick Tips:"
echo "   • Make sure backend is running on http://localhost:8080"
echo "   • Use test credentials from your backend to login"
echo "   • Roles: ADMIN, TEACHER, STUDENT, PARENT"
echo ""
echo "📚 For more information:"
echo "   • See README.md for project overview"
echo "   • See FRONTEND_DOCUMENTATION.md for detailed architecture"
echo "   • See FRONTEND_BUILD_SUMMARY.md for implementation details"
echo ""
echo "=============================================="
echo ""
