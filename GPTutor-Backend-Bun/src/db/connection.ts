import postgres from 'postgres';
import { config } from '../config/env';

export const sql = postgres({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  username: config.database.user,
  password: config.database.password,
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connection established');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
