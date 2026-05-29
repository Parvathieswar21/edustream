import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { LogIn, GraduationCap, Users, UserCog, Heart } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | 'parent'>('student');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const getLabel = () => {
    switch (role) {
      case 'student': return 'Admission Number';
      case 'parent': return 'Student Admission Number';
      case 'teacher': return 'Teacher ID';
      case 'admin': return 'Admin ID';
      default: return 'ID Number';
    }
  };

  const getPlaceholder = () => {
    switch (role) {
      case 'student': return 'e.g. ADM2026001';
      case 'parent': return 'e.g. ADM2026001';
      case 'teacher': return 'e.g. TCH2026001';
      case 'admin': return 'e.g. ADM001';
      default: return 'Enter your ID';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password,
        role
      });
      setAuth(response.data.user, response.data.token);
      navigate(`/${role}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">EduStream</h1>
          <p className="opacity-80">School Management System</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'student', label: 'Student', icon: Users },
              { id: 'parent', label: 'Parent', icon: Heart },
              { id: 'teacher', label: 'Teacher', icon: UserCog },
              { id: 'admin', label: 'Admin', icon: LogIn },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as any)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${role === r.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
              >
                <r.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{getLabel()}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={getPlaceholder()}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
