const BASE_URL = (process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
const API_KEY = process.env.LLM_API_KEY;
const MODEL = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';

export async function chat(messages, { temperature = 0.6, maxTokens = 700 } = {}) {
  if (!API_KEY) {
    throw new Error('LLM_API_KEY no está configurada. Revisa el archivo .env (ver .env.example).');
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`LLM request failed (${res.status} ${res.statusText}): ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('El proveedor LLM devolvió una respuesta vacía.');
  return content.trim();
}
