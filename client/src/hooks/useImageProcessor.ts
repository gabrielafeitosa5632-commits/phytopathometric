/**
 * PhytoPathometric — Image Processing Hook (Production v3)
 *
 * Pipeline:
 * 1. Image quality validation (blur/brightness check)
 * 2. CLAHE contrast enhancement + noise reduction
 * 3. Background removal via GrabCut-style HSV masking
 * 4. Tissue segmentation: healthy / chlorotic / necrotic / damaged
 * 5. Heatmap generation (disease intensity overlay)
 * 6. AI analysis via OpenRouter (with crop-specific diseases)
 * 7. Local engine fallback (HSV+CIELAB+DiseaseDB)
 */
import { useCallback } from 'react';
import { AnalysisSettings, classifySeverity, AnalysisResult, SeverityLevel, TissueBreakdown } from '@/contexts/AnalysisContext';
import { nanoid } from 'nanoid';
import { analyzeWithGemini } from '@/lib/geminiAnalysis';
import { analyzeImageAdvanced, rgbToHsv, rgbToCielab } from '@/lib/advancedImageAnalysis';
import { DISEASE_DATABASE, DiseasePattern } from '@/lib/diseaseDatabase';

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_DIM = 900;

const LESION_TYPE_MAP: Record<string, string> = {
  necrotic: 'Necrotic', chlorotic: 'Chlorotic', aqueous: 'Water-soaked',
  pustule: 'Pustule', mottled: 'Mottled', ringspot: 'Ring Spot',
  mixed: 'Necrotic', healthy: 'Healthy',
};

// ─── Image quality check ──────────────────────────────────────────────────────
function checkImageQuality(imageData: ImageData): { valid: boolean; issue?: string } {
  const { data, width, height } = imageData;
  let totalBrightness = 0;
  let edgeSum = 0;
  const pixels = width * height;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = (y * width + x) * 4;
      const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      totalBrightness += gray;
      // Laplacian blur detection
      const above = ((y - 1) * width + x) * 4;
      const below = ((y + 1) * width + x) * 4;
      const gAbove = (data[above] + data[above + 1] + data[above + 2]) / 3;
      const gBelow = (data[below] + data[below + 1] + data[below + 2]) / 3;
      edgeSum += Math.abs(gray * 2 - gAbove - gBelow);
    }
  }

  const sampledPixels = Math.floor(pixels / 4);
  const avgBrightness = totalBrightness / sampledPixels;
  const sharpness = edgeSum / sampledPixels;

  if (avgBrightness < 20) return { valid: false, issue: 'too_dark' };
  if (avgBrightness > 240) return { valid: false, issue: 'too_bright' };
  if (sharpness < 1.5) return { valid: false, issue: 'blurry' };
  return { valid: true };
}

// ─── CLAHE-style contrast enhancement ────────────────────────────────────────
function applyCLAHE(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const enhanced = new Uint8ClampedArray(data);
  const tileW = Math.max(1, Math.floor(width / 8));
  const tileH = Math.max(1, Math.floor(height / 8));

  for (let ty = 0; ty < height; ty += tileH) {
    for (let tx = 0; tx < width; tx += tileW) {
      // Build local histogram
      const hist = new Float32Array(256);
      let count = 0;
      for (let y = ty; y < Math.min(ty + tileH, height); y++) {
        for (let x = tx; x < Math.min(tx + tileW, width); x++) {
          const i = (y * width + x) * 4;
          const lum = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
          hist[lum]++;
          count++;
        }
      }
      // Clip and redistribute
      const clipLimit = Math.max(1, (count / 256) * 2.5);
      let excess = 0;
      for (let v = 0; v < 256; v++) {
        if (hist[v] > clipLimit) { excess += hist[v] - clipLimit; hist[v] = clipLimit; }
      }
      const redist = excess / 256;
      for (let v = 0; v < 256; v++) hist[v] += redist;
      // CDF
      const cdf = new Float32Array(256);
      cdf[0] = hist[0];
      for (let v = 1; v < 256; v++) cdf[v] = cdf[v - 1] + hist[v];
      const cdfMin = cdf.find(v => v > 0) ?? 0;
      // Apply
      for (let y = ty; y < Math.min(ty + tileH, height); y++) {
        for (let x = tx; x < Math.min(tx + tileW, width); x++) {
          const i = (y * width + x) * 4;
          for (let c = 0; c < 3; c++) {
            const lum = Math.round(enhanced[i] * 0.299 + enhanced[i + 1] * 0.587 + enhanced[i + 2] * 0.114);
            const mapped = Math.round(((cdf[lum] - cdfMin) / (count - cdfMin)) * 255);
            const ratio = count > cdfMin ? mapped / Math.max(1, lum) : 1;
            enhanced[i + c] = Math.min(255, Math.max(0, Math.round(data[i + c] * ratio)));
          }
        }
      }
    }
  }
  return enhanced;
}

// ─── 3×3 box blur noise reduction ────────────────────────────────────────────
function applyBoxBlur(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++)
            sum += data[((y + dy) * width + (x + dx)) * 4 + c];
        out[(y * width + x) * 4 + c] = Math.round(sum / 9);
      }
    }
  }
  return out;
}

// ─── Pure 0–360 HSV (no OpenCV scaling) ─────────────────────────────────────
// rgbToHsv from advancedImageAnalysis returns H in 0–180 (OpenCV).
// We need 0–360 for our thresholds, so we use our own helper here.
function hsvFull(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn)      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else                 h = ((rn - gn) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : d / max;       // 0–1
  const v = max;                            // 0–1
  return [h, s * 255, v * 255];            // H:0–360, S:0–255, V:0–255
}

// ─── Background removal — strict leaf mask ───────────────────────────────────
// Includes: definite green leaf tissue + typical lesion colors ON a leaf.
// Excludes: plain grey/white/blue backgrounds, shadows with no saturation.
function buildLeafMask(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    const [h, s, v] = hsvFull(r, g, b);

    // ExG vegetation index — positive means more green than red+blue
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const exg = 2 * gn - rn - bn;

    // 1. Healthy/dark green leaf tissue
    const isGreen = (h >= 40 && h <= 170) && s > 30 && v > 20;

    // 2. Yellow-green (slight chlorosis still on leaf)
    const isYellowGreen = (h >= 40 && h <= 90) && exg > 0 && s > 25 && v > 60;

    // 3. Brown/rust lesion ON leaf — must have moderate saturation & not too bright
    //    (avoid picking up beige/tan paper backgrounds)
    const isBrownLesion = (h >= 10 && h <= 50) && s > 60 && v > 30 && v < 190 && r > b;

    // 4. Dark necrotic tissue — very dark, some saturation
    const isNecrotic = v < 80 && s > 25 && (h < 50 || h > 170);

    if (isGreen || isYellowGreen || isBrownLesion || isNecrotic) {
      mask[i / 4] = 1;
    }
  }
  return mask;
}

// ─── Tissue classification (H in 0–360, S/V in 0–255) ───────────────────────
type PixelType = 'healthy' | 'chlorotic' | 'necrotic' | 'damaged' | 'background';

function classifyPixel(r: number, g: number, b: number): PixelType {
  const [h, s, v] = hsvFull(r, g, b);
  const [L, labA, labB] = rgbToCielab(r, g, b);

  // ── Healthy green leaf ────────────────────────────────────────────────────
  // H: 70–165 (pure greens), good saturation, not too dark, green > red
  if (h >= 65 && h <= 170 && s > 40 && v > 50 && v < 230 && g > r && g > b) {
    return 'healthy';
  }

  // ── Chlorotic (yellowing) ─────────────────────────────────────────────────
  // H: 40–80 (yellow-green to yellow), high L*, positive b* (yellow in CIELab)
  if (h >= 38 && h <= 82 && L > 55 && labB > 12 && s > 30 && s < 220 && g >= r * 0.85) {
    return 'chlorotic';
  }

  // ── Necrotic (brown/black dead tissue) ───────────────────────────────────
  // Very dark OR brown hue with low brightness
  if (v < 70) return 'necrotic';                           // near-black
  if ((h >= 0 && h <= 35) && s > 40 && v < 140 && r > g) return 'necrotic'; // dark brown
  if (h >= 320 && s > 30 && v < 130) return 'necrotic';   // dark red-purple

  // ── Damaged (orange-red pustules, rust, blight spots) ────────────────────
  // H: 0–35 orange/red range, high saturation (vivid), medium brightness
  if ((h >= 0 && h <= 35) && s > 100 && v >= 80 && v < 230) return 'damaged';
  // Deep orange (rust pustules): H 15–45, high sat
  if (h >= 15 && h <= 50 && s > 130 && v > 70) return 'damaged';
  // Labelled as positive a* in CIELab (reddish) with low L (darkened)
  if (labA > 20 && L < 55 && labB > 5) return 'necrotic';

  return 'background';
}

// ─── Main segmentation + heatmap generation ─────────────────────────────────
function generateSegmentedImages(img: HTMLImageElement): {
  processedImageDataUrl: string;
  heatmapDataUrl: string;
  areaTotal: number;
  areaLesionada: number;
  areaSaudavel: number;
  imageData: ImageData;
  tissue: TissueBreakdown;
  qualityCheck: { valid: boolean; issue?: string };
} {
  let { width, height } = img;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
  const rawImageData = ctx.getImageData(0, 0, width, height);

  // Quality check on original
  const qualityCheck = checkImageQuality(rawImageData);

  // Preprocessing: box blur → CLAHE
  const blurred = applyBoxBlur(rawImageData.data, width, height);
  const enhanced = applyCLAHE(blurred, width, height);

  // Build processed ImageData for analysis
  const processedData = new ImageData(enhanced, width, height);

  // Leaf mask
  const mask = buildLeafMask(enhanced, width, height);

  // Tissue classification
  let healthy = 0, chlorotic = 0, necrotic = 0, damaged = 0, leafPx = 0;
  const classMap = new Uint8Array(width * height); // 0=bg,1=healthy,2=chloro,3=necro,4=damaged

  for (let idx = 0; idx < mask.length; idx++) {
    if (!mask[idx]) continue;
    leafPx++;
    const i = idx * 4;
    const type = classifyPixel(enhanced[i], enhanced[i + 1], enhanced[i + 2]);
    if (type === 'healthy')    { healthy++;   classMap[idx] = 1; }
    else if (type === 'chlorotic') { chlorotic++; classMap[idx] = 2; }
    else if (type === 'necrotic')  { necrotic++;  classMap[idx] = 3; }
    else if (type === 'damaged')   { damaged++;   classMap[idx] = 4; }
  }

  const total = Math.max(1, leafPx);
  const tissue: TissueBreakdown = {
    healthy_percent:   Math.round((healthy   / total) * 1000) / 10,
    chlorotic_percent: Math.round((chlorotic / total) * 1000) / 10,
    necrotic_percent:  Math.round((necrotic  / total) * 1000) / 10,
    damaged_percent:   Math.round((damaged   / total) * 1000) / 10,
  };

  // ── Segmented overlay ─────────────────────────────────────────────────────
  // Strategy: draw original image first, then blend semi-transparent colour
  // ONLY over diseased/background pixels. Healthy tissue keeps natural look
  // with a subtle green tint. Background gets dimmed to grey.
  const segCanvas = document.createElement('canvas');
  segCanvas.width = width; segCanvas.height = height;
  const segCtx = segCanvas.getContext('2d')!;
  segCtx.drawImage(img, 0, 0, width, height);
  const segData = segCtx.getImageData(0, 0, width, height);
  const orig = new Uint8ClampedArray(segData.data); // keep original pixels

  for (let idx = 0; idx < classMap.length; idx++) {
    const i = idx * 4;
    const cls = classMap[idx];
    const or = orig[i], og = orig[i + 1], ob = orig[i + 2];

    if (cls === 0) {
      // Background: desaturate + dim to make leaf pop
      const gray = Math.round(or * 0.2126 + og * 0.7152 + ob * 0.0722);
      const dimmed = Math.round(gray * 0.55);
      segData.data[i] = dimmed; segData.data[i+1] = dimmed; segData.data[i+2] = dimmed;

    } else if (cls === 1) {
      // Healthy: keep original + subtle green brightness boost (natural look)
      segData.data[i]   = Math.min(255, Math.round(or * 0.80));
      segData.data[i+1] = Math.min(255, Math.round(og * 1.10));
      segData.data[i+2] = Math.min(255, Math.round(ob * 0.80));

    } else if (cls === 2) {
      // Chlorotic: blend 55% yellow over original pixel
      const alpha = 0.55;
      segData.data[i]   = Math.min(255, Math.round(or * (1-alpha) + 240 * alpha));
      segData.data[i+1] = Math.min(255, Math.round(og * (1-alpha) + 210 * alpha));
      segData.data[i+2] = Math.min(255, Math.round(ob * (1-alpha) +   0 * alpha));

    } else if (cls === 3) {
      // Necrotic: blend 70% bright red over original — clearly visible
      const alpha = 0.70;
      segData.data[i]   = Math.min(255, Math.round(or * (1-alpha) + 230 * alpha));
      segData.data[i+1] = Math.min(255, Math.round(og * (1-alpha) +  30 * alpha));
      segData.data[i+2] = Math.min(255, Math.round(ob * (1-alpha) +  30 * alpha));

    } else if (cls === 4) {
      // Damaged: blend 65% vivid orange
      const alpha = 0.65;
      segData.data[i]   = Math.min(255, Math.round(or * (1-alpha) + 250 * alpha));
      segData.data[i+1] = Math.min(255, Math.round(og * (1-alpha) +  90 * alpha));
      segData.data[i+2] = Math.min(255, Math.round(ob * (1-alpha) +   0 * alpha));
    }
  }
  segCtx.putImageData(segData, 0, 0);

  // ── Heatmap overlay (disease intensity on top of original) ─────────────────
  // Draw original image, then paint semi-transparent heat colours over diseased areas only.
  const hmCanvas = document.createElement('canvas');
  hmCanvas.width = width; hmCanvas.height = height;
  const hmCtx = hmCanvas.getContext('2d')!;
  hmCtx.drawImage(img, 0, 0, width, height);

  // Build a heat overlay using a second canvas and composite it
  const heatOverlay = document.createElement('canvas');
  heatOverlay.width = width; heatOverlay.height = height;
  const hoCtx = heatOverlay.getContext('2d')!;
  const hoData = hoCtx.createImageData(width, height);

  for (let idx = 0; idx < classMap.length; idx++) {
    const i = idx * 4;
    const cls = classMap[idx];
    hoData.data[i + 3] = 0; // default transparent

    if (cls === 3) {
      // Necrotic: solid red
      hoData.data[i] = 220; hoData.data[i+1] = 20; hoData.data[i+2] = 20;
      hoData.data[i+3] = 190;
    } else if (cls === 4) {
      // Damaged: vivid orange
      hoData.data[i] = 255; hoData.data[i+1] = 100; hoData.data[i+2] = 0;
      hoData.data[i+3] = 175;
    } else if (cls === 2) {
      // Chlorotic: yellow
      hoData.data[i] = 255; hoData.data[i+1] = 230; hoData.data[i+2] = 0;
      hoData.data[i+3] = 140;
    } else if (cls === 1) {
      // Healthy: transparent green wash
      hoData.data[i] = 50; hoData.data[i+1] = 200; hoData.data[i+2] = 50;
      hoData.data[i+3] = 60;
    } else {
      // Background: dark grey overlay
      hoData.data[i] = 20; hoData.data[i+1] = 20; hoData.data[i+2] = 20;
      hoData.data[i+3] = 110;
    }
  }
  hoCtx.putImageData(hoData, 0, 0);
  hmCtx.drawImage(heatOverlay, 0, 0);

  return {
    processedImageDataUrl: segCanvas.toDataURL('image/jpeg', 0.88),
    heatmapDataUrl: hmCanvas.toDataURL('image/jpeg', 0.88),
    areaTotal: leafPx,
    areaLesionada: necrotic + damaged + chlorotic,
    areaSaudavel: healthy,
    imageData: processedData,
    tissue,
    qualityCheck,
  };
}

// ─── Severity label ───────────────────────────────────────────────────────────
function severityLabel(pct: number): 'Saudável' | 'Leve' | 'Moderada' | 'Severa' {
  if (pct < 10) return 'Saudável';
  if (pct < 25) return 'Leve';
  if (pct < 50) return 'Moderada';
  return 'Severa';
}

// ─── Crop-aware disease matching ─────────────────────────────────────────────
function matchDiseases(
  cultura: string, dominantLesionType: string, severity: number,
  avgHsvH: number, avgHsvS: number, avgHsvV: number,
  avgLabL: number, avgLabA: number, avgLabB: number,
): DiseasePattern[] {
  const cropLower = cultura.toLowerCase();
  const scored = DISEASE_DATABASE.map(disease => {
    let score = 0;
    const cropMatch = disease.affectedCrops.some(
      c => c.toLowerCase().includes(cropLower) || cropLower.includes(c.toLowerCase()),
    );
    // Strong crop filter — diseases not affecting this crop get heavy penalty
    if (cropMatch) score += 50; else score -= 20;
    const lesionMap: Record<string, string[]> = {
      necrotic: ['necrotic', 'mixed'], chlorotic: ['chlorotic', 'mixed'],
      pustule: ['pustule'], aqueous: ['aqueous', 'necrotic'],
      mottled: ['mottled', 'chlorotic'], ringspot: ['ringspot', 'necrotic'],
    };
    const compatibleLesions = lesionMap[dominantLesionType] ?? [];
    if (compatibleLesions.includes(disease.lesionType)) score += 30;
    const hsvH = avgHsvH * 2;
    if (hsvH >= disease.hsvSignature.hueRange[0] && hsvH <= disease.hsvSignature.hueRange[1])
      score += 15 * disease.hsvSignature.confidence;
    if (avgLabL >= disease.cielabSignature.lRange[0] && avgLabL <= disease.cielabSignature.lRange[1])
      score += 15 * disease.cielabSignature.confidence;
    return { disease, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3)
    .filter(d => d.score > 0).map(d => d.disease);
}

// ─── Build treatment recommendations ────────────────────────────────────────
function buildRecommendations(diseases: DiseasePattern[], severity: number) {
  const primary = diseases[0];
  if (!primary) {
    return {
      immediate: ['Monitor crop regularly for early symptoms'],
      preventive: ['Maintain balanced soil nutrition', 'Practice crop rotation'],
      monitoring: ['Re-inspect in 7 days'],
    };
  }
  const immediate: string[] = [];
  const preventive: string[] = [];
  const monitoring: string[] = [];
  if (severity >= 25) {
    if (primary.treatment.fungicide?.length)
      immediate.push(`Apply fungicide: ${primary.treatment.fungicide[0]}`);
    if (primary.treatment.bactericide?.length)
      immediate.push(`Apply bactericide: ${primary.treatment.bactericide[0]}`);
    if (primary.treatment.cultural?.length)
      immediate.push(primary.treatment.cultural[0]);
  }
  if (primary.treatment.preventive?.length)
    preventive.push(...primary.treatment.preventive.slice(0, 2));
  if (primary.treatment.cultural?.length)
    preventive.push(...primary.treatment.cultural.slice(1, 3));
  if (primary.treatment.resistant_varieties?.length)
    preventive.push(`Resistant varieties: ${primary.treatment.resistant_varieties[0]}`);
  monitoring.push(severity >= 50 ? 'Inspect daily — severe damage detected'
    : severity >= 25 ? 'Re-evaluate in 3–5 days after treatment'
    : 'Check again in 7–10 days');
  monitoring.push(`Optimal temp for ${primary.name}: ${primary.favorableConditions.temperature[0]}–${primary.favorableConditions.temperature[1]}°C`);
  return { immediate, preventive, monitoring };
}

// ─── Local engine ────────────────────────────────────────────────────────────
function runLocalEngine(imageData: ImageData, cultura: string, tissue: TissueBreakdown) {
  const advanced = analyzeImageAdvanced(imageData);
  const severity = Math.min(100, Math.max(0, advanced.severity));
  const la = advanced.lesionAnalysis;
  const domType = advanced.dominantLesionType;
  let avgHsvH = 0, avgHsvS = 0, avgHsvV = 0, avgLabL = 50, avgLabA = 0, avgLabB = 0;
  if (domType === 'necrotic' && la.necrotic.confidence > 0) {
    avgHsvH = la.necrotic.color.hsvL; avgHsvS = la.necrotic.color.hsvA;
    avgHsvV = la.necrotic.color.hsvB; avgLabL = la.necrotic.color.cielabL;
    avgLabA = la.necrotic.color.cielabA; avgLabB = la.necrotic.color.cielabB;
  } else if (domType === 'chlorotic' && la.chlorotic.confidence > 0) {
    avgHsvH = la.chlorotic.color.hsvL; avgHsvS = la.chlorotic.color.hsvA;
    avgHsvV = la.chlorotic.color.hsvB; avgLabL = la.chlorotic.color.cielabL;
    avgLabA = la.chlorotic.color.cielabA; avgLabB = la.chlorotic.color.cielabB;
  }
  const matchedDiseases = matchDiseases(cultura, domType, severity,
    avgHsvH, avgHsvS, avgHsvV, avgLabL, avgLabA, avgLabB);

  if (severity < 10 || matchedDiseases.length === 0) {
    return {
      severity_percent: severity, severity_label: 'Saudável' as const,
      healthy_area_px_percent: tissue.healthy_percent,
      lesion_area_px_percent: tissue.necrotic_percent + tissue.damaged_percent,
      dominantLesionType: 'Healthy',
      predictedDiseases: [{
        name: 'Healthy Plant', scientific_name: '', disease_type: 'healthy' as const,
        confidence: 0.92, confidence_percent: 92, treatment: { organic: [], chemical: [], preventive: [] },
        lesionType: 'Healthy', is_primary: true, supporting_symptoms: ['No lesions detected', 'Uniform green coloration'],
        affected_leaf_area_percent: 0,
      }],
      recommendations: {
        immediate: [],
        preventive: ['Maintain regular preventive monitoring', 'Ensure adequate soil nutrition'],
        monitoring: ['Re-check in 14 days', 'Watch for climate conditions favoring disease'],
      },
      analysis_summary: `Leaf appears healthy with ${tissue.healthy_percent.toFixed(1)}% healthy tissue. No significant disease symptoms detected by local analysis engine.`,
    };
  }

  const predictedDiseases = matchedDiseases.map((disease, idx) => {
    const baseConf = idx === 0 ? 72 : idx === 1 ? 52 : 34;
    const lesionBonus = disease.lesionType === domType ? 10 : 0;
    const cropBonus = disease.affectedCrops.some(c => c.toLowerCase().includes(cultura.toLowerCase())) ? 8 : 0;
    const confidencePct = Math.min(88, baseConf + lesionBonus + cropBonus);
    return {
      name: disease.name, scientific_name: disease.scientificName,
      disease_type: disease.type as 'fungal' | 'bacterial' | 'viral' | 'physiological' | 'abiotic',
      confidence: confidencePct / 100, confidence_percent: confidencePct,
      treatment: {
        organic: [],
        chemical: [...(disease.treatment.fungicide?.slice(0, 2) ?? []), ...(disease.treatment.bactericide?.slice(0, 1) ?? [])],
        preventive: disease.treatment.preventive?.slice(0, 2) ?? [],
      },
      lesionType: LESION_TYPE_MAP[disease.lesionType] ?? disease.lesionType,
      is_primary: idx === 0,
      supporting_symptoms: [
        `Dominant lesion: ${LESION_TYPE_MAP[disease.lesionType] ?? disease.lesionType}`,
        `Severity: ${severity.toFixed(1)}% of leaf area`,
      ],
      affected_leaf_area_percent: severity,
    };
  });

  const recommendations = buildRecommendations(matchedDiseases, severity);
  const primary = predictedDiseases[0];
  return {
    severity_percent: severity, severity_label: severityLabel(severity),
    healthy_area_px_percent: tissue.healthy_percent,
    lesion_area_px_percent: tissue.necrotic_percent + tissue.damaged_percent,
    dominantLesionType: LESION_TYPE_MAP[domType] ?? domType,
    predictedDiseases, recommendations,
    analysis_summary: `Local analysis detected ${primary.name} (${primary.confidence_percent}% confidence) on ${cultura}. Severity: ${severity.toFixed(1)}%. Dominant lesion type: ${primary.lesionType}.`,
  };
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export function useImageProcessor() {

  const processImage = useCallback(async (
    imageDataUrl: string,
    cultura: string,
    _settings: AnalysisSettings,
    observacoes?: string,
  ): Promise<AnalysisResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Step 1–4: Preprocessing + segmentation + heatmap
          const visual = generateSegmentedImages(img);

          // Step 5: Image quality validation
          if (!visual.qualityCheck.valid) {
            resolve({
              id: nanoid(8), timestamp: new Date(), cultura,
              image_valid: false,
              image_quality_issue: visual.qualityCheck.issue,
              detected_crop: cultura, crop_confidence_percent: 0,
              severidade: 0, severity_label: 'Saudável',
              nivel: 'saudavel', areaTotal: 0, areaLesionada: 0, areaSaudavel: 0,
              tissue_breakdown: { healthy_percent: 0, chlorotic_percent: 0, necrotic_percent: 0, damaged_percent: 0 },
              imageDataUrl, processedImageDataUrl: visual.processedImageDataUrl,
              heatmapDataUrl: visual.heatmapDataUrl,
              predictedDiseases: [], analysisUnavailable: false, engine_used: 'local',
              analysis_summary: `Image quality issue detected: ${visual.qualityCheck.issue ?? 'unknown'}. Please upload a clear, well-lit leaf image.`,
              environmental_risk_factors: [],
              recommendations: { immediate: ['Re-capture image in good lighting'], preventive: [], monitoring: [] },
            });
            return;
          }

          // Step 6: Try OpenRouter AI first
          let aiResult = null;
          try {
            aiResult = await analyzeWithGemini(imageDataUrl, cultura);
          } catch {
            aiResult = null;
          }

          // Step 7a: AI succeeded
          if (aiResult) {
            // Handle image_valid=false from AI (e.g. not a leaf)
            if (aiResult.image_valid === false) {
              resolve({
                id: nanoid(8), timestamp: new Date(), cultura,
                image_valid: false,
                image_quality_issue: aiResult.image_quality_issue ?? 'not_a_leaf',
                detected_crop: aiResult.detected_crop ?? cultura,
                crop_confidence_percent: aiResult.crop_confidence_percent ?? 0,
                severidade: 0, severity_label: 'Saudável', nivel: 'saudavel',
                areaTotal: visual.areaTotal, areaLesionada: 0, areaSaudavel: 0,
                tissue_breakdown: { healthy_percent: 0, chlorotic_percent: 0, necrotic_percent: 0, damaged_percent: 0 },
                imageDataUrl, processedImageDataUrl: visual.processedImageDataUrl,
                heatmapDataUrl: visual.heatmapDataUrl,
                predictedDiseases: [], analysisUnavailable: false, engine_used: 'ai',
                analysis_summary: 'The submitted image does not appear to contain a plant leaf. Please upload a clear leaf photograph.',
                environmental_risk_factors: [],
                recommendations: { immediate: ['Upload a clear plant leaf image'], preventive: [], monitoring: [] },
              });
              return;
            }

            const primaryDiagnosis = aiResult.diagnoses.find(d => d.is_primary) ?? aiResult.diagnoses[0];
            const predictedDiseases = aiResult.diagnoses.map(d => ({
              name: d.disease_name,
              scientific_name: d.scientific_name,
              disease_type: d.disease_type,
              confidence: d.confidence_percent / 100,
              confidence_percent: d.confidence_percent,
              treatment: d.treatment,
              lesionType: d.lesion_type,
              is_primary: d.is_primary,
              supporting_symptoms: d.supporting_symptoms,
              affected_leaf_area_percent: d.affected_leaf_area_percent,
            }));

            resolve({
              id: nanoid(8), timestamp: new Date(), cultura,
              image_valid: true,
              detected_crop: aiResult.detected_crop,
              crop_confidence_percent: aiResult.crop_confidence_percent,
              severidade: aiResult.severity_percent,
              severity_label: aiResult.severity_label,
              nivel: classifySeverity(aiResult.severity_percent),
              areaTotal: visual.areaTotal,
              areaLesionada: visual.areaLesionada,
              areaSaudavel: visual.areaSaudavel,
              healthy_area_px_percent: aiResult.healthy_area_px_percent,
              lesion_area_px_percent: aiResult.lesion_area_px_percent,
              tissue_breakdown: aiResult.tissue_breakdown ?? visual.tissue,
              imageDataUrl,
              processedImageDataUrl: visual.processedImageDataUrl,
              heatmapDataUrl: visual.heatmapDataUrl,
              observacoes,
              predictedDiseases,
              dominantLesionType: primaryDiagnosis?.lesion_type ?? 'Unknown',
              recommendations: aiResult.recommendations,
              analysis_summary: aiResult.analysis_summary,
              environmental_risk_factors: aiResult.environmental_risk_factors,
              analysisUnavailable: false,
              engine_used: 'ai',
            });
            return;
          }

          // Step 7b: Local engine fallback
          console.info('[PhytoPathometric] AI unavailable — using local HSV+CIELAB+DiseaseDB engine');
          const local = runLocalEngine(visual.imageData, cultura, visual.tissue);
          const severityLevel: SeverityLevel = classifySeverity(local.severity_percent);

          resolve({
            id: nanoid(8), timestamp: new Date(), cultura,
            image_valid: true,
            detected_crop: cultura, crop_confidence_percent: 60,
            severidade: local.severity_percent,
            severity_label: local.severity_label,
            nivel: severityLevel,
            areaTotal: visual.areaTotal,
            areaLesionada: visual.areaLesionada,
            areaSaudavel: visual.areaSaudavel,
            healthy_area_px_percent: local.healthy_area_px_percent,
            lesion_area_px_percent: local.lesion_area_px_percent,
            tissue_breakdown: visual.tissue,
            imageDataUrl,
            processedImageDataUrl: visual.processedImageDataUrl,
            heatmapDataUrl: visual.heatmapDataUrl,
            observacoes,
            predictedDiseases: local.predictedDiseases,
            dominantLesionType: local.dominantLesionType,
            recommendations: local.recommendations,
            analysis_summary: local.analysis_summary,
            environmental_risk_factors: [],
            analysisUnavailable: false,
            engine_used: 'local',
          });
        } catch (err) { reject(err); }
      };
      img.onerror = reject;
      img.src = imageDataUrl;
    });
  }, []);

  const processImageAdvanced = useCallback(async (imageDataUrl: string, cultura: string) => {
    return processImage(imageDataUrl, cultura, {} as AnalysisSettings);
  }, [processImage]);

  return { processImage, processImageAdvanced };
}
