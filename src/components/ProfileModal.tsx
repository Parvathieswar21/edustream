import React, { useState } from 'react';
import { X, Shield, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate: () => void;
}

export default function ProfileModal({ isOpen, onClose, profile, onProfileUpdate }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile State
  const [editingProfile, setEditingProfile] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // OTP State
  const [otpStage, setOtpStage] = useState<'idle' | 'sent'>('idle');
  const [verifyingType, setVerifyingType] = useState<'email' | 'phone' | null>(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Security State
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  // --- Profile Handlers ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // Assuming the caller determines if it's teacher or student based on role
      const endpoint = profile?.role === 'teacher' ? '/teacher/profile' : '/student/profile';
      await api.put(endpoint, editingProfile);
      onProfileUpdate();
      onClose();
    } catch (err) {
      alert('Failed to update profile details');
    } finally {
      setSavingProfile(false);
    }
  };

  // --- OTP Verification Handlers ---
  const handleSendOtp = async (type: 'email' | 'phone') => {
    setOtpLoading(true);
    setVerifyingType(type);
    try {
      const value = type === 'email' ? profile.email : profile.phone;
      await api.post('/auth/send-verification-otp', { type, value });
      setOtpStage('sent');
      alert(`OTP sent to your ${type}. Check the backend server logs for the code!`);
    } catch (err) {
      alert(`Failed to send OTP for ${type}`);
      setVerifyingType(null);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      await api.post('/auth/verify-otp', { type: verifyingType, otp });
      alert(`${verifyingType} verified successfully!`);
      setOtpStage('idle');
      setVerifyingType(null);
      setOtp('');
      onProfileUpdate(); // Refresh profile to get updated verified status
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // --- Password Handlers ---
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSavingPassword(true);
    setSecurityMessage({ type: '', text: '' });

    try {
      await api.post('/auth/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setSecurityMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setSecurityMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Options */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex justify-center items-center py-4 font-bold transition-colors ${activeTab === 'profile' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <User className="w-5 h-5 mr-2" /> Profile Details
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex justify-center items-center py-4 font-bold transition-colors ${activeTab === 'security' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Shield className="w-5 h-5 mr-2" /> Security
          </button>
          <div className="flex items-center pr-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6 flex-1">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              
              {/* Verification Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contact Verification</h3>
                
                {/* Email Verification */}
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                  <div className="truncate pr-4">
                    <p className="text-xs text-slate-400 font-bold mb-0.5">Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{profile?.email}</p>
                  </div>
                  {profile?.email_verified ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
                    </span>
                  ) : verifyingType === 'email' && otpStage === 'sent' ? (
                    <div className="flex items-center space-x-2">
                       <input 
                         type="text" 
                         maxLength={6} 
                         placeholder="OTP Code" 
                         className="w-24 px-2 py-1 text-sm border rounded"
                         value={otp} onChange={(e) => setOtp(e.target.value)} 
                       />
                       <button onClick={handleVerifyOtp} disabled={otpLoading} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-bold hover:bg-indigo-700">Verify</button>
                    </div>
                  ) : (
                    <button onClick={() => handleSendOtp('email')} disabled={otpLoading} className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Unverified? Verify Now
                    </button>
                  )}
                </div>

                {/* Phone Verification */}
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                  <div className="truncate pr-4">
                    <p className="text-xs text-slate-400 font-bold mb-0.5">Phone Number</p>
                    <p className="text-sm font-bold text-slate-700">{profile?.phone || 'Not provided'}</p>
                  </div>
                  {!profile?.phone ? null : profile?.phone_verified ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
                    </span>
                  ) : verifyingType === 'phone' && otpStage === 'sent' ? (
                    <div className="flex items-center space-x-2">
                       <input 
                         type="text" 
                         maxLength={6} 
                         placeholder="OTP Code" 
                         className="w-24 px-2 py-1 text-sm border rounded"
                         value={otp} onChange={(e) => setOtp(e.target.value)} 
                       />
                       <button onClick={handleVerifyOtp} disabled={otpLoading} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-bold hover:bg-indigo-700">Verify</button>
                    </div>
                  ) : (
                    <button onClick={() => handleSendOtp('phone')} disabled={otpLoading} className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Verify Now
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Details */}
              <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider relative">
                  <span className="bg-white pr-2">Edit Details</span>
                  <div className="absolute top-1/2 -z-10 w-full h-px bg-slate-100"></div>
                </h3>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editingProfile.phone}
                    onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                  <textarea
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                    value={editingProfile.address}
                    onChange={(e) => setEditingProfile({ ...editingProfile, address: e.target.value })}
                  />
                </div>
              </form>
            </div>
          ) : (
            <form id="security-form" onSubmit={handlePasswordSubmit} className="space-y-4">
              {securityMessage.text && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-start space-x-3 mb-6 ${securityMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {securityMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{securityMessage.text}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password" required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                />
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password" required minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password" required minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 mr-2">
            Cancel
          </button>
          {activeTab === 'profile' ? (
            <button
              type="submit" form="profile-form" disabled={savingProfile}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          ) : (
            <button
              type="submit" form="security-form" disabled={savingPassword}
              className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
