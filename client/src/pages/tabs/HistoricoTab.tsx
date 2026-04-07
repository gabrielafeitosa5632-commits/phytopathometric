/**
 * PhytoPathometric — HistoricoTab
 * History tab: list of analyses, chart, export CSV/XLSX
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, BarChart2, List, FileText, FileSpreadsheet, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAnalysis, severityConfig, AnalysisResult } from '@/contexts/AnalysisContext';
import { SeverityGauge } from '@/components/SeverityGauge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

type ViewMode = 'list' | 'chart';

function HistoryItem({ item, onRemove }: { item: AnalysisResult; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[item.nivel];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="card-phyto"
      style={{ borderLeft: `3px solid ${config.color}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          {item.severidade.toFixed(0)}%
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{item.cultura}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: config.bgColor, color: config.textColor }}
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
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
            className="mt-3 pt-3 border-t border-border/60 overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <SeverityGauge value={item.severidade} level={item.nivel} size={100} showLabel={false} animated={false} />
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono">{item.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área total</span>
                  <span>{item.areaTotal.toLocaleString('pt-BR')} px²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saudável</span>
                  <span className="text-green-600">{item.areaSaudavel.toLocaleString('pt-BR')} px²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lesionada</span>
                  <span className="text-red-500">{item.areaLesionada.toLocaleString('pt-BR')} px²</span>
                </div>
                {item.observacoes && (
                  <div className="mt-2 p-2 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">{item.observacoes}</p>
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

export function HistoricoTab() {
  const { history, removeFromHistory, clearHistory, exportCSV, exportXLSX } = useAnalysis();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const chartData = [...history]
    .reverse()
    .slice(-20)
    .map((item, i) => ({
      index: i + 1,
      severidade: item.severidade,
      cultura: item.cultura,
      nivel: item.nivel,
      date: new Date(item.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));

  const avgSeveridade = history.length > 0
    ? history.reduce((acc, item) => acc + item.severidade, 0) / history.length
    : 0;

  const maxSeveridade = history.length > 0
    ? Math.max(...history.map(item => item.severidade))
    : 0;

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="card-phyto" style={{ background: 'linear-gradient(135deg, oklch(0.22 0.07 155), oklch(0.32 0.09 155))' }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={16} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Histórico de Análises</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white font-display font-bold text-2xl">{history.length}</p>
            <p className="text-green-200 text-xs">análises registradas</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">{avgSeveridade.toFixed(1)}%</p>
            <p className="text-green-200 text-xs">severidade média</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-lg">{maxSeveridade.toFixed(1)}%</p>
            <p className="text-green-200 text-xs">máxima registrada</p>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card-phyto flex flex-col items-center py-12 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <BarChart2 size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Nenhuma análise registrada</p>
          <p className="text-muted-foreground text-sm max-w-xs">
            Realize sua primeira análise na aba <strong>Analisar</strong> para visualizar o histórico aqui.
          </p>
        </div>
      ) : (
        <>
          {/* View mode toggle + export */}
          <div className="flex items-center gap-2">
            <div className="flex bg-secondary rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                <List size={13} />Lista
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'chart' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                <BarChart2 size={13} />Gráfico
              </button>
            </div>
            <div className="flex gap-1.5 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => { exportCSV(); toast.success('CSV exportado!'); }}
              >
                <FileText size={12} />CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => { exportXLSX(); toast.success('XLS exportado!'); }}
              >
                <FileSpreadsheet size={12} />XLS
              </Button>
            </div>
          </div>

          {/* Chart view */}
          {viewMode === 'chart' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-phyto"
            >
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Evolução Temporal da Severidade (últimas 20)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 140)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(0.52 0.04 155)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'oklch(0.52 0.04 155)' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid oklch(0.88 0.02 140)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Severidade']}
                  />
                  <ReferenceLine y={10} stroke="#22C55E" strokeDasharray="4 4" label={{ value: 'Saudável', position: 'right', fontSize: 9, fill: '#22C55E' }} />
                  <ReferenceLine y={25} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Média', position: 'right', fontSize: 9, fill: '#F59E0B' }} />
                  <ReferenceLine y={50} stroke="#F97316" strokeDasharray="4 4" label={{ value: 'Alta', position: 'right', fontSize: 9, fill: '#F97316' }} />
                  <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Crítica', position: 'right', fontSize: 9, fill: '#EF4444' }} />
                  <Line
                    type="monotone"
                    dataKey="severidade"
                    stroke="oklch(0.32 0.09 155)"
                    strokeWidth={2.5}
                    dot={{ fill: 'oklch(0.32 0.09 155)', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* List view */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              <AnimatePresence>
                {history.map(item => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onRemove={() => removeFromHistory(item.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Clear all */}
          <div className="mt-2">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors border border-dashed border-border"
              >
                <Trash2 size={14} />
                Limpar histórico
              </button>
            ) : (
              <div className="card-phyto flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle size={16} />
                  <p className="text-sm font-semibold">Confirmar exclusão?</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta ação removerá todas as {history.length} análises do histórico local.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowClearConfirm(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => { clearHistory(); setShowClearConfirm(false); toast.success('Histórico limpo.'); }}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
