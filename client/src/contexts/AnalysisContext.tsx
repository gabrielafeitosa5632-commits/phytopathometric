/**
 * PhytoPathometric — AgTech Dashboard Moderno
 * Context: Gerencia estado global de análises, histórico e configurações
 * Colors: Emerald forest green primary, cream background
 * Font: Plus Jakarta Sans + Syne
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type SeverityLevel = 'saudavel' | 'baixa' | 'media' | 'alta' | 'critica';

export interface AnalysisResult {
  id: string;
  timestamp: Date;
  cultura: string;
  severidade: number;
  areaTotal: number;
  areaLesionada: number;
  areaSaudavel: number;
  nivel: SeverityLevel;
  imageDataUrl?: string;
  processedImageDataUrl?: string;
  observacoes?: string;
}

export interface AnalysisSettings {
  hsvMinH: number;
  hsvMaxH: number;
  hsvMinS: number;
  hsvMaxS: number;
  hsvMinV: number;
  hsvMaxV: number;
  labLMin: number;
  labLMax: number;
  labAMin: number;
  labAMax: number;
  labBMin: number;
  labBMax: number;
}

interface AnalysisContextType {
  currentAnalysis: AnalysisResult | null;
  history: AnalysisResult[];
  isAnalyzing: boolean;
  settings: AnalysisSettings;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  setIsAnalyzing: (v: boolean) => void;
  updateSettings: (s: Partial<AnalysisSettings>) => void;
  exportCSV: () => void;
  exportXLSX: () => void;
}

const defaultSettings: AnalysisSettings = {
  hsvMinH: 25, hsvMaxH: 85,
  hsvMinS: 30, hsvMaxS: 255,
  hsvMinV: 30, hsvMaxV: 255,
  labLMin: 20, labLMax: 90,
  labAMin: -20, labAMax: 40,
  labBMin: -10, labBMax: 50,
};

const AnalysisContext = createContext<AnalysisContextType | null>(null);

const STORAGE_KEY = 'phytopathometric_history';

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState<AnalysisSettings>(defaultSettings);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.map((item: AnalysisResult) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      // Save without image data to avoid storage limits
      const toSave = history.map(({ imageDataUrl: _img, processedImageDataUrl: _proc, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [history]);

  const addToHistory = useCallback((analysis: AnalysisResult) => {
    setHistory(prev => [analysis, ...prev].slice(0, 100));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateSettings = useCallback((s: Partial<AnalysisSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const exportCSV = useCallback(() => {
    if (history.length === 0) return;
    const headers = ['ID', 'Data', 'Hora', 'Cultura', 'Severidade (%)', 'Área Total (px)', 'Área Lesionada (px)', 'Área Saudável (px)', 'Nível', 'Observações'];
    const rows = history.map(item => [
      item.id,
      new Date(item.timestamp).toLocaleDateString('pt-BR'),
      new Date(item.timestamp).toLocaleTimeString('pt-BR'),
      item.cultura,
      item.severidade.toFixed(2),
      item.areaTotal,
      item.areaLesionada,
      item.areaSaudavel,
      item.nivel,
      item.observacoes || '',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phytopathometric_historico_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  const exportXLSX = useCallback(() => {
    if (history.length === 0) return;
    // Simple TSV export as XLSX fallback (opens in Excel)
    const headers = ['ID', 'Data', 'Hora', 'Cultura', 'Severidade (%)', 'Área Total (px)', 'Área Lesionada (px)', 'Área Saudável (px)', 'Nível', 'Observações'];
    const rows = history.map(item => [
      item.id,
      new Date(item.timestamp).toLocaleDateString('pt-BR'),
      new Date(item.timestamp).toLocaleTimeString('pt-BR'),
      item.cultura,
      item.severidade.toFixed(2),
      item.areaTotal,
      item.areaLesionada,
      item.areaSaudavel,
      item.nivel,
      item.observacoes || '',
    ]);
    const tsv = [headers, ...rows].map(row => row.join('\t')).join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phytopathometric_historico_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  return (
    <AnalysisContext.Provider value={{
      currentAnalysis, history, isAnalyzing, settings,
      setCurrentAnalysis, addToHistory, clearHistory, removeFromHistory,
      setIsAnalyzing, updateSettings, exportCSV, exportXLSX,
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
  return ctx;
}

// Utility: classify severity level
export function classifySeverity(pct: number): SeverityLevel {
  if (pct < 10) return 'saudavel';
  if (pct < 25) return 'baixa';
  if (pct < 50) return 'media';
  if (pct < 75) return 'alta';
  return 'critica';
}

export const severityConfig: Record<SeverityLevel, {
  label: string;
  range: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  saudavel: {
    label: 'Saudável',
    range: '0–9%',
    description: 'Planta sem sinais de doença',
    color: '#22C55E',
    bgColor: '#F0FDF4',
    textColor: '#15803D',
    borderColor: '#BBF7D0',
  },
  baixa: {
    label: 'Baixa',
    range: '10–24%',
    description: 'Sintomas iniciais, monitorar',
    color: '#84CC16',
    bgColor: '#F7FEE7',
    textColor: '#4D7C0F',
    borderColor: '#D9F99D',
  },
  media: {
    label: 'Média',
    range: '25–49%',
    description: 'Tratamento recomendado',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    textColor: '#B45309',
    borderColor: '#FDE68A',
  },
  alta: {
    label: 'Alta',
    range: '50–74%',
    description: 'Tratamento urgente necessário',
    color: '#F97316',
    bgColor: '#FFF7ED',
    textColor: '#C2410C',
    borderColor: '#FED7AA',
  },
  critica: {
    label: 'Crítica',
    range: '75–100%',
    description: 'Dano severo, intervenção imediata',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    textColor: '#B91C1C',
    borderColor: '#FECACA',
  },
};
