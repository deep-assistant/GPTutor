#!/bin/sh

# Create data directory for database if it doesn't exist
mkdir -p /app/data

# Check if database exists
if [ ! -f /app/data/prod.db ]; then
    echo "Database does not exist, creating and applying migrations..."
fi

echo "Applying pending migrations..."
# Apply new migrations to existing DB
npx prisma migrate deploy
# Verify migration status
echo "Migration status:"
npx prisma migrate status

# Start the application
echo "Starting application..."
npm start
