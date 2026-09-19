import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardMetricCards from '../components/dashboard/DashboardMetricCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
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
  }, [token]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:px-8 max-w-[1600px] w-full mx-auto space-y-8">
          
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