import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardMetricCards from '../components/dashboard/DashboardMetricCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import NepaliDate from 'nepali-date-converter';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
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
        const urgent = data.filter(task => {
          if (task.status === 'completed') return false;
          try {
             const due = new NepaliDate(task.due_date);
             const diffTime = due.toJsDate().getTime() - today.toJsDate().getTime();
             const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             return daysRemaining <= 10;
          } catch(e) { return false; }
        });
        setUrgentTasks(urgent);
      })
      .catch(err => console.error('Error fetching tasks:', err));
  }, [token]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:px-8 max-w-[1600px] w-full mx-auto space-y-8">
          
          {urgentTasks.length > 0 && (
            <Link to="/schedule-work/work-to-be-done" className="block">
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3 animate-pulse shadow-md shadow-red-500/10 hover:bg-red-100 transition-colors">
                <span className="material-symbols-outlined text-[28px] hidden sm:block">emergency</span>
                <span className="font-bold text-sm sm:text-base text-center">
                  URGENT: You have {urgentTasks.length} task{urgentTasks.length !== 1 ? 's' : ''} due in less than a week (or overdue). Click here to view!
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
            <div className="flex items-center justify-end">
              <img src="/logo.jpg" alt="Logo" className="h-16 object-contain drop-shadow-sm" />
            </div>
          </section>

          <DashboardMetricCards transactions={transactions} />
          <DashboardCharts transactions={transactions} />
          
    </main>
  );
}