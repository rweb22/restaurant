# Quick Start Guide - Native Development

Run PostgreSQL in Docker, everything else natively.

## 🚀 One-Command Setup

```bash
./start-all.sh
```

This will:
1. ✅ Start PostgreSQL in Docker
2. ✅ Install backend dependencies
3. ✅ Run database migrations
4. ✅ Seed initial data

## 📱 Start the Apps

### Terminal 1: Backend API
```bash
cd app
npm run dev
```
**URL**: http://localhost:3000

### Terminal 2: Client App (Customer)
```bash
cd client-app
npm start
```
Press `w` for web, `a` for Android, `i` for iOS

### Terminal 3: Admin App (Restaurant Staff)
```bash
cd admin-app
npm start
```
Press `w` for web, `a` for Android, `i` for iOS

## 🛠️ Individual Commands

### Database Only
```bash
./start-db.sh          # Start PostgreSQL
./stop-db.sh           # Stop PostgreSQL
```

### Backend Setup
```bash
./setup-backend.sh     # Setup backend (migrations + seeds)
```

## 📱 Mobile Device Configuration

### iOS Simulator / Web
```javascript
// client-app/src/constants/config.js
BASE_URL: 'http://localhost:3000/api'
```

### Android Emulator
```javascript
// client-app/src/constants/config.js
BASE_URL: 'http://10.0.2.2:3000/api'
```

### Physical Device
1. Find your computer's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update config:
   ```javascript
   // client-app/src/constants/config.js
   BASE_URL: 'http://192.168.x.x:3000/api'  // Use your IP
   ```

3. Ensure phone and computer are on same WiFi

## 🗄️ Database Commands

```bash
# Access PostgreSQL shell
docker compose -f docker-compose.db-only.yml exec db psql -U restaurant_user -d restaurant_db

# Run migrations
cd app && npm run db:migrate

# Seed data
cd app && npm run db:seed

# Reset database
cd app && npm run db:reset

# View database logs
docker compose -f docker-compose.db-only.yml logs -f db
```

## 🧪 Testing

```bash
# Backend tests
cd app
npm test

# Test payment flow
./test-payment.sh
```

## 🔧 Troubleshooting

### Backend can't connect to database
```bash
# Check if database is running
docker ps

# Check database logs
docker compose -f docker-compose.db-only.yml logs db

# Restart database
./stop-db.sh && ./start-db.sh
```

### Mobile app can't connect to backend
1. Check backend is running: `curl http://localhost:3000/health`
2. Update API URL in app config (see Mobile Device Configuration above)
3. Ensure CORS allows your origin (check `app/.env` → `ALLOWED_ORIGINS`)

### Port 5432 already in use
```bash
# Stop local PostgreSQL
sudo service postgresql stop  # Linux
# or stop via System Preferences on macOS

# Or change Docker port
# Edit docker-compose.db-only.yml: "5433:5432"
# Update app/.env: DB_PORT=5433
```

### Expo shows blank screen
```bash
# Clear cache and restart
cd client-app  # or admin-app
npm start -- --clear
```

## 🛑 Stop Everything

```bash
# Stop database
./stop-db.sh

# Stop backend (Ctrl+C in terminal)
# Stop client app (Ctrl+C in terminal)
# Stop admin app (Ctrl+C in terminal)
```

## 📚 Full Documentation

See [NATIVE_SETUP.md](./NATIVE_SETUP.md) for detailed documentation.

## 🎯 Default Credentials

### Admin Login
- **Phone**: +911234567890 (or value from `ADMIN_PHONE` in `.env`)
- **OTP**: Any 6-digit code (mock OTP service accepts all)

### Database
- **Host**: localhost
- **Port**: 5432
- **Database**: restaurant_db
- **User**: restaurant_user
- **Password**: restaurant_password

## 🔑 Environment Variables

All configured in `app/.env` (copied from `.env.local`):
- `PAYMENT_USE_MOCK=true` - Mock payment gateway
- `DB_HOST=localhost` - Connect to Docker PostgreSQL
- `ALLOWED_ORIGINS` - CORS configuration

## 📊 Project Structure

```
restaurant/
├── app/                    # Backend API (Node.js + Express)
├── client-app/             # Customer mobile app (React Native + Expo)
├── admin-app/              # Admin mobile app (React Native + Expo)
├── db/                     # Database initialization scripts
├── docker-compose.db-only.yml  # PostgreSQL only
├── .env.local              # Local environment template
├── start-all.sh            # Setup everything
├── start-db.sh             # Start database only
├── stop-db.sh              # Stop database
└── setup-backend.sh        # Setup backend only
```

## ✨ Next Steps

1. ✅ Start all services (done with `./start-all.sh`)
2. 🔐 Login to admin app and add menu items
3. 📱 Browse menu in client app
4. 🛒 Test order creation
5. 💳 Test payment flow (mock mode)
6. 🎨 Customize branding and colors
7. 🚀 Deploy to production

Happy coding! 🎉

