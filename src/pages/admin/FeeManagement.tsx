import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  DollarSign,
  Plus,
  X,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function FeeManagement() {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [students, setStudents] = useState([]);

  const [feeForm, setFeeForm] = useState({
    class_id: '',
    amount: '',
    due_date: '',
    description: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    student_id: '',
    fee_id: '',
    amount_paid: '',
    status: 'paid'
  });

  const fetchData = async () => {
    try {
      const [f, p, c] = await Promise.all([
        api.get('/admin/fees'),
        api.get('/admin/payments'),
        api.get('/admin/classes')
      ]);
      setFees(f.data);
      setPayments(p.data);
      setClasses(c.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFeeStructure = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await api.delete(`/admin/fee-structures/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete fee structure');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/fees', feeForm);
      setShowFeeModal(false);
      setFeeForm({ class_id: '', amount: '', due_date: '', description: '' });
      fetchData();
    } catch (err) {
      alert('Failed to create fee structure');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/payments', paymentForm);
      setShowPaymentModal(false);
      setPaymentForm({ student_id: '', fee_id: '', amount_paid: '', status: 'paid' });
      fetchData();
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  const fetchStudentsByFee = async (feeId: string) => {
    const fee: any = fees.find((f: any) => f.id === parseInt(feeId));
    if (fee) {
      try {
        const response = await api.get(`/admin/students?class_id=${fee.class_id}`);
        setStudents(response.data.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Management</h1>
          <p className="text-slate-500">Manage tuition fees and track student payments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFeeModal(true)}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 font-bold shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            <span>Create Fee Structure</span>
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 font-bold shadow-lg shadow-emerald-100"
          >
            <CreditCard className="w-5 h-5" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Fee Structures</h2>
          {fees.map((fee: any) => (
            <div key={fee.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-slate-900">${fee.amount}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{fee.description}</h3>
                <p className="text-sm text-slate-500">{fee.class_name} - {fee.section}</p>
              </div>
              <div className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Due: {new Date(fee.due_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Payments</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Fee Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 font-bold text-slate-900">{p.student_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.fee_description}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">${p.amount_paid}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {p.status === 'paid' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fee Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">New Fee Structure</h2>
              <button onClick={() => setShowFeeModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleFeeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Class</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={feeForm.class_id}
                  onChange={(e) => setFeeForm({ ...feeForm, class_id: e.target.value })}
                >
                  <option value="">Select Class</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={feeForm.due_date}
                    onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Tuition Fee 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={feeForm.description}
                  onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                />
              </div>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Create Structure
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Fee Structure</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={paymentForm.fee_id}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, fee_id: e.target.value });
                    fetchStudentsByFee(e.target.value);
                  }}
                >
                  <option value="">Select Fee</option>
                  {fees.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.description} (${f.amount})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  required
                  disabled={!paymentForm.fee_id}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  value={paymentForm.student_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, student_id: e.target.value })}
                >
                  <option value="">Select Student</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Amount Paid ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                  >
                    <option value="paid">Full Payment</option>
                    <option value="partial">Partial Payment</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
