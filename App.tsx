
import React, { useState, useEffect, useRef } from 'react';
import { Platform, UIElement, LibraryComponent, UIStyle } from './types';
import { Icon } from './components/Icon';
import { UIRenderer } from './components/UIRenderer';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AIStudioPanel } from './components/AIStudioPanel';
import { CodePortal } from './components/CodePortal';
import { useHistory } from './hooks/useHistory';
import { generateFullUI, exportToCode, generateImageWithAI, refineImageWithAI } from './services/geminiService';

const LIBRARY_COMPONENTS: LibraryComponent[] = [
  { type: 'button', name: 'Button', icon: 'square', description: 'Action' },
  { type: 'input', name: 'Input', icon: 'type', description: 'Field' },
  { type: 'card', name: 'Card', icon: 'square', description: 'Box' },
  { type: 'h1', name: 'Heading', icon: 'type', description: 'Title' },
  { type: 'img', name: 'Image', icon: 'image', description: 'Visual' },
];

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<Platform>(Platform.WEB);
  const [elements, setElements] = useState<UIElement[]>([]);
  const [pageStyle, setPageStyle] = useState<UIStyle>({ backgroundColor: '#09090b' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [projectName] = useState('Visionary Studio');
  const [codeExport, setCodeExport] = useState<string | null>(null);
  
  // Panel States
  const [leftPanelMode, setLeftPanelMode] = useState<'studio' | 'inspector'>('studio');
  const [leftVisible, setLeftVisible] = useState(true);
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

  // Auto-switch left panel mode when selection changes
  useEffect(() => {
    if (selectedId) {
      setLeftPanelMode('inspector');
    }
  }, [selectedId]);

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

  const updateContent = (id: string, content: string) => {
    const newElements = elements.map(el => el.id === id ? { ...el, content } : el);
    setElements(newElements);
    saveToHistory({ elements: newElements, platform, projectName, pageStyle });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedId) {
      const reader = new FileReader();
      reader.onloadend = () => updateContent(selectedId, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (p?: string, elementId?: string) => {
    const finalPrompt = p || prompt;
    if (!finalPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateFullUI(finalPrompt, platform, { elements, platform, projectName, selectedElementId: elementId || selectedId, pageStyle });
      setElements(result.elements);
      if (result.pageStyle) setPageStyle(result.pageStyle);
      setPrompt('');
      saveToHistory({ elements: result.elements, platform, projectName, pageStyle: result.pageStyle || pageStyle });
    } catch (err: any) {
      if (err.message?.includes("api key")) setHasKey(false);
    } finally {
      setIsGenerating(false);
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
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedId || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left - dragOffset.x;
      const y = e.clientY - containerRect.top - dragOffset.y;
      setElements(prev => prev.map(el => el.id === selectedId ? { ...el, position: { x, y } } : el));
    };
    const handleMouseUp = () => { if (isDragging) setIsDragging(false); };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedId, dragOffset]);

  const insertFromLibrary = (type: string, name: string) => {
    const newEl: UIElement = {
      id: `el-${Date.now()}`,
      type, name,
      tailwindClasses: type === 'img' ? 'w-48 h-48 rounded-[32px] object-cover shadow-2xl' : 'p-8 bg-white/5 rounded-[24px] text-white',
      content: type === 'img' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' : name,
      position: { x: 200, y: 200 },
      style: { borderRadius: '32px', opacity: 1, objectFit: 'cover' }
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  if (hasKey === false) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center">
        <div className="glass p-16 rounded-[48px] text-center">
          <Icon name="sparkles" size={64} className="text-indigo-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-4xl font-black mb-6">Connect Engine</h1>
          <button onClick={async () => { await (window as any).aistudio.openSelectKey(); setHasKey(true); }} className="px-12 py-5 bg-indigo-600 rounded-3xl font-black text-white uppercase tracking-widest">Select API Key</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative selection:bg-indigo-600/50">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* --- LEFT INTEGRATED PANEL --- */}
      <aside className={`fixed top-8 left-8 bottom-8 w-[420px] flex flex-col glass rounded-[48px] border border-white/10 shadow-2xl z-40 transition-all duration-500 ease-in-out transform ${leftVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
        
        {/* Toggle Mode Segmented Control */}
        <div className="p-8 border-b border-white/5 flex items-center justify-center gap-4">
          <button 
            onClick={() => setLeftPanelMode('studio')} 
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'studio' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
          >
            <Icon name="grid" size={16} /> Studio
          </button>
          <button 
            onClick={() => setLeftPanelMode('inspector')} 
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'inspector' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
          >
            <Icon name="settings" size={16} /> Inspector
          </button>
          <button onClick={() => setLeftVisible(false)} className="p-3 text-zinc-600 hover:text-white transition-colors"><Icon name="plus" size={14} className="rotate-45" /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leftPanelMode === 'studio' ? (
            <LeftSidebar 
              visible={true} 
              setVisible={() => {}} 
              elements={elements} 
              selectedId={selectedId} 
              setSelectedId={setSelectedId} 
              libraryComponents={LIBRARY_COMPONENTS} 
              onInsert={insertFromLibrary} 
              // Note: We wrap LeftSidebar internal layout to fit this container
            />
          ) : (
            <div className="p-10 space-y-10">
              {selectedId ? (
                <>
                  <div className="flex bg-white/5 p-2 rounded-[24px] mb-8">
                    <button onClick={() => setInspectorMode('props')} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'props' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}>Properties</button>
                    <button onClick={() => setInspectorMode('ai')} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}>AI Lab</button>
                  </div>
                  {inspectorMode === 'props' ? (
                    <PropertiesPanel 
                      selectedId={selectedId} 
                      selectedElement={selectedElement} 
                      isEnvSelected={isEnvSelected} 
                      isImageSelected={isImageSelected} 
                      pageStyle={pageStyle} 
                      updateStyle={updateStyle} 
                      updateContent={updateContent} 
                      onFileUpload={() => fileInputRef.current?.click()} 
                    />
                  ) : (
                    <AIStudioPanel 
                      isImageSelected={isImageSelected} 
                      selectedId={selectedId} 
                      isGenerating={isGenerating} 
                      refinementPrompt={refinementPrompt} 
                      setRefinementPrompt={setRefinementPrompt} 
                      aiImagePrompt={aiImagePrompt} 
                      setAiImagePrompt={setAiImagePrompt} 
                      prompt={prompt} 
                      setPrompt={setPrompt} 
                      handleRefineImage={async (i) => {
                        const instr = i || refinementPrompt;
                        if (!instr.trim() || !selectedId || !selectedElement?.content) return;
                        setIsGenerating(true);
                        try {
                          const url = await refineImageWithAI(selectedElement.content, instr);
                          updateContent(selectedId, url);
                          setRefinementPrompt('');
                        } finally { setIsGenerating(false); }
                      }} 
                      handleCreateAIImage={async () => {
                        if (!aiImagePrompt.trim() || !selectedId) return;
                        setIsGenerating(true);
                        try {
                          const url = await generateImageWithAI(aiImagePrompt);
                          updateContent(selectedId, url);
                          setAiImagePrompt('');
                        } finally { setIsGenerating(false); }
                      }} 
                      handleGenerate={handleGenerate} 
                    />
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                  <Icon name="mouse-pointer" size={48} className="mb-6" />
                  <p className="text-xs font-black uppercase tracking-widest">Select an element to inspect</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Persistent Left Toggle Button */}
      {!leftVisible && (
        <button 
          onClick={() => setLeftVisible(true)}
          className="fixed top-1/2 left-8 -translate-y-1/2 w-14 h-14 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-indigo-600 hover:scale-110 transition-all"
        >
          <Icon name="chevron-right" />
        </button>
      )}

      {/* --- MAIN DESIGN STAGE --- */}
      <main className="flex-1 flex flex-col bg-[#0c0c0e] relative">
        <Header 
          platform={platform} 
          setPlatform={setPlatform} 
          projectName={projectName} 
          onBuild={async () => { setIsGenerating(true); setCodeExport(await exportToCode(elements)); setIsGenerating(false); }} 
        />

        <div className="flex-1 overflow-hidden flex items-center justify-center p-20 bg-dot-pattern relative">
          {isGenerating && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[120px] z-[100] flex flex-col items-center justify-center">
              <div className="relative mb-12">
                <div className="w-32 h-32 border-[10px] border-indigo-600/20 rounded-full animate-spin border-t-indigo-600"></div>
                <Icon name="sparkles" size={40} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black italic uppercase text-white animate-pulse">Evolving...</h2>
            </div>
          )}
          <div 
            ref={containerRef} 
            style={{ ...pageStyle as any }} 
            className={`transition-all duration-1000 shadow-[0_150px_400px_rgba(0,0,0,1)] relative overflow-hidden ${platform === Platform.MOBILE ? 'w-[375px] h-[750px] rounded-[72px] border-[20px] border-[#0c0c0e]' : 'w-full max-w-6xl aspect-video rounded-[64px] border border-white/5'}`} 
            onMouseDown={(e) => e.target === e.currentTarget && setSelectedId(null)}
          >
            <UIRenderer elements={elements} selectedId={selectedId} onSelect={setSelectedId} onDragStart={handleDragStart} />
          </div>
        </div>
      </main>

      {/* --- RIGHT MINIMALIST AGENT PANEL --- */}
      <aside className={`fixed top-8 right-8 bottom-8 w-[400px] flex flex-col glass rounded-[48px] border border-white/10 shadow-2xl z-40 transition-all duration-500 ease-in-out transform ${agentVisible ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+32px)] opacity-0 pointer-events-none'}`}>
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center border border-indigo-600/30">
              <Icon name="sparkles" size={20} className="text-indigo-400" />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em] italic">AI Agent</span>
          </div>
          <button onClick={() => setAgentVisible(false)} className="p-2 text-zinc-500 hover:text-white transition-colors"><Icon name="plus" size={16} className="rotate-45" /></button>
        </div>
        
        <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            <div className="bg-indigo-600/10 border border-indigo-600/20 p-6 rounded-[32px] text-xs leading-relaxed text-indigo-200">
              Hi! I'm your GenUI Assistant. I can help you build entire sections or refine specific details. Describe what you need below.
            </div>
            {/* Could add a history of prompts here */}
          </div>

          <div className="relative group">
            <textarea 
              placeholder="Command the Studio..." 
              className="w-full bg-black/50 border border-white/10 rounded-[40px] p-8 text-xs focus:border-indigo-600 outline-none h-40 resize-none font-medium transition-all shadow-inner"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            />
            <button 
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-6 right-6 p-5 bg-indigo-600 rounded-[28px] shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Icon name="play" size={24} />
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">Press Enter to Dispatch</p>
        </div>
      </aside>

      {/* Persistent Right Toggle Button */}
      <button 
        onClick={() => setAgentVisible(!agentVisible)}
        className={`fixed top-1/2 right-8 -translate-y-1/2 w-14 h-14 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-indigo-600 hover:scale-110 transition-all ${agentVisible ? 'translate-x-full' : ''}`}
      >
        <Icon name="sparkles" size={24} className={agentVisible ? 'text-white' : 'text-indigo-400'} />
      </button>

      {codeExport && <CodePortal code={codeExport} onClose={() => setCodeExport(null)} />}

      <style>{`
        .bg-dot-pattern { background-image: radial-gradient(rgba(255,255,255,0.04) 1.5px, transparent 1.5px); background-size: 60px 60px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 20px; }
        .glass { background: rgba(12, 12, 14, 0.85); backdrop-filter: blur(60px) saturate(220%); }
        .glass-dark { background: rgba(10, 10, 12, 0.98); backdrop-filter: blur(100px) saturate(180%); }
      `}</style>
    </div>
  );
};

export default App;
