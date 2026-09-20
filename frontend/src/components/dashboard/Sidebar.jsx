import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NepaliDate from 'nepali-date-converter';

export default function Sidebar() {
  const { user, logout, orgName, receiptLanguage, token } = useContext(AuthContext);
  const location = useLocation();
  const [showReports, setShowReports] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [urgentCount, setUrgentCount] = useState(0);

  const isReportsActive = location.pathname.includes('/transactions/all') || location.pathname.includes('/reports/');
  const isTransactionsActive = location.pathname === '/transactions' || location.pathname.includes('/transactions/edit') || location.pathname.includes('/transactions/reverse');
  const isScheduleActive = location.pathname.includes('/schedule-work');

  useEffect(() => {
    if (!token) return;
    fetch('/api/schedule-work', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const today = new NepaliDate();
        let count = 0;
        data.forEach(task => {
          if (task.status === 'completed') return;
          try {
            const due = new NepaliDate(task.due_date);
            const diffTime = due.toJsDate().getTime() - today.toJsDate().getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (daysRemaining <= 10) count++;
          } catch(e) {}
        });
        setUrgentCount(count);
      })
      .catch(err => console.error('Error fetching tasks for sidebar:', err));
  }, [token]);

  const navServices = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Member Info', path: '/members', icon: 'group' },
  ];

    const adminSettings = [
        { name: 'Account Codes', path: '/codes', icon: 'account_tree' },
        { name: 'Users', path: '/users', icon: 'manage_accounts' },
        { name: 'Backup & Restore', path: '/backup-restore', icon: 'settings_backup_restore' },
        { name: 'Settings', path: '/settings', icon: 'settings' },
        { name: 'Change Password', path: '/change-password', icon: 'password' },
    ];

  const renderNavItems = (items) => {
    return items.map((item, index) => {
      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
      // For exact match on dashboard so it doesn't stay highlighted everywhere
      const isActuallyActive = item.path === '/dashboard' ? location.pathname === '/dashboard' : isActive;

      return (
        <Link
          key={index}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-2 text-[13px] transition-colors ${
            isActuallyActive
              ? 'bg-[#18529d] text-white border-l-4 border-yellow-400 font-semibold'
              : 'text-slate-300 hover:bg-[#18529d] hover:text-white border-l-4 border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
          <span>{item.name}</span>
        </Link>
      );
    });
  };

  return (
    <aside className="w-64 bg-[#114079] text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-20">
      {/* Logo & Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#18529d] sticky top-0 bg-[#114079] z-10">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#114079]">account_balance</span>
        </div>
        <div className="overflow-hidden">
          <h2 className="text-[13px] font-bold leading-tight tracking-tight truncate" title={orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')}>
            {orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')}
          </h2>
          <p className="text-[10px] text-blue-200">Main Department</p>
        </div>
      </div>

      {/* Nav Sections */}
      <div className="flex-1 py-4">
        <div className="mb-6">
          <h3 className="px-4 text-[11px] font-semibold text-blue-300 mb-2 uppercase tracking-wider">Navigation & Services</h3>
          <nav className="flex flex-col">
            {renderNavItems(navServices)}
            
            {/* Schedule Work Collapsible */}
            <div>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className={`w-full flex items-center justify-between px-4 py-2 text-[13px] transition-colors border-l-4 ${showSchedule || isScheduleActive ? 'bg-[#18529d] text-white border-yellow-400 font-semibold' : 'text-slate-300 hover:bg-[#18529d] hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Schedule Work</span>
                </div>
                <div className="flex items-center gap-2">
                  {urgentCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {urgentCount}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-[18px]">{showSchedule || isScheduleActive ? 'expand_less' : 'expand_more'}</span>
                </div>
              </button>
              
              {(showSchedule || isScheduleActive) && (
                <div className="bg-[#0c2f5a] flex flex-col py-1">
                  <Link
                    to="/schedule-work/work-to-be-done"
                    className={`flex items-center gap-3 px-11 py-2 text-[12px] transition-colors ${location.pathname === '/schedule-work/work-to-be-done' ? 'text-yellow-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">task</span>
                    <span>Work to be Done</span>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Transactions Collapsible */}
            <div>
              <button
                onClick={() => setShowTransactions(!showTransactions)}
                className={`w-full flex items-center justify-between px-4 py-2 text-[13px] transition-colors border-l-4 ${showTransactions || isTransactionsActive ? 'bg-[#18529d] text-white border-yellow-400 font-semibold' : 'text-slate-300 hover:bg-[#18529d] hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span>Transaction</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">{showTransactions || isTransactionsActive ? 'expand_less' : 'expand_more'}</span>
              </button>
              
              {(showTransactions || isTransactionsActive) && (
                <div className="bg-[#0c2f5a] flex flex-col py-1">
                  <Link
                    to="/transactions"
                    className={`flex items-center gap-3 px-11 py-2 text-[12px] transition-colors ${location.pathname === '/transactions' ? 'text-yellow-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    <span>Add Voucher</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Reports Collapsible */}
            <div>
              <button
                onClick={() => setShowReports(!showReports)}
                className={`w-full flex items-center justify-between px-4 py-2 text-[13px] transition-colors border-l-4 ${showReports || isReportsActive ? 'bg-[#18529d] text-white border-yellow-400 font-semibold' : 'text-slate-300 hover:bg-[#18529d] hover:text-white border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">assessment</span>
                  <span>Reports</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">{showReports || isReportsActive ? 'expand_less' : 'expand_more'}</span>
              </button>
              
              {(showReports || isReportsActive) && (
                <div className="bg-[#0c2f5a] flex flex-col py-1">
                  <Link
                    to="/transactions/all"
                    className={`flex items-center gap-3 px-11 py-2 text-[12px] transition-colors ${location.pathname === '/transactions/all' ? 'text-yellow-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">list_alt</span>
                    <span>Journal Vouchers</span>
                  </Link>
                  <Link
                    to="/reports/ledger"
                    className={`flex items-center gap-3 px-11 py-2 text-[12px] transition-colors ${location.pathname === '/reports/ledger' ? 'text-yellow-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">book</span>
                    <span>Ledger</span>
                  </Link>
                  <Link
                    to="/reports/trial-balance"
                    className={`flex items-center gap-3 px-11 py-2 text-[12px] transition-colors ${location.pathname === '/reports/trial-balance' ? 'text-yellow-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                    <span>Trial Balance</span>
                  </Link>
                  <Link
                    to="/reports/profit-and-loss"
                    className={`flex items-center gap-3 px-11 py-2 text-[12px] transition-colors ${location.pathname === '/reports/profit-and-loss' ? 'text-yellow-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">analytics</span>
                    <span>Profit & Loss</span>
                  </Link>
                  <Link
                    to="/reports/balance-sheet"
                    className={`flex items-center gap-3 px-11 py-2 text-[12px] transition-colors ${location.pathname === '/reports/balance-sheet' ? 'text-yellow-400 font-semibold' : 'text-slate-300 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">account_balance</span>
                    <span>Balance Sheet</span>
                  </Link>
                </div>
              )}
            </div>
            
          </nav>
        </div>

        <div>
          <h3 className="px-4 text-[11px] font-semibold text-blue-300 mb-2 uppercase tracking-wider">Administration & Settings</h3>
          <nav className="flex flex-col">
            {renderNavItems(adminSettings)}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#18529d] bg-[#0c2f5a] sticky bottom-0 z-10 mt-auto">
        <div className="flex items-center gap-2 mb-3 text-xs text-blue-200">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>{user?.name || 'User'} ({user?.role || 'ADMIN'})</span>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 px-2 rounded-sm flex items-center justify-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[14px]">lock</span> Pass
          </button>
          <button onClick={logout} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-2 rounded-sm flex items-center justify-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[14px]">logout</span> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
