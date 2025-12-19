
import React from 'react';
import { Icon } from './Icon';
import { UIElement } from '../types';

interface LatentMenuProps {
  element: UIElement;
  onAction: (action: string) => void;
  onDelete: () => void;
}

export const LatentMenu: React.FC<LatentMenuProps> = ({ element, onAction, onDelete }) => {
  return (
    <div 
      className="absolute flex flex-col items-center gap-2 animate-in zoom-in-90 duration-300"
      style={{
        left: (element.position?.x ?? 0) + 10,
        top: (element.position?.y ?? 0) - 60,
        zIndex: 1000
      }}
    >
      <div className="flex bg-black/90 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl items-center gap-1">
        <button onClick={() => onAction('refine')} className="p-3 hover:bg-white/10 rounded-full text-indigo-400 transition-colors" title="AI Refine">
          <Icon name="sparkles" size={16} />
        </button>
        <button onClick={() => onAction('copy')} className="p-3 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
          <Icon name="plus" size={16} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button onClick={onDelete} className="p-3 hover:bg-red-500/20 rounded-full text-red-500 transition-colors">
          <Icon name="trash" size={16} />
        </button>
      </div>
      <div className="bg-indigo-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
        {element.name}
      </div>
    </div>
  );
};
