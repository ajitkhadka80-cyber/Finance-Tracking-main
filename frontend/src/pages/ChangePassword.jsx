import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ChangePassword() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return Swal.fire('Error', 'New passwords do not match', 'error');
    }

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire('Success', data.message, 'success');
        navigate('/dashboard');
      } else {
        Swal.fire('Error', data.error, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Network error', 'error');
    }
  };

  return (
      <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Settings</h1>
            <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">For {user?.email}</p>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="oldPassword">Current Password</label>
                <input className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="oldPassword" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required type="password"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="newPassword">New Password</label>
                <input className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required type="password"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">Confirm New Password</label>
                <input className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required type="password"/>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button className="px-6 py-2 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
  );
}
