import Database from 'better-sqlite3';

const db = new Database('./school.db');

console.log('--- Subjects ---');
try {
    const subjects = db.prepare('SELECT * FROM subjects').all();
    console.log(JSON.stringify(subjects, null, 2));
} catch (err) {
    console.error(err);
}
