import Database from 'better-sqlite3';
import fs from 'fs';

const dbPath = './school.db';
const db = new Database(dbPath);

let output = '';
const log = (msg) => { output += msg + '\n'; console.log(msg); };

log(`--- Auditing ${dbPath} ---`);

log('--- Users ---');
try {
    const users = db.prepare('SELECT id, name, username, email, role FROM users').all();
    output += JSON.stringify(users, null, 2) + '\n';
} catch (err) {
    log('Error fetching users: ' + err.message);
}

log('\n--- Classes ---');
try {
    const classes = db.prepare('SELECT * FROM classes').all();
    output += JSON.stringify(classes, null, 2) + '\n';
} catch (err) {
    log('Error fetching classes: ' + err.message);
}

log('\n--- Teacher Assignments ---');
try {
    const assignments = db.prepare(`
    SELECT ta.id, u.name as teacher, c.name as class, s.name as subject
    FROM teacher_assignments ta
    JOIN users u ON ta.teacher_id = u.id
    JOIN classes c ON ta.class_id = c.id
    JOIN subjects s ON ta.subject_id = s.id
  `).all();
    output += JSON.stringify(assignments, null, 2) + '\n';
} catch (err) {
    log('Error fetching assignments: ' + err.message);
}

log('\n--- Student Assignments ---');
try {
    const sAssignments = db.prepare(`
    SELECT sa.id, u.name as student, c.name as class
    FROM student_assignments sa
    JOIN users u ON sa.student_id = u.id
    JOIN classes c ON sa.class_id = c.id
  `).all();
    output += JSON.stringify(sAssignments, null, 2) + '\n';
} catch (err) {
    log('Error fetching student assignments: ' + err.message);
}

fs.writeFileSync('audit_results.txt', output);
console.log('Results written to audit_results.txt');
