import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'school.db');

export default function handler(req: any, res: any) {
  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);
    res.status(200).json({ status: "success", message: "Database connection successful!", dbPath });
  } catch (e: any) {
    res.status(200).json({ status: "error", message: e.message, stack: e.stack, dbPath });
  }
}
