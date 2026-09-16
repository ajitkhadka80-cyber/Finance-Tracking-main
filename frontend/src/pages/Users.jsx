import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Users() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/users', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);

    fetch('/api/password-reset-requests', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => setResetRequests(data))
      .catch(console.error);
  }, [token]);

  const handleResolveReset = async (reqId, email) => {
    const user = users.find(u => u.email === email);
    if (!user) return Swal.fire('Error', 'User not found in system', 'error');

    const { value: newPassword } = await Swal.fire({
      title: 'Reset Password',
      input: 'password',
      inputLabel: `Enter new password for ${email}`,
      inputPlaceholder: 'New password',
      showCancelButton: true
    });

    if (newPassword) {
      try {
        const res = await fetch(`/api/users/${user.id}/reset-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ newPassword, requestId: reqId })
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire('Success', data.message, 'success');
          setResetRequests(resetRequests.filter(r => r.id !== reqId));
        } else {
          Swal.fire('Error', data.error, 'error');
        }
      } catch (err) {
        Swal.fire('Error', 'Network error', 'error');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage('');
    
    const newUser = { name, email, password, role };
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        const added = await res.json();
        setUsers([...users, added]);
        setName('');
        setEmail('');
        setPassword('');
        setRole('admin');
        setMessage('User successfully created.');
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      }
    } catch(err) {
      console.error(err);
      setMessage('Failed to connect to the server.');
    }
  };

  return (
    <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-sm text-slate-500">Add new users and manage existing team access to the ledger.</p>
          </div>

          {/* Add User Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Create New User</h2>
              <p className="text-sm text-slate-500">Provide credentials to authorize a new member.</p>
            </div>
            <form className="p-6" onSubmit={handleAddUser}>
              {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {message}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="name">Full Name</label>
                  <input className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Jenkins" required type="text"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="email">Email Address</label>
                  <input className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="s.jenkins@finora.io" required type="email"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="password">Password</label>
                  <input className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required type="password"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="role">Role</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="role" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-6 py-2 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Active Roster</h3>
                <p className="text-sm text-slate-500">Real-time status of authenticated users.</p>
              </div>
              <span className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full font-medium text-xs border border-brand-100">Total: {users.length}</span>
            </div>
            
            {resetRequests.length > 0 && (
              <div className="p-4 bg-amber-50 border-b border-amber-200">
                <h4 className="text-sm font-bold text-amber-800 mb-2">Pending Password Resets</h4>
                <div className="space-y-2">
                  {resetRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-amber-100">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">{req.email}</span>
                        <span className="text-xs text-slate-500">Requested: {new Date(req.created_at).toLocaleString()}</span>
                      </div>
                      <button onClick={() => handleResolveReset(req.id, req.email)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded shadow-sm transition-colors">
                        Reset Password
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
                    <th className="py-3 px-6">User</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map(u => (
                    <tr className="hover:bg-slate-50/50 transition-colors group" key={u.id || u.email}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0 border border-brand-200">
                            {u.name ? u.name.charAt(0) : '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{u.name}</span>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                        {u.last_logged_in !== 'Never' ? new Date(u.last_logged_in).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
  );
}
