import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

export default function TrialBalance() {
    const { token, orgName, receiptLanguage } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('');
    const [printData, setPrintData] = useState(null); // stores fetched fiscal year and date
    
    const [trialBalanceData, setTrialBalanceData] = useState([]);
    const [totals, setTotals] = useState({ debit: 0, credit: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);



    const fetchTrialBalance = async () => {
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
                setTrialBalanceData(result.data || []);
                setTotals({ debit: result.totalDebit || 0, credit: result.totalCredit || 0 });
                setPrintData({ fiscalYear: result.fiscalYear, date: selectedDate });
            } else {
                setError(result.error || "Failed to fetch trial balance");
            }
        } catch (err) {
            setError("Error fetching trial balance");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        if (amount === 0 || !amount) return '';
        return new Intl.NumberFormat('en-NP', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trial Balance</h1>
                    <p className="text-sm text-slate-500 mt-1">View cumulative balances up to a specific month.</p>
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
                            onClick={fetchTrialBalance}
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

            {trialBalanceData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    
                    {/* Print Header */}
                    <div className="hidden print:block mb-4 text-black">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">
                                {orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')}
                            </h2>
                            <h3 className="text-lg font-semibold mt-1">Trial Balance</h3>
                        </div>
                        <div className="flex justify-between items-end mt-4 text-sm font-semibold border-b border-black pb-1">
                            <span>FISCAL YEAR: {printData?.fiscalYear?.name || ''}</span>
                            <div className="flex gap-8">
                                <span>Date:</span>
                                <span>{printData?.date || ''}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse print:border-black print:border">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200 print:bg-white print:border-black">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider print:border-black print:border print:text-black">Code</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider print:border-black print:border print:text-black">Description</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right print:border-black print:border print:text-black">Debit</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right print:border-black print:border print:text-black">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {trialBalanceData.slice().sort((a, b) => {
                                    // Try numeric sort first, fallback to string sort
                                    const numA = parseInt(a.code, 10);
                                    const numB = parseInt(b.code, 10);
                                    if (!isNaN(numA) && !isNaN(numB)) {
                                        return numA - numB;
                                    }
                                    return a.code.localeCompare(b.code);
                                }).map((row, idx) => (
                                    <tr 
                                        key={idx} 
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer print:hover:bg-transparent"
                                        onDoubleClick={() => navigate(`/reports/ledger/${row.code}`, { state: { fyId: printData?.fiscalYear?.id } })}
                                        title="Double click to view ledger"
                                    >
                                        <td className="py-4 px-6 text-sm text-slate-600 font-medium print:border-black print:border print:text-black">
                                            {row.code}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-900 print:border-black print:border print:text-black">
                                            {row.description}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-900 font-mono text-right print:border-black print:border print:text-black">
                                            {formatMoney(row.debit)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-900 font-mono text-right print:border-black print:border print:text-black">
                                            {formatMoney(row.credit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 border-t border-slate-200 print:bg-white print:border-black">
                                    <td colSpan="2" className="py-4 px-6 text-sm font-bold text-slate-900 text-right uppercase tracking-wider print:border-black print:border print:text-black">
                                        Total
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-brand-600 font-mono text-right print:border-black print:border print:text-black">
                                        {formatMoney(totals.debit)}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-brand-600 font-mono text-right print:border-black print:border print:text-black">
                                        {formatMoney(totals.credit)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
            
            {trialBalanceData.length === 0 && !loading && !error && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200/60 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-slate-400">receipt_long</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No Data</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">Select a fiscal year and month to generate the trial balance report.</p>
                </div>
            )}
        </div>
    );
}
