import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  Calendar,
  ClipboardCheck,
  FileText,
  Users,
  Layers,
  Camera,
  TrendingUp,
  Clock,
  ChevronRight,
  X
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ProfileModal from '../components/ProfileModal';
import AIInsightsWidget from '../components/AIInsightsWidget';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [classes, setClasses] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchData = async () => {
    try {
      const [c, p] = await Promise.all([
        api.get('/teacher/my-classes'),
        api.get('/teacher/profile')
      ]);
      setClasses(c.data);
      setProfile(p.data);
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
      await api.post('/teacher/profile-image', formData);
      fetchData();
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teacher Overview</h1>
          <p className="text-slate-500">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-200">
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
            <p className="text-sm font-bold text-slate-700">Active Session</p>
          </div>
        </div>
      </header>

      <AIInsightsWidget />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-28 h-28 rounded-3xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl overflow-hidden border-4 border-white shadow-xl">
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0) || '?'
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white p-2 rounded-xl shadow-lg border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all">
                <Camera className="w-5 h-5 text-slate-600" />
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{profile?.name}</h2>
            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              Senior Faculty
            </p>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">Classes</span>
                <span className="font-bold text-slate-900">{classes.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">Experience</span>
                <span className="font-bold text-slate-900">8 Years</span>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full mt-4 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Attendance', value: 'Mark Today', icon: ClipboardCheck, color: 'bg-emerald-500', shadow: 'shadow-emerald-100', path: '/teacher/attendance' },
              { label: 'Grading', value: 'Upload Marks', icon: FileText, color: 'bg-blue-500', shadow: 'shadow-blue-100', path: '/teacher/marks' },
              { label: 'Schedule', value: 'View Timetable', icon: Calendar, color: 'bg-amber-500', shadow: 'shadow-amber-100', path: '#' },
            ].map((item: any) => (
              <button
                key={item.label}
                onClick={() => item.path !== '#' && navigate(item.path)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
              >
                <div className={`${item.color} w-12 h-12 rounded-2xl text-white flex items-center justify-center mb-4 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500 font-bold mb-1">{item.label}</p>
                <p className="text-lg font-black text-slate-900 flex items-center">
                  {item.value}
                  <ChevronRight className="w-4 h-4 ml-2 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </p>
              </button>
            ))}
          </div>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Layers className="w-6 h-6 mr-3 text-indigo-600" />
                Assigned Classes
              </h2>
              <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((c: any) => (
                <div key={c.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
                  <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black text-slate-900">{c.name}</h3>
                      <span className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-slate-500 border border-slate-100">
                        Section {c.section}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center text-xs font-bold text-slate-400">
                        <Users className="w-4 h-4 mr-1.5" />
                        {c.student_count || 0} Students
                      </div>
                      <div className="flex items-center text-xs font-bold text-slate-400">
                        <Clock className="w-4 h-4 mr-1.5" />
                        Next: 10:30 AM
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate('/teacher/attendance')}
                        className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                      >
                        Mark Attendance
                      </button>
                      <button
                        onClick={() => navigate('/teacher/marks')}
                        className="px-4 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-emerald-500" />
              Class Average Performance
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'Jan', avg: 75 },
                  { month: 'Feb', avg: 78 },
                  { month: 'Mar', avg: 82 },
                  { month: 'Apr', avg: 80 },
                  { month: 'May', avg: 85 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
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
