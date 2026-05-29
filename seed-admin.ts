import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'school.db'));

async function createAdmin() {
  const name = 'Admin User';
  const email = 'admin@example.com';
  const password = 'password123';
  const role = 'admin';
  const username = 'ADM001';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)');
    stmt.run(name, email, username, hashedPassword, role);
    console.log('✅ Admin user created successfully!');
    console.log('Admin ID: ADM001');
    console.log('Password: password123');
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log('ℹ️ Admin user already exists.');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

createAdmin();
