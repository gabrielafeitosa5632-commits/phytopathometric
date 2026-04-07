/**
 * PhytoPathometric — BottomNav Component
 * Mobile-first bottom navigation bar
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 */
import { Camera, BarChart2, Info, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'analisar' | 'historico' | 'sobre' | 'configuracoes';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'analisar' as TabId, label: 'Analisar', icon: Camera },
  { id: 'historico' as TabId, label: 'Histórico', icon: BarChart2 },
  { id: 'sobre' as TabId, label: 'Sobre', icon: Info },
  { id: 'configuracoes' as TabId, label: 'Config.', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 relative min-w-[60px]"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: 'oklch(0.94 0.02 140)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon
                  size={22}
                  className="transition-colors duration-200"
                  style={{ color: isActive ? 'oklch(0.32 0.09 155)' : 'oklch(0.52 0.04 155)' }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className="text-[10px] font-semibold transition-colors duration-200"
                  style={{ color: isActive ? 'oklch(0.32 0.09 155)' : 'oklch(0.52 0.04 155)' }}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
