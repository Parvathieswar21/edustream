import express from 'express';
import db from '../db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['student']));

// View Profile
router.get('/profile', (req: AuthRequest, res) => {
  try {
    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.address, u.profile_image, u.email_verified, u.phone_verified, c.name as class_name, c.section as section
      FROM users u
      LEFT JOIN student_assignments sa ON u.id = sa.student_id
      LEFT JOIN classes c ON sa.class_id = c.id
      WHERE u.id = ?
    `).get(req.user?.id) as any;

    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// View Attendance
router.get('/attendance', (req: AuthRequest, res) => {
  try {
    const attendance = db.prepare(`
      SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC
    `).all(req.user?.id);

    res.json(attendance || []);
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// View Marks
router.get('/marks', (req: AuthRequest, res) => {
  try {
    const marks = db.prepare(`
      SELECT m.*, s.name as subject_name
      FROM marks m
      LEFT JOIN subjects s ON m.subject_id = s.id
      WHERE m.student_id = ?
    `).all(req.user?.id);

    res.json(marks || []);
  } catch (error) {
    console.error('Fetch marks error:', error);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// View Announcements/Homework
router.get('/announcements', (req: AuthRequest, res) => {
  try {
    const assignments = db.prepare('SELECT class_id FROM student_assignments WHERE student_id = ?').all(req.user?.id) as any[];
    const classIds = assignments.map(a => a.class_id);

    if (classIds.length === 0) {
      return res.json([]);
    }

    const placeholders = classIds.map(() => '?').join(',');
    const announcements = db.prepare(`
      SELECT a.*, u.name as teacher_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.class_id IN (${placeholders})
      ORDER BY a.created_at DESC
    `).all(...classIds);

    res.json(announcements || []);
  } catch (error) {
    console.error('Fetch announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// View Fees
router.get('/fees', (req: AuthRequest, res) => {
  try {
    const assignments = db.prepare('SELECT class_id FROM student_assignments WHERE student_id = ?').all(req.user?.id) as any[];
    const classIds = assignments.map(a => a.class_id);

    if (classIds.length === 0) {
      return res.json([]);
    }

    const placeholders = classIds.map(() => '?').join(',');
    const fees = db.prepare(`SELECT * FROM fees WHERE class_id IN (${placeholders})`).all(...classIds) as any[];
    
    if (fees.length === 0) {
      return res.json([]);
    }

    const feeIds = fees.map(f => f.id);
    const feePlaceholders = feeIds.map(() => '?').join(',');
    
    // Add student_id to payment search params
    const paymentParams = [req.user?.id, ...feeIds];
    const payments = db.prepare(`SELECT * FROM payments WHERE student_id = ? AND fee_id IN (${feePlaceholders})`).all(...paymentParams) as any[];

    const result = fees.map(f => {
      const p = payments.find(pay => pay.fee_id === f.id);
      return {
        ...f,
        amount_paid: p?.amount_paid || 0,
        payment_status: p?.status || null
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Pay Fee API
router.post('/pay-fee', (req: AuthRequest, res) => {
  const { fee_id, amount_paid } = req.body;

  if (!fee_id || !amount_paid) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    db.prepare('INSERT INTO payments (student_id, fee_id, amount_paid, status) VALUES (?, ?, ?, ?)')
      .run(req.user?.id, fee_id, amount_paid, 'paid');
    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Failed to record payment' });
  }
});

// Update Profile
router.put('/profile', (req: AuthRequest, res) => {
  const { name, phone, address } = req.body;
  try {
    db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?').run(name, phone, address, req.user?.id);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
