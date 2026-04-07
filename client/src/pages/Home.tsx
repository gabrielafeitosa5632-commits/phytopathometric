/**
 * PhytoPathometric — Home Page
 * Main app shell: mobile-first layout with bottom navigation and tab routing
 * Design: AgTech Dashboard Moderno
 * Colors: Emerald forest green primary (#1B4332), cream background (#F4F6F4)
 * Font: Plus Jakarta Sans (body) + Syne (display/headings)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, TabId } from '@/components/BottomNav';
import { AnalisarTab } from './tabs/AnalisarTab';
import { HistoricoTab } from './tabs/HistoricoTab';
import { SobreTab } from './tabs/SobreTab';
import { ConfiguracoesTab } from './tabs/ConfiguracoesTab';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

const TAB_TITLES: Record<TabId, string> = {
  analisar: 'Analisar',
  historico: 'Histórico',
  sobre: 'Sobre',
  configuracoes: 'Configurações',
};

const tabVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

const TAB_ORDER: TabId[] = ['analisar', 'historico', 'sobre', 'configuracoes'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('analisar');
  const [direction, setDirection] = useState(0);

  const handleTabChange = (tab: TabId) => {
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(tab);
    setDirection(newIdx > currentIdx ? 1 : -1);
    setActiveTab(tab);
  };

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* App header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/60">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
                alt="PhytoPathometric"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-base text-foreground leading-tight">
                PhytoPathometric
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {TAB_TITLES[activeTab]}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium">Ativo</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="max-w-lg mx-auto px-4 pt-4 pb-24 overflow-y-auto h-[calc(100vh-57px-64px)] scroll-smooth">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {activeTab === 'analisar' && <AnalisarTab />}
                {activeTab === 'historico' && <HistoricoTab />}
                {activeTab === 'sobre' && <SobreTab />}
                {activeTab === 'configuracoes' && <ConfiguracoesTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom navigation */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </AnalysisProvider>
  );
}
