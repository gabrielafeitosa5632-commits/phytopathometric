/**
 * PhytoPathometric — i18n Context
 * Supports: English (en) | Português (pt)
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export type Lang = 'pt' | 'en';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  pt: {
    // Nav
    'nav.dashboard':    'Dashboard',
    'nav.analyze':      'Analisar',
    'nav.history':      'Histórico',
    'nav.gallery':      'Galeria',
    'nav.alerts':       'Alertas',
    'nav.calendar':     'Calendário',
    'nav.report':       'Relatório',
    'nav.diseases':     'Doenças',
    'nav.about':        'Sobre',
    'nav.settings':     'Config.',
    // Common
    'common.active':    'Ativo',
    'common.logout':    'Sair',
    'common.save':      'Salvar',
    'common.cancel':    'Cancelar',
    'common.confirm':   'Confirmar',
    'common.delete':    'Excluir',
    'common.export':    'Exportar',
    'common.loading':   'Carregando...',
    'common.noData':    'Sem dados',
    'common.loggedAs':  'Logado como',
    // Analyze
    'analyze.title':    'Análise Fitopatométrica',
    'analyze.subtitle': 'Quantificação de Severidade',
    'analyze.culture':  'Cultura Avaliada',
    'analyze.image':    'Imagem Foliar',
    'analyze.notes':    'Observações',
    'analyze.btn':      'Analisar Folha',
    'analyze.analyzing':'Processando...',
    'analyze.gallery':  'Galeria',
    'analyze.camera':   'Câmera ao Vivo',
    'analyze.saved':    'Análise salva no histórico',
    'analyze.diagnosis':'Diagnóstico Provável',
    'analyze.recs':     'Recomendações',
    'analyze.immediate':'Imediatas',
    'analyze.preventive':'Preventivas',
    'analyze.monitoring':'Monitoramento',
    // History
    'history.title':    'Histórico de Análises',
    'history.analyses': 'análises registradas',
    'history.avgSev':   'severidade média',
    'history.maxSev':   'máxima registrada',
    'history.clear':    'Limpar histórico',
    'history.confirmClear': 'Confirmar exclusão?',
    'history.empty':    'Nenhuma análise registrada',
    // Settings
    'settings.title':   'Configurações',
    'settings.hsv':     'Segmentação Foliar — HSV',
    'settings.lab':     'Detecção de Lesões — CIELAB',
    'settings.presets': 'Presets por Tipo de Lesão',
    'settings.reset':   'Restaurar Padrões',
    'settings.darkMode':'Modo Escuro',
    'settings.language':'Idioma',
    // Dashboard
    'dash.stats':       'Estatísticas',
    'dash.avgSev':      'Sev. Média',
    'dash.maxSev':      'Máxima',
    'dash.minSev':      'Mínima',
    'dash.total':       'Total Análises',
    'dash.trend':       'Evolução (últimas 10)',
    'dash.byCulture':   'Sev. Média por Cultura',
    'dash.topCrops':    'Top Culturas',
    'dash.noData':      'Nenhuma análise ainda',
    'dash.weather':     '🌤️ Condições Climáticas',
    // Report
    'report.title':     'Gerar Relatório',
    'report.field':     'Nome do Campo / Talhão',
    'report.notes':     'Observações',
    'report.generate':  'Gerar Relatório PDF',
    'report.success':   'Relatório gerado!',
  },
  en: {
    // Nav
    'nav.dashboard':    'Dashboard',
    'nav.analyze':      'Analyze',
    'nav.history':      'History',
    'nav.gallery':      'Gallery',
    'nav.alerts':       'Alerts',
    'nav.calendar':     'Calendar',
    'nav.report':       'Report',
    'nav.diseases':     'Diseases',
    'nav.about':        'About',
    'nav.settings':     'Settings',
    // Common
    'common.active':    'Active',
    'common.logout':    'Logout',
    'common.save':      'Save',
    'common.cancel':    'Cancel',
    'common.confirm':   'Confirm',
    'common.delete':    'Delete',
    'common.export':    'Export',
    'common.loading':   'Loading...',
    'common.noData':    'No data',
    'common.loggedAs':  'Logged in as',
    // Analyze
    'analyze.title':    'Phytopathometric Analysis',
    'analyze.subtitle': 'Severity Quantification',
    'analyze.culture':  'Evaluated Crop',
    'analyze.image':    'Leaf Image',
    'analyze.notes':    'Observations',
    'analyze.btn':      'Analyze Leaf',
    'analyze.analyzing':'Processing...',
    'analyze.gallery':  'Gallery',
    'analyze.camera':   'Live Camera',
    'analyze.saved':    'Analysis saved to history',
    'analyze.diagnosis':'Probable Diagnosis',
    'analyze.recs':     'Recommendations',
    'analyze.immediate':'Immediate',
    'analyze.preventive':'Preventive',
    'analyze.monitoring':'Monitoring',
    // History
    'history.title':    'Analysis History',
    'history.analyses': 'analyses recorded',
    'history.avgSev':   'avg severity',
    'history.maxSev':   'max recorded',
    'history.clear':    'Clear history',
    'history.confirmClear': 'Confirm deletion?',
    'history.empty':    'No analyses recorded',
    // Settings
    'settings.title':   'Settings',
    'settings.hsv':     'Leaf Segmentation — HSV',
    'settings.lab':     'Lesion Detection — CIELAB',
    'settings.presets': 'Presets by Lesion Type',
    'settings.reset':   'Reset to Defaults',
    'settings.darkMode':'Dark Mode',
    'settings.language':'Language',
    // Dashboard
    'dash.stats':       'Statistics',
    'dash.avgSev':      'Avg Severity',
    'dash.maxSev':      'Maximum',
    'dash.minSev':      'Minimum',
    'dash.total':       'Total Analyses',
    'dash.trend':       'Trend (last 10)',
    'dash.byCulture':   'Avg Severity by Crop',
    'dash.topCrops':    'Top Crops',
    'dash.noData':      'No analyses yet',
    'dash.weather':     '🌤️ Weather Conditions',
    // Report
    'report.title':     'Generate Report',
    'report.field':     'Field / Plot Name',
    'report.notes':     'Observations',
    'report.generate':  'Generate PDF Report',
    'report.success':   'Report generated!',
  },
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('phyto_lang') as Lang) || 'pt';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('phyto_lang', l);
  }, []);

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS['pt'][key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
