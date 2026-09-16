import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function LoginHero() {
  const { orgName, currency, receiptLanguage } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const formatMoney = (val) => {
    const num = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    return `${currency || '$'}${num}`;
  };

  // Default hardcoded paths if no stats
  let netWorthPath = "M0,110 C80,105 150,90 220,70 C290,50 380,35 460,22";
  let incomePath = "M0,122 C90,118 170,112 250,95 C330,78 400,68 460,60";
  let netWorthValue = "$84,250.00";
  let monthlySurplus = "+$4,140";

  if (stats && stats.chartData && stats.chartData.length > 0) {
    const data = stats.chartData;
    const maxVal = Math.max(...data.map(d => Math.max(d.netWorth, d.income)), 1); // Avoid div by 0
    
    // Scale X from 0 to 460, Y from 135 to 20
    const stepX = data.length > 1 ? 460 / (data.length - 1) : 460;
    
    const getPoints = (key) => data.map((d, i) => {
      const x = i * stepX;
      // y is inverted: 135 is bottom, 20 is top.
      const y = 135 - ((d[key] / maxVal) * 115);
      return `${x},${y}`;
    });

    const netWorthPts = getPoints('netWorth');
    const incomePts = getPoints('income');

    // Simple line generation
    netWorthPath = `M ${netWorthPts.join(' L ')}`;
    incomePath = `M ${incomePts.join(' L ')}`;

    netWorthValue = formatMoney(stats.totalNetWorth);
    const lastMonth = data[data.length - 1];
    const surplus = lastMonth.income - lastMonth.expense;
    monthlySurplus = `${surplus >= 0 ? '+' : ''}${formatMoney(surplus)}`;
  }

  return (
    <section className="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-8" data-purpose="hero-presentation">
      {/*  Brand Logo Header  */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 flex items-center justify-center">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-surface-dark">{orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')}</span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 ml-1">v4.8 Light</span>
      </div>
      
      {/*  Hero Headings  */}
      <div className="space-y-3 mb-6">
        <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-surface-dark leading-[1.15]">
          Understand your money. <br/>
          <span className="gradient-hero-text">Control your future.</span>
        </h1>
        <p className="text-surface-muted text-base sm:text-lg max-w-xl leading-relaxed pt-1">
          A simple, powerful way to track wealth, organize financial goals, and master personal cash flow with complete clarity and confidence.
        </p>
      </div>
      
      {/*  Visual Feature Card: Wealth Growth Preview  */}
      <div className="w-full max-w-xl bg-surface-card rounded-2xl p-6 border border-surface-border shadow-subtle-card transition-all hover:border-brand-100 mt-2" data-purpose="wealth-summary-widget">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live Data Connected
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-surface-muted">
            <span>Recent Surplus:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${monthlySurplus.startsWith('-') ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50/80'}`}>{monthlySurplus}</span>
          </div>
        </div>
        
        <div className="pt-5 pb-2">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-surface-muted font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Net Worth Trend
              </span>
              <span className="flex items-center gap-1.5 text-surface-muted font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Income Trend
              </span>
            </div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">6 Month Trajectory</span>
          </div>
          
          <div className="relative w-full h-36">
            <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 460 140">
              <defs>
                <linearGradient id="netWorthGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.16"></stop>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="incomeGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12"></stop>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              <line stroke="#f1f5f9" strokeDasharray="3 3" x1="0" x2="460" y1="20" y2="20"></line>
              <line stroke="#f1f5f9" strokeDasharray="3 3" x1="0" x2="460" y1="65" y2="65"></line>
              <line stroke="#f1f5f9" strokeDasharray="3 3" x1="0" x2="460" y1="110" y2="110"></line>
              
              {/* Dynamic Paths */}
              <path d={`${netWorthPath} L460,135 L0,135 Z`} fill="url(#netWorthGrad)"></path>
              <path d={`${incomePath} L460,135 L0,135 Z`} fill="url(#incomeGrad)"></path>
              <path d={incomePath} stroke="#4f46e5" strokeLinecap="round" strokeWidth="2.2" strokeLinejoin="round"></path>
              <path d={netWorthPath} stroke="#10b981" strokeLinecap="round" strokeWidth="2.5" strokeLinejoin="round"></path>
            </svg>
          </div>
          
          <div className="grid grid-cols-2 pt-4 mt-2 border-t border-slate-100">
            <div>
              <p className="text-[11px] font-medium text-surface-muted uppercase tracking-wider">Total Net Worth</p>
              <p className="text-lg font-bold text-surface-dark">{netWorthValue}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium text-surface-muted uppercase tracking-wider">Financial Health Score</p>
              <p className="text-lg font-bold text-surface-dark">82 / 100 <span className="text-xs font-medium text-brand-600 font-sans">Excellent</span></p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3.5 border-t border-dashed border-slate-200 flex items-center justify-between text-xs text-surface-muted">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span>Bank-Grade 256-bit Encryption</span>
          </div>
          <span className="inline-block text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Read-Only Bank Sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}
