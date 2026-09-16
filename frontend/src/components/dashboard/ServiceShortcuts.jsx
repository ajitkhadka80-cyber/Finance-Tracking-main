import React from 'react';
import { Link } from 'react-router-dom';

export default function ServiceShortcuts() {
  const shortcuts = [
    {
      title: 'Period Open Request',
      description: 'Request, review and approve Period Open access for ERP modules.',
      icon: 'calculate',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-700',
      topBorder: 'border-t-blue-500'
    },
    {
      title: 'Item Code Request',
      description: 'Submit new item code requests or manage pending approvals.',
      icon: 'inventory_2',
      iconColor: 'text-amber-700',
      titleColor: 'text-slate-700',
      topBorder: 'border-t-emerald-500'
    },
    {
      title: 'Inventory',
      description: 'Open Inventory module and manage inventory related activities.',
      icon: 'box',
      iconColor: 'text-purple-500',
      titleColor: 'text-purple-600',
      topBorder: 'border-t-purple-500'
    },
    {
      title: 'TDS',
      description: 'Open TDS module and manage tax deduction related activities.',
      icon: 'receipt_long',
      iconColor: 'text-teal-500',
      titleColor: 'text-teal-600',
      topBorder: 'border-t-teal-500'
    },
    {
      title: 'Assets Clearing',
      description: 'Open Assets Clearing module and manage asset clearing activities.',
      icon: 'corporate_fare',
      iconColor: 'text-orange-500',
      titleColor: 'text-orange-600',
      topBorder: 'border-t-orange-500'
    },
    {
      title: 'Report Analysis',
      description: 'Trial Balance, Details, Prepayment, APTB & Fixed Assets Validation.',
      icon: 'insert_chart',
      iconColor: 'text-red-500',
      titleColor: 'text-red-600',
      topBorder: 'border-t-red-500'
    },
    {
      title: 'Documents / Notice',
      description: 'Download central office circulars and upload office files.',
      icon: 'folder',
      iconColor: 'text-amber-400',
      titleColor: 'text-blue-700',
      topBorder: 'border-t-blue-400'
    }
  ];

  return (
    <div>
      <h2 className="text-[#114079] font-bold text-sm mb-3 uppercase tracking-wide">
        Service Shortcuts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {shortcuts.map((shortcut, index) => (
          <Link
            key={index}
            to="#"
            className={`bg-white border border-gray-200 border-t-4 rounded shadow-sm p-4 text-center hover:shadow-md transition-shadow flex flex-col items-center group ${shortcut.topBorder}`}
          >
            <div className="mb-2">
              <span className={`material-symbols-outlined text-4xl opacity-80 group-hover:scale-110 transition-transform ${shortcut.iconColor}`}>
                {shortcut.icon}
              </span>
            </div>
            <h3 className={`font-semibold text-[13px] mb-2 leading-tight ${shortcut.titleColor}`}>
              {shortcut.title}
            </h3>
            <p className="text-[10px] text-gray-500 leading-snug">
              {shortcut.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
