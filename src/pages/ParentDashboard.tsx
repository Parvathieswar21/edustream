import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  User,
  Book,
  ClipboardList,
  Bell,
  Camera,
  DollarSign,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import ProfileModal from '../components/ProfileModal';

export default function ParentDashboard() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [p, a, f, att, m] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/announcements'),
        api.get('/student/fees'),
        api.get('/student/attendance'),
        api.get('/student/marks')
      ]);
      setProfile(p.data);
      setAnnouncements(Array.isArray(a.data) ? a.data : []);
      if (Array.isArray(f.data)) setFees(f.data);
      setAttendance(Array.isArray(att.data) ? att.data : []);
      setMarks(Array.isArray(m.data) ? m.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    setUploading(true);
    try {
      await api.post('/student/profile-image', formData);
      fetchData();
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div className="p-8 text-slate-500">Loading student profile...</div>;

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Parent Portal</h1>
          <p className="text-slate-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4" />
          <span>Term 2: 2026</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl overflow-hidden border-4 border-white shadow-lg">
                  {profile?.profile_image ? (
                    <img src={profile.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0)
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white p-1.5 rounded-lg shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.name}</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Linked Student ID: #{profile?.id}</p>

              <div className="w-full space-y-3 text-sm flex-1">
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Class</span>
                  <span className="font-bold text-slate-900">{profile?.class_name} - {profile?.section}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500">Email</span>
                  <span className="font-bold text-slate-900 truncate ml-4">{profile?.email}</span>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full mt-4 bg-indigo-50 text-indigo-700 text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Edit Profile & Security
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
              Fee Summary
            </h3>
            <div className="space-y-4">
              {Array.isArray(fees) && fees.map((fee: any) => (
                <div key={fee.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-700">{fee.description}</span>
                    <span className="text-lg font-black text-slate-900">${fee.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${fee.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {fee.payment_status || 'PENDING'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Due: {new Date(fee.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => {}}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 transition-all group"
            >
              <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 font-bold">Attendance</p>
                <p className="text-xl font-black text-slate-900">
                  {attendance.length > 0
                    ? ((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </button>
            <button
              onClick={() => {}}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 transition-all group"
            >
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Book className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 font-bold">Academic Status</p>
                <p className="text-xl font-black text-slate-900">Active</p>
              </div>
            </button>
          </div>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Bell className="w-6 h-6 mr-3 text-amber-500" />
                Announcements
              </h2>
            </div>
            <div className="space-y-6">
              {announcements.length > 0 ? announcements.map((a: any) => (
                <div key={a.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-100 before:rounded-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{a.title}</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">{a.content}</p>
                  {a.file_path && (
                    <a
                      href={a.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Attachment</span>
                    </a>
                  )}
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {a.teacher_name?.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-400">Posted by {a.teacher_name}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Bell className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold">No announcements yet</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center mb-6">
              <Book className="w-6 h-6 mr-3 text-blue-500" />
              Child's Performance
            </h2>
            <div className="h-[250px] w-full">
              {marks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marks}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject_name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="marks_obtained" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                  No performance data available
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onProfileUpdate={fetchData}
      />
    </div>
  );
}
