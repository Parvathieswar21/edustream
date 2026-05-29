# EduStream - School Management System

## Setup Instructions

1. **Install Dependencies**:
   The system uses Node.js, Express, React, and SQLite (via better-sqlite3).
   All dependencies are pre-configured in this environment.

2. **Initialize Database**:
   The database is automatically initialized on server start. It creates a `school.db` file in the root directory.

3. **Create Initial Admin**:
   Since there are no users initially, you need to create an admin account.
   Use the setup endpoint (you can use `curl` or Postman):
   ```bash
   POST /api/auth/setup-admin
   {
     "name": "System Admin",
     "email": "admin@school.com",
     "password": "adminpassword"
   }
   ```

4. **Run the Application**:
   The application runs in full-stack mode.
   - Development: `npm run dev` (starts Express server with Vite middleware)
   - Production: `npm run build` then `npm start`

## Role-Based Access

### Admin
- **Login**: `admin@school.com` / `adminpassword` (after setup)
- **Features**: Manage Teachers, Students, Classes, Subjects.

### Teacher
- **Login**: Created by Admin.
- **Features**: Mark Attendance, View Classes, Post Announcements.

### Student
- **Login**: Created by Admin.
- **Features**: View Profile, Attendance, Marks, Announcements.

## Database Schema (SQLite)
- `users`: Stores all roles (admin, teacher, student).
- `classes`: School classes and sections.
- `subjects`: Academic subjects linked to classes.
- `teacher_assignments`: Maps teachers to subjects and classes.
- `student_assignments`: Maps students to classes.
- `attendance`: Daily student attendance records.
- `marks`: Student grades for subjects.
- `announcements`: Homework and school-wide notices.

## API Collection (Postman Examples)

### Auth
- `POST /api/auth/login`: `{email, password, role}`
- `POST /api/auth/setup-admin`: `{name, email, password}`

### Admin
- `GET /api/admin/teachers`: List all teachers
- `POST /api/admin/teachers`: Create new teacher
- `GET /api/admin/students`: List all students
- `POST /api/admin/classes`: Create new class

### Teacher
- `GET /api/teacher/my-classes`: Classes assigned to teacher
- `POST /api/teacher/attendance`: Mark attendance for a class
- `POST /api/teacher/announcements`: Post homework (supports file upload)

### Student
- `GET /api/student/profile`: View personal details
- `GET /api/student/attendance`: View attendance history
- `GET /api/student/announcements`: View class announcements
