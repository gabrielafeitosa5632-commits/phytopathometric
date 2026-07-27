/**
 * PhytoPathometric — DoencasTab
 * Disease identification & database browser
 * Shows all diseases with HSV/CIELAB signatures, treatments, affected crops
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from '@/lib/framer-safe';
import {
  Search, Stethoscope, Pill, Leaf, Thermometer, Droplets,
  ChevronDown, ChevronUp, FlaskConical, BookOpen, AlertTriangle,
  Bug, Zap, Wind,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DISEASE_DATABASE, DiseasePattern } from '@/lib/diseaseDatabase';
import { useAnalysis } from '@/contexts/AnalysisContext';

// ─── helpers ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<DiseasePattern['type'], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  fungal:        { label: 'Fúngica',       color: '#92400E', bg: '#FEF3C7', icon: FlaskConical },
  bacterial:     { label: 'Bacteriana',     color: '#1D4ED8', bg: '#EFF6FF', icon: Bug },
  viral:         { label: 'Viral',          color: '#7C3AED', bg: '#F5F3FF', icon: Zap },
  physiological: { label: 'Fisiológica',    color: '#0F766E', bg: '#F0FDFA', icon: Wind },
  abiotic:       { label: 'Abiótica',       color: '#475569', bg: '#F8FAFC', icon: Wind },
};

const LESION_LABELS: Record<string, string> = {
  necrotic:  'Necrótica',
  chlorotic: 'Clorótica',
  aqueous:   'Aquosa',
  pustule:   'Pústula',
  mottled:   'Mosqueada',
  ringspot:  'Mancha-anel',
  mixed:     'Mista',
};

const PROGRESSION_CONFIG: Record<string, { label: string; color: string }> = {
  rapid:    { label: 'Rápida',   color: '#EF4444' },
  moderate: { label: 'Moderada', color: '#F59E0B' },
  slow:     { label: 'Lenta',    color: '#22C55E' },
};

const ALL_CROPS = Array.from(
  new Set(DISEASE_DATABASE.flatMap(d => d.affectedCrops))
).sort();

// ─── DiseaseCard ────────────────────────────────────────────────────────────

function DiseaseCard({ disease }: { disease: DiseasePattern }) {
  const [expanded, setExpanded] = useState(false);
  const typeConf = TYPE_CONFIG[disease.type];
  const TypeIcon = typeConf.icon;
  const progression = PROGRESSION_CONFIG[disease.characteristics.progression];

  const allTreatments = [
    ...(disease.treatment.fungicide || []),
    ...(disease.treatment.bactericide || []),
    ...(disease.treatment.cultural || []),
    ...(disease.treatment.preventive || []),
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card overflow-hidden"
      style={{ borderLeft: `3px solid ${typeConf.color}` }}
    >
      {/* Header row */}
      <button
        className="w-full text-left"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: typeConf.bg }}
          >
            <TypeIcon size={18} className="" style={{ color: typeConf.color } as React.CSSProperties} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-sm text-foreground">{disease.name}</span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                style={{ backgroundColor: typeConf.bg, color: typeConf.color }}
              >
                {typeConf.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground italic mt-0.5 truncate">{disease.scientificName}</p>
            {/* Quick chips */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: progression.color }} />
                {progression.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {LESION_LABELS[disease.lesionType] || disease.lesionType}
              </span>
            </div>
          </div>

          {/* Expand toggle */}
          <div className="text-muted-foreground mt-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3 border-t border-border/60 space-y-4">

              {/* Description */}
              {disease.notes && (
                <p className="text-xs text-muted-foreground leading-relaxed">{disease.notes}</p>
              )}

              {/* Characteristics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 rounded-xl bg-secondary">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Borda</p>
                  <p className="text-xs font-semibold capitalize mt-0.5">
                    {disease.characteristics.borderType === 'sharp' ? 'Definida'
                      : disease.characteristics.borderType === 'diffuse' ? 'Difusa'
                      : disease.characteristics.borderType === 'gradual' ? 'Gradual'
                      : 'Irregular'}
                  </p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-secondary">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Distribuição</p>
                  <p className="text-xs font-semibold capitalize mt-0.5">
                    {disease.characteristics.distribution === 'localized' ? 'Localizada'
                      : disease.characteristics.distribution === 'scattered' ? 'Espalhada'
                      : disease.characteristics.distribution === 'systemic' ? 'Sistêmica'
                      : disease.characteristics.distribution === 'marginal' ? 'Marginal'
                      : 'Internervural'}
                  </p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-secondary">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Halo</p>
                  <p className="text-xs font-semibold mt-0.5">{disease.characteristics.haloPresence ? 'Presente' : 'Ausente'}</p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-secondary">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Progressão</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: progression.color }}>
                    {progression.label}
                  </p>
                </div>
              </div>

              {/* Sporulation */}
              {disease.characteristics.sporulationPattern && disease.characteristics.sporulationPattern !== 'none' && (
                <div className="px-3 py-2 rounded-xl bg-secondary">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Esporulação</p>
                  <p className="text-xs text-foreground">{disease.characteristics.sporulationPattern}</p>
                </div>
              )}

              {/* Favorable conditions */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Thermometer size={12} className="text-muted-foreground" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Condições Favoráveis</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Thermometer size={11} className="text-orange-400" />
                    {disease.favorableConditions.temperature[0]}–{disease.favorableConditions.temperature[1]}°C
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Droplets size={11} className="text-blue-400" />
                    {disease.favorableConditions.humidity[0]}–{disease.favorableConditions.humidity[1]}%
                  </div>
                </div>
              </div>

              {/* Affected crops */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Leaf size={12} className="text-primary" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Culturas Afetadas</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {disease.affectedCrops.map(c => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent text-accent-foreground border border-border"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Treatments */}
              {allTreatments.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Pill size={12} className="text-muted-foreground" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Controle</p>
                  </div>

                  {disease.treatment.fungicide && disease.treatment.fungicide.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-amber-700 font-semibold mb-1">Fungicidas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {disease.treatment.fungicide.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {disease.treatment.bactericide && disease.treatment.bactericide.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-blue-700 font-semibold mb-1">Bactericidas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {disease.treatment.bactericide.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {disease.treatment.cultural && disease.treatment.cultural.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-green-700 font-semibold mb-1">Medidas Culturais</p>
                      <ul className="space-y-1">
                        {disease.treatment.cultural.map((t, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {disease.treatment.preventive && disease.treatment.preventive.length > 0 && (
                    <div>
                      <p className="text-[10px] text-primary font-semibold mb-1">Preventivo</p>
                      <ul className="space-y-1">
                        {disease.treatment.preventive.map((t, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* References */}
              {disease.references.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BookOpen size={11} className="text-muted-foreground" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Referências</p>
                  </div>
                  {disease.references.map((ref, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground italic border-l-2 border-border pl-2 mb-1">
                      {ref}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── DoencasTab ─────────────────────────────────────────────────────────────

type FilterType = 'all' | DiseasePattern['type'];

export function DoencasTab() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const { currentAnalysis } = useAnalysis();

  const filtered = useMemo(() => {
    return DISEASE_DATABASE.filter(d => {
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.scientificName.toLowerCase().includes(search.toLowerCase()) ||
        d.affectedCrops.some(c => c.toLowerCase().includes(search.toLowerCase()));

      const matchType = filterType === 'all' || d.type === filterType;
      const matchCrop = filterCrop === 'all' || d.affectedCrops.includes(filterCrop);

      return matchSearch && matchType && matchCrop;
    });
  }, [search, filterType, filterCrop]);

  // Stats
  const typeCount = useMemo(() => {
    const counts: Record<string, number> = {};
    DISEASE_DATABASE.forEach(d => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* Header */}
      <div className="gradient-banner">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={18} className="text-green-300" />
            <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Base de Conhecimento</span>
          </div>
          <h2 className="font-display text-white text-xl font-bold">Doenças Foliares</h2>
          <p className="text-green-200 text-sm mt-1">{DISEASE_DATABASE.length} doenças catalogadas</p>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(typeCount).map(([type, count]) => {
              const conf = TYPE_CONFIG[type as DiseasePattern['type']];
              return (
                <span
                  key={type}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white"
                >
                  {conf?.label || type} ({count})
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Last analysis diagnosis banner */}
      {currentAnalysis?.predictedDiseases && currentAnalysis.predictedDiseases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50"
        >
          <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800">Última análise detectou</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {currentAnalysis.predictedDiseases.map(d => d.name).join(', ')}
            </p>
          </div>
          <button
            className="text-[10px] font-semibold text-amber-700 underline flex-shrink-0"
            onClick={() => {
              const top = currentAnalysis.predictedDiseases![0];
              if (top) setSearch(top.name);
            }}
          >
            Ver
          </button>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar doença, agente ou cultura..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl text-sm"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            filterType === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-secondary-foreground border-border'
          }`}
        >
          Todas ({DISEASE_DATABASE.length})
        </button>
        {(Object.keys(TYPE_CONFIG) as Array<DiseasePattern['type']>).map(type => {
          const conf = TYPE_CONFIG[type];
          const count = typeCount[type] || 0;
          if (!count) return null;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                filterType === type
                  ? 'border-current'
                  : 'bg-secondary text-secondary-foreground border-border'
              }`}
              style={filterType === type ? { backgroundColor: conf.bg, color: conf.color, borderColor: conf.color } : {}}
            >
              {conf.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Crop filter */}
      <div>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
          <Leaf size={10} />Filtrar por Cultura
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterCrop('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filterCrop === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-secondary-foreground border-border'
            }`}
          >
            Todas
          </button>
          {ALL_CROPS.map(crop => (
            <button
              key={crop}
              onClick={() => setFilterCrop(filterCrop === crop ? 'all' : crop)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                filterCrop === crop
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-border'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'doença encontrada' : 'doenças encontradas'}
        </p>
        {(search || filterType !== 'all' || filterCrop !== 'all') && (
          <button
            onClick={() => { setSearch(''); setFilterType('all'); setFilterCrop('all'); }}
            className="text-xs text-primary font-semibold"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Disease list */}
      {filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center py-12 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Stethoscope size={28} className="text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Nenhuma doença encontrada</p>
          <p className="text-muted-foreground text-sm">Tente outros termos ou remova os filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(disease => (
            <DiseaseCard key={disease.id} disease={disease} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="text-center py-2">
        <p className="text-[11px] text-muted-foreground">
          Base de dados fitopatológica · Bergamin Filho et al. (2018) · CABI CPC
        </p>
      </div>

    </div>
  );
}


