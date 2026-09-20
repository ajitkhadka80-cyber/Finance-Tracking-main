import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function BackupRestore() {
    const { token } = useContext(AuthContext);
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = useRef(null);

    const handleDownloadBackup = () => {
        fetch('/api/backup', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DiyoPortal_backup_${new Date().toISOString().split('T')[0]}.db`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error downloading backup:', error);
            Swal.fire('Error', 'Failed to download the database backup.', 'error');
        });
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.db') && !file.name.endsWith('.sqlite')) {
            Swal.fire('Invalid File', 'Please upload a valid SQLite database file (.db)', 'error');
            e.target.value = null; // reset
            return;
        }

        const confirm = await Swal.fire({
            title: 'Critical Warning!',
            text: "Restoring a database will OVERWRITE all current data. The system will be restarted immediately. This action CANNOT be undone. Make sure you have a current backup!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Restore Database!'
        });

        if (confirm.isConfirmed) {
            setIsRestoring(true);
            const formData = new FormData();
            formData.append('dbfile', file);

            try {
                const res = await fetch('/api/restore', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });

                if (res.ok) {
                    await Swal.fire({
                        title: 'Restore Successful',
                        text: 'The database has been restored. The server is restarting. Please manually refresh the page in a few moments, or if running manually, restart your backend server.',
                        icon: 'success',
                        confirmButtonText: 'Understood'
                    });
                    window.location.reload();
                } else {
                    const err = await res.json();
                    Swal.fire('Error', err.error || 'Failed to restore database', 'error');
                    setIsRestoring(false);
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to connect to the server.', 'error');
                setIsRestoring(false);
            }
        }
        
        e.target.value = null;
    };

    return (
        <main className="w-full p-4 md:p-6 lg:px-8 max-w-[1600px] mx-auto min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Database Backup & Restore</h1>
                    <p className="text-sm text-slate-500">Securely download a snapshot of the system data, or restore from a previous backup file.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Backup Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-600 text-3xl">cloud_download</span>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Download Backup</h2>
                                <p className="text-xs text-slate-500">Export the SQLite database</p>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <p className="text-sm text-slate-600 mb-6">
                                Create an immediate full snapshot of your system data, including all financial records, user accounts, and settings. Store this file securely.
                            </p>
                            <button 
                                onClick={handleDownloadBackup}
                                className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Download Database (.db)
                            </button>
                        </div>
                    </div>

                    {/* Restore Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-rose-200 flex flex-col">
                        <div className="p-6 border-b border-rose-200 bg-rose-50 flex items-center gap-3">
                            <span className="material-symbols-outlined text-rose-600 text-3xl">settings_backup_restore</span>
                            <div>
                                <h2 className="text-lg font-bold text-rose-900">Restore Database</h2>
                                <p className="text-xs text-rose-600">Import from a previous backup</p>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div className="mb-6">
                                <p className="text-sm text-slate-600 mb-2">
                                    Upload a previously downloaded <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">.db</code> file.
                                </p>
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                                    <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">warning</span>
                                    <p className="text-xs text-amber-800">
                                        <strong>Warning:</strong> Restoring will <strong>permanently overwrite</strong> all current data. The system will be taken offline momentarily.
                                    </p>
                                </div>
                            </div>
                            
                            <input 
                                type="file" 
                                accept=".db,.sqlite" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            
                            <button 
                                onClick={handleRestoreClick}
                                disabled={isRestoring}
                                className={`w-full py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${isRestoring ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{isRestoring ? 'hourglass_empty' : 'upload_file'}</span>
                                {isRestoring ? 'Restoring System...' : 'Upload & Restore (.db)'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
