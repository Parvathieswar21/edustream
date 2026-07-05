import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default function handler(req: any, res: any) {
  try {
    const Database = require('better-sqlite3');
    res.status(200).json({ status: "success", message: "better-sqlite3 required successfully!" });
  } catch (e: any) {
    res.status(200).json({ status: "error", message: e.message, stack: e.stack });
  }
}
