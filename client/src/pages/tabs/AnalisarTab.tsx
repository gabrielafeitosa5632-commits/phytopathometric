/**
 * PhytoPathometric — Analysis Dashboard (Production v3)
 * Research-grade UI with: crop detection, tissue segmentation, heatmap,
 * disease confidence, supporting symptoms, treatment breakdown, explainability.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Upload, Loader2, RotateCcw, Save, ChevronDown, ChevronUp,
  Leaf, FlaskConical, Microscope, AlertTriangle, Stethoscope, ShieldCheck,
  Eye, Zap, Activity, Info, CheckCircle2, XCircle, Thermometer,
  Droplets, Bug, Sprout, TrendingUp, BarChart3,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAnalysis, severityConfig } from '@/contexts/AnalysisContext';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { SeverityGauge } from '@/components/SeverityGauge';
import { CameraPreview } from '@/components/CameraPreview';
import { useI18n } from '@/contexts/I18nContext';
import { useLoading } from '@/contexts/LoadingContext';
import type { TreatmentDetail } from '@/contexts/AnalysisContext';

// ─── Crop list ────────────────────────────────────────────────────────────────
const CULTURAS = [
  { label: '🌾 Wheat', value: 'Wheat' },
  { label: '🌾 Rice', value: 'Rice' },
  { label: '🌽 Maize', value: 'Maize' },
  { label: '🫘 Soybean', value: 'Soybean' },
  { label: '🌿 Cotton', value: 'Cotton' },
  { label: '🍅 Tomato', value: 'Tomato' },
  { label: '🥔 Potato', value: 'Potato' },
  { label: '🎋 Sugarcane', value: 'Sugarcane' },
  { label: '☕ Coffee', value: 'Coffee' },
  { label: '🫘 Bean', value: 'Bean' },
  { label: '🌾 Barley', value: 'Barley' },
  { label: '❓ Other', value: 'Other' },
];

// ─── Helper: normalize treatment (old array or new object) ───────────────────
function normalizeTreatment(t: string[] | TreatmentDetail | undefined): TreatmentDetail {
  if (!t) return { organic: [], chemical: [], preventive: [] };
  if (Array.isArray(t)) return { organic: [], chemical: t.slice(0, 3), preventive: t.slice(3) };
  return t;
}

// ─── Disease type badge ───────────────────────────────────────────────────────
function DiseaseTypeBadge({ type }: { type: string }) {
  const cfg: Record<string, { color: string; bg: string; label: string }> = {
    fungal:        { color: '#92400E', bg: '#FEF3C7', label: '🍄 Fungal' },
    bacterial:     { color: '#1E40AF', bg: '#DBEAFE', label: '🦠 Bacterial' },
    viral:         { color: '#7C3AED', bg: '#EDE9FE', label: '🧬 Viral' },
    physiological: { color: '#065F46', bg: '#D1FAE5', label: '⚗️ Physiological' },
    abiotic:       { color: '#374151', bg: '#F3F4F6', label: '☀️ Abiotic' },
    healthy:       { color: '#166534', bg: '#F0FDF4', label: '✅ Healthy' },
  };
  const c = cfg[type] ?? cfg.fungal;
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

// ─── Tissue bar ───────────────────────────────────────────────────────────────
function TissueBar({ healthy, chlorotic, necrotic, damaged }: {
  healthy: number; chlorotic: number; necrotic: number; damaged: number;
}) {
  const total = healthy + chlorotic + necrotic + damaged;
  const pct = (v: number) => total > 0 ? `${((v / total) * 100).toFixed(1)}%` : '0%';
  return (
    <div className="space-y-2">
      <div className="flex h-4 rounded-full overflow-hidden gap-px">
        {healthy > 0 && <div style={{ width: pct(healthy), background: '#22C55E' }} title={`Healthy: ${healthy.toFixed(1)}%`} />}
        {chlorotic > 0 && <div style={{ width: pct(chlorotic), background: '#EAB308' }} title={`Chlorotic: ${chlorotic.toFixed(1)}%`} />}
        {necrotic > 0 && <div style={{ width: pct(necrotic), background: '#EF4444' }} title={`Necrotic: ${necrotic.toFixed(1)}%`} />}
        {damaged > 0 && <div style={{ width: pct(damaged), background: '#F97316' }} title={`Damaged: ${damaged.toFixed(1)}%`} />}
      </div>
      <div className="flex flex-wrap gap-2 text-[10px]">
        {[
          { label: 'Healthy', val: healthy, color: '#22C55E' },
          { label: 'Chlorotic', val: chlorotic, color: '#EAB308' },
          { label: 'Necrotic', val: necrotic, color: '#EF4444' },
          { label: 'Damaged', val: damaged, color: '#F97316' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1 font-medium" style={{ color: '#555' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            {item.label}: {item.val.toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Confidence ring ──────────────────────────────────────────────────────────
function ConfidenceRing({ pct }: { pct: number }) {
  const color = pct >= 75 ? '#EF4444' : pct >= 55 ? '#F97316' : pct >= 40 ? '#EAB308' : '#22C55E';
  const r = 20, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={52} height={52} className="rotate-[-90deg]">
        <circle cx={26} cy={26} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
        <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-bold" style={{ color, marginTop: -36 }}>{pct}%</span>
      <span style={{ marginTop: 22 }} className="text-[9px] text-gray-400 font-medium">confidence</span>
    </div>
  );
}

// ─── Image quality error card ─────────────────────────────────────────────────
function QualityErrorCard({ issue }: { issue: string }) {
  const msgs: Record<string, { title: string; desc: string; fix: string }> = {
    blurry:          { title: 'Image Too Blurry', desc: 'The image lacks sharpness needed for accurate analysis.', fix: 'Hold camera steady, ensure good lighting, tap to focus on the leaf.' },
    low_resolution:  { title: 'Low Resolution', desc: 'Image resolution is insufficient for detailed analysis.', fix: 'Use a higher resolution camera or move closer to the leaf.' },
    not_a_leaf:      { title: 'No Leaf Detected', desc: 'The AI could not identify a plant leaf in this image.', fix: 'Capture a clear close-up of a single leaf against a plain background.' },
    no_plant_detected: { title: 'No Plant Detected', desc: 'No plant material was found in the image.', fix: 'Make sure the leaf fills most of the frame.' },
    too_dark:        { title: 'Image Too Dark', desc: 'Insufficient lighting for reliable color analysis.', fix: 'Capture in natural daylight or use flash lighting.' },
    too_bright:      { title: 'Image Overexposed', desc: 'Too much light is washing out color information.', fix: 'Reduce direct sunlight, use shade or diffused lighting.' },
  };
  const m = msgs[issue] ?? { title: 'Invalid Image', desc: 'Image could not be processed.', fix: 'Please upload a clear leaf photograph.' };
  return (
    <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <XCircle size={20} className="text-red-500" />
        </div>
        <div>
          <p className="font-bold text-red-700 text-sm">{m.title}</p>
          <p className="text-xs text-red-600 mt-0.5">{m.desc}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-red-100">
        <Info size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600"><span className="font-semibold">How to fix: </span>{m.fix}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AnalisarTab() {
  const { settings, setCurrentAnalysis, addToHistory, isAnalyzing, setIsAnalyzing } = useAnalysis();
  const { processImage } = useImageProcessor();
  const { t } = useI18n();
  const { startLoading, stopLoading } = useLoading();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cultura, setCultura] = useState('Wheat');
  const [observacoes, setObservacoes] = useState('');
  const [result, setResult] = useState<ReturnType<typeof useAnalysis>['currentAnalysis']>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [aiStatus, setAiStatus] = useState<'unknown' | 'ok' | 'offline'>('unknown');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/analyze-disease', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: true }),
    })
      .then(async r => {
        if (r.status === 404) { setAiStatus('offline'); return; }
        const d = await r.json().catch(() => ({})) as { gemini?: boolean };
        setAiStatus(d.gemini === true ? 'ok' : 'offline');
      })
      .catch(() => setAiStatus('offline'));
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image too large. Max 20MB allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => { setSelectedImage(e.target?.result as string); setResult(null); };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) { toast.error('Select an image first.'); return; }
    setIsAnalyzing(true);
    startLoading();
    try {
      const analysis = await processImage(selectedImage, cultura, settings, observacoes || undefined);
      setResult(analysis);
      setCurrentAnalysis(analysis);
      addToHistory(analysis);
      if (analysis.image_valid === false) {
        toast.warning(`Image issue: ${analysis.image_quality_issue ?? 'invalid image'}`);
      } else {
        const primary = analysis.predictedDiseases?.[0];
        toast.success(`Analysis complete! ${primary?.name ?? 'Healthy'} — Severity: ${analysis.severidade.toFixed(1)}%`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error processing image. Please try again.');
    } finally {
      setIsAnalyzing(false);
      stopLoading();
    }
  }, [selectedImage, cultura, settings, observacoes, processImage, setIsAnalyzing, setCurrentAnalysis, addToHistory, startLoading, stopLoading]);

  const handleReset = useCallback(() => {
    setSelectedImage(null); setResult(null); setObservacoes('');
    setShowDetails(false); setShowHeatmap(false);
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* ── Header ── */}
      <div className="gradient-banner">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'oklch(1 0 0 / 0.12)', border: '1px solid oklch(1 0 0 / 0.15)' }}>
              <Microscope size={14} className="text-emerald-300" />
            </div>
            <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest">Phytopathometric Analysis</span>
          </div>
          <h2 className="font-display text-white text-2xl font-bold tracking-tight">Crop Disease Detector</h2>
          <p className="text-emerald-200/70 text-sm mt-1 font-medium">AI Vision · Tissue Segmentation · Heatmap · Crop-Specific</p>
        </div>
      </div>

      {/* ── AI Status ── */}
      {aiStatus === 'ok' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
          style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <p className="text-xs font-semibold text-green-700">OpenRouter AI connected — crop-specific vision analysis active</p>
        </div>
      )}
      {aiStatus === 'offline' && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border"
          style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
          <Activity size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-orange-700">Local Engine Active — HSV + CIELAB + Disease Database</p>
            <p className="text-xs text-orange-600 mt-0.5">AI offline. Using local analysis (15+ diseases). Results may be less precise.</p>
          </div>
        </div>
      )}

      {/* ── Crop Selector ── */}
      <div className="glass-card">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block flex items-center gap-1.5">
          <Sprout size={11} style={{ color: 'oklch(0.55 0.14 155)' }} />Select Crop / Culture
        </Label>
        <div className="flex flex-wrap gap-2">
          {CULTURAS.map(c => (
            <button key={c.value} onClick={() => setCultura(c.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
              style={{
                background: cultura === c.value
                  ? 'linear-gradient(135deg, oklch(0.35 0.12 155), oklch(0.28 0.10 155))'
                  : 'oklch(0.94 0.018 140 / 0.6)',
                color: cultura === c.value ? 'white' : 'oklch(0.40 0.08 155)',
                border: cultura === c.value ? '1px solid oklch(0.45 0.14 155 / 0.4)' : '1px solid oklch(0.88 0.018 138 / 0.6)',
                boxShadow: cultura === c.value ? '0 4px 12px oklch(0.35 0.12 155 / 0.30)' : 'none',
              }}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* ── Image Upload ── */}
      <div className="glass-card">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 block flex items-center gap-1.5">
          <Camera size={11} style={{ color: 'oklch(0.55 0.14 155)' }} />Leaf / Crop Image
        </Label>

        {!selectedImage ? (
          <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer"
            style={{ borderColor: 'oklch(0.80 0.05 155 / 0.5)', background: 'oklch(0.94 0.018 140 / 0.4)' }}
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: 'oklch(0.35 0.12 155 / 0.10)', border: '1px solid oklch(0.35 0.12 155 / 0.15)' }}>
              <Leaf size={28} style={{ color: 'oklch(0.55 0.14 155)' }} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">Select leaf or crop image</p>
              <p className="text-muted-foreground text-xs mt-0.5">Drag & drop · JPG, PNG, WEBP · Max 20MB</p>
              <p className="text-muted-foreground text-[10px] mt-1">Best results: single leaf, good lighting, plain background</p>
            </div>
            <div className="flex gap-2 w-full max-w-xs">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'oklch(1 0 0 / 0.7)', border: '1px solid oklch(0.88 0.018 138 / 0.6)', color: 'oklch(0.35 0.10 155)' }}>
                <Upload size={14} />Gallery
              </button>
              <button onClick={() => setShowCameraPreview(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'oklch(1 0 0 / 0.7)', border: '1px solid oklch(0.88 0.018 138 / 0.6)', color: 'oklch(0.35 0.10 155)' }}>
                <Camera size={14} />Camera
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black/5">
              <img src={selectedImage} alt="Selected" className="w-full object-contain max-h-56 rounded-xl" />
              <button onClick={handleReset}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors">
                <RotateCcw size={14} className="text-white" />
              </button>
            </div>

            {/* Processed + Heatmap toggle */}
            {result?.processedImageDataUrl && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setShowHeatmap(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!showHeatmap ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500'}`}>
                    <FlaskConical size={11} />Segmented
                  </button>
                  {result.heatmapDataUrl && (
                    <button onClick={() => setShowHeatmap(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${showHeatmap ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-500'}`}>
                      <Activity size={11} />Heatmap
                    </button>
                  )}
                </div>
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={showHeatmap ? (result.heatmapDataUrl ?? result.processedImageDataUrl) : result.processedImageDataUrl}
                    alt={showHeatmap ? 'Disease heatmap' : 'Segmented tissue'}
                    className="w-full object-contain max-h-56 rounded-xl" />
                  <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap">
                    {!showHeatmap ? (
                      <>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-white" />Healthy</span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/80 text-white text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-white" />Chlorotic</span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-white" />Necrotic</span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/80 text-white text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-white" />Damaged</span>
                      </>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold">Disease Intensity Heatmap</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
      </div>

      {/* ── Observations ── */}
      <div className="glass-card">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
          Field Notes (optional)
        </Label>
        <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)}
          placeholder="Field conditions, variety, collection date, symptoms observed..."
          className="text-sm resize-none min-h-[72px] rounded-xl bg-secondary/40 border-border/60 focus:border-primary/50"
          rows={3} />
      </div>

      {/* ── Analyze Button ── */}
      <button onClick={handleAnalyze} disabled={!selectedImage || isAnalyzing}
        className="w-full py-3.5 text-base font-bold rounded-2xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        style={{ background: 'linear-gradient(135deg, oklch(0.40 0.14 155), oklch(0.28 0.10 155))' }}>
        {isAnalyzing
          ? <><Loader2 size={18} className="animate-spin" />Analyzing image...</>
          : <><Zap size={18} />Analyze Crop Disease</>}
      </button>

      {/* ── Camera Preview ── */}
      {showCameraPreview && (
        <CameraPreview
          onCapture={dataUrl => { setSelectedImage(dataUrl); setResult(null); setShowCameraPreview(false); }}
          onClose={() => setShowCameraPreview(false)}
          isLoading={isAnalyzing} />
      )}

      {/* ── Results Dashboard ── */}
      {result && (
        <div className="space-y-4">

          {/* Image quality error */}
          {result.image_valid === false && (
            <QualityErrorCard issue={result.image_quality_issue ?? 'unknown'} />
          )}

          {/* Valid results */}
          {result.image_valid !== false && (
            <>
              {/* ── Crop Detected Banner ── */}
              {result.detected_crop && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <Sprout size={16} className="text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-green-700">
                      Detected Crop: <span className="text-green-800">{result.detected_crop}</span>
                    </p>
                    <p className="text-[10px] text-green-600">
                      Crop identification confidence: {result.crop_confidence_percent ?? 0}%
                      {result.engine_used === 'local' && ' · Local Engine'}
                    </p>
                  </div>
                  {result.engine_used === 'ai' && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">AI</span>
                  )}
                </div>
              )}

              {/* ── Severity Gauge ── */}
              <div className="glass-card flex flex-col items-center py-6"
                style={{ borderColor: severityConfig[result.nivel].borderColor }}>
                <SeverityGauge value={result.severidade} level={result.nivel} size={180} animated />
                <p className="text-sm text-muted-foreground mt-3 text-center max-w-xs">
                  {severityConfig[result.nivel].description}
                </p>
                {result.severity_label && (
                  <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: severityConfig[result.nivel].bgColor,
                      color: severityConfig[result.nivel].textColor,
                      border: `1px solid ${severityConfig[result.nivel].borderColor}`,
                    }}>
                    {result.severity_label} — {result.severidade.toFixed(1)}% severity
                  </span>
                )}
              </div>

              {/* ── Tissue Breakdown ── */}
              {result.tissue_breakdown && (
                <div className="glass-card">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={14} className="text-primary" />
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide">Tissue Segmentation</h3>
                  </div>
                  <TissueBar
                    healthy={result.tissue_breakdown.healthy_percent}
                    chlorotic={result.tissue_breakdown.chlorotic_percent}
                    necrotic={result.tissue_breakdown.necrotic_percent}
                    damaged={result.tissue_breakdown.damaged_percent} />
                </div>
              )}

              {/* ── Metric Cards ── */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: 'Healthy', icon: <CheckCircle2 size={14} />,
                    value: result.healthy_area_px_percent != null
                      ? `${result.healthy_area_px_percent.toFixed(1)}%`
                      : result.tissue_breakdown ? `${result.tissue_breakdown.healthy_percent.toFixed(1)}%` : '-',
                    color: 'text-green-600', border: '#BBF7D0', bg: '#F0FDF4',
                  },
                  {
                    label: 'Infected', icon: <Bug size={14} />,
                    value: result.lesion_area_px_percent != null
                      ? `${result.lesion_area_px_percent.toFixed(1)}%`
                      : result.tissue_breakdown
                        ? `${(result.tissue_breakdown.necrotic_percent + result.tissue_breakdown.damaged_percent + result.tissue_breakdown.chlorotic_percent).toFixed(1)}%`
                        : '-',
                    color: 'text-red-500', border: '#FECACA', bg: '#FEF2F2',
                  },
                  {
                    label: 'Severity', icon: <TrendingUp size={14} />,
                    value: `${result.severidade.toFixed(1)}%`,
                    color: result.severidade > 49 ? 'text-red-600' : result.severidade > 24 ? 'text-amber-600' : 'text-green-600',
                    border: severityConfig[result.nivel].borderColor,
                    bg: severityConfig[result.nivel].bgColor,
                  },
                ].map(m => (
                  <div key={m.label} className="rounded-2xl text-center py-4 px-2 border"
                    style={{ background: m.bg, borderColor: m.border }}>
                    <div className={`flex justify-center mb-1 ${m.color}`}>{m.icon}</div>
                    <p className={`font-display font-bold text-lg ${m.color}`}>{m.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Analysis Summary ── */}
              {result.analysis_summary && (
                <div className="glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-blue-500" />
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide">Analysis Summary</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{result.analysis_summary}</p>
                  {result.environmental_risk_factors && result.environmental_risk_factors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-2 flex items-center gap-1">
                        <Thermometer size={10} />Environmental Risk Factors
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.environmental_risk_factors.map((f, i) => (
                          <span key={i} className="px-2 py-1 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Details Toggle ── */}
              <button onClick={() => setShowDetails(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
                <span>Analysis Details</span>
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showDetails && (
                <div className="glass-card space-y-2 text-sm">
                  {[
                    ['ID', result.id],
                    ['Date/Time', new Date(result.timestamp).toLocaleString('en-US')],
                    ['Selected Crop', result.cultura],
                    ['Detected Crop', result.detected_crop ?? result.cultura],
                    ['Analysis Engine', result.engine_used === 'ai' ? '🤖 OpenRouter AI' : '💻 Local HSV+CIELAB'],
                    ['Method', 'CLAHE + Background Removal + Tissue Segmentation'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-xs text-right">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Disease Diagnoses ── */}
              {result.predictedDiseases && result.predictedDiseases.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope size={15} className="text-primary" />
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide">Disease Diagnosis</h3>
                    <span className="text-[10px] text-muted-foreground ml-auto">Crop-specific results</span>
                  </div>

                  {result.predictedDiseases.map((disease, idx) => {
                    const confPct = disease.confidence_percent != null
                      ? Math.round(disease.confidence_percent)
                      : Math.round((disease.confidence ?? 0) * 100);
                    const isTop = disease.is_primary ?? idx === 0;
                    const treatment = normalizeTreatment(disease.treatment);
                    return (
                      <div key={`${disease.name}-${idx}`} className="card-phyto space-y-3"
                        style={isTop ? { borderColor: 'oklch(0.52 0.14 155)', borderWidth: 1.5 } : {}}>

                        {/* Disease header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {isTop && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                                  Primary Diagnosis
                                </span>
                              )}
                              {disease.disease_type && <DiseaseTypeBadge type={disease.disease_type} />}
                            </div>
                            <p className="font-display font-bold text-sm text-foreground">{disease.name}</p>
                            {disease.scientific_name && (
                              <p className="text-[11px] text-muted-foreground italic">{disease.scientific_name}</p>
                            )}
                            {disease.lesionType && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Lesion: <span className="font-medium">{disease.lesionType}</span>
                                {disease.affected_leaf_area_percent != null && (
                                  <span> · Affected area: {disease.affected_leaf_area_percent.toFixed(1)}%</span>
                                )}
                              </p>
                            )}
                          </div>
                          <ConfidenceRing pct={confPct} />
                        </div>

                        {/* Supporting symptoms */}
                        {disease.supporting_symptoms && disease.supporting_symptoms.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                              <Eye size={10} />Supporting Evidence
                            </p>
                            <ul className="space-y-1">
                              {disease.supporting_symptoms.map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Treatment breakdown */}
                        {(treatment.chemical.length > 0 || treatment.organic.length > 0 || treatment.preventive.length > 0) && (
                          <div className="space-y-2">
                            {treatment.chemical.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  <Droplets size={9} />Chemical Treatment
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {treatment.chemical.slice(0, 3).map((tr, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg text-[11px] font-medium bg-red-50 text-red-700 border border-red-100">{tr}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {treatment.organic.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  <Leaf size={9} />Organic / Biological
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {treatment.organic.slice(0, 2).map((tr, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg text-[11px] font-medium bg-green-50 text-green-700 border border-green-100">{tr}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {treatment.preventive.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  <ShieldCheck size={9} />Preventive Measures
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {treatment.preventive.slice(0, 2).map((tr, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">{tr}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Recommendations ── */}
              {result.recommendations && (
                result.recommendations.immediate.length > 0 ||
                result.recommendations.preventive.length > 0 ||
                result.recommendations.monitoring.length > 0
              ) && (
                <div className="glass-card space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={15} className="text-primary" />
                    <h3 className="font-display font-semibold text-sm uppercase tracking-wide">Field Recommendations</h3>
                  </div>
                  {result.recommendations.immediate.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <AlertTriangle size={10} />Immediate Action Required
                      </p>
                      <ul className="space-y-1">
                        {result.recommendations.immediate.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.preventive.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Eye size={10} />Preventive Measures
                      </p>
                      <ul className="space-y-1">
                        {result.recommendations.preventive.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.monitoring.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Microscope size={10} />Monitoring Guidelines
                      </p>
                      <ul className="space-y-1">
                        {result.recommendations.monitoring.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* ── Saved Confirmation ── */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
                <Save size={14} className="text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">Analysis saved to history</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
