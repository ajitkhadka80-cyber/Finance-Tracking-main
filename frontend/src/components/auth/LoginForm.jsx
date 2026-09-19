import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, orgName, receiptLanguage } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            await login(data.token, data.user);

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Successfully logged in',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const { value: reqEmail } = await Swal.fire({
            title: 'Reset Password',
            input: 'email',
            inputLabel: 'Enter your account email address',
            inputPlaceholder: 'name@company.com',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5'
        });

        if (reqEmail) {
            try {
                const res = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: reqEmail })
                });
                const data = await res.json();
                Swal.fire('Request Sent', data.message || 'If the email exists, an admin has been notified.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Failed to send request', 'error');
            }
        }
    };

    return (
        <div className="backdrop-blur-xl bg-white/70 border border-white/40 p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full relative z-10">
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-4">
                        <img src="/logo.jpg" alt="Logo" className="h-16 sm:h-20 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                        {orgName ? (
                            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center leading-tight">
                                {orgName}
                            </h1>
                        ) : receiptLanguage === 'english' ? (
                            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0070C0] text-center leading-tight">
                                DIYO SAVING AND CREDIT COOPERATIVE LIMITED
                            </h1>
                        ) : (
                            <div className="flex items-stretch">
                                <div className="bg-[#0070C0] px-2 sm:px-3 py-1 flex items-center justify-center">
                                    <span className="text-[#FFC000] text-3xl sm:text-4xl font-bold leading-none" style={{ fontFamily: 'sans-serif' }}>दियो</span>
                                </div>
                                <div className="flex flex-col justify-center pl-2 sm:pl-3 text-[#0070C0]">
                                    <span className="text-sm sm:text-base font-bold leading-tight">वचत तथा ऋण सहकारी संस्था लिमिटेड</span>
                                    <span className="text-xs sm:text-sm font-bold leading-tight mt-0.5 text-center">चाल्नाखेल काठमाडौं</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-sm text-slate-500 mt-2 font-medium text-center">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3.5 rounded-xl flex items-center gap-2.5 animate-pulse">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}
                
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="email">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                            </svg>
                        </div>
                        <input id="email" name="email" placeholder="name@company.com" required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all duration-300" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Password</label>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input id="password" name="password" placeholder="••••••••" required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-white transition-all duration-300" />
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors focus:outline-none">Forgot password?</button>
                </div>

                <div className="pt-2">
                    <button type="submit" className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 flex justify-center items-center gap-2">
                        <span>Sign In</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}
