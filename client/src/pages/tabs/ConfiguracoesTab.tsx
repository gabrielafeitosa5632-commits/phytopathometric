/**
 * PhytoPathometric — ConfiguracoesTab
 */
import { Settings, RotateCcw, Info, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const handleReset = () => {
    updateSettings(DEFAULT_SETTINGS);
    toast.success(t('settings.reset'));
  };

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
              <Settings size={14} className="text-emerald-300" />
            </div>
            <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest">{t('settings.title')}</span>
          </div>
          <h2 className="font-display text-white text-2xl font-bold tracking-tight">{t('settings.title')}</h2>
          <p className="text-emerald-200/70 text-sm mt-1 font-medium">HSV + CIELAB</p>
        </div>
      </motion.div>

      {/* Language + Dark Mode — visible here for mobile convenience */}
      <div className="glass-card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <p className="text-sm font-semibold text-foreground">{t('settings.language')}</p>
          </div>
          <LanguageSwitcher />
        </div>
        {toggleTheme && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-muted-foreground" />}
              <p className="text-sm font-semibold text-foreground">{t('settings.darkMode')}</p>
            </div>
            <button onClick={toggleTheme}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-primary' : 'bg-secondary border border-border'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
        <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          {t('settings.hsv')} · {t('settings.lab')}
        </p>
      </div>

      {/* HSV Settings */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h3 className="font-display font-semibold text-sm">{t('settings.hsv')}</h3>
        </div>
        <SliderRow label="Hue (Matiz)" minKey="hsvMinH" maxKey="hsvMaxH" min={0} max={180} settings={settings} updateSettings={updateSettings} />
        <SliderRow label="Saturation" minKey="hsvMinS" maxKey="hsvMaxS" min={0} max={255} settings={settings} updateSettings={updateSettings} />
        <SliderRow label="Value / Brightness" minKey="hsvMinV" maxKey="hsvMaxV" min={0} max={255} settings={settings} updateSettings={updateSettings} />
      </div>

      {/* CIELAB Settings */}
      <div className="glass-card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h3 className="font-display font-semibold text-sm">{t('settings.lab')}</h3>
        </div>
        <SliderRow label="Luminance L*" minKey="labLMin" maxKey="labLMax" min={0} max={100} settings={settings} updateSettings={updateSettings} />
        <SliderRow label="Chromaticity a* (green↔red)" minKey="labAMin" maxKey="labAMax" min={-128} max={128} settings={settings} updateSettings={updateSettings} />
        <SliderRow label="Chromaticity b* (blue↔yellow)" minKey="labBMin" maxKey="labBMax" min={-128} max={128} settings={settings} updateSettings={updateSettings} />
      </div>

      {/* Presets */}
      <div className="card-phyto">
        <h3 className="font-display font-semibold text-sm mb-3">{t('settings.presets')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Necrosis', desc: 'Dark brown spots', color: '#92400E', bg: '#FEF3C7',
              settings: { hsvMinH: 10, hsvMaxH: 40, hsvMinS: 40, hsvMaxS: 255, hsvMinV: 20, hsvMaxV: 200, labLMin: 15, labLMax: 55, labAMin: 5, labAMax: 50, labBMin: 5, labBMax: 50 } },
            { label: 'Chlorosis', desc: 'Yellow leaf', color: '#713F12', bg: '#FEF9C3',
              settings: { hsvMinH: 20, hsvMaxH: 60, hsvMinS: 30, hsvMaxS: 255, hsvMinV: 80, hsvMaxV: 255, labLMin: 50, labLMax: 95, labAMin: -10, labAMax: 20, labBMin: 20, labBMax: 80 } },
            { label: 'Rust', desc: 'Orange pustules', color: '#9A3412', bg: '#FFF7ED',
              settings: { hsvMinH: 5, hsvMaxH: 30, hsvMinS: 80, hsvMaxS: 255, hsvMinV: 50, hsvMaxV: 220, labLMin: 30, labLMax: 70, labAMin: 15, labAMax: 60, labBMin: 10, labBMax: 60 } },
            { label: 'Default', desc: 'Balanced config', color: '#166534', bg: '#F0FDF4',
              settings: DEFAULT_SETTINGS },
          ].map(preset => (
            <button key={preset.label} onClick={() => { updateSettings(preset.settings); toast.success(`Preset "${preset.label}" applied.`); }}
              className="text-left p-3 rounded-xl border border-border hover:border-primary/40 transition-all"
              style={{ backgroundColor: preset.bg }}>
              <p className="font-semibold text-xs" style={{ color: preset.color }}>{preset.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <Button variant="outline" onClick={handleReset} className="w-full gap-2">
        <RotateCcw size={14} />
        {t('settings.reset')}
      </Button>
    </div>
  );
}


