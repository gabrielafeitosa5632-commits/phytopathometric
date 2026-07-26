/**
 * PhytoPathometric — Dashboard Tab
 * Stats, charts, weather, top crops
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Leaf, Activity, Award, AlertTriangle } from 'lucide-react';
import { useAnalysis, severityConfig, SeverityLevel } from '@/contexts/AnalysisContext';
import { WeatherWidget } from '@/components/WeatherWidget';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const SEVERITY_ORDER: SeverityLevel[] = ['saudavel', 'baixa', 'media', 'alta', 'critica'];

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-phyto flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-xl text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function DashboardTab() {
  const { history } = useAnalysis();

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const avg = history.reduce((a, b) => a + b.severidade, 0) / history.length;
    const max = Math.max(...history.map(i => i.severidade));
    const min = Math.min(...history.map(i => i.severidade));

    const distMap: Record<SeverityLevel, number> = { saudavel: 0, baixa: 0, media: 0, alta: 0, critica: 0 };
    history.forEach(i => distMap[i.nivel]++);
    const distribution = SEVERITY_ORDER.map(k => ({
      name: severityConfig[k].label, value: distMap[k], color: severityConfig[k].color,
    })).filter(d => d.value > 0);

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

    return { avg, max, min, distribution, topCrops, trend, worstCrop };
  }, [history]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="relative overflow-hidden rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, oklch(0.22 0.07 155), oklch(0.32 0.09 155))' }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={18} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Dashboard</span>
        </div>
        <h2 className="font-display text-white text-xl font-bold">Estatísticas</h2>
        <p className="text-green-200 text-sm mt-1">{history.length} análises registradas</p>
      </div>

      {history.length === 0 ? (
        <div className="card-phyto flex flex-col items-center py-14 gap-3 text-center">
          <BarChart3 size={32} className="text-muted-foreground/40" />
          <p className="font-semibold text-foreground">Nenhuma análise ainda</p>
          <p className="text-muted-foreground text-sm max-w-xs">Realize análises na aba "Analisar" para ver estatísticas.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Activity}     label="Sev. Média"       value={`${stats!.avg.toFixed(1)}%`} color="oklch(0.52 0.14 155)" />
            <StatCard icon={TrendingUp}   label="Máxima"           value={`${stats!.max.toFixed(1)}%`} color="#EF4444" />
            <StatCard icon={TrendingDown} label="Mínima"           value={`${stats!.min.toFixed(1)}%`} color="#22C55E" />
            <StatCard icon={Award}        label="Total Análises"   value={`${history.length}`}          color="#F59E0B"
              sub={`${stats!.topCrops[0]?.name ?? '—'} mais analisada`} />
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">🌤️ Condições Climáticas</p>
            <WeatherWidget />
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-phyto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Evolução (últimas 10)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats!.trend} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 140 / 0.5)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Severidade']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid oklch(0.88 0.02 140)' }} />
                <Line type="monotone" dataKey="sev" stroke="oklch(0.42 0.12 155)" strokeWidth={2.5}
                  dot={{ fill: 'oklch(0.42 0.12 155)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 gap-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-phyto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Distribuição por Nível</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={stats!.distribution} cx="50%" cy="50%" innerRadius={28} outerRadius={52} dataKey="value" paddingAngle={3}>
                      {stats!.distribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 flex-1">
                  {stats!.distribution.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-foreground font-medium flex-1">{d.name}</span>
                      <span className="text-muted-foreground font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-phyto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Sev. Média por Cultura</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={stats!.topCrops} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 140 / 0.5)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Sev. Média']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="avgSev" fill="oklch(0.52 0.14 155)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {stats!.worstCrop && +((stats!.worstCrop[1].totalSev / stats!.worstCrop[1].count).toFixed(1)) >= 25 && (
            <div className="card-phyto flex items-start gap-3 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">Cultura em Alerta</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  <strong>{stats!.worstCrop[0]}</strong> tem sev. média de{' '}
                  <strong>{(stats!.worstCrop[1].totalSev / stats!.worstCrop[1].count).toFixed(1)}%</strong>
                </p>
              </div>
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-phyto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Leaf size={12} className="text-primary" />Top Culturas
            </p>
            <div className="space-y-2">
              {stats!.topCrops.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : 'oklch(0.52 0.14 155)' }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.analyses} análises</span>
                  <span className="text-xs font-bold" style={{
                    color: c.avgSev >= 75 ? '#EF4444' : c.avgSev >= 50 ? '#F97316' : c.avgSev >= 25 ? '#F59E0B' : '#22C55E'
                  }}>{c.avgSev}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {history.length === 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">🌤️ Condições Climáticas</p>
          <WeatherWidget />
        </div>
      )}
    </div>
  );
}
