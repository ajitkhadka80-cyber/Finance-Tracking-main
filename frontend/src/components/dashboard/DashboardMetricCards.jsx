import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function DashboardMetricCards({ transactions = [] }) {
  const { currency, token } = useContext(AuthContext);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);
  const [loanBalance, setLoanBalance] = useState(0);
  const [incomeBalance, setIncomeBalance] = useState(0);
  const [expenseBalance, setExpenseBalance] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetch('/api/codes', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
             const incomeCodes = new Set(data.filter(c => c.classification === 'Income').map(c => c.code_number));
             const expenseCodes = new Set(data.filter(c => c.classification === 'Expenses').map(c => c.code_number));
             let totalIncome = 0;
             let totalExpense = 0;
             transactions.forEach(tx => {
                tx.lines?.forEach(line => {
                   if (incomeCodes.has(line.code_number)) {
                      totalIncome += line.type === 'Cr' ? (Number(line.amount) || 0) : -(Number(line.amount) || 0);
                   }
                   if (expenseCodes.has(line.code_number)) {
                      totalExpense += line.type === 'Dr' ? (Number(line.amount) || 0) : -(Number(line.amount) || 0);
                   }
                });
             });
             setIncomeBalance(totalIncome);
             setExpenseBalance(totalExpense);
         }
      })
      .catch(console.error);
  }, [token, transactions]);

  useEffect(() => {
    if (!token) return;
    const fetchBalance = async (code, setter) => {
        try {
            const res = await fetch(`/api/ledger/${code}`, { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await res.json();
            if (!data.error && data.transactions && data.code) {
                const isAssetOrExpense = ['Assets', 'Expenses'].includes(data.code.classification);
                let bal = 0;
                data.transactions.forEach(tx => {
                    const amt = Number(tx.amount) || 0;
                    if (isAssetOrExpense) {
                        bal += tx.type === 'Dr' ? amt : -amt;
                    } else {
                        bal += tx.type === 'Dr' ? -amt : amt;
                    }
                });
                setter(bal);
            }
        } catch (err) {
            console.error(`Error fetching ledger ${code}:`, err);
        }
    };

    fetchBalance('30', setSavingsBalance);
    fetchBalance('90', setBankBalance);
    fetchBalance('110', setLoanBalance);
  }, [token]);

  const formatMoney = (val) => {
    const num = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    return `${currency || '$'}${num}`;
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {/*  Total Saving (Code 30)  */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-orange-500 rounded shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Saving</span>
          <span className="material-symbols-outlined text-orange-400 opacity-80 text-2xl">savings</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-orange-600 tracking-tight">{formatMoney(savingsBalance)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Code 30 Ledger Balance</p>
        </div>
      </div>
      
      {/*  Bank Balance (Code 90)  */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-emerald-500 rounded shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bank Balance</span>
          <span className="material-symbols-outlined text-emerald-400 opacity-80 text-2xl">account_balance</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">{formatMoney(bankBalance)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Code 90 Ledger Balance</p>
        </div>
      </div>
      
      {/*  Total Loan (Code 110)  */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Loan</span>
          <span className="material-symbols-outlined text-blue-400 opacity-80 text-2xl">account_balance_wallet</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight">{formatMoney(loanBalance)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Code 110 Ledger Balance</p>
        </div>
      </div>

      {/*  Total Income  */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-purple-500 rounded shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Income</span>
          <span className="material-symbols-outlined text-purple-400 opacity-80 text-2xl">monitoring</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 tracking-tight">{formatMoney(incomeBalance)}</div>
          <p className="text-[11px] text-slate-400 mt-1">All Income Ledgers</p>
        </div>
      </div>

      {/*  Total Expenses  */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-rose-500 rounded shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Expenses</span>
          <span className="material-symbols-outlined text-rose-400 opacity-80 text-2xl">trending_down</span>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">{formatMoney(expenseBalance)}</div>
          <p className="text-[11px] text-slate-400 mt-1">All Expense Ledgers</p>
        </div>
      </div>
      
    </section>
  );
}
