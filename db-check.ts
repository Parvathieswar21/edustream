import db, { initDb } from './server/db.ts';

try {
    initDb();
    const counts = {
        users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
        classes: db.prepare('SELECT COUNT(*) as count FROM classes').get(),
    };
    console.log('Database Health Check:', counts);
} catch (error) {
    console.error('Database Health Check Failed:', error);
}
