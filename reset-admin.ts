import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'school.db'));

async function resetAdmin() {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Delete all admins to start fresh
        db.prepare("DELETE FROM users WHERE role = 'admin'").run();

        // Create new admin
        db.prepare("INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)")
            .run('Admin User', 'admin@example.com', 'ADM001', hashedPassword, 'admin');

        console.log('✅ Admin credentials reset successfully!');
        console.log('Role: Admin');
        console.log('Admin ID: ADM001');
        console.log('Password: password123');
    } catch (error) {
        console.error('❌ Error resetting admin:', error.message);
    }
}

resetAdmin();
