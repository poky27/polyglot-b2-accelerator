import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'progress.json');

let cache = null;

function defaultUser() {
  return {
    english: { level: 'A2', vocabLearned: 0, quizzesCompleted: 0, streak: 0, lastActive: null, weakPoints: [] },
    german: { level: 'A2', vocabLearned: 0, quizzesCompleted: 0, streak: 0, lastActive: null, weakPoints: [] },
  };
}

async function load() {
  if (cache) return cache;
  try {
    const raw = await readFile(DATA_FILE, 'utf-8');
    cache = JSON.parse(raw);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    cache = {};
  }
  return cache;
}

async function persist() {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

export async function getUserProgress(userId, language) {
  const db = await load();
  if (!db[userId]) db[userId] = defaultUser();
  if (!db[userId][language]) db[userId][language] = defaultUser()[language];
  return db[userId][language];
}

export async function setLevel(userId, language, level) {
  const db = await load();
  if (!db[userId]) db[userId] = defaultUser();
  db[userId][language].level = level;
  await persist();
}

export async function recordActivity(userId, language, { vocabDelta = 0, quizDelta = 0, weakPoint = null } = {}) {
  const db = await load();
  if (!db[userId]) db[userId] = defaultUser();
  const entry = db[userId][language];

  const today = new Date().toISOString().slice(0, 10);
  if (entry.lastActive !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    entry.streak = entry.lastActive === yesterday ? entry.streak + 1 : 1;
    entry.lastActive = today;
  }

  entry.vocabLearned += vocabDelta;
  entry.quizzesCompleted += quizDelta;

  if (weakPoint) {
    entry.weakPoints = entry.weakPoints.filter((w) => w !== weakPoint);
    entry.weakPoints.unshift(weakPoint);
    entry.weakPoints = entry.weakPoints.slice(0, 8);
  }

  await persist();
  return entry;
}

export function summarizeForPrompt(entry) {
  if (!entry) return '';
  const parts = [
    `Nivel actual: ${entry.level}`,
    `Racha de práctica: ${entry.streak} día(s)`,
    `Vocabulario introducido: ${entry.vocabLearned} palabras`,
    `Quizzes completados: ${entry.quizzesCompleted}`,
  ];
  if (entry.weakPoints.length) {
    parts.push(`Puntos débiles recientes (insistir en estos): ${entry.weakPoints.join(', ')}`);
  }
  return parts.join('\n');
}
