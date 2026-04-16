import { GoogleGenAI } from '@google/genai';

const ANALYZE_PROMPT = `你是一位专业的高考辅导老师。请分析这张图片中的题目：
1. 识别科目和知识点。
2. 给出详细的、分步骤的解答。
3. 用通俗易懂的语言解释核心概念。
4. 提供一个"提分技巧"。使用 Markdown 格式输出。`;

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Server is missing GEMINI_API_KEY.' });
  }

  const body = parseBody(req);
  const imageDataUrl = typeof body.imageDataUrl === 'string' ? body.imageDataUrl : '';
  if (!imageDataUrl.includes(',')) {
    return res.status(400).json({ error: 'Missing image data.' });
  }

  const base64Data = imageDataUrl.split(',')[1];
  const mimeType = imageDataUrl.match(/:(.*?);/)?.[1] || 'image/png';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: ANALYZE_PROMPT },
        ],
      },
    });

    return res.status(200).json({ analysis: response.text || '无法解析，请重试。' });
  } catch (error) {
    console.error('Image analysis failed:', error);
    return res.status(500).json({ error: '分析失败，请稍后重试。' });
  }
}
