-- Database initialization script
-- This script runs when the PostgreSQL container is first created
-- It grants necessary permissions to the application user

-- Grant all privileges on the database to the application user
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO restaurant_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO restaurant_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO restaurant_user;

