/**
 * PhytoPathometric — Gallery Tab
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Images, X, ZoomIn, Download, GitCompare } from 'lucide-react';
import { useAnalysis, severityConfig } from '@/contexts/AnalysisContext';

export function GaleriaTab() {
  const { history } = useAnalysis();
  const [selected, setSelected] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const withImages = history.filter(h => h.processedImageDataUrl || h.imageDataUrl);
  const selectedItem = history.find(h => h.id === selected);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]);
  };

  const compareItems = compareIds.map(id => history.find(h => h.id === id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="relative overflow-hidden rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, oklch(0.22 0.07 155), oklch(0.32 0.09 155))' }}>
        <div className="flex items-center gap-2 mb-1">
          <Images size={18} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Galeria</span>
        </div>
        <h2 className="font-display text-white text-xl font-bold">Imagens Analisadas</h2>
        <p className="text-green-200 text-sm mt-1">{withImages.length} imagens disponíveis</p>
      </div>

      {withImages.length === 0 ? (
        <div className="card-phyto flex flex-col items-center py-14 gap-3 text-center">
          <Images size={32} className="text-muted-foreground/40" />
          <p className="font-semibold text-foreground">Nenhuma imagem ainda</p>
          <p className="text-muted-foreground text-sm">As imagens aparecem aqui após as análises.</p>
        </div>
      ) : (
        <>
          {compareIds.length > 0 && (
            <div className="card-phyto flex items-center gap-3 border-primary/30 bg-primary/5">
              <GitCompare size={16} className="text-primary flex-shrink-0" />
              <p className="text-xs text-primary font-medium flex-1">
                {compareIds.length === 1 ? 'Selecione mais 1 para comparar' : 'Comparação pronta'}
              </p>
              <button onClick={() => setCompareIds([])}><X size={14} className="text-muted-foreground" /></button>
            </div>
          )}

          {compareItems.length === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-phyto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Comparação</p>
              <div className="grid grid-cols-2 gap-3">
                {compareItems.map(item => {
                  const cfg = severityConfig[item!.nivel];
                  return (
                    <div key={item!.id} className="space-y-2">
                      <img src={item!.processedImageDataUrl || item!.imageDataUrl}
                        className="w-full rounded-xl object-cover aspect-square"
                        style={{ border: `2px solid ${cfg.color}` }} />
                      <div className="text-center">
                        <p className="text-xs font-bold" style={{ color: cfg.color }}>{item!.severidade.toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground">{item!.cultura}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {withImages.map((item, i) => {
              const cfg = severityConfig[item.nivel];
              const imgSrc = item.processedImageDataUrl || item.imageDataUrl!;
              const isComparing = compareIds.includes(item.id);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }} className="relative group">
                  <div className={`relative rounded-xl overflow-hidden cursor-pointer ${isComparing ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    style={{ border: `2px solid ${cfg.color}60` }} onClick={() => setSelected(item.id)}>
                    <img src={imgSrc} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40"
                        onClick={e => { e.stopPropagation(); setSelected(item.id); }}>
                        <ZoomIn size={14} className="text-white" />
                      </button>
                      <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40"
                        onClick={e => { e.stopPropagation(); toggleCompare(item.id); }}>
                        <GitCompare size={14} className="text-white" />
                      </button>
                    </div>
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                      style={{ background: cfg.color }}>
                      {item.severidade.toFixed(0)}%
                    </div>
                  </div>
                  <div className="mt-1 px-0.5">
                    <p className="text-[10px] font-semibold text-foreground truncate">{item.cultura}</p>
                    <p className="text-[9px] text-muted-foreground">{new Date(item.timestamp).toLocaleDateString('pt-BR')}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      <AnimatePresence>
        {selected && selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 gap-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <img src={selectedItem.processedImageDataUrl || selectedItem.imageDataUrl}
                className="w-full rounded-2xl object-contain max-h-[70vh]" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white font-bold">{selectedItem.cultura}</p>
                    <p className="text-white/70 text-xs">{new Date(selectedItem.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const a = document.createElement('a');
                      a.href = selectedItem.processedImageDataUrl || selectedItem.imageDataUrl!;
                      a.download = `phyto_${selectedItem.id}.jpg`; a.click();
                    }} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40">
                      <Download size={16} className="text-white" />
                    </button>
                    <button onClick={() => setSelected(null)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40">
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            <span className="px-3 py-1.5 rounded-full text-sm font-bold text-white"
              style={{ background: severityConfig[selectedItem.nivel].color }}>
              {selectedItem.severidade.toFixed(2)}% — {severityConfig[selectedItem.nivel].label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
