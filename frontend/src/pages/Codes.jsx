import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function Codes() {
    const { token, user } = useContext(AuthContext);
    const [codes, setCodes] = useState([]);
    const [message, setMessage] = useState('');
    const [filterCategory, setFilterCategory] = useState('All Classifications');
    const [sortOrder, setSortOrder] = useState('asc');

    const [editingCode, setEditingCode] = useState(null);
    const [codeForm, setCodeForm] = useState({ code_id: '', code_desc: '', code_class: 'Assets' });
    const fileInputRef = useRef(null);

    const handleDownloadSample = () => {
        const ws = XLSX.utils.json_to_sheet([
            { code_number: '1001', description: 'Cash in Bank', classification: 'Assets' },
            { code_number: '2001', description: 'Accounts Payable', classification: 'Liabilities' },
            { code_number: '3001', description: 'Sales Revenue', classification: 'Income' },
            { code_number: '4001', description: 'Rent Expense', classification: 'Expenses' }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Codes");
        XLSX.writeFile(wb, "Sample_Codes.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                const formattedCodes = data.map(row => ({
                    code_number: String(row.code_number || row.Code || row['Code Number'] || ''),
                    description: row.description || row.Description || '',
                    classification: row.classification || row.Classification || 'Assets'
                })).filter(c => c.code_number && c.description);

                if (formattedCodes.length === 0) {
                    Swal.fire('Error', 'No valid codes found in the Excel file. Please check the format.', 'error');
                    return;
                }

                const res = await fetch('/api/codes/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ codes: formattedCodes })
                });
                
                if (res.ok) {
                    fetchCodes();
                    Swal.fire('Success', `${formattedCodes.length} codes uploaded successfully.`, 'success');
                } else {
                    const err = await res.json();
                    Swal.fire('Error', err.error || 'Failed to upload codes', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to parse the Excel file.', 'error');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const fetchCodes = () => {
        fetch('/api/codes', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(res => res.json())
            .then(data => {
                setCodes(data);
                sessionStorage.setItem('codes', JSON.stringify(data));
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchCodes();
    }, [token]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setCodeForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveCode = async (e) => {
        e.preventDefault();
        setMessage('');
        const newCode = {
            code_number: codeForm.code_id,
            description: codeForm.code_desc,
            classification: codeForm.code_class,
            status: 'Active'
        };

        const url = editingCode ? `/api/codes/${editingCode}` : '/api/codes';
        const method = editingCode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(newCode)
            });
            if (res.ok) {
                fetchCodes();
                setCodeForm({ code_id: '', code_desc: '', code_class: 'Assets' });
                setMessage(editingCode ? 'Financial code successfully updated.' : 'Financial code successfully registered.');
                setEditingCode(null);
            } else {
                const err = await res.json();
                setMessage(`Error: ${err.error}`);
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to connect to the server.');
        }
    };

    const handleEditClick = (c) => {
        setEditingCode(c.code_number);
        setCodeForm({
            code_id: c.code_number,
            code_desc: c.description,
            code_class: c.classification
        });
        setMessage('');
    };

    const handleCancelEdit = () => {
        setEditingCode(null);
        setCodeForm({ code_id: '', code_desc: '', code_class: 'Assets' });
        setMessage('');
    };

    const handleDeleteCode = async (c) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`/api/codes/${c.code_number}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                if (res.ok) {
                    fetchCodes();
                    Swal.fire('Deleted!', 'Code has been deleted.', 'success');
                } else {
                    const err = await res.json();
                    Swal.fire('Error', err.error, 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'Failed to connect to the server.', 'error');
            }
        }
    };

    return (
            <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Code Setup</h1>
                        <p className="text-sm text-slate-500">Manage and classify corporate accounts into the ledger structure.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left: Create/Edit Code Form */}
                        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col self-start">
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{editingCode ? 'Edit Code' : 'Add Code'}</h2>
                                    <p className="text-xs text-slate-500">{editingCode ? 'Update account details' : 'Register new account'}</p>
                                </div>
                                <span className="material-symbols-outlined text-brand-600">account_tree</span>
                            </div>

                            <form className="p-6 space-y-5" onSubmit={handleSaveCode}>
                                {message && (
                                    <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                        {message}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="code_id">Code Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 font-medium text-slate-400">#</span>
                                        <input
                                            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                            id="code_id"
                                            name="code_id"
                                            value={codeForm.code_id}
                                            onChange={handleFormChange}
                                            maxLength="6"
                                            placeholder="e.g. 1040"
                                            required
                                            type="number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="code_desc">Description</label>
                                    <input
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                                        id="code_desc"
                                        name="code_desc"
                                        value={codeForm.code_desc}
                                        onChange={handleFormChange}
                                        placeholder="e.g. Operating Reserve"
                                        required
                                        type="text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Classification</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="cursor-pointer relative">
                                            <input
                                                className="peer sr-only"
                                                name="code_class"
                                                type="radio"
                                                value="Assets"
                                                checked={codeForm.code_class === 'Assets'}
                                                onChange={handleFormChange}
                                            />
                                            <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                                                Assets
                                            </div>
                                        </label>
                                        <label className="cursor-pointer relative">
                                            <input
                                                className="peer sr-only"
                                                name="code_class"
                                                type="radio"
                                                value="Liabilities"
                                                checked={codeForm.code_class === 'Liabilities'}
                                                onChange={handleFormChange}
                                            />
                                            <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                                                Liabilities
                                            </div>
                                        </label>
                                        <label className="cursor-pointer relative">
                                            <input
                                                className="peer sr-only"
                                                name="code_class"
                                                type="radio"
                                                value="Income"
                                                checked={codeForm.code_class === 'Income'}
                                                onChange={handleFormChange}
                                            />
                                            <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                                                Income
                                            </div>
                                        </label>
                                        <label className="cursor-pointer relative">
                                            <input
                                                className="peer sr-only"
                                                name="code_class"
                                                type="radio"
                                                value="Expenses"
                                                checked={codeForm.code_class === 'Expenses'}
                                                onChange={handleFormChange}
                                            />
                                            <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 transition-all">
                                                Expenses
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col gap-2">
                                    <button className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium text-sm shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2" type="submit">
                                        <span className="material-symbols-outlined text-[18px]">{editingCode ? 'save' : 'add_circle'}</span>
                                        {editingCode ? 'Update Code' : 'Register Code'}
                                    </button>
                                    {editingCode && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="w-full py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Right: Code Table */}
                        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Master Catalog</h3>
                                    <p className="text-sm text-slate-500">All registered ledger accounts.</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button 
                                        onClick={handleDownloadSample}
                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"
                                        title="Download Sample Format"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">download</span>
                                        <span className="hidden sm:inline">Sample</span>
                                    </button>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"
                                        title="Upload Excel File"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                        <span className="hidden sm:inline">Upload</span>
                                    </button>
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
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

                            <div className="overflow-x-auto w-full flex-1">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white">
                                            <th className="py-3 px-6 cursor-pointer hover:bg-slate-50 transition-colors select-none" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                                <div className="flex items-center gap-1">
                                                    Code
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-6">Description</th>
                                            <th className="py-3 px-6">Classification</th>
                                            <th className="py-3 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {codes
                                            .filter(c => filterCategory === 'All Classifications' || c.classification === filterCategory)
                                            .sort((a, b) => {
                                                const numA = parseInt(a.code_number, 10) || 0;
                                                const numB = parseInt(b.code_number, 10) || 0;
                                                return sortOrder === 'asc' ? numA - numB : numB - numA;
                                            })
                                            .map(c => (
                                                <tr className="hover:bg-slate-50/50 transition-colors" key={c.code_number || c.id}>
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
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEditClick(c)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit Code"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        {user?.role === 'admin' && (
                                                            <button
                                                                onClick={() => handleDeleteCode(c)}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                                title="Delete Code"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        {codes.filter(c => filterCategory === 'All Classifications' || c.classification === filterCategory).length === 0 && (
                                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No codes registered</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>Showing {codes.length} ledger codes</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
    );
}
