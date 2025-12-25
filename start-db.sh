#!/bin/bash

# Start PostgreSQL Database in Docker
# This script starts only the database container for native development

set -e

echo "🐘 Starting PostgreSQL Database in Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start database container
docker compose -f docker-compose.db-only.yml up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 3

# Check if database is healthy
if docker compose -f docker-compose.db-only.yml ps | grep -q "healthy"; then
    echo "✅ PostgreSQL is running and healthy!"
else
    echo "⚠️  PostgreSQL is starting... checking status..."
    docker compose -f docker-compose.db-only.yml ps
fi

echo ""
echo "📊 Database Information:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: restaurant_db"
echo "  User: restaurant_user"
echo "  Password: restaurant_password"
echo ""
echo "🔧 Useful commands:"
echo "  View logs:        docker compose -f docker-compose.db-only.yml logs -f db"
echo "  Access psql:      docker compose -f docker-compose.db-only.yml exec db psql -U restaurant_user -d restaurant_db"
echo "  Stop database:    docker compose -f docker-compose.db-only.yml down"
echo "  Remove data:      docker compose -f docker-compose.db-only.yml down -v"
echo ""

