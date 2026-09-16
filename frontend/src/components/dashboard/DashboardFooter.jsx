import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardFooter() {
    const { orgName, receiptLanguage } = useContext(AuthContext);
    const date = new Date().getFullYear();
    return (
        <footer className="border-t border-slate-200 bg-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>© {date} {orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')} All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <a className="hover:text-slate-800 transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-slate-800 transition-colors" href="#">Terms of Service</a>
                    <a className="hover:text-slate-800 transition-colors" href="#">Support</a>
                </div>
            </div>
        </footer>
    );
}
