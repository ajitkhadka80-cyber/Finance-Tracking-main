import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardMetricCards from '../components/dashboard/DashboardMetricCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import NepaliDate from 'nepali-date-converter';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [expiredTasks, setExpiredTasks] = useState([]);
  const { token, user } = useContext(AuthContext);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  useEffect(() => {
    fetch('/api/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error('Error fetching transactions:', err));

    fetch('/api/schedule-work', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const today = new NepaliDate();
        const urgent = [];
        const expired = [];
        data.forEach(task => {
          if (task.status === 'completed') return;
          try {
             const due = new NepaliDate(task.due_date);
             const diffTime = due.toJsDate().getTime() - today.toJsDate().getTime();
             const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             if (daysRemaining < 0) {
                 expired.push(task);
             } else if (daysRemaining <= 10) {
                 urgent.push(task);
             }
          } catch(e) {}
        });
        setUrgentTasks(urgent);
        setExpiredTasks(expired);
      })
      .catch(err => console.error('Error fetching tasks:', err));
  }, [token]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:px-8 max-w-[1600px] w-full mx-auto space-y-8">
          
          {expiredTasks.length > 0 && (
            <Link to="/schedule-work/work-to-be-done" className="block">
              <div className="bg-red-600 border border-red-700 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3 animate-pulse shadow-md shadow-red-600/20 hover:bg-red-700 transition-colors">
                <span className="material-symbols-outlined text-[28px] hidden sm:block">warning</span>
                <span className="font-bold text-sm sm:text-base text-center">
                  WARNING: You have {expiredTasks.length} EXPIRED task{expiredTasks.length !== 1 ? 's' : ''}! Please address them immediately.
                </span>
              </div>
            </Link>
          )}

          {urgentTasks.length > 0 && (
            <Link to="/schedule-work/work-to-be-done" className="block">
              <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3 shadow-md shadow-orange-500/10 hover:bg-orange-100 transition-colors">
                <span className="material-symbols-outlined text-[28px] hidden sm:block">emergency</span>
                <span className="font-bold text-sm sm:text-base text-center">
                  Notice: You have {urgentTasks.length} task{urgentTasks.length !== 1 ? 's' : ''} due within 10 days.
                </span>
              </div>
            </Link>
          )}

          {/*  Header Greeting & Action Bar  */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{getGreeting()}, {user?.name?.split(' ')[0] || 'Alex'}</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Here is your financial summary for this month.</p>
            </div>
          </section>

          <DashboardMetricCards transactions={transactions} />
          <DashboardCharts transactions={transactions} />
          
    </main>
  );
}