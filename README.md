# 🌍 Polyglot B2 Accelerator

> **Aprende 4 idiomas hasta nivel B2 en 20 días intensivos**
> 🇫🇷 Français · 🇧🇷 Português · 🇩🇪 Deutsch · 🇬🇧 English

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Compatible](https://img.shields.io/badge/Claude-Compatible-blueviolet.svg)](https://claude.ai)
[![Obsidian](https://img.shields.io/badge/Obsidian-Ready-7C3AED.svg)](https://obsidian.md)

---

## 🎯 ¿Qué es esto?

Un sistema completo de aprendizaje de idiomas que combina:

- **Prompt metacognitivo** para usar con Claude AI como tutor personalizado
- **App interactiva React** con dashboard, juegos, quizzes y noticias
- **Vault de Obsidian** pre-estructurado para organizar tu progreso
- **Exportación a Anki** para repetición espaciada

## 📂 Estructura del proyecto

```
polyglot-b2/
├── README.md                          # Este archivo
├── LICENSE                            # MIT License
├── package.json                       # Dependencias React
├── src/
│   └── polyglot-b2-app.jsx           # App principal React
├── public/
│   └── index.html                     # Entry point HTML
├── docs/
│   ├── POLYGLOT-TUTOR-PROMPT.md      # Prompt completo del tutor
│   ├── SETUP-GUIDE.md                # Guía de instalación
│   └── LANGUAGE-AUTHORITIES.md       # Entes normativos por idioma
└── obsidian-vault/                    # Vault listo para Obsidian
    ├── Plan/
    │   ├── Plan-20-Dias.md
    │   └── Tracker.md
    ├── Français/
    │   ├── Grammaire/
    │   ├── Vocabulaire/
    │   └── Expressions/
    ├── Português/
    │   ├── Gramática/
    │   ├── Vocabulário/
    │   └── Expressões/
    ├── Deutsch/
    │   ├── Grammatik/
    │   ├── Wortschatz/
    │   └── Redewendungen/
    ├── English/
    │   ├── Grammar/
    │   ├── Vocabulary/
    │   └── Idioms/
    ├── Transversal/
    │   ├── Falsos-Amigos.md
    │   ├── Cognados.md
    │   └── Patrones-Familias.md
    ├── Anki-Export/
    │   └── README.md
    └── Exámenes/
        ├── DELF-B2/
        ├── CELPE-Bras/
        ├── Goethe-B2/
        └── TOEFL/
```

## 🚀 Inicio rápido

### Opción 1: Usar con Claude AI (recomendado)

1. Copia el contenido de `docs/POLYGLOT-TUTOR-PROMPT.md`
2. Pégalo como **System Prompt** en un proyecto de [claude.ai](https://claude.ai)
3. Inicia una conversación y el tutor se activará automáticamente

### Opción 2: App React interactiva

```bash
git clone https://github.com/tu-usuario/polyglot-b2.git
cd polyglot-b2
npm install
npm start
```

### Opción 3: Obsidian Vault

1. Copia la carpeta `obsidian-vault/` a tu directorio de vaults
2. Abre Obsidian → "Open folder as vault"
3. Usa junto con Claude Code para sesiones interactivas

### Opción 4: Claude Code

```bash
claude --project docs/POLYGLOT-TUTOR-PROMPT.md
```

## 🏗️ Metodología

### Agrupación por familias lingüísticas

| Familia | Idiomas | Estrategia |
|---------|---------|------------|
| 🏛️ Romance | 🇫🇷 FR + 🇧🇷 PT | Español como puente, intercomprensión, cognados latinos |
| 🌲 Germánica | 🇩🇪 DE + 🇬🇧 EN | Inglés como puente hacia alemán, cognados germánicos |

### Plan de 20 días

| Fase | Días | Foco |
|------|------|------|
| 1 — Cimientos | 1-5 | Fonología, tiempos verbales básicos, supervivencia |
| 2 — Expansión | 6-10 | Subjuntivo, conectores, vocabulario temático |
| 3 — Producción | 11-15 | Escritura formal, idioms, debate oral |
| 4 — Pulido | 16-20 | Comprensión avanzada, simulacros, examen final |

### Exámenes internacionales soportados

| Idioma | Examen | Nivel |
|--------|--------|-------|
| 🇫🇷 Francés | DELF B2, TCF, TEF | B2 |
| 🇧🇷 Portugués | CELPE-Bras, CAPLE/DEPLE | B2 |
| 🇩🇪 Alemán | Goethe-Zertifikat B2, TestDaF, ÖSD | B2 |
| 🇬🇧 Inglés | TOEFL iBT, IELTS, Cambridge FCE | B2 |

### Autoridades lingüísticas de referencia

- 🇫🇷 **Académie française** + Le Bon Usage (Grevisse)
- 🇧🇷 **Academia Brasileira de Letras** + VOLP
- 🇩🇪 **Rat für deutsche Rechtschreibung** + Duden
- 🇬🇧 **Oxford English Dictionary** + Cambridge Dictionary

## 🎮 Features de la app

- **Dashboard** con progreso por idioma y habilidad
- **Plan de 20 días** visual con fases y checkpoints
- **Quick Quiz** con falsos amigos y vocabulario B2
- **6 juegos interactivos**: Polyglot Chain, Error Detective, Speed Translation, Role-play Roulette, Story Builder, Flashcard Battle
- **Noticias matutinas** en 4 idiomas
- **Simulacros de examen** por idioma (DELF, CELPE, Goethe, TOEFL)
- **Exportación a Anki** automática
- **Integración con Claude** via `sendPrompt()` para sesiones en vivo

## 🧠 Modelos mentales incluidos

- Transfer positivo/negativo entre idiomas
- Chunks y collocations (no palabras sueltas)
- Input comprensible (Krashen i+1)
- Output hypothesis (producción forzada)
- Spacing effect (repetición espaciada)
- Detección de sesgos del aprendiz

## 📄 Licencia

MIT — usa, modifica y comparte libremente.

## 🤝 Contribuir

PRs bienvenidos. Si agregas un nuevo idioma, asegúrate de incluir:
1. Autoridad lingüística de referencia
2. Examen internacional correspondiente
3. Falsos amigos vs español
4. Errores fonéticos típicos de hispanohablantes
