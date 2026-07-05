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
