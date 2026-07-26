/**
 * PhytoPathometric — Home Page
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, ALL_TABS, TabId } from '@/components/BottomNav';
import { AnalisarTab } from './tabs/AnalisarTab';
import { HistoricoTab } from './tabs/HistoricoTab';
import { DoencasTab } from './tabs/DoencasTab';
import { SobreTab } from './tabs/SobreTab';
import { ConfiguracoesTab } from './tabs/ConfiguracoesTab';
import { DashboardTab } from './tabs/DashboardTab';
import { GaleriaTab } from './tabs/GaleriaTab';
import { AlertasTab } from './tabs/AlertasTab';
import { CalendarioTab } from './tabs/CalendarioTab';
import { RelatorioTab } from './tabs/RelatorioTab';
import { AnalysisProvider } from '@/contexts/AnalysisContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useLocation } from 'wouter';

const TAB_TITLES: Record<TabId, string> = {
  dashboard: 'Dashboard', analisar: 'Analisar', historico: 'Histórico',
  galeria: 'Galeria', alertas: 'Alertas', calendario: 'Calendário',
  relatorio: 'Relatório', doencas: 'Doenças', sobre: 'Sobre', configuracoes: 'Configurações',
};

const TAB_ORDER: TabId[] = ['dashboard','analisar','historico','galeria','alertas','calendario','relatorio','doencas','sobre','configuracoes'];

const tabVariants = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [direction, setDirection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  const handleTabChange = (tab: TabId) => {
    const ci = TAB_ORDER.indexOf(activeTab);
    const ni = TAB_ORDER.indexOf(tab);
    setDirection(ni > ci ? 1 : -1);
    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-background flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/60">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                alt="PhytoPathometric" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-base text-foreground leading-tight">PhytoPathometric</h1>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">{TAB_TITLES[activeTab]}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {/* Dark mode toggle */}
              {toggleTheme && (
                <button onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
                </button>
              )}
              {/* Menu button */}
              <button onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              {/* Logout */}
              {user && (
                <button onClick={() => { logout(); navigate('/'); }}
                  title={`Sair (${user.name})`}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Slide-down Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="fixed top-[57px] left-0 right-0 z-30 bg-card border-b border-border shadow-lg max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-1 p-3">
                {ALL_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}>
                      <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              {user && (
                <div className="px-4 pb-3 pt-1 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Logado como <strong className="text-foreground">{user.name}</strong>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop */}
        {menuOpen && (
          <div className="fixed inset-0 z-20 bg-black/20" onClick={() => setMenuOpen(false)} />
        )}

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          <div className="max-w-lg mx-auto px-4 pt-4 pb-24 overflow-y-auto h-[calc(100vh-57px-64px)] scroll-smooth">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={activeTab} custom={direction} variants={tabVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}>
                {activeTab === 'dashboard'    && <DashboardTab />}
                {activeTab === 'analisar'     && <AnalisarTab />}
                {activeTab === 'historico'    && <HistoricoTab />}
                {activeTab === 'galeria'      && <GaleriaTab />}
                {activeTab === 'alertas'      && <AlertasTab />}
                {activeTab === 'calendario'   && <CalendarioTab />}
                {activeTab === 'relatorio'    && <RelatorioTab />}
                {activeTab === 'doencas'      && <DoencasTab />}
                {activeTab === 'sobre'        && <SobreTab />}
                {activeTab === 'configuracoes' && <ConfiguracoesTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </AnalysisProvider>
  );
}
