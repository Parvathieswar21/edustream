import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'school.db'));

async function seedData() {
    const users = [
        { name: 'Teacher User', email: 'teacher@example.com', username: 'TCH001', password: 'password123', role: 'teacher' },
        { name: 'Student User', email: 'student@example.com', username: 'STU001', password: 'password123', role: 'student' }
    ];

    for (const user of users) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const stmt = db.prepare('INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)');
            stmt.run(user.name, user.email, user.username, hashedPassword, user.role);
            console.log(`✅ ${user.role} user created: ${user.username}`);
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                console.log(`ℹ️ ${user.role} user already exists: ${user.email}`);
            } else {
                console.error(`❌ Error creating ${user.role} user:`, error);
            }
        }
    }
}

seedData();
