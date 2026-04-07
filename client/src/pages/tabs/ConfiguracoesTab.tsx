/**
 * PhytoPathometric — ConfiguracoesTab
 * Settings tab: HSV and CIELAB threshold adjustment
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 */
import { Settings, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAnalysis } from '@/contexts/AnalysisContext';

const DEFAULT_SETTINGS = {
  hsvMinH: 25, hsvMaxH: 85,
  hsvMinS: 30, hsvMaxS: 255,
  hsvMinV: 30, hsvMaxV: 255,
  labLMin: 20, labLMax: 90,
  labAMin: -20, labAMax: 40,
  labBMin: -10, labBMax: 50,
};

interface SliderRowProps {
  label: string;
  minKey: string;
  maxKey: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSettings: (s: any) => void;
}

function SliderRow({ label, minKey, maxKey, min, max, step = 1, unit = '', settings, updateSettings }: SliderRowProps) {
  const minVal = settings[minKey];
  const maxVal = settings[maxKey];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
        <span className="text-xs font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md">
          {minVal}{unit} — {maxVal}{unit}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground w-6">Min</span>
          <Slider
            value={[minVal]}
            min={min}
            max={max}
            step={step}
            onValueChange={([v]) => updateSettings({ [minKey]: v })}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground w-6">Max</span>
          <Slider
            value={[maxVal]}
            min={min}
            max={max}
            step={step}
            onValueChange={([v]) => updateSettings({ [maxKey]: v })}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

export function ConfiguracoesTab() {
  const { settings, updateSettings } = useAnalysis();

  const handleReset = () => {
    updateSettings(DEFAULT_SETTINGS);
    toast.success('Configurações restauradas para os valores padrão.');
  };

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="card-phyto" style={{ background: 'linear-gradient(135deg, oklch(0.22 0.07 155), oklch(0.32 0.09 155))' }}>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={16} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Parâmetros de Segmentação</span>
        </div>
        <p className="text-white font-display font-bold text-lg">Configurações</p>
        <p className="text-green-200 text-xs mt-0.5">Ajuste fino dos limiares HSV e CIELAB</p>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Ajuste os limiares conforme a cultura e tipo de lesão. Valores padrão são calibrados para uso geral. Alterações afetam todas as análises futuras.
        </p>
      </div>

      {/* HSV Settings */}
      <div className="card-phyto space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="font-display font-semibold text-sm">Segmentação Foliar — Espaço HSV</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Define a faixa de cor para isolar o tecido foliar do plano de fundo
        </p>

        <SliderRow
          label="Matiz (Hue)"
          minKey="hsvMinH"
          maxKey="hsvMaxH"
          min={0}
          max={180}
          settings={settings}
          updateSettings={updateSettings}
        />
        <SliderRow
          label="Saturação (Saturation)"
          minKey="hsvMinS"
          maxKey="hsvMaxS"
          min={0}
          max={255}
          settings={settings}
          updateSettings={updateSettings}
        />
        <SliderRow
          label="Valor (Value/Brightness)"
          minKey="hsvMinV"
          maxKey="hsvMaxV"
          min={0}
          max={255}
          settings={settings}
          updateSettings={updateSettings}
        />
      </div>

      {/* CIELAB Settings */}
      <div className="card-phyto space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h3 className="font-display font-semibold text-sm">Detecção de Lesões — Espaço CIELAB</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Parâmetros para identificar necroses, cloroses e manchas aquosas
        </p>

        <SliderRow
          label="Luminância L*"
          minKey="labLMin"
          maxKey="labLMax"
          min={0}
          max={100}
          settings={settings}
          updateSettings={updateSettings}
        />
        <SliderRow
          label="Cromaticidade a* (verde↔vermelho)"
          minKey="labAMin"
          maxKey="labAMax"
          min={-128}
          max={128}
          settings={settings}
          updateSettings={updateSettings}
        />
        <SliderRow
          label="Cromaticidade b* (azul↔amarelo)"
          minKey="labBMin"
          maxKey="labBMax"
          min={-128}
          max={128}
          settings={settings}
          updateSettings={updateSettings}
        />
      </div>

      {/* Presets */}
      <div className="card-phyto">
        <h3 className="font-display font-semibold text-sm mb-3">Presets por Tipo de Lesão</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: 'Necrose (Geral)',
              desc: 'Manchas marrons escuras',
              color: '#92400E',
              bg: '#FEF3C7',
              settings: { hsvMinH: 10, hsvMaxH: 40, hsvMinS: 40, hsvMaxS: 255, hsvMinV: 20, hsvMaxV: 200, labLMin: 15, labLMax: 55, labAMin: 5, labAMax: 50, labBMin: 5, labBMax: 50 },
            },
            {
              label: 'Clorose',
              desc: 'Amarelamento foliar',
              color: '#713F12',
              bg: '#FEF9C3',
              settings: { hsvMinH: 20, hsvMaxH: 60, hsvMinS: 30, hsvMaxS: 255, hsvMinV: 80, hsvMaxV: 255, labLMin: 50, labLMax: 95, labAMin: -10, labAMax: 20, labBMin: 20, labBMax: 80 },
            },
            {
              label: 'Ferrugem',
              desc: 'Pústulas alaranjadas',
              color: '#9A3412',
              bg: '#FFF7ED',
              settings: { hsvMinH: 5, hsvMaxH: 30, hsvMinS: 80, hsvMaxS: 255, hsvMinV: 50, hsvMaxV: 220, labLMin: 30, labLMax: 70, labAMin: 15, labAMax: 60, labBMin: 10, labBMax: 60 },
            },
            {
              label: 'Padrão Geral',
              desc: 'Configuração balanceada',
              color: '#166534',
              bg: '#F0FDF4',
              settings: DEFAULT_SETTINGS,
            },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                updateSettings(preset.settings);
                toast.success(`Preset "${preset.label}" aplicado.`);
              }}
              className="text-left p-3 rounded-xl border border-border hover:border-primary/40 transition-all"
              style={{ backgroundColor: preset.bg }}
            >
              <p className="font-semibold text-xs" style={{ color: preset.color }}>{preset.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <Button
        variant="outline"
        onClick={handleReset}
        className="w-full gap-2"
      >
        <RotateCcw size={14} />
        Restaurar Padrões
      </Button>
    </div>
  );
}
