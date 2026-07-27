// Vercel Serverless Function — /api/health
export default function handler(req, res) {
  const apiKey = process.env.OPENROUTER_API_KEY ?? '';
  const configured = apiKey.startsWith('sk-or-') && apiKey.length > 20;
  res.json({ status: 'ok', ai_configured: configured });
}
