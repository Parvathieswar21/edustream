-- Users table (Admin, Teacher, Student)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'teacher', 'student')) NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  UNIQUE(name, section)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  class_id BIGINT REFERENCES classes(id)
);

-- Teacher-Class Assignment
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id BIGSERIAL PRIMARY KEY,
  teacher_id BIGINT REFERENCES users(id),
  class_id BIGINT REFERENCES classes(id),
  subject_id BIGINT REFERENCES subjects(id)
);

-- Student-Class Assignment
CREATE TABLE IF NOT EXISTS student_assignments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id),
  class_id BIGINT REFERENCES classes(id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id),
  class_id BIGINT REFERENCES classes(id),
  date DATE NOT NULL,
  status TEXT CHECK(status IN ('present', 'absent')) NOT NULL
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES users(id),
  subject_id BIGINT REFERENCES subjects(id),
  marks_obtained INTEGER,
  total_marks INTEGER,
  grade TEXT
);

-- Homework/Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  class_id BIGINT REFERENCES classes(id),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT REFERENCES classes(id),
  teacher_id BIGINT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT REFERENCES assignments(id),
  student_id BIGINT REFERENCES users(id),
  file_path TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'submitted', 'graded')) DEFAULT 'submitted',
  grade TEXT,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ENABLE ROW LEVEL SECURITY (RLS)
-- For now, let's enable it but allow all access for development
-- You should configure specific policies later.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON users FOR ALL USING (true);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON classes FOR ALL USING (true);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON subjects FOR ALL USING (true);

ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON teacher_assignments FOR ALL USING (true);

ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON student_assignments FOR ALL USING (true);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON attendance FOR ALL USING (true);

ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON marks FOR ALL USING (true);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for now" ON announcements FOR ALL USING (true);
