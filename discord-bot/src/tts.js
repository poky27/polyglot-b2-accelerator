import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Free, keyless TTS via the Microsoft Edge "Read Aloud" service. Voices per
// CEFR-target language — natural/native accents matter for pronunciation practice.
const VOICE_BY_LANGUAGE = {
  english: process.env.TTS_VOICE_ENGLISH || 'en-US-AriaNeural',
  german: process.env.TTS_VOICE_GERMAN || 'de-DE-KatjaNeural',
};

const CONNECT_TIMEOUT_MS = 10_000;

export async function synthesizeSpeech(text, language) {
  const voice = VOICE_BY_LANGUAGE[language];
  if (!voice) throw new Error(`No hay voz TTS configurada para: ${language}`);

  const tts = new MsEdgeTTS();

  // speech.platform.bing.com (wss) can hang indefinitely instead of erroring
  // when blocked by a firewall/antivirus/VPN — without a timeout that leaves
  // the Discord interaction stuck on "thinking" until it times out on its own.
  await withTimeout(
    tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3),
    CONNECT_TIMEOUT_MS,
    () => tts.close(),
    'No pude conectar con el servicio de voz de Microsoft (speech.platform.bing.com) en 10s. Puede ser un firewall/antivirus bloqueando la conexión WebSocket saliente.'
  );

  const { audioStream } = tts.toStream(text);
  const chunks = [];

  const result = await withTimeout(
    new Promise((resolve, reject) => {
      audioStream.on('data', (chunk) => chunks.push(chunk));
      audioStream.on('close', () => resolve(Buffer.concat(chunks)));
      audioStream.on('error', reject);
    }),
    CONNECT_TIMEOUT_MS,
    () => tts.close(),
    'La generación de audio no terminó a tiempo.'
  );

  tts.close();
  return result;
}

function withTimeout(promise, ms, onTimeout, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout?.();
      reject(new Error(message));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
