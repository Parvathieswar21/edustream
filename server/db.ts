import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure db directory or file exists if needed
const dbPath = path.join(__dirname, '..', 'school.db');

export let db: any;
let dbError: any = null;

try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
} catch (e: any) {
  console.error("Failed to initialize SQLite database:", e);
  dbError = e;
  db = new Proxy({}, {
    get(target, prop) {
      if (prop === 'prepare') {
        return (sql: string) => {
          return {
            get: (...args: any[]) => { throw new Error(`Database error on prepare.get. Init error: ${dbError?.message}\n${dbError?.stack}`); },
            all: (...args: any[]) => { throw new Error(`Database error on prepare.all. Init error: ${dbError?.message}\n${dbError?.stack}`); },
            run: (...args: any[]) => { throw new Error(`Database error on prepare.run. Init error: ${dbError?.message}\n${dbError?.stack}`); },
            exec: (...args: any[]) => { throw new Error(`Database error on prepare.exec. Init error: ${dbError?.message}\n${dbError?.stack}`); }
          };
        };
      }
      if (prop === 'exec') {
        return (...args: any[]) => {
          throw new Error(`Database error on exec. Init error: ${dbError?.message}\n${dbError?.stack}`);
        };
      }
      return (...args: any[]) => {
        throw new Error(`Database not initialized due to: ${dbError?.message}\n${dbError?.stack}`);
      };
    }
  });
}

export function initDb() {
  console.log(`Connected to local SQLite database at ${dbPath}`);
  
  // Create tables if they don't exist
  const initSql = fs.readFileSync(path.join(__dirname, '..', 'supabase_schema.sql'), 'utf8');
  db.exec(initSql);
  
  // Add new columns for OTP verification if they don't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN profile_image TEXT;`);
    console.log('Added profile_image column');
  } catch (e) { /* Column already exists */ }
  
  try {
    db.exec(`ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;`);
    console.log('Added email_verified column');
  } catch (e) { /* Column already exists */ }
  
  try {
    db.exec(`ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT 0;`);
    console.log('Added phone_verified column');
  } catch (e) { /* Column already exists */ }

  console.log('Database tables verified/initialized.');
}

export default db;
