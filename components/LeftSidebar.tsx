
import React, { useState } from 'react';
import { Icon } from './Icon';
import { UIElement, LibraryComponent } from '../types';

interface LeftSidebarProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
  elements: UIElement[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  libraryComponents: LibraryComponent[];
  customComponents: LibraryComponent[];
  onInsert: (type: string, name: string, template?: UIElement) => void;
  onCreateCustom: (prompt: string) => void;
  onDeleteCustom: (name: string) => void;
  isGenerating: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  elements, selectedId, setSelectedId, libraryComponents, customComponents, onInsert, onCreateCustom, onDeleteCustom, isGenerating
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (customPrompt.trim()) {
      onCreateCustom(customPrompt);
      setCustomPrompt('');
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-8 space-y-12">
        <section>
          <h3 className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.3em] mb-8 flex justify-between items-center px-2">
            Layers <Icon name="layers" size={12} className="opacity-30" />
          </h3>
          <div className="space-y-3">
            <div 
              onClick={() => setSelectedId('page-background')} 
              className={`flex items-center gap-4 px-6 py-4 rounded-3xl cursor-pointer text-xs font-black transition-all duration-300 ${selectedId === 'page-background' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-zinc-500'}`}
            >
              <Icon name="layout" size={16} /> Environment
            </div>
            {elements.map(el => (
              <div 
                key={el.id} 
                onClick={() => setSelectedId(el.id)} 
                className={`flex items-center gap-4 px-6 py-4 rounded-3xl cursor-pointer text-xs font-black transition-all duration-300 ${selectedId === el.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-white/5 text-zinc-500'}`}
              >
                <Icon name={el.type === 'img' ? 'image' : 'layers'} size={16} /> {el.name}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.3em]">
              Library
            </h3>
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
            >
              <Icon name="sparkles" size={14} />
            </button>
          </div>

          {isCreating && (
            <div className="mb-8 p-6 bg-indigo-600/5 border border-indigo-600/20 rounded-[32px] space-y-4 animate-in slide-in-from-top duration-300">
               <textarea 
                placeholder="What should this component be? (e.g. 'Neon glass card with pricing')" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] focus:border-indigo-600 outline-none h-24 font-medium"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleCreate}
                  disabled={isGenerating || !customPrompt.trim()}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {isGenerating ? 'Forging...' : 'Forge'}
                </button>
                <button onClick={() => setIsCreating(false)} className="px-4 py-3 bg-white/5 text-zinc-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {libraryComponents.map(c => (
              <button 
                key={c.type} 
                onClick={() => onInsert(c.type, c.name)} 
                className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/5 rounded-[40px] hover:bg-indigo-600/10 hover:border-indigo-600/30 transition-all group"
              >
                <div className="mb-4 p-4 bg-white/5 rounded-2xl group-hover:bg-indigo-600 transition-all duration-500 group-hover:scale-110">
                  <Icon name={c.icon} size={24} className="text-zinc-500 group-hover:text-white" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight">{c.name}</span>
              </button>
            ))}
            
            {customComponents.map(c => (
              <div key={c.name} className="relative group">
                <button 
                  onClick={() => onInsert(c.type, c.name, c.template)} 
                  className="w-full flex flex-col items-center justify-center p-6 bg-indigo-600/5 border border-indigo-600/20 rounded-[40px] hover:bg-indigo-600/20 hover:border-indigo-600/40 transition-all group"
                >
                  <div className="mb-4 p-4 bg-white/5 rounded-2xl group-hover:bg-indigo-600 transition-all duration-500 group-hover:scale-110">
                    <Icon name="sparkles" size={24} className="text-indigo-400 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-indigo-200 group-hover:text-white">{c.name}</span>
                </button>
                <button 
                  onClick={() => onDeleteCustom(c.name)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                >
                  <Icon name="plus" size={12} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
