
import React from 'react';
import { Match, Report, ReportType } from '../types';

interface MatchSelectionProps {
  suggestions: { match: Match, report: Report }[];
  newReportType: ReportType;
  onClaim: (matchId: string) => void;
  onDismiss: () => void;
}

const MatchSelection: React.FC<MatchSelectionProps> = ({ suggestions, newReportType, onClaim, onDismiss }) => {
  const isFoundReport = newReportType === ReportType.FOUND;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-indigo-600 p-8 text-white relative">
          <button 
            onClick={onDismiss}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              <i className="fas fa-magic"></i>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Auto-Match Results</h2>
          </div>
          <p className="text-indigo-100 text-sm">
            {isFoundReport 
              ? "We found users who reported losing similar items. Do you want to check if one belongs to them?"
              : "We found items on Shirpur Campus that look similar to what you lost. Is one of these yours?"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {suggestions.map(({ match, report }) => (
            <div 
              key={match.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group flex items-start space-x-4"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                {report.imageUrl ? (
                  <>
                    <img 
                      src={report.imageUrl} 
                      className="w-full h-full object-cover blur-md grayscale" 
                      alt="Match Candidate" 
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                      <i className="fas fa-eye-slash text-xl"></i>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <i className="fas fa-image text-2xl opacity-30"></i>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{report.itemName}</h4>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{report.category}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    {match.confidence}% Match
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed italic">"{report.description}"</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {isFoundReport ? `Reported lost near ${report.location}` : `Found near ${report.location}`}
                  </span>
                  <button 
                    onClick={() => onClaim(match.id)}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {isFoundReport ? "Yes, check with owner" : "Yes, this is mine"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">None of these matched? We'll notify you if new items are {isFoundReport ? "reported lost" : "found"}.</p>
          <button 
            onClick={onDismiss}
            className="w-full sm:w-auto px-6 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            No, none of these
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSelection;
