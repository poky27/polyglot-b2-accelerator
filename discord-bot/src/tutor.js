import { buildSystemPrompt } from './prompt.js';
import { chat } from './llm.js';
import { getUserProgress, recordActivity, recordPracticeTime, summarizeForPrompt } from './memory.js';
import { startSession, getSession, pushTurn } from './session.js';

const WEAKPOINT_RE = /\[\[WEAKPOINT:\s*(.+?)\]\]\s*$/i;

function stripWeakpoint(text) {
  const match = text.match(WEAKPOINT_RE);
  if (!match) return { clean: text.trim(), weakPoint: null };
  return { clean: text.replace(WEAKPOINT_RE, '').trim(), weakPoint: match[1].trim() };
}

// Runs one turn of the tutor persona inside a channel's ongoing session, so
// every entry point (slash commands, typed replies, spoken turns) shares the
// same conversation memory — e.g. a /quiz question stays visible to the model
// when the user answers it later, instead of being a one-off, forgotten call.
async function tutorTurn({ userId, channelId, language, userText, mode = 'text' }) {
  let session = getSession(userId, channelId);
  if (!session || session.language !== language) {
    startSession(userId, channelId, language);
    session = getSession(userId, channelId);
  }

  pushTurn(userId, channelId, 'user', userText);
  await recordPracticeTime(userId, language);

  const progress = await getUserProgress(userId, language);
  const system = buildSystemPrompt({
    language,
    userLevel: progress.level,
    memorySummary: summarizeForPrompt(progress),
    mode,
  });

  const raw = await chat([{ role: 'system', content: system }, ...session.history]);
  const { clean, weakPoint } = stripWeakpoint(raw);
  pushTurn(userId, channelId, 'assistant', clean);

  if (weakPoint) await recordActivity(userId, language, { weakPoint });
  else await recordActivity(userId, language, {});

  return clean;
}

export { tutorTurn, stripWeakpoint };
