import express from 'express';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import db from '../db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.use(authenticate);
router.use(authorize(['teacher']));

// View Assigned Classes
router.get('/my-classes', (req: AuthRequest, res) => {
  try {
    const assignments = db.prepare(`
      SELECT c.id, c.name, c.section,
             (SELECT count(*) FROM student_assignments sa WHERE sa.class_id = c.id) as student_count
      FROM teacher_assignments ta
      JOIN classes c ON ta.class_id = c.id
      WHERE ta.teacher_id = ?
    `).all(req.user?.id);

    // Group to remove duplicates if teacher assigned to multiple subjects in same class
    const classMap = new Map();
    assignments?.forEach((c: any) => {
      if (!classMap.has(c.id)) {
        classMap.set(c.id, {
          id: c.id,
          name: c.name,
          section: c.section,
          student_count: c.student_count
        });
      }
    });

    res.json(Array.from(classMap.values()));
  } catch (error) {
    console.error('Fetch classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// View Students in a Class
router.get('/class-students/:classId', (req, res) => {
  try {
    const students = db.prepare(`
      SELECT u.id, u.name, u.email
      FROM student_assignments sa
      JOIN users u ON sa.student_id = u.id
      WHERE sa.class_id = ?
    `).all(req.params.classId);

    res.json(students || []);
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Mark Attendance
router.post('/attendance', (req, res) => {
  const { class_id, date, attendance_data } = req.body; 

  try {
    const stmt = db.prepare('INSERT INTO attendance (student_id, class_id, date, status) VALUES (?, ?, ?, ?)');
    const transaction = db.transaction((records: any[]) => {
      for (const record of records) {
        stmt.run(record.student_id, class_id, date, record.status);
      }
    });
    transaction(attendance_data);

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Upload Marks
router.post('/marks', (req, res) => {
  const { student_id, subject_id, marks_obtained, total_marks, grade } = req.body;
  try {
    db.prepare('INSERT INTO marks (student_id, subject_id, marks_obtained, total_marks, grade) VALUES (?, ?, ?, ?, ?)')
      .run(student_id, subject_id, marks_obtained, total_marks, grade);
    res.json({ message: 'Marks uploaded' });
  } catch (error) {
    console.error('Upload marks error:', error);
    res.status(500).json({ error: 'Failed to upload marks' });
  }
});

// Post Announcement/Homework
router.post('/announcements', upload.single('file'), (req: AuthRequest, res) => {
  const { title, content, class_id } = req.body;
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    db.prepare('INSERT INTO announcements (title, content, file_path, class_id, created_by) VALUES (?, ?, ?, ?, ?)')
      .run(title, content, file_path, class_id, req.user?.id);
    res.json({ message: 'Announcement posted' });
  } catch (error) {
    console.error('Announcement error:', error);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});

// View Profile
router.get('/profile', (req: AuthRequest, res) => {
  try {
    const profile = db.prepare('SELECT id, name, username, email, role, phone, address, profile_image, email_verified, phone_verified FROM users WHERE id = ?').get(req.user?.id);
    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update Profile
router.put('/profile', (req: AuthRequest, res) => {
  const { name, phone, address } = req.body;
  try {
    db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?').run(name, phone, address, req.user?.id);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload Profile Image
router.post('/profile-image', upload.single('image'), (req: AuthRequest, res) => {
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    db.prepare('UPDATE users SET profile_image = ? WHERE id = ?').run(file_path, req.user?.id);
    res.json({ message: 'Profile image updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile image' });
  }
});

// View Subjects
router.get('/subjects', (req, res) => {
  try {
    const subjects = db.prepare('SELECT * FROM subjects').all();
    res.json(subjects || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// ========== STUDENT MANAGEMENT FOR TEACHERS ==========

// View Students (Filtered by Teacher's assigned classes)
router.get('/students', (req: AuthRequest, res) => {
  const { page = 1, search = '', class_id = '' } = req.query;
  const limit = 10;
  const offset = (Number(page) - 1) * limit;

  try {
    // 1. Get the classes this teacher is assigned to
    const myClasses = db.prepare('SELECT DISTINCT class_id FROM teacher_assignments WHERE teacher_id = ?').all(req.user?.id) as any[];
    const classIds = myClasses.map(c => c.class_id);
    
    if (classIds.length === 0) {
      return res.json({ data: [], total: 0 }); // Teacher has no classes
    }

    // Prepare dynamic query based on search and optional class filter
    let baseQuery = `
      SELECT u.id, u.name, u.email, u.username, u.phone, u.profile_image, c.id as class_id, c.name as class_name, c.section
      FROM users u
      JOIN student_assignments sa ON u.id = sa.student_id
      JOIN classes c ON sa.class_id = c.id
      WHERE u.role = 'student' AND c.id IN (${classIds.join(',')})
    `;
    const params: any[] = [];

    if (search) {
      baseQuery += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (class_id) {
      // Ensure the selected class_id is actually one the teacher teaches
      if (classIds.includes(Number(class_id))) {
        baseQuery += ` AND c.id = ?`;
        params.push(class_id);
      } else {
        return res.status(403).json({ error: 'Not authorized for this class' });
      }
    }

    // Count Total
    const countQuery = `SELECT count(*) as count FROM (${baseQuery})`;
    const totalResult = db.prepare(countQuery).get(...params) as any;
    const total = totalResult.count;

    // Paginate Data
    const dataQuery = `${baseQuery} ORDER BY u.id DESC LIMIT ? OFFSET ?`;
    const students = db.prepare(dataQuery).all(...params, limit, offset);

    res.json({ data: students || [], total });
  } catch (error) {
    console.error('Teacher fetch students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});



// Add New Student
router.post('/students', (req: AuthRequest, res) => {
  const { name, email, username, password, phone, address, class_id } = req.body;
  try {
    // Verify teacher is assigned to this class
    const isAssigned = db.prepare('SELECT 1 FROM teacher_assignments WHERE teacher_id = ? AND class_id = ?').get(req.user?.id, class_id);
    if (!isAssigned) {
      return res.status(403).json({ error: 'You can only add students to classes you are assigned to.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (name, email, username, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, email, username, hashedPassword, 'student', phone, address);
    
    const studentId = result.lastInsertRowid;

    if (class_id && studentId) {
      db.prepare('INSERT INTO student_assignments (student_id, class_id) VALUES (?, ?)').run(studentId, class_id);
    }

    res.json({ message: 'Student added successfully' });
  } catch (error) {
    console.error('Teacher add student error:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Edit Student
router.put('/students/:id', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, email, username, phone, address, class_id } = req.body;
  
  try {
    // Verify teacher is permitted to edit this student
    const studentAssignment = db.prepare('SELECT class_id FROM student_assignments WHERE student_id = ?').get(id) as any;
    const teacherAssignment = db.prepare('SELECT 1 FROM teacher_assignments WHERE teacher_id = ? AND class_id = ?').get(req.user?.id, studentAssignment?.class_id);
    
    if (!teacherAssignment) {
      return res.status(403).json({ error: 'Not authorized to edit this student.' });
    }

    db.prepare('UPDATE users SET name=?, email=?, username=?, phone=?, address=? WHERE id=? AND role="student"')
      .run(name, email, username, phone, address, id);

    if (class_id) {
       // Also check if the newly selected class is one the teacher is assigned to 
       const newClassAuth = db.prepare('SELECT 1 FROM teacher_assignments WHERE teacher_id = ? AND class_id = ?').get(req.user?.id, class_id);
       if (!newClassAuth) {
           return res.status(403).json({ error: 'You can only reassign to classes you teach.' });
       }

       // Update or Insert assignment
       const existingAssignment = db.prepare('SELECT id FROM student_assignments WHERE student_id = ?').get(id);
       if (existingAssignment) {
           db.prepare('UPDATE student_assignments SET class_id = ? WHERE student_id = ?').run(class_id, id);
       } else {
           db.prepare('INSERT INTO student_assignments (student_id, class_id) VALUES (?, ?)').run(id, class_id);
       }
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Teacher edit student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete Student
router.delete('/students/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const studentAssignment = db.prepare('SELECT class_id FROM student_assignments WHERE student_id = ?').get(id) as any;
    const teacherAssignment = db.prepare('SELECT 1 FROM teacher_assignments WHERE teacher_id = ? AND class_id = ?').get(req.user?.id, studentAssignment?.class_id);
    
    if (!teacherAssignment) {
      return res.status(403).json({ error: 'Not authorized to delete this student.' });
    }

    db.transaction(() => {
      db.prepare('DELETE FROM student_assignments WHERE student_id = ?').run(id);
      db.prepare('DELETE FROM users WHERE id = ? AND role = "student"').run(id);
    })();

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Teacher delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;
