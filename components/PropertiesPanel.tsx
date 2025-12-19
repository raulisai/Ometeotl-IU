
import React, { ReactNode } from 'react';
import { Icon } from './Icon';
import { UIElement, UIStyle } from '../types';

interface PropertiesPanelProps {
  selectedId: string | null;
  selectedElement: UIElement | undefined;
  isEnvSelected: boolean;
  isImageSelected: boolean;
  pageStyle: UIStyle;
  updateStyle: (id: string, style: UIStyle) => void;
  updateContent: (id: string, content: string) => void;
  onFileUpload: () => void;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="space-y-4 pb-8 border-b border-white/5 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <label className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] block px-1">{title}</label>
    <div className="space-y-4">{children}</div>
  </section>
);

interface ControlGroupProps {
  label: string;
  children: ReactNode;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{label}</span>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedId, selectedElement, isEnvSelected, isImageSelected, pageStyle, updateStyle, updateContent, onFileUpload
}) => {
  const currentStyle = isEnvSelected ? pageStyle : selectedElement?.style || {};
  
  const presets = [
    { name: 'Desktop HD', w: '1440px', h: '900px' },
    { name: 'Standard', w: '1280px', h: '800px' },
    { name: 'Tablet', w: '768px', h: '1024px' },
    { name: 'Mobile', w: '375px', h: '812px' }
  ];

  const patterns = [
    { name: 'None', css: 'none', size: 'auto' },
    { name: 'Dots', css: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', size: '20px 20px' },
    { name: 'Grid', css: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', size: '20px 20px' },
    { name: 'Waves', css: 'radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.03) 21%, rgba(255,255,255,0.03) 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, rgba(255,255,255,0.03) 21%, rgba(255,255,255,0.03) 34%, transparent 35%, transparent)', size: '40px 40px' }
  ];

  const gradients = [
    { name: 'Indigo Night', grad: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)' },
    { name: 'Sunset', grad: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
    { name: 'Ocean', grad: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)' },
    { name: 'None', grad: 'none' }
  ];

  const renderBackgroundSuite = () => (
    <>
      <ControlGroup label="Solid Colors">
        <div className="grid grid-cols-5 gap-2 w-full">
          {['transparent', '#ffffff', '#000000', '#4f46e5', '#ef4444'].map(c => (
            <button 
              key={c} 
              onClick={() => updateStyle(selectedId!, { backgroundColor: c, backgroundGradient: 'none', backgroundImage: 'none' })} 
              className={`w-full aspect-square rounded-lg border-2 transition-all ${currentStyle.backgroundColor === c ? 'border-indigo-500 shadow-lg' : 'border-white/5'}`} 
              style={{ backgroundColor: c === 'transparent' ? 'transparent' : c }}
            />
          ))}
        </div>
      </ControlGroup>

      <ControlGroup label="Designer Gradients">
        <div className="grid grid-cols-2 gap-2 w-full">
          {gradients.map(g => (
            <button 
              key={g.name} 
              onClick={() => updateStyle(selectedId!, { backgroundGradient: g.grad, backgroundImage: 'none' })}
              className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${currentStyle.backgroundGradient === g.grad ? 'border-indigo-500' : 'border-white/5'}`}
              style={{ background: g.grad === 'none' ? 'rgba(255,255,255,0.05)' : g.grad }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup label="Visual Texture">
        <div className="grid grid-cols-2 gap-2 w-full">
          {patterns.map(p => (
            <button 
              key={p.name} 
              onClick={() => updateStyle(selectedId!, { backgroundImage: p.css, backgroundSize: p.size, backgroundRepeat: 'repeat', backgroundGradient: 'none' } as any)}
              className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${currentStyle.backgroundImage === p.css ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/5 border-white/5'}`}
            >
              <div className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundImage: p.css, backgroundSize: p.size === 'auto' ? 'cover' : '8px 8px' }} />
              <span className="text-[9px] font-bold text-zinc-500">{p.name}</span>
            </button>
          ))}
        </div>
      </ControlGroup>
    </>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-24">
      {isEnvSelected ? (
        <>
          <Section title="Canvas Dimensions">
            <div className="grid grid-cols-2 gap-3">
              {presets.map(p => (
                <button 
                  key={p.name} 
                  onClick={() => updateStyle('page-background', { width: p.w, height: p.h })}
                  className={`p-3 border rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${currentStyle.width === p.w ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Environment Style">
            {renderBackgroundSuite()}
            <button 
              onClick={onFileUpload} 
              className="w-full py-4 bg-indigo-600/10 border border-indigo-600/30 rounded-3xl text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <Icon name="image" size={18} /> Upload Background
            </button>
          </Section>
        </>
      ) : (
        <>
          <Section title="Geometry">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Width</span>
                <input type="text" value={currentStyle.width || ''} onChange={e => updateStyle(selectedId!, { width: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="auto" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Height</span>
                <input type="text" value={currentStyle.height || ''} onChange={e => updateStyle(selectedId!, { height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="auto" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Corner Radius</span>
              <input type="text" value={currentStyle.borderRadius || ''} onChange={e => updateStyle(selectedId!, { borderRadius: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="16px" />
            </div>
          </Section>

          <Section title="Style & Color">
            {renderBackgroundSuite()}
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Opacity</span>
                   <input type="range" min="0" max="1" step="0.01" value={currentStyle.opacity ?? 1} onChange={e => updateStyle(selectedId!, { opacity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500" />
                </div>
                <div className="space-y-1">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Text Color</span>
                   <input type="color" value={currentStyle.color || '#ffffff'} onChange={e => updateStyle(selectedId!, { color: e.target.value })} className="w-full h-8 bg-white/5 border border-white/10 rounded-lg cursor-pointer" />
                </div>
            </div>
          </Section>

          {isImageSelected ? (
             <Section title="Image Source">
                <button 
                  onClick={onFileUpload} 
                  className="w-full py-4 bg-indigo-600/10 border border-indigo-600/30 rounded-3xl text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Icon name="image" size={18} /> Replace Image from PC
                </button>
                <div className="space-y-1 pt-2">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">Remote URL</span>
                  <input type="text" value={selectedElement?.content || ''} onChange={e => updateContent(selectedId!, e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="https://..." />
                </div>
             </Section>
          ) : (
            <Section title="Content">
               <textarea 
                value={selectedElement?.content || ''} 
                onChange={e => updateContent(selectedId!, e.target.value)} 
                className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-xs focus:border-indigo-600 outline-none h-32 resize-none" 
                placeholder="Text or HTML content..."
              />
            </Section>
          )}
        </>
      )}
    </div>
  );
};
