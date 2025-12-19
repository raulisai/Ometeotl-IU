
import React from 'react';
import { UIElement } from '../types';

interface UIRendererProps {
  elements: UIElement[];
  selectedId?: string | null;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onUpdateContent?: (id: string, content: string) => void;
  isDragging?: boolean;
  canvasDimensions?: { width: number; height: number };
}

export const UIRenderer: React.FC<UIRendererProps> = ({ 
  elements, 
  selectedId, 
  onSelect, 
  onDragStart, 
  onUpdateContent, 
  isDragging,
  canvasDimensions 
}) => {
  const renderElement = (el: UIElement) => {
    const Tag = (el.type === 'section' || el.type === 'div' || el.type === 'card' || el.type === 'custom' || el.type === 'carousel' || el.type === 'nav' || el.type === 'table') ? 'div' : el.type as any;
    const ValidTag = ['div', 'section', 'nav', 'header', 'footer', 'button', 'a', 'h1', 'h2', 'h3', 'p', 'span', 'img', 'input', 'form', 'label'].includes(Tag) ? Tag : 'div';

    const isSelected = selectedId === el.id;
    const isImage = ValidTag === 'img';
    const isInput = ValidTag === 'input';
    const isVoid = ['img', 'input', 'br', 'hr'].includes(ValidTag);

    const x = el.position?.x ?? 0;
    const y = el.position?.y ?? 0;

    // Obtener dimensiones reales del elemento para las guías
    // Nota: Como no tenemos ref real aquí, usamos estimaciones o clases de tailwind
    // En un sistema real usaríamos useLayoutEffect
    const elWidth = 250; // Estimación base
    const elHeight = 50; // Estimación base

    const backgroundImageValue = (el.style?.backgroundGradient && el.style.backgroundGradient !== 'none') 
      ? el.style.backgroundGradient 
      : el.style?.backgroundImage;

    const combinedStyle: React.CSSProperties = {
      ...(el.style as any),
      position: 'absolute',
      left: x,
      top: y,
      objectFit: isImage ? (el.style?.objectFit || 'cover') : undefined,
      cursor: isSelected ? 'move' : 'default',
      userSelect: isInput ? 'auto' : 'none',
      backgroundImage: backgroundImageValue,
      backgroundSize: el.style?.backgroundSize,
      backgroundRepeat: el.style?.backgroundRepeat,
      backgroundPosition: el.style?.backgroundPosition,
      animation: el.style?.animation,
      filter: el.style?.filter,
      zIndex: isSelected ? 100 : 1,
    };

    const commonProps = {
      key: el.id,
      style: combinedStyle,
      className: `${el.tailwindClasses} transition-[border,box-shadow,transform] duration-300 relative ${isSelected ? 'ring-2 ring-indigo-500 shadow-2xl scale-[1.01]' : 'hover:ring-1 hover:ring-indigo-300/50'}`,
      onMouseDown: (e: React.MouseEvent) => {
        if (isInput && isSelected && e.detail > 1) return; // Permitir doble click para editar texto
        e.stopPropagation();
        onSelect(el.id, e);
        onDragStart(el.id, e);
      },
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
    };

    // GUIAS DE MOVIMIENTO (FIGMA STYLE)
    const renderGuides = () => {
      if (!isSelected || !isDragging || !canvasDimensions) return null;
      
      const { width: cw, height: ch } = canvasDimensions;
      const rightDist = Math.round(cw - x);
      const bottomDist = Math.round(ch - y);

      return (
        <div className="absolute inset-0 pointer-events-none z-[150]">
          {/* Línea horizontal (Eje X / Izquierda) */}
          <div className="absolute border-t border-dashed border-indigo-500/50" style={{ left: -x, top: 0, width: x }} />
          <div className="absolute -left-[x] top-0 -translate-y-1/2 bg-indigo-600 text-[8px] text-white px-1 rounded-sm font-bold shadow-sm" style={{ left: -(x/2) }}>{Math.round(x)}px</div>

          {/* Línea vertical (Eje Y / Arriba) */}
          <div className="absolute border-l border-dashed border-indigo-500/50" style={{ left: 0, top: -y, height: y }} />
          <div className="absolute top-0 left-0 -translate-x-1/2 bg-indigo-600 text-[8px] text-white px-1 rounded-sm font-bold shadow-sm" style={{ top: -(y/2) }}>{Math.round(y)}px</div>
          
          {/* Indicador de coordenadas en la esquina del elemento */}
          <div className="absolute -top-10 -left-2 bg-zinc-900 border border-white/20 text-[9px] text-white px-2 py-1 rounded-lg flex gap-2 shadow-2xl">
             <span className="text-zinc-500">X</span> <b>{Math.round(x)}</b>
             <span className="text-zinc-500">Y</span> <b>{Math.round(y)}</b>
          </div>
        </div>
      );
    };

    const selectionLabel = isSelected && !isDragging && (
      <div 
        style={{ 
          position: 'absolute', 
          left: x, 
          top: y - 24,
          zIndex: 120 
        }} 
        className="bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase shadow-md pointer-events-none whitespace-nowrap"
      >
        {el.name}
      </div>
    );

    if (isImage) {
      const src = el.content && el.content !== "null" && el.content !== "Image"
        ? el.content 
        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60";
        
      return (
        <React.Fragment key={el.id}>
          <img 
            {...commonProps} 
            src={src} 
            alt={el.name}
            draggable={false}
          />
          {selectionLabel}
          {renderGuides()}
        </React.Fragment>
      );
    }

    if (isInput) {
      return (
        <React.Fragment key={el.id}>
          <input 
            {...commonProps} 
            placeholder={el.name}
            value={el.content && el.content !== "null" ? el.content : ""}
            onChange={(e) => onUpdateContent?.(el.id, e.target.value)}
          />
          {selectionLabel}
          {renderGuides()}
        </React.Fragment>
      );
    }

    const isHtmlContent = el.content && typeof el.content === 'string' && (el.content.trim().startsWith('<') || el.content.trim().includes('</'));

    return (
      <ValidTag {...commonProps}>
        {isSelected && !isDragging && (
          <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase z-[110] shadow-md pointer-events-none whitespace-nowrap">
            {el.name}
          </div>
        )}
        
        {renderGuides()}

        {!isVoid && el.content && el.content !== "null" && (
          isHtmlContent ? (
            <div className="w-full h-full pointer-events-none overflow-hidden" dangerouslySetInnerHTML={{ __html: el.content }} />
          ) : (
            el.content
          )
        )}
        
        {!isVoid && el.children && el.children.map(child => renderElement(child))}
      </ValidTag>
    );
  };

  return <div className="relative w-full h-full min-h-full">{elements.map(renderElement)}</div>;
};
