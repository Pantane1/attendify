
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  role: UserRole;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none tracking-tight">Attendify</h1>
            <p className="text-[10px] text-indigo-600 font-bold tracking-[0.2em] uppercase">Biometric Hub</p>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <span className="hidden md:inline-block px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-bold text-indigo-600 border border-indigo-100 uppercase tracking-wider">
            {role === UserRole.LECTURER ? 'Lecturer Console' : 'Student Portal'}
          </span>
          <button 
            onClick={onLogout}
            className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <span>Logout</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
