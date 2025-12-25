# Native Development Setup Guide

This guide explains how to run PostgreSQL in Docker while running the backend API, client-app, and admin-app natively on your machine.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Machine                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Backend API │  │  Client App  │  │  Admin App   │ │
│  │  (Node.js)   │  │ (React Native│  │ (React Native│ │
│  │  Port: 3000  │  │  Expo)       │  │  Expo)       │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
│         │                                               │
│         │ localhost:5432                                │
│         ▼                                               │
│  ┌─────────────────────────────────────────────┐       │
│  │         Docker Container                    │       │
│  │  ┌──────────────────────────────────────┐   │       │
│  │  │   PostgreSQL 15                      │   │       │
│  │  │   Port: 5432 (exposed to host)       │   │       │
│  │  └──────────────────────────────────────┘   │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Docker & Docker Compose** installed
- **Node.js 18+** installed
- **npm** or **yarn** installed
- **Git** installed

## Quick Start

### 1. Start PostgreSQL Database

```bash
# Start only the PostgreSQL database in Docker
docker compose -f docker-compose.db-only.yml up -d

# Verify database is running
docker compose -f docker-compose.db-only.yml ps

# Check database logs
docker compose -f docker-compose.db-only.yml logs -f db
```

### 2. Setup Backend API

```bash
# Navigate to backend directory
cd app

# Install dependencies
npm install

# Copy environment file
cp ../.env.local .env

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

The backend API will be available at: **http://localhost:3000**

### 3. Setup Client App (Customer Mobile App)

Open a new terminal:

```bash
# Navigate to client app directory
cd client-app

# Install dependencies
npm install

# Start Expo development server
npm start
```

Access options:
- **Web**: Press `w` to open in browser
- **Android**: Press `a` to open in Android emulator (requires Android Studio)
- **iOS**: Press `i` to open in iOS simulator (requires Xcode, macOS only)
- **Physical Device**: Scan QR code with Expo Go app

### 4. Setup Admin App (Restaurant Management App)

Open another new terminal:

```bash
# Navigate to admin app directory
cd admin-app

# Install dependencies
npm install

# Start Expo development server
npm start
```

Access options: Same as Client App

## Environment Configuration

### Backend API (.env)

The `.env.local` file is pre-configured for native development:

```bash
DB_HOST=localhost          # Connect to Docker PostgreSQL on localhost
PORT=3000                  # Backend API port
PAYMENT_USE_MOCK=true      # Use mock payment service for development
```

### Client App

Update `client-app/src/constants/config.js` if needed:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',  // For web/iOS simulator
  // For Android emulator, use: 'http://10.0.2.2:3000/api'
  // For physical device, use your computer's IP: 'http://192.168.x.x:3000/api'
};
```

### Admin App

Update `admin-app/src/constants/config.js` if needed:

```javascript
const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000/api',  // Same as client app
  },
};
```

## Database Management

### Access PostgreSQL Shell

```bash
docker compose -f docker-compose.db-only.yml exec db psql -U restaurant_user -d restaurant_db
```

### Run Migrations

```bash
cd app
npm run db:migrate
```

### Seed Database

```bash
cd app
npm run db:seed
```

### Reset Database

```bash
cd app
npm run db:reset  # Undo all, migrate, and seed
```

### Stop Database

```bash
docker compose -f docker-compose.db-only.yml down
```

### Stop Database and Remove Data

```bash
docker compose -f docker-compose.db-only.yml down -v
```

## Troubleshooting

### Backend can't connect to database

**Error**: `ECONNREFUSED localhost:5432`

**Solution**:
1. Verify database is running: `docker ps`
2. Check database logs: `docker compose -f docker-compose.db-only.yml logs db`
3. Ensure `DB_HOST=localhost` in `app/.env`

### Mobile apps can't connect to backend

**Error**: Network request failed

**Solution**:

**For iOS Simulator / Web**:
- Use `http://localhost:3000/api`

**For Android Emulator**:
- Use `http://10.0.2.2:3000/api` (Android emulator's special alias for host)

**For Physical Device**:
1. Find your computer's IP address:
   - macOS/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
2. Use `http://YOUR_IP:3000/api` (e.g., `http://192.168.1.100:3000/api`)
3. Ensure your phone and computer are on the same WiFi network

### Port 5432 already in use

**Error**: `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution**:
1. Stop local PostgreSQL: `sudo service postgresql stop` (Linux) or stop via System Preferences (macOS)
2. Or change port in `docker-compose.db-only.yml`: `"5433:5432"` and update `DB_PORT=5433` in `.env`

### Expo app shows blank screen

**Solution**:
1. Clear Metro bundler cache: `npm start -- --clear`
2. Clear Expo cache: `expo start -c`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

## Development Workflow

### Typical Development Session

```bash
# Terminal 1: Start database
docker compose -f docker-compose.db-only.yml up -d

# Terminal 2: Start backend
cd app && npm run dev

# Terminal 3: Start client app
cd client-app && npm start

# Terminal 4: Start admin app (optional)
cd admin-app && npm start
```

### Hot Reloading

- **Backend**: Nodemon automatically restarts on file changes
- **Client/Admin Apps**: Expo Fast Refresh updates on save

### Viewing Logs

```bash
# Database logs
docker compose -f docker-compose.db-only.yml logs -f db

# Backend logs
# Visible in Terminal 2 where you ran `npm run dev`

# Mobile app logs
# Visible in Expo DevTools or terminal where you ran `npm start`
```

## Testing

### Backend Tests

```bash
cd app
npm test                    # Run all tests
npm run test:unit          # Run unit tests only
npm run test:integration   # Run integration tests only
```

### API Testing

Use the test script:

```bash
cd app
chmod +x ../test-payment.sh
../test-payment.sh
```

Or use tools like:
- **Postman**: Import API endpoints
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension

## Next Steps

1. **Configure OTP Service**: Update `OTP_SERVICE_URL` and `OTP_SERVICE_API_KEY` in `.env`
2. **Configure Razorpay**: Update Razorpay credentials and set `PAYMENT_USE_MOCK=false`
3. **Add Sample Data**: Use seeders or manually add menu items via admin app
4. **Test Payment Flow**: Test order creation and payment processing

## Stopping Everything

```bash
# Stop database
docker compose -f docker-compose.db-only.yml down

# Stop backend (Ctrl+C in Terminal 2)
# Stop client app (Ctrl+C in Terminal 3)
# Stop admin app (Ctrl+C in Terminal 4)
```

## Additional Resources

- [Backend API Documentation](./API_ENDPOINTS.md)
- [Database Design](./DESIGN.md)
- [Frontend Design](./FRONTEND_DESIGN.md)
- [Payment Integration](./README.md#payment-integration)

