import { GoogleGenAI } from '@google/genai';

const DEFAULT_TOPIC_IDS = ['K0BlyZmn', 'BJ888R8J'];

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function normalizeWebhookResult(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed || trimmed.toLowerCase() === 'accepted' || trimmed.toLowerCase().includes('error')) {
    return null;
  }

  let jsonResult;
  try {
    jsonResult = JSON.parse(trimmed);
  } catch {
    jsonResult = { answer: trimmed };
  }

  const finalAnswer = jsonResult.answer || jsonResult.output || jsonResult.message || '';
  if (!String(finalAnswer).trim() || String(finalAnswer).trim().toLowerCase() === 'accepted') {
    return null;
  }

  return jsonResult;
}

async function generateAiFallback(question) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Server is missing GEMINI_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `总结关于"${question}"的高考知识点笔记。包含【核心概念】、【重点公式/结论】、【经典例题】。使用 Markdown。`,
  });

  return {
    source: 'AI',
    result: { answer: response.text || '搜索失败，请重试。' },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = parseBody(req);
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) {
    return res.status(400).json({ error: 'Missing question.' });
  }

  if (process.env.WEBHOOK_URL) {
    try {
      const webhookResponse = await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          ...(process.env.WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.WEBHOOK_TOKEN}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, topic_ids: DEFAULT_TOPIC_IDS, deep_seek: true }),
      });

      if (webhookResponse.ok) {
        const normalized = normalizeWebhookResult(await webhookResponse.text());
        if (normalized) {
          return res.status(200).json({ source: '知识库', result: normalized });
        }
      }
    } catch (error) {
      console.error('Webhook search failed:', error);
    }
  }

  try {
    const fallback = await generateAiFallback(question);
    return res.status(200).json(fallback);
  } catch (error) {
    console.error('AI fallback failed:', error);
    return res.status(500).json({ error: '搜索失败，请检查服务端配置。' });
  }
}
