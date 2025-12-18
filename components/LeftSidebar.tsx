
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
  elements, selectedId, setSelectedId, libraryComponents, onInsert 
}) => {
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
    </div>
  );
};
