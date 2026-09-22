import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import NepaliDate from 'nepali-date-converter';
import * as XLSX from 'xlsx';

export default function TrialBalance() {
    const { token, orgName, receiptLanguage } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const todayNepali = new NepaliDate().format('YYYY-MM-DD');
    const [selectedDate, setSelectedDate] = useState(todayNepali);
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

    const handleDownloadExcel = () => {
        if (trialBalanceData.length === 0) return;
        
        const dataToExport = trialBalanceData.map(row => ({
            'Code': row.code,
            'Description': row.description,
            'Debit': row.debit || 0,
            'Credit': row.credit || 0
        }));

        dataToExport.push({
            'Code': '',
            'Description': 'Total',
            'Debit': totals.debit,
            'Credit': totals.credit
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Trial Balance");
        XLSX.writeFile(wb, `Trial_Balance_${selectedDate}.xlsx`);
    };

    return (
        <div className="w-full max-w-[1600px] px-4 md:px-6 lg:px-8 mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trial Balance</h1>
                    <p className="text-sm text-slate-500 mt-1">View cumulative balances up to a specific month.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadExcel}
                        disabled={trialBalanceData.length === 0}
                        className="h-10 px-4 bg-brand-50 border border-brand-200 text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-100 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">file_download</span>
                        Export
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="h-10 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Print
                    </button>
                </div>
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

            {printData && trialBalanceData.length > 0 && (
                <div className="bg-white p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-0 sm:border border-slate-200/60 print:p-0 print:border-none print:shadow-none print:w-full print:block min-h-[500px]">
                    <div className="text-center mb-6 border-b border-slate-200 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
                            {orgName || (receiptLanguage === 'english' ? 'DIYO SAVING AND CREDIT COOPERATIVE LIMITED' : 'दियो वचत तथा ऋण सहकारी संस्था लिमिटेड')}
                        </h2>
                        <h3 className="text-lg font-semibold text-slate-700 mt-1">Trial Balance</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            As of <span className="font-semibold text-slate-700">{printData.date}</span>
                        </p>
                        <p className="text-xs text-slate-400">Fiscal Year: {printData.fiscalYear.name}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-0 border border-slate-900">
                        <div className="flex flex-col">
                            <div className="bg-slate-50 font-bold border-b border-slate-900 grid grid-cols-12 text-sm">
                                <div className="col-span-2 p-2 border-r border-slate-300">Code</div>
                                <div className="col-span-4 p-2 border-r border-slate-300">Description</div>
                                <div className="col-span-3 p-2 text-right border-r border-slate-300">Debit</div>
                                <div className="col-span-3 p-2 text-right">Credit</div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                {trialBalanceData.slice().sort((a, b) => {
                                    // Try numeric sort first, fallback to string sort
                                    const numA = parseInt(a.code, 10);
                                    const numB = parseInt(b.code, 10);
                                    if (!isNaN(numA) && !isNaN(numB)) {
                                        return numA - numB;
                                    }
                                    return a.code.localeCompare(b.code);
                                }).map((row, idx) => (
                                    <div 
                                        key={idx} 
                                        className="grid grid-cols-12 text-sm text-slate-700 hover:bg-slate-50/50 cursor-pointer print:hover:bg-transparent"
                                        onDoubleClick={() => navigate(`/reports/ledger/${row.code}`, { state: { fyId: printData?.fiscalYear?.id } })}
                                        title="Double click to view ledger"
                                    >
                                        <div className="col-span-2 p-2 font-mono text-xs border-r border-slate-300 flex items-center">{row.code}</div>
                                        <div className="col-span-4 p-2 border-r border-slate-300">{row.description}</div>
                                        <div className="col-span-3 p-2 text-right font-mono border-r border-slate-300">{formatMoney(row.debit)}</div>
                                        <div className="col-span-3 p-2 text-right font-mono">{formatMoney(row.credit)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="font-bold border-t border-slate-900 grid grid-cols-12 text-sm bg-slate-50">
                                <div className="col-span-6 p-2 text-right border-r border-slate-300 uppercase tracking-wider text-slate-900">Total</div>
                                <div className="col-span-3 p-2 text-right font-mono text-brand-600 border-r border-slate-300">{formatMoney(totals.debit)}</div>
                                <div className="col-span-3 p-2 text-right font-mono text-brand-600">{formatMoney(totals.credit)}</div>
                            </div>
                        </div>
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
