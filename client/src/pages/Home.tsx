/**
 * PhytoPathometric — Home Page
 * Responsive: Mobile = bottom nav | Desktop = left sidebar
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, ALL_TABS, TabId } from '@/components/BottomNav';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
import { useI18n } from '@/contexts/I18nContext';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useLocation } from 'wouter';

const TAB_ORDER: TabId[] = ['dashboard','analisar','historico','galeria','alertas','calendario','relatorio','doencas','sobre','configuracoes'];

const tabVariants = {
  enter: (d: number) => ({ x: d > 0 ? 30 : -30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -30 : 30, opacity: 0 }),
};

function TabContent({ activeTab }: { activeTab: TabId }) {
  return (
    <>
      {activeTab === 'dashboard'     && <DashboardTab />}
      {activeTab === 'analisar'      && <AnalisarTab />}
      {activeTab === 'historico'     && <HistoricoTab />}
      {activeTab === 'galeria'       && <GaleriaTab />}
      {activeTab === 'alertas'       && <AlertasTab />}
      {activeTab === 'calendario'    && <CalendarioTab />}
      {activeTab === 'relatorio'     && <RelatorioTab />}
      {activeTab === 'doencas'       && <DoencasTab />}
      {activeTab === 'sobre'         && <SobreTab />}
      {activeTab === 'configuracoes' && <ConfiguracoesTab />}
    </>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [direction, setDirection] = useState(0);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const [, navigate] = useLocation();

  const handleTabChange = (tab: TabId) => {
    const ci = TAB_ORDER.indexOf(activeTab);
    const ni = TAB_ORDER.indexOf(tab);
    setDirection(ni > ci ? 1 : -1);
    setActiveTab(tab);
  };

  const activeLabel = ALL_TABS.find(t => t.id === activeTab)?.label ?? '';

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-background flex">

        {/* ── DESKTOP SIDEBAR ─────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                alt="PhytoPathometric" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-sidebar-foreground leading-tight">PhytoPathometric</p>
              <p className="text-[10px] text-sidebar-foreground/50">AgTech v1.0</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {ALL_TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => handleTabChange(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}>
                  {isActive && (
                    <motion.div layoutId="sideActive" className="absolute inset-0 rounded-xl bg-sidebar-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className="relative z-10 flex-shrink-0" />
                  <span className="relative z-10">{label}</span>
                  {isActive && <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
            {/* Language switcher */}
            <div className="flex items-center gap-2 px-2">
              <span className="text-xs text-sidebar-foreground/50 flex-1">{t('settings.language')}</span>
              <LanguageSwitcher />
            </div>
            {/* Dark mode */}
            {toggleTheme && (
              <button onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all">
                {theme === 'dark'
                  ? <Sun size={16} className="text-amber-400 flex-shrink-0" />
                  : <Moon size={16} className="flex-shrink-0" />}
                <span>{t('settings.darkMode')}</span>
              </button>
            )}
            {/* User info */}
            {user && (
              <div className="flex items-center gap-2.5 px-2 pt-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, oklch(0.52 0.14 155), oklch(0.32 0.09 155))' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
                </div>
              </div>
            )}
            {/* Logout */}
            <button onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={16} className="flex-shrink-0" />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN AREA ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/60">
            <div className="px-4 py-3 flex items-center gap-3 max-w-2xl mx-auto lg:max-w-none">
              {/* Logo — mobile only */}
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 lg:hidden">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                  alt="PhytoPathometric" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-base text-foreground leading-tight lg:hidden">PhytoPathometric</h1>
                <p className="text-[10px] text-muted-foreground leading-tight truncate lg:text-sm lg:font-semibold lg:text-foreground">
                  {activeLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">{t('common.active')}</span>

                {/* Language switcher — mobile/tablet only (desktop has sidebar) */}
                <div className="lg:hidden">
                  <LanguageSwitcher />
                </div>

                {/* Dark mode — mobile only */}
                {toggleTheme && (
                  <button onClick={toggleTheme}
                    className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                  </button>
                )}

                {/* Logout — mobile only */}
                {user && (
                  <button onClick={() => { logout(); navigate('/'); }}
                    className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-hidden">
            <div className="
              h-[calc(100vh-57px-64px)] lg:h-[calc(100vh-57px)]
              overflow-y-auto scroll-smooth
              px-4 sm:px-6 lg:px-8
              pt-4 pb-24 lg:pb-8
              max-w-2xl mx-auto lg:max-w-3xl xl:max-w-4xl lg:mx-0
            ">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={activeTab} custom={direction} variants={tabVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.18, ease: 'easeInOut' }}>
                  <TabContent activeTab={activeTab} />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV ─────────────────────────────────── */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </AnalysisProvider>
  );
}
