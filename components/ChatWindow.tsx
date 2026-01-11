
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, Handover, Match, Report, ItemStatus } from '../types';

interface ChatWindowProps {
  matchId: string | null;
  match: Match | null;
  reports: Report[];
  chats: ChatMessage[];
  user: User;
  onSendMessage: (text: string) => void;
  onVerifyInChat: (matchId: string, answer: string) => Promise<boolean>;
  onInitiateHandover: () => void;
  handover: Handover | null;
  onConfirmHandover: (type: 'OWNER' | 'FINDER', providedCode: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  matchId, 
  match, 
  reports, 
  chats, 
  user, 
  onSendMessage, 
  onVerifyInChat,
  onInitiateHandover, 
  handover, 
  onConfirmHandover 
}) => {
  const [messageText, setMessageText] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [handoverCodeInput, setHandoverCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifError, setVerifError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const foundReport = match ? reports.find(r => r.id === match.foundReportId) : null;
  const filteredChats = chats.filter(c => c.matchId === matchId);
  const isReturned = foundReport?.status === ItemStatus.RETURNED;
  const isFinder = foundReport?.userId === user.id;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredChats]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isReturned || match?.status !== 'VERIFIED') return;
    onSendMessage(messageText);
    setMessageText('');
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationAnswer.trim() || !matchId) return;
    setIsVerifying(true);
    setVerifError('');
    const success = await onVerifyInChat(matchId, verificationAnswer);
    if (!success) setVerifError("Incorrect answer. Please try again.");
    setIsVerifying(false);
    setVerificationAnswer('');
  };

  if (!matchId || !match) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
        <i className="fas fa-comments text-6xl opacity-10"></i>
        <p className="font-medium">Connect with owners or finders of items on campus.</p>
      </div>
    );
  }

  const isVerified = match.status === 'VERIFIED';
  const myConfirmation = isFinder ? handover?.isConfirmedByFinder : handover?.isConfirmedByOwner;

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isReturned ? 'bg-slate-100' : isVerified ? 'bg-emerald-100' : 'bg-amber-100'}`}>
            <i className={`fas ${isReturned ? 'fa-check-double text-emerald-500' : isVerified ? 'fa-comments text-emerald-600' : 'fa-lock text-amber-600'}`}></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{isReturned ? 'Case Resolved' : foundReport?.itemName || 'Matching Item'}</h3>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {isReturned ? 'Read-only Access' : isVerified ? 'Full Access Unlocked' : 'Verification Required'}
            </p>
          </div>
        </div>
        
        {isVerified && !isReturned && (
          handover ? (
            <div className="flex items-center space-x-2">
               {!isFinder && !myConfirmation && (
                 <form onSubmit={(e) => {e.preventDefault(); onConfirmHandover('OWNER', handoverCodeInput.toUpperCase()); setHandoverCodeInput(''); }} className="flex space-x-2">
                    <input className="w-24 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase" placeholder="CODE" value={handoverCodeInput} onChange={e => setHandoverCodeInput(e.target.value)} />
                    <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">Confirm</button>
                 </form>
               )}
               {myConfirmation && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">Confirmed</span>}
               {isFinder && (
                  <div className="flex items-center bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase mr-2">Code:</span>
                    <span className="text-sm font-mono font-bold text-indigo-700">{handover.code}</span>
                  </div>
               )}
            </div>
          ) : (
            <button onClick={onInitiateHandover} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold border border-amber-100">Initiate Handover</button>
          )
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {filteredChats.map((msg) => (
          msg.senderId === 'SYSTEM' ? (
            <div key={msg.id} className="flex justify-center my-4">
              <div className="bg-white px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-400 uppercase border border-slate-100 shadow-sm text-center max-w-[90%]">
                {msg.text}
              </div>
            </div>
          ) : (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                msg.senderId === user.id ? 'bg-indigo-600 text-white rounded-br-none shadow-md' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
                <p className={`text-[10px] mt-1 text-right ${msg.senderId === user.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        ))}
        
        {!isVerified && !isReturned && !isFinder && (
          <div className="max-w-md mx-auto py-4 animate-in zoom-in duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-amber-100 space-y-4">
              <div className="flex items-center space-x-2 text-amber-600">
                <i className="fas fa-shield-alt"></i>
                <h4 className="font-bold">Identity Verification</h4>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Verification Question</p>
                <p className="text-sm text-slate-800 font-medium italic leading-relaxed">
                  "{foundReport?.verificationQuestion || "Please describe a unique detail about the item."}"
                </p>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enter verification answer</label>
                  <input 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Provide answer..." 
                    value={verificationAnswer} 
                    onChange={e => setVerificationAnswer(e.target.value)} 
                    disabled={isVerifying} 
                  />
                </div>
                {verifError && <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg"><i className="fas fa-exclamation-circle mr-1.5"></i>{verifError}</p>}
                <button type="submit" disabled={isVerifying} className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-amber-600 transition-all">
                  {isVerifying ? 'Checking...' : 'Verify Ownership'}
                </button>
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">Attempts: {match.attempts} / 2</p>
              </form>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        {isReturned ? (
           <div className="text-center py-2"><p className="text-[10px] font-bold text-slate-400 uppercase">Chat closed - Item successfully returned</p></div>
        ) : !isVerified ? (
           <div className="text-center py-2"><p className="text-[10px] font-bold text-amber-500 uppercase flex items-center justify-center"><i className="fas fa-lock mr-2"></i> Messaging locked until verification</p></div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <input className="flex-1 px-4 py-3 bg-slate-100 border-none rounded-2xl outline-none text-sm" placeholder="Type a message..." value={messageText} onChange={e => setMessageText(e.target.value)} />
            <button className="w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 flex items-center justify-center transition-all"><i className="fas fa-paper-plane"></i></button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
