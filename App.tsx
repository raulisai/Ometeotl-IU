
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
import { generateFullUI, exportToCode, generateImageWithAI, refineImageWithAI, generateComponentTemplate, refineSpecificElement } from './services/geminiService';

const STANDARD_LIBRARY: LibraryComponent[] = [
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
  const [agentStatus, setAgentStatus] = useState<TaskStatus>('idle');
  const [agentHistory, setAgentHistory] = useState<AIAction[]>([]);
  const [prompt, setPrompt] = useState('');
  const [projectName] = useState('Visionary Studio');
  const [codeExport, setCodeExport] = useState<string | null>(null);
  
  // Custom Components Persistence
  const [customComponents, setCustomComponents] = useState<LibraryComponent[]>(() => {
    const saved = localStorage.getItem('genui_custom_components');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('genui_custom_components', JSON.stringify(customComponents));
  }, [customComponents]);

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

  useEffect(() => {
    if (selectedId && selectedId !== 'page-background') {
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

  const addHistory = (type: 'user' | 'ai', message: string, targetName?: string) => {
    const newAction: AIAction = {
      id: `ai-${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
      targetElementName: targetName
    };
    setAgentHistory(prev => [...prev, newAction]);
  };

  const handleGenerate = async (p?: string, elementId?: string) => {
    const finalPrompt = p || prompt;
    if (!finalPrompt.trim()) return;

    const targetId = elementId || selectedId;
    const isScoped = targetId && targetId !== 'page-background';
    
    // Open the agent panel to show progress
    setAgentVisible(true);
    addHistory('user', finalPrompt, isScoped ? elements.find(e => e.id === targetId)?.name : 'Full Interface');

    if (isScoped) {
      const target = elements.find(e => e.id === targetId);
      if (target) {
        setAgentStatus('analyzing');
        try {
          setTimeout(() => setAgentStatus('designing'), 800);
          const updatedElement = await refineSpecificElement(target, finalPrompt);
          setAgentStatus('applying');
          const newElements = elements.map(el => el.id === targetId ? updatedElement : el);
          setElements(newElements);
          setPrompt('');
          addHistory('ai', `Refined the ${target.name} following your instructions. Check the canvas!`);
          saveToHistory({ elements: newElements, platform, projectName, pageStyle });
        } catch (err: any) {
          console.error("Scoped refinement failed", err);
          setAgentStatus('error');
          addHistory('ai', "Error encountered. Let me try analyzing the component structure again.");
        } finally {
          setTimeout(() => setAgentStatus('idle'), 500);
        }
        return;
      }
    }

    // Default: Full UI generation
    setAgentStatus('analyzing');
    try {
      setTimeout(() => setAgentStatus('designing'), 1200);
      const result = await generateFullUI(finalPrompt, platform, { elements, platform, projectName, selectedElementId: targetId, pageStyle });
      setAgentStatus('applying');
      setElements(result.elements);
      if (result.pageStyle) setPageStyle(result.pageStyle);
      setPrompt('');
      addHistory('ai', "UI successfully transformed. I've reconstructed the layout to match your intent.");
      saveToHistory({ elements: result.elements, platform, projectName, pageStyle: result.pageStyle || pageStyle });
    } catch (err: any) {
      if (err.message?.includes("api key")) setHasKey(false);
      setAgentStatus('error');
      addHistory('ai', "I couldn't complete the full UI generation. Please check the prompt or try again.");
    } finally {
      setAgentStatus('idle');
    }
  };

  const handleCreateCustomComponent = async (p: string) => {
    if (!p.trim()) return;
    setAgentVisible(true);
    setAgentStatus('designing');
    addHistory('user', `Forge component: ${p}`);
    
    try {
      const template = await generateComponentTemplate(p);
      const newComp: LibraryComponent = {
        type: 'custom',
        name: template.name || 'AI Component',
        icon: 'sparkles',
        description: p,
        isCustom: true,
        template: { ...template, id: `tpl-${Date.now()}` }
      };
      setCustomComponents(prev => [newComp, ...prev]);
      addHistory('ai', `I've forged the '${newComp.name}' component. You can now drag it from the Library.`);
    } catch (err) {
      console.error("Failed to create custom component", err);
      setAgentStatus('error');
    } finally {
      setAgentStatus('idle');
    }
  };

  const handleDeleteCustomComponent = (name: string) => {
    setCustomComponents(prev => prev.filter(c => c.name !== name));
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

  const insertFromLibrary = (type: string, name: string, template?: UIElement) => {
    if (template) {
      const newId = `custom-${Date.now()}`;
      const cloned: UIElement = JSON.parse(JSON.stringify(template));
      cloned.id = newId;
      cloned.position = { x: 100, y: 100 };
      setElements([...elements, cloned]);
      setSelectedId(cloned.id);
      return;
    }

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

      {/* Left Sidebar */}
      <aside className={`fixed top-8 left-8 bottom-8 w-[420px] flex flex-col glass rounded-[48px] border border-white/10 shadow-2xl z-40 transition-all duration-500 ease-in-out transform ${leftVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-center gap-4">
          <button onClick={() => setLeftPanelMode('studio')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'studio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-zinc-500 hover:text-white'}`}><Icon name="grid" size={16} /> Studio</button>
          <button onClick={() => setLeftPanelMode('inspector')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'inspector' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-zinc-500 hover:text-white'}`}><Icon name="settings" size={16} /> Inspector</button>
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
              libraryComponents={STANDARD_LIBRARY} 
              customComponents={customComponents}
              onInsert={insertFromLibrary} 
              onCreateCustom={handleCreateCustomComponent}
              onDeleteCustom={handleDeleteCustomComponent}
              isGenerating={agentStatus !== 'idle'}
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
                      selectedElement={selectedElement}
                      selectedId={selectedId} 
                      isGenerating={agentStatus !== 'idle'} 
                      refinementPrompt={''} 
                      setRefinementPrompt={() => {}} 
                      aiImagePrompt={''} 
                      setAiImagePrompt={() => {}} 
                      prompt={prompt} 
                      setPrompt={setPrompt} 
                      handleRefineImage={async (i) => {
                        const instr = i;
                        if (!instr?.trim() || !selectedId || !selectedElement?.content) return;
                        setAgentStatus('analyzing');
                        setAgentVisible(true);
                        try {
                          const url = await refineImageWithAI(selectedElement.content, instr);
                          updateContent(selectedId, url);
                          addHistory('ai', "Image processing complete. The visual assets have been updated.");
                        } finally { setAgentStatus('idle'); }
                      }} 
                      handleCreateAIImage={() => {}} 
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

      {!leftVisible && (
        <button onClick={() => setLeftVisible(true)} className="fixed top-1/2 left-8 -translate-y-1/2 w-14 h-14 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-indigo-600 hover:scale-110 transition-all"><Icon name="chevron-right" /></button>
      )}

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col bg-[#0c0c0e] relative">
        <Header 
          platform={platform} 
          setPlatform={setPlatform} 
          projectName={projectName} 
          onBuild={async () => { setAgentStatus('analyzing'); setCodeExport(await exportToCode(elements)); setAgentStatus('idle'); }} 
        />

        <div className="flex-1 overflow-hidden flex items-center justify-center p-20 bg-dot-pattern relative">
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

      {/* Right Sidebar: Visionary Agent */}
      <AgentPanel 
        visible={agentVisible} 
        onClose={() => setAgentVisible(false)} 
        selectedElement={selectedElement}
        history={agentHistory}
        status={agentStatus}
        prompt={prompt}
        setPrompt={setPrompt}
        onDispatch={handleGenerate}
      />

      <button onClick={() => setAgentVisible(!agentVisible)} className={`fixed top-1/2 right-8 -translate-y-1/2 w-14 h-14 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-indigo-600 hover:scale-110 transition-all ${agentVisible ? 'translate-x-full' : ''}`}><Icon name="sparkles" size={24} className={agentVisible ? 'text-white' : 'text-indigo-400'} /></button>

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
