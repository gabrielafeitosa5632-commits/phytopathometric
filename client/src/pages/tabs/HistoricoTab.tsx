/**
 * PhytoPathometric — History Tab (v2)
 * Full analysis cards: thumbnail, disease name, severity, tissue %, treatments
 */
import { useState } from 'react';
import {
  Trash2, BarChart2, List, FileText, FileSpreadsheet,
  AlertTriangle, ChevronDown, ChevronUp, TrendingUp,
  Microscope, Leaf, Bug, ShieldCheck, Eye, Calendar,
  Activity, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAnalysis, severityConfig, AnalysisResult } from '@/contexts/AnalysisContext';
import { SeverityGauge } from '@/components/SeverityGauge';
import { useI18n } from '@/contexts/I18nContext';
import type { TreatmentDetail } from '@/contexts/AnalysisContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

type ViewMode = 'list' | 'chart';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normTreatment(t: string[] | TreatmentDetail | undefined): TreatmentDetail {
  if (!t) return { organic: [], chemical: [], preventive: [] };
  if (Array.isArray(t)) return { organic: [], chemical: t.slice(0, 3), preventive: [] };
  return t;
}

function diseaseTypeBadge(type?: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    fungal:        { label: '🍄 Fungal',     color: '#92400E', bg: '#FEF3C7' },
    bacterial:     { label: '🦠 Bacterial',  color: '#1E40AF', bg: '#DBEAFE' },
    viral:         { label: '🧬 Viral',      color: '#7C3AED', bg: '#EDE9FE' },
    physiological: { label: '⚗️ Physio.',   color: '#065F46', bg: '#D1FAE5' },
    abiotic:       { label: '☀️ Abiotic',   color: '#374151', bg: '#F3F4F6' },
    healthy:       { label: '✅ Healthy',    color: '#166534', bg: '#F0FDF4' },
  };
  const c = map[type ?? ''] ?? map.fungal;
  return (
    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}>{c.label}</span>
  );
}

// ─── History Card ─────────────────────────────────────────────────────────────
function HistoryCard({ item, onRemove, index }: { item: AnalysisResult; onRemove: () => void; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[item.nivel];
  const primary = item.predictedDiseases?.[0];
  const treatment = normTreatment(primary?.treatment);
  const confPct = primary?.confidence_percent != null
    ? Math.round(primary.confidence_percent)
    : primary ? Math.round(primary.confidence * 100) : null;

  return (
    <div className="glass-card overflow-hidden" style={{ borderLeft: `3px solid ${config.color}` }}>

      {/* ── Top row: thumbnail + main info ── */}
      <div className="flex items-start gap-3">
        {/* Thumbnail or severity circle */}
        {item.processedImageDataUrl ? (
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
            <img src={item.processedImageDataUrl} alt="leaf" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ background: config.bgColor, color: config.textColor, border: `1px solid ${config.color}30` }}>
            <div className="text-center">
              <p className="text-base font-bold leading-tight">{item.severidade.toFixed(0)}%</p>
              <p className="text-[9px]">sev.</p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              {/* Disease name */}
              <p className="font-display font-bold text-sm text-foreground leading-tight truncate">
                {primary?.name ?? (item.image_valid === false ? '⚠ Invalid image' : 'Healthy Plant')}
              </p>
              {/* Crop + date */}
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Leaf size={9} />{item.detected_crop ?? item.cultura}
                </span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Calendar size={9} />
                  {new Date(item.timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {/* Badges row */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: config.bgColor, color: config.textColor, border: `1px solid ${config.color}30` }}>
                  {config.label} {item.severidade.toFixed(1)}%
                </span>
                {primary?.disease_type && diseaseTypeBadge(primary.disease_type)}
                {confPct != null && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                    {confPct}% conf.
                  </span>
                )}
                {item.engine_used && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: item.engine_used === 'ai' ? '#DBEAFE' : '#F3F4F6', color: item.engine_used === 'ai' ? '#1E40AF' : '#374151' }}>
                    {item.engine_used === 'ai' ? '🤖 AI' : '💻 Local'}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button onClick={() => setExpanded(v => !v)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button onClick={onRemove}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tissue mini-bar ── */}
      {item.tissue_breakdown && (
        <div className="mt-3 flex h-2 rounded-full overflow-hidden gap-px">
          {item.tissue_breakdown.healthy_percent > 0 && (
            <div style={{ width: `${item.tissue_breakdown.healthy_percent}%`, background: '#22C55E' }} />)}
          {item.tissue_breakdown.chlorotic_percent > 0 && (
            <div style={{ width: `${item.tissue_breakdown.chlorotic_percent}%`, background: '#EAB308' }} />)}
          {item.tissue_breakdown.necrotic_percent > 0 && (
            <div style={{ width: `${item.tissue_breakdown.necrotic_percent}%`, background: '#EF4444' }} />)}
          {item.tissue_breakdown.damaged_percent > 0 && (
            <div style={{ width: `${item.tissue_breakdown.damaged_percent}%`, background: '#F97316' }} />)}
        </div>
      )}
      {item.tissue_breakdown && (
        <div className="flex gap-3 mt-1">
          {[
            { label: 'Healthy', val: item.tissue_breakdown.healthy_percent, color: '#22C55E' },
            { label: 'Chlorotic', val: item.tissue_breakdown.chlorotic_percent, color: '#EAB308' },
            { label: 'Necrotic', val: item.tissue_breakdown.necrotic_percent, color: '#EF4444' },
            { label: 'Damaged', val: item.tissue_breakdown.damaged_percent, color: '#F97316' },
          ].filter(x => x.val > 0).map(x => (
            <span key={x.label} className="flex items-center gap-0.5 text-[9px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: x.color }} />
              {x.label} {x.val.toFixed(0)}%
            </span>
          ))}
        </div>
      )}

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-4">

          {/* Severity gauge + metrics row */}
          <div className="flex items-center gap-4">
            <SeverityGauge value={item.severidade} level={item.nivel} size={96} showLabel={false} animated={false} />
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" />Healthy</span>
                <span className="font-semibold text-green-600">
                  {item.healthy_area_px_percent != null ? `${item.healthy_area_px_percent.toFixed(1)}%` : item.tissue_breakdown ? `${item.tissue_breakdown.healthy_percent.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Bug size={10} className="text-red-500" />Infected</span>
                <span className="font-semibold text-red-500">
                  {item.lesion_area_px_percent != null ? `${item.lesion_area_px_percent.toFixed(1)}%` : item.tissue_breakdown ? `${(item.tissue_breakdown.necrotic_percent + item.tissue_breakdown.damaged_percent).toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Activity size={10} />Severity</span>
                <span className="font-semibold" style={{ color: config.color }}>{item.severidade.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Analysis summary */}
          {item.analysis_summary && (
            <div className="px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Eye size={9} />Analysis Summary
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">{item.analysis_summary}</p>
            </div>
          )}

          {/* Supporting symptoms */}
          {primary?.supporting_symptoms && primary.supporting_symptoms.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Microscope size={9} />Observed Symptoms
              </p>
              <ul className="space-y-1">
                {primary.supporting_symptoms.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatment summary */}
          {primary && (treatment.chemical.length > 0 || treatment.organic.length > 0 || treatment.preventive.length > 0) && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <ShieldCheck size={9} />Treatment
              </p>
              {treatment.chemical.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {treatment.chemical.slice(0, 3).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg text-[11px] bg-red-50 text-red-700 border border-red-100">{c}</span>
                  ))}
                </div>
              )}
              {treatment.organic.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {treatment.organic.slice(0, 2).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg text-[11px] bg-green-50 text-green-700 border border-green-100">{c}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {item.recommendations && item.recommendations.immediate.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <AlertTriangle size={9} />Immediate Actions
              </p>
              <ul className="space-y-1">
                {item.recommendations.immediate.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Field notes */}
          {item.observacoes && (
            <div className="px-3 py-2 rounded-xl bg-secondary/60 border border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Field Notes</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.observacoes}</p>
            </div>
          )}

          {/* Segmented images side by side */}
          {(item.processedImageDataUrl || item.heatmapDataUrl) && (
            <div className="grid grid-cols-2 gap-2">
              {item.processedImageDataUrl && (
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1 text-center">Segmented</p>
                  <img src={item.processedImageDataUrl} alt="segmented" className="w-full rounded-xl object-cover aspect-square" />
                </div>
              )}
              {item.heatmapDataUrl && (
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1 text-center">Heatmap</p>
                  <img src={item.heatmapDataUrl} alt="heatmap" className="w-full rounded-xl object-cover aspect-square" />
                </div>
              )}
            </div>
          )}

          {/* Analysis ID + method */}
          <div className="flex justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2">
            <span>ID: {item.id}</span>
            <span>{item.engine_used === 'ai' ? '🤖 OpenRouter AI' : '💻 Local Engine'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-foreground mb-0.5">{label}</p>
      <p className="text-[11px]" style={{ color: 'oklch(0.55 0.18 155)' }}>
        Severity: {payload[0]?.value?.toFixed(1)}%
      </p>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export function HistoricoTab() {
  const { history, removeFromHistory, clearHistory, exportCSV, exportXLSX } = useAnalysis();
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const chartData = [...history].reverse().slice(-20).map((item, i) => ({
    index: i + 1,
    severidade: item.severidade,
    cultura: item.cultura,
    date: new Date(item.timestamp).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
  }));

  const avgSev = history.length > 0
    ? history.reduce((a, b) => a + b.severidade, 0) / history.length : 0;
  const maxSev = history.length > 0 ? Math.max(...history.map(i => i.severidade)) : 0;
  const diseaseCount = history.filter(i => i.severidade >= 10).length;

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* ── Header ── */}
      <div className="gradient-banner">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(1 0 0 / 0.12)', border: '1px solid oklch(1 0 0 / 0.15)' }}>
              <BarChart2 size={14} className="text-emerald-300" />
            </div>
            <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest">Analysis History</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white font-display font-bold text-2xl">{history.length}</p>
              <p className="text-emerald-200/70 text-[11px]">Total Analyses</p>
            </div>
            <div>
              <p className="text-white font-bold text-xl">{avgSev.toFixed(1)}%</p>
              <p className="text-emerald-200/70 text-[11px]">Avg Severity</p>
            </div>
            <div>
              <p className="text-white font-bold text-xl">{diseaseCount}</p>
              <p className="text-emerald-200/70 text-[11px]">Diseased</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {history.length === 0 ? (
        <div className="glass-card flex flex-col items-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ background: 'oklch(0.35 0.12 155 / 0.1)', border: '1px solid oklch(0.35 0.12 155 / 0.15)' }}>
            <BarChart2 size={28} style={{ color: 'oklch(0.55 0.14 155)' }} />
          </div>
          <div>
            <p className="font-display font-bold text-lg text-foreground">No analyses yet</p>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              Run your first analysis in the Analyze tab to see history here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Controls ── */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl p-1 gap-0.5"
              style={{ background: 'oklch(0.92 0.015 140 / 0.8)', border: '1px solid oklch(0.88 0.018 138 / 0.5)' }}>
              {(['list', 'chart'] as ViewMode[]).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: viewMode === mode ? 'white' : 'transparent',
                    color: viewMode === mode ? 'oklch(0.18 0.04 155)' : 'oklch(0.52 0.04 155)',
                    boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}>
                  {mode === 'list' ? <><List size={12} />List</> : <><TrendingUp size={12} />Chart</>}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 ml-auto">
              <button onClick={() => { exportCSV(); toast.success('CSV exported!'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-card"
                style={{ color: 'oklch(0.35 0.12 155)' }}>
                <FileText size={12} />CSV
              </button>
              <button onClick={() => { exportXLSX(); toast.success('XLS exported!'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-card"
                style={{ color: 'oklch(0.35 0.12 155)' }}>
                <FileSpreadsheet size={12} />XLS
              </button>
            </div>
          </div>

          {/* ── Chart view ── */}
          {viewMode === 'chart' && (
            <div className="glass-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Severity Trend (last 20)</p>
              <ResponsiveContainer width="100%" height={200}>
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
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={10} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Area type="monotone" dataKey="severidade" stroke="oklch(0.55 0.18 155)"
                    strokeWidth={2.5} fill="url(#histGrad)"
                    dot={{ fill: 'oklch(0.55 0.18 155)', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'oklch(1 0 0 / 0.8)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── List view ── */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {history.map((item, index) => (
                <HistoryCard key={item.id} item={item} index={index}
                  onRemove={() => removeFromHistory(item.id)} />
              ))}
            </div>
          )}

          {/* ── Clear history ── */}
          <div className="mt-1">
            {!showClearConfirm ? (
              <button onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-red-500 transition-all"
                style={{ border: '1px dashed oklch(0.85 0.018 138 / 0.8)', background: 'oklch(0.96 0.008 140 / 0.5)' }}>
                <Trash2 size={14} />Clear History
              </button>
            ) : (
              <div className="glass-card space-y-3" style={{ borderColor: '#f59e0b60' }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-500" />
                  <p className="text-sm font-bold">Confirm deletion?</p>
                </div>
                <p className="text-xs text-muted-foreground">This will delete all {history.length} analyses permanently.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-secondary transition-all">
                    Cancel
                  </button>
                  <button onClick={() => { clearHistory(); setShowClearConfirm(false); toast.success('History cleared.'); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    Delete All
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
