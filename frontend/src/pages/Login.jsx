import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans text-slate-800">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/40 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[30%] right-[20%] w-[25%] h-[25%] bg-emerald-300/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }}></div>

            <div className="z-10 w-full max-w-md px-4 sm:px-0">
                <LoginForm />
            </div>
        </div>
    );
}