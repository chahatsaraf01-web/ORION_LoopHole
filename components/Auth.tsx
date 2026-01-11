
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthProps {
  onAuth: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'login' | 'verify' | 'profile'>('login');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [showCodePopup, setShowCodePopup] = useState(false);

  useEffect(() => {
    let timer: number;
    if (resendTimer > 0) {
      timer = window.setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail.endsWith('@nmims.in')) {
      setError('Access restricted. Please use your official @nmims.in email ID.');
      return;
    }

    setLoading(true);
    setError('');

    // Simulated Server-Side Dispatch
    setTimeout(() => {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      
      // LOG TO CONSOLE as backup
      console.log(`%c FoundIt Security %c Code for ${cleanEmail}: ${newOtp} `, 
        'background: #4f46e5; color: white; font-weight: bold; padding: 2px 5px; border-radius: 3px;', 
        'background: #f1f5f9; color: #4f46e5; font-weight: bold; padding: 2px 5px; border-radius: 3px;');
      
      setStep('verify');
      setLoading(false);
      setResendTimer(30);
      setShowCodePopup(true); // Trigger the popup
    }, 1200);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      if (otp === generatedOtp) {
        setStep('profile');
        setError('');
        setShowCodePopup(false);
      } else {
        setError('Invalid verification code. Please check the code provided.');
      }
      setLoading(false);
    }, 800);
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      campus: 'Shirpur',
      isVerified: true
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full"></div>

      {/* Simulated Email Code Popup */}
      {showCodePopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in slide-in-from-top-full duration-500">
          <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden ring-4 ring-indigo-500/10">
            <div className="bg-indigo-600 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="fas fa-envelope text-white text-xs"></i>
                <span className="text-[10px] font-black text-white uppercase tracking-wider">New Email: Security Service</span>
              </div>
              <button onClick={() => setShowCodePopup(false)} className="text-white/60 hover:text-white transition-colors">
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <div className="p-4 flex items-start space-x-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                <i className="fas fa-key"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Verification Code Received</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your FoundIt portal access code is: <br/>
                  <span className="text-lg font-black text-indigo-600 tracking-widest">{generatedOtp}</span>
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-2 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Sent to {email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-700">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 text-white text-center relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]"></div>
          <i className="fas fa-fingerprint text-6xl mb-4 drop-shadow-lg animate-pulse"></i>
          <h2 className="text-3xl font-black tracking-tight uppercase">FoundIt</h2>
          <p className="text-indigo-100/80 mt-2 text-sm font-medium">NMIMS Shirpur Secure Gateway</p>
        </div>

        <div className="p-10 bg-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl flex items-center space-x-3 border border-red-100 animate-in shake duration-300">
              <i className="fas fa-exclamation-triangle text-base"></i>
              <span>{error}</span>
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Credentials</label>
                <div className="relative">
                  <i className="fas fa-at absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="email"
                    required
                    disabled={loading}
                    placeholder="student.name@nmims.in"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {loading ? (
                  <i className="fas fa-circle-notch fa-spin text-lg"></i>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authorized NMIMS Portal</p>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 animate-bounce">
                  <i className="fas fa-paper-plane text-xl"></i>
                </div>
                <h3 className="text-xl font-black text-slate-800">Verify Your Identity</h3>
                <p className="text-slate-500 text-sm font-medium">
                  Check the popup notification for your code sent to:<br/>
                  <span className="font-black text-indigo-600">{email}</span>
                </p>
                <div className="flex justify-center mt-6">
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="••••••"
                    className="w-full text-center text-3xl tracking-[0.5em] font-black py-5 rounded-3xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-200"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center"
                >
                  {loading ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : 'Verify & Continue'}
                </button>
                
                <div className="flex flex-col items-center space-y-3">
                  <button 
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleSendOTP}
                    className={`text-xs font-black uppercase tracking-widest transition-colors ${resendTimer > 0 ? 'text-slate-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                  >
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </button>
                  <button 
                    type="button"
                    disabled={loading}
                    onClick={() => { setStep('login'); setOtp(''); setShowCodePopup(false); }}
                    className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600"
                  >
                    Change Email Address
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleCompleteProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                <div className="relative">
                  <i className="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="bg-indigo-50 p-5 rounded-[1.5rem] border border-indigo-100 flex items-center space-x-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Auto-Assigned Node</p>
                  <p className="text-sm font-black text-indigo-900">NMIMS Shirpur Campus</p>
                </div>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-200">
                Complete Enrollment
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Footer Security Badge */}
      <div className="absolute bottom-8 flex items-center space-x-2 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
        <i className="fas fa-shield-check"></i>
        <span>Secure Session Dispatch</span>
      </div>
    </div>
  );
};

export default Auth;
