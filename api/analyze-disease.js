// Vercel Serverless Function — /api/analyze-disease
// Wraps the Express route logic for Vercel deployment

const CROP_DISEASE_MAP = {
  wheat:    ["Stripe Rust","Leaf Rust","Stem Rust","Septoria Leaf Blotch","Powdery Mildew","Wheat Blast","Helminthosporium Blight","Yellow Rust","Fusarium Head Blight","Tan Spot"],
  rice:     ["Rice Blast","Bacterial Leaf Blight","Brown Spot","Sheath Blight","Narrow Brown Leaf Spot","False Smut","Tungro Virus","Leaf Scald"],
  cotton:   ["Cotton Leaf Curl Virus","Bacterial Blight","Alternaria Leaf Spot","Fusarium Wilt","Anthracnose","Angular Leaf Spot"],
  maize:    ["Northern Corn Leaf Blight","Gray Leaf Spot","Southern Corn Leaf Blight","Common Rust","Tar Spot","Ear Rot","Downy Mildew"],
  soybean:  ["Asian Soybean Rust","Frogeye Leaf Spot","Bacterial Pustule","Sudden Death Syndrome","Anthracnose","Phytophthora Root Rot"],
  tomato:   ["Early Blight","Late Blight","Bacterial Spot","Target Spot","Tomato Mosaic Virus","Septoria Leaf Spot","Fusarium Wilt"],
  potato:   ["Late Blight","Early Blight","Black Scurf","Common Scab","Potato Virus Y","Rhizoctonia"],
  sugarcane:["Sugarcane Rust","Red Rot","Smut","Leaf Scald","Ratoon Stunting Disease","Mosaic Virus"],
  coffee:   ["Coffee Leaf Rust","Coffee Berry Disease","Brown Eye Spot","Cercospora Leaf Spot"],
  bean:     ["Bean Rust","Angular Leaf Spot","Anthracnose","Common Bacterial Blight","Bean Mosaic Virus"],
};

function getCropKey(cropType) {
  const lower = cropType.toLowerCase();
  if (lower.includes("wheat") || lower.includes("trigo")) return "wheat";
  if (lower.includes("rice") || lower.includes("arroz")) return "rice";
  if (lower.includes("cotton") || lower.includes("algodão")) return "cotton";
  if (lower.includes("maize") || lower.includes("milho") || lower.includes("corn")) return "maize";
  if (lower.includes("soja") || lower.includes("soy")) return "soybean";
  if (lower.includes("tomate") || lower.includes("tomato")) return "tomato";
  if (lower.includes("batata") || lower.includes("potato")) return "potato";
  if (lower.includes("cana") || lower.includes("sugarcane")) return "sugarcane";
  if (lower.includes("café") || lower.includes("coffee")) return "coffee";
  if (lower.includes("feijão") || lower.includes("bean")) return "bean";
  return "unknown";
}

function buildPrompt(cropType) {
  const cropKey = getCropKey(cropType);
  const knownDiseases = CROP_DISEASE_MAP[cropKey] ?? [];
  const diseaseContext = knownDiseases.length > 0
    ? `Diseases known to affect ${cropType}: ${knownDiseases.join(", ")}.`
    : "Analyze all possible crop diseases.";

  return `You are a senior plant pathologist. Analyze this ${cropType} crop leaf image.
${diseaseContext}

Respond ONLY with valid JSON:
{
  "image_valid": true,
  "image_quality_issue": null,
  "detected_crop": "${cropType}",
  "crop_confidence_percent": 85,
  "severity_percent": 0,
  "severity_label": "Saudável",
  "healthy_area_px_percent": 95,
  "lesion_area_px_percent": 5,
  "tissue_breakdown": { "healthy_percent": 95, "chlorotic_percent": 2, "necrotic_percent": 2, "damaged_percent": 1 },
  "diagnoses": [{ "is_primary": true, "disease_name": "Healthy Plant", "scientific_name": "", "disease_type": "healthy", "lesion_type": "Healthy", "confidence_percent": 90, "supporting_symptoms": ["No lesions detected"], "affected_leaf_area_percent": 0, "treatment": { "organic": [], "chemical": [], "preventive": ["Regular monitoring"] } }],
  "recommendations": { "immediate": [], "preventive": ["Monitor regularly"], "monitoring": ["Check in 7 days"] },
  "analysis_summary": "Leaf appears healthy with no significant disease symptoms detected.",
  "environmental_risk_factors": []
}

Analyze the actual image and provide accurate results based on visual evidence.`;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const apiKey = process.env.OPENROUTER_API_KEY ?? '';
    const configured = apiKey.startsWith('sk-or-') && apiKey.length > 20;
    return res.json({ status: 'ok', ai_configured: configured });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType, cultura, ping } = req.body;

    // Ping / health check
    if (ping || !imageBase64 || imageBase64.length < 100) {
      const apiKey = process.env.OPENROUTER_API_KEY ?? '';
      const configured = apiKey.startsWith('sk-or-') && apiKey.length > 20;
      return res.json({
        status: 'ok',
        gemini: configured,
        ai_engine: configured ? 'OpenRouter' : 'local',
        message: configured ? 'OpenRouter AI ready' : 'Local engine active',
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || !apiKey.startsWith('sk-or-')) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY not configured', fallback_available: true });
    }

    const cropType = cultura || 'Unknown crop';
    const models = [
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-flash-1.5-8b',
      'meta-llama/llama-3.2-11b-vision-instruct:free',
    ];

    let lastError = null;
    for (const model of models) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://phytopathometric.vercel.app',
            'X-Title': 'PhytoPathometric',
          },
          body: JSON.stringify({
            model,
            max_tokens: 2048,
            temperature: 0.1,
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: buildPrompt(cropType) },
                { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } },
              ],
            }],
          }),
        });

        if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const text = data.choices?.[0]?.message?.content?.trim() ?? '';
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.severity_percent !== 'number') throw new Error('Invalid response');

        // Normalize
        if (!parsed.tissue_breakdown) {
          parsed.tissue_breakdown = { healthy_percent: 70, chlorotic_percent: 0, necrotic_percent: parsed.lesion_area_px_percent ?? 0, damaged_percent: 0 };
        }
        if (!parsed.detected_crop) { parsed.detected_crop = cropType; parsed.crop_confidence_percent = 70; }
        if (typeof parsed.image_valid !== 'boolean') parsed.image_valid = true;
        if (!parsed.analysis_summary) parsed.analysis_summary = `Analysis complete. Severity: ${parsed.severity_percent}%.`;
        if (!parsed.environmental_risk_factors) parsed.environmental_risk_factors = [];

        for (const d of parsed.diagnoses ?? []) {
          if (Array.isArray(d.treatment)) {
            const arr = d.treatment;
            d.treatment = { organic: [], chemical: arr.slice(0, 2), preventive: arr.slice(2) };
          }
          if (!d.supporting_symptoms) d.supporting_symptoms = [];
          if (!d.scientific_name) d.scientific_name = '';
          if (!d.disease_type) d.disease_type = 'fungal';
        }

        return res.json(parsed);
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed:`, err.message);
      }
    }

    throw lastError ?? new Error('All models failed');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(503).json({ error: message, fallback_available: true });
  }
}
