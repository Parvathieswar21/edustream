import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  // Hardcoded emergency login bypass for testing without a database
  if (username === 'admin' && password === 'password123') {
    const token = jwt.sign(
      { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      user: {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    });
  }

  if (username === 'teacher' && password === 'password123' && role === 'teacher') {
    const token = jwt.sign(
      { id: 'teacher-1', role: 'teacher', email: 'teacher@example.com' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      user: {
        id: 'teacher-1',
        name: 'Teacher User',
        email: 'teacher@example.com',
        role: 'teacher'
      }
    });
  }

  if (username === 'student' && password === 'password123' && role === 'student') {
    const token = jwt.sign(
      { id: 'student-1', role: 'student', email: 'student@example.com' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      user: {
        id: 'student-1',
        name: 'Student User',
        email: 'student@example.com',
        role: 'student'
      }
    });
  }

  if (username === 'parent' && password === 'password123' && role === 'parent') {
    const token = jwt.sign(
      { id: 'student-1', role: 'parent', email: 'parent@example.com' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      user: {
        id: 'student-1',
        name: 'Parent User',
        email: 'parent@example.com',
        role: 'parent'
      }
    });
  }

  try {
    const queryRole = role === 'parent' ? 'student' : role;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND role = ?').get(username, queryRole) as any;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: role === 'parent' ? `${user.name}'s Parent` : user.name,
        email: user.email,
        role: role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
  }
});

// Initial Admin Creation (for setup)
router.post('/setup-admin', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    stmt.run(name, email, hashedPassword, 'admin');

    res.json({ message: 'Admin created successfully' });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    console.error('Setup admin error:', error);
    res.status(400).json({ message: 'Admin already exists or error' });
  }
});

// Simple in-memory OTP store for testing/demo
const otpStore = new Map<string, { otp: string, expires: number }>();

// Forgot Password - Send OTP
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  try {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`[DEV OTP] OTP for ${email} is ${otp}`); // For easy local testing

    res.json({ message: 'OTP sent successfully (check server logs)' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// Reset Password - Verify OTP & Update
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);
    
    // Clear OTP
    otpStore.delete(email);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

import { authenticate, AuthRequest } from '../middleware/auth.ts';

// ========== AUTHENTICATED SECURITY ROUTES ==========

// Send Verification OTP (Email or Phone)
router.post('/send-verification-otp', authenticate, (req: AuthRequest, res) => {
  const { type, value } = req.body; // type: 'email' | 'phone', value: actual email or phone

  if (!type || !value) {
    return res.status(400).json({ message: 'Type and value are required' });
  }

  try {
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `${req.user?.id}-${type}`; // Unique key per user and type

    otpStore.set(key, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 mins
    });

    console.log(`[DEV VERIFICATION OTP] OTP for ${type} (${value}) is ${otp}`);

    res.json({ message: `Verification OTP sent to ${type} (check server logs)` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', authenticate, (req: AuthRequest, res) => {
  const { type, otp } = req.body;

  if (!type || !otp) {
    return res.status(400).json({ message: 'Type and OTP are required' });
  }

  const key = `${req.user?.id}-${type}`;
  const record = otpStore.get(key);

  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    const column = type === 'email' ? 'email_verified' : 'phone_verified';
    db.prepare(`UPDATE users SET ${column} = 1 WHERE id = ?`).run(req.user?.id);
    
    otpStore.delete(key);
    res.json({ message: `${type} verified successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Change Password
router.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new passwords required' });
  }

  try {
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user?.id) as any;
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedNewPassword, req.user?.id);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;
