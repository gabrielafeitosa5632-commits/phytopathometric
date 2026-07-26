/**
 * PhytoPathometric — Crop Calendar Tab
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Leaf } from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type Month = 1|2|3|4|5|6|7|8|9|10|11|12;

interface CropData {
  name: string; emoji: string;
  plantingMonths: Month[]; harvestMonths: Month[];
  riskMonths: { month: Month; risk: RiskLevel; disease: string }[];
  mainDiseases: string[]; tip: string;
}

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CROPS_DATA: CropData[] = [
  { name:'Soja', emoji:'🫘', plantingMonths:[10,11,12], harvestMonths:[2,3,4],
    riskMonths:[{month:11,risk:'medium',disease:'Ferrugem Asiática'},{month:12,risk:'high',disease:'Ferrugem Asiática'},{month:1,risk:'critical',disease:'Ferrugem + Mancha Alvo'},{month:2,risk:'high',disease:'Mancha Alvo'}],
    mainDiseases:['Ferrugem Asiática','Mancha Alvo','Antracnose'], tip:'Monitorar ferrugem a partir de R1. Fungicida preventivo quando umidade > 80%.' },
  { name:'Milho', emoji:'🌽', plantingMonths:[9,10,11], harvestMonths:[1,2,3],
    riskMonths:[{month:11,risk:'medium',disease:'Helmintosporiose'},{month:12,risk:'high',disease:'Ferrugem Polissora'},{month:1,risk:'high',disease:'Ferrugem Polissora'}],
    mainDiseases:['Ferrugem Polissora','Helmintosporiose','Cercospora'], tip:'Usar híbridos resistentes. Inspecionar em V6–V8.' },
  { name:'Café', emoji:'☕', plantingMonths:[9,10], harvestMonths:[5,6,7,8],
    riskMonths:[{month:12,risk:'high',disease:'Ferrugem do Café'},{month:1,risk:'critical',disease:'Ferrugem + Cercospora'},{month:2,risk:'critical',disease:'Ferrugem + Cercospora'}],
    mainDiseases:['Ferrugem do Cafeeiro','Cercospora','Antracnose'], tip:'Aplicar cobre preventivo em outubro. Monitorar nos períodos chuvosos.' },
  { name:'Trigo', emoji:'🌾', plantingMonths:[4,5,6], harvestMonths:[9,10],
    riskMonths:[{month:6,risk:'medium',disease:'Oídio'},{month:7,risk:'high',disease:'Ferrugem da Folha'},{month:8,risk:'critical',disease:'Giberela + Ferrugem'}],
    mainDiseases:['Ferrugem da Folha','Giberela','Oídio'], tip:'Giberela crítica no florescimento. Fungicida em antese.' },
  { name:'Tomate', emoji:'🍅', plantingMonths:[7,8,9], harvestMonths:[11,12,1],
    riskMonths:[{month:10,risk:'high',disease:'Requeima'},{month:11,risk:'critical',disease:'Requeima + Pinta Preta'}],
    mainDiseases:['Requeima','Pinta Preta','Mancha Bacteriana'], tip:'Requeima progride rápido. Inspecionar diariamente em período chuvoso.' },
  { name:'Feijão', emoji:'🫘', plantingMonths:[1,2,7,8], harvestMonths:[3,4,10,11],
    riskMonths:[{month:2,risk:'medium',disease:'Antracnose'},{month:3,risk:'high',disease:'Crestamento Bacteriano'},{month:9,risk:'high',disease:'Ferrugem + Mancha Angular'}],
    mainDiseases:['Antracnose','Crestamento Bacteriano','Ferrugem'], tip:'Usar sementes certificadas. Rotação de culturas.' },
];

const RISK_CONFIG: Record<RiskLevel,{label:string;color:string;bg:string;border:string}> = {
  low:     {label:'Baixo',   color:'#22C55E',bg:'#F0FDF4',border:'#BBF7D0'},
  medium:  {label:'Médio',   color:'#F59E0B',bg:'#FFFBEB',border:'#FDE68A'},
  high:    {label:'Alto',    color:'#F97316',bg:'#FFF7ED',border:'#FED7AA'},
  critical:{label:'Crítico', color:'#EF4444',bg:'#FEF2F2',border:'#FECACA'},
};

const currentMonth = (new Date().getMonth() + 1) as Month;

function CropCard({ crop }: { crop: CropData }) {
  const [open, setOpen] = useState(false);
  const currentRisk = crop.riskMonths.find(r => r.month === currentMonth);
  const isPlanting = crop.plantingMonths.includes(currentMonth);
  const isHarvest = crop.harvestMonths.includes(currentMonth);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-phyto"
      style={currentRisk ? { borderLeft: `3px solid ${RISK_CONFIG[currentRisk.risk].color}` } : {}}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{crop.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold text-base text-foreground">{crop.name}</p>
            {currentRisk && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                style={{ background: RISK_CONFIG[currentRisk.risk].bg, color: RISK_CONFIG[currentRisk.risk].color, borderColor: RISK_CONFIG[currentRisk.risk].border }}>
                <AlertTriangle size={9} /> {RISK_CONFIG[currentRisk.risk].label}: {currentRisk.disease}
              </span>
            )}
            {isPlanting && !currentRisk && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold">
                <Leaf size={9} /> Plantio
              </span>
            )}
            {isHarvest && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">✂️ Colheita</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{crop.mainDiseases.slice(0,2).join(' · ')}</p>
        </div>
        <button onClick={() => setOpen(v => !v)} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-border/60 space-y-3 overflow-hidden">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Calendário Mensal</p>
            <div className="grid grid-cols-12 gap-0.5">
              {MONTHS_PT.map((m, idx) => {
                const mo = (idx + 1) as Month;
                const riskInfo = crop.riskMonths.find(r => r.month === mo);
                const isPlant = crop.plantingMonths.includes(mo);
                const isHarv = crop.harvestMonths.includes(mo);
                const isCurrent = mo === currentMonth;
                let bg = 'bg-secondary'; let textColor = 'text-muted-foreground';
                if (isPlant && !riskInfo) { bg = 'bg-green-100'; textColor = 'text-green-700'; }
                if (isHarv && !riskInfo) { bg = 'bg-amber-100'; textColor = 'text-amber-700'; }
                return (
                  <div key={m} className={`flex flex-col items-center py-1 rounded text-[9px] font-bold ${!riskInfo ? bg : ''} ${textColor} ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                    style={riskInfo ? { background: RISK_CONFIG[riskInfo.risk].color, color: '#fff' } : {}}>
                    {m}
                  </div>
                );
              })}
            </div>
          </div>

          {crop.riskMonths.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Períodos de Risco</p>
              <div className="space-y-1">
                {crop.riskMonths.map(r => (
                  <div key={r.month} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                    style={{ background: RISK_CONFIG[r.risk].bg, borderLeft: `3px solid ${RISK_CONFIG[r.risk].color}` }}>
                    <AlertTriangle size={11} style={{ color: RISK_CONFIG[r.risk].color, flexShrink: 0 }} />
                    <span className="font-semibold" style={{ color: RISK_CONFIG[r.risk].color }}>{MONTHS_PT[r.month - 1]}</span>
                    <span className="text-foreground/80 flex-1">{r.disease}</span>
                    <span className="font-bold text-[10px]" style={{ color: RISK_CONFIG[r.risk].color }}>{RISK_CONFIG[r.risk].label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
            <Info size={13} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80 leading-relaxed">{crop.tip}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function CalendarioTab() {
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());
  const alertCrops = CROPS_DATA.filter(c => c.riskMonths.some(r => r.month === currentMonth && (r.risk === 'high' || r.risk === 'critical')));

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="gradient-banner">
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays size={18} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Calendário Agrícola</span>
        </div>
        <h2 className="font-display text-white text-xl font-bold">Doenças & Plantio</h2>
        <p className="text-green-200 text-sm mt-1 capitalize">Mês atual: {monthName}</p>
      </div>

      {alertCrops.length > 0 ? (
        <div className="glass-card border-amber-300 bg-amber-50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} className="text-amber-500" />
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Alertas este mês</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertCrops.map(c => {
              const r = c.riskMonths.find(r => r.month === currentMonth)!;
              return (
                <span key={c.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{ background: RISK_CONFIG[r.risk].bg, color: RISK_CONFIG[r.risk].color, borderColor: RISK_CONFIG[r.risk].border }}>
                  {c.emoji} {c.name} — {r.disease}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card flex items-center gap-3 border-green-200 bg-green-50">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Nenhum alerta crítico para este mês! ✅</p>
        </div>
      )}

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1">Culturas</p>
      {CROPS_DATA.map(crop => <CropCard key={crop.name} crop={crop} />)}
    </div>
  );
}


