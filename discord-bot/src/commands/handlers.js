import { LANGUAGE_CONFIG } from '../prompt.js';
import { getUserProgress, setLevel, recordActivity } from '../memory.js';
import { startSession, endSession } from '../session.js';
import { tutorTurn } from '../tutor.js';
import { synthesizeSpeech } from '../tts.js';
import { transcribeAudio } from '../stt.js';
import { joinAndListen, leave as leaveVoice, playAudioBuffer } from '../voice/manager.js';

export const handlers = {
  async practice(interaction) {
    const language = interaction.options.getString('idioma');
    const cfg = LANGUAGE_CONFIG[language];
    startSession(interaction.user.id, interaction.channelId, language);
    await interaction.deferReply();
    try {
      const intro = await tutorTurn({
        userId: interaction.user.id,
        channelId: interaction.channelId,
        language,
        userText: `Empieza una sesión de práctica de ${cfg.label}. Saluda brevemente, recuerda mi nivel actual y lánzame una primera micro-tarea o pregunta para que produzca lenguaje ya mismo.`,
      });
      await interaction.editReply(
        `**Sesión de ${cfg.flag} ${cfg.label} iniciada.** Escribe en este canal y te responderé como tutor. Usa \`/stop\` para terminar.\n\n${intro}`
      );
    } catch (err) {
      endSession(interaction.user.id, interaction.channelId);
      await interaction.editReply(`⚠️ No pude iniciar la sesión: ${err.message}`);
    }
  },

  async stop(interaction) {
    const had = endSession(interaction.user.id, interaction.channelId);
    await interaction.reply({ content: had ? '✅ Sesión terminada.' : 'No tenías ninguna sesión activa en este canal.', ephemeral: true });
  },

  async vocab(interaction) {
    const language = interaction.options.getString('idioma');
    const cfg = LANGUAGE_CONFIG[language];
    await interaction.deferReply();
    try {
      const text = await tutorTurn({
        userId: interaction.user.id,
        channelId: interaction.channelId,
        language,
        userText: `Dame exactamente 5 palabras o "chunks" NUEVOS de vocabulario de ${cfg.label} apropiados para mi nivel actual, cada uno con: la palabra, una frase de ejemplo corta, y su traducción/explicación en español. Formato de lista numerada.`,
      });
      await recordActivity(interaction.user.id, language, { vocabDelta: 5 });
      await interaction.editReply(
        `**Vocabulario nuevo — ${cfg.flag} ${cfg.label}**\n\n${text}\n\n_Puedes seguir escribiendo en este canal y seguimos la conversación._`
      );
    } catch (err) {
      await interaction.editReply(`⚠️ ${err.message}`);
    }
  },

  async quiz(interaction) {
    const language = interaction.options.getString('idioma');
    const cfg = LANGUAGE_CONFIG[language];
    await interaction.deferReply();
    try {
      const text = await tutorTurn({
        userId: interaction.user.id,
        channelId: interaction.channelId,
        language,
        userText: `Genera un mini-quiz de 5 preguntas de ${cfg.label} a mi nivel actual (mezcla gramática y vocabulario). Numera las preguntas. NO des las respuestas todavía — las corregirás cuando yo responda en el chat.`,
      });
      await recordActivity(interaction.user.id, language, { quizDelta: 1 });
      await interaction.editReply(
        `**Quiz — ${cfg.flag} ${cfg.label}**\n\n${text}\n\n_Responde aquí mismo, corto y numerado (ej: "1. ... 2. ..."). No hace falta que copies la pregunta, ya la tengo en memoria._`
      );
    } catch (err) {
      await interaction.editReply(`⚠️ ${err.message}`);
    }
  },

  async correct(interaction) {
    const language = interaction.options.getString('idioma');
    const text = interaction.options.getString('texto');
    const cfg = LANGUAGE_CONFIG[language];
    await interaction.deferReply();
    try {
      const reply = await tutorTurn({
        userId: interaction.user.id,
        channelId: interaction.channelId,
        language,
        userText: `Corrige esta frase en ${cfg.label} siguiendo el formato de corrección de tus reglas: "${text}"`,
      });
      await interaction.editReply(`**Corrección — ${cfg.flag} ${cfg.label}**\n\n${reply}`);
    } catch (err) {
      await interaction.editReply(`⚠️ ${err.message}`);
    }
  },

  async roleplay(interaction) {
    const language = interaction.options.getString('idioma');
    const scenario = interaction.options.getString('escenario') || 'una situación cotidiana apropiada para mi nivel';
    const cfg = LANGUAGE_CONFIG[language];
    startSession(interaction.user.id, interaction.channelId, language);
    await interaction.deferReply();
    try {
      const intro = await tutorTurn({
        userId: interaction.user.id,
        channelId: interaction.channelId,
        language,
        userText: `Vamos a hacer un roleplay en ${cfg.label} sobre: "${scenario}". Ponte en el personaje correspondiente (ej. camarero, entrevistador) y empieza la escena con una línea de diálogo. Espera mi respuesta antes de continuar.`,
      });
      await interaction.editReply(
        `**Roleplay iniciado — ${cfg.flag} ${cfg.label}** (escenario: ${scenario})\nResponde en este canal para continuar la escena. Usa \`/stop\` para terminar.\n\n${intro}`
      );
    } catch (err) {
      endSession(interaction.user.id, interaction.channelId);
      await interaction.editReply(`⚠️ No pude iniciar el roleplay: ${err.message}`);
    }
  },

  async progress(interaction) {
    const en = await getUserProgress(interaction.user.id, 'english');
    const de = await getUserProgress(interaction.user.id, 'german');
    const fmt = (label, flag, p) =>
      `${flag} **${label}** — Nivel: ${p.level} · Racha: ${p.streak}d · Vocab: ${p.vocabLearned} · Quizzes: ${p.quizzesCompleted}` +
      (p.weakPoints.length ? `\n   Puntos débiles: ${p.weakPoints.slice(0, 3).join(', ')}` : '');
    await interaction.reply({
      content: `**Tu progreso**\n\n${fmt('English', '🇬🇧', en)}\n${fmt('Deutsch', '🇩🇪', de)}`,
      ephemeral: true,
    });
  },

  async setlevel(interaction) {
    const language = interaction.options.getString('idioma');
    const level = interaction.options.getString('nivel');
    await setLevel(interaction.user.id, language, level);
    await interaction.reply({ content: `✅ Nivel de ${LANGUAGE_CONFIG[language].label} ajustado a **${level}**.`, ephemeral: true });
  },

  async say(interaction) {
    const language = interaction.options.getString('idioma');
    const texto = interaction.options.getString('texto');
    const cfg = LANGUAGE_CONFIG[language];
    await interaction.deferReply();
    try {
      const mp3 = await synthesizeSpeech(texto, language);
      await interaction.editReply({
        content: `🔊 **${cfg.flag} ${cfg.label}:** "${texto}"`,
        files: [{ attachment: mp3, name: 'pronunciacion.mp3' }],
      });
      if (interaction.guild) await playAudioBuffer(interaction.guild.id, mp3).catch(() => {});
    } catch (err) {
      await interaction.editReply(`⚠️ ${err.message}`);
    }
  },

  async voice(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'join') return handleVoiceJoin(interaction);
    if (sub === 'leave') return handleVoiceLeave(interaction);
  },
};

async function handleVoiceJoin(interaction) {
  const language = interaction.options.getString('idioma');
  const cfg = LANGUAGE_CONFIG[language];
  const voiceChannel = interaction.member?.voice?.channel;

  if (!voiceChannel) {
    await interaction.reply({ content: '⚠️ Tienes que estar conectado a un canal de voz primero.', ephemeral: true });
    return;
  }

  await interaction.deferReply();
  try {
    startSession(interaction.user.id, interaction.channelId, language);
    await joinAndListen({
      guild: interaction.guild,
      voiceChannel,
      userId: interaction.user.id,
      onSpeechCaptured: (wavBuffer) => handleSpokenTurn({ interaction, wavBuffer, language }),
      onError: (err) => interaction.channel.send(`⚠️ Error en la sesión de voz: ${err.message}`).catch(() => {}),
    });
    await interaction.editReply(
      `🎙️ Conectado a **${voiceChannel.name}**, escuchándote en ${cfg.flag} ${cfg.label}. Habla cuando quieras — te responderé aquí en texto y en audio. Usa \`/voice leave\` para terminar.`
    );
  } catch (err) {
    endSession(interaction.user.id, interaction.channelId);
    await interaction.editReply(`⚠️ ${err.message}`);
  }
}

async function handleVoiceLeave(interaction) {
  const ok = interaction.guild ? leaveVoice(interaction.guild.id) : false;
  await interaction.reply({
    content: ok ? '👋 Salí del canal de voz.' : 'No estoy conectado a ningún canal de voz en este servidor.',
    ephemeral: true,
  });
}

async function handleSpokenTurn({ interaction, wavBuffer, language }) {
  const channel = interaction.channel;
  const userId = interaction.user.id;
  try {
    const transcript = await transcribeAudio(wavBuffer, language);
    if (!transcript || transcript.trim().length < 2) return;

    await channel.send(`🎙️ **Dijiste:** "${transcript}"`);
    const clean = await tutorTurn({
      userId,
      channelId: channel.id,
      language,
      userText: `[Mensaje hablado, transcrito automáticamente] ${transcript}`,
      mode: 'voice',
    });

    const mp3 = await synthesizeSpeech(clean, language).catch((err) => {
      console.error('TTS error en turno hablado:', err);
      return null;
    });

    const payload = { content: clean.slice(0, 1900) };
    if (mp3) payload.files = [{ attachment: mp3, name: 'respuesta.mp3' }];
    await channel.send(payload);

    if (mp3 && interaction.guild) await playAudioBuffer(interaction.guild.id, mp3).catch(() => {});
  } catch (err) {
    await channel.send(`⚠️ ${err.message}`).catch(() => {});
  }
}
