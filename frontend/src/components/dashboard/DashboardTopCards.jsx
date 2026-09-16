import React from 'react';

export default function DashboardTopCards() {
  const cards = [
    {
      title: 'Period Open Pending',
      value: '0',
      valueColor: 'text-orange-500',
      borderColor: 'border-orange-500',
      icon: 'hourglass_empty',
      iconColor: 'text-orange-300'
    },
    {
      title: 'Item Code Pending',
      value: '1',
      valueColor: 'text-amber-500',
      borderColor: 'border-amber-500',
      icon: 'inventory_2',
      iconColor: 'text-amber-700'
    },
    {
      title: 'Current Fiscal Year',
      value: 'FY2083/84',
      valueColor: 'text-emerald-700',
      borderColor: 'border-emerald-600',
      icon: 'calendar_month',
      iconColor: 'text-indigo-300'
    },
    {
      title: 'Circulars & Docs',
      value: '1',
      valueColor: 'text-blue-800',
      borderColor: 'border-blue-500',
      icon: 'folder',
      iconColor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {cards.map((card, index) => (
        <div key={index} className={`bg-white border border-gray-200 border-l-4 rounded shadow-sm p-4 flex items-center justify-between ${card.borderColor}`}>
          <div>
            <div className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">{card.title}</div>
          </div>
          <div>
            <span className={`material-symbols-outlined text-3xl opacity-80 ${card.iconColor}`}>
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
