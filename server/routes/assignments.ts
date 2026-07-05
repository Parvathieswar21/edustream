import express from 'express';
import multer from 'multer';
import db from '../db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `assignment-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.use(authenticate);

// ================= TEACHER ROUTES =================

router.get('/teacher/class/:classId', authorize(['teacher']), (req: AuthRequest, res) => {
  try {
    const assignments = db.prepare('SELECT * FROM assignments WHERE class_id = ? ORDER BY created_at DESC').all(req.params.classId);
    res.json(assignments || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.post('/teacher', authorize(['teacher']), upload.single('file'), (req: AuthRequest, res) => {
  const { title, description, due_date, class_id } = req.body;
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    db.prepare('INSERT INTO assignments (class_id, teacher_id, title, description, file_path, due_date) VALUES (?, ?, ?, ?, ?, ?)')
      .run(class_id, req.user?.id, title, description, file_path, due_date);
    res.json({ message: 'Assignment created successfully' });
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

router.get('/submissions/:assignmentId', authorize(['teacher']), (req: AuthRequest, res) => {
  try {
    const submissions = db.prepare(`
      SELECT s.*, u.name as student_name
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ?
    `).all(req.params.assignmentId);
    res.json(submissions || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ================= STUDENT ROUTES =================

router.get('/student', authorize(['student']), (req: AuthRequest, res) => {
  try {
    // Get student's classes
    const classes = db.prepare('SELECT class_id FROM student_assignments WHERE student_id = ?').all(req.user?.id) as any[];
    if (!classes.length) return res.json([]);
    
    const classIds = classes.map(c => c.class_id);
    const placeholders = classIds.map(() => '?').join(',');

    // Fetch assignments
    const assignments = db.prepare(`SELECT * FROM assignments WHERE class_id IN (${placeholders}) ORDER BY created_at DESC`).all(...classIds) as any[];

    // Fetch student's submissions for these assignments
    const submissions = db.prepare('SELECT * FROM submissions WHERE student_id = ?').all(req.user?.id) as any[];

    // Map submission status
    const result = assignments.map(a => {
      const sub = submissions.find(s => s.assignment_id === a.id);
      return {
        ...a,
        submission_status: sub ? sub.status : 'pending',
        submission_file: sub ? sub.file_path : null,
        grade: sub ? sub.grade : null
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Student assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.post('/student/submit', authorize(['student']), upload.single('file'), (req: AuthRequest, res) => {
  const { assignment_id } = req.body;
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const file_path = `/uploads/${req.file.filename}`;

  try {
    // Check if submission already exists
    const existing = db.prepare('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?').get(assignment_id, req.user?.id);
    
    if (existing) {
      db.prepare('UPDATE submissions SET file_path = ?, status = "submitted", submitted_at = CURRENT_TIMESTAMP WHERE assignment_id = ? AND student_id = ?')
        .run(file_path, assignment_id, req.user?.id);
    } else {
      db.prepare('INSERT INTO submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)')
        .run(assignment_id, req.user?.id, file_path);
    }

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

export default router;
