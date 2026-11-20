import React from 'react';

export const CatalogSkeleton: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-20 bg-slate-200 rounded-2xl shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="w-24 h-4 bg-slate-200 rounded-full"></div>
                <div className="w-3/4 h-5 bg-slate-200 rounded-lg"></div>
                <div className="w-1/2 h-3 bg-slate-200 rounded-md"></div>
              </div>
            </div>
            <div className="w-24 h-8 bg-slate-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="h-48 bg-slate-200 w-full"></div>
          <div className="p-5 space-y-3">
            <div className="w-24 h-4 bg-slate-200 rounded-full"></div>
            <div className="w-full h-5 bg-slate-200 rounded-lg"></div>
            <div className="w-2/3 h-3 bg-slate-200 rounded-md"></div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="w-20 h-4 bg-slate-200 rounded-md"></div>
              <div className="w-16 h-4 bg-slate-200 rounded-md"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 p-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
      ))}
    </div>
  );
};
