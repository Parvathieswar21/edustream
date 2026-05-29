import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserPlus, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/teachers/${editingId}`, formData);
      } else {
        await api.post('/admin/teachers', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', username: '', email: '', password: '', phone: '', address: '' });
      fetchTeachers();
    } catch (err) {
      alert(editingId ? 'Failed to update teacher' : 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        fetchTeachers();
      } catch (err) {
        alert('Failed to delete teacher');
      }
    }
  };

  const handleEdit = (teacher: any) => {
    setEditingId(teacher.id);
    setFormData({
      name: teacher.name,
      username: teacher.username || '',
      email: teacher.email,
      password: '', // Password not editable here for simplicity, or handle separately
      phone: teacher.phone || '',
      address: teacher.address || ''
    });
    setShowModal(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teacher Management</h1>
          <p className="text-slate-500">Add, view, and manage school faculty</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Teacher</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Teacher Name</th>
              <th className="px-6 py-4">Contact Info</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((teacher: any) => (
              <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{teacher.name}</div>
                  <div className="text-xs text-slate-400">ID: {teacher.username || `#${teacher.id}`}</div>
                </td>
                <td className="px-6 py-4 space-y-1">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-3 h-3 mr-2" /> {teacher.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="w-3 h-3 mr-2" /> {teacher.phone || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-3 h-3 mr-2" /> {teacher.address || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormData({ name: '', username: '', email: '', password: '', phone: '', address: '' });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCH2026001"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : editingId ? 'Update Teacher' : 'Save Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
