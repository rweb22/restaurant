#!/bin/bash

# Start all services for native development
# This script starts the database and provides instructions for starting apps

set -e

echo "🎬 Starting Restaurant Management System (Native Mode)"
echo "========================================================"
echo ""

# Start database
echo "Step 1: Starting PostgreSQL Database..."
./start-db.sh

echo ""
echo "Step 2: Setting up Backend API..."
./setup-backend.sh

echo ""
echo "========================================================"
echo "✅ Database and Backend are ready!"
echo ""
echo "📱 Next Steps:"
echo ""
echo "1️⃣  Start Backend API (in a new terminal):"
echo "   cd app && npm run dev"
echo ""
echo "2️⃣  Start Client App (in another terminal):"
echo "   cd client-app && npm start"
echo ""
echo "3️⃣  Start Admin App (in another terminal - optional):"
echo "   cd admin-app && npm start"
echo ""
echo "🌐 URLs:"
echo "   Backend API:  http://localhost:3000"
echo "   Client App:   http://localhost:19006 (Expo DevTools)"
echo "   Admin App:    http://localhost:19006 (Expo DevTools)"
echo ""
echo "💡 Tips:"
echo "   - For Android emulator, use http://10.0.2.2:3000/api in app config"
echo "   - For physical device, use http://YOUR_IP:3000/api"
echo "   - Press 'w' in Expo to open web version"
echo "   - Press 'a' for Android, 'i' for iOS"
echo ""

