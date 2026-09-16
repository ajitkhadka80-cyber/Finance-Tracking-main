import React from 'react';
import AdminAddCodeForm from './AdminAddCodeForm';

export default function AdminCodesTab({ codes, onAddCode, isActive }) {
  if (!isActive) return null;

  return (
    <section className="tab-pane flex flex-col gap-gutter" id="tab-codes">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/*  Left: Create Code Form  */}
        <AdminAddCodeForm onAddCode={onAddCode} />
        
        {/*  Right: Code Ledger Preview Table  */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Master Code Catalog</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Showing operational accounts indexed in the primary vault.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Filter:</span>
              <select className="px-2.5 py-1 bg-surface-container-low rounded-lg font-label-md text-label-md text-on-surface focus:outline-none">
                <option>All Tiers</option>
                <option>1000 Assets</option>
                <option>2000 Liabilities</option>
                <option>4000 Income</option>
                <option>6000 Expenses</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg">Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-surface-card">
                {codes.map(c => (
                  <tr className="hover:bg-surface-container-lowest transition-colors group cursor-pointer" key={c.code}>
                    <td className="px-space-md py-space-md whitespace-nowrap"><span className="font-numerical-md font-semibold text-on-surface">{c.code}</span></td>
                    <td className="px-space-md py-space-md whitespace-nowrap"><span className="font-body-md font-medium text-on-surface">{c.description}</span></td>
                    <td className="px-space-md py-space-md whitespace-nowrap"><span className="font-body-sm text-on-surface-variant">{c.classification}</span></td>
                    <td className="px-space-md py-space-md whitespace-nowrap"><span className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant text-on-surface rounded font-label-sm text-label-sm">{c.status}</span></td>
                    <td className="px-space-md py-space-md whitespace-nowrap text-right"><button className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-lg">more_vert</span></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-auto pt-space-md flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span>Showing {codes.length} ledger codes</span>
            <div className="flex gap-2">
              <button className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high transition-colors">Previous</button>
              <button className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
