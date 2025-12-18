
import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { UIElement, AIAction, TaskStatus } from '../types';

interface AgentPanelProps {
  visible: boolean;
  onClose: () => void;
  selectedElement?: UIElement;
  history: AIAction[];
  status: TaskStatus;
  prompt: string;
  setPrompt: (v: string) => void;
  onDispatch: (p?: string) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({
  visible, onClose, selectedElement, history, status, prompt, setPrompt, onDispatch
}) => {
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, status]);

  const getStatusMessage = () => {
    switch (status) {
      case 'analyzing': return 'Contextualizing component...';
      case 'designing': return 'Architecting visual logic...';
      case 'applying': return 'Injecting styles into canvas...';
      default: return null;
    }
  };

  const quickPrompts = [
    { label: 'Modernize', icon: 'sparkles', p: 'Make this look hyper-modern and sleek' },
    { label: 'Glassmorphism', icon: 'filter', p: 'Apply a sophisticated glassmorphism style' },
    { label: 'Highlight', icon: 'maximize', p: 'Make this element stand out with more contrast' },
    { label: 'Dark Mode', icon: 'layout', p: 'Switch this component to a dark theme palette' },
  ];

  return (
    <aside className={`fixed top-8 right-8 bottom-8 w-[420px] flex flex-col glass rounded-[48px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] z-[60] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+64px)] opacity-0'}`}>
      {/* Header */}
      <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${status !== 'idle' ? 'bg-indigo-600 border-indigo-400 animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-indigo-600/10 border-indigo-600/20'}`}>
            <Icon name="sparkles" size={24} className={status !== 'idle' ? 'text-white' : 'text-indigo-400'} />
          </div>
          <div>
            <span className="font-black text-[12px] uppercase tracking-[0.3em] block leading-none">Visionary Agent</span>
            <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1.5 block tracking-widest">Powered by Gemini 3 Pro</span>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
          <Icon name="plus" size={18} className="rotate-45" />
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Active Task Indicator (DYNAMI COMPONENT) */}
        {status !== 'idle' && (
          <div className="px-8 pt-8 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-indigo-600 text-white rounded-[32px] p-6 shadow-2xl shadow-indigo-600/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon name="sparkles" size={60} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{status} mode active</span>
                </div>
                <h3 className="text-sm font-black italic uppercase tracking-wider mb-2">{getStatusMessage()}</h3>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-white rounded-full animate-progress" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Context Card */}
        <div className="px-8 pt-8">
          <div className="bg-indigo-600/5 border border-indigo-600/20 rounded-[32px] p-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Icon name={selectedElement?.type === 'img' ? 'image' : 'layers'} size={20} />
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Editing Context</p>
              <h4 className="text-xs font-bold text-white mt-0.5">{selectedElement?.name || 'Full Interface'}</h4>
            </div>
          </div>
        </div>

        {/* Action History */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {history.length === 0 && status === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-30 py-10">
              <Icon name="info" size={48} className="mb-6" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">Ready for instructions</p>
              <p className="text-[10px] mt-4 leading-relaxed font-medium">Describe changes specifically for the selected element or the entire page.</p>
            </div>
          )}

          {history.map((action) => (
            <div key={action.id} className={`flex flex-col ${action.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[28px] text-xs leading-relaxed ${
                action.type === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20' 
                  : 'bg-white/5 border border-white/5 text-zinc-300 rounded-bl-none'
              }`}>
                {action.message}
              </div>
              <span className="text-[8px] text-zinc-600 font-black uppercase mt-2 px-2 tracking-widest">
                {action.type === 'user' ? 'You' : 'Agent'} • {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {status !== 'idle' && (
            <div className="flex flex-col items-start">
              <div className="bg-white/5 border border-white/5 p-5 rounded-[28px] rounded-bl-none text-xs text-indigo-300 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="font-bold italic">Processing request...</span>
              </div>
            </div>
          )}
          <div ref={historyEndRef} />
        </div>

        {/* Quick Options */}
        {status === 'idle' && (
          <div className="px-8 pb-4">
             <div className="grid grid-cols-2 gap-3">
              {quickPrompts.map(q => (
                <button 
                  key={q.label}
                  onClick={() => onDispatch(q.p)}
                  className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-600/30 transition-all group"
                >
                  <Icon name={q.icon as any} size={14} className="text-zinc-500 group-hover:text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-8 pt-4">
          <div className="relative group">
            <textarea 
              placeholder="What should we evolve next?" 
              className="w-full bg-black/40 border border-white/10 rounded-[32px] p-8 pr-20 text-xs focus:border-indigo-600 outline-none h-32 resize-none font-medium transition-all shadow-inner placeholder:text-zinc-600" 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onDispatch(); } }}
              disabled={status !== 'idle'}
            />
            <button 
              onClick={() => onDispatch()}
              disabled={status !== 'idle' || !prompt.trim()}
              className="absolute bottom-5 right-5 w-12 h-12 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
            >
              <Icon name="play" size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          width: 50%;
          animation: progress 1.5s infinite linear;
        }
      `}</style>
    </aside>
  );
};
