import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function TopNav() {
  const { user, orgName, receiptLanguage, token } = useContext(AuthContext);
  const [currentDateTime, setCurrentDateTime] = useState('');
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
    window.addEventListener('fiscalYearChanged', fetchActiveFY);
    return () => window.removeEventListener('fiscalYearChanged', fetchActiveFY);
  }, [token]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
      const timeString = now.toLocaleTimeString('en-US', { hour12: true });
      setCurrentDateTime(`${dateString} | ${timeString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain rounded" />
        <h1 className="text-xl font-bold text-[#114079] tracking-tight uppercase">
          {orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-[#114079] font-medium flex flex-col items-end mr-4">
          <div className="flex items-center gap-2">
            <span>🙏</span>
            <span>नमस्ते - {user?.name || 'User'} ({user?.role || 'ADMIN'})</span>
          </div>
          {currentFY && (
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
              FY: {currentFY.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded px-3 py-1.5 text-[13px] text-[#114079] font-medium">
          <span className="material-symbols-outlined text-[16px] text-[#114079]">calendar_month</span>
          <span>{currentDateTime}</span>
        </div>
      </div>
    </header>
  );
}
