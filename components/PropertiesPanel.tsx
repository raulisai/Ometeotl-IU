
import React from 'react';
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4 pb-8 border-b border-white/5 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <label className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] block px-1">{title}</label>
    <div className="space-y-4">{children}</div>
  </section>
);

const ControlGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
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
    { name: 'Pluses', css: 'linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)', size: '40px 40px' },
    { name: 'Waves', css: 'radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.03) 21%, rgba(255,255,255,0.03) 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, rgba(255,255,255,0.03) 21%, rgba(255,255,255,0.03) 34%, transparent 35%, transparent)', size: '40px 40px' },
    { name: 'Honeycomb', css: 'linear-gradient(30deg, rgba(255,255,255,0.02) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.02) 87.5%, rgba(255,255,255,0.02)), linear-gradient(150deg, rgba(255,255,255,0.02) 12%, transparent 12.5%, transparent 87%, rgba(255,255,255,0.02) 87.5%, rgba(255,255,255,0.02)), linear-gradient(60deg, rgba(255,255,255,0.04) 25%, transparent 25.5%, transparent 75%, rgba(255,255,255,0.04) 75.5%, rgba(255,255,255,0.04))', size: '40px 70px' }
  ];

  const gradients = [
    { name: 'Fintech', grad: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)' },
    { name: 'Sunset', grad: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
    { name: 'Creative', grad: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    { name: 'Deep Space', grad: 'radial-gradient(circle at 20% 30%, #2e1065 0%, #000000 70%)' },
    { name: 'Oceanic', grad: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)' },
    { name: 'Mesh Aurora', grad: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%), radial-gradient(at 0% 100%, hsla(190,49%,30%,1) 0, transparent 50%)' },
    { name: 'Royal', grad: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
    { name: 'Midnight', grad: 'linear-gradient(180deg, #111827 0%, #000000 100%)' },
    { name: 'None', grad: 'none' }
  ];

  const animations = [
    { name: 'None', val: 'none' },
    { name: 'Pulse', val: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
    { name: 'Bounce', val: 'bounce 1s infinite' },
    { name: 'Spin', val: 'spin 1s linear infinite' },
    { name: 'Float', val: 'float 3s ease-in-out infinite' },
    { name: 'Fade In', val: 'fadeIn 0.5s ease-out forwards' }
  ];

  const behaviors = [
    { label: 'Cover', size: 'cover', repeat: 'no-repeat', icon: 'maximize' },
    { label: 'Tile', size: 'auto', repeat: 'repeat', icon: 'grid' },
    { label: 'Contain', size: 'contain', repeat: 'no-repeat', icon: 'minimize' },
    { label: 'Fill', size: '100% 100%', repeat: 'no-repeat', icon: 'square' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-24">
      
      {/* -------------------- ENVIRONMENT MODE -------------------- */}
      {isEnvSelected && (
        <>
          <Section title="Canvas Dimensions">
            <div className="grid grid-cols-2 gap-3">
              {presets.map(p => (
                <button 
                  key={p.name} 
                  onClick={() => updateStyle('page-background', { width: p.w, height: p.h })}
                  className={`p-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStyle.width === p.w ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <input type="text" value={currentStyle.width || ''} onChange={e => updateStyle('page-background', { width: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="Width (e.g. 100%)" />
              <input type="text" value={currentStyle.height || ''} onChange={e => updateStyle('page-background', { height: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="Height (e.g. 100%)" />
            </div>
          </Section>

          <Section title="Environment Atmosphere">
            <ControlGroup label="Designer Gradients & Meshes">
              <div className="grid grid-cols-2 gap-2 w-full">
                {gradients.map(g => (
                  <button 
                    key={g.name} 
                    onClick={() => updateStyle('page-background', { backgroundGradient: g.grad, backgroundImage: 'none', backgroundColor: 'transparent' })}
                    className={`group relative w-full py-5 rounded-xl border transition-all overflow-hidden ${currentStyle.backgroundGradient === g.grad ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-600/10' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-all duration-500" style={{ background: g.grad === 'none' ? 'rgba(255,255,255,0.05)' : g.grad }} />
                    <span className={`relative z-10 text-[9px] font-black uppercase tracking-widest ${currentStyle.backgroundGradient === g.grad ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`}>{g.name}</span>
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Visual Texture Patterns">
              <div className="grid grid-cols-2 gap-2 w-full">
                {patterns.map(p => (
                  <button 
                    key={p.name} 
                    onClick={() => updateStyle('page-background', { backgroundImage: p.css, backgroundSize: p.size, backgroundRepeat: 'repeat', backgroundGradient: 'none' } as any)}
                    className={`flex items-center gap-3 p-3 border rounded-xl transition-all group ${currentStyle.backgroundImage === p.css ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                  >
                    <div className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0" style={{ backgroundImage: p.css, backgroundSize: p.size === 'auto' ? 'cover' : '10px 10px' }} />
                    <span className={`text-[10px] font-bold ${currentStyle.backgroundImage === p.css ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`}>{p.name}</span>
                  </button>
                ))}
              </div>
            </ControlGroup>
          </Section>

          <Section title="Asset Dynamics">
            <ControlGroup label="Behavior Options">
               <div className="grid grid-cols-2 gap-2 w-full">
                {behaviors.map(b => (
                  <button 
                    key={b.label}
                    onClick={() => updateStyle('page-background', { backgroundSize: b.size, backgroundRepeat: b.repeat })}
                    className={`flex items-center gap-3 p-3 border rounded-xl transition-all group ${currentStyle.backgroundSize === b.size && currentStyle.backgroundRepeat === b.repeat ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Icon name={b.icon as any} size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{b.label}</span>
                  </button>
                ))}
              </div>
            </ControlGroup>
            
            <button 
              onClick={onFileUpload} 
              className="w-full py-6 bg-indigo-600/10 border border-indigo-600/30 rounded-[32px] text-indigo-400 font-black uppercase tracking-widest text-[11px] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95"
            >
              <Icon name="image" size={20} /> Upload Scene Asset
            </button>
          </Section>
        </>
      )}

      {/* -------------------- COMPONENT MODE -------------------- */}
      {!isEnvSelected && (
        <>
          <Section title="Component Layout">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Width</span>
                <input type="text" value={currentStyle.width || ''} onChange={e => updateStyle(selectedId!, { width: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="auto" />
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Padding</span>
                <input type="text" value={currentStyle.padding || ''} onChange={e => updateStyle(selectedId!, { padding: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="0px" />
              </div>
            </div>

            {isImageSelected && (
               <ControlGroup label="Image Behavior">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {behaviors.map(b => (
                      <button 
                        key={b.label}
                        onClick={() => updateStyle(selectedId!, { backgroundSize: b.size, backgroundRepeat: b.repeat, objectFit: b.size as any })}
                        className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${currentStyle.backgroundSize === b.size ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white'}`}
                      >
                        <Icon name={b.icon as any} size={14} />
                        <span className="text-[9px] font-black uppercase tracking-tight">{b.label}</span>
                      </button>
                    ))}
                  </div>
               </ControlGroup>
            )}
          </Section>

          <Section title="Visual Dynamics & Motion">
            <ControlGroup label="Animation Effects">
              <div className="grid grid-cols-2 gap-2 w-full">
                {animations.map(anim => (
                  <button 
                    key={anim.name} 
                    onClick={() => updateStyle(selectedId!, { animation: anim.val })}
                    className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${currentStyle.animation === anim.val ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10 hover:text-white'}`}
                  >
                    {anim.name}
                  </button>
                ))}
              </div>
            </ControlGroup>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Opacity</span>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="1" step="0.01" value={currentStyle.opacity ?? 1} onChange={e => updateStyle(selectedId!, { opacity: parseFloat(e.target.value) })} className="flex-1 h-1 bg-white/10 rounded-full appearance-none accent-indigo-500" />
                  <span className="text-[10px] font-mono text-indigo-400 w-8">{Math.round((currentStyle.opacity ?? 1) * 100)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Radius</span>
                <input type="text" value={currentStyle.borderRadius || ''} onChange={e => updateStyle(selectedId!, { borderRadius: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="16px" />
              </div>
            </div>
          </Section>

          {!isImageSelected && (
            <Section title="Content & Typography">
               <textarea 
                value={selectedElement?.content || ''} 
                onChange={e => updateContent(selectedId!, e.target.value)} 
                className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-xs focus:border-indigo-600 outline-none h-40 font-mono transition-all shadow-inner leading-relaxed" 
                placeholder="Content (Text or HTML)..."
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Size</span>
                   <input type="text" value={currentStyle.fontSize || ''} onChange={e => updateStyle(selectedId!, { fontSize: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="e.g. 1rem" />
                </div>
                <div className="space-y-2">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Color</span>
                   <input type="color" value={currentStyle.color || '#ffffff'} onChange={e => updateStyle(selectedId!, { color: e.target.value })} className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-1 py-1 cursor-pointer outline-none" />
                </div>
              </div>
              
              <ControlGroup label="Align">
                <div className="flex bg-white/5 rounded-xl p-1 w-full border border-white/5">
                  {(['left', 'center', 'right', 'justify'] as const).map(align => (
                    <button key={align} onClick={() => updateStyle(selectedId!, { textAlign: align })} className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${currentStyle.textAlign === align ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                      <Icon name={`align-${align}` as any} size={14} />
                    </button>
                  ))}
                </div>
              </ControlGroup>
            </Section>
          )}

          <Section title="Appearance Detail">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Stroke</span>
                   <input type="text" value={currentStyle.borderWidth || ''} onChange={e => updateStyle(selectedId!, { borderWidth: e.target.value, borderStyle: 'solid' })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500" placeholder="0px" />
                </div>
                <div className="space-y-2">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Weight</span>
                   <select value={currentStyle.fontWeight || 'normal'} onChange={e => updateStyle(selectedId!, { fontWeight: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-zinc-300">
                      {['300', '400', '500', '600', '700', '900'].map(w => <option key={w} value={w} className="bg-zinc-900">{w}</option>)}
                   </select>
                </div>
             </div>
          </Section>
        </>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .7; transform: scale(0.98); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>
    </div>
  );
};
