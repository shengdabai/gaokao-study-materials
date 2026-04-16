export default async function handler(_req, res) {
  res.status(200).json({
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    notesConfigured: Boolean(process.env.WEBHOOK_URL || process.env.GEMINI_API_KEY),
  });
}
