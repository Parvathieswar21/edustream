import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileText, Plus, Users, Download, X } from 'lucide-react';

export default function TeacherAssignments() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [viewingAssignment, setViewingAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/teacher/my-classes').then(res => {
      setClasses(res.data);
      if (res.data.length > 0) setSelectedClass(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/assignments/teacher/class/${selectedClass}`).then(res => setAssignments(res.data));
    }
  }, [selectedClass]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assignments/teacher', {
        class_id: selectedClass,
        title,
        description,
        due_date: dueDate
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      api.get(`/assignments/teacher/class/${selectedClass}`).then(res => setAssignments(res.data));
    } catch (err) {
      alert('Failed to create assignment');
    }
  };

  const loadSubmissions = async (assignment: any) => {
    setViewingAssignment(assignment);
    try {
      const res = await api.get(`/assignments/submissions/${assignment.id}`);
      setSubmissions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Assignment Management</h1>
        <p className="text-slate-500">Create assignments and view student submissions</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-900 mb-6 text-xl">Create Assignment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Class</label>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Assignment Title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Description / Instructions" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center items-center"
              >
                <Plus className="w-5 h-5 mr-2" /> Post Assignment
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {viewingAssignment ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                <div>
                  <h2 className="font-bold text-indigo-900 text-xl">{viewingAssignment.title}</h2>
                  <p className="text-sm text-indigo-600/70 font-semibold mt-1">Submission Review</p>
                </div>
                <button 
                  onClick={() => setViewingAssignment(null)}
                  className="bg-white p-2 rounded-xl text-slate-400 hover:text-slate-700 shadow-sm transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {submissions.map(sub => (
                  <div key={sub.id} className="p-5 flex justify-between items-center hover:bg-slate-50">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex justify-center items-center font-bold">
                         {sub.student_name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-bold text-slate-900">{sub.student_name}</p>
                         <p className="text-xs text-slate-400 font-medium">Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                       </div>
                    </div>
                    <a 
                      href={api.defaults.baseURL?.replace('/api', '') + sub.file_path}
                      target="_blank" rel="noreferrer"
                      className="bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download File
                    </a>
                  </div>
                ))}
                {submissions.length === 0 && (
                   <div className="p-12 text-center text-slate-400 font-bold">
                     No submissions received yet.
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-900 text-xl flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-indigo-500" /> 
                  Active Assignments
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {assignments.map(a => (
                  <div key={a.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl mb-1">{a.title}</h3>
                      <p className="text-sm text-slate-500 max-w-md truncate">{a.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                           Due: {new Date(a.due_date).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => loadSubmissions(a)}
                      className="bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 transition-all flex items-center shadow-sm"
                    >
                      <Users className="w-4 h-4 mr-2" /> View Submissions
                    </button>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <div className="p-16 text-center text-slate-400 font-medium">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-500" />
                    No assignments created yet for this class.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
