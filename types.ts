
export enum Platform {
  WEB = 'web',
  MOBILE = 'mobile'
}

export interface UIStyle {
  // Layout
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  backgroundAttachment?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  
  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: string;
  
  // Borders
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  
  // Sizing
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  
  // Effects
  opacity?: number;
  boxShadow?: string;
  backdropFilter?: string;
  filter?: string;
  mixBlendMode?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  
  // Animations
  animation?: string;
  transition?: string;
  transform?: string;
}

export interface UIElement {
  id: string;
  type: string;
  name: string;
  tailwindClasses: string;
  content: string;
  children?: UIElement[];
  style?: UIStyle;
  position?: { x: number; y: number };
  isLocked?: boolean;
}

export interface CanvasState {
  elements: UIElement[];
  platform: Platform;
  projectName: string;
  selectedElementId?: string | null;
  pageStyle?: UIStyle;
}

export interface HistoryItem {
  state: CanvasState;
  timestamp: number;
}

export interface LibraryComponent {
  type: string;
  name: string;
  icon: any;
  description: string;
  isCustom?: boolean;
  template?: UIElement;
}

export interface AIAction {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: number;
  targetElementName?: string;
}

export type TaskStatus = 'idle' | 'analyzing' | 'designing' | 'applying' | 'error';
