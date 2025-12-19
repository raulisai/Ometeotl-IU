
import React from 'react';
import { UIElement } from '../types';

interface UIRendererProps {
  elements: UIElement[];
  selectedId?: string | null;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
}

export const UIRenderer: React.FC<UIRendererProps> = ({ elements, selectedId, onSelect, onDragStart }) => {
  const renderElement = (el: UIElement) => {
    const Tag = (el.type === 'section' || el.type === 'div' || el.type === 'card' || el.type === 'custom' || el.type === 'mascot') ? 'div' : el.type as any;
    const ValidTag = ['div', 'section', 'nav', 'header', 'footer', 'button', 'a', 'h1', 'h2', 'h3', 'p', 'span', 'img', 'input', 'form', 'label'].includes(Tag) ? Tag : 'div';

    const isSelected = selectedId === el.id;
    const isImage = ValidTag === 'img';
    const isInput = ValidTag === 'input';
    const isVoid = ['img', 'input', 'br', 'hr'].includes(ValidTag);

    // Prioritize background gradient
    const backgroundImageValue = (el.style?.backgroundGradient && el.style.backgroundGradient !== 'none') 
      ? el.style.backgroundGradient 
      : el.style?.backgroundImage;

    const combinedStyle: React.CSSProperties = {
      ...(el.style as any),
      position: 'absolute',
      left: el.position?.x ?? 0,
      top: el.position?.y ?? 0,
      objectFit: isImage ? (el.style?.objectFit || 'cover') : undefined,
      cursor: isSelected ? 'move' : 'default',
      userSelect: 'none',
      backgroundImage: backgroundImageValue,
      backgroundSize: el.style?.backgroundSize,
      backgroundRepeat: el.style?.backgroundRepeat,
      backgroundPosition: el.style?.backgroundPosition,
      animation: el.style?.animation,
    };

    const commonProps = {
      key: el.id,
      style: combinedStyle,
      className: `${el.tailwindClasses} transition-all duration-300 relative ${isSelected ? 'ring-2 ring-indigo-500 z-[100]' : 'hover:ring-1 hover:ring-indigo-300'}`,
      onMouseDown: (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(el.id, e);
        onDragStart(el.id, e);
      },
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
    };

    if (isImage) {
      return (
        <img 
          {...commonProps} 
          src={el.content && el.content !== "null" ? el.content : "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60"} 
          alt={el.name}
        />
      );
    }

    if (isInput) {
      return (
        <div key={el.id} className="relative inline-block" style={{ position: 'absolute', left: el.position?.x, top: el.position?.y }}>
          <input 
            {...commonProps} 
            style={{ ...combinedStyle, position: 'relative', left: 0, top: 0 }}
            placeholder={el.content}
            readOnly
          />
          <div className="absolute inset-0 z-10 cursor-move" onMouseDown={commonProps.onMouseDown} />
        </div>
      );
    }

    const isHtmlContent = el.content && typeof el.content === 'string' && (el.content.trim().startsWith('<') || el.content.trim().includes('</') || el.content.trim().includes('<table'));

    return (
      <ValidTag {...commonProps}>
        {isSelected && (
          <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase z-[110] shadow-md pointer-events-none whitespace-nowrap">
            {el.name}
          </div>
        )}
        
        {!isVoid && el.content && el.content !== "null" && (
          isHtmlContent ? (
            <div className="w-full h-full pointer-events-none overflow-auto" dangerouslySetInnerHTML={{ __html: el.content }} />
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
