# Restaurant Management System

A comprehensive restaurant management system built with Node.js, Express, PostgreSQL, and Docker.

## 🏗️ Architecture

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL 15
- **ORM**: Sequelize
- **Authentication**: Phone + OTP (Third-party service) + JWT
- **Containerization**: Docker + Docker Compose

## 📋 Features

### Authentication
- Phone-based OTP authentication via third-party service
- Stateless JWT tokens (30-day expiry)
- Role-based access control (Admin/Client)

### Menu Management (Admin)
- Categories (food types: Pizza, Noodles, Burgers)
- Items (versions within categories)
- Flexible sizing (Small, Medium, Large)
- Add-ons system with category and item-level assignments
- Add-ons inheritance from category to items

### Customer Features
- Browse menu with sizes and add-ons
- Multiple delivery addresses
- Place orders with customizations
- View order history

### Order Management
- Order lifecycle: Pending → Confirmed → Preparing → Ready → Completed
- Order cancellation with role-based rules
- Price snapshots for historical accuracy

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the following:
   - `JWT_SECRET`: Strong random secret (256-bit minimum)
   - `DB_PASSWORD`: Strong database password
   - `OTP_SERVICE_URL`: Your OTP service URL
   - `OTP_SERVICE_API_KEY`: Your OTP service API key
   - `ADMIN_PHONE`: Admin phone number

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec app npm run db:migrate
   ```

5. **Seed initial data**
   ```bash
   docker-compose exec app npm run db:seed
   ```

6. **Access the API**
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Development

**View logs**
```bash
docker-compose logs -f app
```

**Stop the application**
```bash
docker-compose down
```

**Reset database**
```bash
docker-compose exec app npm run db:reset
```

**Access PostgreSQL**
```bash
docker-compose exec db psql -U restaurant_user -d restaurant_db
```

## 📁 Project Structure

```
restaurant/
├── docker-compose.yml          # Docker Compose configuration
├── .env.example                # Environment variables template
├── DESIGN.md                   # Detailed design documentation
├── README.md                   # This file
├── app/                        # Node.js application
│   ├── Dockerfile
│   ├── package.json
│   ├── .sequelizerc           # Sequelize CLI configuration
│   ├── src/
│   │   ├── index.js           # Application entry point
│   │   ├── config/            # Configuration files
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── otpService.js
│   │   ├── migrations/        # Database migrations
│   │   ├── seeders/           # Database seeders
│   │   ├── models/            # Sequelize models
│   │   ├── controllers/       # API controllers
│   │   ├── routes/            # Express routes
│   │   ├── middleware/        # Express middleware
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   └── tests/                 # Tests
└── db/
    └── init/                  # Database initialization
        └── 01-init.sql        # User permissions
```

## 🗄️ Database Schema

The system uses 11 tables:

1. **users** - User accounts (phone-based auth)
2. **addresses** - User delivery addresses
3. **categories** - Food item types (Pizza, Noodles, etc.)
4. **items** - Versions within categories
5. **item_sizes** - Size pricing (Small, Medium, Large)
6. **add_ons** - Master catalog of add-ons
7. **category_add_ons** - Category-level add-ons (inherited)
8. **item_add_ons** - Item-level add-ons (supplements)
9. **orders** - Customer orders
10. **order_items** - Items in orders (with snapshots)
11. **order_item_add_ons** - Add-ons in order items (with snapshots)

See [DESIGN.md](DESIGN.md) for detailed schema and relationships.

## 🔧 Available Scripts

### Application
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload

### Database
- `npm run db:migrate` - Run pending migrations
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed` - Run all seeders
- `npm run db:seed:undo` - Undo all seeders
- `npm run db:reset` - Reset database (undo all, migrate, seed)

### Testing & Linting
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and get JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Menu Endpoints (Public)
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `GET /api/items` - List all items
- `GET /api/items/:id` - Get item details with sizes and add-ons

### Admin Endpoints
- Category, Item, Size, and Add-on management
- Order status updates
- View all orders

### Customer Endpoints
- Address management
- Order creation and viewing

See [DESIGN.md](DESIGN.md) for complete API documentation.

## 🔒 Security

- Phone-OTP authentication (no password storage)
- Stateless JWT tokens
- Rate limiting on OTP requests
- Input validation and sanitization
- SQL injection prevention (ORM)
- CORS configuration
- Helmet.js security headers

## 📝 License

ISC

## 👥 Contributing

This is a learning project. Contributions are welcome!

## 📞 Support

For issues and questions, please open a GitHub issue.
