/**
 * PhytoPathometric — Smart Alerts Tab
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, TrendingUp, AlertTriangle, CheckCircle2, Info, Flame, Zap } from 'lucide-react';
import { useAnalysis, severityConfig } from '@/contexts/AnalysisContext';
import { WeatherWidget } from '@/components/WeatherWidget';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  icon: React.ElementType;
}

const TYPE_CONFIG = {
  critical: { bg: '#FEF2F2', border: '#FECACA', color: '#EF4444', label: 'Crítico' },
  warning:  { bg: '#FFF7ED', border: '#FED7AA', color: '#F97316', label: 'Atenção' },
  info:     { bg: 'oklch(0.94 0.02 155)', border: 'oklch(0.80 0.08 155)', color: 'oklch(0.40 0.12 155)', label: 'Info' },
  success:  { bg: '#F0FDF4', border: '#BBF7D0', color: '#22C55E', label: 'OK' },
};

export function AlertasTab() {
  const { history } = useAnalysis();

  const alerts = useMemo((): Alert[] => {
    const result: Alert[] = [];
    if (history.length === 0) return result;

    const byCrop: Record<string, typeof history> = {};
    history.forEach(item => {
      if (!byCrop[item.cultura]) byCrop[item.cultura] = [];
      byCrop[item.cultura].push(item);
    });

    Object.entries(byCrop).forEach(([crop, items]) => {
      const sorted = [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const criticals = sorted.filter(i => i.nivel === 'critica' || i.nivel === 'alta');
      if (criticals.length > 0 && criticals[0] === sorted[0]) {
        result.push({
          id: `crit-${crop}`, type: 'critical', icon: Flame,
          title: `${crop} — Intervenção Urgente`,
          message: `Última análise: ${criticals[0].severidade.toFixed(1)}% (${severityConfig[criticals[0].nivel].label}). ${severityConfig[criticals[0].nivel].description}.`,
        });
      }

      if (sorted.length >= 3) {
        const last3 = sorted.slice(0, 3).map(i => i.severidade);
        if (last3[0] > last3[1] && last3[1] > last3[2]) {
          result.push({
            id: `trend-${crop}`, type: 'warning', icon: TrendingUp,
            title: `${crop} — Tendência de Piora`,
            message: `Severidade aumentando: ${last3[2].toFixed(1)}% → ${last3[1].toFixed(1)}% → ${last3[0].toFixed(1)}%.`,
          });
        }
        if (last3[0] < last3[1] && last3[1] < last3[2]) {
          result.push({
            id: `improv-${crop}`, type: 'success', icon: CheckCircle2,
            title: `${crop} — Melhora Detectada`,
            message: `Severidade diminuindo: ${last3[2].toFixed(1)}% → ${last3[1].toFixed(1)}% → ${last3[0].toFixed(1)}%. Tratamento eficaz!`,
          });
        }
      }
    });

    const avg = history.reduce((a, b) => a + b.severidade, 0) / history.length;
    if (avg >= 50) {
      result.push({
        id: 'avg-high', type: 'critical', icon: AlertTriangle,
        title: 'Severidade Média Crítica',
        message: `Média geral de ${avg.toFixed(1)}%. Revisar práticas fitossanitárias.`,
      });
    }

    const healthyPct = history.filter(i => i.nivel === 'saudavel' || i.nivel === 'baixa').length / history.length * 100;
    if (healthyPct >= 70 && history.length >= 5) {
      result.push({
        id: 'healthy', type: 'success', icon: CheckCircle2,
        title: 'Lavoura Saudável',
        message: `${healthyPct.toFixed(0)}% das análises com baixa severidade. Continue o monitoramento preventivo!`,
      });
    }

    return result;
  }, [history]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="gradient-banner">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={18} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Alertas Inteligentes</span>
        </div>
        <h2 className="font-display text-white text-xl font-bold">Alertas & Tendências</h2>
        <p className="text-green-200 text-sm mt-1">{alerts.length} alertas ativos</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">🌤️ Clima Atual</p>
        <WeatherWidget />
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">📋 Alertas</p>
        {alerts.length === 0 ? (
          <div className="glass-card flex items-center gap-3 border-green-200 bg-green-50">
            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700">Nenhum alerta</p>
              <p className="text-xs text-green-600/80">
                {history.length === 0 ? 'Realize análises para receber alertas.' : 'Nenhuma tendência preocupante detectada.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const cfg = TYPE_CONFIG[alert.type];
              const Icon = alert.icon;
              return (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 px-3 py-3 rounded-2xl border"
                  style={{ background: cfg.bg, borderColor: cfg.border }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + '20' }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{alert.title}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Info size={14} className="text-primary" />
          <p className="text-xs font-bold text-foreground uppercase tracking-wide">Dicas Preventivas</p>
        </div>
        {[
          'Inspecione folhas nas primeiras horas da manhã quando há orvalho.',
          'Umidade > 80% por 6+ horas favorece infecções fúngicas.',
          'Rotação de culturas reduz inóculo de patógenos no solo.',
          'Fungicidas preventivos são mais eficazes que curativos.',
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}


