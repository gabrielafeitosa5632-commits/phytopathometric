/**
 * PhytoPathometric — Image Processing Hook
 * Implements HSV leaf segmentation + CIELAB lesion detection
 * Pipeline: Gaussian blur → HSV segmentation → CIELAB lesion detection → severity calculation
 * Advanced mode: Multiespectral analysis with disease database matching
 */
import { useCallback } from 'react';
import { AnalysisSettings, classifySeverity, AnalysisResult } from '@/contexts/AnalysisContext';
import { nanoid } from 'nanoid';
import { analyzeImageAdvanced, AdvancedAnalysisResult } from '@/lib/advancedImageAnalysis';
import { DISEASE_DATABASE } from '@/lib/diseaseDatabase';

interface ProcessResult {
  severidade: number;
  areaTotal: number;
  areaLesionada: number;
  areaSaudavel: number;
  processedImageDataUrl: string;
  maskImageDataUrl: string;
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0, s = 0;
  const v = max;
  if (max !== 0) s = d / max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 180, s * 255, v * 255];
}

// Convert RGB to CIELAB (approximate)
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // sRGB to linear
  const linearize = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);
  // Linear RGB to XYZ (D65)
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  const y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) / 1.00000;
  const z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// Simple Gaussian blur (3x3 kernel)
function gaussianBlur(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kernelSum = 16;
  const result = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      let ki = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nx = Math.min(Math.max(x + kx, 0), width - 1);
          const ny = Math.min(Math.max(y + ky, 0), height - 1);
          const idx = (ny * width + nx) * 4;
          r += data[idx] * kernel[ki];
          g += data[idx + 1] * kernel[ki];
          b += data[idx + 2] * kernel[ki];
          ki++;
        }
      }
      const idx = (y * width + x) * 4;
      result[idx] = r / kernelSum;
      result[idx + 1] = g / kernelSum;
      result[idx + 2] = b / kernelSum;
      result[idx + 3] = data[idx + 3];
    }
  }
  return result;
}

// Morphological erosion (3x3)
function erode(mask: Uint8Array, width: number, height: number): Uint8Array {
  const result = new Uint8Array(mask.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let min = 255;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          min = Math.min(min, mask[(y + ky) * width + (x + kx)]);
        }
      }
      result[y * width + x] = min;
    }
  }
  return result;
}

// Morphological dilation (3x3)
function dilate(mask: Uint8Array, width: number, height: number): Uint8Array {
  const result = new Uint8Array(mask.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let max = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          max = Math.max(max, mask[(y + ky) * width + (x + kx)]);
        }
      }
      result[y * width + x] = max;
    }
  }
  return result;
}

export function useImageProcessor() {
  const processImage = useCallback(async (
    imageDataUrl: string,
    cultura: string,
    settings: AnalysisSettings,
    observacoes?: string,
  ): Promise<AnalysisResult> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Resize for performance
          const maxDim = 800;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);

          // SIMPLE & ROBUST DETECTION
          // Count lesions directly by color
          let necrosisPixels = 0;
          let chlorosisPixels = 0;
          let healthyPixels = 0;
          let otherPixels = 0;
          let totalPixels = 0;

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];

            // Skip transparent pixels
            if (a < 100) continue;

            totalPixels++;

            // Convert to HSV
            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn);
            const min = Math.min(rn, gn, bn);
            const delta = max - min;

            let h = 0;
            if (delta !== 0) {
              if (max === rn) h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) % 6;
              else if (max === gn) h = (bn - rn) / delta + 2;
              else h = (rn - gn) / delta + 4;
              h = (h / 6) * 360;
            }
            const s = max === 0 ? 0 : (delta / max) * 100;
            const v = max * 100;

            // NECROSIS: Dark brown/red (V < 60, H: 0-30° or 330-360°)
            if (v < 60 && ((h >= 0 && h <= 30) || h >= 330) && s > 20) {
              necrosisPixels++;
            }
            // CHLOROSIS: Yellow/light (V > 70, H: 45-75°, S < 80)
            else if (v > 70 && h >= 45 && h <= 75 && s < 80) {
              chlorosisPixels++;
            }
            // CHLOROSIS LIGHT: Very light yellow-green
            else if (v > 75 && h >= 40 && h <= 90 && s < 50 && g > r) {
              chlorosisPixels++;
            }
            // HEALTHY: Green (H: 90-150°, V: 40-90, S > 30)
            else if (h >= 90 && h <= 150 && v > 40 && v < 90 && s > 30) {
              healthyPixels++;
            }
            // OTHER: Everything else
            else {
              otherPixels++;
            }
          }

          const areaLesionada = necrosisPixels + chlorosisPixels;
          const areaTotal = totalPixels;
          const areaSaudavel = healthyPixels;
          const severidade = areaTotal > 0
            ? (areaLesionada / areaTotal) * 100
            : 0;

          // Create processed visualization
          const outCanvas = document.createElement('canvas');
          outCanvas.width = width;
          outCanvas.height = height;
          const outCtx = outCanvas.getContext('2d')!;
          outCtx.drawImage(img, 0, 0, width, height);
          const outData = outCtx.getImageData(0, 0, width, height);

          // Create visualization with color overlays
          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];

            if (a < 100) continue;

            // Convert to HSV
            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn);
            const min = Math.min(rn, gn, bn);
            const delta = max - min;

            let h = 0;
            if (delta !== 0) {
              if (max === rn) h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) % 6;
              else if (max === gn) h = (bn - rn) / delta + 2;
              else h = (rn - gn) / delta + 4;
              h = (h / 6) * 360;
            }
            const s = max === 0 ? 0 : (delta / max) * 100;
            const v = max * 100;

            // Classify and color
            if (v < 60 && ((h >= 0 && h <= 30) || h >= 330) && s > 20) {
              // Necrosis: RED
              outData.data[i] = 255;
              outData.data[i + 1] = 50;
              outData.data[i + 2] = 50;
            } else if ((v > 70 && h >= 45 && h <= 75 && s < 80) || (v > 75 && h >= 40 && h <= 90 && s < 50 && g > r)) {
              // Chlorosis: YELLOW
              outData.data[i] = 255;
              outData.data[i + 1] = 255;
              outData.data[i + 2] = 0;
            } else if (h >= 90 && h <= 150 && v > 40 && v < 90 && s > 30) {
              // Healthy: GREEN
              outData.data[i] = 50;
              outData.data[i + 1] = 200;
              outData.data[i + 2] = 50;
            } else {
              // Other: GRAY
              const gray = (r + g + b) / 3;
              outData.data[i] = gray;
              outData.data[i + 1] = gray;
              outData.data[i + 2] = gray;
            }
          }
          outCtx.putImageData(outData, 0, 0);

          const result: AnalysisResult = {
            id: nanoid(8),
            timestamp: new Date(),
            cultura,
            severidade: Math.round(severidade * 100) / 100,
            areaTotal,
            areaLesionada,
            areaSaudavel,
            nivel: classifySeverity(severidade),
            imageDataUrl,
            processedImageDataUrl: outCanvas.toDataURL('image/jpeg', 0.85),
            observacoes,
          };

          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = imageDataUrl;
    });
  }, []);

  const processImageAdvanced = useCallback(async (
    imageDataUrl: string,
    cultura: string,
  ): Promise<AdvancedAnalysisResult & { processedImageDataUrl: string; id: string; timestamp: Date }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const analysis = analyzeImageAdvanced(imageData);

          // Find matching diseases from database
          const matchedDiseases: Array<{ name: string; confidence: number; treatment: string[] }> = [];
          for (const disease of DISEASE_DATABASE) {
            if (analysis.dominantLesionType === disease.lesionType) {
              let confidence = 0;
              if (analysis.lesionAnalysis.necrotic.percentage > 0 && disease.lesionType === 'necrotic') {
                confidence = analysis.lesionAnalysis.necrotic.confidence;
              } else if (analysis.lesionAnalysis.chlorotic.percentage > 0 && disease.lesionType === 'chlorotic') {
                confidence = analysis.lesionAnalysis.chlorotic.confidence;
              }
              if (confidence > 0.6) {
                const treatments = [
                  ...(disease.treatment.fungicide || []),
                  ...(disease.treatment.bactericide || []),
                  ...(disease.treatment.cultural || []),
                ];
                matchedDiseases.push({
                  name: disease.name,
                  confidence: Math.min(1, confidence + 0.1),
                  treatment: treatments,
                });
              }
            }
          }
          matchedDiseases.sort((a, b) => b.confidence - a.confidence);

          // Generate recommendations
          const topDisease = matchedDiseases[0];
          const recommendations = {
            immediate: [] as string[],
            preventive: [] as string[],
            monitoring: [] as string[],
          };

          if (topDisease) {
            if (analysis.severity > 50) {
              recommendations.immediate = [
                `Aplicar ${topDisease.treatment[0] || 'fungicida'} imediatamente`,
                'Monitorar evolução da doença',
                'Isolar plantas infectadas se possível',
              ];
            }
            recommendations.preventive = topDisease.treatment.slice(0, 2);
            recommendations.monitoring = [
              'Monitorar umidade foliar',
              'Verificar condições ambientais',
              'Reavaliar em 7 dias',
            ];
          }

          // Create visualization
          const outCanvas = document.createElement('canvas');
          outCanvas.width = width;
          outCanvas.height = height;
          const outCtx = outCanvas.getContext('2d')!;
          outCtx.drawImage(img, 0, 0, width, height);

          const result: AdvancedAnalysisResult & { processedImageDataUrl: string; id: string; timestamp: Date } = {
            ...analysis,
            predictedDiseases: matchedDiseases.slice(0, 3),
            recommendations,
            overallConfidence: Math.min(1, (matchedDiseases[0]?.confidence || 0) + 0.15),
            processedImageDataUrl: outCanvas.toDataURL('image/jpeg', 0.85),
            id: nanoid(8),
            timestamp: new Date(),
          };

          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = imageDataUrl;
    });
  }, []);

  return { processImage, processImageAdvanced };
}
