/**
 * PhytoPathometric — Landing Page
 * Design: AgTech Dashboard Moderno
 * Colors: Emerald forest green + cream background
 * Font: Plus Jakarta Sans (body) + Syne (display)
 */
import { motion, type Variants } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  Leaf,
  Microscope,
  BarChart3,
  Shield,
  ChevronRight,
  FlaskConical,
  Camera,
  FileDown,
  Sprout,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Microscope,
    title: 'Análise HSV + CIELAB',
    desc: 'Segmentação avançada de lesões foliares com algoritmos de visão computacional em tempo real.',
  },
  {
    icon: Camera,
    title: 'Câmera ao Vivo',
    desc: 'Capture folhas diretamente pelo celular ou faça upload de imagens da galeria.',
  },
  {
    icon: BarChart3,
    title: 'Histórico & Gráficos',
    desc: 'Acompanhe a evolução da severidade ao longo do tempo com gráficos interativos.',
  },
  {
    icon: FileDown,
    title: 'Exportar CSV / XLS',
    desc: 'Exporte seus dados para análises em planilhas com um único toque.',
  },
  {
    icon: FlaskConical,
    title: 'Base de Doenças',
    desc: 'Banco de dados com 8+ doenças, assinaturas espectrais e recomendações de tratamento.',
  },
  {
    icon: Shield,
    title: '100% Offline',
    desc: 'Todo o processamento acontece no dispositivo. Sem enviar dados para servidores.',
  },
];

const severityLevels = [
  { label: 'Saudável', range: '0–9%', color: '#22C55E', bg: '#F0FDF4' },
  { label: 'Baixa', range: '10–24%', color: '#84CC16', bg: '#F7FEE7' },
  { label: 'Média', range: '25–49%', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Alta', range: '50–74%', color: '#F97316', bg: '#FFF7ED' },
  { label: 'Crítica', range: '75–100%', color: '#EF4444', bg: '#FEF2F2' },
];

const crops = ['Soja', 'Milho', 'Feijão', 'Café', 'Trigo', 'Cana', 'Arroz', 'Tomate', 'Batata', 'Algodão'];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50"
        style={{
          background: 'oklch(1 0 0 / 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid oklch(0.88 0.018 138 / 0.5)',
          boxShadow: '0 1px 0 0 oklch(0.88 0.018 138 / 0.3)',
        }}>
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, oklch(0.35 0.12 155), oklch(0.52 0.18 155))',
                boxShadow: '0 4px 12px oklch(0.35 0.12 155 / 0.30)',
              }}>
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-base text-foreground tracking-tight">PhytoPathometric</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all btn-primary-glow"
                style={{ background: 'linear-gradient(135deg, oklch(0.38 0.14 155), oklch(0.28 0.10 155))' }}
              >
                Abrir App
                <ChevronRight size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all btn-primary-glow"
                  style={{ background: 'linear-gradient(135deg, oklch(0.38 0.14 155), oklch(0.28 0.10 155))' }}
                >
                  Criar conta
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, oklch(0.18 0.07 155) 0%, oklch(0.28 0.09 155) 50%, oklch(0.38 0.10 155) 100%)',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-28 flex flex-col items-center text-center gap-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-400/40 bg-green-900/30 text-green-300 text-xs font-semibold"
          >
            <Sprout size={12} />
            PIBITI/IFB · Fitopatologia Digital
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display font-bold text-white text-4xl md:text-6xl leading-tight max-w-3xl"
          >
            Quantifique Doenças em{' '}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #52B788, #B7E4C7)' }}>
              Plantas
            </span>{' '}
            com Precisão Científica
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-green-200 text-base md:text-lg max-w-xl leading-relaxed"
          >
            Análise fitopatométrica automatizada usando segmentação HSV + CIELAB.
            Resultados em segundos, direto no seu celular — sem internet.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 mt-2"
          >
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => navigate('/app')}
                className="h-12 px-8 rounded-xl font-semibold gap-2 text-base"
                style={{ background: 'linear-gradient(135deg, #52B788, #2D6A4F)' }}
              >
                <Microscope size={18} />
                Continuar como {user?.name?.split(' ')[0]}
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="h-12 px-8 rounded-xl font-semibold gap-2 text-base btn-primary-glow"
                  style={{ background: 'linear-gradient(135deg, #52B788, #2D6A4F)' }}
                >
                  <Sprout size={18} />
                  Começar Gratuitamente
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="h-12 px-8 rounded-xl font-semibold gap-2 text-base border-green-400/40 text-green-200 hover:bg-green-900/30"
                >
                  Já tenho conta
                </Button>
              </>
            )}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1.5 text-green-300/70 text-xs"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="currentColor" />
            ))}
            <span className="ml-1">Pesquisa IFB · CNPq · Uso científico</span>
          </motion.div>
        </div>
      </section>

      {/* ── SEVERITY SCALE ──────────────────────────────────────────────── */}
      <section className="bg-card border-y border-border/60 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Escala de Severidade
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {severityLevels.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold"
                style={{ background: s.bg, borderColor: s.color + '40', color: s.color }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
                <span className="font-normal text-xs opacity-70">{s.range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-10"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-semibold text-primary uppercase tracking-widest mb-2"
          >
            Funcionalidades
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-display font-bold text-2xl md:text-3xl text-foreground"
          >
            Tudo que você precisa em campo
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="glass-card card-lift flex flex-col gap-3"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.35 0.12 155 / 0.15), oklch(0.55 0.18 155 / 0.08))',
                  border: '1px solid oklch(0.35 0.12 155 / 0.20)',
                }}
              >
                <f.icon size={20} style={{ color: 'oklch(0.38 0.14 155)' }} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CROPS ───────────────────────────────────────────────────────── */}
      <section className="bg-secondary/50 border-y border-border/60 py-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Culturas Suportadas
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {crops.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-medium text-foreground"
              >
                <Leaf size={12} className="text-primary" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Como Funciona
          </p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
            3 passos simples
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Fotografe a Folha', desc: 'Use a câmera ao vivo ou importe da galeria. Qualidade de campo é suficiente.', icon: Camera },
            { step: '02', title: 'Processe', desc: 'O app aplica HSV + CIELAB para identificar pixels saudáveis e lesionados automaticamente.', icon: FlaskConical },
            { step: '03', title: 'Analise os Resultados', desc: 'Veja a severidade em %, gauge visual e salve no histórico para comparação futura.', icon: BarChart3 },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ background: 'linear-gradient(135deg, oklch(0.22 0.07 155), oklch(0.38 0.11 155))' }}
                >
                  <item.icon size={28} className="text-white" />
                </div>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'oklch(0.52 0.14 155)' }}
                >
                  {item.step}
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, oklch(0.20 0.07 155) 0%, oklch(0.32 0.10 155) 100%)',
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center"
          >
            <Microscope size={32} className="text-green-300" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-3xl text-white"
          >
            Pronto para analisar?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-green-200 text-base leading-relaxed"
          >
            Crie sua conta gratuita e comece a quantificar doenças foliares com precisão científica.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="h-12 px-8 rounded-xl font-semibold gap-2"
              style={{ background: 'linear-gradient(135deg, #52B788, #2D6A4F)' }}
            >
              <Sprout size={18} />
              Criar conta grátis
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="h-12 px-8 rounded-xl font-semibold border-green-400/40 text-green-200 hover:bg-green-900/30"
            >
              Já tenho conta
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-card py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Leaf size={12} className="text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm text-foreground">PhytoPathometric</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Desenvolvido no IFB · PIBITI/CNPq · Uso científico e educacional
          </p>
          <p className="text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </footer>

    </div>
  );
}
