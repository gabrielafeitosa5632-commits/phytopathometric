/**
 * PhytoPathometric — SobreTab
 * About tab: app info, severity scale, methodology, references
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 */
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, Microscope, Leaf, GraduationCap, BarChart2, Info, ExternalLink } from 'lucide-react';
import { severityConfig, SeverityLevel } from '@/contexts/AnalysisContext';

const SEVERITY_LEVELS: SeverityLevel[] = ['saudavel', 'baixa', 'media', 'alta', 'critica'];

const PIPELINE_STEPS = [
  { icon: '📷', title: 'Captura', desc: 'Frame capturado por câmera integrada ou USB' },
  { icon: '🔵', title: 'Pré-processamento', desc: 'Filtro gaussiano para redução de ruído' },
  { icon: '🟢', title: 'Segmentação HSV', desc: 'Isolamento da região foliar por limiarização no canal Hue' },
  { icon: '🔬', title: 'Detecção CIELAB', desc: 'Identificação de lesões por análise colorimétrica L*, a*, b*' },
  { icon: '📊', title: 'Cálculo', desc: 'Severidade (%) = (Área lesionada / Área total) × 100' },
  { icon: '💾', title: 'Exportação', desc: 'Histórico salvo localmente, exportável em CSV e XLS' },
];

const REFERENCES = [
  'BERGAMIN FILHO et al. Manual de Fitopatologia, 5ª ed. 2018.',
  'TAIZ et al. Fisiologia e Desenvolvimento Vegetal, 6ª ed. 2017.',
  'GONZALEZ & WOODS. Digital Image Processing, 4ª ed. 2018.',
  'BRADSKI & KAEHLER. Learning OpenCV. O\'Reilly, 2008.',
  'VALE et al. QUANT: software for plant disease severity. ICPP, 2003.',
];

export function SobreTab() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-6 gap-3"
      >
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/app-logo-leaf-Eg8fujPkxBbtrcXnfShJLP.webp"
            alt="PhytoPathometric logo"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-foreground">PhytoPathometric</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Quantificação Automatizada de Doenças Foliares</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold border border-border">
              v1.0.0
            </span>
            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold border border-border">
              Código Aberto
            </span>
          </div>
        </div>
      </motion.div>

      {/* About card */}
      <div className="card-phyto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <Info size={15} className="text-primary" />
          </div>
          <h2 className="font-display font-semibold text-base">Sobre o Aplicativo</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong className="text-foreground">PhytoPathometric</strong> é uma solução de código aberto desenvolvida em Python/Web, integrando visão computacional e interface gráfica para análise fitopatométrica automatizada em tempo real. Derivado dos termos gregos <em>phyto</em> (planta), <em>pathos</em> (doença) e <em>metron</em> (medida).
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Desenvolvido no âmbito do <strong className="text-foreground">PIBITI/IFB</strong> — Instituto Federal de Educação, Ciência e Tecnologia de Brasília, área de Fitossanidade – Fitopatologia (CNPq: 5.01.02.00-0).
        </p>
      </div>

      {/* Severity scale */}
      <div className="card-phyto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <BarChart2 size={15} className="text-primary" />
          </div>
          <h2 className="font-display font-semibold text-base">Escala de Severidade</h2>
        </div>
        <div className="space-y-2">
          {SEVERITY_LEVELS.map((level, i) => {
            const config = severityConfig[level];
            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: config.textColor }}>
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{config.description}</span>
                  </div>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: config.bgColor, color: config.textColor }}
                >
                  {config.range}
                </span>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Baseado em: Bergamin Filho et al. (2018). Severidade (%) = (Área lesionada / Área total) × 100
        </p>
      </div>

      {/* Pipeline */}
      <div className="card-phyto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <FlaskConical size={15} className="text-primary" />
          </div>
          <h2 className="font-display font-semibold text-base">Pipeline de Processamento</h2>
        </div>
        <div className="space-y-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-sm flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="card-phyto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <Microscope size={15} className="text-primary" />
          </div>
          <h2 className="font-display font-semibold text-base">Fundamento Científico</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1">Espaço HSV — Segmentação Foliar</p>
            <p className="leading-relaxed">
              A segmentação da folha utiliza limiarização no canal de matiz (Hue) do espaço HSV, isolando tecido vegetal do plano de fundo com operações morfológicas de erosão e dilatação.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1">Espaço CIELAB — Detecção de Lesões</p>
            <p className="leading-relaxed">
              Lesões são detectadas pela análise dos canais L* (luminância), a* (vermelho-verde) e b* (amarelo-azul). Necroses apresentam alta a* e baixa L*; cloroses exibem alta b* (Taiz et al., 2017).
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1">Validação</p>
            <p className="leading-relaxed">
              Validação por regressão linear (R²) e Coeficiente de Concordância de Lin (CCC) frente ao QUANT e avaliadores treinados, com amostras de 5% a 80% de severidade.
            </p>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/hero-leaf-analysis-8yVvnseGjjkeDxZZdsVdTB.webp"
          alt="Folha com lesões foliares"
          className="w-full h-40 object-cover"
        />
        <div className="bg-secondary px-4 py-2">
          <p className="text-xs text-muted-foreground italic">
            Exemplo de folha com lesões necróticas e cloróticas — alvo de análise do PhytoPathometric
          </p>
        </div>
      </div>

      {/* Culturas */}
      <div className="card-phyto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <Leaf size={15} className="text-primary" />
          </div>
          <h2 className="font-display font-semibold text-base">Culturas Suportadas</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Soja', 'Milho', 'Feijão', 'Café', 'Trigo', 'Cana-de-açúcar', 'Arroz', 'Algodão', 'Tomate', 'Batata'].map(c => (
            <span key={c} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* References */}
      <div className="card-phyto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <BookOpen size={15} className="text-primary" />
          </div>
          <h2 className="font-display font-semibold text-base">Referências</h2>
        </div>
        <div className="space-y-2">
          {REFERENCES.map((ref, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
              {ref}
            </p>
          ))}
        </div>
      </div>

      {/* Institution */}
      <div className="card-phyto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <GraduationCap size={15} className="text-primary" />
          </div>
          <h2 className="font-display font-semibold text-base">Instituição</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">IFB</strong> — Instituto Federal de Educação, Ciência e Tecnologia de Brasília<br />
          Pró-Reitoria de Pesquisa e Inovação (PRPI)<br />
          Programa PIBITI — CNPq<br />
          Área: Ciências Agrárias / Fitossanidade – Fitopatologia
        </p>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          PhytoPathometric v1.0.0 · Código Aberto · IFB/PIBITI 2026–2027
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Desenvolvido com Python, OpenCV, HSV + CIELAB
        </p>
      </div>
    </div>
  );
}
