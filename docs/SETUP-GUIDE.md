# 🛠️ Guía de instalación — Polyglot B2 Accelerator

## Opción 1: Claude AI (más rápido)

### Como proyecto en claude.ai
1. Ve a [claude.ai](https://claude.ai) → Projects → Create Project
2. En "Custom Instructions", pega el contenido completo de `POLYGLOT-TUTOR-PROMPT.md`
3. Inicia un chat dentro del proyecto
4. El tutor se activará automáticamente y te pedirá calibración

### Con Claude Code
```bash
# Instalar Claude Code (si no lo tienes)
npm install -g @anthropic-ai/claude-code

# Usar el prompt como contexto
claude --project ./docs/POLYGLOT-TUTOR-PROMPT.md
```

## Opción 2: App React

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
git clone https://github.com/tu-usuario/polyglot-b2.git
cd polyglot-b2
npm install
npm start
```

La app se abrirá en `http://localhost:3000`.

### Build para producción
```bash
npm run build
```

Los archivos optimizados estarán en `build/`.

## Opción 3: Obsidian Vault

### Setup inicial
1. Descarga o clona este repo
2. En Obsidian: File → Open vault → Navigate to `obsidian-vault/`
3. Instala los plugins recomendados:
   - **Dataview** — para queries del tracker
   - **Templater** — para templates de notas
   - **Obsidian Git** — para sincronizar con GitHub
   - **Spaced Repetition** — para flashcards nativas

### Integración con Claude Code
```bash
# Desde la raíz del vault
claude "Inicia sesión del Día 1 para francés y portugués, 45 minutos"
```

### Tags disponibles
```
#idioma/francés #idioma/portugués #idioma/alemán #idioma/inglés
#nivel/A2 #nivel/B1 #nivel/B2
#habilidad/reading #habilidad/listening #habilidad/speaking #habilidad/writing
#tipo/gramática #tipo/vocabulario #tipo/expresión #tipo/falso-amigo
#día/01 ... #día/20
#error/recurrente #error/resuelto
```

## Opción 4: Exportar a Anki

1. Después de cada sesión, pide al tutor: "genera flashcards para Anki"
2. El tutor generará un bloque tab-separated
3. Guarda como `.txt` en `obsidian-vault/Anki-Export/`
4. En Anki: File → Import → selecciona el `.txt`
5. Configuración:
   - Separador: Tab
   - Tipo de nota: Básico
   - Campo 1 = Frente
   - Campo 2 = Reverso
   - Campo 3 = Tags

## Flujo de trabajo diario recomendado

```
07:00  📰 Noticias matutinas (15 min) — leer en 4 idiomas
07:15  🎧 Listening (15 min) — podcast o canción
07:30  📖 Sesión principal con tutor (45-60 min)
08:30  🃏 Repasar Anki (10 min)
12:00  🎮 Juego rápido durante almuerzo (10 min)
21:00  ✍️ Journaling en idioma meta (15 min)
```

Tiempo total: ~2 horas/día × 20 días = 40 horas intensivas por idioma.
