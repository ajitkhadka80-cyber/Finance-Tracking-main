import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";

export default function Settings() {
    const { token, orgName, orgAddress, currency, receiptLanguage, refreshOrgName } = useContext(AuthContext);
    const [newOrgName, setNewOrgName] = useState(orgName || '');
    const [newOrgAddress, setNewOrgAddress] = useState(orgAddress || '');
    const [newCurrency, setNewCurrency] = useState(currency || '$');
    const [newReceiptLanguage, setNewReceiptLanguage] = useState(receiptLanguage || 'nepali');

    const [fiscalYears, setFiscalYears] = useState([]);
    const [message, setMessage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [fyName, setFyName] = useState('');
    const [editingFY, setEditingFY] = useState(null);

    useEffect(() => {
        if (orgName) setNewOrgName(orgName);
        if (orgAddress) setNewOrgAddress(orgAddress);
        if (currency) setNewCurrency(currency);
        if (receiptLanguage) setNewReceiptLanguage(receiptLanguage);
    }, [orgName, orgAddress, currency, receiptLanguage]);

    const fetchFiscalYears = () => {
        fetch('/api/fiscal-years', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                const sortedData = data.sort((a, b) => {
                    if (a.start_date === b.start_date) {
                        return a.end_date.localeCompare(b.end_date);
                    }
                    return a.start_date.localeCompare(b.start_date);
                });
                setFiscalYears(sortedData);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchFiscalYears();
    }, [token]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    org_name: newOrgName,
                    org_address: newOrgAddress,
                    currency: newCurrency,
                    receipt_language: newReceiptLanguage
                })
            });
            if (res.ok) {
                await refreshOrgName(); // Trigger a refresh in context to update headers/title
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Organization Name updated successfully.',
                    showConfirmButton: false,
                    timer: 3000
                });
            } else {
                const err = await res.json();
                Swal.fire('Error', err.error, 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to connect to the server.', 'error');
        }
    };

    const handleAddFiscalYear = async (e) => {
        e.preventDefault();
        setMessage('');
        const newFY = {
            name: fyName,
            start_date: startDate,
            end_date: endDate
        };

        const url = editingFY ? `/api/fiscal-years/${editingFY.id}` : '/api/fiscal-years';
        const method = editingFY ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(newFY)
            });
            if (res.ok) {
                fetchFiscalYears();
                setFyName('');
                setStartDate('');
                setEndDate('');
                setEditingFY(null);
                setMessage(editingFY ? 'Fiscal year successfully updated.' : 'Fiscal year successfully created.');
            } else {
                const err = await res.json();
                setMessage(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to connect to the server.');
        }
    };

    const handleEditFYClick = (fy) => {
        setEditingFY(fy);
        setFyName(fy.name);
        setStartDate(fy.start_date);
        setEndDate(fy.end_date);
        setMessage('');
    };

    const handleCancelEditFY = () => {
        setEditingFY(null);
        setFyName('');
        setStartDate('');
        setEndDate('');
        setMessage('');
    };

    const handleSetActive = async (id) => {
        setMessage('');
        try {
            const res = await fetch(`/api/fiscal-years/${id}/set-current`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (res.ok) {
                fetchFiscalYears();
                // Dispatch a custom event so the DashboardHeader can listen and update instantly
                window.dispatchEvent(new Event('fiscalYearChanged'));
                setMessage('Active fiscal year updated successfully.');
            } else {
                const err = await res.json();
                setMessage(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to connect to the server.');
        }
    };

    return (
            <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
                        <p className="text-sm text-slate-500">Manage global organization configurations and fiscal years.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col self-start">
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Organization Details</h2>
                                    <p className="text-xs text-slate-500">This name will appear in receipts and navigation.</p>
                                </div>
                                <span className="material-symbols-outlined text-brand-600">business</span>
                            </div>

                            <form className="p-6 space-y-5" onSubmit={handleSave}>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="orgName">Organization Name</label>
                                    <input
                                        className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        id="orgName"
                                        name="orgName"
                                        placeholder="e.g. Acme Corp"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                        required
                                        type="text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="orgAddress">Organization Address</label>
                                    <input
                                        className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        id="orgAddress"
                                        name="orgAddress"
                                        placeholder="e.g. Kathmandu, Nepal"
                                        value={newOrgAddress}
                                        onChange={(e) => setNewOrgAddress(e.target.value)}
                                        type="text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="currency">Currency Symbol</label>
                                    <input
                                        className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        id="currency"
                                        name="currency"
                                        placeholder="e.g. $, Rs."
                                        value={newCurrency}
                                        onChange={(e) => setNewCurrency(e.target.value)}
                                        type="text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="receiptLanguage">Receipt Language Mode</label>
                                    <select
                                        className="w-full max-w-md px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        id="receiptLanguage"
                                        name="receiptLanguage"
                                        value={newReceiptLanguage}
                                        onChange={(e) => setNewReceiptLanguage(e.target.value)}
                                    >
                                        <option value="nepali">Nepali (नेपाली)</option>
                                        <option value="english">English</option>
                                    </select>
                                    <p className="mt-1 text-xs text-slate-500">Language used when downloading and printing receipts.</p>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <button className="py-2.5 px-6 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col self-start relative z-40">
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{editingFY ? 'Edit Fiscal Year' : 'Add Fiscal Year'}</h2>
                                    <p className="text-xs text-slate-500">{editingFY ? 'Update calendar details' : 'Create a new calendar'}</p>
                                </div>
                                <span className="material-symbols-outlined text-brand-600">calendar_month</span>
                            </div>

                            <form className="p-6 space-y-5" onSubmit={handleAddFiscalYear}>
                                {message && (
                                    <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                        {message}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="name">Name / Code</label>
                                    <input className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" id="name" name="name" value={fyName} onChange={e => setFyName(e.target.value)} placeholder="e.g. 77/78" required type="text" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="start_date">Start Date</label>
                                    <NepaliDatePicker
                                        inputClassName="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        value={startDate}
                                        onChange={(value) => setStartDate(value)}
                                        options={{ calenderLocale: "en", valueLocale: "en" }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="end_date">End Date</label>
                                    <NepaliDatePicker
                                        inputClassName="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        value={endDate}
                                        onChange={(value) => setEndDate(value)}
                                        options={{ calenderLocale: "en", valueLocale: "en" }}
                                    />
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    <button className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                                        <span className="material-symbols-outlined text-[18px]">{editingFY ? 'save' : 'add_circle'}</span>
                                        {editingFY ? 'Save Changes' : 'Create Fiscal Year'}
                                    </button>
                                    {editingFY && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEditFY}
                                            className="w-full py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-8">
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Configured Fiscal Years</h3>
                                <p className="text-sm text-slate-500">All registered periods.</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto w-full flex-1">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
                                        <th className="py-3 px-6">S.N.</th>
                                        <th className="py-3 px-6">Name</th>
                                        <th className="py-3 px-6">Start Date</th>
                                        <th className="py-3 px-6">End Date</th>
                                        <th className="py-3 px-6 text-center">Status</th>
                                        <th className="py-3 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {fiscalYears.map((fy, index) => (
                                        <tr className={`hover:bg-slate-50/50 transition-colors ${fy.is_current ? 'bg-brand-50/30' : ''}`} key={fy.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-slate-900">{fy.name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-slate-600">{fy.start_date}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-slate-600">{fy.end_date}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {fy.is_current ? (
                                                    <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Active
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSetActive(fy.id)}
                                                        className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded text-xs font-medium transition-colors"
                                                    >
                                                        Set Active
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleEditFYClick(fy)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit Fiscal Year"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {fiscalYears.length === 0 && (
                                        <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No fiscal years registered</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
    );
}
