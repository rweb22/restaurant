#!/bin/bash

# Setup and start backend API natively

set -e

echo "🚀 Setting up Backend API..."
echo ""

# Navigate to app directory
cd app

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.local..."
    cp ../.env.local .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🗄️  Setting up database..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
sleep 2

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Run seeders
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "🎯 To start the backend server, run:"
echo "   cd app && npm run dev"
echo ""
echo "📡 Backend will be available at: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/health"
echo ""

