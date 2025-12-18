
import React from 'react';

export type IconName = 'plus' | 'web' | 'mobile' | 'code' | 'undo' | 'redo' | 'sparkles' | 'trash' | 'chevron-right' | 'settings' | 'layers' | 'play' | 'info' | 'square' | 'type' | 'image' | 'layout' | 'mouse-pointer' | 'grid' | 'align-left' | 'align-center' | 'align-right' | 'align-justify' | 'bold' | 'italic' | 'underline' | 'maximize' | 'minimize' | 'opacity' | 'filter';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size = 20 }) => {
  const icons = {
    'plus': <path d="M5 12h14M12 5v14" />,
    'web': <rect width="20" height="16" x="2" y="4" rx="2" /><path d="M2 10h20M12 4v16" />,
    'mobile': <rect width="14" height="20" x="5" y="2" rx="2" /><path d="M12 18h.01" />,
    'code': <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />,
    'undo': <path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 3-7.7L3 13" />,
    'redo': <path d="M21 7v6h-6" /><path d="M21 13a9 9 0 1 1-3-7.7L21 13" />,
    'sparkles': <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />,
    'trash': <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    'chevron-right': <path d="m9 18 6-6-6-6" />,
    'settings': <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />,
    'layers': <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66z" /><path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" /><path d="m2.1 10.17 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" />,
    'play': <polygon points="6 3 20 12 6 21 6 3" />,
    'info': <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />,
    'square': <rect width="18" height="18" x="3" y="3" rx="2" />,
    'type': <path d="M4 7V4h16v3M9 20h6M12 4v16" />,
    'image': <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />,
    'layout': <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M9 21V9" />,
    'mouse-pointer': <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" />,
    'grid': <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" />,
    'align-left': <path d="M21 6H3M15 12H3M17 18H3" />,
    'align-center': <path d="M18 6H6M21 12H3M18 18H6" />,
    'align-right': <path d="M21 6H3M21 12H9M21 18H7" />,
    'align-justify': <path d="M21 6H3M21 12H3M21 18H3" />,
    'bold': <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />,
    'italic': <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />,
    'underline': <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />,
    'maximize': <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />,
    'minimize': <path d="M4 14h6m0 0v6m0-6-7 7m17-11h-6m0 0V4m0 6 7-7" />,
    'opacity': <circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M12 12h10" /><path d="M18 9l3 3-3 3" />,
    'filter': <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};
