import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'school.db'));

try {
    const columns = db.prepare("PRAGMA table_info(users)").all();
    console.log('Columns in users table:', columns.map((c: any) => c.name));
} catch (error) {
    console.error('Error:', error);
}
