
import React from 'react';
import { Platform } from '../types';

interface HeaderProps {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  projectName: string;
  onBuild: () => void;
}

export const Header: React.FC<HeaderProps> = ({ platform, setPlatform, projectName, onBuild }) => {
  return (
    <header className="h-28 flex items-center justify-between px-16 z-10">
      <div className="flex bg-zinc-900/80 backdrop-blur-3xl p-2 rounded-[24px] border border-white/5 shadow-2xl">
        <button 
          onClick={() => setPlatform(Platform.WEB)} 
          className={`px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${platform === Platform.WEB ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          Web
        </button>
        <button 
          onClick={() => setPlatform(Platform.MOBILE)} 
          className={`px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${platform === Platform.MOBILE ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
        >
          Mobile
        </button>
      </div>
      
      <div className="glass px-16 py-4 rounded-full border border-white/5 shadow-2xl text-base font-black tracking-tighter uppercase italic">
        {projectName}
      </div>
      
      <button 
        onClick={onBuild} 
        className="bg-white text-black px-12 py-4.5 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all"
      >
        Build Project
      </button>
    </header>
  );
};
