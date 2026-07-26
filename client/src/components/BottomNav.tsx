/**
 * PhytoPathometric — BottomNav
 */
import { Camera, BarChart2, Info, Settings, Stethoscope, LayoutDashboard, Bell, Images, CalendarDays, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'dashboard' | 'analisar' | 'historico' | 'galeria' | 'alertas' | 'calendario' | 'relatorio' | 'doencas' | 'sobre' | 'configuracoes';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

// Mobile: show only most important 5 tabs
const MOBILE_TABS = [
  { id: 'dashboard'     as TabId, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analisar'      as TabId, label: 'Analisar',  icon: Camera },
  { id: 'historico'     as TabId, label: 'Histórico', icon: BarChart2 },
  { id: 'doencas'       as TabId, label: 'Doenças',   icon: Stethoscope },
  { id: 'configuracoes' as TabId, label: 'Config.',   icon: Settings },
];

// All tabs for side menu
export const ALL_TABS = [
  { id: 'dashboard'     as TabId, label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'analisar'      as TabId, label: 'Analisar',    icon: Camera },
  { id: 'historico'     as TabId, label: 'Histórico',   icon: BarChart2 },
  { id: 'galeria'       as TabId, label: 'Galeria',     icon: Images },
  { id: 'alertas'       as TabId, label: 'Alertas',     icon: Bell },
  { id: 'calendario'    as TabId, label: 'Calendário',  icon: CalendarDays },
  { id: 'relatorio'     as TabId, label: 'Relatório',   icon: FileText },
  { id: 'doencas'       as TabId, label: 'Doenças',     icon: Stethoscope },
  { id: 'sobre'         as TabId, label: 'Sobre',       icon: Info },
  { id: 'configuracoes' as TabId, label: 'Config.',     icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid oklch(0.90 0.015 140)', boxShadow: '0 -1px 0 0 oklch(0.92 0.015 140), 0 -4px 16px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 relative min-w-[60px]"
              aria-label={tab.label}>
              {isActive && (
                <motion.div layoutId="activeTab" className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: 'oklch(0.92 0.04 155)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.7}
                  style={{ color: isActive ? 'oklch(0.28 0.09 155)' : 'oklch(0.60 0.04 155)' }} />
                <span className="text-[9px] font-bold tracking-tight"
                  style={{ color: isActive ? 'oklch(0.28 0.09 155)' : 'oklch(0.60 0.04 155)' }}>
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
