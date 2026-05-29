import Database from 'better-sqlite3';

const db = new Database('./school.db');

async function fixData() {
    console.log('--- Fixing Data ---');

    const teacherId = 8; // teacher1
    const classId = 1; // Grade 10 - A

    const subjects = db.prepare('SELECT id FROM subjects WHERE class_id = ?').all(classId);

    if (subjects.length === 0) {
        console.log('No subjects found for class 1. Seeding some...');
        const seedSubjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
        for (const sName of seedSubjects) {
            db.prepare('INSERT INTO subjects (name, class_id) VALUES (?, ?)').run(sName, classId);
        }
    }

    const allSubjects = db.prepare('SELECT id FROM subjects WHERE class_id = ?').all(classId);

    for (const subject of allSubjects) {
        try {
            db.prepare('INSERT INTO teacher_assignments (teacher_id, class_id, subject_id) VALUES (?, ?, ?)')
                .run(teacherId, classId, subject.id);
            console.log(`Assigned teacher 8 to subject ${subject.id} in class 1`);
        } catch (err) {
            console.log(`Already assigned or error: ${err.message}`);
        }
    }

    console.log('Done!');
}

fixData();
