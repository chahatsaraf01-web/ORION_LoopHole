
import React from 'react';
import { Report, Match, ReportType, ItemStatus } from '../types';

interface DashboardProps {
  reports: Report[];
  matches: Match[];
  onSelectReport: (id: string) => void;
  onSelectMatch: (id: string) => void;
  setActiveTab: (tab: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ reports, matches, onSelectReport, onSelectMatch, setActiveTab }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">My Reports</h2>
          <p className="text-slate-500">Manage your lost and found items.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveTab('lost')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:bg-indigo-700 transition-all"
          >
            <i className="fas fa-plus"></i>
            <span>Lost Something?</span>
          </button>
          <button 
             onClick={() => setActiveTab('found')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:bg-emerald-700 transition-all"
          >
            <i className="fas fa-check"></i>
            <span>Found Something?</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-slate-700 flex items-center space-x-2">
            <i className="fas fa-history text-indigo-400"></i>
            <span>Recent Activity</span>
          </h3>
          
          {reports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
              <i className="fas fa-box-open text-4xl mb-3"></i>
              <p>No active reports yet. Start by adding one!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map(report => (
                <div 
                  key={report.id} 
                  onClick={() => onSelectReport(report.id)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        report.type === ReportType.LOST ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        <i className={`fas ${report.type === ReportType.LOST ? 'fa-search-minus' : 'fa-hand-holding-heart'}`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{report.itemName}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-slate-400 flex items-center">
                            <i className="fas fa-map-marker-alt mr-1"></i> {report.location}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      report.status === ItemStatus.OPEN ? 'bg-indigo-50 text-indigo-600' :
                      report.status === ItemStatus.MATCHED ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-700 flex items-center space-x-2">
            <i className="fas fa-bolt text-amber-400"></i>
            <span>Potential Matches</span>
          </h3>
          
          {matches.length === 0 ? (
            <div className="bg-indigo-50 rounded-3xl p-8 text-center border border-indigo-100">
              <p className="text-indigo-900 font-medium mb-1">Checking for matches...</p>
              <p className="text-indigo-400 text-sm">We'll notify you as soon as someone finds your item.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map(match => (
                <div 
                  key={match.id}
                  onClick={() => onSelectMatch(match.id)}
                  className="bg-white border-l-4 border-amber-400 p-4 rounded-xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">High Confidence</span>
                    <span className="text-[10px] text-slate-400">{match.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">New match found for your report!</p>
                  <p className="text-xs text-slate-500 mt-1">Verify details to start chat.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
