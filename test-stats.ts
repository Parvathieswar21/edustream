import db, { initDb } from './server/db.ts';

initDb();

try {
    const teachersCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").get() as any).count;
    console.log('Teachers:', teachersCount);
    const studentsCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get() as any).count;
    console.log('Students:', studentsCount);
    const classesCount = (db.prepare('SELECT COUNT(*) as count FROM classes').get() as any).count;
    console.log('Classes:', classesCount);
} catch (error: any) {
    console.error('Error in stats compute:', error.message);
}
