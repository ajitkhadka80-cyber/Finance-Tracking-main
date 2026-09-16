import React from 'react';

export default function NoticeTickers() {
  return (
    <div className="space-y-2 mb-6">
      {/* Notice Bulletin */}
      <div className="flex bg-white border border-gray-200 rounded text-[13px] shadow-sm overflow-hidden items-stretch">
        <div className="bg-[#18529d] text-white px-3 py-2 font-bold flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[16px]">campaign</span>
          NOTICE BULLETIN
        </div>
        <div className="px-4 py-2 flex items-center text-gray-600 truncate w-full">
          ल कुनै नयाँ सूचना प्रसारण गरिएको छैन।
        </div>
      </div>

      {/* Documents Ticker */}
      <div className="flex bg-white border border-gray-200 rounded text-[13px] shadow-sm overflow-hidden items-stretch">
        <div className="bg-[#008ba3] text-white px-3 py-2 font-bold flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[16px]">description</span>
          DOCUMENTS TICKER
        </div>
        <div className="px-4 py-2 flex items-center text-gray-600 truncate w-full gap-2">
          <span className="material-symbols-outlined text-[16px] text-blue-500">article</span>
          fdgfd <span className="text-gray-400">[Central Office - २०८३ भदौ २५]</span>
        </div>
      </div>
    </div>
  );
}
