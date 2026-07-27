/**
 * PhytoPathometric — Field Report Tab
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Leaf, BarChart3, CheckCircle2, Printer, AlertTriangle, Bug } from 'lucide-react';
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
  const diseased = history.filter(i => i.severidade >= 10).length;
  const healthy = history.length - diseased;

  // By-crop table
  const byCrop: Record<string, number[]> = {};
  history.forEach(i => { if (!byCrop[i.cultura]) byCrop[i.cultura] = []; byCrop[i.cultura].push(i.severidade); });
  const cropRows = Object.entries(byCrop).map(([crop, sevs]) => {
    const a = (sevs.reduce((x, y) => x + y, 0) / sevs.length).toFixed(2);
    const m = Math.max(...sevs).toFixed(2);
    const risk = parseFloat(a) >= 50 ? 'HIGH' : parseFloat(a) >= 25 ? 'MEDIUM' : parseFloat(a) >= 10 ? 'LOW' : 'HEALTHY';
    const rColor = risk === 'HIGH' ? '#EF4444' : risk === 'MEDIUM' ? '#F97316' : risk === 'LOW' ? '#EAB308' : '#22C55E';
    return `<tr><td><b>${crop}</b></td><td>${sevs.length}</td><td><b>${a}%</b></td><td>${m}%</td>
      <td><span style="background:${rColor}20;color:${rColor};padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">${risk}</span></td></tr>`;
  }).join('');

  // Recent analyses with disease info
  const recentRows = history.slice(0, 15).map(item => {
    const primary = item.predictedDiseases?.[0];
    const diseaseName = primary?.name ?? (item.image_valid === false ? 'Invalid Image' : 'Healthy');
    const conf = primary?.confidence_percent != null ? `${Math.round(primary.confidence_percent)}%` : primary ? `${Math.round(primary.confidence * 100)}%` : '—';
    const sevColor = item.severidade >= 50 ? '#EF4444' : item.severidade >= 25 ? '#F97316' : item.severidade >= 10 ? '#EAB308' : '#22C55E';
    const engine = item.engine_used === 'ai' ? '🤖 AI' : '💻 Local';
    return `<tr>
      <td>${new Date(item.timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
      <td><b>${item.detected_crop ?? item.cultura}</b></td>
      <td><b>${diseaseName}</b></td>
      <td style="color:${sevColor};font-weight:700">${item.severidade.toFixed(1)}%</td>
      <td>${conf}</td>
      <td>${engine}</td>
    </tr>`;
  }).join('');

  // Disease frequency
  const diseaseFreq: Record<string, number> = {};
  history.forEach(i => { const n = i.predictedDiseases?.[0]?.name; if (n && n !== 'Healthy Plant') diseaseFreq[n] = (diseaseFreq[n] || 0) + 1; });
  const topDiseases = Object.entries(diseaseFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const diseaseRows = topDiseases.map(([name, count]) =>
    `<tr><td><b>${name}</b></td><td>${count}</td><td>${((count / history.length) * 100).toFixed(1)}%</td></tr>`
  ).join('');

  const date = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  const dateRange = history.length > 1
    ? `${new Date(history[history.length - 1].timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} — ${new Date(history[0].timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : new Date(history[0].timestamp).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>PhytoPathometric Field Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f4;color:#1a2e1a;padding:24px}
.page{max-width:820px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)}
.header{background:linear-gradient(135deg,#1B4332,#2D6A4F,#52B788);color:#fff;padding:32px}
.header-top{display:flex;justify-content:space-between;align-items:flex-start}
.header h1{font-size:26px;font-weight:800;margin-bottom:4px}
.header p{opacity:.8;font-size:13px}
.badge{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-bottom:1px solid #e5e7eb}
.meta-cell{padding:16px 24px;border-right:1px solid #e5e7eb}
.meta-cell:last-child{border-right:none}
.meta-label{color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:.5px;font-weight:600}
.meta-value{font-weight:800;color:#1a2e1a;margin-top:3px;font-size:15px}
.body{padding:24px 28px}
.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#52B788;margin:24px 0 10px;border-bottom:2px solid #f0f0f0;padding-bottom:6px;display:flex;align-items:center;gap:6px}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
.kpi{background:linear-gradient(135deg,#f4fdf7,#edfff4);border:1px solid #d1fae5;border-radius:12px;padding:14px;text-align:center}
.kpi-val{font-size:22px;font-weight:800;color:#1B4332}
.kpi-lbl{font-size:10px;color:#6b7280;margin-top:2px;font-weight:600}
table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4px}
th{background:#f4f6f4;padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb}
td{padding:8px 12px;border-bottom:1px solid #f0f0f0;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fafff9}
.nb{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;font-size:13px;line-height:1.7;color:#374151}
.alert{background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;font-size:12px;color:#92400e;margin-bottom:16px}
.footer{background:#f4f6f4;padding:14px 28px;font-size:10px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between}
@media print{body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0}}
</style></head><body>
<div class="page">
<div class="header">
  <div class="header-top">
    <div>
      <h1>🌿 PhytoPathometric Field Report</h1>
      <p>Crop Disease Detection & Severity Analysis</p>
    </div>
    <div class="badge">v2.0 · AI-Powered</div>
  </div>
</div>
<div class="meta">
  <div class="meta-cell"><div class="meta-label">Agronomist / User</div><div class="meta-value">${userName}</div></div>
  <div class="meta-cell"><div class="meta-label">Field / Plot</div><div class="meta-value">${fieldName || 'Not specified'}</div></div>
  <div class="meta-cell"><div class="meta-label">Analysis Period</div><div class="meta-value" style="font-size:13px">${dateRange}</div></div>
</div>
<div class="body">
${parseFloat(avg) >= 25 ? `<div class="alert">⚠️ <b>Alert:</b> Average severity of ${avg}% exceeds the recommended threshold. Immediate field intervention is recommended.</div>` : ''}
<div class="section-title">📊 Executive Summary</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-val">${history.length}</div><div class="kpi-lbl">Total Analyses</div></div>
  <div class="kpi"><div class="kpi-val" style="color:#F59E0B">${avg}%</div><div class="kpi-lbl">Avg Severity</div></div>
  <div class="kpi"><div class="kpi-val" style="color:#EF4444">${max}%</div><div class="kpi-lbl">Max Severity</div></div>
  <div class="kpi"><div class="kpi-val" style="color:#22C55E">${healthy}</div><div class="kpi-lbl">Healthy Samples</div></div>
</div>
<div class="section-title">🌾 Results by Crop</div>
<table><thead><tr><th>Crop</th><th>Analyses</th><th>Avg Severity</th><th>Max Severity</th><th>Risk Level</th></tr></thead>
<tbody>${cropRows}</tbody></table>
${topDiseases.length > 0 ? `
<div class="section-title">🦠 Most Frequent Diseases</div>
<table><thead><tr><th>Disease</th><th>Occurrences</th><th>Frequency</th></tr></thead>
<tbody>${diseaseRows}</tbody></table>` : ''}
<div class="section-title">🔬 Individual Analyses (last 15)</div>
<table><thead><tr><th>Date</th><th>Crop</th><th>Disease / Condition</th><th>Severity</th><th>Confidence</th><th>Engine</th></tr></thead>
<tbody>${recentRows}</tbody></table>
${notes ? `<div class="section-title">📝 Field Observations</div><div class="nb">${notes}</div>` : ''}
<div class="section-title">🧪 Methodology</div>
<p style="font-size:11px;color:#6b7280;line-height:1.7">
Analysis performed using PhytoPathometric v2.0 with AI vision analysis (OpenRouter / Google Gemini) and local HSV+CIELAB tissue segmentation pipeline.
Severity (%) = total infected leaf area / total leaf area × 100.
Tissue classification: healthy (green HSV 65–170°), chlorotic (yellow 38–82°), necrotic (dark brown/black), damaged (orange-red pustules).
References: Bergamin Filho et al. (2018); CABI Crop Protection Compendium; Islam et al. (2016).
</p>
</div>
<div class="footer">
  <span>PhytoPathometric v2.0 · ${date}</span>
  <span>Generated by: ${userName} · ${history.length} analyses · ${Object.keys(byCrop).length} crop(s)</span>
</div>
</div>
<script>window.onload=()=>{setTimeout(()=>window.print(),400)}</script>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups to generate the report.'); return; }
  win.document.write(html);
  win.document.close();
}

export function RelatorioTab() {
  const { history } = useAnalysis();
  const { user } = useAuth();
  const [fieldName, setFieldName] = useState('');
  const [notes, setNotes] = useState('');

  const byCrop = history.reduce((acc, item) => {
    acc[item.detected_crop ?? item.cultura] = (acc[item.detected_crop ?? item.cultura] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const avg = history.length > 0 ? (history.reduce((a, b) => a + b.severidade, 0) / history.length).toFixed(1) : '0';
  const diseased = history.filter(i => i.severidade >= 10).length;
  const topDisease = (() => {
    const freq: Record<string, number> = {};
    history.forEach(i => { const n = i.predictedDiseases?.[0]?.name; if (n && n !== 'Healthy Plant') freq[n] = (freq[n] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : null;
  })();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="gradient-banner">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-green-300" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Field Report</span>
        </div>
        <h2 className="font-display text-white text-xl font-bold">Generate PDF Report</h2>
        <p className="text-green-200 text-sm mt-1">Professional report with all analyses, diseases & recommendations</p>
      </div>

      {history.length === 0 ? (
        <div className="glass-card flex flex-col items-center py-12 gap-3 text-center">
          <FileText size={32} className="text-muted-foreground/40" />
          <p className="font-semibold text-muted-foreground">No analyses available</p>
          <p className="text-xs text-muted-foreground/70">Run analyses first, then generate a report.</p>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: BarChart3, label: 'Total Analyses', value: history.length, color: 'oklch(0.52 0.14 155)' },
              { icon: Leaf, label: 'Crops Monitored', value: Object.keys(byCrop).length, color: '#22C55E' },
              { icon: Calendar, label: 'Avg Severity', value: `${avg}%`, color: '#F59E0B' },
              { icon: AlertTriangle, label: 'Diseased Samples', value: diseased, color: '#EF4444' },
            ].map(s => (
              <div key={s.label} className="glass-card py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.color + '20' }}>
                    <s.icon size={15} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-base text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top disease banner */}
          {topDisease && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
              <Bug size={15} className="text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">Most Frequent Disease</p>
                <p className="text-xs text-amber-700">{topDisease}</p>
              </div>
            </div>
          )}

          {/* Report form */}
          <div className="glass-card space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Report Information</p>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Agronomist / Your Name</Label>
              <Input type="text" value={user?.name ?? ''} readOnly
                className="h-10 rounded-xl bg-secondary/40 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Field / Plot Name</Label>
              <Input type="text" value={fieldName} onChange={e => setFieldName(e.target.value)}
                placeholder="e.g. North Field — Farm Green Valley" className="h-10 rounded-xl text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Observations (optional)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Field conditions, practices applied, weather notes..."
                rows={3} className="rounded-xl resize-none text-sm" />
            </div>
          </div>

          {/* Generate button */}
          <Button className="w-full h-12 font-semibold gap-2 rounded-xl text-base"
            style={{ background: 'linear-gradient(135deg, oklch(0.32 0.09 155), oklch(0.42 0.12 155))' }}
            onClick={() => {
              generateReport(history, user?.name ?? 'User', fieldName, notes);
              toast.success('Report generated! Check your print dialog.');
            }}>
            <Printer size={18} />Generate PDF Report
          </Button>

          {/* What's included */}
          <div className="glass-card space-y-2">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-green-500" />Report includes:
            </p>
            {[
              'Executive summary with KPIs (avg, max, min severity)',
              'Risk classification per crop (Healthy / Low / Medium / High)',
              'Disease frequency ranking',
              'Individual analysis table with disease names & confidence',
              'Your field observations',
              'Scientific methodology & references',
            ].map(item => (
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


