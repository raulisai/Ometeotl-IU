
import React from 'react';
import { Icon } from './Icon';
import { TaskStatus } from '../types';

interface PromptHubProps {
  prompt: string;
  setPrompt: (v: string) => void;
  status: TaskStatus;
  onDispatch: () => void;
}

export const PromptHub: React.FC<PromptHubProps> = ({ prompt, setPrompt, status, onDispatch }) => {
  const isIdle = status === 'idle';

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-[100]">
      <div className={`relative transition-all duration-700 ${!isIdle ? 'scale-[1.02]' : ''}`}>
        <div className="absolute inset-0 bg-indigo-600/20 blur-3xl opacity-50 -z-10 animate-pulse" />
        
        <div className="glass rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Status Bar */}
          {!isIdle && (
            <div className="bg-indigo-600 h-1 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/40 animate-[shimmer_2s_infinite]" />
            </div>
          )}
          
          <div className="p-2 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!isIdle ? 'bg-indigo-600' : 'bg-white/5'}`}>
              <Icon name="sparkles" size={24} className={!isIdle ? 'text-white animate-spin' : 'text-indigo-400'} />
            </div>
            
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onDispatch()}
              placeholder={isIdle ? "Escribe tu intención... (ej. 'Crea un dashboard financiero')" : "Entendiendo tu visión..."}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-zinc-600"
              disabled={!isIdle}
            />
            
            <button 
              onClick={onDispatch}
              disabled={!isIdle || !prompt.trim()}
              className={`p-4 rounded-full transition-all ${prompt.trim() ? 'bg-indigo-600 text-white shadow-xl' : 'text-zinc-700'}`}
            >
              <Icon name="play" size={24} />
            </button>
          </div>
        </div>

        {/* Intelligence Feedback */}
        <div className={`mt-4 flex justify-center gap-6 transition-all duration-1000 ${isIdle ? 'opacity-40' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-400">
            <div className={`w-1.5 h-1.5 rounded-full ${!isIdle ? 'bg-emerald-500 animate-ping' : 'bg-zinc-700'}`} />
            Context Aware
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-400">
             <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            User Memory Ready
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
