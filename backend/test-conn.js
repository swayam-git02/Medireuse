import dotenv from 'dotenv';
import connectDB, { closeDB, getDatabaseLocation } from './src/config/db.js';

dotenv.config();

try {
  console.log('Attempting SQLite initialization...');
  const db = connectDB();
  const result = db.prepare('SELECT 1 AS ok').get();

  if (result?.ok !== 1) {
    throw new Error('SQLite health check query failed');
  }

  console.log(`SQLite ready at: ${getDatabaseLocation()}`);
  closeDB();
  process.exit(0);
} catch (error) {
  console.error('SQLite initialization failed:', error.message);
  console.error(error);
  process.exit(2);
}
