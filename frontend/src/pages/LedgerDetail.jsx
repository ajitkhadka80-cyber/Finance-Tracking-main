import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toNepaliDigits, toNepaliWords } from 'nepali-number-words';
import { toWords } from 'number-to-words';

export default function LedgerDetail() {
    const { code } = useParams();
    const { token, orgName, receiptLanguage } = useContext(AuthContext);
    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [fiscalYears, setFiscalYears] = useState([]);
    const [selectedFYId, setSelectedFYId] = useState('');
    const [currentFY, setCurrentFY] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetch('/api/fiscal-years', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                setFiscalYears(data);
                const active = data.find(fy => fy.is_current);
                if (active) {
                    setCurrentFY(active);
                    setSelectedFYId(active.id);
                } else if (data.length > 0) {
                    setCurrentFY(data[0]);
                    setSelectedFYId(data[0].id);
                }
            })
            .catch(console.error);
    }, [token]);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`/api/ledger/${code}`, { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setLedgerData(data);
                }
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch ledger data');
                setLoading(false);
            });
    }, [code, token]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading ledger data...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-rose-500">{error}</div>;
    }

    if (!ledgerData || !ledgerData.code) {
        return <div className="p-8 text-center text-slate-500">Ledger not found.</div>;
    }

    const selectedFY = fiscalYears.find(fy => fy.id === selectedFYId) || currentFY;
    const allTxs = ledgerData.transactions || [];

    let openingBalance = 0;
    let periodDr = 0;
    let periodCr = 0;

    const isAssetOrExpense = ['Assets', 'Expenses'].includes(ledgerData.code.classification);

    // Calculate opening balance (all transactions before selected fiscal year)
    if (selectedFY) {
        allTxs.forEach(tx => {
            const txDate = tx.date ? tx.date.split(' ')[0] : '';
            if (txDate && txDate < selectedFY.start_date) {
                const amount = Number(tx.amount) || 0;
                const isDr = tx.type === 'Dr';
                if (isAssetOrExpense) {
                    openingBalance += isDr ? amount : -amount;
                } else {
                    openingBalance += isDr ? -amount : amount;
                }
            }
        });
    }

    let runningBalance = openingBalance;
    const currentTransactions = [];

    // Filter and map current period transactions
    allTxs.forEach(tx => {
        const txDate = tx.date ? tx.date.split(' ')[0] : '';
        if (selectedFY && txDate >= selectedFY.start_date && txDate <= selectedFY.end_date) {
            const amount = Number(tx.amount) || 0;
            const isDr = tx.type === 'Dr';

            if (isDr) {
                periodDr += amount;
            } else {
                periodCr += amount;
            }

            if (isAssetOrExpense) {
                runningBalance += isDr ? amount : -amount;
            } else {
                runningBalance += isDr ? -amount : amount;
            }

            currentTransactions.push({ ...tx, balance: runningBalance });
        }
    });


    const isEng = receiptLanguage === 'english';
    const dNum = (num) => isEng ? num : toNepaliDigits(num);
    const dStr = (eng, nep) => isEng ? eng : nep;
    const totalWords = isEng
        ? 'IN WORDS: ' + toWords(runningBalance || 0).toUpperCase() + ' ONLY'
        : 'अक्षरूपी: ' + toNepaliWords(runningBalance || 0) + ' मात्र';

    const finalBalance = runningBalance;

    return (
        <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1200px] mx-auto min-h-screen">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between print:hidden gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/reports/ledger" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-slate-600">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ledger Report</h1>
                        <p className="text-sm text-slate-500">Detailed transaction view for account</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Fiscal Year:</label>
                        <select
                            value={selectedFYId}
                            onChange={(e) => setSelectedFYId(Number(e.target.value))}
                            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-500 shadow-sm"
                        >
                            {fiscalYears.map(fy => (
                                <option key={fy.id} value={fy.id}>{fy.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Print Ledger
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 overflow-x-auto print:p-0 print:border-none print:shadow-none print:overflow-visible">

                {/* Print Header */}
                <div className="hidden print:block text-center mb-6">
                    <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">{orgName || 'Organization Name'}</h2>
                    {selectedFY && (
                        <p className="text-sm font-semibold text-slate-700 mt-1 uppercase">Fiscal Year: {selectedFY.name}</p>
                    )}
                    <h3 className="text-lg font-semibold text-slate-800 mt-2 underline">Ledger Report</h3>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-[13px] md:text-sm font-sans" style={{ minWidth: '700px' }}>
                    <tbody>
                        <tr>
                            <td className="border border-slate-800 p-2 font-medium bg-slate-50 w-32 text-slate-700">Ledger name</td>
                            <td className="border border-slate-800 p-2 text-slate-900 font-semibold" colSpan={5}>{ledgerData.code.description}</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-800 p-2 font-medium bg-slate-50 text-slate-700">cade</td>
                            <td className="border border-slate-800 p-2 text-slate-900 font-semibold" colSpan={5}>{ledgerData.code.code_number}</td>
                        </tr>

                        {/* Spacer Row */}
                        <tr>
                            <td colSpan={6} className="h-6 border-l border-r border-slate-800 border-b border-slate-800"></td>
                        </tr>

                        <tr className="bg-slate-50 font-bold text-slate-800">
                            <td className="border border-slate-800 p-2 w-32">मिति</td>
                            <td className="border border-slate-800 p-2">विवरण</td>
                            <td className="border border-slate-800 p-2 w-28 text-center">भाैचर नं</td>
                            <td className="border border-slate-800 p-2 w-28 text-right">डेविट</td>
                            <td className="border border-slate-800 p-2 w-28 text-right">क्रेडिट</td>
                            <td className="border border-slate-800 p-2 w-32 text-right">ब्यालेन्स</td>
                        </tr>


                        {selectedFY && (
                            <tr className="bg-slate-50/50 italic text-slate-700">
                                <td className="border border-slate-800 p-2 whitespace-nowrap">{dNum(selectedFY.start_date)}</td>
                                <td className="border border-slate-800 p-2 font-semibold">{dStr('Opening Balance', 'अ.ल्या.')}</td>
                                <td className="border border-slate-800 p-2 text-center">-</td>
                                <td className="border border-slate-800 p-2 text-right">-</td>
                                <td className="border border-slate-800 p-2 text-right">-</td>
                                <td className="border border-slate-800 p-2 text-right font-mono font-bold text-slate-900">{dNum(openingBalance.toFixed(2))}</td>
                            </tr>
                        )}

                        {currentTransactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30">
                                <td className="border border-slate-800 p-2 text-slate-700 whitespace-nowrap">{tx.date ? tx.date.split('T')[0].split(' ')[0] : ''}</td>
                                <td className="border border-slate-800 p-2 text-slate-800">{tx.final_description}</td>
                                <td className="border border-slate-800 p-2 text-center text-slate-700">{tx.sn}</td>
                                <td className="border border-slate-800 p-2 text-right font-mono text-slate-700">{tx.type === 'Dr' ? tx.amount.toFixed(2) : ''}</td>
                                <td className="border border-slate-800 p-2 text-right font-mono text-slate-700">{tx.type === 'Cr' ? tx.amount.toFixed(2) : ''}</td>
                                <td className="border border-slate-800 p-2 text-right font-mono text-slate-900 font-medium">{tx.balance.toFixed(2)}</td>
                            </tr>
                        ))}

                        {currentTransactions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="border border-slate-800 p-8 text-center text-slate-500">No transactions recorded in this fiscal year.</td>
                            </tr>
                        )}

                        <tr className="font-bold bg-slate-50 text-slate-900">
                            <td className="border border-slate-800 p-2"></td>
                            <td className="border border-slate-800 p-2">Total (Period)</td>
                            <td className="border border-slate-800 p-2"></td>
                            <td className="border border-slate-800 p-2 text-right font-mono">{periodDr > 0 ? periodDr.toFixed(2) : '0'}</td>
                            <td className="border border-slate-800 p-2 text-right font-mono">{periodCr > 0 ? periodCr.toFixed(2) : '0'}</td>
                            <td className="border border-slate-800 p-2 text-right font-mono text-brand-700">{finalBalance.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                @media print {
                    @page { margin: 1cm; }
                    body { background: white; }
                }
            `}</style>
        </main>
    );
}
