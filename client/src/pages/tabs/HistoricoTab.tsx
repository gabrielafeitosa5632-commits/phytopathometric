/**
 * PhytoPathometric — Premium HistoricoTab
 * Glassmorphism history with beautiful charts
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Trash2, BarChart2, List, FileText, FileSpreadsheet,
  AlertTriangle, ChevronDown, ChevronUp, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAnalysis, severityConfig, AnalysisResult } from '@/contexts/AnalysisContext';
import { SeverityGauge } from '@/components/SeverityGauge';
import { useI18n } from '@/contexts/I18nContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

type ViewMode = 'list' | 'chart';

function HistoryItem({ item, onRemove, index }: { item: AnalysisResult; onRemove: () => void; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[item.nivel];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.97 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="glass-card overflow-hidden"
      style={{ borderLeft: `3px solid ${config.color}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{
            background: `linear-gradient(135deg, ${config.bgColor}, ${config.color}20)`,
            color: config.textColor,
            border: `1px solid ${config.color}30`,
          }}
        >
          {item.severidade.toFixed(0)}%
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground truncate">{item.cultura}</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: config.bgColor, color: config.textColor, border: `1px solid ${config.color}30` }}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(item.timestamp).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-secondary"
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.span>
          </button>
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4">
              <SeverityGauge value={item.severidade} level={item.nivel} size={100} showLabel={false} animated={false} />
              <div className="flex-1 space-y-2 text-xs">
                {[
                  { label: 'Área total',  value: item.areaTotal.toLocaleString('pt-BR') + ' px²', color: undefined },
                  { label: 'Saudável',   value: item.areaSaudavel.toLocaleString('pt-BR') + ' px²', color: '#16a34a' },
                  { label: 'Lesionada',  value: item.areaLesionada.toLocaleString('pt-BR') + ' px²', color: '#dc2626' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
                {item.observacoes && (
                  <div className="mt-1 p-2 rounded-xl" style={{ background: 'oklch(0.94 0.015 140 / 0.6)' }}>
                    <p className="text-muted-foreground leading-relaxed">{item.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip px-3 py-2">
      <p className="text-[11px] font-semibold text-foreground mb-1">{label}</p>
      <p className="text-[11px]" style={{ color: 'oklch(0.55 0.18 155)' }}>
        {payload[0]?.value?.toFixed(1)}% — Severidade
      </p>
    </div>
  );
}

export function HistoricoTab() {
  const { history, removeFromHistory, clearHistory, exportCSV, exportXLSX } = useAnalysis();
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const chartData = [...history].reverse().slice(-20).map((item, i) => ({
    index: i + 1,
    severidade: item.severidade,
    cultura: item.cultura,
    date: new Date(item.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }));

  const avgSeveridade = history.length > 0
    ? history.reduce((acc, item) => acc + item.severidade, 0) / history.length : 0;
  const maxSeveridade = history.length > 0
    ? Math.max(...history.map(item => item.severidade)) : 0;

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="gradient-banner"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(1 0 0 / 0.12)', border: '1px solid oklch(1 0 0 / 0.15)' }}>
              <BarChart2 size={14} className="text-emerald-300" />
            </div>
            <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
              {t('history.title')}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white font-display font-bold text-2xl">{history.length}</p>
              <p className="text-emerald-200/70 text-xs font-medium">{t('history.analyses')}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">{avgSeveridade.toFixed(1)}%</p>
              <p className="text-emerald-200/70 text-xs">{t('history.avgSev')}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">{maxSeveridade.toFixed(1)}%</p>
              <p className="text-emerald-200/70 text-xs">{t('history.maxSev')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Empty state */}
      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex flex-col items-center py-16 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ background: 'oklch(0.35 0.12 155 / 0.1)', border: '1px solid oklch(0.35 0.12 155 / 0.15)' }}>
            <BarChart2 size={28} style={{ color: 'oklch(0.55 0.14 155)' }} />
          </div>
          <div>
            <p className="font-display font-bold text-lg text-foreground">{t('history.empty')}</p>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              Realize sua primeira análise para ver o histórico aqui.
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-xl p-1 gap-0.5"
              style={{ background: 'oklch(0.92 0.015 140 / 0.8)', border: '1px solid oklch(0.88 0.018 138 / 0.5)' }}>
              {(['list', 'chart'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ color: viewMode === mode ? 'oklch(0.18 0.04 155)' : 'oklch(0.52 0.04 155)' }}
                >
                  {viewMode === mode && (
                    <motion.div
                      layoutId="viewToggle"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {mode === 'list' ? <List size={12} /> : <TrendingUp size={12} />}
                    {mode === 'list' ? 'Lista' : 'Gráfico'}
                  </span>
                </button>
              ))}
            </div>

            {/* Export buttons */}
            <div className="flex gap-1.5 ml-auto">
              <button
                onClick={() => { exportCSV(); toast.success('CSV exportado!'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all glass-card hover:shadow-md"
                style={{ color: 'oklch(0.35 0.12 155)', padding: '6px 12px' }}
              >
                <FileText size={12} />CSV
              </button>
              <button
                onClick={() => { exportXLSX(); toast.success('XLS exportado!'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all glass-card hover:shadow-md"
                style={{ color: 'oklch(0.35 0.12 155)', padding: '6px 12px' }}
              >
                <FileSpreadsheet size={12} />XLS
              </button>
            </div>
          </div>

          {/* Chart view */}
          <AnimatePresence mode="wait">
            {viewMode === 'chart' && (
              <motion.div
                key="chart"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="glass-card"
              >
                <p className="label-xs mb-4">Evolução Temporal (últimas 20)</p>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="oklch(0.55 0.18 155)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="oklch(0.55 0.18 155)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.02 140 / 0.5)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'oklch(0.55 0.04 155)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'oklch(0.55 0.04 155)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={10} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <Area
                      type="monotone"
                      dataKey="severidade"
                      stroke="oklch(0.55 0.18 155)"
                      strokeWidth={2.5}
                      fill="url(#histGrad)"
                      dot={{ fill: 'oklch(0.55 0.18 155)', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: 'oklch(1 0 0 / 0.8)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* List view */}
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5"
              >
                <AnimatePresence>
                  {history.map((item, index) => (
                    <HistoryItem
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={() => removeFromHistory(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear history */}
          <div className="mt-1">
            <AnimatePresence mode="wait">
              {!showClearConfirm ? (
                <motion.button
                  key="clear-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-red-500 transition-all"
                  style={{
                    border: '1px dashed oklch(0.85 0.018 138 / 0.8)',
                    background: 'oklch(0.96 0.008 140 / 0.5)',
                  }}
                >
                  <Trash2 size={14} />
                  {t('history.clear')}
                </motion.button>
              ) : (
                <motion.div
                  key="clear-confirm"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="glass-card space-y-3"
                  style={{ borderColor: '#f59e0b60' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: '#fef3c720', border: '1px solid #f59e0b30' }}>
                      <AlertTriangle size={15} className="text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{t('history.confirmClear')}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Esta ação removerá todas as {history.length} análises do histórico local.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground transition-all hover:bg-secondary"
                      style={{ border: '1px solid var(--color-border)' }}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={() => { clearHistory(); setShowClearConfirm(false); toast.success('Histórico limpo.'); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px #ef444440' }}
                    >
                      {t('common.confirm')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

