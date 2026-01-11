
import React from 'react';
import { Report, Match, ReportType, User } from '../types';

interface ItemDetailsProps {
  report: Report | null;
  onClose: () => void;
  matches: Match[];
  onCheckMatch: (matchId: string) => void;
  onInitiateChat: (reportId: string) => void;
  currentUser: User;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ report, onClose, matches, onCheckMatch, onInitiateChat, currentUser }) => {
  if (!report) return null;

  const relevantMatch = matches.find(m => 
    (m.lostReportId === report.id || m.foundReportId === report.id) && 
    m.status !== 'REJECTED'
  );

  const isMyReport = report.userId === currentUser.id;

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      <div className="flex items-center justify-between mb-8">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          report.type === ReportType.LOST ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {report.type} Report
        </span>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
          <i className="fas fa-times text-slate-400"></i>
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        <div className="relative h-56 rounded-3xl overflow-hidden bg-slate-100 border border-slate-100">
          {report.imageUrl ? (
            <>
              <img src={report.imageUrl} className="w-full h-full object-cover blur-2xl scale-110 grayscale" alt="Locked" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm text-white">
                <i className="fas fa-shield-lock text-3xl mb-2"></i>
                <p className="text-xs font-bold uppercase tracking-wider">Identity Check Required</p>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fas fa-image text-5xl"></i></div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">{report.itemName}</h2>
          <div className="flex items-center text-slate-400 text-xs mt-2 font-medium">
            <i className="fas fa-clock mr-1.5"></i>
            <span>Posted {new Date(report.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
            <p className="text-sm font-semibold text-slate-700">{report.location}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Campus</p>
            <p className="text-sm font-semibold text-indigo-600">Shirpur</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Item Description</p>
          <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl leading-relaxed italic">"{report.description}"</p>
        </div>

        {!isMyReport && (
          <div className="pt-4">
            <button 
              onClick={() => onInitiateChat(report.id)}
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <i className="fas fa-comments"></i>
              <span>{relevantMatch ? 'Open Chat' : (report.type === ReportType.FOUND ? 'Claim This Item' : 'I Found This')}</span>
            </button>
          </div>
        )}

        {relevantMatch && isMyReport && (
          <div className="pt-6 border-t mt-6">
            <p className="text-sm font-bold text-slate-700 mb-4 flex items-center"><i className="fas fa-magic text-indigo-500 mr-2"></i>Active Interaction</p>
            <button onClick={() => onCheckMatch(relevantMatch.id)} className="w-full bg-indigo-50 p-4 rounded-2xl border border-indigo-100 hover:border-indigo-300 transition-all text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-600">Status: {relevantMatch.status}</span>
                <i className="fas fa-chevron-right text-indigo-300"></i>
              </div>
              <p className="text-xs text-indigo-900">Click to open the chat window and verify ownership.</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetails;
