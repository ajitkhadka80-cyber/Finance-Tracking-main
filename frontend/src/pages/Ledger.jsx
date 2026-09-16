import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Ledger() {
    const { token } = useContext(AuthContext);
    const [codes, setCodes] = useState([]);
    const [filterCategory, setFilterCategory] = useState('All Classifications');

    useEffect(() => {
        if (!token) return;
        fetch('/api/codes', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => setCodes(data))
            .catch(console.error);
    }, [token]);

    const filteredCodes = codes.filter(c => filterCategory === 'All Classifications' || c.classification === filterCategory);

    return (
        <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ledger</h1>
                    <p className="text-sm text-slate-500">Select an account to view its ledger report.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Account Codes</h3>
                            <p className="text-sm text-slate-500">All registered ledger accounts</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter:</span>
                            <select
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none shadow-sm"
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                            >
                                <option value="All Classifications">All Classifications</option>
                                <option value="Assets">Assets</option>
                                <option value="Liabilities">Liabilities</option>
                                <option value="Income">Income</option>
                                <option value="Expenses">Expenses</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
                                    <th className="py-3 px-6 w-16">SN</th>
                                    <th className="py-3 px-6">Code Number</th>
                                    <th className="py-3 px-6">Description</th>
                                    <th className="py-3 px-6">Classification</th>
                                    <th className="py-3 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredCodes.map((c, index) => (
                                    <tr className="hover:bg-slate-50/50 transition-colors" key={c.code_number || c.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-slate-500 font-medium">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-medium text-slate-700">#{c.code_number}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-slate-900">{c.description}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-slate-600">{c.classification}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link 
                                                to={`/reports/ledger/${c.code_number}`}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm inline-block"
                                            >
                                                View Ledger
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCodes.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No codes found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
