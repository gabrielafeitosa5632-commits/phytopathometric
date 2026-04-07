/**
 * PhytoPathometric — AnalisarTab
 * Main analysis tab: image capture, upload, processing and results
 * Design: AgTech Dashboard Moderno — Emerald/Green palette
 * Font: Plus Jakarta Sans + Syne
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, RotateCcw, Save, ChevronDown, ChevronUp, Leaf, FlaskConical, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { SeverityGauge } from '@/components/SeverityGauge';
import { CameraPreview } from '@/components/CameraPreview';
import { severityConfig } from '@/contexts/AnalysisContext';

const CULTURAS = [
  'Soja', 'Milho', 'Feijão', 'Café', 'Trigo', 'Cana-de-açúcar',
  'Arroz', 'Algodão', 'Tomate', 'Batata', 'Outra',
];

export function AnalisarTab() {
  const { settings, setCurrentAnalysis, addToHistory, isAnalyzing, setIsAnalyzing } = useAnalysis();
  const { processImage } = useImageProcessor();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cultura, setCultura] = useState('Soja');
  const [observacoes, setObservacoes] = useState('');
  const [result, setResult] = useState<ReturnType<typeof useAnalysis>['currentAnalysis']>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCameraHint, setShowCameraHint] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) {
      toast.error('Selecione uma imagem primeiro.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const analysis = await processImage(selectedImage, cultura, settings, observacoes || undefined);
      setResult(analysis);
      setCurrentAnalysis(analysis);
      addToHistory(analysis);
      toast.success(`Análise concluída! Severidade: ${analysis.severidade.toFixed(1)}%`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage, cultura, settings, observacoes, processImage, setIsAnalyzing, setCurrentAnalysis, addToHistory]);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setResult(null);
    setObservacoes('');
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, oklch(0.22 0.07 155) 0%, oklch(0.32 0.09 155) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/field-research-bg-8EQaeT99qmuNGT2wSYhPgn.webp)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Microscope size={18} className="text-green-300" />
            <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Análise Fitopatométrica</span>
          </div>
          <h2 className="font-display text-white text-xl font-bold">Quantificação de Severidade</h2>
          <p className="text-green-200 text-sm mt-1">Segmentação HSV + CIELAB em tempo real</p>
        </div>
      </div>

      {/* Cultura selector */}
      <div className="card-phyto">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
          <Leaf size={12} className="inline mr-1" />Cultura Avaliada
        </Label>
        <div className="flex flex-wrap gap-2">
          {CULTURAS.map(c => (
            <button
              key={c}
              onClick={() => setCultura(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border ${
                cultura === c
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-secondary text-secondary-foreground border-border hover:border-primary/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Image capture area */}
      <div className="card-phyto">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">
          <Camera size={12} className="inline mr-1" />Imagem Foliar
        </Label>

        {!selectedImage ? (
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 transition-colors duration-200 hover:border-primary/50 hover:bg-accent/30"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663512328442/XxLnxAvbycpbCn2WXiTMvD/leaf-scan-overlay-3K7zLgY5KhGmEYXFcLPomE.webp"
                alt="Leaf scan"
                className="w-12 h-12 object-contain rounded-xl opacity-80"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">Selecionar imagem foliar</p>
              <p className="text-muted-foreground text-xs mt-0.5">Arraste ou escolha um arquivo</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                Galeria
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => {
                  try {
                    setShowCameraPreview(true);
                  } catch {
                    setShowCameraHint(true);
                    fileInputRef.current?.click();
                  }
                }}
              >
                <Camera size={14} />
                Câmera ao Vivo
              </Button>
            </div>
            {showCameraHint && (
              <p className="text-xs text-muted-foreground text-center">
                Use a câmera do dispositivo para capturar a folha
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black/5">
              <img
                src={selectedImage}
                alt="Imagem selecionada"
                className="w-full object-contain max-h-56 rounded-xl"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
              >
                <RotateCcw size={14} className="text-white" />
              </button>
            </div>
            {result && result.processedImageDataUrl && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                  <FlaskConical size={12} />Imagem Processada (HSV + CIELAB)
                </p>
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={result.processedImageDataUrl}
                    alt="Imagem processada"
                    className="w-full object-contain max-h-56 rounded-xl"
                  />
                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />Saudável
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />Lesão
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {/* Observations */}
      <div className="card-phyto">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
          Observações (opcional)
        </Label>
        <Textarea
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          placeholder="Condições de campo, variedade, data de coleta..."
          className="text-sm resize-none min-h-[72px]"
          rows={3}
        />
      </div>

      {/* Analyze button */}
      <Button
        onClick={handleAnalyze}
        disabled={!selectedImage || isAnalyzing}
        className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
        style={{ background: 'linear-gradient(135deg, oklch(0.32 0.09 155), oklch(0.42 0.12 155))' }}
      >
        {isAnalyzing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processando imagem...
          </>
        ) : (
          <>
            <Microscope size={18} />
            Analisar Folha
          </>
        )}
      </Button>

      {/* Camera preview modal */}
      <AnimatePresence>
        {showCameraPreview && (
          <CameraPreview
            onCapture={(dataUrl) => {
              setSelectedImage(dataUrl);
              setResult(null);
            }}
            onClose={() => setShowCameraPreview(false)}
            isLoading={isAnalyzing}
          />
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Severity gauge */}
            <div
              className="card-phyto flex flex-col items-center py-6"
              style={{ borderColor: severityConfig[result.nivel].borderColor }}
            >
              <SeverityGauge
                value={result.severidade}
                level={result.nivel}
                size={180}
                animated
              />
              <p className="text-sm text-muted-foreground mt-3 text-center max-w-xs">
                {severityConfig[result.nivel].description}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Área Total', value: result.areaTotal.toLocaleString('pt-BR'), unit: 'px²', color: 'text-foreground' },
                { label: 'Saudável', value: result.areaSaudavel.toLocaleString('pt-BR'), unit: 'px²', color: 'text-green-600' },
                { label: 'Lesionada', value: result.areaLesionada.toLocaleString('pt-BR'), unit: 'px²', color: 'text-red-500' },
              ].map(m => (
                <div key={m.label} className="card-phyto text-center py-3">
                  <p className={`font-display font-bold text-lg ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Details toggle */}
            <button
              onClick={() => setShowDetails(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
            >
              <span>Detalhes da análise</span>
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card-phyto space-y-2 text-sm overflow-hidden"
                >
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID da análise</span>
                    <span className="font-mono text-xs font-medium">{result.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data/Hora</span>
                    <span className="font-medium">{new Date(result.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cultura</span>
                    <span className="font-medium">{result.cultura}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fórmula</span>
                    <span className="font-medium text-xs">({result.areaLesionada} / {result.areaTotal}) × 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método</span>
                    <span className="font-medium text-xs">HSV + CIELAB</span>
                  </div>
                  {result.observacoes && (
                    <div>
                      <span className="text-muted-foreground">Observações</span>
                      <p className="mt-1 text-xs bg-secondary rounded-lg p-2">{result.observacoes}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save confirmation */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
              <Save size={14} className="text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 font-medium">
                Análise salva automaticamente no histórico
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
