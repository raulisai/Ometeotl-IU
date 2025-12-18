
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
  
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<'props' | 'ai'>('props');

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

  useEffect(() => {
    if (selectedId) {
      setLeftSidebarVisible(false);
      setRightSidebarVisible(true);
    } else {
      setLeftSidebarVisible(true);
      setRightSidebarVisible(false);
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

      <LeftSidebar 
        visible={leftSidebarVisible} 
        setVisible={setLeftSidebarVisible} 
        elements={elements} 
        selectedId={selectedId} 
        setSelectedId={setSelectedId} 
        libraryComponents={LIBRARY_COMPONENTS} 
        onInsert={insertFromLibrary} 
      />

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
              <h2 className="text-3xl font-black italic uppercase text-white animate-pulse">Rendering...</h2>
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

        {!selectedId && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-5xl px-12 z-50">
            <form onSubmit={e => { e.preventDefault(); handleGenerate(); }} className="glass-dark p-4 rounded-full flex items-center gap-6 shadow-2xl border border-white/10 group focus-within:border-indigo-600/50 transition-all">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Icon name="sparkles" size={32} /></div>
              <input placeholder="Describe your interface vision..." className="flex-1 bg-transparent py-5 text-lg focus:outline-none font-medium px-4 placeholder:text-zinc-700" value={prompt} onChange={e => setPrompt(e.target.value)} disabled={isGenerating} />
              <button type="submit" className="bg-white text-black px-16 py-5 rounded-full text-[14px] font-black uppercase transition-all disabled:opacity-50">Generate</button>
            </form>
          </div>
        )}
      </main>

      <aside className={`fixed top-8 right-8 bottom-8 w-[420px] flex flex-col glass rounded-[48px] border border-white/10 shadow-2xl z-40 transition-all duration-700 ease-in-out transform ${rightSidebarVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-center gap-4">
          <button 
            onClick={() => setInspectorMode('props')} 
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'props' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500'}`}
          >
            <Icon name="settings" size={16} /> Properties
          </button>
          <button 
            onClick={() => setInspectorMode('ai')} 
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'ai' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500'}`}
          >
            <Icon name="sparkles" size={16} /> AI Studio
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
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
        </div>
      </aside>

      {codeExport && <CodePortal code={codeExport} onClose={() => setCodeExport(null)} />}

      <style>{`
        .bg-dot-pattern { background-image: radial-gradient(rgba(255,255,255,0.04) 1.5px, transparent 1.5px); background-size: 60px 60px; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 20px; }
        .glass { background: rgba(18, 18, 22, 0.75); backdrop-filter: blur(60px) saturate(200%); }
        .glass-dark { background: rgba(10, 10, 12, 0.98); backdrop-filter: blur(100px) saturate(180%); }
      `}</style>
    </div>
  );
};

export default App;
