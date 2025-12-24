# Project Structure

Complete directory structure of the Restaurant Management System.

```
restaurant/
│
├── 📄 docker-compose.yml              # Docker Compose orchestration
├── 📄 Makefile                        # Convenience commands
├── 📄 .env.example                    # Environment variables template
├── 📄 .gitignore                      # Git ignore rules
├── 📄 README.md                       # Project overview and quick start
├── 📄 DESIGN.md                       # Detailed design documentation
├── 📄 SETUP.md                        # Step-by-step setup guide
├── 📄 PROJECT_STRUCTURE.md            # This file
│
├── 📁 app/                            # Node.js Application
│   ├── 📄 Dockerfile                  # App container configuration
│   ├── 📄 .dockerignore               # Docker ignore rules
│   ├── 📄 package.json                # NPM dependencies and scripts
│   ├── 📄 .sequelizerc                # Sequelize CLI configuration
│   │
│   ├── 📁 src/                        # Source code
│   │   ├── 📄 index.js                # Application entry point
│   │   │
│   │   ├── 📁 config/                 # Configuration files
│   │   │   ├── 📄 database.js         # Database connection config
│   │   │   ├── 📄 jwt.js              # JWT configuration
│   │   │   └── 📄 otpService.js       # OTP service configuration
│   │   │
│   │   ├── 📁 migrations/             # Database migrations (Sequelize)
│   │   │   ├── 📄 20241223000001-create-enums-and-users.js
│   │   │   ├── 📄 20241223000002-create-addresses.js
│   │   │   ├── 📄 20241223000003-create-categories-items.js
│   │   │   ├── 📄 20241223000004-create-item-sizes.js
│   │   │   ├── 📄 20241223000005-create-addons.js
│   │   │   └── 📄 20241223000006-create-orders.js
│   │   │
│   │   ├── 📁 seeders/                # Database seeders
│   │   │   └── 📄 20241223000001-initial-data.js
│   │   │
│   │   ├── 📁 models/                 # Sequelize models (to be created)
│   │   │   ├── 📄 User.js
│   │   │   ├── 📄 Address.js
│   │   │   ├── 📄 Category.js
│   │   │   ├── 📄 Item.js
│   │   │   ├── 📄 ItemSize.js
│   │   │   ├── 📄 AddOn.js
│   │   │   ├── 📄 CategoryAddOn.js
│   │   │   ├── 📄 ItemAddOn.js
│   │   │   ├── 📄 Order.js
│   │   │   ├── 📄 OrderItem.js
│   │   │   └── 📄 OrderItemAddOn.js
│   │   │
│   │   ├── 📁 controllers/            # API endpoint controllers (to be created)
│   │   │   ├── 📄 authController.js
│   │   │   ├── 📄 addressController.js
│   │   │   ├── 📄 categoryController.js
│   │   │   ├── 📄 itemController.js
│   │   │   ├── 📄 addOnController.js
│   │   │   └── 📄 orderController.js
│   │   │
│   │   ├── 📁 routes/                 # Express routes (to be created)
│   │   │   ├── 📄 auth.js
│   │   │   ├── 📄 addresses.js
│   │   │   ├── 📄 categories.js
│   │   │   ├── 📄 items.js
│   │   │   ├── 📄 addOns.js
│   │   │   └── 📄 orders.js
│   │   │
│   │   ├── 📁 middleware/             # Express middleware (to be created)
│   │   │   ├── 📄 auth.js             # JWT authentication
│   │   │   ├── 📄 roleCheck.js        # Role-based access control
│   │   │   ├── 📄 errorHandler.js     # Global error handler
│   │   │   ├── 📄 validation.js       # Request validation
│   │   │   └── 📄 rateLimiter.js      # Rate limiting
│   │   │
│   │   ├── 📁 services/               # Business logic services (to be created)
│   │   │   ├── 📄 otpService.js       # OTP integration
│   │   │   └── 📄 priceCalculator.js  # Order price calculation
│   │   │
│   │   └── 📁 utils/                  # Utility functions (to be created)
│   │       ├── 📄 logger.js           # Logging utility
│   │       ├── 📄 responseFormatter.js # API response formatter
│   │       └── 📄 phoneValidator.js   # Phone number validation
│   │
│   └── 📁 tests/                      # Tests (to be created)
│       ├── 📁 unit/
│       ├── 📁 integration/
│       └── 📄 setup.js
│
└── 📁 db/                             # Database files
    └── 📁 init/                       # PostgreSQL initialization
        └── 📄 01-init.sql             # User permissions setup
```

## File Descriptions

### Root Level

| File | Description |
|------|-------------|
| `docker-compose.yml` | Defines and orchestrates app and database containers |
| `Makefile` | Convenience commands for common operations |
| `.env.example` | Template for environment variables |
| `.gitignore` | Files and directories to ignore in Git |
| `README.md` | Project overview, features, and quick start guide |
| `DESIGN.md` | Comprehensive design documentation |
| `SETUP.md` | Detailed setup instructions |

### App Directory

| Directory/File | Description |
|----------------|-------------|
| `Dockerfile` | Container image definition for Node.js app |
| `package.json` | NPM dependencies, scripts, and metadata |
| `.sequelizerc` | Sequelize CLI paths configuration |
| `src/index.js` | Express app initialization and server startup |

### Configuration (`src/config/`)

| File | Description |
|------|-------------|
| `database.js` | PostgreSQL connection settings for Sequelize |
| `jwt.js` | JWT secret and expiration configuration |
| `otpService.js` | Third-party OTP service settings |

### Migrations (`src/migrations/`)

Sequential database schema changes:

1. **create-enums-and-users** - User roles, order status enums, users table
2. **create-addresses** - User delivery addresses
3. **create-categories-items** - Categories and items tables
4. **create-item-sizes** - Item size pricing
5. **create-addons** - Add-ons catalog and junction tables
6. **create-orders** - Orders and order items with snapshots

### Seeders (`src/seeders/`)

| File | Description |
|------|-------------|
| `initial-data.js` | Admin user, sample categories, and add-ons |

### Models (`src/models/`) - To Be Created

Sequelize ORM models for all 11 database tables.

### Controllers (`src/controllers/`) - To Be Created

API endpoint logic for authentication, menu management, orders, etc.

### Routes (`src/routes/`) - To Be Created

Express route definitions mapping URLs to controllers.

### Middleware (`src/middleware/`) - To Be Created

| File | Purpose |
|------|---------|
| `auth.js` | JWT token verification |
| `roleCheck.js` | Admin/client authorization |
| `errorHandler.js` | Centralized error handling |
| `validation.js` | Request data validation |
| `rateLimiter.js` | API rate limiting |

### Services (`src/services/`) - To Be Created

| File | Purpose |
|------|---------|
| `otpService.js` | Third-party OTP integration |
| `priceCalculator.js` | Order total calculation with add-ons |

### Utils (`src/utils/`) - To Be Created

Helper functions for logging, formatting, validation, etc.

### Database (`db/`)

| File | Description |
|------|-------------|
| `init/01-init.sql` | Grants permissions to application user |

## Next Steps

The following components need to be implemented:

1. ✅ Project structure and configuration
2. ✅ Database migrations
3. ✅ Database seeders
4. ⏳ Sequelize models
5. ⏳ Authentication middleware and controllers
6. ⏳ API routes and controllers
7. ⏳ Business logic services
8. ⏳ Tests
9. ⏳ API documentation (Swagger/OpenAPI)

See [DESIGN.md](DESIGN.md) Section 10.2 for the complete development roadmap.

