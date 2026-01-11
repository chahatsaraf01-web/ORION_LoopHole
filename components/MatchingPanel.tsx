
import React, { useState, useMemo } from 'react';
import { Match, Report, User } from '../types';
import { validateAnswer } from '../geminiService';

interface MatchingPanelProps {
  matchId: string;
  matches: Match[];
  reports: Report[];
  currentUser: User;
  onVerified: () => void;
  onFail: (matchId: string) => void;
  onClose: () => void;
}

const MatchingPanel: React.FC<MatchingPanelProps> = ({ matchId, matches, reports, currentUser, onVerified, onFail, onClose }) => {
  const match = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId]);
  const lostReport = useMemo(() => reports.find(r => r?.id === match?.lostReportId), [reports, match]);
  const foundReport = useMemo(() => reports.find(r => r?.id === match?.foundReportId), [reports, match]);
  
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(match?.attempts || 0);

  const maxAttempts = 2;

  if (!match || !lostReport || !foundReport) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    setError('');
    
    const isCorrect = await validateAnswer(answer, foundReport.verificationAnswer || '');
    
    if (isCorrect) {
      onVerified();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts < maxAttempts) {
        setError("That doesn't seem to match. Please try describing another unique detail.");
      } else {
        setError("Verification failed. We'll keep monitoring for other matches.");
        setTimeout(() => onFail(matchId), 2000);
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Ownership Check</h3>
          <p className="text-xs text-slate-400 mt-1">Answer the following to unlock chat.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
          <i className="fas fa-times text-slate-400"></i>
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
          <p className="text-xs text-indigo-700 leading-relaxed font-medium">
            <i className="fas fa-shield-alt mr-2"></i>
            Verified owners can communicate directly with finders.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Item Name</p>
          <h4 className="font-bold text-slate-800">{foundReport.itemName}</h4>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            {foundReport.verificationQuestion || "Describe a unique detail about this item."}
          </label>

          <textarea 
            required
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            placeholder="Type your answer (1-3 words or a short phrase)..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={loading || attempts >= maxAttempts}
          />

          {error && (
            <div className={`p-4 rounded-xl text-xs font-medium flex items-start space-x-3 bg-red-50 text-red-600`}>
              <i className="fas fa-exclamation-circle mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !answer.trim() || attempts >= maxAttempts}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
              loading || attempts >= maxAttempts ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <span>Submit Verification</span>}
          </button>
        </form>
      </div>
      
      <div className="pt-6 border-t mt-6 flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Attempt {attempts}/{maxAttempts}</span>
        <span className="text-[10px] font-bold text-indigo-400 uppercase">Secure Campus Protocol</span>
      </div>
    </div>
  );
};

export default MatchingPanel;
