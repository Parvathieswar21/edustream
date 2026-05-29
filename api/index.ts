import express from 'express';
import authRoutes from '../server/routes/auth.ts';
import adminRoutes from '../server/routes/admin.ts';
import teacherRoutes from '../server/routes/teacher.ts';
import studentRoutes from '../server/routes/student.ts';

const app = express();

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

export default app;
