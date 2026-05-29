import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Clock, Receipt, X } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function Fees() {
    const [fees, setFees] = useState<any[]>([]);
    const [selectedFee, setSelectedFee] = useState<any | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const fetchFees = async () => {
        try {
            const res = await api.get('/student/fees');
            if (Array.isArray(res.data)) {
                setFees(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    const totalFees = Array.isArray(fees) ? fees.reduce((acc, f) => acc + (f.amount || 0), 0) : 0;
    const totalPaid = Array.isArray(fees) ? fees.reduce((acc, f) => acc + (f.amount_paid || 0), 0) : 0;
    const remaining = totalFees - totalPaid;

    const handleSimulatePayment = async () => {
        if (!selectedFee) return;
        setIsSimulating(true);
        try {
            const amountToPay = selectedFee.amount - (selectedFee.amount_paid || 0);
            await api.post('/student/pay-fee', {
                fee_id: selectedFee.id,
                amount_paid: amountToPay
            });
            await fetchFees();
            setSelectedFee(null);
        } catch (error) {
            console.error('Payment failed', error);
            alert('Payment failed. Please try again.');
        } finally {
            setIsSimulating(false);
        }
    };

    // Generate UPI URL
    const getUpiUrl = (amount: number) => {
        return `upi://pay?pa=school@upi&pn=EduStream%20School&am=${amount}&cu=INR`;
    };

    const downloadReceipt = (fee: any) => {
        const receiptContent = `
EduStream School Management System
==================================
Official Payment Receipt

Transaction ID: TXN-${fee.id}-${Date.now()}
Date: ${new Date().toLocaleDateString()}

Description: ${fee.description}
Amount Paid: ₹${fee.amount_paid}

Status: SUCCESS
==================================
Thank you for your payment!
        `;
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${fee.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Fee Management</h1>
                <p className="text-slate-500">Track your school fees and payment status in INR</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Total Amount</p>
                    <p className="text-3xl font-black text-slate-900">₹{totalFees}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Total Paid</p>
                    <p className="text-3xl font-black text-emerald-600">₹{totalPaid}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Remaining</p>
                    <p className="text-3xl font-black text-red-600">₹{remaining}</p>
                </div>
            </div>

            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <Receipt className="w-5 h-5 mr-3 text-emerald-500" />
                        Fee Structure
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <th className="px-8 py-4">Description</th>
                                <th className="px-8 py-4">Due Date</th>
                                <th className="px-8 py-4">Amount</th>
                                <th className="px-8 py-4">Paid</th>
                                <th className="px-8 py-4 text-right">Status / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Array.isArray(fees) && fees.map((fee) => {
                                const amountRemaining = fee.amount - (fee.amount_paid || 0);
                                return (
                                    <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-900">{fee.description}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-sm text-slate-500 font-medium">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {new Date(fee.due_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-slate-900">
                                            ₹{fee.amount}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-emerald-600">
                                            ₹{fee.amount_paid || 0}
                                        </td>
                                        <td className="px-8 py-6 text-right flex items-center justify-end gap-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${fee.payment_status === 'paid'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {fee.payment_status || 'PENDING'}
                                            </span>
                                            {fee.payment_status === 'paid' && (
                                                <button
                                                    onClick={() => downloadReceipt(fee)}
                                                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
                                                >
                                                    Receipt
                                                </button>
                                            )}
                                            {fee.payment_status !== 'paid' && amountRemaining > 0 && (
                                                <button
                                                    onClick={() => setSelectedFee(fee)}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
                                                >
                                                    Pay QR
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {fees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">
                                        No fee records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* QR Payment Modal */}
            {selectedFee && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedFee(null)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Scan to Pay</h3>
                            <p className="text-slate-500 mb-6">Use any UPI app (GPay, PhonePe, Paytm) to scan the QR code.</p>

                            <div className="bg-slate-50 p-6 rounded-2xl flex justify-center mb-6">
                                <QRCode
                                    value={getUpiUrl(selectedFee.amount - (selectedFee.amount_paid || 0))}
                                    size={200}
                                    level="H"
                                />
                            </div>

                            <div className="space-y-4">
                                <p className="text-xl font-black text-slate-900">
                                    Amount: ₹{selectedFee.amount - (selectedFee.amount_paid || 0)}
                                </p>

                                <p className="text-sm text-slate-500">
                                    For testing purposes, you can simulate a successful payment below.
                                </p>

                                <button
                                    onClick={handleSimulatePayment}
                                    disabled={isSimulating}
                                    className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    {isSimulating ? 'Processing...' : 'Simulate Success'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
