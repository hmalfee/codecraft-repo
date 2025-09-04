#!/bin/bash
echo "🛑 Stopping Docker containers..."
docker compose down

echo "🗑️ Removing PostgreSQL data volume..."
docker volume rm codecraft-repo_postgres_data || true

echo "🚀 Starting Docker containers..."
docker compose up -d

echo "⏱️ Waiting a moment for containers to initialize..."
sleep 5

echo "🔄 Applying database migrations..."
pnpm drizzle-kit push

echo "✨ Database reset complete!"
