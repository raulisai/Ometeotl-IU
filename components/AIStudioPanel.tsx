
import React, { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { UIElement, UIStyle } from '../types';
import { generateImageWithAI } from '../services/geminiService';

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
  updateStyle: (id: string, style: UIStyle) => void;
  updateContent: (id: string, content: string) => void;
  onFileUpload: () => void;
}

export const AIStudioPanel: React.FC<AIStudioPanelProps> = ({
  isImageSelected, selectedElement, selectedId, isGenerating, refinementPrompt, setRefinementPrompt, 
  aiImagePrompt, setAiImagePrompt, prompt, setPrompt, handleRefineImage, handleGenerate, updateStyle, updateContent, onFileUpload
}) => {
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  
  const filterValues = useMemo(() => {
    const filterStr = selectedElement?.style?.filter || '';
    return {
      brightness: filterStr.match(/brightness\((.*?)\)/)?.[1] || '1',
      contrast: filterStr.match(/contrast\((.*?)\)/)?.[1] || '1',
      saturate: filterStr.match(/saturate\((.*?)\)/)?.[1] || '1',
      hue: filterStr.match(/hue-rotate\((.*?)\)/)?.[1] || '0deg',
      blur: filterStr.match(/blur\((.*?)\)/)?.[1] || '0px',
      sepia: filterStr.match(/sepia\((.*?)\)/)?.[1] || '0',
    };
  }, [selectedElement?.style?.filter]);

  const applyManualFilter = (key: string, value: string) => {
    if (!selectedId) return;
    const newFilters = { ...filterValues, [key]: value };
    const filterStr = `brightness(${newFilters.brightness}) contrast(${newFilters.contrast}) saturate(${newFilters.saturate}) hue-rotate(${newFilters.hue}) blur(${newFilters.blur}) sepia(${newFilters.sepia})`;
    updateStyle(selectedId, { filter: filterStr });
  };

  const handleCreateImage = async () => {
    if (!aiImagePrompt.trim() || !selectedId) return;
    setLocalIsGenerating(true);
    try {
      const url = await generateImageWithAI(aiImagePrompt);
      updateContent(selectedId, url);
      setAiImagePrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setLocalIsGenerating(false);
    }
  };

  const presets = [
    { name: 'Noir', filter: 'grayscale(1) contrast(1.2) brightness(0.9)' },
    { name: 'Vibrant', filter: 'saturate(1.8) contrast(1.1)' },
    { name: 'Vintage', filter: 'sepia(0.6) contrast(0.9) brightness(1.1)' },
    { name: 'High Contrast', filter: 'contrast(1.6) brightness(1.1)' },
    { name: 'Deep Cold', filter: 'hue-rotate(180deg) saturate(1.4) contrast(1.1)' },
    { name: 'Dreamy', filter: 'blur(1.5px) brightness(1.1) saturate(1.2)' },
    { name: 'None', filter: 'none' }
  ];

  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 pb-20">
      {isImageSelected ? (
        <div className="space-y-12">
          {/* SECCIÓN 1: SOURCE (Upload & AI) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <Icon name="image" size={18} className="text-emerald-400" />
              <label className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.2em]">Image Asset Source</label>
            </div>
            
            <button 
              onClick={onFileUpload} 
              className="w-full py-5 bg-emerald-600/10 border border-emerald-600/30 rounded-3xl text-emerald-400 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <Icon name="plus" size={18} /> Upload From PC
            </button>

            <div className="relative group">
              <textarea 
                placeholder="Or generate new image with AI..." 
                className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-xs focus:border-indigo-600 outline-none h-24 resize-none transition-all" 
                value={aiImagePrompt} 
                onChange={e => setAiImagePrompt(e.target.value)} 
              />
              <button 
                onClick={handleCreateImage} 
                disabled={localIsGenerating || !aiImagePrompt.trim()} 
                className="absolute bottom-4 right-4 p-4 bg-indigo-600 rounded-2xl shadow-xl hover:scale-110 transition-all disabled:opacity-50"
              >
                {localIsGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="play" size={20} />}
              </button>
            </div>
          </section>

          {/* SECCIÓN 2: AJUSTES MANUALES */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <Icon name="filter" size={18} className="text-indigo-400" />
              <label className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.2em]">Manual Edits</label>
            </div>

            <div className="space-y-4 bg-white/[0.02] p-4 rounded-3xl border border-white/5">
              {[
                { label: 'Brightness', key: 'brightness', min: '0', max: '2', step: '0.05', unit: '' },
                { label: 'Contrast', key: 'contrast', min: '0', max: '2', step: '0.05', unit: '' },
                { label: 'Saturation', key: 'saturate', min: '0', max: '3', step: '0.1', unit: '' },
                { label: 'Hue', key: 'hue', min: '0', max: '360', step: '1', unit: 'deg' },
                { label: 'Blur', key: 'blur', min: '0', max: '15', step: '0.5', unit: 'px' },
                { label: 'Sepia', key: 'sepia', min: '0', max: '1', step: '0.1', unit: '' },
              ].map((adj) => (
                <div key={adj.key} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">{adj.label}</span>
                    <span className="text-[9px] text-indigo-400 font-mono">{(filterValues as any)[adj.key]}</span>
                  </div>
                  <input 
                    type="range" min={adj.min} max={adj.max} step={adj.step} 
                    value={(filterValues as any)[adj.key].replace(adj.unit, '')}
                    onChange={(e) => applyManualFilter(adj.key, e.target.value + adj.unit)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 3: PRESETS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <Icon name="layout" size={18} className="text-emerald-400" />
              <label className="text-[11px] text-emerald-400 font-black uppercase tracking-[0.2em]">Quick Presets</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button 
                  key={p.name}
                  onClick={() => updateStyle(selectedId!, { filter: p.filter })}
                  className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedElement?.style?.filter === p.filter ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </section>

          {/* SECCIÓN 4: IA REFINEMENT */}
          <section className="space-y-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 px-1">
              <Icon name="sparkles" size={18} className="text-indigo-400" />
              <label className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.2em]">AI Refinement</label>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => handleRefineImage("Remove background and keep subject sharp")} 
                className="w-full py-4 bg-indigo-600/10 border border-indigo-600/30 rounded-3xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <Icon name="maximize" size={18} /> Remove Background
              </button>
              <div className="relative">
                <textarea 
                  placeholder="Ask AI to change specific details..." 
                  className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-xs focus:border-indigo-600 outline-none h-40 resize-none transition-all" 
                  value={refinementPrompt} 
                  onChange={e => setRefinementPrompt(e.target.value)} 
                />
                <button 
                  onClick={() => handleRefineImage()} 
                  disabled={isGenerating || !refinementPrompt.trim()} 
                  className="absolute bottom-4 right-4 p-4 bg-indigo-600 rounded-2xl shadow-xl hover:scale-110 transition-all disabled:opacity-50"
                >
                  <Icon name="sparkles" size={20} />
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="space-y-8">
          <div className="flex items-center gap-3 px-1">
            <Icon name="sparkles" size={20} className="text-indigo-400" />
            <div className="flex flex-col">
               <label className="text-[12px] text-indigo-400 font-black uppercase tracking-[0.2em]">Component Refiner</label>
               <span className="text-[9px] text-zinc-600 font-bold uppercase mt-1 italic">Modifying: {selectedElement?.name || 'Selected Item'}</span>
            </div>
          </div>
          <div className="relative group">
            <textarea 
              placeholder={`Instruct how to evolve the ${selectedElement?.name || 'component'}...`} 
              className="w-full bg-black/40 border border-white/10 rounded-[40px] p-10 text-xs focus:border-indigo-600 outline-none h-64 resize-none shadow-inner transition-all font-medium"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <button 
              onClick={() => handleGenerate(undefined, selectedId!)}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-10 right-10 p-6 bg-indigo-600 rounded-[32px] shadow-2xl hover:translate-y-[-4px] transition-all disabled:opacity-50"
            >
              <Icon name="play" size={28} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
