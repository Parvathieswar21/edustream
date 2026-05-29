import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ForgotPassword from './pages/ForgotPassword';
import LandingPage from './pages/LandingPage';
import TeacherManagement from './pages/admin/TeacherManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ClassManagement from './pages/admin/ClassManagement';
import FeeManagement from './pages/admin/FeeManagement';
import AttendancePage from './pages/teacher/AttendancePage';
import MarksPage from './pages/teacher/MarksPage';
import TeacherStudentManagement from './pages/teacher/StudentManagement';
import StudentAttendance from './pages/student/Attendance';
import StudentMarks from './pages/student/Marks';
import StudentFees from './pages/student/Fees';
import StudentAssignments from './pages/student/Assignments';
import TeacherAssignments from './pages/teacher/Assignments';
import { useState } from 'react';
import {
  LogOut,
  LayoutDashboard,
  UserCircle,
  Users,
  UserPlus,
  Layers,
  ClipboardCheck,
  FileText,
  BookOpen,
  DollarSign,
  Bell
} from 'lucide-react';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role: string }) => {
  const { user, token } = useAuthStore();
  if (!token || user?.role !== role) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  key?: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${isActive
          ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = [
    { title: "Exam Schedule", message: "Term 1 exam dates have been posted.", time: "1h ago" },
    { title: "Fee Reminder", message: "Quarterly fees are due in 3 days.", time: "2h ago" },
    { title: "New Assignment", message: "Mathematics homework assigned.", time: "5h ago" }
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/teachers', icon: UserPlus, label: 'Teachers' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/classes', icon: Layers, label: 'Academic Structure' },
    { to: '/admin/fees', icon: DollarSign, label: 'Fee Management' },
  ];

  const teacherLinks = [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/students', icon: Users, label: 'Students' },
    { to: '/teacher/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { to: '/teacher/marks', icon: FileText, label: 'Grading' },
    { to: '/teacher/assignments', icon: FileText, label: 'Assignments' },
  ];

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { to: '/student/marks', icon: FileText, label: 'Marks' },
    { to: '/student/fees', icon: DollarSign, label: 'Fees' },
    { to: '/student/assignments', icon: FileText, label: 'Assignments' },
  ];

  const parentLinks = [
    { to: '/parent', icon: LayoutDashboard, label: 'Dashboard' }
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teacherLinks : user?.role === 'parent' ? parentLinks : studentLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-3 text-indigo-600">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">EduStream</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-3 mb-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserCircle className="w-8 h-8" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative">
        {/* Floating Notification Bell */}
        <div className="absolute top-8 right-8 z-50">
           <button 
             onClick={() => setShowNotifs(!showNotifs)}
             className="relative bg-white p-3 rounded-full shadow-sm hover:shadow-lg transition-all border border-slate-100 group"
           >
             <Bell className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
             <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
           </button>
           
           {showNotifs && (
             <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-900">Notifications</h3>
                 <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold">3 New</span>
               </div>
               <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                 {notifications.map((n, i) => (
                   <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                     <p className="font-bold text-sm text-slate-900">{n.title}</p>
                     <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                     <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">{n.time}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {children}
      </main>
    </div>
  );
};

export default function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={token ? <Navigate to={`/${useAuthStore.getState().user?.role}`} /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/teachers" element={
          <ProtectedRoute role="admin">
            <Layout><TeacherManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute role="admin">
            <Layout><StudentManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/classes" element={
          <ProtectedRoute role="admin">
            <Layout><ClassManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/fees" element={
          <ProtectedRoute role="admin">
            <Layout><FeeManagement /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher" element={
          <ProtectedRoute role="teacher">
            <Layout><TeacherDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/attendance" element={
          <ProtectedRoute role="teacher">
            <Layout><AttendancePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/students" element={
          <ProtectedRoute role="teacher">
            <Layout><TeacherStudentManagement /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/marks" element={
          <ProtectedRoute role="teacher">
            <Layout><MarksPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/teacher/assignments" element={
          <ProtectedRoute role="teacher">
            <Layout><TeacherAssignments /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/student" element={
          <ProtectedRoute role="student">
            <Layout><StudentDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/student/attendance" element={
          <ProtectedRoute role="student">
            <Layout><StudentAttendance /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/student/marks" element={
          <ProtectedRoute role="student">
            <Layout><StudentMarks /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/student/fees" element={
          <ProtectedRoute role="student">
            <Layout><StudentFees /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/student/assignments" element={
          <ProtectedRoute role="student">
            <Layout><StudentAssignments /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/parent" element={
          <ProtectedRoute role="parent">
            <Layout><ParentDashboard /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

