import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Upload, FileText, CheckCircle, Clock } from 'lucide-react';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ [id: number]: File | null }>({});
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    api.get('/assignments/student').then(res => setAssignments(res.data)).catch(console.error);
  };

  const handleUpload = async (assignmentId: number) => {
    const file = selectedFile[assignmentId];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignment_id', String(assignmentId));

    setUploading(assignmentId);
    try {
      await api.post('/assignments/student/submit', formData);
      fetchAssignments();
      setSelectedFile({ ...selectedFile, [assignmentId]: null });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">My Assignments</h1>
        <p className="text-slate-500">View and submit your work assignments</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{a.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{a.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] tracking-wider font-black uppercase ${
                a.submission_status === 'submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {a.submission_status}
              </span>
            </div>
            
            <div className="flex items-center text-xs font-bold text-slate-500 mb-6">
              <Clock className="w-4 h-4 mr-2" />
              Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No Due Date'}
            </div>

            {a.submission_status === 'pending' ? (
              <div className="mt-auto border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 hover:border-indigo-300 transition-colors">
                <input 
                  type="file" 
                  id={`file-${a.id}`} 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files) setSelectedFile({ ...selectedFile, [a.id]: e.target.files[0] });
                  }}
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor={`file-${a.id}`} className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-sm font-bold text-slate-700">
                    {uploading === a.id ? 'Uploading...' : selectedFile[a.id] ? selectedFile[a.id]?.name : 'Select File to Submit'}
                  </span>
                  {!selectedFile[a.id] && <span className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX</span>}
                </label>
                {selectedFile[a.id] && (
                  <button 
                    onClick={() => handleUpload(a.id)}
                    disabled={uploading === a.id}
                    className="mt-4 w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Confirm Submission
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-auto bg-emerald-50 rounded-xl p-4 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-bold text-sm">Submitted Successfully</span>
              </div>
            )}
          </div>
        ))}
        {assignments.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-200" />
            <p className="font-bold">No assignments pending</p>
          </div>
        )}
      </div>
    </div>
  );
}
