import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
  EndBehaviorType,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from '@discordjs/voice';
import prism from 'prism-media';
import { Readable } from 'node:stream';
import { pcmToWav } from './wav.js';

// One active listening session per guild. Deliberately simple (Map, no
// persistence) — voice sessions are inherently ephemeral/live, unlike the
// long-term progress in memory.js.
const activeSessions = new Map();

const MIN_CAPTURE_BYTES = 48000 * 2 * 2 * 0.3; // ~0.3s of 48kHz/16-bit/stereo PCM

export function isActive(guildId) {
  return activeSessions.has(guildId);
}

export async function joinAndListen({ guild, voiceChannel, userId, onSpeechCaptured, onError }) {
  if (activeSessions.has(guild.id)) {
    throw new Error('Ya hay una sesión de voz activa en este servidor. Usa /voice leave primero.');
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
  } catch (err) {
    connection.destroy();
    throw new Error('No pude conectarme al canal de voz a tiempo. Intenta de nuevo.');
  }

  const player = createAudioPlayer();
  connection.subscribe(player);

  const state = { connection, player, userId, recording: false };
  activeSessions.set(guild.id, state);

  connection.receiver.speaking.on('start', (speakingUserId) => {
    if (speakingUserId !== userId || state.recording) return;
    state.recording = true;

    const opusStream = connection.receiver.subscribe(speakingUserId, {
      end: { behavior: EndBehaviorType.AfterSilence, duration: 1000 },
    });
    const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
    const pcmChunks = [];

    opusStream.pipe(decoder);
    decoder.on('data', (chunk) => pcmChunks.push(chunk));
    decoder.on('end', async () => {
      state.recording = false;
      const pcm = Buffer.concat(pcmChunks);
      if (pcm.length < MIN_CAPTURE_BYTES) return; // background noise / mic bump
      try {
        const wav = pcmToWav(pcm, { sampleRate: 48000, channels: 2, bitDepth: 16 });
        await onSpeechCaptured(wav);
      } catch (err) {
        onError?.(err);
      }
    });
    decoder.on('error', (err) => {
      state.recording = false;
      onError?.(err);
    });
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    activeSessions.delete(guild.id);
  });

  return state;
}

export function leave(guildId) {
  const state = activeSessions.get(guildId);
  if (!state) return false;
  state.connection.destroy();
  activeSessions.delete(guildId);
  return true;
}

export async function playAudioBuffer(guildId, mp3Buffer) {
  const state = activeSessions.get(guildId);
  if (!state) return false;
  const resource = createAudioResource(Readable.from(mp3Buffer), { inputType: StreamType.Arbitrary });
  state.player.play(resource);
  return true;
}
