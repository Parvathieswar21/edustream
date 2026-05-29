import db from './server/db.ts';

const classes = db.prepare('SELECT * FROM classes').all();
console.log('Classes:', classes);

const students = db.prepare('SELECT * FROM users WHERE role = "student"').all();
console.log('Students:', students);
