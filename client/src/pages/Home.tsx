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
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen shadow-[1px_0_0_0_oklch(0.28_0.06_155)]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-[18px] border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                alt="PhytoPathometric" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-display font-bold text-[13px] text-sidebar-foreground leading-tight tracking-tight">PhytoPathometric</p>
              <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">AgTech · v1.0</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
            {ALL_TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => handleTabChange(id)}
                  className={`w-full flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-semibold transition-all duration-150 relative group ${
                    isActive
                      ? 'text-sidebar-foreground'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/40'
                  }`}>
                  {isActive && (
                    <motion.div layoutId="sideActive" className="absolute inset-0 rounded-xl bg-sidebar-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                  )}
                  <Icon size={16} strokeWidth={isActive ? 2.3 : 1.8} className="relative z-10 flex-shrink-0" />
                  <span className="relative z-10 tracking-tight">{label}</span>
                  {isActive && (
                    <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-2.5 py-3 border-t border-sidebar-border space-y-1">
            {/* Language */}
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-[11px] text-sidebar-foreground/40 flex-1 font-medium">{t('settings.language')}</span>
              <LanguageSwitcher />
            </div>
            {/* Dark mode */}
            {toggleTheme && (
              <button onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-semibold text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/80 transition-all">
                {theme === 'dark'
                  ? <Sun size={15} className="text-amber-400 flex-shrink-0" />
                  : <Moon size={15} className="flex-shrink-0" />}
                <span>{t('settings.darkMode')}</span>
              </button>
            )}
            {/* User info */}
            {user && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sidebar-accent/30 mt-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, oklch(0.52 0.14 155), oklch(0.32 0.09 155))' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-sidebar-foreground/40 truncate">{user.email}</p>
                </div>
              </div>
            )}
            {/* Logout */}
            <button onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-3 py-[9px] rounded-xl text-[13px] font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={15} className="flex-shrink-0" />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN AREA ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <header className="sticky top-0 z-40 bg-card/98 backdrop-blur-md border-b border-border/50" style={{ boxShadow: '0 1px 0 0 oklch(0.90 0.015 140)' }}>
            <div className="px-5 py-3 flex items-center gap-3">
              {/* Logo — mobile only */}
              <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 lg:hidden ring-1 ring-border">
                <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                  alt="PhytoPathometric" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Mobile: app name */}
                <p className="font-display font-bold text-sm text-foreground leading-tight lg:hidden">PhytoPathometric</p>
                {/* Desktop: page title */}
                <div className="hidden lg:flex items-center gap-2">
                  <h1 className="font-display font-bold text-base text-foreground tracking-tight">{activeLabel}</h1>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-muted-foreground lg:hidden">{activeLabel}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Active dot — mobile */}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse lg:hidden" />

                {/* Language — mobile only */}
                <div className="lg:hidden">
                  <LanguageSwitcher />
                </div>

                {/* Dark mode — mobile only */}
                {toggleTheme && (
                  <button onClick={toggleTheme}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                  </button>
                )}

                {/* User avatar — mobile */}
                {user && (
                  <div className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, oklch(0.52 0.14 155), oklch(0.30 0.09 155))' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-hidden bg-background">
            <div className="
              h-[calc(100vh-53px-60px)] lg:h-[calc(100vh-53px)]
              overflow-y-auto scroll-smooth
              px-4 sm:px-5 lg:px-8
              pt-5 pb-24 lg:pb-10
              max-w-2xl mx-auto lg:max-w-none
            ">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={activeTab} custom={direction} variants={tabVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.15, ease: 'easeInOut' }}>
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
