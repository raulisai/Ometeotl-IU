
import React, { useState, useEffect, useRef } from 'react';
import { Platform, UIElement, LibraryComponent, UIStyle, AIAction, TaskStatus } from './types';
import { Icon } from './components/Icon';
import { UIRenderer } from './components/UIRenderer';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AIStudioPanel } from './components/AIStudioPanel';
import { AgentPanel } from './components/AgentPanel';
import { CodePortal } from './components/CodePortal';
import { useHistory } from './hooks/useHistory';
import { generateFullUI, exportToCode, refineImageWithAI, generateComponentTemplate, refineSpecificElement } from './services/geminiService';

const STANDARD_LIBRARY: LibraryComponent[] = [
  { type: 'nav', name: 'Menu', icon: 'layout', description: 'Navbar' },
  { type: 'card', name: 'Card', icon: 'square', description: 'Container' },
  { type: 'carousel', name: 'Carousel', icon: 'image', description: 'Slider' },
  { type: 'table', name: 'Matrix', icon: 'grid', description: 'Data Table' },
  { type: 'button', name: 'Button', icon: 'square', description: 'Action' },
  { type: 'input', name: 'Input', icon: 'type', description: 'Field' },
  { type: 'h1', name: 'Heading', icon: 'type', description: 'Title' },
  { type: 'img', name: 'Image', icon: 'image', description: 'Visual' },
];

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<Platform>(Platform.WEB);
  const [elements, setElements] = useState<UIElement[]>([]);
  const [pageStyle, setPageStyle] = useState<UIStyle>({ 
    backgroundColor: '#09090b', 
    width: '1200px', 
    height: '800px',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<TaskStatus>('idle');
  const [agentHistory, setAgentHistory] = useState<AIAction[]>([]);
  const [prompt, setPrompt] = useState('');
  const [projectName] = useState('Visionary Studio');
  const [codeExport, setCodeExport] = useState<string | null>(null);
  
  const [customComponents, setCustomComponents] = useState<LibraryComponent[]>(() => {
    const saved = localStorage.getItem('genui_custom_components');
    return saved ? JSON.parse(saved) : [];
  });

  const [leftPanelMode, setLeftPanelMode] = useState<'studio' | 'inspector'>('studio');
  const [inspectorMode, setInspectorMode] = useState<'props' | 'ai'>('props');
  const [agentVisible, setAgentVisible] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { saveToHistory } = useHistory({ elements, platform, projectName, pageStyle });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = elements.find(e => e.id === selectedId);
  const isImageSelected = selectedElement?.type === 'img';
  const isEnvSelected = selectedId === 'page-background';

  useEffect(() => {
    const init = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    init();
  }, []);

  const updateStyle = (id: string, styleUpdate: UIStyle) => {
    if (id === 'page-background') {
      const newPageStyle = { ...pageStyle, ...styleUpdate };
      setPageStyle(newPageStyle);
      saveToHistory({ elements, platform, projectName, pageStyle: newPageStyle });
    } else {
      const newElements = elements.map(el => el.id === id ? { ...el, style: { ...el.style, ...styleUpdate } } : el);
      setElements(newElements);
      saveToHistory({ elements: newElements, platform, projectName, pageStyle });
    }
  };

  const deleteElement = (id: string) => {
    if (id === 'page-background') return;
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    if (selectedId === id) setSelectedId(null);
    saveToHistory({ elements: newElements, platform, projectName, pageStyle });
  };

  const updateContent = (id: string, content: string) => {
    const newElements = elements.map(el => el.id === id ? { ...el, content } : el);
    setElements(newElements);
    saveToHistory({ elements: newElements, platform, projectName, pageStyle });
  };

  const handleGenerate = async (p?: string, elementId?: string) => {
    const finalPrompt = p || prompt;
    if (!finalPrompt.trim()) return;
    const targetId = elementId || selectedId;
    setAgentVisible(true);
    setAgentStatus('analyzing');
    try {
      if (targetId && targetId !== 'page-background') {
        const target = elements.find(e => e.id === targetId);
        if (target) {
          const updatedElement = await refineSpecificElement(target, finalPrompt);
          setElements(prev => prev.map(el => el.id === targetId ? updatedElement : el));
        }
      } else {
        const result = await generateFullUI(finalPrompt, platform, { elements, platform, projectName, pageStyle });
        setElements(result.elements);
        if (result.pageStyle) setPageStyle(result.pageStyle);
      }
      setPrompt('');
    } catch (err: any) {
      setAgentStatus('error');
    } finally {
      setAgentStatus('idle');
    }
  };

  const handleDragStart = (id: string, e: React.MouseEvent) => {
    if (id === 'page-background') return;
    setIsDragging(true);
    setSelectedId(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging || !selectedId || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Cálculo de posición cruda
      let rawX = e.clientX - rect.left - dragOffset.x;
      let rawY = e.clientY - rect.top - dragOffset.y;

      // SISTEMA DE SNAPPING (8px Figma style)
      const SNAP_GRID = 8;
      let x = Math.round(rawX / SNAP_GRID) * SNAP_GRID;
      let y = Math.round(rawY / SNAP_GRID) * SNAP_GRID;

      // RESTRICCIONES DE LÍMITES (No salir del lienzo)
      const canvasWidth = parseInt(pageStyle.width || '1000');
      const canvasHeight = parseInt(pageStyle.height || '800');
      
      x = Math.max(0, Math.min(x, canvasWidth - 40)); // margen mínimo de 40px para no perderlo
      y = Math.max(0, Math.min(y, canvasHeight - 40));

      setElements(prev => prev.map(el => el.id === selectedId ? { ...el, position: { x, y } } : el));
    };
    
    const onUp = () => {
      if (isDragging) {
        setIsDragging(false);
        saveToHistory({ elements, platform, projectName, pageStyle });
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, selectedId, dragOffset, pageStyle, elements, platform, projectName, saveToHistory]);

  if (hasKey === false) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="glass p-16 rounded-[48px] text-center border border-white/10">
          <Icon name="sparkles" size={64} className="text-indigo-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-4xl font-black mb-6 italic">Visionary Locked</h1>
          <button onClick={async () => { await (window as any).aistudio.openSelectKey(); setHasKey(true); }} className="px-12 py-5 bg-indigo-600 rounded-full font-black text-white uppercase tracking-widest hover:bg-indigo-500 transition-colors">Select API Key</button>
        </div>
      </div>
    );
  }

  const finalCanvasStyle = {
    ...pageStyle,
    width: platform === Platform.MOBILE ? '375px' : pageStyle.width || '1000px',
    height: platform === Platform.MOBILE ? '750px' : pageStyle.height || '650px',
    transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    position: 'relative' as const,
  };

  return (
    <div className={`flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative font-['Inter'] ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedId) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              if (selectedId === 'page-background') updateStyle('page-background', { backgroundImage: `url(${base64})`, backgroundGradient: 'none' });
              else updateContent(selectedId, base64);
            };
            reader.readAsDataURL(file);
          }
        }} 
      />

      <aside className={`fixed top-8 left-8 bottom-8 w-[400px] flex flex-col glass rounded-[40px] border border-white/10 shadow-2xl z-40 transition-all duration-500 translate-x-0`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <button onClick={() => setLeftPanelMode('studio')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'studio' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Studio</button>
          <button onClick={() => setLeftPanelMode('inspector')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'inspector' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Inspector</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leftPanelMode === 'studio' ? (
            <LeftSidebar 
              visible={true} setVisible={() => {}} 
              elements={elements} selectedId={selectedId} setSelectedId={setSelectedId} 
              libraryComponents={STANDARD_LIBRARY} customComponents={customComponents}
              onInsert={(type, name) => {
                let content = "";
                let tailwind = "relative transition-all duration-500";
                
                switch (type) {
                  case 'nav':
                    content = `
                      <nav class="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-full flex items-center justify-between min-w-[700px] shadow-2xl">
                        <div class="flex items-center gap-10">
                          <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black italic text-white shadow-lg shadow-indigo-600/30">V</div>
                          <div class="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            <a href="#" class="text-white">Experience</a>
                            <a href="#" class="hover:text-white transition-colors">Assets</a>
                            <a href="#" class="hover:text-white transition-colors">Lab</a>
                          </div>
                        </div>
                        <button class="bg-white text-black px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">Launch App</button>
                      </nav>`;
                    break;
                  case 'card':
                    content = `
                      <div class="bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden w-80 shadow-2xl group hover:border-indigo-500/50 transition-all">
                        <div class="relative h-48 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <div class="p-8">
                          <h4 class="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-3 text-indigo-400">Gen-AI Alpha</h4>
                          <p class="text-zinc-400 text-[12px] leading-relaxed font-medium mb-6 opacity-80">Revolutionary interfaces generated in real-time with zero-latency logic.</p>
                          <button class="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all">View Details</button>
                        </div>
                      </div>`;
                    break;
                  case 'carousel':
                    content = `
                      <div class="relative w-[500px] h-[320px] rounded-[48px] overflow-hidden border border-white/10 shadow-2xl group">
                        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                          <h3 class="text-white text-xl font-black italic uppercase tracking-tighter mb-2">Infinite Horizons</h3>
                          <p class="text-zinc-400 text-xs font-medium">Explore the boundaries of digital creation.</p>
                        </div>
                        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                          <div class="w-10 h-1.5 bg-indigo-600 rounded-full"></div>
                          <div class="w-2 h-1.5 bg-white/20 rounded-full"></div>
                          <div class="w-2 h-1.5 bg-white/20 rounded-full"></div>
                        </div>
                      </div>`;
                    break;
                  case 'table':
                    content = `
                      <div class="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 w-[600px] shadow-2xl overflow-hidden backdrop-blur-md">
                        <table class="w-full text-left">
                          <thead>
                            <tr class="border-b border-white/5">
                              <th class="pb-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Asset</th>
                              <th class="pb-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Status</th>
                            </tr>
                          </thead>
                          <tbody class="text-xs text-zinc-400">
                            <tr>
                              <td class="py-4 font-bold text-white">Project_Omega.ae</td>
                              <td class="py-4"><span class="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest">Active</span></td>
                            </tr>
                            <tr>
                              <td class="py-4 font-bold text-white">Neural_Layer_01</td>
                              <td class="py-4"><span class="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[8px] font-black uppercase tracking-widest">Syncing</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>`;
                    break;
                  case 'button':
                    content = `Action Button`;
                    tailwind = "px-10 py-5 bg-indigo-600 rounded-3xl text-white font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-indigo-500 transition-all";
                    break;
                  case 'input':
                    content = "Search...";
                    tailwind = "px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs w-64 outline-none focus:border-indigo-500 transition-all";
                    break;
                  case 'h1':
                    content = `VISIONARY`;
                    tailwind = "text-6xl font-black italic tracking-tighter text-white uppercase leading-none";
                    break;
                  case 'img':
                    content = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
                    tailwind = "w-64 h-64 rounded-[40px] object-cover shadow-2xl border border-white/10";
                    break;
                  default:
                    content = name;
                    tailwind = "p-8 bg-white/5 rounded-3xl text-white";
                }
                
                const newEl: UIElement = { 
                  id: `el-${Date.now()}`, 
                  type, 
                  name, 
                  tailwindClasses: tailwind, 
                  content: content, 
                  position: { x: 150, y: 150 }, 
                  style: { opacity: 1 } 
                };
                setElements([...elements, newEl]);
                setSelectedId(newEl.id);
              }} 
              onCreateCustom={async (p) => {
                setAgentStatus('designing');
                const tpl = await generateComponentTemplate(p);
                setCustomComponents(prev => [{ type: 'custom', name: tpl.name, icon: 'sparkles', template: tpl }, ...prev]);
                setAgentStatus('idle');
              }}
              onDeleteCustom={(n) => setCustomComponents(prev => prev.filter(c => c.name !== n))}
              onDeleteElement={deleteElement}
              isGenerating={agentStatus !== 'idle'}
            />
          ) : (
            <div className="p-8 space-y-8">
              {selectedId ? (
                <>
                  <div className="flex bg-white/5 p-1.5 rounded-[20px]">
                    <button onClick={() => setInspectorMode('props')} className={`flex-1 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'props' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Properties</button>
                    <button onClick={() => setInspectorMode('ai')} className={`flex-1 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>IA Lab</button>
                  </div>
                  {inspectorMode === 'props' ? (
                    <PropertiesPanel 
                      selectedId={selectedId} selectedElement={selectedElement} isEnvSelected={isEnvSelected} isImageSelected={isImageSelected} pageStyle={pageStyle} 
                      updateStyle={updateStyle} updateContent={updateContent} onFileUpload={() => fileInputRef.current?.click()} 
                    />
                  ) : (
                    <AIStudioPanel 
                      isImageSelected={isImageSelected} selectedElement={selectedElement} selectedId={selectedId} isGenerating={agentStatus !== 'idle'} 
                      refinementPrompt={''} setRefinementPrompt={() => {}} aiImagePrompt={''} setAiImagePrompt={() => {}} prompt={prompt} setPrompt={setPrompt} 
                      handleRefineImage={async (i) => {
                        if (!selectedElement?.content) return;
                        setAgentStatus('analyzing');
                        const url = await refineImageWithAI(selectedElement.content, i || "");
                        updateContent(selectedId!, url);
                        setAgentStatus('idle');
                      }} 
                      handleCreateAIImage={() => {}} handleGenerate={handleGenerate} updateStyle={updateStyle}
                      onFileUpload={() => fileInputRef.current?.click()}
                    />
                  )}
                </>
              ) : <div className="text-center opacity-30 py-20 uppercase font-black text-[10px] tracking-widest">Select an element</div>}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-12 ml-[400px] relative bg-[#0c0c0e] canvas-bg h-full">
        <Header platform={platform} setPlatform={setPlatform} projectName={projectName} onBuild={async () => setCodeExport(await exportToCode(elements))} />
        <div className="flex-1 w-full flex items-center justify-center overflow-auto custom-scrollbar p-10">
          <div ref={containerRef} style={finalCanvasStyle as any} className="relative shadow-[0_100px_200px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden bg-dot-pattern">
            <UIRenderer 
              elements={elements} 
              selectedId={selectedId} 
              onSelect={setSelectedId} 
              onDragStart={handleDragStart} 
              onUpdateContent={updateContent}
              isDragging={isDragging}
              canvasDimensions={{
                width: parseInt(pageStyle.width || '1000'),
                height: parseInt(pageStyle.height || '800')
              }}
            />
          </div>
        </div>
      </main>

      <AgentPanel visible={agentVisible} onClose={() => setAgentVisible(false)} selectedElement={selectedElement} history={agentHistory} status={agentStatus} prompt={prompt} setPrompt={setPrompt} onDispatch={handleGenerate} />

      <button onClick={() => setAgentVisible(!agentVisible)} className={`fixed top-1/2 right-8 -translate-y-1/2 w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-indigo-600 hover:scale-110 transition-all ${agentVisible ? 'translate-x-full' : ''}`}><Icon name="sparkles" size={28} className={agentVisible ? 'text-white' : 'text-indigo-400'} /></button>

      {codeExport && <CodePortal code={codeExport} onClose={() => setCodeExport(null)} />}

      <style>{`
        .bg-dot-pattern { background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 20px; }
        .glass { background: rgba(12, 12, 14, 0.85); backdrop-filter: blur(60px) saturate(220%); }
      `}</style>
    </div>
  );
};

export default App;
