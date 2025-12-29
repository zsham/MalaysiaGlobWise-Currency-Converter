
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onLoginClick }) => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      <header className="bg-slate-950/50 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
                <span className="text-white text-[10px] font-black tracking-tighter">RM</span>
              </div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight group-hover:text-white transition-colors">MalaysiaGlobWise</h1>
            </a>
            
            <nav className="flex gap-6 text-sm font-medium text-slate-400 items-center">
              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full border border-slate-700 shadow-sm" />
                    <span className="text-slate-200 hidden sm:inline">{user.name}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-xs text-rose-500 hover:text-rose-400 font-bold transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm mb-2">© {new Date().getFullYear()} MalaysiaGlobWise Financial Services.</p>
          <p className="text-slate-600 text-[11px] font-medium tracking-wide uppercase">Developer z@Sham Software Project Developer.</p>
        </div>
      </footer>
    </div>
  );
};
