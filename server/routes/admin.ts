import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

// Dashboard Stats
router.get('/dashboard-stats', (req, res) => {
  try {
    const teachersCount = (db.prepare("SELECT count(*) as count FROM users WHERE role = 'teacher'").get() as any)?.count || 0;
    const studentsCount = (db.prepare("SELECT count(*) as count FROM users WHERE role = 'student'").get() as any)?.count || 0;
    const classesCount = (db.prepare("SELECT count(*) as count FROM classes").get() as any)?.count || 0;

    const payments = db.prepare("SELECT amount_paid FROM payments").all();
    const revenue = payments?.reduce((acc: number, curr: any) => acc + (curr.amount_paid || 0), 0) || 0;

    // Mocking attendance trends for now
    const attendanceTrends = [
      { date: 'Mon', percentage: 95 },
      { date: 'Tue', percentage: 98 },
      { date: 'Wed', percentage: 97 },
      { date: 'Thu', percentage: 99 },
      { date: 'Fri', percentage: 96 },
    ];
    const feeCollection = [
      { name: 'Paid', value: revenue > 0 ? revenue : 15000, color: '#10b981' },
      { name: 'Pending', value: 4500, color: '#f59e0b' }
    ];
    const performanceTrends = [
      { subject: 'Math', score: 85 },
      { subject: 'Science', score: 92 },
      { subject: 'English', score: 78 },
      { subject: 'History', score: 88 },
    ];

    res.json({
      teachers: teachersCount,
      students: studentsCount,
      classes: classesCount,
      revenue,
      attendanceTrends,
      feeCollection,
      performanceTrends
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Teacher Management
router.get('/teachers', (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let queryStr = "SELECT id, name, email, phone, address FROM users WHERE role = 'teacher'";
    let countQueryStr = "SELECT count(*) as count FROM users WHERE role = 'teacher'";
    const params: any[] = [];

    if (search) {
      const searchTerm = `%${search}%`;
      queryStr += " AND (name LIKE ? OR email LIKE ?)";
      countQueryStr += " AND (name LIKE ? OR email LIKE ?)";
      params.push(searchTerm, searchTerm);
    }

    queryStr += " LIMIT ? OFFSET ?";
    
    const teachers = db.prepare(queryStr).all(...params, Number(limit), offset);
    const total = (db.prepare(countQueryStr).get(...params) as any)?.count || 0;

    res.json({ data: teachers, total });
  } catch (error) {
    console.error('Teachers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.post('/teachers', async (req, res) => {
  const { name, email, username, password, phone, address } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, username, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(name, email, username, hashedPassword, 'teacher', phone, address);
    res.json({ message: 'Teacher added successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Email or username already exists' });
  }
});

router.delete('/teachers/:id', (req, res) => {
  try {
    db.prepare("DELETE FROM users WHERE id = ? AND role = 'teacher'").run(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
});

router.put('/teachers/:id', (req, res) => {
  const { name, email, username, phone, address } = req.body;
  try {
    db.prepare(`UPDATE users SET name=?, email=?, username=?, phone=?, address=? WHERE id=? AND role='teacher'`)
      .run(name, email, username, phone, address, req.params.id);
    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update teacher' });
  }
});

// Student Management
router.get('/students', (req, res) => {
  const { search = '', class_id = '', page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let queryStr = `
      SELECT u.id, u.name, u.email, u.phone, u.address, c.name as class_name, c.section, c.id as class_id
      FROM users u
      LEFT JOIN student_assignments sa ON u.id = sa.student_id
      LEFT JOIN classes c ON sa.class_id = c.id
      WHERE u.role = 'student'
    `;
    let countQueryStr = `
      SELECT count(*) as count 
      FROM users u
      LEFT JOIN student_assignments sa ON u.id = sa.student_id
      WHERE u.role = 'student'
    `;
    const params: any[] = [];

    if (search) {
      const searchTerm = `%${search}%`;
      const searchCondition = " AND (u.name LIKE ? OR u.email LIKE ?)";
      queryStr += searchCondition;
      countQueryStr += searchCondition;
      params.push(searchTerm, searchTerm);
    }

    if (class_id) {
      const classCondition = " AND sa.class_id = ?";
      queryStr += classCondition;
      countQueryStr += classCondition;
      params.push(class_id);
    }

    queryStr += " LIMIT ? OFFSET ?";
    
    const students = db.prepare(queryStr).all(...params, Number(limit), offset);
    const total = (db.prepare(countQueryStr).get(...params) as any)?.count || 0;

    res.json({ data: students, total });
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.post('/students', async (req, res) => {
  const { name, email, username, password, phone, address, class_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (name, email, username, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, email, username, hashedPassword, 'student', phone, address);
    
    const studentId = result.lastInsertRowid;

    if (class_id && studentId) {
      db.prepare('INSERT INTO student_assignments (student_id, class_id) VALUES (?, ?)').run(studentId, class_id);
    }

    res.json({ message: 'Student added successfully' });
  } catch (error) {
    console.error('Student add error:', error);
    res.status(400).json({ message: 'Email or username already exists' });
  }
});

router.put('/students/:id', (req, res) => {
  const { name, email, username, phone, address, class_id } = req.body;
  const student_id = req.params.id;
  try {
    db.prepare(`UPDATE users SET name=?, email=?, username=?, phone=?, address=? WHERE id=? AND role='student'`)
      .run(name, email, username, phone, address, student_id);

    if (class_id) {
      const existing = db.prepare('SELECT id FROM student_assignments WHERE student_id = ?').get(student_id);
      if (existing) {
        db.prepare('UPDATE student_assignments SET class_id = ? WHERE student_id = ?').run(class_id, student_id);
      } else {
        db.prepare('INSERT INTO student_assignments (student_id, class_id) VALUES (?, ?)').run(student_id, class_id);
      }
    } else {
      db.prepare('DELETE FROM student_assignments WHERE student_id = ?').run(student_id);
    }

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update student' });
  }
});

router.delete('/students/:id', (req, res) => {
  const student_id = req.params.id;
  try {
    db.prepare('DELETE FROM student_assignments WHERE student_id = ?').run(student_id);
    db.prepare("DELETE FROM users WHERE id = ? AND role = 'student'").run(student_id);
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Class Management
router.get('/classes', (req, res) => {
  try {
    const classes = db.prepare('SELECT * FROM classes').all();
    res.json(classes || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

router.post('/classes', (req, res) => {
  const { name, section } = req.body;
  try {
    db.prepare('INSERT INTO classes (name, section) VALUES (?, ?)').run(name, section);
    res.json({ message: 'Class created' });
  } catch (error) {
    res.status(400).json({ message: 'Class already exists' });
  }
});

router.delete('/classes/:id', (req, res) => {
  const class_id = req.params.id;
  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM student_assignments WHERE class_id = ?').run(class_id);
      db.prepare('DELETE FROM teacher_assignments WHERE class_id = ?').run(class_id);
      db.prepare('DELETE FROM subjects WHERE class_id = ?').run(class_id);
      db.prepare('DELETE FROM classes WHERE id = ?').run(class_id);
    });
    transaction();
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete class' });
  }
});

// Fee Management
router.get('/fees', (req, res) => {
  try {
    const fees = db.prepare(`
      SELECT f.*, c.name as class_name, c.section
      FROM fees f
      LEFT JOIN classes c ON f.class_id = c.id
    `).all();
    res.json(fees || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
});

router.post('/fees', (req, res) => {
  const { class_id, amount, due_date, description } = req.body;
  try {
    db.prepare('INSERT INTO fees (class_id, amount, due_date, description) VALUES (?, ?, ?, ?)').run(class_id, amount, due_date, description);
    res.json({ message: 'Fee structure created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create fee structure' });
  }
});

router.get('/payments', (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT p.*, u.name as student_name, f.description as fee_description
      FROM payments p
      LEFT JOIN users u ON p.student_id = u.id
      LEFT JOIN fees f ON p.fee_id = f.id
      ORDER BY p.payment_date DESC
    `).all();
    res.json(payments || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.post('/payments', (req, res) => {
  const { student_id, fee_id, amount_paid, status } = req.body;
  try {
    db.prepare('INSERT INTO payments (student_id, fee_id, amount_paid, status) VALUES (?, ?, ?, ?)').run(student_id, fee_id, amount_paid, status);
    res.json({ message: 'Payment recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Subject Management
router.get('/subjects', (req, res) => {
  try {
    const subjects = db.prepare(`
      SELECT s.*, c.name as class_name, c.section
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
    `).all();
    res.json(subjects || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/subjects', (req, res) => {
  const { name, class_id } = req.body;
  try {
    db.prepare('INSERT INTO subjects (name, class_id) VALUES (?, ?)').run(name, class_id);
    res.json({ message: 'Subject created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.delete('/subjects/:id', (req, res) => {
  const subject_id = req.params.id;
  try {
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM teacher_assignments WHERE subject_id = ?').run(subject_id);
      db.prepare('DELETE FROM subjects WHERE id = ?').run(subject_id);
    });
    transaction();
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete subject' });
  }
});

// Assign Teacher
router.post('/assign-teacher', (req, res) => {
  const { teacher_id, class_id, subject_id } = req.body;
  try {
    db.prepare('INSERT INTO teacher_assignments (teacher_id, class_id, subject_id) VALUES (?, ?, ?)').run(teacher_id, class_id, subject_id);
    res.json({ message: 'Teacher assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign teacher' });
  }
});

export default router;
