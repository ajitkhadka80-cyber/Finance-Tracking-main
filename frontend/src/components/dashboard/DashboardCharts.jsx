import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardCharts({ transactions = [] }) {
    const { currency } = useContext(AuthContext);
    const [timeframe, setTimeframe] = useState(6); // Default 6M

    // Aggregate transactions by month
    const monthlyStats = {};
    transactions.forEach(tx => {
        if (!tx.date) return;
        const month = tx.date.substring(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
            monthlyStats[month] = { income: 0, expense: 0 };
        }
        monthlyStats[month].expense += tx.totalDr || 0;
        monthlyStats[month].income += tx.totalCr || 0;
    });

    const sortedMonths = Object.keys(monthlyStats).sort().slice(-timeframe);
    const chartData = sortedMonths.map(m => ({ month: m, ...monthlyStats[m] }));

    // Default paths and values
    let incomePath = "M 0 165 C 120 145, 200 115, 320 85 C 440 60, 520 70, 560 38 C 620 50, 670 30, 700 25";
    let expensePath = "M 0 190 C 130 180, 220 160, 320 150 C 420 140, 510 135, 560 125 C 630 115, 670 120, 700 118";
    let incomeAvg = "$8,420";
    let expenseAvg = "$4,280";
    let xLabels = (
        <div className="w-full flex justify-between pt-3 px-1 text-xs text-slate-400 font-medium">
            <span>May</span><span>Jun</span><span>Jul</span><span className="text-indigo-600 font-semibold">Aug</span><span>Sep</span>
        </div>
    );
    let activeIncomeCy = 38;
    let activeExpenseCy = 125;
    let activeCx = 560;

    if (chartData.length > 0) {
        const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);
        const stepX = chartData.length > 1 ? 700 / (chartData.length - 1) : 700;

        const getPoints = (key) => chartData.map((d, i) => {
            const x = i * stepX;
            // y inverted: 210 is bottom, 20 is top
            const y = 210 - ((d[key] / maxVal) * 190);
            return `${x},${y}`;
        });

        const incPts = getPoints('income');
        const expPts = getPoints('expense');

        incomePath = `M ${incPts.join(' L ')}`;
        expensePath = `M ${expPts.join(' L ')}`;

        const formatMoney = (val) => {
            const num = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
            return `${currency || '$'}${num}`;
        };
        const totalInc = chartData.reduce((s, d) => s + d.income, 0);
        const totalExp = chartData.reduce((s, d) => s + d.expense, 0);
        incomeAvg = formatMoney(totalInc / chartData.length);
        expenseAvg = formatMoney(totalExp / chartData.length);

        xLabels = (
            <div className="w-full flex justify-between pt-3 px-1 text-xs text-slate-400 font-medium">
                {chartData.map((d, i) => (
                    <span key={d.month} className={i === chartData.length - 1 ? 'text-indigo-600 font-semibold' : ''}>
                        {new Date(d.month + '-01').toLocaleString('default', { month: 'short' })}
                    </span>
                ))}
            </div>
        );

        // active point is the last point
        activeCx = (chartData.length - 1) * stepX;
        activeIncomeCy = 210 - ((chartData[chartData.length - 1].income / maxVal) * 190);
        activeExpenseCy = 210 - ((chartData[chartData.length - 1].expense / maxVal) * 190);
    }

    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/*  Left: Cash Flow Chart (8 cols)  */}
            <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col h-auto min-h-[462px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Cash Flow</h2>
                        <p className="text-sm text-slate-500">Income vs Expenses over the last {timeframe} months</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-slate-400 uppercase">Avg Income</span>
                            <span className="text-indigo-600 font-bold">{incomeAvg}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-slate-400 uppercase">Avg Expense</span>
                            <span className="text-rose-500 font-bold">{expenseAvg}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative w-full h-full mt-4 flex flex-col min-h-[250px]">
                    <div className="flex-1 relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 700 210" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="20" x2="700" y2="20" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="6 6" />
                            <line x1="0" y1="115" x2="700" y2="115" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="6 6" />
                            <line x1="0" y1="210" x2="700" y2="210" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="6 6" />

                            {/* Chart lines */}
                            <path d={incomePath} fill="none" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />
                            <path d={expensePath} fill="none" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />

                            {/* Active points */}
                            {chartData.length > 0 && (
                                <>
                                    <circle cx={activeCx} cy={activeIncomeCy} r="5" fill="#fff" stroke="#6366F1" strokeWidth="3" />
                                    <circle cx={activeCx} cy={activeExpenseCy} r="5" fill="#fff" stroke="#F43F5E" strokeWidth="3" />
                                </>
                            )}
                        </svg>
                    </div>
                    {xLabels}
                </div>
            </div>

            {/*  Right: Member Info Card (4 cols)  */}
            <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6 h-auto min-h-[462px] flex flex-col">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Member Info</h2>
                    <p className="text-sm text-slate-500">Demographic overview</p>
                </div>

                <div className="flex-1 flex flex-col gap-4 pt-2">
                    {/* जम्मा सदस्य */}
                    <div className="flex flex-col bg-indigo-50/50 rounded-2xl border border-indigo-100 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">groups</span>
                            </div>
                            <h3 className="text-slate-700 font-semibold text-sm">जम्मा सदश्य संख्याs</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-indigo-100">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Up to Last FY</span>
                                <span className="text-sm font-bold text-slate-700">0</span>
                            </div>
                            <div className="flex flex-col pl-2">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Current FY</span>
                                <span className="text-sm font-bold text-slate-700">0</span>
                            </div>
                            <div className="flex flex-col pl-2">
                                <span className="text-[9px] uppercase font-bold text-indigo-600">Total</span>
                                <span className="text-lg font-extrabold text-indigo-700 leading-none mt-0.5">0</span>
                            </div>
                        </div>
                    </div>

                    {/*पुरुष */}
                    <div className="flex flex-col bg-sky-50/50 rounded-2xl border border-sky-100 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">man</span>
                            </div>
                            <h3 className="text-slate-700 font-semibold text-sm">पुरुष</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-sky-100">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Up to Last FY</span>
                                <span className="text-sm font-bold text-slate-700">0</span>
                            </div>
                            <div className="flex flex-col pl-2">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Current FY</span>
                                <span className="text-sm font-bold text-slate-700">0</span>
                            </div>
                            <div className="flex flex-col pl-2">
                                <span className="text-[9px] uppercase font-bold text-sky-600">Total</span>
                                <span className="text-lg font-extrabold text-sky-700 leading-none mt-0.5">0</span>
                            </div>
                        </div>
                    </div>

                    {/*महिला */}
                    <div className="flex flex-col bg-pink-50/50 rounded-2xl border border-pink-100 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">woman</span>
                            </div>
                            <h3 className="text-slate-700 font-semibold text-sm">महिला</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-pink-100">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Up to Last FY</span>
                                <span className="text-sm font-bold text-slate-700">0</span>
                            </div>
                            <div className="flex flex-col pl-2">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Current FY</span>
                                <span className="text-sm font-bold text-slate-700">0</span>
                            </div>
                            <div className="flex flex-col pl-2">
                                <span className="text-[9px] uppercase font-bold text-pink-600">Total</span>
                                <span className="text-lg font-extrabold text-pink-700 leading-none mt-0.5">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
