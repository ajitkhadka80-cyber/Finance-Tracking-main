import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import DashboardFooter from './DashboardFooter';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 print:ml-0 flex flex-col">
        <div className="print:hidden">
          <TopNav />
        </div>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <div className="print:hidden">
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
