# ✅ Native Development Setup - Complete!

Your restaurant management system is now configured to run PostgreSQL in Docker while running all apps natively.

## 🎉 What's Been Set Up

### ✅ Database (PostgreSQL in Docker)
- **Status**: Running and healthy
- **Container**: `restaurant_db`
- **Host**: localhost:5432
- **Database**: restaurant_db
- **Credentials**: restaurant_user / restaurant_password

### ✅ Backend API (Native)
- **Location**: `./app`
- **Dependencies**: Installed
- **Environment**: Configured (`.env` created)
- **Database**: Migrated and seeded
- **Port**: 3000

### ✅ Client App (Native - React Native + Expo)
- **Location**: `./client-app`
- **Type**: Customer mobile app
- **Dependencies**: Ready to install

### ✅ Admin App (Native - React Native + Expo)
- **Location**: `./admin-app`
- **Type**: Restaurant management app
- **Dependencies**: Ready to install

## 🚀 Quick Start Commands

### Start Everything (Recommended)

```bash
# Terminal 1: Backend API
cd app
npm run dev

# Terminal 2: Client App
cd client-app
npm install  # First time only
npm start

# Terminal 3: Admin App (optional)
cd admin-app
npm install  # First time only
npm start
```

### Or Use Helper Scripts

```bash
# Start database only (already running)
./start-db.sh

# Stop database
./stop-db.sh

# Complete setup (database + backend)
./start-all.sh
```

### Or Use Makefile

```bash
# View all available commands
make -f Makefile.native help

# Start backend
make -f Makefile.native start-backend

# Start client app
make -f Makefile.native start-client

# Start admin app
make -f Makefile.native start-admin

# Database operations
make -f Makefile.native migrate
make -f Makefile.native seed
make -f Makefile.native db-shell
```

## 🌐 Access URLs

Once all services are running:

- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **Client App (Expo)**: http://localhost:19006
- **Admin App (Expo)**: http://localhost:19006 (different port if both running)

## 📱 Mobile App Configuration

### For Web/iOS Simulator
Already configured: `http://localhost:3000/api`

### For Android Emulator
Update these files:

**client-app/src/constants/config.js**:
```javascript
BASE_URL: 'http://10.0.2.2:3000/api'
```

**admin-app/src/constants/config.js**:
```javascript
apiUrl: 'http://10.0.2.2:3000/api'
```

### For Physical Device
1. Find your computer's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update config files with your IP:
   ```javascript
   BASE_URL: 'http://192.168.x.x:3000/api'
   ```

## 🔑 Default Login Credentials

### Admin Account
- **Phone**: +911234567890
- **OTP**: Any 6-digit code (mock OTP service)

### Test Client Account
Create via the client app's registration flow.

## 🗄️ Database Management

```bash
# Access PostgreSQL shell
docker compose -f docker-compose.db-only.yml exec db psql -U restaurant_user -d restaurant_db

# Run migrations
cd app && npm run db:migrate

# Seed data
cd app && npm run db:seed

# Reset database (undo, migrate, seed)
cd app && npm run db:reset

# View logs
docker compose -f docker-compose.db-only.yml logs -f db
```

## 🧪 Testing

```bash
# Backend tests
cd app
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Test payment flow
../test-payment.sh
```

## 📚 Documentation

- **Quick Start**: [QUICKSTART_NATIVE.md](./QUICKSTART_NATIVE.md)
- **Detailed Setup**: [NATIVE_SETUP.md](./NATIVE_SETUP.md)
- **API Endpoints**: [API_ENDPOINTS.md](./API_ENDPOINTS.md)
- **Database Design**: [DESIGN.md](./DESIGN.md)
- **Frontend Design**: [FRONTEND_DESIGN.md](./FRONTEND_DESIGN.md)

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if database is running
docker ps

# Check database logs
docker compose -f docker-compose.db-only.yml logs db

# Verify .env file exists
ls -la app/.env
```

### Mobile app can't connect
1. Check backend is running: `curl http://localhost:3000/health`
2. Verify API URL in app config
3. Check CORS settings in `app/.env`

### Port conflicts
```bash
# If port 5432 is in use
# Edit docker-compose.db-only.yml: "5433:5432"
# Update app/.env: DB_PORT=5433

# If port 3000 is in use
# Update app/.env: PORT=3001
# Update app configs to use new port
```

## 🎯 Next Steps

1. ✅ **Start Backend**: `cd app && npm run dev`
2. ✅ **Start Client App**: `cd client-app && npm start`
3. 📱 **Login to Admin App**: Add menu items
4. 🛒 **Test Client App**: Browse menu, place order
5. 💳 **Test Payments**: Currently in mock mode
6. 🎨 **Customize**: Update branding, colors, menu
7. 🚀 **Deploy**: See deployment documentation

## 🔄 Daily Development Workflow

```bash
# Morning: Start everything
./start-db.sh                    # Start database
cd app && npm run dev            # Terminal 1: Backend
cd client-app && npm start       # Terminal 2: Client
cd admin-app && npm start        # Terminal 3: Admin (optional)

# Evening: Stop everything
# Ctrl+C in each terminal
./stop-db.sh                     # Stop database
```

## 🎉 You're All Set!

Your development environment is ready. Start coding! 🚀

For questions or issues, check the documentation or create an issue.

