/**
 * PhytoPathometric — OpenRouter Vision API Client
 * Production-grade schema with crop detection, tissue segmentation, and explainability.
 */

// ─── Treatment structure ──────────────────────────────────────────────────────
export interface TreatmentDetail {
  organic: string[];
  chemical: string[];
  preventive: string[];
}

// ─── Per-diagnosis entry ──────────────────────────────────────────────────────
export interface GeminiDiagnosis {
  is_primary: boolean;
  disease_name: string;
  scientific_name: string;
  disease_type: "fungal" | "bacterial" | "viral" | "physiological" | "abiotic" | "healthy";
  lesion_type: string;
  confidence_percent: number;
  supporting_symptoms: string[];
  affected_leaf_area_percent: number;
  treatment: TreatmentDetail;
}

// ─── Full analysis response ───────────────────────────────────────────────────
export interface GeminiDiagnosisResult {
  // Image quality
  image_valid: boolean;
  image_quality_issue?: string | null;

  // Crop identification
  detected_crop: string;
  crop_confidence_percent: number;

  // Severity
  severity_percent: number;
  severity_label: "Saudável" | "Leve" | "Moderada" | "Severa";
  healthy_area_px_percent: number;
  lesion_area_px_percent: number;

  // Tissue breakdown
  tissue_breakdown: {
    healthy_percent: number;
    chlorotic_percent: number;
    necrotic_percent: number;
    damaged_percent: number;
  };

  // Diagnoses
  diagnoses: GeminiDiagnosis[];

  // Recommendations
  recommendations: {
    immediate: string[];
    preventive: string[];
    monitoring: string[];
  };

  // Explainability
  analysis_summary: string;
  environmental_risk_factors: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dataUrlToBase64(dataUrl: string): { base64: string; mimeType: string } {
  const [header, base64] = dataUrl.split(",");
  const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  return { base64, mimeType };
}

// ─── API call ─────────────────────────────────────────────────────────────────
export async function analyzeWithGemini(
  imageDataUrl: string,
  cropType: string,
): Promise<GeminiDiagnosisResult> {
  const { base64, mimeType } = dataUrlToBase64(imageDataUrl);

  const response = await fetch("/api/analyze-disease", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, mimeType, cultura: cropType }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(errData.error ?? `HTTP ${response.status}`);
  }

  const data = await response.json() as GeminiDiagnosisResult;

  // Structural validation
  if (data.image_valid === false) {
    return data; // Return as-is — UI handles invalid image state
  }

  if (!Array.isArray(data.diagnoses)) {
    throw new Error("Invalid server response: missing diagnoses");
  }

  return data;
}
