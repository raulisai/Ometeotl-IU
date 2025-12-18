
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

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedId, selectedElement, isEnvSelected, isImageSelected, pageStyle, updateStyle, updateContent, onFileUpload
}) => {
  const currentStyle = isEnvSelected ? pageStyle : selectedElement?.style || {};
  
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-4 pb-6 border-b border-white/5 last:border-0">
      <label className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] block px-1">{title}</label>
      <div className="space-y-4">{children}</div>
    </section>
  );

  const ControlGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 flex justify-end gap-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      
      {/* --- LAYOUT SECTION --- */}
      <Section title="Dimensions & Layout">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Width</span>
            <input 
              type="text" 
              value={currentStyle.width || ''} 
              onChange={e => updateStyle(selectedId!, { width: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 outline-none"
              placeholder="auto"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-bold">Height</span>
            <input 
              type="text" 
              value={currentStyle.height || ''} 
              onChange={e => updateStyle(selectedId!, { height: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 outline-none"
              placeholder="auto"
            />
          </div>
        </div>
        {!isEnvSelected && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Padding</span>
              <input 
                type="text" 
                value={currentStyle.padding || ''} 
                onChange={e => updateStyle(selectedId!, { padding: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                placeholder="0px"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Opacity</span>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={currentStyle.opacity ?? 1} 
                  onChange={e => updateStyle(selectedId!, { opacity: parseFloat(e.target.value) })} 
                  className="flex-1 h-1 bg-white/10 rounded-full appearance-none accent-indigo-500" 
                />
                <span className="text-[10px] font-mono text-indigo-400 w-8">{Math.round((currentStyle.opacity ?? 1) * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* --- BACKGROUND SECTION --- */}
      <Section title="Background & Fill">
        <div className="grid grid-cols-5 gap-2">
          {['transparent', '#ffffff', '#000000', '#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
            <button 
              key={c} 
              onClick={() => updateStyle(selectedId!, { backgroundColor: c, backgroundGradient: '' })} 
              className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${currentStyle.backgroundColor === c ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/30' : 'border-white/5'}`} 
              style={{ backgroundColor: c === 'transparent' ? undefined : c }}
            >
              {c === 'transparent' && <div className="w-full h-full relative overflow-hidden rounded-md"><div className="absolute top-0 left-0 w-full h-px bg-red-500 rotate-45 origin-top-left scale-x-150" /></div>}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <span className="text-[9px] text-zinc-500 uppercase font-bold">Gradient (CSS)</span>
          <input 
            type="text" 
            placeholder="linear-gradient(to right, #4f46e5, #ec4899)"
            value={currentStyle.backgroundGradient || ''}
            onChange={e => updateStyle(selectedId!, { backgroundGradient: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-mono focus:border-indigo-500 outline-none"
          />
        </div>
      </Section>

      {/* --- TYPOGRAPHY SECTION --- */}
      {!isImageSelected && !isEnvSelected && (
        <Section title="Typography">
          <div className="space-y-4">
             <textarea 
              value={selectedElement?.content} 
              onChange={e => updateContent(selectedId!, e.target.value)} 
              className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-xs focus:border-indigo-500 outline-none h-24 font-medium transition-all shadow-inner" 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Size</span>
                <input 
                  type="text" value={currentStyle.fontSize || ''} 
                  onChange={e => updateStyle(selectedId!, { fontSize: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none"
                  placeholder="16px"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Color</span>
                <input 
                  type="color" value={currentStyle.color || '#ffffff'} 
                  onChange={e => updateStyle(selectedId!, { color: e.target.value })}
                  className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-1 py-1 outline-none cursor-pointer"
                />
              </div>
            </div>

            <ControlGroup label="Alignment">
              <div className="flex bg-white/5 rounded-xl p-1 w-full">
                {(['left', 'center', 'right', 'justify'] as const).map(align => (
                  <button key={align} onClick={() => updateStyle(selectedId!, { textAlign: align })} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all ${currentStyle.textAlign === align ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                    <Icon name={`align-${align}` as any} size={14} />
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup label="Weight">
              <div className="flex bg-white/5 rounded-xl p-1 w-full">
                {(['400', '600', '700', '900'] as const).map(w => (
                  <button key={w} onClick={() => updateStyle(selectedId!, { fontWeight: w })} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${currentStyle.fontWeight === w ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                    {w === '400' ? 'R' : w === '600' ? 'M' : w === '700' ? 'B' : 'X'}
                  </button>
                ))}
              </div>
            </ControlGroup>
          </div>
        </Section>
      )}

      {/* --- BORDERS & RADIUS --- */}
      {!isEnvSelected && (
        <Section title="Border & Corners">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Radius</span>
                <div className="grid grid-cols-3 gap-1">
                  {['0px', '16px', '999px'].map(r => (
                    <button key={r} onClick={() => updateStyle(selectedId!, { borderRadius: r })} className={`py-2 rounded-lg text-[10px] font-bold transition-all ${currentStyle.borderRadius === r ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
                      {r === '0px' ? 'None' : r === '16px' ? 'Soft' : 'Full'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Border Width</span>
                <input 
                  type="text" value={currentStyle.borderWidth || ''} 
                  onChange={e => updateStyle(selectedId!, { borderWidth: e.target.value, borderStyle: 'solid' })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none"
                  placeholder="0px"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
               <input 
                type="color" value={currentStyle.borderColor || '#ffffff'} 
                onChange={e => updateStyle(selectedId!, { borderColor: e.target.value })}
                className="w-12 h-10 bg-white/5 border border-white/10 rounded-xl px-1 py-1 outline-none cursor-pointer"
              />
              <div className="flex-1 flex bg-white/5 rounded-xl p-1">
                {(['solid', 'dashed', 'dotted', 'none'] as const).map(s => (
                  <button key={s} onClick={() => updateStyle(selectedId!, { borderStyle: s })} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${currentStyle.borderStyle === s ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* --- EFFECTS & SHADOWS --- */}
      {!isEnvSelected && (
        <Section title="Shadows & Effects">
          <div className="space-y-4">
            <ControlGroup label="Elevation">
              <div className="grid grid-cols-4 gap-2 w-full">
                {[
                  { name: 'None', val: 'none' },
                  { name: 'Soft', val: '0 10px 30px rgba(0,0,0,0.1)' },
                  { name: 'Hard', val: '0 20px 50px rgba(0,0,0,0.3)' },
                  { name: 'Neon', val: '0 0 30px rgba(79,70,229,0.5)' }
                ].map(sh => (
                  <button key={sh.name} onClick={() => updateStyle(selectedId!, { boxShadow: sh.val })} className={`py-2 rounded-lg text-[9px] font-bold transition-all ${currentStyle.boxShadow === sh.val ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
                    {sh.name}
                  </button>
                ))}
              </div>
            </ControlGroup>
            <div className="space-y-2">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Blur / Glass (Backdrop)</span>
              <input 
                type="text" placeholder="blur(10px)"
                value={currentStyle.backdropFilter || ''}
                onChange={e => updateStyle(selectedId!, { backdropFilter: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none font-mono"
              />
            </div>
          </div>
        </Section>
      )}

      {/* --- ANIMATIONS SECTION --- */}
      {!isEnvSelected && (
        <Section title="Animations">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'None', val: 'none' },
              { label: 'Pulse', val: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
              { label: 'Bounce', val: 'bounce 1s infinite' },
              { label: 'Spin', val: 'spin 3s linear infinite' },
              { label: 'Ping', val: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' },
              { label: 'Float', val: 'float 3s ease-in-out infinite' }
            ].map(ani => (
              <button 
                key={ani.label} 
                onClick={() => updateStyle(selectedId!, { animation: ani.val })} 
                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStyle.animation === ani.val ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
              >
                {ani.label}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-zinc-600 leading-relaxed italic px-1">Tip: Animations bring UI to life. Try "Spin" for loaders or "Float" for 3D icons.</p>
        </Section>
      )}

      {/* --- IMAGE SOURCE SECTION --- */}
      {isImageSelected && (
        <Section title="Image Studio">
          <div className="flex gap-4">
            <textarea 
              value={selectedElement?.content} 
              onChange={e => updateContent(selectedId!, e.target.value)} 
              placeholder="Source URL..." 
              className="flex-1 bg-black/50 border border-white/10 rounded-[28px] p-5 text-[10px] focus:border-indigo-600 outline-none h-20 resize-none font-medium transition-all shadow-inner" 
            />
            <button 
              onClick={onFileUpload} 
              className="w-20 h-20 bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 rounded-[28px] flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95"
            >
              <Icon name="plus" size={32} />
            </button>
          </div>
          <div className="space-y-4 pt-4">
            <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest block px-2">Object Fit</span>
            <div className="grid grid-cols-4 gap-2">
              {(['cover', 'contain', 'fill', 'none'] as const).map(fit => (
                <button key={fit} onClick={() => updateStyle(selectedId!, { objectFit: fit })} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${currentStyle.objectFit === fit ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-600'}`}>{fit}</button>
              ))}
            </div>
          </div>
        </Section>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
