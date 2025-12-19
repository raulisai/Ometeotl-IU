
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
  { type: 'button', name: 'Button', icon: 'square', description: 'Action' },
  { type: 'input', name: 'Input', icon: 'type', description: 'Field' },
  { type: 'card', name: 'Card', icon: 'square', description: 'Box' },
  { type: 'h1', name: 'Heading', icon: 'type', description: 'Title' },
  { type: 'img', name: 'Image', icon: 'image', description: 'Visual' },
  { type: 'table', name: 'Matrix', icon: 'grid', description: 'Data' },
];

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<Platform>(Platform.WEB);
  const [elements, setElements] = useState<UIElement[]>([]);
  const [pageStyle, setPageStyle] = useState<UIStyle>({ 
    backgroundColor: '#18181b', 
    width: '1000px', 
    height: '650px',
    borderRadius: '24px',
    boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.7)',
    borderWidth: '1px',
    borderColor: 'rgba(255,255,255,0.05)'
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<TaskStatus>('idle');
  const [agentHistory, setAgentHistory] = useState<AIAction[]>([]);
  const [prompt, setPrompt] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [aiImagePrompt, setAiImagePrompt] = useState('');
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
      const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
      const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
      setElements(prev => prev.map(el => el.id === selectedId ? { ...el, position: { x, y } } : el));
    };
    const onUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, selectedId, dragOffset]);

  const handleGenerate = async (p?: string, elementId?: string) => {
    const finalPrompt = p || prompt;
    if (!finalPrompt.trim()) return;
    const targetId = elementId || selectedId;
    const isScoped = targetId && targetId !== 'page-background';
    setAgentVisible(true);
    setAgentStatus('analyzing');
    try {
      if (isScoped) {
        const target = elements.find(e => e.id === targetId);
        if (target) {
          const updatedElement = await refineSpecificElement(target, finalPrompt);
          const newElements = elements.map(el => el.id === targetId ? updatedElement : el);
          setElements(newElements);
          saveToHistory({ elements: newElements, platform, projectName, pageStyle });
        }
      } else {
        const result = await generateFullUI(finalPrompt, platform, { elements, platform, projectName, pageStyle });
        setElements(result.elements);
        if (result.pageStyle) setPageStyle({ ...pageStyle, ...result.pageStyle });
        saveToHistory({ elements: result.elements, platform, projectName, pageStyle: { ...pageStyle, ...result.pageStyle } });
      }
      setPrompt('');
    } catch (err) {
      setAgentStatus('error');
    } finally {
      setAgentStatus('idle');
    }
  };

  if (hasKey === false) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="glass p-20 rounded-[64px] text-center border border-white/10 shadow-2xl">
          <Icon name="sparkles" size={80} className="text-indigo-500 mx-auto mb-10 animate-pulse" />
          <h1 className="text-5xl font-black mb-8 italic uppercase tracking-tighter">Vault Locked</h1>
          <button onClick={async () => { await (window as any).aistudio.openSelectKey(); setHasKey(true); }} className="px-16 py-6 bg-indigo-600 rounded-full font-black text-white uppercase tracking-widest hover:bg-indigo-500 transition-all">Unlock Visionary</button>
        </div>
      </div>
    );
  }

  const canvasContainerStyle = {
    ...pageStyle,
    width: platform === Platform.MOBILE ? '375px' : pageStyle.width || '1000px',
    height: platform === Platform.MOBILE ? '750px' : pageStyle.height || '650px',
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    position: 'relative' as const,
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden relative selection:bg-indigo-600 selection:text-white">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
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
      }} />

      <aside className={`fixed top-8 left-8 bottom-8 w-[400px] flex flex-col glass rounded-[48px] border border-white/10 shadow-2xl z-40 transition-all duration-500`}>
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <button onClick={() => setLeftPanelMode('studio')} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'studio' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Studio</button>
          <button onClick={() => setLeftPanelMode('inspector')} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${leftPanelMode === 'inspector' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>Inspector</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {leftPanelMode === 'studio' ? (
            <LeftSidebar 
              visible={true} setVisible={() => {}} elements={elements} selectedId={selectedId} setSelectedId={setSelectedId} 
              libraryComponents={STANDARD_LIBRARY} customComponents={customComponents}
              onInsert={(type, name, template) => {
                const isCustom = type === 'custom' && template;
                const isImg = type === 'img';
                const newEl: UIElement = { 
                  id: `el-${Date.now()}`, 
                  type, 
                  name: isCustom ? template.name : name, 
                  tailwindClasses: isCustom ? template.tailwindClasses : (isImg ? 'w-64 h-64 object-cover rounded-[32px]' : 'p-8 bg-white/5 rounded-[32px] text-white'), 
                  content: isCustom ? template.content : (isImg ? 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800' : name), 
                  position: { x: 50, y: 50 }, 
                  style: isCustom ? { ...template.style } : { opacity: 1, color: '#ffffff' } 
                };
                setElements([...elements, newEl]);
                setSelectedId(newEl.id);
              }} 
              onCreateCustom={async (p) => {
                setAgentStatus('designing');
                const tpl = await generateComponentTemplate(p);
                const newLibItem: LibraryComponent = { 
                  type: 'custom', 
                  name: tpl.name, 
                  icon: 'sparkles', 
                  template: tpl 
                };
                const updatedCustoms = [newLibItem, ...customComponents];
                setCustomComponents(updatedCustoms);
                localStorage.setItem('genui_custom_components', JSON.stringify(updatedCustoms));
                setAgentStatus('idle');
              }}
              onDeleteCustom={(n) => {
                const updatedCustoms = customComponents.filter(c => c.name !== n);
                setCustomComponents(updatedCustoms);
                localStorage.setItem('genui_custom_components', JSON.stringify(updatedCustoms));
              }}
              onDeleteElement={deleteElement} isGenerating={agentStatus !== 'idle'}
            />
          ) : (
            <div className="p-8 space-y-8">
              {selectedId ? (
                <>
                  <div className="flex bg-white/5 p-2 rounded-[24px]">
                    <button onClick={() => setInspectorMode('props')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'props' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}>Properties</button>
                    <button onClick={() => setInspectorMode('ai')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${inspectorMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}>IA Lab</button>
                  </div>
                  {inspectorMode === 'props' ? (
                    <PropertiesPanel selectedId={selectedId} selectedElement={selectedElement} isEnvSelected={isEnvSelected} isImageSelected={isImageSelected} pageStyle={pageStyle} updateStyle={updateStyle} updateContent={updateContent} onFileUpload={() => fileInputRef.current?.click()} />
                  ) : (
                    <AIStudioPanel 
                      isImageSelected={isImageSelected} selectedElement={selectedElement} selectedId={selectedId} isGenerating={agentStatus !== 'idle'} 
                      refinementPrompt={refinementPrompt} setRefinementPrompt={setRefinementPrompt} 
                      aiImagePrompt={aiImagePrompt} setAiImagePrompt={setAiImagePrompt} 
                      prompt={prompt} setPrompt={setPrompt} 
                      handleRefineImage={async (i) => {
                        if (!selectedElement?.content) return;
                        setAgentStatus('analyzing');
                        const url = await refineImageWithAI(selectedElement.content, i || refinementPrompt);
                        updateContent(selectedId!, url);
                        setAgentStatus('idle');
                        setRefinementPrompt('');
                      }} 
                      handleCreateAIImage={() => {}} handleGenerate={handleGenerate} updateStyle={updateStyle} updateContent={updateContent} onFileUpload={() => fileInputRef.current?.click()}
                    />
                  )}
                </>
              ) : <div className="text-center opacity-30 py-40 uppercase font-black text-[10px] tracking-[0.4em]">Select an element to refine</div>}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-20 ml-[400px] bg-[#0c0c0e] canvas-bg min-h-screen">
        <Header platform={platform} setPlatform={setPlatform} projectName={projectName} onBuild={async () => setCodeExport(await exportToCode(elements))} />
        <div className="flex-1 w-full flex items-center justify-center overflow-visible">
          <div ref={containerRef} style={canvasContainerStyle as any} className="relative bg-dot-pattern">
            <UIRenderer elements={elements} selectedId={selectedId} onSelect={setSelectedId} onDragStart={handleDragStart} />
          </div>
        </div>
      </main>

      <AgentPanel visible={agentVisible} onClose={() => setAgentVisible(false)} selectedElement={selectedElement} history={agentHistory} status={agentStatus} prompt={prompt} setPrompt={setPrompt} onDispatch={handleGenerate} />
      <button onClick={() => setAgentVisible(!agentVisible)} className={`fixed top-1/2 right-8 -translate-y-1/2 w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-50 hover:bg-indigo-600 hover:scale-110 transition-all ${agentVisible ? 'translate-x-full' : ''}`}><Icon name="sparkles" size={28} className={agentVisible ? 'text-white' : 'text-indigo-400'} /></button>
      {codeExport && <CodePortal code={codeExport} onClose={() => setCodeExport(null)} />}
    </div>
  );
};

export default App;
