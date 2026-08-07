import { LANGUAGE_CONFIG, buildSystemPrompt } from '../prompt.js';
import { chat } from '../llm.js';
import { getUserProgress, setLevel, recordActivity, summarizeForPrompt } from '../memory.js';
import { startSession, endSession, getSession } from '../session.js';

const WEAKPOINT_RE = /\[\[WEAKPOINT:\s*(.+?)\]\]\s*$/i;

function stripWeakpoint(text) {
  const match = text.match(WEAKPOINT_RE);
  if (!match) return { clean: text.trim(), weakPoint: null };
  return { clean: text.replace(WEAKPOINT_RE, '').trim(), weakPoint: match[1].trim() };
}

async function replyFromTutor(interaction, language, userMessage) {
  const progress = await getUserProgress(interaction.user.id, language);
  const system = buildSystemPrompt({
    language,
    userLevel: progress.level,
    memorySummary: summarizeForPrompt(progress),
  });
  const raw = await chat([
    { role: 'system', content: system },
    { role: 'user', content: userMessage },
  ]);
  const { clean, weakPoint } = stripWeakpoint(raw);
  if (weakPoint) await recordActivity(interaction.user.id, language, { weakPoint });
  return clean;
}

export const handlers = {
  async practice(interaction) {
    const language = interaction.options.getString('idioma');
    const cfg = LANGUAGE_CONFIG[language];
    startSession(interaction.user.id, interaction.channelId, language);
    await interaction.deferReply();
    try {
      const intro = await replyFromTutor(
        interaction,
        language,
        `Empieza una sesión de práctica de ${cfg.label}. Saluda brevemente, recuerda mi nivel actual y lánzame una primera micro-tarea o pregunta para que produzca lenguaje ya mismo.`
      );
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
      const text = await replyFromTutor(
        interaction,
        language,
        `Dame exactamente 5 palabras o "chunks" NUEVOS de vocabulario de ${cfg.label} apropiados para mi nivel actual, cada uno con: la palabra, una frase de ejemplo corta, y su traducción/explicación en español. Formato de lista numerada.`
      );
      await recordActivity(interaction.user.id, language, { vocabDelta: 5 });
      await interaction.editReply(`**Vocabulario nuevo — ${cfg.flag} ${cfg.label}**\n\n${text}`);
    } catch (err) {
      await interaction.editReply(`⚠️ ${err.message}`);
    }
  },

  async quiz(interaction) {
    const language = interaction.options.getString('idioma');
    const cfg = LANGUAGE_CONFIG[language];
    await interaction.deferReply();
    try {
      const text = await replyFromTutor(
        interaction,
        language,
        `Genera un mini-quiz de 5 preguntas de ${cfg.label} a mi nivel actual (mezcla gramática y vocabulario). Numera las preguntas. NO des las respuestas todavía — las corregirás cuando yo responda en el chat.`
      );
      await recordActivity(interaction.user.id, language, { quizDelta: 1 });
      await interaction.editReply(
        `**Quiz — ${cfg.flag} ${cfg.label}**\n\n${text}\n\n_Responde aquí mismo en el canal (usa \`/practice\` primero si no tienes sesión activa) y te corrijo._`
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
      const reply = await replyFromTutor(
        interaction,
        language,
        `Corrige esta frase en ${cfg.label} siguiendo el formato de corrección de tus reglas: "${text}"`
      );
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
      const intro = await replyFromTutor(
        interaction,
        language,
        `Vamos a hacer un roleplay en ${cfg.label} sobre: "${scenario}". Ponte en el personaje correspondiente (ej. camarero, entrevistador) y empieza la escena con una línea de diálogo. Espera mi respuesta antes de continuar.`
      );
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
};

export { replyFromTutor, stripWeakpoint };
