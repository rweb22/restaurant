# Setup Guide

This guide will help you set up and run the Restaurant Management System.

## Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**

Optional (for local development without Docker):
- **Node.js** (version 18+)
- **PostgreSQL** (version 15+)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd restaurant
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update these critical values:

```bash
# Generate a strong JWT secret (256-bit minimum)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Set a strong database password
DB_PASSWORD=your_strong_database_password

# Configure your OTP service
OTP_SERVICE_URL=https://api.your-otp-service.com
OTP_SERVICE_API_KEY=your_otp_service_api_key

# Set admin phone number (with country code)
ADMIN_PHONE=+1234567890
```

**Generate a strong JWT secret:**
```bash
# On Linux/Mac
openssl rand -base64 64

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 3. Start the Application

Using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL 15 image
- Build the Node.js application image
- Start both containers
- Create a Docker network for communication

### 4. Verify Services are Running

Check container status:

```bash
docker-compose ps
```

You should see both `restaurant_app` and `restaurant_db` running.

View logs:

```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f db
```

### 5. Run Database Migrations

Create all database tables:

```bash
docker-compose exec app npm run db:migrate
```

Or using Makefile:

```bash
make migrate
```

### 6. Seed Initial Data

Insert admin user and sample data:

```bash
docker-compose exec app npm run db:seed
```

Or using Makefile:

```bash
make seed
```

This will create:
- Admin user (using phone from `ADMIN_PHONE` env variable)
- Sample categories (Pizza, Noodles, Burgers)
- Sample add-ons (Extra Cheese, Jalapeños, etc.)

### 7. Test the API

Health check:

```bash
curl http://localhost:3000/health
```

API info:

```bash
curl http://localhost:3000/api
```

Expected response:
```json
{
  "message": "Restaurant Management API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "categories": "/api/categories",
    ...
  }
}
```

## Common Commands

### Using Makefile (Recommended)

```bash
make help          # Show all available commands
make up            # Start services
make down          # Stop services
make restart       # Restart services
make logs          # View logs
make shell         # Access app container shell
make db-shell      # Access PostgreSQL shell
make migrate       # Run migrations
make seed          # Run seeders
make reset         # Reset database (undo, migrate, seed)
make clean         # Remove all containers and volumes
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Access app shell
docker-compose exec app sh

# Access database
docker-compose exec db psql -U restaurant_user -d restaurant_db

# Run migrations
docker-compose exec app npm run db:migrate

# Run seeders
docker-compose exec app npm run db:seed

# Reset database
docker-compose exec app npm run db:reset
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5432 is already in use, update `.env`:

```bash
PORT=3001
DB_PORT=5433
```

Then restart:

```bash
docker-compose down
docker-compose up -d
```

### Database Connection Issues

Check if database is healthy:

```bash
docker-compose exec db pg_isready -U restaurant_user
```

View database logs:

```bash
docker-compose logs db
```

### Migration Errors

Reset and re-run migrations:

```bash
docker-compose exec app npm run db:migrate:undo:all
docker-compose exec app npm run db:migrate
```

### Clean Slate

Remove everything and start fresh:

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

## Next Steps

1. **Read the documentation**: Check [DESIGN.md](DESIGN.md) for detailed architecture and API documentation
2. **Implement features**: Start building controllers, routes, and models
3. **Test the API**: Use Postman or curl to test endpoints
4. **Add authentication**: Implement the OTP service integration
5. **Build the frontend**: Create a client application

## Development Workflow

1. Make code changes in `app/src/`
2. The app will auto-reload (nodemon in dev mode)
3. View logs: `make logs`
4. Test changes: `curl http://localhost:3000/...`
5. Run tests: `make test`

## Production Deployment

For production deployment:

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use strong secrets and passwords
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up monitoring and logging
7. Configure backups for PostgreSQL

See [DESIGN.md](DESIGN.md) Section 8 for security considerations.

