import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ClipboardCheck, Calendar, Check, X, Search, Scan } from 'lucide-react';

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState<any>({}); // {studentId: 'present' | 'absent'}
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);

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
      const response = await api.get(`/teacher/class-students/${cls.id}`);
      setStudents(response.data);
      // Initialize all as present
      const initial: any = {};
      response.data.forEach((s: any) => initial[s.id] = 'present');
      setAttendance(initial);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = (studentId: number) => {
    setAttendance((prev: any) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const attendanceData = Object.entries(attendance).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status
      }));
      await api.post('/teacher/attendance', {
        class_id: selectedClass.id,
        date,
        attendance_data: attendanceData
      });
      alert('Attendance marked successfully!');
      setSelectedClass(null);
      setStudents([]);
    } catch (err) {
      alert('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Attendance</h1>
          <p className="text-slate-500">Mark daily attendance for your assigned classes</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            className="outline-none text-sm font-medium text-slate-700"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </header>

      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c: any) => (
            <button
              key={c.id}
              onClick={() => handleClassSelect(c)}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all text-left group"
            >
              <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
              <p className="text-slate-500">Section: {c.section}</p>
              <div className="mt-4 text-sm font-semibold text-indigo-600">Select Class →</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSelectedClass(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
              <div>
                <h2 className="font-bold text-slate-900">{selectedClass.name} - {selectedClass.section}</h2>
                <p className="text-xs text-slate-500">{students.length} Students</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowScanner(true)}
                className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center"
              >
                <Scan className="w-4 h-4 mr-2" /> Scan QR
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Submit Attendance'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase())).map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{student.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleStatus(student.id)}
                          className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${attendance[student.id] === 'present'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                            }`}
                        >
                          {attendance[student.id] === 'present' ? (
                            <><Check className="w-4 h-4" /> <span>Present</span></>
                          ) : (
                            <><X className="w-4 h-4" /> <span>Absent</span></>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative text-center">
               <button
                  onClick={() => setShowScanner(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
               >
                  <X className="w-6 h-6" />
               </button>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Smart QR Scanner</h3>
               <p className="text-slate-500 mb-6 text-sm">Hold the student's attendance QR code up to the camera.</p>
               
               <div className="bg-slate-900 rounded-2xl aspect-video mb-6 relative overflow-hidden flex items-center justify-center border-4 border-slate-200 shadow-inner">
                  <Scan className="w-16 h-16 text-emerald-500 animate-pulse opacity-50" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-[scan_2s_ease-in-out_infinite]" />
               </div>
               
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">(Mock Scanner Active)</p>
           </div>
        </div>
      )}
    </div>
  );
}
