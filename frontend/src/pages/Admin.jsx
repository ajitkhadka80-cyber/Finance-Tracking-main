import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminCodesTab from '../components/admin/AdminCodesTab';
import AdminUsersTab from '../components/admin/AdminUsersTab';

export default function Admin() {
  const { token } = useContext(AuthContext);
  const [codes, setCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('codes');

  useEffect(() => {
    fetch('/api/codes', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => setCodes(data))
      .catch(console.error);

    fetch('/api/users', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(console.error);
  }, [token]);

  const handleAddCode = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCode = {
      code: formData.get('code_id'),
      description: formData.get('code_desc'),
      classification: formData.get('code_class'),
      status: 'Active'
    };
    
    try {
      const res = await fetch('/api/codes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(newCode)
      });
      if (res.ok) {
        const added = await res.json();
        setCodes([...codes, added]);
        e.target.reset();
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      name: formData.get('team_name'),
      email: formData.get('team_email'),
      role: formData.get('team_role'),
      scope: 'Restricted Access'
    };
    
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
        e.target.reset();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="max-w-7xl mx-auto px-margin py-space-xl">
        <div className="flex flex-col w-full">
          
          {/*  Top Command & Meta Bar  */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div className="space-y-space-xs">
              <nav className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
                <span>Finora</span>
                <span className="material-symbols-outlined text-outline text-sm">chevron_right</span>
                <span>Administration</span>
                <span className="material-symbols-outlined text-outline text-sm">chevron_right</span>
                <span className="text-primary font-semibold">Master Operations</span>
              </nav>
              <div className="flex items-center gap-3">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Admin Portal &amp; Control Center</h1>
                <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-primary font-medium tracking-wide uppercase">Core v4.2</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Manage system financial codes, invite and provision team personnel, and securely authorize pending password recovery requests.
              </p>
            </div>
            <div className="flex items-center gap-space-sm self-start md:self-auto">
              <button className="inline-flex items-center gap-space-xs px-4 h-10 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors" type="button">
                <span className="material-symbols-outlined text-lg text-on-surface-variant">file_download</span>
                Export Audit Log
              </button>
            </div>
          </div>

          {/*  Metric KPI Cards  */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Active Codes</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-numerical-lg text-numerical-lg text-on-surface">{codes.length}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Operational</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Registered Users</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">group</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-numerical-lg text-numerical-lg text-on-surface">{users.length}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Members</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-error"></div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Recovery Queue</span>
                <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-on-error-container">
                  <span className="material-symbols-outlined text-lg">key</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-numerical-lg text-numerical-lg text-error">3</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Pending Requests</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Security Posture</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-numerical-lg text-numerical-lg text-on-surface">98%</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">2FA Compliant</span>
                </div>
              </div>
            </div>
          </div>

          {/*  Segmented Navigation Controller  */}
          <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-lg bg-surface-container-lowest p-1.5 rounded-xl shadow-sm">
            <div className="flex items-center gap-1">
              <button 
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${activeTab === 'codes' ? 'bg-primary-container text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                onClick={() => setActiveTab('codes')}
              >
                <span className="material-symbols-outlined text-base">pin</span>
                Financial Code Setup
              </button>
              <button 
                className={`px-space-md py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-primary-container text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                onClick={() => setActiveTab('users')}
              >
                <span className="material-symbols-outlined text-base">badge</span>
                User Management &amp; Access
                <span className="px-2 py-0.5 text-xs rounded-full bg-surface-container-high text-on-surface font-semibold">{users.length}</span>
              </button>
            </div>
          </div>

          <AdminCodesTab codes={codes} onAddCode={handleAddCode} isActive={activeTab === 'codes'} />
          <AdminUsersTab users={users} onAddUser={handleAddUser} isActive={activeTab === 'users'} />

        </div>
      </div>
    </main>
  );
}