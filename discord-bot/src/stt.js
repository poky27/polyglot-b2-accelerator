// Speech-to-text via Groq's free Whisper endpoint. Kept independent from
// LLM_BASE_URL/LLM_API_KEY because the chat provider (OpenRouter, Gemini, ...)
// may not offer an OpenAI-compatible /audio/transcriptions endpoint, while
// Groq's free tier does. If you're already using Groq for chat, STT_API_KEY
// can just reuse LLM_API_KEY.
const STT_BASE_URL = (process.env.STT_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
const STT_API_KEY = process.env.STT_API_KEY || process.env.LLM_API_KEY;
const STT_MODEL = process.env.STT_MODEL || 'whisper-large-v3-turbo';

const WHISPER_LANGUAGE_CODE = { english: 'en', german: 'de' };

export async function transcribeAudio(wavBuffer, language) {
  if (!STT_API_KEY) {
    throw new Error('Falta STT_API_KEY (o LLM_API_KEY) para transcribir audio. Revisa .env.');
  }

  const form = new FormData();
  form.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'speech.wav');
  form.append('model', STT_MODEL);
  const langCode = WHISPER_LANGUAGE_CODE[language];
  if (langCode) form.append('language', langCode);

  const res = await fetch(`${STT_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${STT_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Transcripción falló (${res.status} ${res.statusText}): ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  return (data?.text || '').trim();
}
