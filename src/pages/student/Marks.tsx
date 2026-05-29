import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, GraduationCap, TrendingUp, Award } from 'lucide-react';

export default function Marks() {
    const [marks, setMarks] = useState<any[]>([]);

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const res = await api.get('/student/marks');
                setMarks(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMarks();
    }, []);

    const averageGrade = marks.length > 0
        ? (marks.reduce((acc, m) => acc + (m.marks_obtained / m.total_marks), 0) / marks.length * 100).toFixed(1)
        : 0;

    return (
        <div className="p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Academic Performance</h1>
                <p className="text-slate-500">Grade summary and subject-wise results</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average Score</p>
                        <p className="text-2xl font-black text-slate-900">{averageGrade}%</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Subjects</p>
                        <p className="text-2xl font-black text-slate-900">{marks.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status</p>
                        <p className="text-2xl font-black text-slate-900">Active</p>
                    </div>
                </div>
            </div>

            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <BookOpen className="w-5 h-5 mr-3 text-indigo-500" />
                        Report Card
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <th className="px-8 py-4">Subject</th>
                                <th className="px-8 py-4 text-center">Marks</th>
                                <th className="px-8 py-4 text-center">Grade</th>
                                <th className="px-8 py-4 text-right">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {marks.map((record) => {
                                const percentage = ((record.marks_obtained / record.total_marks) * 100).toFixed(1);
                                return (
                                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-900">{record.subject_name}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-black text-slate-900">{record.marks_obtained}</span>
                                            <span className="text-xs text-slate-400 font-bold ml-1">/ {record.total_marks}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-wider">
                                                {record.grade || 'A-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-slate-900">{percentage}%</span>
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {marks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">
                                        No results available yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
