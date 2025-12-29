
import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validateGmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@gmail\.com$/);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!validateGmail(email)) {
      setError('Please enter a valid @gmail.com address');
      return;
    }

    setIsAuthenticating(true);

    // Mimic the "Real" Google Authentication handshake
    setTimeout(() => {
      const user: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
      };
      onLogin(user);
      setIsAuthenticating(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
      ></div>
      <div className="relative bg-slate-900 rounded-[40px] shadow-3xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-500 border border-slate-800">
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="text-white text-xs font-black tracking-tighter">RM</span>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h3 className="text-3xl font-black text-slate-100 mb-2 tracking-tight">Identity Suite</h3>
          <p className="text-slate-400 mb-8 font-medium leading-relaxed text-sm">
            Please provide your details to unlock institutional AI analysis.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isAuthenticating}
                className="w-full px-6 py-4 bg-slate-800/50 border-2 border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:bg-slate-800 outline-none transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Gmail Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                disabled={isAuthenticating}
                className={`w-full px-6 py-4 bg-slate-800/50 border-2 rounded-2xl text-slate-100 placeholder-slate-600 focus:bg-slate-800 outline-none transition-all font-medium ${error && !validateGmail(email) ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold px-1 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-4 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-600/20 transition-all active:scale-[0.97] disabled:bg-slate-800 disabled:text-slate-600"
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-slate-600 border-t-indigo-200 rounded-full animate-spin"></div>
                  <span className="tracking-wide">Verifying Account...</span>
                </div>
              ) : (
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="currentColor" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Sign in with Gmail
                </span>
              )}
            </button>
          </form>
        </div>
        <div className="bg-slate-950/50 p-8 border-t border-slate-800">
          <p className="text-center text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            Secured by GlobalWise Identity Protocol
          </p>
        </div>
      </div>
    </div>
  );
};
