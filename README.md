# Restaurant Management System

A comprehensive restaurant management system with mobile apps for customers and admins, built with Node.js, React Native, PostgreSQL, and Docker.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Start the Application

```bash
# Start database and backend
docker compose up -d

# The backend API will be available at http://localhost:3000
```

### Start Mobile Apps

```bash
# Client App (Customer-facing)
cd client-app
npm install
npm start

# Admin App (Restaurant management)
cd admin-app
npm install
npm start
```

## 📚 Documentation

All documentation has been organized in the `/docs` directory:

### Core Documentation
- **[Setup Guide](docs/SETUP.md)** - Complete setup instructions
- **[API Reference](docs/API_ENDPOINTS.md)** - All API endpoints
- **[System Design](docs/DESIGN.md)** - Architecture and design decisions
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Directory organization

### Feature Documentation
- **[Operating Hours](docs/OPERATING_HOURS_DESIGN.md)** - Restaurant hours management
- **[Payment & Refund Testing](docs/PAYMENT_AND_REFUND_TESTING_GUIDE.md)** - Payment flow testing

### App-Specific Documentation
- **[Client App](docs/client-app/)** - Customer mobile app docs
  - [Environment Configuration](docs/client-app/ENV_CONFIGURATION.md)
  - [Design Tokens](docs/client-app/DESIGN_TOKENS.md)
  - [Client App README](docs/client-app/README.md)
- **[Admin App](docs/admin-app/)** - Admin mobile app docs
  - [Navigation Structure](docs/admin-app/NAVIGATION_STRUCTURE.md)
- **[Testing](docs/tests/)** - Testing documentation
  - [Testing README](docs/tests/README.md)
  - [Testing Quickstart](docs/tests/QUICKSTART.md)

## 🏗️ Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL 15 (Sequelize ORM)
- JWT Authentication
- Docker + Docker Compose

### Mobile Apps
- React Native + Expo SDK 54
- React Navigation v7
- React Native Paper (Material Design)
- TanStack Query (React Query)
- Zustand (State Management)

### Payment & Services
- UPIGateway (Payment Gateway)
- 2Factor.in (OTP Service)
- Google Maps (Address Selection)

## 📱 Features

### Customer App
- Phone-based OTP authentication
- Browse menu with categories and items
- Customizable orders (sizes, add-ons)
- Multiple delivery addresses
- Order tracking
- Payment via UPI

### Admin App
- Menu management (categories, items, sizes, add-ons)
- Order management and status updates
- Operating hours configuration
- Manual restaurant open/close controls
- Refund processing

## 🔧 Environment Configuration

Both mobile apps use `.env` files for configuration. See:
- [Client App Environment Setup](docs/client-app/ENV_CONFIGURATION.md)
- Admin App: Similar setup (copy from client-app)

## 📦 Project Structure

```
restaurant/
├── app/                    # Backend API (Node.js/Express)
├── client-app/             # Customer mobile app (React Native)
├── admin-app/              # Admin mobile app (React Native)
├── db/                     # Database initialization scripts
├── docs/                   # All documentation
├── tests/                  # Integration and unit tests
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## 🧪 Testing

```bash
cd tests
npm install
npm test
```

See [Testing Documentation](docs/tests/README.md) for details.

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

