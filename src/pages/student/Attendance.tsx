import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ClipboardCheck, Calendar, CheckCircle2, XCircle, QrCode, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuthStore } from '../../store/authStore';

export default function Attendance() {
    const user = useAuthStore(state => state.user);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/student/attendance');
                setAttendance(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAttendance();
    }, []);

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const totalCount = attendance.length;
    const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

    return (
        <div className="p-8 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Attendance Tracker</h1>
                    <p className="text-slate-500">View your daily attendance and overall summary</p>
                </div>
                <button 
                  onClick={() => setShowQR(true)}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center shadow-lg shadow-indigo-200"
                >
                   <QrCode className="w-5 h-5 mr-2" />
                   Show Attendance QR
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-bold mb-1">Overall Attendance</p>
                    <div className="flex items-end space-x-2">
                        <span className="text-3xl font-black text-indigo-600">{percentage}%</span>
                        <span className="text-sm text-slate-400 font-bold mb-1">Present</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-bold mb-1">Total Days</p>
                    <div className="flex items-end space-x-2">
                        <span className="text-3xl font-black text-slate-900">{totalCount}</span>
                        <span className="text-sm text-slate-400 font-bold mb-1">Classes</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-bold mb-1">Present Days</p>
                    <div className="flex items-end space-x-2">
                        <span className="text-3xl font-black text-emerald-600">{presentCount}</span>
                        <span className="text-sm text-slate-400 font-bold mb-1">Days</span>
                    </div>
                </div>
            </div>

            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-indigo-500" />
                        Attendance History
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <th className="px-8 py-4">Date</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Day</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attendance.map((record) => {
                                const date = new Date(record.date);
                                return (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-4 text-sm font-bold text-slate-900">
                                            {date.toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${record.status === 'present'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-red-50 text-red-600'
                                                }`}>
                                                {record.status === 'present' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-sm text-slate-500">
                                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                        </td>
                                    </tr>
                                );
                            })}
                            {attendance.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-bold">
                                        No attendance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {showQR && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl relative text-center">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">My Attendance ID</h3>
                        <p className="text-slate-500 mb-6 text-sm">Present this QR code to your teacher for smart scanning.</p>
                        <div className="bg-slate-50 p-6 rounded-2xl flex justify-center mb-6">
                            <QRCode
                                value={`ATTENDANCE_STUDENT_${user?.id}`}
                                size={200}
                                level="H"
                            />
                        </div>
                        <p className="font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Student ID: #{user?.id}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
