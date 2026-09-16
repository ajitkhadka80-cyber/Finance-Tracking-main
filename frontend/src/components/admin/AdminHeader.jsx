import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AdminHeader() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-lg">
        <div className="flex items-center gap-space-xl">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">Finora</span>
          </div>
          <nav className="hidden xl:flex items-center gap-space-xs p-1 bg-transparent rounded-lg">
            <Link to="/dashboard" className="px-space-md py-2 text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-low hover:text-on-surface transition-colors">Dashboard</Link>
            <Link to="/admin" className="px-space-md py-2 rounded-lg transition-colors bg-surface-container-low text-primary font-semibold">Admin</Link>
          </nav>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="relative hidden sm:flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">search</span>
            <input className="w-56 lg:w-64 pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:shadow-[0_0_0_2px_rgba(79,70,229,0.2)] transition-all" placeholder="Search transactions, codes..." type="text"/>
          </div>
          <button aria-label="Notifications" className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors" type="button">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <button className="flex items-center gap-2 p-1 pr-2 rounded-full border border-surface-border bg-white hover:border-brand-100 transition-colors" type="button" onClick={handleLogout}>
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface leading-none">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-brand-600 font-medium leading-tight">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
