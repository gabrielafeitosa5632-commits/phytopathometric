/**
 * PhytoPathometric — Home (Premium Layout)
 * Glassmorphism sidebar + animated transitions + responsive
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, ALL_TABS, TabId } from '@/components/BottomNav';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AnalisarTab }     from './tabs/AnalisarTab';
import { HistoricoTab }    from './tabs/HistoricoTab';
import { DoencasTab }      from './tabs/DoencasTab';
import { SobreTab }        from './tabs/SobreTab';
import { ConfiguracoesTab }from './tabs/ConfiguracoesTab';
import { DashboardTab }    from './tabs/DashboardTab';
import { GaleriaTab }      from './tabs/GaleriaTab';
import { AlertasTab }      from './tabs/AlertasTab';
import { CalendarioTab }   from './tabs/CalendarioTab';
import { RelatorioTab }    from './tabs/RelatorioTab';
import { AnalysisProvider }from '@/contexts/AnalysisContext';
import { useAuth }         from '@/contexts/AuthContext';
import { useTheme }        from '@/contexts/ThemeContext';
import { useI18n }         from '@/contexts/I18nContext';
import { LogOut, Sun, Moon, Leaf, Sparkles } from 'lucide-react';
import { useLocation }     from 'wouter';

const TAB_ORDER: TabId[] = [
  'dashboard','analisar','historico','galeria','alertas',
  'calendario','relatorio','doencas','sobre','configuracoes',
];

const tabVariants = {
  enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0, filter: 'blur(4px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0, filter: 'blur(4px)' }),
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

  const activeLabel = t(ALL_TABS.find(tab => tab.id === activeTab)?.key ?? '');
  const ActiveIcon = ALL_TABS.find(tab => tab.id === activeTab)?.icon;

  return (
    <AnalysisProvider>
      <div className="min-h-screen mesh-bg flex" style={{ background: 'var(--color-background)' }}>

        {/* ══ DESKTOP SIDEBAR ═══════════════════════════════════════ */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sticky top-0 h-screen overflow-hidden"
          style={{
            background: 'var(--color-sidebar)',
            borderRight: '1px solid var(--color-sidebar-border)',
          }}>

          {/* Sidebar ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% -20%, oklch(0.55 0.18 155 / 0.20) 0%, transparent 70%)',
            }} />

          {/* Logo area */}
          <div className="relative z-10 flex items-center gap-3.5 px-5 py-5"
            style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}>
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                boxShadow: '0 4px 12px oklch(0.55 0.18 155 / 0.35)',
                background: 'linear-gradient(135deg, oklch(0.35 0.12 155), oklch(0.55 0.18 155))',
              }}>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                alt="PhytoPathometric"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, oklch(1 0 0 / 0.1) 0%, transparent 60%)' }} />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight tracking-tight"
                style={{ color: 'oklch(0.95 0.01 155)' }}>
                PhytoPathometric
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-medium" style={{ color: 'oklch(0.65 0.08 155)' }}>
                  AgTech · v1.0
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="relative z-10 flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {ALL_TABS.map(({ id, key, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group"
                  style={{
                    color: isActive
                      ? 'oklch(0.92 0.01 155)'
                      : 'oklch(0.60 0.06 155)',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sideActive"
                      className="absolute inset-0 rounded-xl nav-pill-active"
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    />
                  )}

                  {/* Hover state */}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'oklch(1 0 0 / 0.04)' }} />
                  )}

                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    className="relative z-10 flex-shrink-0 transition-transform duration-200"
                    style={{ color: isActive ? 'oklch(0.75 0.20 155)' : 'oklch(0.55 0.07 155)' }}
                  />
                  <span className="relative z-10 tracking-tight flex-1">{t(key)}</span>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-10 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'oklch(0.72 0.20 155)' }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="relative z-10 px-3 py-3 space-y-1"
            style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>

            {/* Language */}
            <div className="flex items-center gap-2 px-3.5 py-2">
              <span className="text-[11px] font-medium flex-1" style={{ color: 'oklch(0.55 0.06 155)' }}>
                {t('settings.language')}
              </span>
              <LanguageSwitcher />
            </div>

            {/* Dark mode toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group"
                style={{ color: 'oklch(0.58 0.06 155)' }}
              >
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'oklch(1 0 0 / 0.04)' }} />
                {theme === 'dark'
                  ? <Sun size={15} className="relative z-10 text-amber-400 flex-shrink-0" />
                  : <Moon size={15} className="relative z-10 flex-shrink-0" />}
                <span className="relative z-10 text-[13px] font-medium">{t('settings.darkMode')}</span>
              </button>
            )}

            {/* User card */}
            {user && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl mt-1"
                style={{
                  background: 'oklch(1 0 0 / 0.05)',
                  border: '1px solid oklch(1 0 0 / 0.07)',
                }}>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.58 0.20 155), oklch(0.38 0.14 155))',
                    color: 'white',
                    boxShadow: '0 2px 8px oklch(0.38 0.14 155 / 0.4)',
                  }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold truncate" style={{ color: 'oklch(0.88 0.01 155)' }}>
                    {user.name}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: 'oklch(0.55 0.06 155)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group"
              style={{ color: 'oklch(0.58 0.18 25)' }}
            >
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'oklch(0.58 0.22 25 / 0.08)' }} />
              <LogOut size={15} className="relative z-10 flex-shrink-0" />
              <span className="relative z-10">{t('common.logout')}</span>
            </button>
          </div>
        </aside>

        {/* ══ MAIN AREA ════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── Header ── */}
          <header
            className="sticky top-0 z-40 flex items-center"
            style={{
              height: 56,
              background: 'oklch(1 0 0 / 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderBottom: '1px solid var(--color-border)',
              boxShadow: '0 1px 0 0 oklch(0.88 0.018 138 / 0.4), 0 4px 16px oklch(0 0 0 / 0.04)',
            }}>
            <div className="dark:hidden" style={{
              background: 'oklch(1 0 0 / 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
            }} />
            <div className="w-full px-5 flex items-center gap-3">

              {/* Logo — mobile only */}
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 lg:hidden"
                style={{ boxShadow: '0 2px 8px oklch(0.35 0.12 155 / 0.25)' }}>
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                  alt="PhytoPathometric"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Mobile */}
                <p className="font-display font-bold text-sm text-foreground leading-tight lg:hidden tracking-tight">
                  PhytoPathometric
                </p>
                {/* Desktop — page title with icon */}
                <div className="hidden lg:flex items-center gap-2.5">
                  {ActiveIcon && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'oklch(0.35 0.12 155 / 0.1)' }}>
                      <ActiveIcon size={14} style={{ color: 'oklch(0.35 0.12 155)' }} />
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={activeLabel}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="font-display font-bold text-base text-foreground tracking-tight"
                    >
                      {activeLabel}
                    </motion.h1>
                  </AnimatePresence>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-muted-foreground lg:hidden">{activeLabel}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Language — mobile only */}
                <div className="lg:hidden">
                  <LanguageSwitcher />
                </div>

                {/* Dark mode — mobile only */}
                {toggleTheme && (
                  <button
                    onClick={toggleTheme}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-all"
                    style={{ background: 'oklch(0.90 0.02 140 / 0.5)' }}
                  >
                    {theme === 'dark'
                      ? <Sun size={15} className="text-amber-400" />
                      : <Moon size={15} />}
                  </button>
                )}

                {/* User avatar — mobile */}
                {user && (
                  <div
                    className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.58 0.20 155), oklch(0.38 0.14 155))',
                      boxShadow: '0 2px 8px oklch(0.38 0.14 155 / 0.35)',
                    }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Content ── */}
          <main className="flex-1 overflow-hidden">
            <div
              className="h-[calc(100vh-56px-60px)] lg:h-[calc(100vh-56px)] overflow-y-auto scroll-smooth"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="px-4 sm:px-5 lg:px-8 pt-5 pb-28 lg:pb-10 max-w-2xl mx-auto lg:max-w-4xl xl:max-w-5xl">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeTab}
                    custom={direction}
                    variants={tabVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <TabContent activeTab={activeTab} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </main>
        </div>

        {/* ══ MOBILE BOTTOM NAV ════════════════════════════════════ */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </AnalysisProvider>
  );
}
