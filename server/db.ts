import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure db directory or file exists if needed
const dbPath = path.join(__dirname, '..', 'school.db');

export const db = new Database(dbPath);

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
