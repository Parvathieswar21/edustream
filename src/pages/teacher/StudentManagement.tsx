import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import {
  UserPlus,
  Trash2,
  Mail,
  Layers,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  IdCard,
  Download,
  Camera
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showIdCard, setShowIdCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    class_id: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [s, c] = await Promise.all([
        api.get(`/teacher/students?page=${page}&search=${search}&class_id=${selectedClass}`),
        api.get('/teacher/my-classes')
      ]);
      setStudents(s.data.data);
      setTotal(s.data.total);
      setClasses(c.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ADD THIS LINE: prevent form reload
    try {
      if (editingId) {
        await api.put(`/teacher/students/${editingId}`, formData);
      } else {
        await api.post('/teacher/students', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', username: '', email: '', password: '', phone: '', address: '', class_id: '' });
      fetchData();
    } catch (err) {
      alert(editingId ? 'Failed to update student' : 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/teacher/students/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  const handleEdit = (student: any) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      username: student.username || '',
      email: student.email,
      password: '',
      phone: student.phone || '',
      address: student.address || '',
      class_id: student.class_id ? student.class_id.toString() : ''
    });
    setShowModal(true);
  };

  const downloadIdCard = async () => {
    if (!idCardRef.current) return;
    const canvas = await html2canvas(idCardRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 10, 10, 85, 55); // Standard ID size approx
    pdf.save(`${showIdCard.name}_ID_Card.pdf`);
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-slate-500">Manage {total} enrolled students</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-100 font-bold"
        >
          <UserPlus className="w-5 h-5" />
          <span>Enroll New Student</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            className="flex-1 md:w-48 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4 text-center w-16">#</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Class</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student: any) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-center text-slate-400 text-sm">{student.username || `#${student.id}`}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                      {student.profile_image ? (
                        <img src={student.profile_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div className="font-bold text-slate-900">{student.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                    <Layers className="w-3 h-3 mr-1.5" />
                    {student.class_name ? `${student.class_name} - ${student.section}` : 'Unassigned'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" /> {student.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg"
                      title="Edit Student"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowIdCard(student)}
                      className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg"
                      title="Generate ID Card"
                    >
                      <IdCard className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      title="Delete Student"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900">{(page - 1) * 10 + 1}</span> to <span className="text-slate-900">{Math.min(page * 10, total)}</span> of <span className="text-slate-900">{total}</span>
          </p>
          <div className="flex space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${page === i + 1 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {showIdCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Student ID Card</h2>
              <button onClick={() => setShowIdCard(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ID Card Preview */}
            <div
              ref={idCardRef}
              className="w-full aspect-[1.6/1] bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-white p-1 rounded-lg">
                    <Layers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="font-black text-xl tracking-tight">EduStream</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Student ID</span>
              </div>

              <div className="flex space-x-4 items-center">
                <div className="w-20 h-20 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden">
                  {showIdCard.profile_image ? (
                    <img src={showIdCard.profile_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                      {showIdCard.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">{showIdCard.name}</h3>
                  <p className="text-xs opacity-80 mb-2">ID: {showIdCard.username || `#${showIdCard.id}`}</p>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase opacity-60">Class</p>
                    <p className="text-sm font-bold">{showIdCard.class_name} - {showIdCard.section}</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-6 text-right">
                <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Valid Until</p>
                <p className="text-xs font-bold">Dec 2026</p>
              </div>
            </div>

            <button
              onClick={downloadIdCard}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 bg-emerald-600 text-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{editingId ? 'Update Student' : 'Enroll Student'}</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({ name: '', username: '', email: '', password: '', phone: '', address: '', class_id: '' });
                  }}
                  className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-emerald-100 text-sm">{editingId ? 'Modify student information below.' : 'Fill in the details to register a new student to the system.'}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admission Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADM2026001"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  {!editingId && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assign Class</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none bg-white"
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  >
                    <option value="">Select a class</option>
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? 'Processing...' : editingId ? 'Save Changes' : 'Complete Enrollment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
