
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User, Report, ReportType, ItemStatus, Match, ChatMessage, Handover } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Feed from './components/Feed';
import ReportForm from './components/ReportForm';
import ItemDetails from './components/ItemDetails';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MatchSelection from './components/MatchSelection';
import { scoreSimilarity, generateVerificationQuestion, validateAnswer } from './geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feed' | 'lost' | 'found' | 'messages'>('feed');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{id: string, title: string, body: string, reportId: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [suggestedMatches, setSuggestedMatches] = useState<{match: Match, report: Report}[]>([]);
  const [lastSubmittedType, setLastSubmittedType] = useState<ReportType | null>(null);

  // PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const lastNotificationRef = useRef<{time: number, count: number}>({ time: 0, count: 0 });

  // Persistence & Initial Setup
  useEffect(() => {
    const savedUser = localStorage.getItem('foundit_user');
    const savedReports = localStorage.getItem('foundit_reports');
    const savedMatches = localStorage.getItem('foundit_matches');
    const savedChats = localStorage.getItem('foundit_chats');
    const savedHandovers = localStorage.getItem('foundit_handovers');

    if (savedUser && savedUser !== 'null') {
      try { setUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('foundit_user'); }
    }
    if (savedReports) setReports(JSON.parse(savedReports));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedChats) setChats(JSON.parse(savedChats));
    if (savedHandovers) setHandovers(JSON.parse(savedHandovers));

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // PWA Check
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isRunningStandalone);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Force prompt for iOS if not standalone (manual check)
    if (ios && !isRunningStandalone) {
      const lastDismissed = localStorage.getItem('pwa_banner_dismissed');
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 3600000) { // 1 hour cooldown
        setShowInstallBanner(true);
      }
    }

    // PWA Install Handling (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert('To install on iOS: \n1. Tap the Share button at the bottom of Safari.\n2. Scroll down and tap "Add to Home Screen".');
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    // Persist dismissal for 1 hour so we re-prompt on next app open after some time
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };

  useEffect(() => {
    if (user) localStorage.setItem('foundit_user', JSON.stringify(user));
    else localStorage.removeItem('foundit_user');
    localStorage.setItem('foundit_reports', JSON.stringify(reports));
    localStorage.setItem('foundit_matches', JSON.stringify(matches));
    localStorage.setItem('foundit_chats', JSON.stringify(chats));
    localStorage.setItem('foundit_handovers', JSON.stringify(handovers));
  }, [user, reports, matches, chats, handovers]);

  const addToast = useCallback((title: string, body: string, reportId: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, body, reportId }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 8000);
  }, []);

  const sendNotification = useCallback((title: string, body: string, reportId: string = '', isGlobal: boolean = false) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/812/812328.png' });
    }
    addToast(title, body, reportId);
  }, [addToast]);

  const handleToastClick = (reportId: string) => {
    setHighlightedReportId(reportId);
    setActiveTab('feed');
    setSelectedReportId(reportId);
    setToasts(prev => prev.filter(t => t.reportId !== reportId));
    setTimeout(() => setHighlightedReportId(null), 5000);
  };

  const addSystemMessage = useCallback((matchId: string, text: string) => {
    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      matchId,
      senderId: 'SYSTEM',
      text,
      timestamp: Date.now()
    };
    setChats(prev => [...prev, msg]);
  }, []);

  const triggerMatchingEngine = async (newReport: Report, currentReports: Report[]) => {
    const oppositeType = newReport.type === ReportType.LOST ? ReportType.FOUND : ReportType.LOST;
    const targets = currentReports.filter(r => r.type === oppositeType && r.status === ItemStatus.OPEN);
    const suggestions: {match: Match, report: Report}[] = [];

    for (const target of targets) {
      const score = await scoreSimilarity(newReport, target);
      if (score >= 60) {
        const existing = matches.find(m => 
          (m.lostReportId === newReport.id && m.foundReportId === target.id) ||
          (m.lostReportId === target.id && m.foundReportId === newReport.id)
        );
        if (!existing) {
          const matchObj: Match = {
            id: Math.random().toString(36).substr(2, 9),
            lostReportId: newReport.type === ReportType.LOST ? newReport.id : target.id,
            foundReportId: newReport.type === ReportType.FOUND ? newReport.id : target.id,
            confidence: score,
            status: 'PENDING',
            attempts: 0
          };
          setMatches(prev => [...prev, matchObj]);
          suggestions.push({ match: matchObj, report: target });
        }
      }
    }
    return suggestions;
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedReportId(null);
    setSelectedMatchId(null);
    localStorage.removeItem('foundit_user');
  };

  const handleAddReport = async (data: Partial<Report>) => {
    if (!user) return;
    setLoading(true);
    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: data.type as ReportType,
      category: data.category || 'Other',
      itemName: data.itemName || '',
      description: data.description || '',
      location: data.location || '',
      dateTime: data.dateTime || new Date().toISOString(),
      imageUrl: data.imageUrl,
      isSensitive: data.isSensitive || false,
      status: ItemStatus.OPEN,
      createdAt: Date.now(),
      verificationQuestion: data.verificationQuestion || '',
      verificationAnswer: data.verificationAnswer || '',
    };

    if (newReport.type === ReportType.FOUND && !newReport.verificationAnswer) {
      const vData = await generateVerificationQuestion(newReport);
      newReport.verificationQuestion = vData.question;
      newReport.verificationAnswer = vData.answer;
    }

    setReports(prev => [newReport, ...prev]);

    const now = Date.now();
    if (now - lastNotificationRef.current.time < 5000) {
      lastNotificationRef.current.count++;
      if (lastNotificationRef.current.count === 1) {
        sendNotification("Multiple Reports Submitted", "New activity on Shirpur Campus.", '', true);
      }
    } else {
      lastNotificationRef.current.time = now;
      lastNotificationRef.current.count = 0;
      sendNotification(`${newReport.type}: ${newReport.itemName}`, `New report near ${newReport.location}.`, newReport.id, true);
    }
    
    const suggestions = await triggerMatchingEngine(newReport, reports);
    setLoading(false);
    
    if (suggestions.length > 0) {
      setLastSubmittedType(newReport.type);
      setSuggestedMatches(suggestions);
    } else {
      setActiveTab('feed');
    }
  };

  const initiateChat = (reportId: string) => {
    const targetReport = reports.find(r => r.id === reportId);
    if (!targetReport || !user) return;

    let existingMatch = matches.find(m => 
      (m.lostReportId === targetReport.id && reports.find(r => r.id === m.foundReportId)?.userId === user.id) ||
      (m.foundReportId === targetReport.id && reports.find(r => r.id === m.lostReportId)?.userId === user.id)
    );

    let matchId = '';
    if (existingMatch) {
      matchId = existingMatch.id;
    } else {
      const isUserOwner = targetReport.type === ReportType.FOUND;
      const newMatch: Match = {
        id: Math.random().toString(36).substr(2, 9),
        lostReportId: isUserOwner ? 'PENDING_OWNER_REPORT' : targetReport.id,
        foundReportId: isUserOwner ? targetReport.id : 'PENDING_FINDER_REPORT',
        confidence: 100,
        status: 'PENDING',
        attempts: 0
      };
      setMatches(prev => [...prev, newMatch]);
      matchId = newMatch.id;
      
      addSystemMessage(matchId, "Chat initiated. This conversation is currently in 'Verification Pending' mode.");
      addSystemMessage(matchId, "Owner must provide the correct verification answer to unlock chat.");
      
      const recipientId = targetReport.userId;
      if (recipientId !== user.id) {
        sendNotification("New Interaction", "A chat has been started regarding an item you reported on Shirpur Campus.", '', false);
      }
    }

    setSelectedMatchId(matchId);
    setSelectedReportId(null);
    setActiveTab('messages');
  };

  const handleVerifyInChat = async (matchId: string, answer: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return false;
    const foundReport = reports.find(r => r.id === match.foundReportId);
    if (!foundReport) return false;

    const isCorrect = await validateAnswer(answer, foundReport.verificationAnswer || '');
    
    if (isCorrect) {
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'VERIFIED' } : m));
      addSystemMessage(matchId, "Verification successful. You may now chat freely.");
      return true;
    } else {
      const newAttempts = match.attempts + 1;
      if (newAttempts >= 2) {
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'REJECTED', attempts: newAttempts } : m));
        setSelectedMatchId(null);
        setActiveTab('feed');
      } else {
        setMatches(prev => prev.map(m => m.id === matchId ? { ...m, attempts: newAttempts } : m));
      }
      return false;
    }
  };

  const handleConfirmHandover = (type: 'OWNER' | 'FINDER', providedCode: string) => {
    if (!selectedMatchId) return;
    setHandovers(prev => prev.map(h => {
      if (h.matchId === selectedMatchId) {
        if (providedCode !== h.code) return h;
        const u = { ...h };
        if (type === 'OWNER') u.isConfirmedByOwner = true;
        if (type === 'FINDER') u.isConfirmedByFinder = true;
        if (u.isConfirmedByOwner) {
          const m = matches.find(mm => mm.id === selectedMatchId);
          if (m) {
            setReports(rs => rs.map(r => (r.id === m.lostReportId || r.id === m.foundReportId) ? { ...r, status: ItemStatus.RETURNED } : r));
            addSystemMessage(selectedMatchId, "Item successfully handed over. This chat is now closed.");
          }
        }
        return u;
      }
      return h;
    }));
  };

  const activeMatches = useMemo(() => {
    if (!user) return [];
    return matches.filter(m => {
      const lost = reports.find(r => r.id === m.lostReportId);
      const found = reports.find(r => r.id === m.foundReportId);
      const isInvolved = lost?.userId === user.id || found?.userId === user.id || m.lostReportId === 'PENDING_OWNER_REPORT' || m.foundReportId === 'PENDING_FINDER_REPORT';
      return isInvolved && m.status !== 'REJECTED';
    }).sort((a, b) => {
       const aLast = chats.filter(c => c.matchId === a.id).pop()?.timestamp || 0;
       const bLast = chats.filter(c => c.matchId === b.id).pop()?.timestamp || 0;
       return bLast - aLast;
    });
  }, [matches, reports, user, chats]);

  if (!user) return <Auth onAuth={setUser} />;

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      {/* Forced Install App Banner */}
      {showInstallBanner && !isStandalone && (
        <div className="fixed top-0 left-0 right-0 z-[300] bg-indigo-600 shadow-2xl p-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-xl shadow-sm">
                <img src="https://cdn-icons-png.flaticon.com/512/812/812328.png" className="w-12 h-12 rounded-lg" alt="App Icon" />
              </div>
              <div>
                <p className="text-white font-bold text-base">Install FoundIt NMIMS</p>
                <p className="text-indigo-100 text-xs">Install this app for faster access and campus alerts.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={dismissInstallBanner} 
                className="px-4 py-2 text-white text-xs font-bold uppercase tracking-wider opacity-80 hover:opacity-100"
              >
                Not now
              </button>
              <button 
                onClick={handleInstallClick} 
                className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg uppercase tracking-tight hover:bg-slate-50 transition-all active:scale-95"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} onClick={() => handleToastClick(toast.reportId)} className="bg-white border-l-4 border-indigo-600 shadow-2xl p-4 rounded-xl pointer-events-auto cursor-pointer border border-slate-100 animate-in slide-in-from-right duration-300">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><i className="fas fa-bell"></i></div>
              <div><h4 className="font-bold text-sm text-slate-800">{toast.title}</h4><p className="text-xs text-slate-500 mt-1 line-clamp-2">{toast.body}</p></div>
            </div>
          </div>
        ))}
      </div>

      {suggestedMatches.length > 0 && (
        <MatchSelection 
          suggestions={suggestedMatches} 
          newReportType={lastSubmittedType || ReportType.LOST} 
          onClaim={(mId) => { setSelectedMatchId(mId); setSuggestedMatches([]); setActiveTab('messages'); }}
          onDismiss={() => { setSuggestedMatches([]); setActiveTab('feed'); }}
        />
      )}

      <Header user={user} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} setUser={setUser} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          {activeTab === 'dashboard' && (
            <Dashboard 
              reports={reports.filter(r => r.userId === user.id)}
              matches={activeMatches}
              onSelectReport={setSelectedReportId}
              onSelectMatch={(mId) => { setSelectedMatchId(mId); setActiveTab('messages'); }}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'feed' && <Feed reports={reports} onSelectReport={setSelectedReportId} highlightId={highlightedReportId} />}
          {activeTab === 'lost' && <ReportForm type={ReportType.LOST} onSubmit={handleAddReport} loading={loading} />}
          {activeTab === 'found' && <ReportForm type={ReportType.FOUND} onSubmit={handleAddReport} loading={loading} />}
          {activeTab === 'messages' && (
            <ChatWindow 
              matchId={selectedMatchId}
              match={matches.find(m => m.id === selectedMatchId) || null}
              reports={reports}
              chats={chats}
              user={user}
              onSendMessage={(text) => {
                if (!selectedMatchId) return;
                const msg: ChatMessage = { id: Date.now().toString(), matchId: selectedMatchId, senderId: user.id, text, timestamp: Date.now() };
                setChats(prev => [...prev, msg]);
              }}
              onVerifyInChat={handleVerifyInChat}
              onInitiateHandover={() => {
                if (!selectedMatchId) return;
                const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                setHandovers(prev => [...prev, { matchId: selectedMatchId, code, isConfirmedByOwner: false, isConfirmedByFinder: false }]);
                addSystemMessage(selectedMatchId, `Handover initiated. Finder code for Owner: ${code}`);
              }}
              handover={handovers.find(h => h.matchId === selectedMatchId) || null}
              onConfirmHandover={handleConfirmHandover}
            />
          )}
        </main>

        {(selectedReportId || (selectedMatchId && activeTab !== 'messages')) && (
          <aside className="hidden lg:block w-96 border-l bg-white overflow-y-auto">
             {selectedReportId && (
              <ItemDetails 
                report={reports.find(r => r.id === selectedReportId) || null} 
                onClose={() => setSelectedReportId(null)}
                onCheckMatch={(mId) => { setSelectedMatchId(mId); setActiveTab('messages'); setSelectedReportId(null); }}
                onInitiateChat={initiateChat}
                matches={matches}
                currentUser={user}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
