import db from './server/db.ts';

async function seedPortalData() {
    try {
        // Find the student John Doe
        const student = db.prepare('SELECT id FROM users WHERE email = ?').get('john.doe@example.com') as any;
        if (!student) {
            console.error('Student not found');
            return;
        }
        const studentId = student.id;

        // Find the class assignment
        const assignment = db.prepare('SELECT class_id FROM student_assignments WHERE student_id = ?').get(studentId) as any;
        if (!assignment) {
            console.error('No class assignment found');
            return;
        }
        const classId = assignment.class_id;

        // Add some attendance records
        const attendanceStmt = db.prepare('INSERT INTO attendance (student_id, class_id, date, status) VALUES (?, ?, ?, ?)');
        const dates = ['2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23'];
        for (const date of dates) {
            try {
                attendanceStmt.run(studentId, classId, date, Math.random() > 0.1 ? 'present' : 'absent');
            } catch (e) { } // Ignore duplicates
        }
        console.log('Attendance records seeded');

        // Ensure subjects exist for this class
        const subjects = ['Mathematics', 'Science', 'English', 'History'];
        const subjectStmt = db.prepare('INSERT OR IGNORE INTO subjects (name, class_id) VALUES (?, ?)');
        for (const name of subjects) {
            subjectStmt.run(name, classId);
        }

        const seededSubjects = db.prepare('SELECT id FROM subjects WHERE class_id = ?').all(classId) as any[];

        // Ensure fees exist for this class
        const feeStmt = db.prepare('INSERT OR IGNORE INTO fees (class_id, amount, due_date, description) VALUES (?, ?, ?, ?)');
        feeStmt.run(classId, 2500, '2026-03-01', 'Tuition Fee - Term 2');
        feeStmt.run(classId, 500, '2026-03-15', 'Lab & Library Fee');

        const fees = db.prepare('SELECT id, amount FROM fees WHERE class_id = ?').all(classId) as any[];

        // Add some marks
        const marksStmt = db.prepare('INSERT INTO marks (student_id, subject_id, marks_obtained, total_marks, grade) VALUES (?, ?, ?, ?, ?)');
        for (const sub of seededSubjects) {
            try {
                const marks = Math.floor(Math.random() * 20) + 80; // 80-100
                marksStmt.run(studentId, sub.id, marks, 100, marks >= 90 ? 'A+' : 'A');
            } catch (e) { } // Ignore duplicates
        }
        console.log('Marks seeded');

        // Add some payments
        const paymentStmt = db.prepare('INSERT INTO payments (student_id, fee_id, amount_paid, status) VALUES (?, ?, ?, ?)');
        for (const fee of fees) {
            try {
                paymentStmt.run(studentId, fee.id, fee.amount, 'paid');
            } catch (e) { }
        }
        console.log('Payments seeded');

    } catch (error) {
        console.error('Error seeding portal data:', error);
    }
}

seedPortalData();
