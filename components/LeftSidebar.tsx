
import React from 'react';
import { Icon } from './Icon';
import { UIElement, LibraryComponent } from '../types';

interface LeftSidebarProps {
  visible: boolean;
  setVisible: (v: boolean) => void;
  elements: UIElement[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  libraryComponents: LibraryComponent[];
  onInsert: (type: string, name: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  visible, setVisible, elements, selectedId, setSelectedId, libraryComponents, onInsert 
}) => {
  return (
    <aside className={`fixed top-8 left-8 bottom-8 w-80 flex flex-col glass rounded-[48px] border border-white/10 shadow-2xl z-40 transition-all duration-700 ease-in-out transform ${visible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-full opacity-0 scale-95 pointer-events-none'}`}>
      <div className="p-10 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Icon name="sparkles" size={24} className="text-white" />
          </div>
          <span className="font-black text-sm uppercase tracking-[0.2em] italic">Studio</span>
        </div>
        <button onClick={() => setVisible(false)} className="text-zinc-500 hover:text-white transition-colors p-2">
          <Icon name="plus" size={16} className="rotate-45" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
        <section>
          <h3 className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.3em] mb-8 flex justify-between items-center px-2">
            Blueprint <Icon name="layers" size={12} className="opacity-30" />
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
          <h3 className="text-[11px] font-black uppercase text-zinc-600 tracking-[0.3em] mb-8 flex justify-between items-center px-2">
            Library <Icon name="grid" size={12} className="opacity-30" />
          </h3>
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
          </div>
        </section>
      </div>
    </aside>
  );
};
