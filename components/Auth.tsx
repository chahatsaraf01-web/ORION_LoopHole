
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onAuth: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'login' | 'verify' | 'profile'>('login');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@nmims.in')) {
      setError('Please use your official @nmims.in email ID.');
      return;
    }
    setError('');
    setStep('verify');
    // Simulate OTP sent
    console.log('OTP Sent to', email);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '1234') { // Simulation code
      setStep('profile');
    } else {
      setError('Invalid OTP. Use 1234 for testing.');
    }
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      campus: 'Shirpur',
      isVerified: true
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <i className="fas fa-search-location text-5xl mb-4"></i>
          <h2 className="text-3xl font-bold">NMIMS Shirpur FoundIt</h2>
          <p className="text-indigo-100 mt-2">Exclusive portal for Shirpur Campus students.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center space-x-2">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">College Email ID</label>
                <input 
                  type="email"
                  required
                  placeholder="name@nmims.in"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                Continue with Email
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Access is strictly restricted to NMIMS Shirpur faculty and students.
              </p>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4 text-center">
              <p className="text-slate-600 mb-4">
                We've sent a 4-digit code to <span className="font-bold">{email}</span>.
              </p>
              <input 
                type="text"
                required
                maxLength={4}
                placeholder="0000"
                className="w-32 text-center text-2xl tracking-widest px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all">
                Verify OTP
              </button>
              <button 
                type="button"
                onClick={() => setStep('login')}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                Change Email Address
              </button>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Assigned Campus</p>
                <p className="text-sm font-bold text-indigo-600">NMIMS Shirpur Campus</p>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                Finish Setup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
