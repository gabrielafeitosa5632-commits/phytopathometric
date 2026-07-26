/**
 * PhytoPathometric — Field Report Tab
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Leaf, BarChart3, CheckCircle2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAnalysis, severityConfig } from '@/contexts/AnalysisContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

function generateReport(history: ReturnType<typeof useAnalysis>['history'], userName: string, fieldName: string, notes: string) {
  if (history.length === 0) return;
  const avg = (history.reduce((a, b) => a + b.severidade, 0) / history.length).toFixed(2);
  const max = Math.max(...history.map(i => i.severidade)).toFixed(2);
  const min = Math.min(...history.map(i => i.severidade)).toFixed(2);

  const byCrop: Record<string, number[]> = {};
  history.forEach(i => { if (!byCrop[i.cultura]) byCrop[i.cultura] = []; byCrop[i.cultura].push(i.severidade); });
  const cropRows = Object.entries(byCrop).map(([crop, sevs]) => {
    const a = (sevs.reduce((x, y) => x + y, 0) / sevs.length).toFixed(2);
    const m = Math.max(...sevs).toFixed(2);
    return `<tr><td>${crop}</td><td>${sevs.length}</td><td>${a}%</td><td>${m}%</td></tr>`;
  }).join('');

  const recentRows = history.slice(0, 10).map(item => {
    const cfg = severityConfig[item.nivel];
    return `<tr>
      <td>${new Date(item.timestamp).toLocaleDateString('pt-BR')}</td>
      <td>${item.cultura}</td>
      <td style="color:${cfg.color};font-weight:700;">${item.severidade.toFixed(2)}%</td>
      <td><span style="background:${cfg.bgColor};color:${cfg.textColor};padding:2px 8px;border-radius:999px;font-size:11px;">${cfg.label}</span></td>
    </tr>`;
  }).join('');

  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Relatório — PhytoPathometric</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f4;color:#1a2e1a;padding:32px}
.page{max-width:800px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#1B4332,#2D6A4F);color:#fff;padding:32px}
.header h1{font-size:24px;font-weight:800}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px 32px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:13px}
.meta-label{color:#6b7280;font-size:11px;text-transform:uppercase}
.meta-value{font-weight:700;color:#1a2e1a;margin-top:2px}
.body{padding:24px 32px}
.st{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#52B788;margin-bottom:12px;margin-top:24px;border-bottom:2px solid #f0f0f0;padding-bottom:6px}
.sg{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px}
.sc{background:#f4f6f4;border-radius:12px;padding:14px;text-align:center}
.sv{font-size:20px;font-weight:800;color:#1B4332}
.sl{font-size:10px;color:#6b7280;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#f4f6f4;padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb}
td{padding:8px 12px;border-bottom:1px solid #f0f0f0}
.nb{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;font-size:13px;line-height:1.6}
.footer{background:#f4f6f4;padding:16px 32px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb}
@media print{body{background:#fff;padding:0}.page{box-shadow:none}}
</style></head><body>
<div class="page">
<div class="header"><h1>🌿 Relatório de Campo</h1><p>PhytoPathometric · Gerado em ${date}</p></div>
<div class="meta">
<div><div class="meta-label">Responsável</div><div class="meta-value">${userName}</div></div>
<div><div class="meta-label">Campo</div><div class="meta-value">${fieldName || 'Não informado'}</div></div>
<div><div class="meta-label">Período</div><div class="meta-value">${new Date(history[history.length - 1].timestamp).toLocaleDateString('pt-BR')} — ${new Date(history[0].timestamp).toLocaleDateString('pt-BR')}</div></div>
<div><div class="meta-label">Total</div><div class="meta-value">${history.length} análises</div></div>
</div>
<div class="body">
<div class="st">Resumo</div>
<div class="sg">
<div class="sc"><div class="sv">${history.length}</div><div class="sl">Análises</div></div>
<div class="sc"><div class="sv" style="color:#F59E0B">${avg}%</div><div class="sl">Média</div></div>
<div class="sc"><div class="sv" style="color:#EF4444">${max}%</div><div class="sl">Máxima</div></div>
<div class="sc"><div class="sv" style="color:#22C55E">${min}%</div><div class="sl">Mínima</div></div>
</div>
<div class="st">Por Cultura</div>
<table><thead><tr><th>Cultura</th><th>Análises</th><th>Sev. Média</th><th>Sev. Máxima</th></tr></thead><tbody>${cropRows}</tbody></table>
<div class="st">Análises Recentes</div>
<table><thead><tr><th>Data</th><th>Cultura</th><th>Severidade</th><th>Nível</th></tr></thead><tbody>${recentRows}</tbody></table>
${notes ? `<div class="st">Observações</div><div class="nb">${notes}</div>` : ''}
<div class="st">Metodologia</div>
<p style="font-size:12px;color:#6b7280;line-height:1.6">Segmentação HSV + CIELAB. Severidade (%) = (Área lesionada / Área total) × 100. Bergamin Filho et al. (2018). PhytoPathometric v1.0.0 — IFB/PIBITI.</p>
</div>
<div class="footer">PhytoPathometric v1.0.0 · IFB/PIBITI 2026–2027 · ${date}</div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export function RelatorioTab() {
  const { history } = useAnalysis();
  const { user } = useAuth();
  const [fieldName, setFieldName] = useState('');
  const [notes, setNotes] = useState('');

  const byCrop = history.reduce((acc, item) => { acc[item.cultura] = (acc[item.cultura] || 0) + 1; return acc; }, {} as Record<string, number>);
  const avg = history.length > 0 ? (history.reduce((a, b) => a + b.severidade, 0) / history.length).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="relative overflow-hidden rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, oklch(0.22 0.07 155), oklch(0.32 0.09 155))' }}>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Relatório de Campo</span>
        </div>
        <h2 className="font-display text-white text-xl font-bold">Gerar Relatório</h2>
        <p className="text-green-200 text-sm mt-1">PDF completo com todas as análises</p>
      </div>

      {history.length === 0 ? (
        <div className="card-phyto flex flex-col items-center py-12 gap-3 text-center">
          <FileText size={32} className="text-muted-foreground/40" />
          <p className="font-semibold text-muted-foreground">Nenhuma análise para relatório</p>
          <p className="text-xs text-muted-foreground/70">Realize análises primeiro.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: BarChart3, label: 'Análises',  value: history.length,                color: 'oklch(0.52 0.14 155)' },
              { icon: Leaf,      label: 'Culturas',  value: Object.keys(byCrop).length,    color: '#22C55E' },
              { icon: Calendar,  label: 'Sev. Média', value: `${avg}%`,                    color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="card-phyto text-center py-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1" style={{ background: s.color + '20' }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card-phyto space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informações do Relatório</p>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Nome do Campo / Talhão</Label>
              <Input type="text" value={fieldName} onChange={e => setFieldName(e.target.value)}
                placeholder="Ex: Talhão Norte — Fazenda São João" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Observações (opcional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Condições de campo, práticas aplicadas..."
                rows={3} className="rounded-xl resize-none" />
            </div>
          </div>

          <Button className="w-full h-12 font-semibold gap-2 rounded-xl text-base"
            style={{ background: 'linear-gradient(135deg, oklch(0.32 0.09 155), oklch(0.42 0.12 155))' }}
            onClick={() => { generateReport(history, user?.name ?? 'Usuário', fieldName, notes); toast.success('Relatório gerado!'); }}>
            <Printer size={18} />Gerar Relatório PDF
          </Button>

          <div className="card-phyto space-y-2">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" />O relatório inclui:</p>
            {['Resumo estatístico (média, máxima, mínima)', 'Análises por cultura', 'Tabela das 10 análises recentes', 'Suas observações de campo', 'Metodologia científica'].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />{item}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
