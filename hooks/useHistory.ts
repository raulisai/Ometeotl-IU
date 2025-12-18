
import { useState, useCallback } from 'react';
import { HistoryItem, CanvasState } from '../types';

export const useHistory = (initialState: CanvasState) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const saveToHistory = useCallback((state: CanvasState) => {
    setHistory(prev => {
      const newItem: HistoryItem = {
        state: JSON.parse(JSON.stringify(state)),
        timestamp: Date.now()
      };
      return [newItem, ...prev].slice(0, 20);
    });
  }, []);

  return { history, saveToHistory };
};
