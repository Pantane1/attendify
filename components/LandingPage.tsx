
import React from 'react';
import { UserRole } from '../types';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfe] relative overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="text-center mb-12 relative z-10">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl mb-8 transform hover:rotate-6 transition-transform duration-500">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
          Attendify
        </h1>
        <p className="text-indigo-600 font-bold tracking-[0.3em] uppercase text-sm mb-6">
          Biometric attendance made effortless
        </p>
        <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium leading-relaxed opacity-80">
          Seamless facial recognition check-ins, intelligent lecturer dashboards, and secure biometric verification for the modern campus.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        <button
          onClick={() => onSelectRole(UserRole.LECTURER)}
          className="group relative bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-600 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all text-left overflow-hidden active:scale-95"
        >
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Institutional Access</h3>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">Manage courses, monitor real-time logs, and access advanced attendance analytics for your classes.</p>
          <span className="inline-flex items-center px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold group-hover:bg-indigo-600 transition-colors">
            Lecturer Login
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"></path></svg>
          </span>
        </button>

        <button
          onClick={() => onSelectRole(UserRole.STUDENT)}
          className="group relative bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-emerald-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-all text-left overflow-hidden active:scale-95"
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Student Portal</h3>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">Fast-track your check-in with our high-speed biometric engine. Safe, touchless, and instantaneous.</p>
          <span className="inline-flex items-center px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold group-hover:bg-emerald-600 transition-colors">
            Verify & Enter
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"></path></svg>
          </span>
        </button>
      </div>

      <div className="mt-20 flex flex-col items-center gap-6 text-slate-400 opacity-60 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Trusted By Leading Research Institutions</p>
        <div className="flex items-center gap-12 grayscale">
          <img src="https://picsum.photos/seed/unilogo1/100/40" alt="Univ Logo 1" className="h-6" />
          <img src="https://picsum.photos/seed/unilogo2/100/40" alt="Univ Logo 2" className="h-6" />
          <img src="https://picsum.photos/seed/unilogo3/100/40" alt="Univ Logo 3" className="h-6" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
