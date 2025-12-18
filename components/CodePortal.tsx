
import React from 'react';
import { Icon } from './Icon';

interface CodePortalProps {
  code: string;
  onClose: () => void;
}

export const CodePortal: React.FC<CodePortalProps> = ({ code, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-16 bg-black/98 backdrop-blur-[150px] animate-in zoom-in-95 duration-700">
      <div className="bg-[#09090b] w-full max-w-7xl h-[85vh] rounded-[80px] border border-white/10 flex flex-col overflow-hidden shadow-[0_150px_400px_rgba(0,0,0,1)]">
        <div className="p-16 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-indigo-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-600/50">
              <Icon name="code" size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Exported Source</h2>
              <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-4">React 19 • Tailwind CSS • Production Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="p-8 hover:bg-white/10 rounded-full transition-all group">
            <Icon name="plus" size={56} className="rotate-45 text-zinc-600 group-hover:text-white transition-transform duration-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-20 bg-black/40 custom-scrollbar">
          <pre className="text-base font-mono text-indigo-200/50 whitespace-pre-wrap leading-relaxed selection:bg-indigo-600 selection:text-white">
            {code}
          </pre>
        </div>
        <div className="p-16 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
           <div className="flex gap-6">
              <div className="px-10 py-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-black uppercase tracking-widest">Type-Safe</div>
              <div className="px-10 py-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[11px] font-black uppercase tracking-widest">Hydrated</div>
           </div>
           <button 
            onClick={() => { navigator.clipboard.writeText(code); alert('Code teleported to clipboard!'); }} 
            className="px-28 py-8 bg-white text-black hover:bg-indigo-50 rounded-[40px] font-black uppercase text-sm tracking-[0.3em] shadow-2xl transition-all hover:translate-y-[-8px] active:scale-95"
           >
            Copy Source
           </button>
        </div>
      </div>
    </div>
  );
};
