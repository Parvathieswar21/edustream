import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'school.db'));

try {
    console.log('Adding username column...');
    try {
        db.exec("ALTER TABLE users ADD COLUMN username TEXT");
        console.log('✅ Column added.');
    } catch (e) {
        console.log('ℹ️ Column already exists or error:', e.message);
    }

    console.log('Updating user IDs...');
    db.prepare("UPDATE users SET username = 'ADM001' WHERE email = 'admin@example.com'").run();
    db.prepare("UPDATE users SET username = 'TCH001' WHERE email = 'teacher@example.com'").run();
    db.prepare("UPDATE users SET username = 'STU001' WHERE email = 'student@example.com'").run();
    db.prepare("UPDATE users SET username = 'STU002' WHERE email = 'john.doe@example.com'").run();
    console.log('✅ IDs updated.');
} catch (error) {
    console.error('❌ Error:', error.message);
}
