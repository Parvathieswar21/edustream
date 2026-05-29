import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, UserPlus, BookOpen, Layers, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import AIInsightsWidget from '../components/AIInsightsWidget';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, st] = await Promise.all([
          api.get('/admin/dashboard-stats'),
          api.get('/admin/teachers?limit=5'),
          api.get('/admin/students?limit=5')
        ]);
        setStats(s.data);
        setTeachers(t.data.data);
        setStudents(st.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500">Real-time school performance and management</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-bold text-slate-700">Live Analytics</span>
        </div>
      </header>
      
      <AIInsightsWidget />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Teachers', value: stats.teachers, icon: UserPlus, color: 'bg-blue-500', shadow: 'shadow-blue-100' },
          { label: 'Students', value: stats.students, icon: Users, color: 'bg-emerald-500', shadow: 'shadow-emerald-100' },
          { label: 'Classes', value: stats.classes, icon: Layers, color: 'bg-indigo-500', shadow: 'shadow-indigo-100' },
          { label: 'Revenue', value: `$${(stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-amber-500', shadow: 'shadow-amber-100' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg ${stat.shadow}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Attendance Trends (%)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.attendanceTrends}>
                <defs>
                  <linearGradient id="colorPct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Fee Collection</h2>
          <div className="h-[200px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.feeCollection} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.feeCollection?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/students')}
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-left hover:border-indigo-500 transition-all flex items-center space-x-3 group"
            >
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700">Add New Student</span>
            </button>
            <button
              onClick={() => navigate('/admin/fees')}
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-left hover:border-emerald-500 transition-all flex items-center space-x-3 group"
            >
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700">Manage Fees</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">School Performance</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recent Teachers</h2>
            <button className="text-indigo-600 text-sm font-semibold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {t.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{t.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{t.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recent Students</h2>
            <button className="text-indigo-600 text-sm font-semibold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{s.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{s.class_name} - {s.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
