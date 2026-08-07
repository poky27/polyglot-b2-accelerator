import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Free, keyless TTS via the Microsoft Edge "Read Aloud" service. Voices per
// CEFR-target language — natural/native accents matter for pronunciation practice.
const VOICE_BY_LANGUAGE = {
  english: process.env.TTS_VOICE_ENGLISH || 'en-US-AriaNeural',
  german: process.env.TTS_VOICE_GERMAN || 'de-DE-KatjaNeural',
};

export async function synthesizeSpeech(text, language) {
  const voice = VOICE_BY_LANGUAGE[language];
  if (!voice) throw new Error(`No hay voz TTS configurada para: ${language}`);

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text);

  const chunks = [];
  return new Promise((resolve, reject) => {
    audioStream.on('data', (chunk) => chunks.push(chunk));
    audioStream.on('close', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', reject);
  });
}
