import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardHeader() {
    const { user, token, logout, orgName } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [currentFY, setCurrentFY] = useState(null);

    const fetchActiveFY = () => {
        if (!token) return;
        fetch('/api/fiscal-years', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                const active = data.find(fy => fy.is_current);
                setCurrentFY(active || null);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchActiveFY();
        // Listen for custom event from FiscalYears page
        window.addEventListener('fiscalYearChanged', fetchActiveFY);
        return () => window.removeEventListener('fiscalYearChanged', fetchActiveFY);
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItemClass = (path) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === path ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-8">
                {/*  Logo  */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {orgName ? orgName.charAt(0) : 'F'}
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">{orgName || 'Finora'}</span>
                </div>
                <nav className="hidden md:flex items-center gap-1">
                    <Link to="/dashboard" className={navItemClass('/dashboard')}>Dashboard</Link>
                    <Link to="/transactions" className={navItemClass('/transactions')}>Transactions</Link>

                    <div className="relative">
                        <button
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${showReports || location.pathname.includes('/reports') ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            onClick={() => setShowReports(!showReports)}
                        >
                            Reports
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </button>
                        {showReports && (
                            <div className="absolute top-full mt-1 left-0 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                                <Link to="/transactions/all" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setShowReports(false)}>Journal</Link>
                                <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setShowReports(false)}>Ledger</button>
                                <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setShowReports(false)}>Trial</button>
                            </div>
                        )}
                    </div>

                    {user?.role === 'admin' && (
                        <>
                            <Link to="/users" className={navItemClass('/users')}>Users</Link>
                            <Link to="/codes" className={navItemClass('/codes')}>Codes</Link>
                            <Link to="/settings" className={navItemClass('/settings')}>Settings</Link>
                        </>
                    )}
                </nav>
            </div>
            {/*  Right Utility Actions  */}
            <div className="flex items-center gap-3">
                {currentFY && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-lg text-brand-700">
                        <span className="text-xs font-bold uppercase tracking-wider">FY {currentFY.name}</span>
                    </div>
                )}

                <div className="relative">
                    <button
                        className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 bg-white hover:border-brand-200 transition-colors cursor-pointer"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="hidden md:flex flex-col text-left mr-1">
                            <span className="text-sm font-semibold text-slate-800 leading-none">{user?.name || 'User'}</span>
                            <span className="text-[10px] text-slate-500 font-medium leading-tight capitalize">{user?.role || 'Member'}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <Link
                                to="/change-password"
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                                Change Password
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* </div> */}
        </header>
    );
}
