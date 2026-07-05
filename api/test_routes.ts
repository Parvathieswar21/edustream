import authRoutes from '../server/routes/auth.ts';
import adminRoutes from '../server/routes/admin.ts';
import teacherRoutes from '../server/routes/teacher.ts';
import studentRoutes from '../server/routes/student.ts';

export default function handler(req: any, res: any) {
  res.status(200).json({ status: "success", message: "All routes imported successfully!" });
}
