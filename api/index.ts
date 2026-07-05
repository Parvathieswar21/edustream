import express from 'express';
import authRoutes from '../server/routes/auth';
import adminRoutes from '../server/routes/admin';
import teacherRoutes from '../server/routes/teacher';
import studentRoutes from '../server/routes/student';
import aiRoutes from '../server/routes/ai';
import assignmentRoutes from '../server/routes/assignments';

const app = express();

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assignments', assignmentRoutes);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global error caught:", err);
  res.status(500).json({
    message: 'Internal Server Error (Global Handler)',
    error: err.message,
    stack: err.stack,
    code: err.code
  });
});

export default app;
