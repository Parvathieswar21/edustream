import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Layers, BookOpen, Plus, X, Trash2, UserPlus } from 'lucide-react';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', section: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', class_id: '' });
  const [assignForm, setAssignForm] = useState({ teacher_id: '', class_id: '', subject_id: '' });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [c, s, t] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
        api.get('/admin/teachers')
      ]);
      setClasses(c.data);
      setSubjects(s.data);
      setTeachers(t.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/classes', classForm);
      setShowClassModal(false);
      setClassForm({ name: '', section: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add class');
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', subjectForm);
      setShowSubjectModal(false);
      setSubjectForm({ name: '', class_id: '' });
      fetchData();
    } catch (err) {
      alert('Failed to add subject');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/assign-teacher', assignForm);
      setShowAssignModal(false);
      setAssignForm({ teacher_id: '', class_id: '', subject_id: '' });
      alert('Teacher assigned successfully!');
    } catch (err) {
      alert('Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (window.confirm('Deleting a class will remove all its assignments and subjects. Continue?')) {
      try {
        await api.delete(`/admin/classes/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete class');
      }
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.delete(`/admin/subjects/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete subject');
      }
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Structure</h1>
          <p className="text-slate-500">Manage school classes and academic subjects</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowClassModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Class</span>
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject</span>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-emerald-100"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Teacher</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-indigo-600" />
            <h2 className="text-lg font-bold">Classes</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {classes.map((c: any) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 group relative">
                <div className="font-bold text-slate-900">{c.name}</div>
                <div className="text-sm text-slate-500">Section: {c.section}</div>
                <button
                  onClick={() => handleDeleteClass(c.id)}
                  className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
            <h2 className="text-lg font-bold">Subjects</h2>
          </div>
          <div className="p-6 space-y-3">
            {subjects.map((s: any) => (
              <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                <div>
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-400">Class: {s.class_name} - {s.section}</div>
                </div>
                <button
                  onClick={() => handleDeleteSubject(s.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add New Class</h2>
              <button onClick={() => setShowClassModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleClassSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Name (e.g. Grade 10)</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Section (e.g. A, B, Science)</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={classForm.section}
                  onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                />
              </div>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Create Class</button>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add New Subject</h2>
              <button onClick={() => setShowSubjectModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign to Class</label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subjectForm.class_id}
                  onChange={(e) => setSubjectForm({ ...subjectForm, class_id: e.target.value })}
                >
                  <option value="">Select a class</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
              <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">Create Subject</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
