
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Report, ReportType, ItemStatus } from '../types';

interface FeedProps {
  reports: Report[];
  onSelectReport: (id: string) => void;
  highlightId?: string | null;
}

const Feed: React.FC<FeedProps> = ({ reports, onSelectReport, highlightId }) => {
  const [filterType, setFilterType] = useState<'ALL' | ReportType>('ALL');
  const [search, setSearch] = useState('');
  const scrollRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const filteredReports = useMemo(() => {
    return reports
      .filter(r => r.status === ItemStatus.OPEN)
      .filter(r => filterType === 'ALL' || r.type === filterType)
      .filter(r => r.itemName.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [reports, filterType, search]);

  useEffect(() => {
    if (highlightId && scrollRefs.current[highlightId]) {
      scrollRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Shirpur Global Feed</h2>
          <p className="text-slate-500">Real-time reports from across the Shirpur Campus.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Reports</option>
            <option value={ReportType.LOST}>Lost Items</option>
            <option value={ReportType.FOUND}>Found Items</option>
          </select>
          
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-600 flex items-center">
            <i className="fas fa-map-marker-alt mr-2"></i>
            NMIMS Shirpur
          </div>
        </div>
      </div>

      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input 
          type="text"
          placeholder="Search items by name or category..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReports.map(report => (
          <div 
            key={report.id}
            ref={el => scrollRefs.current[report.id] = el}
            onClick={() => onSelectReport(report.id)}
            className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border select-none ${
              highlightId === report.id 
                ? 'ring-4 ring-indigo-500 ring-offset-4 border-indigo-500 animate-pulse' 
                : 'border-slate-100'
            }`}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="relative h-48 overflow-hidden bg-slate-200">
              {report.imageUrl ? (
                <>
                  <img 
                    src={report.imageUrl} 
                    alt={report.itemName}
                    className="w-full h-full object-cover blur-xl scale-110 grayscale"
                  />
                  <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white">
                    <i className="fas fa-lock text-2xl mb-2 drop-shadow-md"></i>
                    <span className="text-[10px] font-bold uppercase tracking-widest drop-shadow-md">Verify to Unlock</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <i className="fas fa-image text-4xl opacity-50"></i>
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                  report.type === ReportType.LOST ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {report.type}
                </span>
                {report.isSensitive && (
                  <span className="bg-slate-900/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase">
                    Sensitive
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{report.category}</p>
              <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{report.itemName}</h3>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {report.location}
                </span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredReports.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <i className="fas fa-ghost text-5xl mb-4 opacity-20"></i>
          <p>No reports found on Shirpur Campus matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Feed;
