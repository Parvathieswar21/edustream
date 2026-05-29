import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileText, Save, X, Search } from 'lucide-react';

export default function MarksPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [marksData, setMarksData] = useState<any>({}); // {studentId: {marks, total, grade}}
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/teacher/my-classes');
        setClasses(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  const handleClassSelect = async (cls: any) => {
    setSelectedClass(cls);
    try {
      const [s, sub] = await Promise.all([
        api.get(`/teacher/class-students/${cls.id}`),
        api.get('/teacher/subjects') // In a real app, filter subjects by class
      ]);
      setStudents(s.data);
      setSubjects(sub.data.filter((item: any) => item.class_id === cls.id));

      const initial: any = {};
      s.data.forEach((student: any) => {
        initial[student.id] = { marks: '', total: 100, grade: '' };
      });
      setMarksData(initial);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkChange = (studentId: number, field: string, value: any) => {
    setMarksData((prev: any) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubject) return alert('Please select a subject');
    setLoading(true);
    try {
      await Promise.all(
        Object.entries(marksData).map(([student_id, data]: [string, any]) =>
          api.post('/teacher/marks', {
            student_id: parseInt(student_id),
            subject_id: selectedSubject.id,
            marks_obtained: parseInt(data.marks),
            total_marks: parseInt(data.total),
            grade: data.grade
          })
        )
      );
      alert('Marks uploaded successfully!');
      setSelectedClass(null);
    } catch (err) {
      alert('Failed to upload marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Academic Grading</h1>
        <p className="text-slate-500">Upload marks and grades for your students</p>
      </header>

      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c: any) => (
            <button
              key={c.id}
              onClick={() => handleClassSelect(c)}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left group"
            >
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
              <p className="text-slate-500">Section: {c.section}</p>
              <div className="mt-4 text-sm font-semibold text-blue-600">Open Gradebook →</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSelectedClass(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-xl">{selectedClass.name} - {selectedClass.section}</h2>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedSubject}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save All Marks'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-slate-700">Select Subject:</label>
                <select
                  className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedSubject?.id || ''}
                  onChange={(e) => setSelectedSubject(subjects.find((s: any) => s.id === parseInt(e.target.value)))}
                >
                  <option value="">Choose Subject</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Marks Obtained</th>
                  <th className="px-6 py-4">Total Marks</th>
                  <th className="px-6 py-4">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase())).map((student: any) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 font-medium">{student.name}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className={`w-24 px-3 py-1.5 rounded-lg border outline-none transition-all ${marksData[student.id]?.marks > marksData[student.id]?.total
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                          }`}
                        value={marksData[student.id]?.marks}
                        onChange={(e) => handleMarkChange(student.id, 'marks', e.target.value)}
                      />
                      {marksData[student.id]?.marks > marksData[student.id]?.total && (
                        <p className="text-[10px] text-red-500 font-bold mt-1">Exceeds total</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={marksData[student.id]?.total}
                        onChange={(e) => handleMarkChange(student.id, 'total', e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="e.g. A+"
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                        value={marksData[student.id]?.grade}
                        onChange={(e) => handleMarkChange(student.id, 'grade', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
