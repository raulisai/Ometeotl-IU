
import React from 'react';
import { Icon } from './Icon';
import { UIElement } from '../types';

interface AIStudioPanelProps {
  isImageSelected: boolean;
  selectedElement?: UIElement;
  selectedId: string | null;
  isGenerating: boolean;
  refinementPrompt: string;
  setRefinementPrompt: (v: string) => void;
  aiImagePrompt: string;
  setAiImagePrompt: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  handleRefineImage: (instr?: string) => void;
  handleCreateAIImage: () => void;
  handleGenerate: (p?: string, id?: string) => void;
}

export const AIStudioPanel: React.FC<AIStudioPanelProps> = ({
  isImageSelected, selectedElement, selectedId, isGenerating, refinementPrompt, setRefinementPrompt, 
  aiImagePrompt, setAiImagePrompt, prompt, setPrompt, handleRefineImage, handleCreateAIImage, handleGenerate
}) => {
  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      {isImageSelected ? (
        <section className="space-y-10">
          <div className="flex items-center gap-3 px-2">
            <Icon name="image" size={20} className="text-indigo-400" />
            <label className="text-[12px] text-indigo-400 font-black uppercase tracking-[0.3em]">Image Manipulator</label>
          </div>

          <button 
            onClick={() => handleRefineImage("Identify the main subject and isolate it perfectly. Remove the background entirely for transparency extraction.")} 
            className="w-full py-6 bg-indigo-600/10 border border-indigo-600/30 rounded-[32px] text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-4 group shadow-2xl active:scale-95"
          >
            <Icon name="maximize" size={24} className="group-hover:scale-110 transition-transform" /> 
            Remove Background (PNG)
          </button>

          <div className="space-y-5">
            <span className="text-[11px] text-zinc-500 font-black uppercase tracking-widest px-2">Refine Specific Image</span>
            <div className="relative group">
              <textarea 
                placeholder="Describe changes for this image... (e.g. 'Turn into a 3D glass icon')" 
                className="w-full bg-black/60 border border-white/10 rounded-[36px] p-8 text-xs focus:border-indigo-600 outline-none h-48 resize-none font-medium transition-all shadow-inner" 
                value={refinementPrompt} 
                onChange={e => setRefinementPrompt(e.target.value)} 
              />
              <button 
                onClick={() => handleRefineImage()} 
                disabled={isGenerating || !refinementPrompt.trim()} 
                className="absolute bottom-6 right-6 p-5 bg-indigo-600 rounded-[28px] shadow-2xl hover:scale-110 transition-all disabled:opacity-50"
              >
                <Icon name="sparkles" size={24} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <Icon name="sparkles" size={20} className="text-indigo-400" />
            <div className="flex flex-col">
               <label className="text-[12px] text-indigo-400 font-black uppercase tracking-[0.3em]">Component Refiner</label>
               <span className="text-[9px] text-zinc-600 font-bold uppercase mt-1 italic">Modifying: {selectedElement?.name || 'Selected Item'}</span>
            </div>
          </div>
          <div className="relative group">
            <textarea 
              placeholder={`Instruct how to evolve the ${selectedElement?.name || 'component'}...`} 
              className="w-full bg-black/60 border border-white/10 rounded-[48px] p-10 text-xs focus:border-indigo-600 outline-none h-64 resize-none shadow-inner transition-all font-medium"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <button 
              onClick={() => handleGenerate(undefined, selectedId!)}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-10 right-10 p-6 bg-indigo-600 rounded-[32px] shadow-2xl hover:translate-y-[-4px] active:scale-90 transition-all disabled:opacity-50"
            >
              <Icon name="play" size={28} />
            </button>
          </div>
          
          <div className="space-y-4">
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest px-2">Quick Styles (Targeted)</span>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleGenerate("Make it ultra-modern and minimalist", selectedId!)} className="p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all">Minimal</button>
              <button onClick={() => handleGenerate("Apply a sophisticated glassmorphism effect", selectedId!)} className="p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all">Glass</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
