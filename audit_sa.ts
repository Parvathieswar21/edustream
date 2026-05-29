import Database from 'better-sqlite3';

const db = new Database('./school.db');

console.log('--- Student Assignments Raw ---');
try {
    const sa = db.prepare('SELECT * FROM student_assignments').all();
    console.log(JSON.stringify(sa, null, 2));
} catch (err) {
    console.error(err);
}
