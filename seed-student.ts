import db from './server/db.ts';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        // Add a class
        const classResult = db.prepare('INSERT INTO classes (name, section) VALUES (?, ?)').run('Grade 10', 'A');
        const classId = classResult.lastInsertRowid;
        console.log('Class created with ID:', classId);

        // Add a student
        const hashedPassword = await bcrypt.hash('password123', 10);
        const studentResult = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
            .run('John Doe', 'john.doe@example.com', hashedPassword, 'student');
        const studentId = studentResult.lastInsertRowid;
        console.log('Student created with ID:', studentId);

        // Link student to class
        db.prepare('INSERT INTO student_assignments (student_id, class_id) VALUES (?, ?)')
            .run(studentId, classId);
        console.log('Student assigned to class.');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
