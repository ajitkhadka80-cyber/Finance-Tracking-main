import React from 'react';

export default function AdminAddCodeForm({ onAddCode }) {
  return (
    <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
      <div className="flex items-center justify-between pb-space-sm">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Add Financial Code</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Classify corporate accounts into the ledger structure.</p>
        </div>
        <span className="material-symbols-outlined text-primary text-2xl">account_tree</span>
      </div>
      <form className="mt-space-md space-y-space-md flex-1 flex flex-col justify-between" id="financialCodeForm" onSubmit={onAddCode}>
        <div className="space-y-space-md">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="code_id">Code Number</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-label-md text-label-md text-outline">#</span>
              <input className="w-full pl-8 pr-3 py-2 bg-surface-container-low rounded-lg font-numerical-md text-numerical-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_rgba(79,70,229,0.25)] transition-all" id="code_id" name="code_id" maxLength="6" placeholder="e.g. 1040" required type="text"/>
            </div>
            <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">Tier rule: 1000s (Assets), 2000s (Liabilities), 4000s (Income), 6000s (Expenses)</p>
          </div>
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="code_desc">Code Description</label>
            <input className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_rgba(79,70,229,0.25)] transition-all" id="code_desc" name="code_desc" placeholder="e.g. Treasury Operating Reserve" required type="text"/>
          </div>
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">Financial Category</label>
            <div className="grid grid-cols-2 gap-2" id="categoryGroup">
              <label className="cursor-pointer">
                <input defaultChecked className="peer sr-only" name="code_class" type="radio" value="Assets"/>
                <div className="px-3 py-2 rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface-variant peer-checked:bg-surface-container-high peer-checked:text-primary peer-checked:font-semibold transition-all">
                  Assets
                </div>
              </label>
              <label className="cursor-pointer">
                <input className="peer sr-only" name="code_class" type="radio" value="Liabilities"/>
                <div className="px-3 py-2 rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface-variant peer-checked:bg-surface-container-high peer-checked:text-primary peer-checked:font-semibold transition-all">
                  Liabilities
                </div>
              </label>
              <label className="cursor-pointer">
                <input className="peer sr-only" name="code_class" type="radio" value="Income"/>
                <div className="px-3 py-2 rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface-variant peer-checked:bg-surface-container-high peer-checked:text-primary peer-checked:font-semibold transition-all">
                  Income
                </div>
              </label>
              <label className="cursor-pointer">
                <input className="peer sr-only" name="code_class" type="radio" value="Expenses"/>
                <div className="px-3 py-2 rounded-lg bg-surface-container-low text-center font-label-md text-label-md text-on-surface-variant peer-checked:bg-surface-container-high peer-checked:text-primary peer-checked:font-semibold transition-all">
                  Expenses
                </div>
              </label>
            </div>
          </div>
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary bg-surface-container-low focus:ring-0" id="taxDeductible" type="checkbox"/>
              <span className="font-body-sm text-body-sm text-on-surface">Eligible for Automated Tax Audit Deduction</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary bg-surface-container-low focus:ring-0" id="autoSync" type="checkbox"/>
              <span className="font-body-sm text-body-sm text-on-surface">Auto-reconcile nightly via Finora Clearing Engine</span>
            </label>
          </div>
        </div>
        <div className="pt-space-md">
          <button className="w-full h-10 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2" type="submit">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Register Financial Code
          </button>
        </div>
      </form>
    </div>
  );
}
