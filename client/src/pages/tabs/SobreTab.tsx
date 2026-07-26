/**
 * PhytoPathometric — SobreTab (Professional Redesign)
 * About tab: app identity, scientific methodology, team, references
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 */
import { motion } from 'framer-motion';
import {
  BookOpen, FlaskConical, Microscope, Leaf, GraduationCap,
  BarChart2, Shield, Cpu, Award, ChevronRight, Github,
  Layers, CheckCircle2, Zap, Database,
} from 'lucide-react';
import { severityConfig, SeverityLevel } from '@/contexts/AnalysisContext';

// ─── Data ───────────────────────────────────────────────────────────────────

const SEVERITY_LEVELS: SeverityLevel[] = ['saudavel', 'baixa', 'media', 'alta', 'critica'];

const STATS = [
  { value: '8+',    label: 'Doenças Catalogadas',  icon: Database },
  { value: '10+',   label: 'Culturas Suportadas',  icon: Leaf },
  { value: 'HSV',   label: '+ CIELAB Dual-Space',  icon: Cpu },
  { value: '100%',  label: 'Offline & Privado',    icon: Shield },
];

const PIPELINE_STEPS = [
  {
    step: '01',
    icon: '📷',
    title: 'Captura de Imagem',
    desc: 'Câmera ao vivo ou importação da galeria. Qualidade de campo é suficiente.',
    color: 'oklch(0.32 0.09 155)',
  },
  {
    step: '02',
    icon: '🔵',
    title: 'Pré-processamento',
    desc: 'Filtro gaussiano (kernel 3×3) para redução de ruído e suavização.',
    color: '#3B82F6',
  },
  {
    step: '03',
    icon: '🟢',
    title: 'Segmentação HSV',
    desc: 'Isolamento do tecido foliar por limiarização no canal Hue com erosão e dilatação morfológica.',
    color: '#22C55E',
  },
  {
    step: '04',
    icon: '🔬',
    title: 'Detecção CIELAB',
    desc: 'Identificação de lesões pelos canais L* (luminância), a* (vermelho-verde) e b* (amarelo-azul).',
    color: '#F59E0B',
  },
  {
    step: '05',
    icon: '📊',
    title: 'Cálculo de Severidade',
    desc: 'Severidade (%) = (Área lesionada / Área total) × 100 — fórmula de Bergamin Filho et al.',
    color: '#F97316',
  },
  {
    step: '06',
    icon: '💾',
    title: 'Diagnóstico & Exportação',
    desc: 'Matching com banco de doenças, geração de recomendações e exportação CSV/XLS.',
    color: '#8B5CF6',
  },
];

const TECH_STACK = [
  { name: 'React 19',         role: 'Interface',           color: '#61DAFB', bg: '#EFF6FF' },
  { name: 'TypeScript',       role: 'Tipagem',             color: '#3178C6', bg: '#EFF6FF' },
  { name: 'Vite',             role: 'Build',               color: '#646CFF', bg: '#F5F3FF' },
  { name: 'Tailwind CSS',     role: 'Estilo',              color: '#06B6D4', bg: '#ECFEFF' },
  { name: 'Capacitor',        role: 'Android/iOS',         color: '#119EFF', bg: '#EFF6FF' },
  { name: 'Framer Motion',    role: 'Animações',           color: '#FF0055', bg: '#FFF1F2' },
  { name: 'Recharts',         role: 'Gráficos',            color: '#22C55E', bg: '#F0FDF4' },
  { name: 'Canvas API',       role: 'Processamento',       color: '#F59E0B', bg: '#FFFBEB' },
];

const METHODOLOGY_SECTIONS = [
  {
    title: 'Espaço HSV — Segmentação Foliar',
    icon: Layers,
    color: '#22C55E',
    bg: '#F0FDF4',
    body: 'A segmentação utiliza o canal de matiz (Hue, H: 25°–85°) para isolar tecido verde do plano de fundo. Operações morfológicas de erosão e dilatação removem ruídos e preenchem buracos na máscara foliar.',
    formula: 'Máscara: H ∈ [25°, 85°] ∧ S > 30 ∧ V > 30',
  },
  {
    title: 'Espaço CIELAB — Detecção de Lesões',
    icon: Microscope,
    color: '#F59E0B',
    bg: '#FFFBEB',
    body: 'Lesões são detectadas pela análise tridimensional dos canais L* (luminância), a* (eixo vermelho-verde) e b* (eixo amarelo-azul). Necroses: L* baixo, a* alto. Cloroses: L* alto, b* alto.',
    formula: 'Lesão: ΔE*ab > limiar adaptativo por cultura',
  },
  {
    title: 'Validação Estatística',
    icon: Award,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    body: 'Validação por regressão linear (R²) e Coeficiente de Concordância de Lin (CCC) frente ao QUANT e avaliadores treinados, com amostras de 5% a 80% de severidade em condições controladas.',
    formula: 'CCC = 2σxy / (σ²x + σ²y + (μx − μy)²)',
  },
];

const REFERENCES = [
  { short: 'BERGAMIN FILHO et al., 2018', full: 'Manual de Fitopatologia, 5ª ed. Agronômica Ceres.' },
  { short: 'TAIZ et al., 2017',           full: 'Fisiologia e Desenvolvimento Vegetal, 6ª ed. Artmed.' },
  { short: 'GONZALEZ & WOODS, 2018',      full: 'Digital Image Processing, 4ª ed. Pearson.' },
  { short: 'BRADSKI & KAEHLER, 2008',     full: "Learning OpenCV. O'Reilly Media." },
  { short: 'VALE et al., 2003',           full: 'QUANT: software for plant disease severity assessment. ICPP.' },
];

const CROPS = [
  'Soja', 'Milho', 'Feijão', 'Café', 'Trigo',
  'Cana-de-açúcar', 'Arroz', 'Algodão', 'Tomate', 'Batata',
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

// ─── Component ──────────────────────────────────────────────────────────────

export function SobreTab() {
  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(135deg, oklch(0.16 0.07 155) 0%, oklch(0.28 0.09 155) 60%, oklch(0.38 0.11 155) 100%)' }}
      >
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative z-10 p-6 flex flex-col items-center text-center gap-4">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-white/20">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
              alt="PhytoPathometric"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Title */}
          <div>
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">
              PhytoPathometric
            </h1>
            <p className="text-green-300 text-sm mt-1 font-medium">
              Quantificação Automatizada de Doenças Foliares
            </p>
          </div>
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold">
              v1.0.0
            </span>
            <span className="px-3 py-1 rounded-full bg-green-400/20 border border-green-400/30 text-green-300 text-xs font-semibold">
              Código Aberto
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              PIBITI · CNPq
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── STATS GRID ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="glass-card flex flex-col items-center text-center py-4 gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <stat.icon size={16} className="text-primary" />
            </div>
            <p className="font-display font-bold text-xl text-foreground leading-none">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── ABOUT ───────────────────────────────────────────────────────── */}
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: 'oklch(0.42 0.12 155)' }} />
          <h2 className="font-display font-bold text-base text-foreground">Sobre o Projeto</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong className="text-foreground">PhytoPathometric</strong> é um sistema de visão computacional para análise fitopatométrica automatizada em tempo real. Integra segmentação colorimétrica dual (HSV + CIELAB) para quantificar com precisão a severidade de doenças foliares.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Derivado dos termos gregos <em className="text-foreground">phyto</em> (planta), <em className="text-foreground">pathos</em> (doença) e <em className="text-foreground">metron</em> (medida), o sistema oferece resultados comparáveis ao software QUANT, validado por regressão linear e CCC.
        </p>
        {/* Highlights */}
        <div className="space-y-2 pt-1">
          {[
            'Processamento 100% local — sem envio de dados',
            'Banco de 8+ doenças com assinaturas espectrais',
            'Exportação CSV / XLS para análise científica',
            'APK Android via Capacitor',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEVERITY SCALE ──────────────────────────────────────────────── */}
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: 'oklch(0.42 0.12 155)' }} />
          <h2 className="font-display font-bold text-base text-foreground">Escala de Severidade</h2>
        </div>
        <div className="space-y-1.5">
          {SEVERITY_LEVELS.map((level, i) => {
            const config = severityConfig[level];
            const widths = ['10%', '24%', '49%', '74%', '100%'];
            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                {/* Color dot */}
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: config.color }} />
                {/* Label */}
                <span className="w-16 text-xs font-bold flex-shrink-0" style={{ color: config.textColor }}>
                  {config.label}
                </span>
                {/* Progress bar */}
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: widths[i] }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                </div>
                {/* Range */}
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.bgColor, color: config.textColor }}
                >
                  {config.range}
                </span>
              </motion.div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground italic pt-1">
          Bergamin Filho et al. (2018) · Severidade (%) = (Área lesionada / Área total) × 100
        </p>
      </div>

      {/* ── PIPELINE ────────────────────────────────────────────────────── */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: 'oklch(0.42 0.12 155)' }} />
          <h2 className="font-display font-bold text-base text-foreground">Pipeline de Processamento</h2>
        </div>
        <div className="space-y-3">
          {PIPELINE_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3"
            >
              {/* Step number + connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.step}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="w-px h-4 bg-border mt-1" />
                )}
              </div>
              {/* Content */}
              <div className="pb-2">
                <p className="font-semibold text-sm text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── METHODOLOGY ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-5 rounded-full" style={{ background: 'oklch(0.42 0.12 155)' }} />
          <h2 className="font-display font-bold text-base text-foreground">Fundamento Científico</h2>
        </div>
        {METHODOLOGY_SECTIONS.map((sec, i) => (
          <motion.div
            key={sec.title}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="glass-card space-y-2"
            style={{ borderLeft: `3px solid ${sec.color}` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: sec.bg }}>
                <sec.icon size={14} style={{ color: sec.color }} />
              </div>
              <p className="font-display font-semibold text-sm text-foreground">{sec.title}</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{sec.body}</p>
            <div className="px-3 py-2 rounded-lg bg-secondary border border-border">
              <p className="text-[11px] font-mono text-foreground">{sec.formula}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── TECH STACK ──────────────────────────────────────────────────── */}
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: 'oklch(0.42 0.12 155)' }} />
          <h2 className="font-display font-bold text-base text-foreground">Stack Tecnológico</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border"
              style={{ backgroundColor: tech.bg }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tech.color }} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{tech.name}</p>
                <p className="text-[10px] text-muted-foreground">{tech.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SUPPORTED CROPS ─────────────────────────────────────────────── */}
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: 'oklch(0.42 0.12 155)' }} />
          <h2 className="font-display font-bold text-base text-foreground">Culturas Suportadas</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {CROPS.map(c => (
            <span
              key={c}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium text-foreground"
            >
              <Leaf size={10} className="text-primary" />
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ── INSTITUTION ─────────────────────────────────────────────────── */}
      <div
        className="gradient-banner"
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="space-y-1">
            <p className="font-display font-bold text-white text-base">IFB</p>
            <p className="text-green-200 text-xs leading-relaxed">
              Instituto Federal de Educação, Ciência e Tecnologia de Brasília
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['PRPI', 'PIBITI', 'CNPq', 'Fitopatologia'].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── REFERENCES ──────────────────────────────────────────────────── */}
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ background: 'oklch(0.42 0.12 155)' }} />
          <h2 className="font-display font-bold text-base text-foreground">Referências Bibliográficas</h2>
        </div>
        <div className="space-y-2">
          {REFERENCES.map((ref, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[10px] font-bold text-primary bg-accent px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">
                [{i + 1}]
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">{ref.short}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{ref.full}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-primary" />
          <p className="text-xs font-semibold text-foreground">PhytoPathometric v1.0.0</p>
        </div>
        <p className="text-[11px] text-muted-foreground text-center max-w-xs leading-relaxed">
          Desenvolvido com React · TypeScript · Canvas API · HSV + CIELAB<br />
          IFB/PIBITI · CNPq · 2026–2027 · Código Aberto
        </p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border">
          <Github size={12} className="text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-medium">Código aberto · MIT License</span>
        </div>
      </div>

    </div>
  );
}


