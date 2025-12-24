.PHONY: help up down restart logs shell db-shell migrate seed reset clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs (use 'make logs service=app' for specific service)
	docker-compose logs -f $(service)

shell: ## Access app container shell
	docker-compose exec app sh

db-shell: ## Access PostgreSQL shell
	docker-compose exec db psql -U restaurant_user -d restaurant_db

migrate: ## Run database migrations
	docker-compose exec app npm run db:migrate

seed: ## Run database seeders
	docker-compose exec app npm run db:seed

reset: ## Reset database (undo, migrate, seed)
	docker-compose exec app npm run db:reset

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

install: ## Install dependencies
	docker-compose exec app npm install

test: ## Run tests
	docker-compose exec app npm test

lint: ## Run linter
	docker-compose exec app npm run lint

lint-fix: ## Fix linting issues
	docker-compose exec app npm run lint:fix

