import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NepaliDatePicker } from "nepali-datepicker-reactjs";
import "nepali-datepicker-reactjs/dist/index.css";
import NepaliDate from 'nepali-date-converter';

export default function ScheduleWork() {
    const { token, user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const todayNepali = new NepaliDate().format('YYYY-MM-DD');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(todayNepali);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [completingTask, setCompletingTask] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState(todayNepali);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/schedule-work', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setTasks(data);
            } else {
                setError(data.error || 'Failed to fetch tasks');
            }
        } catch (err) {
            setError('Error fetching tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !dueDate) {
            setError('Title and Due Date are required.');
            return;
        }

        try {
            const url = editingTaskId ? `/api/schedule-work/${editingTaskId}` : '/api/schedule-work';
            const method = editingTaskId ? 'PUT' : 'POST';
            
            const body = { title, description, due_date: dueDate };
            if (editingTaskId) {
                // Keep the existing status when editing
                const existingTask = tasks.find(t => t.id === editingTaskId);
                if (existingTask) body.status = existingTask.status;
            }

            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                setIsFormOpen(false);
                setTitle('');
                setDescription('');
                setDueDate(todayNepali);
                setEditingTaskId(null);
                fetchTasks();
            } else {
                setError(data.error || 'Failed to save task');
            }
        } catch (err) {
            setError('Error saving task');
        }
    };

    const toggleStatus = async (task) => {
        if (task.status === 'pending') {
            setCompletingTask(task);
            setRescheduleDate(todayNepali);
            return;
        }

        const newStatus = 'pending';
        try {
            const res = await fetch(`/api/schedule-work/${task.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...task, status: newStatus })
            });
            if (res.ok) {
                fetchTasks();
            }
        } catch (err) {
            console.error('Error updating task status', err);
        }
    };

    const handleCloseTask = async () => {
        if (!completingTask) return;
        try {
            const res = await fetch(`/api/schedule-work/${completingTask.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...completingTask, status: 'completed' })
            });
            if (res.ok) {
                setCompletingTask(null);
                fetchTasks();
            }
        } catch (err) {
            console.error('Error closing task', err);
        }
    };

    const handleRescheduleTask = async () => {
        if (!completingTask || !rescheduleDate) return;
        try {
            const res = await fetch(`/api/schedule-work/${completingTask.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...completingTask, status: 'pending', due_date: rescheduleDate })
            });
            if (res.ok) {
                setCompletingTask(null);
                fetchTasks();
            }
        } catch (err) {
            console.error('Error rescheduling task', err);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm("Are you sure you want to delete this scheduled work?")) return;
        try {
            const res = await fetch(`/api/schedule-work/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchTasks();
            }
        } catch (err) {
            console.error('Error deleting task', err);
        }
    };

    return (
        <div className="w-full max-w-[1600px] px-4 md:px-6 lg:px-8 mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work to be Done</h1>
                    <p className="text-sm text-slate-500 mt-1">Schedule and keep track of important future tasks.</p>
                </div>
                <button
                    onClick={() => {
                        if (isFormOpen) {
                            setTitle('');
                            setDescription('');
                            setDueDate(todayNepali);
                            setEditingTaskId(null);
                        }
                        setIsFormOpen(!isFormOpen);
                    }}
                    className="h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-brand-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {isFormOpen ? 'close' : 'add'}
                    </span>
                    {isFormOpen ? 'Cancel' : 'Add New Work'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    {error}
                </div>
            )}

            {completingTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Task</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                "{completingTask.title}"
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Option 1: Reschedule for future</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <NepaliDatePicker 
                                                inputClassName="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                                                value={rescheduleDate}
                                                onChange={(value) => setRescheduleDate(value)}
                                                options={{ calenderLocale: "en", valueLocale: "en" }}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleRescheduleTask}
                                            className="h-11 px-4 bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold text-sm rounded-xl transition-colors shrink-0"
                                        >
                                            Reschedule
                                        </button>
                                    </div>
                                </div>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                    <div className="relative flex justify-center"><span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR</span></div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Option 2: Close permanently</label>
                                    <button 
                                        onClick={handleCloseTask}
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                                    >
                                        Mark as Completed & Close
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setCompletingTask(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 transition-all">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">
                        {editingTaskId ? 'Edit Scheduled Work' : 'Schedule New Work'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter task title"
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Due Date</label>
                                <NepaliDatePicker 
                                    inputClassName="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                                    value={dueDate}
                                    onChange={(value) => setDueDate(value)}
                                    options={{ calenderLocale: "en", valueLocale: "en" }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add more details about the task..."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none min-h-[100px]"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="h-11 px-6 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-brand-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Save Scheduled Work
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="material-symbols-outlined animate-spin text-brand-600 text-3xl">progress_activity</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-400">task</span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">No scheduled work</h3>
                            <p className="text-slate-500 text-sm max-w-sm">You're all caught up! Click the button above to add important future tasks to your schedule.</p>
                        </div>
                    ) : (
                        [...tasks].sort((a, b) => {
                            if (a.status === 'completed' && b.status !== 'completed') return 1;
                            if (a.status !== 'completed' && b.status === 'completed') return -1;
                            return 0;
                        }).map((task) => {
                            let daysRemaining = 0;
                            try {
                                const today = new NepaliDate();
                                const due = new NepaliDate(task.due_date);
                                const diffTime = due.toJsDate().getTime() - today.toJsDate().getTime();
                                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            } catch(e) {}

                            const isUrgent = daysRemaining <= 10 && daysRemaining >= 0 && task.status !== 'completed';
                            const isUpcoming = daysRemaining > 10 && daysRemaining <= 14 && task.status !== 'completed';
                            const isOverdue = daysRemaining < 0 && task.status !== 'completed';

                            let bgClass = 'bg-white';
                            let borderColorClass = 'border-slate-200/60 hover:border-brand-200';
                            if (task.status === 'completed') {
                                borderColorClass = 'border-slate-200/60 opacity-60';
                            } else if (isUrgent || isOverdue) {
                                borderColorClass = 'border-red-400 hover:border-red-500 shadow-md shadow-red-500/10';
                                bgClass = 'bg-red-50/60';
                            } else if (isUpcoming) {
                                borderColorClass = 'border-emerald-400 hover:border-emerald-500 shadow-md shadow-emerald-500/10';
                                bgClass = 'bg-emerald-50/30';
                            }
                            
                            let iconColorClass = 'text-brand-500';
                            if (task.status === 'completed') iconColorClass = 'text-slate-400';
                            else if (isUrgent || isOverdue) iconColorClass = 'text-red-500';
                            else if (isUpcoming) iconColorClass = 'text-emerald-500';

                            let textColorClass = 'text-brand-600';
                            if (task.status === 'completed') textColorClass = 'text-slate-400';
                            else if (isUrgent || isOverdue) textColorClass = 'text-red-600';
                            else if (isUpcoming) textColorClass = 'text-emerald-600';

                            return (
                            <div 
                                key={task.id} 
                                className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${bgClass} ${borderColorClass}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 pr-4">
                                        <h3 className={`font-bold text-base line-clamp-1 ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                            {task.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className={`material-symbols-outlined text-[14px] ${iconColorClass}`}>event</span>
                                            <span className={`text-xs font-semibold ${textColorClass}`}>
                                                {task.due_date} 
                                                {isOverdue && ' (Overdue)'}
                                                {isUrgent && ` (${daysRemaining === 0 ? 'Today' : 'In ' + daysRemaining + ' days'})`}
                                                {isUpcoming && ` (In ${daysRemaining} days)`}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => toggleStatus(task)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                task.status === 'completed' 
                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            }`}
                                            title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {task.status === 'completed' ? 'undo' : 'check'}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setEditingTaskId(task.id);
                                                setTitle(task.title);
                                                setDescription(task.description || '');
                                                setDueDate(task.due_date);
                                                setIsFormOpen(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        {user?.role === 'admin' && (
                                            <button 
                                                onClick={() => deleteTask(task.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {task.description && (
                                    <p className={`text-sm line-clamp-3 mt-3 ${task.status === 'completed' ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {task.description}
                                    </p>
                                )}
                                
                                {task.status === 'completed' && (
                                    <div className="absolute inset-0 bg-white/40 rounded-2xl pointer-events-none backdrop-blur-[1px]"></div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            )}
        </div>
    );
}
