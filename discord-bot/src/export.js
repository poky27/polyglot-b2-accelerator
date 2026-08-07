import { formatDuration } from './memory.js';
import { LANGUAGE_CONFIG } from './prompt.js';

// Mirrors the style of obsidian-vault/Plan/Tracker.md (headers, bold labels,
// bullet lists for "errores recurrentes") so the export drops into the
// existing vault without looking out of place.
function section(key, entry) {
  const cfg = LANGUAGE_CONFIG[key];
  const weakPoints = entry.weakPoints.length ? entry.weakPoints.map((w) => `- ${w}`).join('\n') : '- (ninguno registrado todavía)';

  return `## ${cfg.flag} ${cfg.label}

- **Nivel actual**: ${entry.level} (meta: ${cfg.targetLevel})
- **Racha de práctica**: ${entry.streak} día(s)
- **Tiempo practicado hoy**: ${formatDuration(entry.todaySeconds)}
- **Tiempo total practicado**: ${formatDuration(entry.totalSeconds)}
- **Vocabulario introducido**: ${entry.vocabLearned} palabras
- **Quizzes completados**: ${entry.quizzesCompleted}

### Errores recurrentes
${weakPoints}
`;
}

export function buildObsidianExport({ english, german }) {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');

  return `# 📊 Progreso — Hermes Discord Bot

*Exportado el ${timestamp}*

${section('english', english)}
${section('german', german)}
---
*Generado automáticamente por el bot de Discord (\`/export\`). Puedes pegar estas secciones dentro de tu \`Tracker.md\` o dejarlo como nota aparte.*
`;
}
