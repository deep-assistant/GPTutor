import { readdir } from 'fs/promises';
import { join } from 'path';
import { sql } from './connection';

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  // Create migrations table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS schema_version (
      installed_rank INTEGER PRIMARY KEY,
      version VARCHAR(50),
      description VARCHAR(200),
      script VARCHAR(1000),
      checksum INTEGER,
      installed_by VARCHAR(100),
      installed_on TIMESTAMP DEFAULT NOW(),
      execution_time INTEGER,
      success BOOLEAN
    )
  `;

  try {
    // Note: For this implementation, we rely on the existing Flyway migrations
    // The Java backend has already created the schema
    // This is just a placeholder for future Bun-specific migrations
    console.log('✅ Migrations check complete');
    console.log('ℹ️  Using existing database schema from Java backend');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

if (import.meta.main) {
  runMigrations()
    .then(() => {
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
