/**
 * PhytoPathometric — LoadingContext
 * Global loading bar state — trigger from any component
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const startLoading = useCallback(() => setCount(c => c + 1), []);
  const stopLoading  = useCallback(() => setCount(c => Math.max(0, c - 1)), []);

  return (
    <LoadingContext.Provider value={{ isLoading: count > 0, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}
