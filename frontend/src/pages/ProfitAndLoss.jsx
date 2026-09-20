import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

export default function ProfitAndLoss() {
    const { token, orgName, receiptLanguage } = useContext(AuthContext);
    const [selectedDate, setSelectedDate] = useState('');
    const [printData, setPrintData] = useState(null);
    
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [netProfit, setNetProfit] = useState(0);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReport = async () => {
        if (!selectedDate) {
            setError("Please select a date.");
            return;
        }
        
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`/api/reports/trial-balance?date=${selectedDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (res.ok) {
                const data = result.data || [];
                
                const inc = [];
                const exp = [];
                let tInc = 0;
                let tExp = 0;
                
                data.forEach(item => {
                    const c = item.classification.toLowerCase();
                    if (c.includes('income')) {
                        const amount = item.credit - item.debit; // Income is usually Cr
                        if (amount !== 0) {
                            inc.push({ ...item, amount });
                            tInc += amount;
                        }
                    } else if (c.includes('expenditure') || c.includes('expense')) {
                        const amount = item.debit - item.credit; // Expense is usually Dr
                        if (amount !== 0) {
                            exp.push({ ...item, amount });
                            tExp += amount;
                        }
                    }
                });
                
                setIncomes(inc);
                setExpenses(exp);
                setTotalIncome(tInc);
                setTotalExpense(tExp);
                setNetProfit(tInc - tExp);
                
                setPrintData({ fiscalYear: result.fiscalYear, date: selectedDate });
            } else {
                setError(result.error || "Failed to fetch report data");
            }
        } catch (err) {
            setError("Error fetching report");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        if (amount === 0 || !amount) return '0.00';
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profit and Loss Account</h1>
                    <p className="text-sm text-slate-500 mt-1">View income and expenditures up to a specific date.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="h-10 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    Print
                </button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4 print:hidden">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="w-full sm:w-1/3">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Date (Up to)</label>
                        <NepaliDatePicker 
                            inputClassName="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                            value={selectedDate}
                            onChange={(value) => setSelectedDate(value)}
                            options={{ calenderLocale: "en", valueLocale: "en" }}
                        />
                    </div>
                    <div className="w-full sm:w-1/3">
                        <button 
                            onClick={fetchReport}
                            disabled={loading || !selectedDate}
                            className="w-full h-11 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-brand-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">search</span>
                            )}
                            Generate Report
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">error</span>
                        {error}
                    </div>
                )}
            </div>

            {printData && (
                <div className="bg-white p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-0 sm:border border-slate-200/60 print:p-0 print:border-none print:shadow-none print:w-full print:block min-h-[500px]">
                    <div className="text-center mb-6 border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                            {orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')}
                        </h2>
                        <h3 className="text-lg font-semibold text-slate-700 mt-1">Profit and Loss Account</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            For the period up to <span className="font-semibold text-slate-700">{printData.date}</span>
                        </p>
                        <p className="text-xs text-slate-400">Fiscal Year: {printData.fiscalYear.name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-slate-900">
                        {/* Expenditures Side (Dr) */}
                        <div className="border-b md:border-b-0 md:border-r border-slate-900 flex flex-col">
                            <div className="bg-slate-50 font-bold border-b border-slate-900 grid grid-cols-5 text-sm">
                                <div className="col-span-1 p-2 border-r border-slate-300">Code</div>
                                <div className="col-span-3 p-2 border-r border-slate-300">Expenditure</div>
                                <div className="p-2 text-right">Amount</div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                {expenses.map(e => (
                                    <div key={e.code} className="grid grid-cols-5 text-sm text-slate-700">
                                        <div className="col-span-1 p-2 font-mono text-xs border-r border-slate-300 flex items-center">{e.code}</div>
                                        <div className="col-span-3 p-2 border-r border-slate-300">{e.description}</div>
                                        <div className="p-2 text-right font-mono">{formatMoney(e.amount)}</div>
                                    </div>
                                ))}
                                {netProfit > 0 && (
                                    <div className="grid grid-cols-5 text-sm font-bold text-emerald-700 border-t border-slate-300 mt-auto">
                                        <div className="col-span-1 p-2 border-r border-slate-300"></div>
                                        <div className="col-span-3 p-2 border-r border-slate-300">Net Profit</div>
                                        <div className="p-2 text-right font-mono">{formatMoney(netProfit)}</div>
                                    </div>
                                )}
                            </div>
                            <div className="font-bold border-t border-slate-900 grid grid-cols-5 text-sm bg-slate-50">
                                <div className="col-span-4 p-2 text-right border-r border-slate-300">Total</div>
                                <div className="p-2 text-right font-mono">{formatMoney(totalExpense + (netProfit > 0 ? netProfit : 0))}</div>
                            </div>
                        </div>

                        {/* Income Side (Cr) */}
                        <div className="flex flex-col">
                            <div className="bg-slate-50 font-bold border-b border-slate-900 grid grid-cols-5 text-sm">
                                <div className="col-span-1 p-2 border-r border-slate-300">Code</div>
                                <div className="col-span-3 p-2 border-r border-slate-300">Income</div>
                                <div className="p-2 text-right">Amount</div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                {incomes.map(i => (
                                    <div key={i.code} className="grid grid-cols-5 text-sm text-slate-700">
                                        <div className="col-span-1 p-2 font-mono text-xs border-r border-slate-300 flex items-center">{i.code}</div>
                                        <div className="col-span-3 p-2 border-r border-slate-300">{i.description}</div>
                                        <div className="p-2 text-right font-mono">{formatMoney(i.amount)}</div>
                                    </div>
                                ))}
                                {netProfit < 0 && (
                                    <div className="grid grid-cols-5 text-sm font-bold text-red-700 border-t border-slate-300 mt-auto">
                                        <div className="col-span-1 p-2 border-r border-slate-300"></div>
                                        <div className="col-span-3 p-2 border-r border-slate-300">Net Loss</div>
                                        <div className="p-2 text-right font-mono">{formatMoney(Math.abs(netProfit))}</div>
                                    </div>
                                )}
                            </div>
                            <div className="font-bold border-t border-slate-900 grid grid-cols-5 text-sm bg-slate-50 mt-auto">
                                <div className="col-span-4 p-2 text-right border-r border-slate-300">Total</div>
                                <div className="p-2 text-right font-mono">{formatMoney(totalIncome + (netProfit < 0 ? Math.abs(netProfit) : 0))}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { size: portrait; margin: 15mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                    .print\\:border-none { border: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:w-full { width: 100% !important; }
                }
            `}} />
        </div>
    );
}
