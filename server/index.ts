import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  }
}
loadEnv();

// ─── Extended Response Schema ─────────────────────────────────────────────────
interface DiagnosisResponse {
  // Image quality gate
  image_valid: boolean;
  image_quality_issue?: string; // "blurry" | "low_resolution" | "not_a_leaf" | "no_leaf_detected"

  // Crop identification
  detected_crop: string;          // e.g. "Wheat", "Rice", "Unknown"
  crop_confidence_percent: number; // 0–100

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
  diagnoses: Array<{
    is_primary: boolean;
    disease_name: string;
    scientific_name: string;
    disease_type: "fungal" | "bacterial" | "viral" | "physiological" | "abiotic" | "healthy";
    lesion_type: string;
    confidence_percent: number;
    supporting_symptoms: string[];
    affected_leaf_area_percent: number;
    treatment: {
      organic: string[];
      chemical: string[];
      preventive: string[];
    };
  }>;

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

// ─── Crop-specific disease mapping ───────────────────────────────────────────
const CROP_DISEASE_MAP: Record<string, string[]> = {
  wheat:    ["Stripe Rust", "Leaf Rust", "Stem Rust", "Septoria Leaf Blotch", "Powdery Mildew", "Wheat Blast", "Helminthosporium Blight", "Yellow Rust", "Fusarium Head Blight", "Tan Spot"],
  rice:     ["Rice Blast", "Bacterial Leaf Blight", "Brown Spot", "Sheath Blight", "Narrow Brown Leaf Spot", "False Smut", "Tungro Virus", "Leaf Scald"],
  cotton:   ["Cotton Leaf Curl Virus", "Bacterial Blight", "Alternaria Leaf Spot", "Fusarium Wilt", "Anthracnose", "Angular Leaf Spot"],
  maize:    ["Northern Corn Leaf Blight", "Gray Leaf Spot", "Southern Corn Leaf Blight", "Common Rust", "Tar Spot", "Ear Rot", "Downy Mildew"],
  soybean:  ["Asian Soybean Rust", "Frogeye Leaf Spot", "Bacterial Pustule", "Sudden Death Syndrome", "Anthracnose", "Phytophthora Root Rot"],
  tomato:   ["Early Blight", "Late Blight", "Bacterial Spot", "Target Spot", "Tomato Mosaic Virus", "Septoria Leaf Spot", "Fusarium Wilt"],
  potato:   ["Late Blight", "Early Blight", "Black Scurf", "Common Scab", "Potato Virus Y", "Rhizoctonia"],
  sugarcane:["Sugarcane Rust", "Red Rot", "Smut", "Leaf Scald", "Ratoon Stunting Disease", "Mosaic Virus"],
  coffee:   ["Coffee Leaf Rust", "Coffee Berry Disease", "Brown Eye Spot", "Cercospora Leaf Spot"],
  bean:     ["Bean Rust", "Angular Leaf Spot", "Anthracnose", "Common Bacterial Blight", "Bean Mosaic Virus"],
};

function getCropKey(cropType: string): string {
  const lower = cropType.toLowerCase();
  if (lower.includes("wheat") || lower.includes("trigo") || lower.includes("gandum")) return "wheat";
  if (lower.includes("rice") || lower.includes("arroz") || lower.includes("chawal")) return "rice";
  if (lower.includes("cotton") || lower.includes("algodão") || lower.includes("kapas")) return "cotton";
  if (lower.includes("maize") || lower.includes("milho") || lower.includes("corn")) return "maize";
  if (lower.includes("soja") || lower.includes("soy")) return "soybean";
  if (lower.includes("tomate") || lower.includes("tomato")) return "tomato";
  if (lower.includes("batata") || lower.includes("potato")) return "potato";
  if (lower.includes("cana") || lower.includes("sugarcane") || lower.includes("ganna")) return "sugarcane";
  if (lower.includes("café") || lower.includes("coffee")) return "coffee";
  if (lower.includes("feijão") || lower.includes("bean")) return "bean";
  return "unknown";
}

// ─── Build production-grade AI prompt ────────────────────────────────────────
function buildPrompt(cropType: string): string {
  const cropKey = getCropKey(cropType);
  const knownDiseases = CROP_DISEASE_MAP[cropKey] ?? [];
  const diseaseContext = knownDiseases.length > 0
    ? `Diseases known to affect ${cropType}: ${knownDiseases.join(", ")}.`
    : "Analyze all possible crop diseases.";

  return `You are a senior plant pathologist with 25+ years of field experience and expertise in remote sensing and image-based disease diagnosis. Your role is to provide research-grade, crop-specific, explainable results.

CROP CONTEXT: The submitted image is from a ${cropType} crop.
${diseaseContext}

STEP 1 — IMAGE QUALITY VALIDATION:
First check if the image is suitable for analysis:
- Is it a clear, focused leaf/plant image? (not blurry, not dark, not a random object)
- Is a plant leaf clearly visible?
- Is image resolution adequate?
If image is invalid, set image_valid=false and specify the issue. Still provide the JSON structure but with empty diagnoses.

STEP 2 — CROP DETECTION:
Identify the actual crop species from visual features (leaf shape, venation, texture, color). Report confidence.

STEP 3 — TISSUE SEGMENTATION:
Analyze the leaf and estimate % of:
- healthy_percent: green, uniform, no lesions
- chlorotic_percent: yellowing, pale green areas
- necrotic_percent: brown, black, dead tissue
- damaged_percent: physically damaged, other anomalies

STEP 4 — DISEASE DIAGNOSIS (crop-specific only):
Only diagnose diseases relevant to the detected crop. Use visual evidence:
- Lesion color, shape, distribution, borders
- Presence of sporulation, pustules, water-soaking, halos
- Pattern (interveinal, marginal, scattered, systemic)

VISUAL IDENTIFICATION RULES:
- Orange/red/brown raised powdery pustules → Rust (Pústula)
- White powdery coating on leaf surface → Powdery Mildew
- Water-soaked margins turning necrotic → Bacterial Blight
- Yellow between green veins (no pustules) → Chlorosis / Downy Mildew
- Spindle-shaped lesions with gray centers → Rice/Wheat Blast
- Concentric ring lesions → Early Blight / Alternaria
- Tan lesions with dark dots (pycnidia) → Septoria
- Leaf curling + vein darkening → Viral (CLCuV, Mosaic)
- Uniform green, no symptoms → Healthy

CONFIDENCE CALIBRATION:
- 85–95%: Clear, unambiguous visual evidence matching known disease pattern
- 65–84%: Strong visual match with minor ambiguity
- 45–64%: Probable match, some overlapping features with other diseases
- <45%: Uncertain, multiple possibilities
Do NOT artificially inflate confidence. Be honest about uncertainty.

Respond ONLY with this exact valid JSON (no markdown, no code blocks, no extra text):
{
  "image_valid": <boolean>,
  "image_quality_issue": <null or "blurry" | "low_resolution" | "not_a_leaf" | "no_plant_detected" | "too_dark" | "too_bright">,
  "detected_crop": "<detected crop name or 'Unknown'>",
  "crop_confidence_percent": <0-100>,
  "severity_percent": <0-100>,
  "severity_label": <"Saudável"|"Leve"|"Moderada"|"Severa">,
  "healthy_area_px_percent": <0-100>,
  "lesion_area_px_percent": <0-100>,
  "tissue_breakdown": {
    "healthy_percent": <0-100>,
    "chlorotic_percent": <0-100>,
    "necrotic_percent": <0-100>,
    "damaged_percent": <0-100>
  },
  "diagnoses": [
    {
      "is_primary": <boolean — true for most confident>,
      "disease_name": "<name in English>",
      "scientific_name": "<genus species>",
      "disease_type": <"fungal"|"bacterial"|"viral"|"physiological"|"abiotic"|"healthy">,
      "lesion_type": <"Chlorotic"|"Necrotic"|"Pustule"|"Water-soaked"|"Mottled"|"Ring Spot"|"Powdery"|"Healthy">,
      "confidence_percent": <0-100>,
      "supporting_symptoms": [<2-4 specific visual symptoms observed>],
      "affected_leaf_area_percent": <0-100>,
      "treatment": {
        "organic": [<1-2 organic/biological treatments>],
        "chemical": [<1-3 chemical treatments with active ingredients>],
        "preventive": [<1-3 preventive cultural practices>]
      }
    }
  ],
  "recommendations": {
    "immediate": [<2-3 urgent action items>],
    "preventive": [<2-3 long-term prevention measures>],
    "monitoring": [<2-3 monitoring guidelines>]
  },
  "analysis_summary": "<2-3 sentence professional summary of findings>",
  "environmental_risk_factors": [<2-3 environmental conditions that favor this disease>]
}

RULES:
- severity_label: Saudável=0–9%, Leve=10–24%, Moderada=25–49%, Severa=50–100%
- Return 1–3 diagnoses sorted by confidence (highest first, is_primary=true for first)
- tissue_breakdown percentages must sum to ≤100 (remainder is background/stem)
- If no disease detected: disease_name="Healthy Plant", disease_type="healthy", confidence_percent=90–98
- If image is invalid: return image_valid=false, diagnoses=[], severity_percent=0
- NEVER diagnose a disease that does not affect ${cropType}`;
}

// ─── OpenRouter Vision AI ─────────────────────────────────────────────────────
async function analyzeWithOpenRouter(
  imageBase64: string,
  mimeType: string,
  cropType: string
): Promise<DiagnosisResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-or-")) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  // Vision models ordered by capability
  const models = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-flash-1.5-8b",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
  ];

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "PhytoPathometric",
        },
        body: JSON.stringify({
          model,
          max_tokens: 2048,
          temperature: 0.1, // low temp for consistent structured output
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: buildPrompt(cropType) },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter ${response.status}: ${errText.slice(0, 300)}`);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
        error?: { message: string };
      };

      if (data.error) throw new Error(data.error.message);

      const text = data.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");

      const parsed = JSON.parse(jsonMatch[0]) as DiagnosisResponse;

      // Validate required fields
      if (typeof parsed.severity_percent !== "number") {
        throw new Error("Invalid response structure: missing severity_percent");
      }

      // Ensure new fields have defaults if model returns old format
      if (!parsed.tissue_breakdown) {
        parsed.tissue_breakdown = {
          healthy_percent: parsed.healthy_area_px_percent ?? 70,
          chlorotic_percent: 0,
          necrotic_percent: parsed.lesion_area_px_percent ?? 0,
          damaged_percent: 0,
        };
      }
      if (!parsed.detected_crop) {
        parsed.detected_crop = cropType;
        parsed.crop_confidence_percent = 70;
      }
      if (typeof parsed.image_valid !== "boolean") {
        parsed.image_valid = true;
      }
      if (!parsed.analysis_summary) {
        const primary = parsed.diagnoses?.[0];
        parsed.analysis_summary = primary
          ? `${primary.disease_name} detected with ${primary.confidence_percent}% confidence. Severity: ${parsed.severity_percent}%.`
          : "Analysis complete.";
      }
      if (!parsed.environmental_risk_factors) {
        parsed.environmental_risk_factors = [];
      }

      // Normalize treatment field: support both old (array) and new (object) format
      for (const d of parsed.diagnoses ?? []) {
        if (Array.isArray(d.treatment)) {
          // old format — wrap it
          const arr = d.treatment as unknown as string[];
          (d as unknown as Record<string, unknown>).treatment = {
            organic: [],
            chemical: arr.slice(0, 2),
            preventive: arr.slice(2),
          };
        }
        if (!d.supporting_symptoms) d.supporting_symptoms = [];
        if (typeof d.affected_leaf_area_percent !== "number") {
          d.affected_leaf_area_percent = parsed.lesion_area_px_percent ?? parsed.severity_percent;
        }
        if (!d.scientific_name) d.scientific_name = "";
        if (!d.disease_type) d.disease_type = "fungal";
      }

      console.log(`✅ OpenRouter (${model}): ${parsed.diagnoses?.[0]?.disease_name ?? "Healthy"} | crop: ${parsed.detected_crop} | severity: ${parsed.severity_percent}%`);
      return parsed;

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`⚠️  Model ${model} failed: ${lastError.message}`);
    }
  }

  throw lastError ?? new Error("All models failed");
}

// ─── Server ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "25mb" }));

  // ─── Health check / ping ──────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    const orKey = process.env.OPENROUTER_API_KEY ?? "";
    const configured = orKey.startsWith("sk-or-") && orKey.length > 20;
    res.json({ status: "ok", ai_configured: configured });
  });

  // ─── Main analysis endpoint ───────────────────────────────────────────────
  app.post("/api/analyze-disease", async (req, res) => {
    try {
      const { imageBase64, mimeType, cultura, ping } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        cultura?: string;
        ping?: boolean;
      };

      // Ping / health-check
      if (ping || !imageBase64 || imageBase64.length < 100) {
        const orKey = process.env.OPENROUTER_API_KEY ?? "";
        const configured = orKey.startsWith("sk-or-") && orKey.length > 20;
        return res.json({
          status: "ok",
          gemini: configured,
          ai_engine: configured ? "OpenRouter" : "local",
          message: configured ? "OpenRouter AI ready" : "Local engine active",
        });
      }

      // Basic input validation
      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 is required" });
      }

      const cropType = cultura || "Unknown crop";
      const diagnosis = await analyzeWithOpenRouter(imageBase64, mimeType ?? "image/jpeg", cropType);
      return res.json(diagnosis);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Analysis error:", message);
      return res.status(503).json({
        error: message,
        fallback_available: true,
      });
    }
  });

  // ─── Static files ─────────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    const orKey = process.env.OPENROUTER_API_KEY ?? "";
    const configured = orKey.startsWith("sk-or-") && orKey.length > 20;
    console.log(`\n✅ PhytoPathometric Server on http://localhost:${port}/`);
    console.log(`   AI Engine  : ${configured ? "✅ OpenRouter (gemini-2.0-flash-exp:free)" : "⚠️  No API key — local fallback"}`);
    console.log(`   Crop-aware : ✅ Crop-specific disease filtering enabled`);
    console.log(`   Quality QC : ✅ Image validation + tissue segmentation\n`);
  });
}

startServer().catch(console.error);
