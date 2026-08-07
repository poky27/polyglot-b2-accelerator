// In-memory conversation sessions, keyed by `${userId}:${channelId}`.
// Sessions are intentionally ephemeral (lost on restart) — long-term progress
// lives in memory.js (data/progress.json). This mirrors Hermes Agent's split
// between short-term working context and curated long-term memory.

const sessions = new Map();
const MAX_HISTORY_MESSAGES = 16;

const key = (userId, channelId) => `${userId}:${channelId}`;

export function startSession(userId, channelId, language) {
  sessions.set(key(userId, channelId), { language, history: [] });
}

export function getSession(userId, channelId) {
  return sessions.get(key(userId, channelId));
}

export function endSession(userId, channelId) {
  return sessions.delete(key(userId, channelId));
}

export function pushTurn(userId, channelId, role, content) {
  const s = getSession(userId, channelId);
  if (!s) return;
  s.history.push({ role, content });
  if (s.history.length > MAX_HISTORY_MESSAGES) {
    s.history = s.history.slice(-MAX_HISTORY_MESSAGES);
  }
}
