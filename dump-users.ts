import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'school.db'));

try {
    const users = db.prepare("SELECT id, name, username, email, role FROM users").all();
    console.log(JSON.stringify(users, null, 2));
} catch (error) {
    console.error('Error:', error.message);
}
