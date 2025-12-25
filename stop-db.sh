#!/bin/bash

# Stop PostgreSQL Database in Docker

set -e

echo "🛑 Stopping PostgreSQL Database..."
echo ""

docker compose -f docker-compose.db-only.yml down

echo ""
echo "✅ PostgreSQL stopped successfully!"
echo ""
echo "💡 To remove all data, run:"
echo "   docker compose -f docker-compose.db-only.yml down -v"
echo ""

