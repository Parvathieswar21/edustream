import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'school.db'));

async function testLogin(username: string, password: string, role: string) {
    console.log('Testing Login:', { username, role });
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND role = ?').get(username, role) as any;
    if (!user) {
        console.log('❌ User not found');
        return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (isMatch) {
        console.log('✅ Login Successful');
    } else {
        console.log('❌ Password mismatch');
    }
}

testLogin('ADM001', 'password123', 'admin');
