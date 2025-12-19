
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
    { name: 'Dots', css: 'radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px)', size: '20px 20px' },
    { name: 'Grid', css: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', size: '30px 30px' },
    { name: 'Waves', css: 'radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.03) 21%, rgba(255,255,255,0.03) 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, rgba(255,255,255,0.03) 21%, rgba(255,255,255,0.03) 34%, transparent 35%, transparent)', size: '40px 40px' }
  ];

  const gradients = [
    { name: 'Fintech', grad: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)' },
    { name: 'Sunset', grad: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
    { name: 'Creative', grad: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    { name: 'Ocean', grad: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)' },
    { name: 'Aurora', grad: 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(339,49%,30%,1) 0, transparent 50%)' },
    { name: 'None', grad: 'none' }
  ];

  const behaviors = [
    { label: 'Cover', size: 'cover', repeat: 'no-repeat', icon: 'maximize' },
    { label: 'Tile', size: 'auto', repeat: 'repeat', icon: 'grid' },
    { label: 'Contain', size: 'contain', repeat: 'no-repeat', icon: 'minimize' },
    { label: 'Fill', size: '100% 100%', repeat: 'no-repeat', icon: 'square' },
  ];

  const animations = [
    { name: 'None', val: 'none' },
    { name: 'Pulse', val: 'pulse 2s infinite' },
    { name: 'Bounce', val: 'bounce 1s infinite' },
    { name: 'Spin', val: 'spin 3s linear infinite' },
    { name: 'Float', val: 'float 3s ease-in-out infinite' }
  ];

  const renderBackgroundSuite = () => (
    <>
      <ControlGroup label="Solid Colors">
        <div className="grid grid-cols-5 gap-2 w-full">
          {['transparent', '#ffffff', '#000000', '#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
            <button 
              key={c} 
              onClick={() => updateStyle(selectedId!, { backgroundColor: c, backgroundGradient: 'none', backgroundImage: 'none' })} 
              className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${currentStyle.backgroundColor === c ? 'border-indigo-500 shadow-lg' : 'border-white/5'}`} 
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
              className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${currentStyle.backgroundGradient === g.grad ? 'border-indigo-500 shadow-md' : 'border-white/5 hover:border-white/20'}`}
              style={{ background: g.grad === 'none' ? 'rgba(255,255,255,0.05)' : g.grad }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup label="Visual Texture Patterns">
        <div className="grid grid-cols-2 gap-2 w-full">
          {patterns.map(p => (
            <button 
              key={p.name} 
              onClick={() => updateStyle(selectedId!, { backgroundImage: p.css, backgroundSize: p.size, backgroundRepeat: 'repeat', backgroundGradient: 'none' } as any)}
              className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${currentStyle.backgroundImage === p.css ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/5 border-white/5'}`}
            >
              <div className="w-8 h-8 rounded-md border border-white/10" style={{ backgroundImage: p.css, backgroundSize: p.size === 'auto' ? 'cover' : '10px 10px' }} />
              <span className="text-[10px] font-bold text-zinc-500">{p.name}</span>
            </button>
          ))}
        </div>
      </ControlGroup>

      <ControlGroup label="Image Behavior">
         <div className="grid grid-cols-2 gap-2 w-full">
          {behaviors.map(b => (
            <button 
              key={b.label}
              onClick={() => updateStyle(selectedId!, { backgroundSize: b.size, backgroundRepeat: b.repeat, objectFit: b.size as any })}
              className={`flex items-center gap-3 p-3 border rounded-xl transition-all ${currentStyle.backgroundSize === b.size && currentStyle.backgroundRepeat === b.repeat ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'}`}
            >
              <Icon name={b.icon as any} size={14} />
              <span className="text-[9px] font-black uppercase">{b.label}</span>
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
          <Section title="Canvas Geometry">
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
            <div className="grid grid-cols-2 gap-4 mt-2">
              <input type="text" value={currentStyle.width || ''} onChange={e => updateStyle('page-background', { width: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" placeholder="Width" />
              <input type="text" value={currentStyle.height || ''} onChange={e => updateStyle('page-background', { height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" placeholder="Height" />
            </div>
          </Section>

          <Section title="Environment Style">
            {renderBackgroundSuite()}
            <button onClick={onFileUpload} className="w-full py-5 bg-indigo-600/10 border border-indigo-600/30 rounded-3xl text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3">
              <Icon name="image" size={20} /> Upload Scene Asset
            </button>
          </Section>
        </>
      ) : (
        <>
          {isImageSelected && (
             <Section title="Image Asset">
                <button onClick={onFileUpload} className="w-full py-5 bg-emerald-600/10 border border-emerald-600/30 rounded-3xl text-emerald-400 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-3">
                  <Icon name="image" size={20} /> Change Local Asset
                </button>
             </Section>
          )}

          <Section title="Geometry & Layout">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Width</span>
                <input type="text" value={currentStyle.width || ''} onChange={e => updateStyle(selectedId!, { width: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" placeholder="auto" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Height</span>
                <input type="text" value={currentStyle.height || ''} onChange={e => updateStyle(selectedId!, { height: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" placeholder="auto" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Corner Radius</span>
              <input type="text" value={currentStyle.borderRadius || ''} onChange={e => updateStyle(selectedId!, { borderRadius: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" placeholder="16px" />
            </div>
          </Section>

          <Section title="Visual Style">
            {renderBackgroundSuite()}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Opacity</span>
                   <input type="range" min="0" max="1" step="0.01" value={currentStyle.opacity ?? 1} onChange={e => updateStyle(selectedId!, { opacity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500" />
                </div>
                <div className="space-y-1">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Text Color</span>
                   <input type="color" value={currentStyle.color || '#ffffff'} onChange={e => updateStyle(selectedId!, { color: e.target.value })} className="w-full h-10 bg-white/5 border border-white/10 rounded-lg cursor-pointer p-1" />
                </div>
            </div>
          </Section>

          <Section title="Motion & Dynamics">
            <ControlGroup label="Keyframe Animations">
              <div className="grid grid-cols-2 gap-2 w-full">
                {animations.map(anim => (
                  <button key={anim.name} onClick={() => updateStyle(selectedId!, { animation: anim.val })} className={`px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${currentStyle.animation === anim.val ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white'}`}>
                    {anim.name}
                  </button>
                ))}
              </div>
            </ControlGroup>
          </Section>

          {!isImageSelected && (
            <Section title="Typography & Content">
               <textarea 
                value={selectedElement?.content || ''} 
                onChange={e => updateContent(selectedId!, e.target.value)} 
                className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-xs focus:border-indigo-600 outline-none h-40 resize-none font-mono" 
                placeholder="Text or HTML..."
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Align</span>
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button key={align} onClick={() => updateStyle(selectedId!, { textAlign: align })} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all ${currentStyle.textAlign === align ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                          <Icon name={`align-${align}` as any} size={14} />
                        </button>
                      ))}
                    </div>
                </div>
                <div className="space-y-1">
                   <span className="text-[9px] text-zinc-500 uppercase font-bold">Font Size</span>
                   <input type="text" value={currentStyle.fontSize || ''} onChange={e => updateStyle(selectedId!, { fontSize: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none" placeholder="1rem" />
                </div>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
};
