/**
 * PhytoPathometric — Field Map Tab
 * Interactive map to pin field locations, track disease spread,
 * and manage multiple farm plots geographically.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from '@/lib/framer-safe';
import {
  MapPin, Plus, Trash2, AlertTriangle, CheckCircle2, ChevronDown,
  ChevronUp, Navigation, Leaf, Bug, Info, Edit3, X, Save,
  TrendingUp, BarChart3, Map,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAnalysis, severityConfig } from '@/contexts/AnalysisContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FieldPin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  notes: string;
  crop: string;
  createdAt: string;
  analysisIds: string[]; // linked analysis IDs from history
}

const FIELD_PINS_KEY = 'phyto_field_pins';

const CROP_EMOJIS: Record<string, string> = {
  Wheat: '🌾', Rice: '🌾', Maize: '🌽', Soybean: '🫘', Cotton: '🌿',
  Tomato: '🍅', Potato: '🥔', Sugarcane: '🎋', Coffee: '☕', Bean: '🫘',
  Barley: '🌾', Other: '🌱',
};

// ─── Storage helpers ──────────────────────────────────────────────────────────
function loadPins(): FieldPin[] {
  try {
    const raw = localStorage.getItem(FIELD_PINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePins(pins: FieldPin[]) {
  try { localStorage.setItem(FIELD_PINS_KEY, JSON.stringify(pins)); } catch { /* ignore */ }
}

// ─── Risk color from avg severity ─────────────────────────────────────────────
function severityToRisk(sev: number): { color: string; bg: string; border: string; label: string } {
  if (sev < 10)  return { color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0', label: 'Healthy' };
  if (sev < 25)  return { color: '#84CC16', bg: '#F7FEE7', border: '#D9F99D', label: 'Low' };
  if (sev < 50)  return { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: 'Medium' };
  if (sev < 75)  return { color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', label: 'High' };
  return           { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', label: 'Critical' };
}

// ─── Map Dot (visual pin on the fake map) ─────────────────────────────────────
function MapDot({ pin, analyses, isSelected, onClick }: {
  pin: FieldPin;
  analyses: ReturnType<typeof useAnalysis>['history'];
  isSelected: boolean;
  onClick: () => void;
}) {
  const linked = analyses.filter(a => pin.analysisIds.includes(a.id));
  const avgSev = linked.length > 0
    ? linked.reduce((s, a) => s + a.severidade, 0) / linked.length
    : 0;
  const risk = severityToRisk(avgSev);
  const emoji = CROP_EMOJIS[pin.crop] ?? '🌱';

  // Convert lat/lon to relative % position on our fake map canvas
  // We normalize to a Brazilian-ish bounding box for demo
  const xPct = Math.min(95, Math.max(5, ((pin.lon + 75) / 75) * 100));
  const yPct = Math.min(95, Math.max(5, ((pin.lat + 35) / 35) * 100));

  return (
    <button
      onClick={onClick}
      style={{ left: `${xPct}%`, top: `${yPct}%`, position: 'absolute', transform: 'translate(-50%, -100%)' }}
      className="group z-10"
      title={pin.name}
    >
      <motion.div
        animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
        whileHover={{ scale: 1.15 }}
        className="relative flex flex-col items-center"
      >
        {/* Pin body */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg border-2"
          style={{ background: risk.bg, borderColor: risk.color, boxShadow: `0 2px 8px ${risk.color}50` }}
        >
          {emoji}
        </div>
        {/* Pin tail */}
        <div className="w-1.5 h-2.5 rounded-b-full -mt-0.5" style={{ background: risk.color }} />
        {/* Pulse on critical */}
        {avgSev >= 50 && (
          <div className="absolute -inset-1 rounded-full animate-ping opacity-30" style={{ background: risk.color }} />
        )}
        {/* Label on hover */}
        <div className="absolute bottom-full mb-1 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
          style={{ background: risk.color, color: 'white' }}>
          {pin.name}
        </div>
      </motion.div>
    </button>
  );
}

// ─── Add / Edit Pin Form ──────────────────────────────────────────────────────
function PinForm({ initial, onSave, onClose }: {
  initial?: Partial<FieldPin>;
  onSave: (data: Omit<FieldPin, 'id' | 'createdAt' | 'analysisIds'>) => void;
  onClose: () => void;
}) {
  const [name, setName]   = useState(initial?.name ?? '');
  const [crop, setCrop]   = useState(initial?.crop ?? 'Wheat');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [lat, setLat]     = useState(initial?.lat?.toString() ?? '');
  const [lon, setLon]     = useState(initial?.lon?.toString() ?? '');
  const [locating, setLocating] = useState(false);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLon(pos.coords.longitude.toFixed(5));
        setLocating(false);
        toast.success('Location captured!');
      },
      () => { toast.error('Could not get location'); setLocating(false); },
      { timeout: 8000 }
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) { toast.error('Field name is required'); return; }
    const latN = parseFloat(lat);
    const lonN = parseFloat(lon);
    if (isNaN(latN) || isNaN(lonN)) { toast.error('Valid coordinates required'); return; }
    onSave({ name: name.trim(), crop, notes, lat: latN, lon: lonN });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-3 border-primary/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          {initial?.name ? 'Edit Field' : 'Add New Field'}
        </p>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2">
        <Input placeholder="Field name (e.g. North Plot - Sector A)" value={name}
          onChange={e => setName(e.target.value)} className="h-9 text-sm rounded-xl" />

        <div className="flex gap-2">
          <Input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)}
            className="h-9 text-sm rounded-xl flex-1" type="number" step="0.00001" />
          <Input placeholder="Longitude" value={lon} onChange={e => setLon(e.target.value)}
            className="h-9 text-sm rounded-xl flex-1" type="number" step="0.00001" />
        </div>

        <Button variant="outline" size="sm" onClick={useCurrentLocation} disabled={locating}
          className="w-full gap-2 h-9 rounded-xl text-xs">
          <Navigation size={12} />{locating ? 'Getting location...' : 'Use My Current Location'}
        </Button>

        <div className="flex flex-wrap gap-1.5">
          {Object.keys(CROP_EMOJIS).map(c => (
            <button key={c} onClick={() => setCrop(c)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: crop === c ? 'oklch(0.35 0.12 155)' : 'oklch(0.94 0.018 140 / 0.6)',
                color: crop === c ? 'white' : 'oklch(0.40 0.08 155)',
                border: crop === c ? 'none' : '1px solid oklch(0.88 0.018 138 / 0.6)',
              }}>
              {CROP_EMOJIS[c]} {c}
            </button>
          ))}
        </div>

        <Textarea placeholder="Notes (variety, area, conditions...)" value={notes}
          onChange={e => setNotes(e.target.value)} rows={2}
          className="text-sm rounded-xl resize-none" />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1 h-9 rounded-xl text-xs">Cancel</Button>
        <Button onClick={handleSubmit} className="flex-1 h-9 rounded-xl text-xs gap-1.5"
          style={{ background: 'oklch(0.35 0.12 155)' }}>
          <Save size={12} />Save Field
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Pin Detail Card ──────────────────────────────────────────────────────────
function PinDetailCard({ pin, analyses, onDelete, onEdit, onLinkAnalysis }: {
  pin: FieldPin;
  analyses: ReturnType<typeof useAnalysis>['history'];
  onDelete: () => void;
  onEdit: () => void;
  onLinkAnalysis: (analysisId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const linked = analyses.filter(a => pin.analysisIds.includes(a.id));
  const unlinked = analyses.filter(a => !pin.analysisIds.includes(a.id)).slice(0, 10);
  const avgSev = linked.length > 0 ? linked.reduce((s, a) => s + a.severidade, 0) / linked.length : 0;
  const risk = severityToRisk(avgSev);
  const emoji = CROP_EMOJIS[pin.crop] ?? '🌱';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden" style={{ borderLeft: `3px solid ${risk.color}` }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm text-foreground truncate">{pin.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground">{pin.crop}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {pin.lat.toFixed(4)}, {pin.lon.toFixed(4)}
            </span>
          </div>
          {linked.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>
                {risk.label} — avg {avgSev.toFixed(1)}%
              </span>
              <span className="text-[10px] text-muted-foreground">{linked.length} analyses</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
            <Edit3 size={12} />
          </button>
          <button onClick={() => setExpanded(v => !v)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-border/50 space-y-3 overflow-hidden">
          {pin.notes && (
            <p className="text-xs text-muted-foreground leading-relaxed">{pin.notes}</p>
          )}

          {/* Linked analyses */}
          {linked.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                Linked Analyses ({linked.length})
              </p>
              <div className="space-y-1.5">
                {linked.slice(0, 5).map(a => {
                  const sev = severityToRisk(a.severidade);
                  const disease = a.predictedDiseases?.[0]?.name ?? 'Healthy';
                  return (
                    <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                      style={{ background: sev.bg, borderLeft: `2px solid ${sev.color}` }}>
                      <span className="font-semibold flex-1 truncate">{disease}</span>
                      <span className="font-bold" style={{ color: sev.color }}>{a.severidade.toFixed(1)}%</span>
                      <span className="text-muted-foreground">
                        {new Date(a.timestamp).toLocaleDateString('en', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Link more analyses */}
          {unlinked.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                Link an Analysis
              </p>
              <div className="space-y-1">
                {unlinked.map(a => (
                  <button key={a.id} onClick={() => onLinkAnalysis(a.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-secondary transition-all text-left border border-border/40">
                    <span className="w-5 h-5 rounded-lg flex items-center justify-center bg-primary/10 flex-shrink-0">
                      <Plus size={10} className="text-primary" />
                    </span>
                    <span className="flex-1 truncate">{a.predictedDiseases?.[0]?.name ?? 'Healthy'} · {a.detected_crop ?? a.cultura}</span>
                    <span className="text-muted-foreground">{a.severidade.toFixed(1)}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export function FieldMapTab() {
  const { history } = useAnalysis();
  const [pins, setPins]           = useState<FieldPin[]>(() => loadPins());
  const [selected, setSelected]   = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editPin, setEditPin]     = useState<FieldPin | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -15, lon: -50 }); // Brazil center

  const saveAndSet = useCallback((updated: FieldPin[]) => {
    setPins(updated);
    savePins(updated);
  }, []);

  const handleAddPin = (data: Omit<FieldPin, 'id' | 'createdAt' | 'analysisIds'>) => {
    const newPin: FieldPin = {
      ...data,
      id: `pin_${Date.now()}`,
      createdAt: new Date().toISOString(),
      analysisIds: [],
    };
    saveAndSet([...pins, newPin]);
    setShowForm(false);
    setSelected(newPin.id);
    toast.success(`Field "${newPin.name}" added!`);
  };

  const handleEditPin = (data: Omit<FieldPin, 'id' | 'createdAt' | 'analysisIds'>) => {
    if (!editPin) return;
    const updated = pins.map(p => p.id === editPin.id ? { ...p, ...data } : p);
    saveAndSet(updated);
    setEditPin(null);
    toast.success('Field updated!');
  };

  const handleDeletePin = (id: string) => {
    saveAndSet(pins.filter(p => p.id !== id));
    if (selected === id) setSelected(null);
    toast.success('Field removed.');
  };

  const handleLinkAnalysis = (pinId: string, analysisId: string) => {
    const updated = pins.map(p =>
      p.id === pinId ? { ...p, analysisIds: [...new Set([...p.analysisIds, analysisId])] } : p
    );
    saveAndSet(updated);
    toast.success('Analysis linked to field!');
  };

  // Summary stats
  const totalFields = pins.length;
  const fieldsWithData = pins.filter(p => p.analysisIds.length > 0).length;
  const criticalFields = pins.filter(p => {
    const linked = history.filter(a => p.analysisIds.includes(a.id));
    const avg = linked.length > 0 ? linked.reduce((s, a) => s + a.severidade, 0) / linked.length : 0;
    return avg >= 50;
  }).length;

  const selectedPin = pins.find(p => p.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* ── Header ── */}
      <div className="gradient-banner">
        <div className="flex items-center gap-2 mb-1">
          <Map size={18} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Field Map</span>
        </div>
        <h2 className="font-display text-white text-xl font-bold">Farm Field Tracker</h2>
        <p className="text-green-200 text-sm mt-1">Pin locations, link analyses, monitor spread</p>
      </div>

      {/* ── Summary pills ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: MapPin,       label: 'Fields',        value: totalFields,    color: 'oklch(0.52 0.14 155)' },
          { icon: BarChart3,    label: 'With Data',     value: fieldsWithData, color: '#3B82F6' },
          { icon: AlertTriangle,label: 'Critical',      value: criticalFields, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="glass-card py-3 px-2 flex flex-col items-center gap-1">
            <s.icon size={16} style={{ color: s.color }} />
            <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Add pin button ── */}
      {!showForm && !editPin && (
        <Button onClick={() => setShowForm(true)}
          className="w-full h-11 gap-2 rounded-xl font-semibold"
          style={{ background: 'oklch(0.35 0.12 155)' }}>
          <Plus size={16} />Add New Field Location
        </Button>
      )}

      {/* ── Add / Edit form ── */}
      <AnimatePresence>
        {showForm && !editPin && (
          <PinForm onSave={handleAddPin} onClose={() => setShowForm(false)} />
        )}
        {editPin && (
          <PinForm initial={editPin} onSave={handleEditPin} onClose={() => setEditPin(null)} />
        )}
      </AnimatePresence>

      {/* ── Map canvas ── */}
      {pins.length > 0 && (
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Field Map Overview
            </p>
          </div>
          <div className="relative mx-3 mb-3 rounded-xl overflow-hidden"
            style={{
              height: 220,
              background: 'linear-gradient(135deg, #d4e8d0 0%, #c8dfc3 30%, #b8d4b0 60%, #a8c89e 100%)',
              border: '1px solid oklch(0.80 0.06 140 / 0.5)',
            }}>
            {/* Grid lines to look like a map */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              {[1,2,3,4,5,6,7,8,9].map(i => (
                <g key={i}>
                  <line x1={`${i*10}%`} y1="0" x2={`${i*10}%`} y2="100%" stroke="#2D6A4F" strokeWidth="0.5" />
                  <line x1="0" y1={`${i*10}%`} x2="100%" y2={`${i*10}%`} stroke="#2D6A4F" strokeWidth="0.5" />
                </g>
              ))}
            </svg>
            {/* Decorative terrain shapes */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute w-20 h-12 rounded-full" style={{ background: '#52B788', top: '20%', left: '15%' }} />
              <div className="absolute w-28 h-16 rounded-full" style={{ background: '#40916C', top: '50%', left: '45%' }} />
              <div className="absolute w-16 h-10 rounded-full" style={{ background: '#52B788', top: '30%', left: '70%' }} />
            </div>
            {/* Map label */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-bold"
              style={{ background: 'rgba(255,255,255,0.7)', color: '#2D6A4F' }}>
              📍 {pins.length} field{pins.length !== 1 ? 's' : ''}
            </div>
            {/* Field pins */}
            {pins.map(pin => (
              <MapDot key={pin.id} pin={pin} analyses={history}
                isSelected={selected === pin.id}
                onClick={() => setSelected(selected === pin.id ? null : pin.id)} />
            ))}
          </div>
          <p className="px-3 pb-2 text-[10px] text-muted-foreground">
            Tap a pin to select · Colors show disease risk level
          </p>
        </div>
      )}

      {/* ── Legend ── */}
      {pins.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {[
            { label: 'Healthy', color: '#22C55E' },
            { label: 'Low', color: '#84CC16' },
            { label: 'Medium', color: '#F59E0B' },
            { label: 'High', color: '#F97316' },
            { label: 'Critical', color: '#EF4444' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      )}

      {/* ── Selected pin detail or field list ── */}
      {pins.length === 0 ? (
        <div className="glass-card flex flex-col items-center py-12 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'oklch(0.35 0.12 155 / 0.1)', border: '1px solid oklch(0.35 0.12 155 / 0.15)' }}>
            <Map size={24} style={{ color: 'oklch(0.55 0.14 155)' }} />
          </div>
          <p className="font-bold text-foreground">No fields yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Add your first field location to start tracking disease spread across your farm.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
            {selectedPin ? 'Selected Field' : `All Fields (${pins.length})`}
          </p>
          {(selectedPin ? [selectedPin] : pins).map(pin => (
            <PinDetailCard key={pin.id} pin={pin} analyses={history}
              onDelete={() => handleDeletePin(pin.id)}
              onEdit={() => { setEditPin(pin); setShowForm(false); }}
              onLinkAnalysis={(aid) => handleLinkAnalysis(pin.id, aid)} />
          ))}
          {selectedPin && (
            <button onClick={() => setSelected(null)}
              className="w-full py-2.5 rounded-xl text-sm text-muted-foreground border border-border hover:bg-secondary transition-all">
              Show All Fields
            </button>
          )}
        </div>
      )}

      {/* ── Info note ── */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
        <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Link analyses from your history to each field to track disease evolution per location. Use GPS coordinates for accurate pinning.
        </p>
      </div>
    </div>
  );
}
