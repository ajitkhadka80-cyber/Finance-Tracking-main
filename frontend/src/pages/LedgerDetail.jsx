import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toNepaliDigits, toNepaliWords } from 'nepali-number-words';
import { toWords } from 'number-to-words';

export default function LedgerDetail() {
    const { code } = useParams();
    const location = useLocation();
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
                const stateFyId = location.state?.fyId;

                if (stateFyId) {
                    const stateFy = data.find(fy => fy.id.toString() === stateFyId.toString());
                    if (stateFy) {
                        setCurrentFY(stateFy);
                        setSelectedFYId(stateFy.id);
                        return;
                    }
                }

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

    const classification = (ledgerData?.code?.classification || '').toLowerCase();
    const isAssetOrExpense = classification.includes('asset') || classification.includes('expenditure') || classification.includes('expense');
    const isNominal = classification.includes('income') || classification.includes('expenditure') || classification.includes('expense');

    // Calculate opening balance (all transactions before selected fiscal year)
    let openingDr = 0;
    let openingCr = 0;

    if (selectedFY && !isNominal) {
        allTxs.forEach(tx => {
            const txDate = tx.date ? tx.date.split(' ')[0] : '';
            if (txDate && txDate < selectedFY.start_date) {
                const amount = Number(tx.amount) || 0;
                if (tx.type === 'Dr') openingDr += amount;
                else openingCr += amount;
            }
        });
    }
    
    let runningDr = openingDr;
    let runningCr = openingCr;
    
    // Determine opening balance value and type
    let openingBalanceVal = Math.abs(runningDr - runningCr);
    let openingBalanceType = runningDr > runningCr ? 'Dr' : (runningCr > runningDr ? 'Cr' : '');

    const currentTransactions = [];

    // Filter and map current period transactions
    allTxs.forEach(tx => {
        const txDate = tx.date ? tx.date.split(' ')[0] : '';
        if (selectedFY && txDate >= selectedFY.start_date && txDate <= selectedFY.end_date) {
            const amount = Number(tx.amount) || 0;
            const isDr = tx.type === 'Dr';

            if (isDr) {
                periodDr += amount;
                runningDr += amount;
            } else {
                periodCr += amount;
                runningCr += amount;
            }
            
            let balVal = Math.abs(runningDr - runningCr);
            let balType = runningDr > runningCr ? 'Dr' : (runningCr > runningDr ? 'Cr' : '');

            currentTransactions.push({ ...tx, balanceVal: balVal, balanceType: balType });
        }
    });

    const isEng = receiptLanguage === 'english';
    const dNum = (num) => isEng ? num : toNepaliDigits(num);
    const dStr = (eng, nep) => isEng ? eng : nep;
    
    let finalBalanceVal = Math.abs(runningDr - runningCr);
    let finalBalanceType = runningDr > runningCr ? 'Dr' : (runningCr > runningDr ? 'Cr' : '');

    const totalWords = isEng
        ? 'IN WORDS: ' + toWords(finalBalanceVal || 0).toUpperCase() + ' ONLY'
        : 'अक्षरूपी: ' + toNepaliWords(finalBalanceVal || 0) + ' मात्र';

    const finalBalance = finalBalanceVal;

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

                {/* Report Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">{orgName || 'Organization Name'}</h2>
                    {selectedFY && (
                        <p className="text-sm font-semibold text-slate-700 mt-1 uppercase">Fiscal Year: {selectedFY.name}</p>
                    )}
                    <h3 className="text-lg font-semibold text-slate-800 mt-2 underline">Ledger Report</h3>
                    <p className="text-md font-bold text-brand-700 mt-1">{ledgerData.code.description} (Code: {ledgerData.code.code_number})</p>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-[13px] md:text-sm font-sans" style={{ minWidth: '700px' }}>
                    <tbody>


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
                                <td className="border border-slate-800 p-2 text-right font-mono font-bold text-slate-900">{dNum(openingBalanceVal.toFixed(2))} {openingBalanceType}</td>
                            </tr>
                        )}

                        {currentTransactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30">
                                <td className="border border-slate-800 p-2 text-slate-700 whitespace-nowrap">{tx.date ? tx.date.split('T')[0].split(' ')[0] : ''}</td>
                                <td className="border border-slate-800 p-2 text-slate-800">{tx.final_description}</td>
                                <td className="border border-slate-800 p-2 text-center text-slate-700">{tx.sn}</td>
                                <td className="border border-slate-800 p-2 text-right font-mono text-slate-700">{tx.type === 'Dr' ? tx.amount.toFixed(2) : ''}</td>
                                <td className="border border-slate-800 p-2 text-right font-mono text-slate-700">{tx.type === 'Cr' ? tx.amount.toFixed(2) : ''}</td>
                                <td className="border border-slate-800 p-2 text-right font-mono text-slate-900 font-medium">{tx.balanceVal.toFixed(2)} {tx.balanceType}</td>
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
                            <td className="border border-slate-800 p-2 text-right font-mono text-brand-700">{finalBalanceVal.toFixed(2)} {finalBalanceType}</td>
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
