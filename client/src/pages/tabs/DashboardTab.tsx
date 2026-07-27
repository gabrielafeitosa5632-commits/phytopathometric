/**
 * PhytoPathometric — Premium Dashboard Tab
 * Glassmorphism stat cards · Beautiful charts · Skeleton loading
 */
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Leaf, Activity,
  Award, AlertTriangle, Sparkles, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useAnalysis, severityConfig, SeverityLevel } from '@/contexts/AnalysisContext';
import { WeatherWidget } from '@/components/WeatherWidget';
import { useI18n } from '@/contexts/I18nContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const SEVERITY_ORDER: SeverityLevel[] = ['saudavel', 'baixa', 'media', 'alta', 'critica'];

/* ── Skeleton ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="glass-card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="skeleton w-11 h-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-16 rounded-lg" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="glass-card animate-pulse space-y-3">
      <div className="skeleton h-3 w-32 rounded" />
      <div className="skeleton w-full rounded-xl" style={{ height: 180 }} />
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

function StatCard({ icon: Icon, label, value, sub, color, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card card-lift group"
    >
      {/* Color accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[20px] opacity-70"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}10)`,
            border: `1px solid ${color}25`,
          }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-xl text-foreground leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
          {sub && (
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{sub}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex-shrink-0 ${
            trend === 'up'
              ? 'text-red-500 bg-red-50 dark:bg-red-500/10'
              : trend === 'down'
              ? 'text-green-600 bg-green-50 dark:bg-green-500/10'
              : 'text-muted-foreground bg-secondary'
          }`}>
            {trend === 'up'
              ? <ArrowUpRight size={10} />
              : trend === 'down'
              ? <ArrowDownRight size={10} />
              : null}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Custom Tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip px-3 py-2">
      <p className="text-[11px] font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[11px]" style={{ color: p.color }}>
          {p.value?.toFixed(1)}% — Severidade
        </p>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export function DashboardTab() {
  const { history } = useAnalysis();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const avg = history.reduce((a, b) => a + b.severidade, 0) / history.length;
    const max = Math.max(...history.map(i => i.severidade));
    const min = Math.min(...history.map(i => i.severidade));

    const distMap: Record<SeverityLevel, number> = { saudavel: 0, baixa: 0, media: 0, alta: 0, critica: 0 };
    history.forEach(i => distMap[i.nivel]++);
    const distribution = SEVERITY_ORDER
      .map(k => ({ name: severityConfig[k].label, value: distMap[k], color: severityConfig[k].color }))
      .filter(d => d.value > 0);

    const cropMap: Record<string, { count: number; totalSev: number }> = {};
    history.forEach(i => {
      if (!cropMap[i.cultura]) cropMap[i.cultura] = { count: 0, totalSev: 0 };
      cropMap[i.cultura].count++;
      cropMap[i.cultura].totalSev += i.severidade;
    });
    const topCrops = Object.entries(cropMap)
      .sort((a, b) => b[1].count - a[1].count).slice(0, 5)
      .map(([name, d]) => ({ name, analyses: d.count, avgSev: +(d.totalSev / d.count).toFixed(1) }));

    const trend = [...history].reverse().slice(-10).map((item, i) => ({
      i: i + 1, sev: +item.severidade.toFixed(1),
      date: new Date(item.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));

    const worstCrop = Object.entries(cropMap)
      .sort((a, b) => (b[1].totalSev / b[1].count) - (a[1].totalSev / a[1].count))[0];

    // Disease frequency
    const diseaseFreq: Record<string, number> = {};
    history.forEach(i => {
      const n = i.predictedDiseases?.[0]?.name;
      if (n && n !== 'Healthy Plant') diseaseFreq[n] = (diseaseFreq[n] || 0) + 1;
    });
    const topDiseases = Object.entries(diseaseFreq)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 20) + '…' : name, count }));

    const aiCount = history.filter(i => i.engine_used === 'ai').length;

    return { avg, max, min, distribution, topCrops, trend, worstCrop, topDiseases, aiCount };
  }, [history]);

  /* ── Skeleton state ── */
  if (loading) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <div className="skeleton rounded-2xl" style={{ height: 120 }} />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonChart />
        <SkeletonChart />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* ── Header Banner ── */}
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
              <BarChart3 size={14} className="text-emerald-300" />
            </div>
            <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
              {t('dash.stats')}
            </span>
          </div>
          <h2 className="font-display text-white text-2xl font-bold tracking-tight">
            {t('dash.stats')}
          </h2>
          <p className="text-emerald-200/70 text-sm mt-1 font-medium">
            {history.length} {t('history.analyses')}
          </p>
        </div>
      </motion.div>

      {/* ── Empty state ── */}
      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card flex flex-col items-center py-16 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{ background: 'oklch(0.35 0.12 155 / 0.1)', border: '1px solid oklch(0.35 0.12 155 / 0.15)' }}>
            <BarChart3 size={28} style={{ color: 'oklch(0.55 0.14 155)' }} />
          </div>
          <div>
            <p className="font-display font-bold text-lg text-foreground">{t('dash.noData')}</p>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              Realize análises na aba Analisar para ver estatísticas.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">🌤️ {t('dash.weather')}</p>
            <WeatherWidget />
          </div>
        </motion.div>
      ) : (
        <>
          {/* ── Stat Grid ── */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Activity}
              label={t('dash.avgSev')}
              value={`${stats!.avg.toFixed(1)}%`}
              color="oklch(0.55 0.18 155)"
              trend={stats!.avg > 25 ? 'up' : 'neutral'}
              delay={0.05}
            />
            <StatCard
              icon={TrendingUp}
              label={t('dash.maxSev')}
              value={`${stats!.max.toFixed(1)}%`}
              color="#ef4444"
              trend="up"
              delay={0.1}
            />
            <StatCard
              icon={TrendingDown}
              label={t('dash.minSev')}
              value={`${stats!.min.toFixed(1)}%`}
              color="#22c55e"
              trend="down"
              delay={0.15}
            />
            <StatCard
              icon={Award}
              label={t('dash.total')}
              value={`${history.length}`}
              sub={stats!.topCrops[0]?.name ?? '—'}
              color="#f59e0b"
              delay={0.2}
            />
          </div>

          {/* ── Weather ── */}
          <div>
            <p className="label-xs mb-2 px-0.5">{t('dash.weather')}</p>
            <WeatherWidget />
          </div>

          {/* ── Trend Chart ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="glass-card"
          >
            <p className="label-xs mb-4">{t('dash.trend')}</p>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={stats!.trend} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="sevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="oklch(0.55 0.18 155)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.18 155)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.02 140 / 0.5)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'oklch(0.55 0.04 155)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'oklch(0.55 0.04 155)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sev"
                  stroke="oklch(0.55 0.18 155)"
                  strokeWidth={2.5}
                  fill="url(#sevGrad)"
                  dot={{ fill: 'oklch(0.55 0.18 155)', r: 3.5, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: 'oklch(1 0 0 / 0.8)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── Distribution + Bar Chart ── */}
          <div className="grid grid-cols-1 gap-3">

            {/* Pie distribution */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.30, duration: 0.45 }}
              className="glass-card"
            >
              <p className="label-xs mb-4">Distribuição por Nível</p>
              <div className="flex items-center gap-5">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={stats!.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={56}
                      dataKey="value"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {stats!.distribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {stats!.distribution.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-foreground font-medium flex-1">{d.name}</span>
                      <span className="text-muted-foreground font-bold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bar chart by culture */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="glass-card"
            >
              <p className="label-xs mb-4">{t('dash.byCulture')}</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats!.topCrops} margin={{ top: 4, right: 4, bottom: 4, left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.02 140 / 0.5)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'oklch(0.55 0.04 155)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'oklch(0.55 0.04 155)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="oklch(0.60 0.20 155)" />
                      <stop offset="100%" stopColor="oklch(0.40 0.13 155)" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="avgSev" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* ── Alert banner ── */}
          {stats!.worstCrop && +((stats!.worstCrop[1].totalSev / stats!.worstCrop[1].count).toFixed(1)) >= 25 && (
            <div className="glass-card flex items-start gap-3" style={{ borderLeft: '3px solid #f59e0b' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#f59e0b18', border: '1px solid #f59e0b25' }}>
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Crop Alert</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <strong>{stats!.worstCrop[0]}</strong> — avg severity{' '}
                  <strong>{(stats!.worstCrop[1].totalSev / stats!.worstCrop[1].count).toFixed(1)}%</strong>
                </p>
              </div>
            </div>
          )}

          {/* ── Disease frequency chart ── */}
          {stats!.topDiseases.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.45 }} className="glass-card">
              <p className="label-xs mb-4 flex items-center gap-1.5">
                <Sparkles size={11} style={{ color: 'oklch(0.55 0.14 155)' }} />
                Most Detected Diseases
              </p>
              <div className="space-y-2.5">
                {stats!.topDiseases.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-4 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs font-semibold text-foreground truncate">{d.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{d.count}×</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.count / stats!.topDiseases[0].count) * 100}%` }}
                          transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                          style={{ background: 'linear-gradient(90deg, #EF4444, #F97316)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── AI vs Local engine pill ── */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl glass-card">
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">Analysis Engine Stats</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                🤖 AI: {stats!.aiCount} · 💻 Local: {history.length - stats!.aiCount}
              </p>
            </div>
            <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden flex">
              <div style={{ width: `${(stats!.aiCount / history.length) * 100}%`, background: '#3B82F6' }} className="rounded-l-full" />
            </div>
          </div>

          {/* ── Top Crops ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
            className="glass-card"
          >
            <p className="label-xs mb-4 flex items-center gap-1.5">
              <Leaf size={11} style={{ color: 'oklch(0.55 0.14 155)' }} />
              {t('dash.topCrops')}
            </p>
            <div className="space-y-3">
              {stats!.topCrops.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{
                      background: i === 0
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : i === 1
                        ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                        : 'linear-gradient(135deg, oklch(0.55 0.18 155), oklch(0.38 0.12 155))',
                      boxShadow: '0 2px 6px oklch(0 0 0 / 0.15)',
                    }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">{c.name}</span>
                      <span
                        className="text-xs font-bold ml-2 flex-shrink-0"
                        style={{
                          color: c.avgSev >= 75 ? '#ef4444'
                            : c.avgSev >= 50 ? '#f97316'
                            : c.avgSev >= 25 ? '#f59e0b'
                            : '#22c55e',
                        }}>
                        {c.avgSev}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${c.avgSev}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                        style={{
                          background: c.avgSev >= 75
                            ? 'linear-gradient(90deg, #f97316, #ef4444)'
                            : c.avgSev >= 50
                            ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                            : c.avgSev >= 25
                            ? 'linear-gradient(90deg, #84cc16, #f59e0b)'
                            : 'linear-gradient(90deg, #22c55e, #84cc16)',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0 w-12 text-right">
                    {c.analyses} análises
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

