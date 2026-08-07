# 🤖 Hermes Language Tutor Bot (Discord)

Bot de Discord enfocado **solo** en dos metas concretas:

- 🇬🇧 **English**: A2 → B1
- 🇩🇪 **Deutsch**: A2

Inspirado en el enfoque de [Hermes Agent](https://github.com/nousresearch/hermes-agent) (Nous Research) —
memoria persistente por usuario, agente que va curando puntos débiles, provider-agnostic (funciona con
cualquier API compatible con OpenAI) — pero implementado como un bot ligero en Node.js/discord.js en vez
del framework Python completo, para encajar con el stack de este repo y no requerir Docker/sandboxes.

## Qué hace

- `/practice idioma:` — abre una sesión de conversación con el tutor en el canal (responde a tus mensajes hasta `/stop`)
- `/vocab idioma:` — 5 palabras nuevas a tu nivel, con ejemplo y traducción
- `/quiz idioma:` — mini-quiz de 5 preguntas a tu nivel
- `/correct idioma: texto:` — corrige una frase tuya citando la regla (Cambridge/British Council para inglés, Duden/Goethe-Institut para alemán)
- `/roleplay idioma: escenario:` — simulacro conversacional (pedir un café, entrevista, etc.)
- `/say idioma: texto:` — el bot pronuncia un texto en voz (audio adjunto, y lo reproduce en tu canal de voz si estás en uno)
- `/voice join idioma:` — el bot se une a tu canal de voz actual y te escucha: transcribe lo que dices, te da feedback de gramática **y pronunciación**, y te responde en texto + audio
- `/voice leave` — el bot sale del canal de voz
- `/progress` — tu nivel, racha, vocabulario y puntos débiles guardados
- `/setlevel idioma: nivel:` — ajusta tu nivel de partida manualmente

El progreso (nivel, racha, vocabulario visto, quizzes hechos, errores recurrentes) se guarda por usuario en
`data/progress.json` y se inyecta en cada respuesta del tutor para que no repita explicaciones ya dominadas.

## 1. Crear la app de Discord

1. Ve a https://discord.com/developers/applications → **New Application**
2. **Bot** → *Reset Token* → copia el token → será tu `DISCORD_TOKEN`
3. En **Bot**, activa el intent privilegiado **MESSAGE CONTENT INTENT** (necesario para que el bot lea tus mensajes durante una sesión de práctica)
4. Copia el **Application ID** (pestaña *General Information*) → será tu `DISCORD_CLIENT_ID`
5. **OAuth2 → URL Generator**: marca scopes `bot` + `applications.commands`, permisos `Send Messages`, `Read Message History`, `Use Slash Commands`, `Attach Files` (para los audios), y `Connect` + `Speak` (para `/voice`). Abre la URL generada para invitar el bot a tu servidor.

> Si ya invitaste el bot antes de agregar `Connect`/`Speak`/`Attach Files`, vuelve a generar la URL con esos permisos marcados y vuelve a abrirla — reautoriza sin necesidad de expulsar al bot primero.

## 2. Elegir una API LLM gratuita

El bot habla con cualquier endpoint compatible con `POST /chat/completions` de OpenAI. Opciones gratuitas
(ver [awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) para la lista completa y límites actualizados):

| Proveedor | `LLM_BASE_URL` | Notas |
|---|---|---|
| **Groq** (default) | `https://api.groq.com/openai/v1` | Sin tarjeta, ~14.400 req/día, muy rápido |
| **OpenRouter** | `https://openrouter.ai/api/v1` | Tiene modelos gratuitos de NousResearch/Hermes — revisa `openrouter.ai/models` filtrando por `:free` |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai` | No disponible en UE/UK/Suiza |
| **Mistral** | `https://api.mistral.ai/v1` | Plan "Experiment" gratuito |
| **SambaNova** | `https://api.sambanova.ai/v1` | Sin tarjeta |

### Voz (opcional, para `/voice` y `/say`)

- **Escuchar (STT)**: usa el Whisper gratuito de **Groq** (`api.groq.com`) específicamente, sin importar qué
  proveedor uses para el texto — no todos los proveedores gratuitos de la tabla anterior ofrecen transcripción
  de audio. Si ya elegiste Groq arriba, no necesitas una key nueva.
- **Hablar (TTS)**: usa el servicio "Read Aloud" de Microsoft Edge — gratis, sin API key, sin registro. Si
  alguna vez te da error 403, es porque Microsoft a veces bloquea IPs de datacenters/VPN; desde una conexión
  doméstica normal funciona.

## 3. Configurar variables de entorno

```bash
cd discord-bot
cp .env.example .env
# edita .env con tu DISCORD_TOKEN, DISCORD_CLIENT_ID y LLM_API_KEY
```

## 4. Instalar, registrar comandos y arrancar

```bash
npm install
npm run register   # sube los slash commands a Discord (usa DISCORD_GUILD_ID para verlos al instante en un solo servidor)
npm start
```

Para desarrollo con auto-reload: `npm run dev`.

## Notas de diseño

- **Memoria de corto plazo** (la conversación activa) vive en memoria del proceso (`src/session.js`) y se
  pierde al reiniciar — es contexto de trabajo, no progreso.
- **Memoria de largo plazo** (`data/progress.json`, vía `src/memory.js`) es lo que persiste entre sesiones:
  nivel, racha, vocabulario y patrones de error. El propio LLM decide cuándo vale la pena registrar un punto
  débil, usando una etiqueta interna `[[WEAKPOINT: ...]]` que el bot extrae y oculta antes de responder.
- El bot es deliberadamente **mono-propósito**: solo inglés y alemán a nivel A2-B1, a diferencia del
  `docs/POLYGLOT-TUTOR-PROMPT.md` del repo (que cubre 4 idiomas a B2). Si más adelante quieres ampliar
  cobertura, añade una entrada nueva a `LANGUAGE_CONFIG` en `src/prompt.js`.
- Para producción considera migrar `data/progress.json` a SQLite/Postgres si vas a tener muchos usuarios
  concurrentes (el archivo JSON no es seguro ante escrituras concurrentes a gran escala).
- **Voz**: `/voice join` solo escucha al usuario que lo invocó (no a todo el canal). Detecta cuando dejas de
  hablar (~1s de silencio) para cortar y procesar la grabación — habla en frases, no dejes silencios largos
  a mitad de una idea o se cortará antes de tiempo. Solo se admite una sesión de voz activa por servidor a
  la vez.
- Las librerías de voz (`@discordjs/voice`, `opusscript`, `libsodium-wrappers`, `ffmpeg-static`) se eligieron
  deliberadamente en sus variantes sin compilación nativa (JS puro / binario precompilado) para que
  `npm install` funcione en Windows sin Visual Studio Build Tools.

## Despliegue

Cualquier host que corra Node 18+ de forma persistente sirve: Railway, Fly.io, un VPS con `pm2`, o un
contenedor. El bot usa `discord.js` en modo gateway (WebSocket persistente), así que necesita un proceso
de larga duración — no funciona como función serverless sin adaptarlo a interacciones HTTP.
