import { useState, useEffect, useCallback, useRef } from "react";

const LANGS = {
  fr: { flag: "🇫🇷", name: "Français", color: "#185FA5", light: "#E6F1FB", family: "Romance" },
  pt: { flag: "🇧🇷", name: "Português", color: "#0F6E56", light: "#E1F5EE", family: "Romance" },
  de: { flag: "🇩🇪", name: "Deutsch", color: "#BA7517", light: "#FAEEDA", family: "Germanic" },
  en: { flag: "🇬🇧", name: "English", color: "#534AB7", light: "#EEEDFE", family: "Germanic" },
};

const SKILLS = ["Reading", "Listening", "Speaking", "Writing", "Grammar", "Vocabulary"];

const DAY_PLAN = [
  { day: 1, title: "Phonology + Survival", phase: 1 },
  { day: 2, title: "Present tense + Core vocab", phase: 1 },
  { day: 3, title: "Past tense + Narration", phase: 1 },
  { day: 4, title: "Future + Plans", phase: 1 },
  { day: 5, title: "Checkpoint 1", phase: 1 },
  { day: 6, title: "Subjunctive / Conditional", phase: 2 },
  { day: 7, title: "Connectors + Argumentation", phase: 2 },
  { day: 8, title: "Thematic vocabulary", phase: 2 },
  { day: 9, title: "Intensive listening", phase: 2 },
  { day: 10, title: "Checkpoint 2", phase: 2 },
  { day: 11, title: "Formal writing", phase: 3 },
  { day: 12, title: "Idioms & expressions", phase: 3 },
  { day: 13, title: "Oral debate & opinion", phase: 3 },
  { day: 14, title: "Advanced grammar B2", phase: 3 },
  { day: 15, title: "Checkpoint 3", phase: 3 },
  { day: 16, title: "Advanced reading", phase: 4 },
  { day: 17, title: "Fluent oral production", phase: 4 },
  { day: 18, title: "Exam writing", phase: 4 },
  { day: 19, title: "Full mock exam", phase: 4 },
  { day: 20, title: "Closure + Maintenance", phase: 4 },
];

const PHASES = {
  1: { name: "Foundations", color: "#185FA5", bg: "#E6F1FB" },
  2: { name: "Expansion", color: "#0F6E56", bg: "#E1F5EE" },
  3: { name: "Production", color: "#BA7517", bg: "#FAEEDA" },
  4: { name: "Polish & Exam", color: "#534AB7", bg: "#EEEDFE" },
};

const GAMES = [
  { id: "chain", icon: "🔄", name: "Polyglot chain", desc: "Translate across all 4 languages" },
  { id: "detective", icon: "🕵️", name: "Error detective", desc: "Find 5 hidden grammar errors" },
  { id: "speed", icon: "⚡", name: "Speed translation", desc: "10 sentences, beat the clock" },
  { id: "roleplay", icon: "🎭", name: "Role-play roulette", desc: "Random situation + language" },
  { id: "story", icon: "📖", name: "Story builder", desc: "Collaborative multilingual story" },
  { id: "flashbattle", icon: "🃏", name: "Flashcard battle", desc: "Test recall under pressure" },
];

const VOCAB_CHALLENGE = {
  fr: [
    { q: "Comment dit-on 'sin embargo' ?", a: "cependant / néanmoins", hint: "Connecteur d'opposition" },
    { q: "Quel est le faux ami de 'éxito' ?", a: "succès (pas 'exit')", hint: "Exit = sortie" },
    { q: "'Assister' signifie...", a: "Estar presente (no ayudar)", hint: "Ayudar = aider" },
    { q: "Passé composé de 'aller' (je) ?", a: "je suis allé(e)", hint: "Verbe de mouvement → être" },
    { q: "Traduisez: 'Tengo ganas de...'", a: "J'ai envie de...", hint: "Envie ≠ envidia" },
  ],
  pt: [
    { q: "Como se diz 'embarazada'?", a: "grávida (não embaraçada!)", hint: "Embaraçada = avergonzada" },
    { q: "'Puxar' significa...", a: "Tirar/jalar (no empujar)", hint: "Empujar = empurrar" },
    { q: "Pretérito perfeito de 'ir' (eu)?", a: "eu fui", hint: "Igual que 'ser' en pretérito" },
    { q: "'Exquisito' em português é...", a: "requintado (esquisito = raro)", hint: "Falso amigo clásico" },
    { q: "Traduza: 'Ojalá que llueva'", a: "Tomara que chova", hint: "Subjuntivo presente" },
  ],
  de: [
    { q: "Was bedeutet 'Gift'?", a: "Veneno (nicht Geschenk!)", hint: "Geschenk = regalo" },
    { q: "Perfekt von 'gehen' (ich)?", a: "ich bin gegangen", hint: "Bewegungsverb → sein" },
    { q: "'Bekommen' bedeutet...", a: "Recibir (no 'become')", hint: "Become = werden" },
    { q: "Wo steht das Verb im Nebensatz?", a: "Am Ende", hint: "...weil ich müde BIN" },
    { q: "Übersetzen Sie: 'Me gustaría...'", a: "Ich möchte... / Ich würde gern...", hint: "Konjunktiv II" },
  ],
  en: [
    { q: "What does 'actually' mean?", a: "En realidad (not actualmente)", hint: "Currently = actualmente" },
    { q: "Present perfect of 'go' (I)?", a: "I have gone / been", hint: "Gone vs been = subtle difference" },
    { q: "'Sensible' means...", a: "Sensato (not sensible)", hint: "Sensible (ES) = sensitive" },
    { q: "Translate: 'Hace 3 años que vivo aquí'", a: "I have lived here for 3 years", hint: "Present perfect + for" },
    { q: "What's wrong: 'I have 25 years'?", a: "I am 25 years old", hint: "Age uses 'to be' not 'to have'" },
  ],
};

const NEWS_TEMPLATES = {
  fr: { title: "Le journal du matin", source: "France Info", sample: "Le gouvernement annonce de nouvelles mesures pour lutter contre le changement climatique. Les experts soulignent l'urgence d'agir avant 2030." },
  pt: { title: "Notícias da manhã", source: "Jornal Nacional", sample: "O governo brasileiro apresentou um novo programa de incentivos para energia renovável. Especialistas destacam a importância da transição energética." },
  de: { title: "Morgennachrichten", source: "Tagesschau", sample: "Die Bundesregierung hat neue Klimaschutzmaßnahmen angekündigt. Experten betonen die Dringlichkeit schnellen Handelns." },
  en: { title: "Morning briefing", source: "BBC News", sample: "World leaders gathered to discuss new climate commitments ahead of the upcoming summit. Scientists warn that current policies remain insufficient." },
};

function ProgressRing({ pct, size = 52, stroke = 4, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-border-tertiary)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

function MiniCard({ children, style, onClick, active }) {
  return (
    <div onClick={onClick} style={{
      background: active ? "var(--color-background-info)" : "var(--color-background-primary)",
      border: active ? "1.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)", padding: "12px 16px", cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease", ...style,
    }}>{children}</div>
  );
}

function SkillBar({ skill, level, color }) {
  const pct = { "A1": 15, "A2": 30, "B1": 55, "B2": 80, "C1": 95, "?": 0 }[level] || 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", width: 68, flexShrink: 0 }}>{skill}</span>
      <div style={{ flex: 1, height: 6, background: "var(--color-background-tertiary)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color, width: 24 }}>{level}</span>
    </div>
  );
}

export default function PolyglotApp() {
  const [view, setView] = useState("dashboard");
  const [activeLang, setActiveLang] = useState("fr");
  const [currentDay, setCurrentDay] = useState(1);
  const [profile, setProfile] = useState({
    fr: { Reading: "A2", Listening: "A1", Speaking: "A1", Writing: "A1", Grammar: "A2", Vocabulary: "A2" },
    pt: { Reading: "B1", Listening: "A2", Speaking: "A2", Writing: "A2", Grammar: "A2", Vocabulary: "B1" },
    de: { Reading: "A1", Listening: "A1", Speaking: "A1", Writing: "A1", Grammar: "A1", Vocabulary: "A1" },
    en: { Reading: "B1", Listening: "B1", Speaking: "A2", Writing: "A2", Grammar: "B1", Vocabulary: "B1" },
  });
  const [quizState, setQuizState] = useState({ active: false, lang: "fr", idx: 0, score: 0, answered: null, total: 0 });
  const [newsExpanded, setNewsExpanded] = useState(null);
  const [gameActive, setGameActive] = useState(null);
  const [chainState, setChainState] = useState({ word: "", step: 0, answers: {} });
  const [detInput, setDetInput] = useState("");
  const [speedState, setSpeedState] = useState({ idx: 0, time: 60, input: "", results: [], running: false });
  const timerRef = useRef(null);

  const overallPct = (lang) => {
    const levels = Object.values(profile[lang]);
    const map = { "A1": 10, "A2": 30, "B1": 55, "B2": 80, "C1": 95, "?": 0 };
    return Math.round(levels.reduce((s, l) => s + (map[l] || 0), 0) / levels.length);
  };

  const startQuiz = (lang) => {
    setQuizState({ active: true, lang, idx: 0, score: 0, answered: null, total: VOCAB_CHALLENGE[lang].length });
    setView("quiz");
  };

  const answerQuiz = (correct) => {
    setQuizState(q => ({ ...q, answered: correct, score: correct ? q.score + 1 : q.score }));
  };

  const nextQuiz = () => {
    setQuizState(q => {
      if (q.idx + 1 >= q.total) return { ...q, active: false };
      return { ...q, idx: q.idx + 1, answered: null };
    });
  };

  const SPEED_SENTENCES = [
    "Me gustaría reservar una mesa para dos",
    "¿Podrías repetir eso más despacio?",
    "Creo que deberíamos empezar de nuevo",
    "No estoy de acuerdo con esa decisión",
    "¿Cuánto tiempo lleva viviendo aquí?",
  ];

  const startSpeed = () => {
    setSpeedState({ idx: 0, time: 60, input: "", results: [], running: true });
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSpeedState(s => {
        if (s.time <= 1) { clearInterval(timerRef.current); return { ...s, time: 0, running: false }; }
        return { ...s, time: s.time - 1 };
      });
    }, 1000);
  };

  const submitSpeed = () => {
    setSpeedState(s => {
      const newResults = [...s.results, { sentence: SPEED_SENTENCES[s.idx], answer: s.input }];
      if (s.idx + 1 >= SPEED_SENTENCES.length) {
        clearInterval(timerRef.current);
        return { ...s, results: newResults, input: "", running: false, idx: s.idx + 1 };
      }
      return { ...s, results: newResults, input: "", idx: s.idx + 1 };
    });
  };

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "plan", label: "Plan 20 days", icon: "◈" },
    { id: "practice", label: "Practice", icon: "◇" },
    { id: "games", label: "Games", icon: "△" },
    { id: "news", label: "News", icon: "◻" },
  ];

  const lang = LANGS[activeLang];

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em" }}>Polyglot B2</span>
          <span style={{ fontSize: 11, background: "var(--color-background-info)", color: "var(--color-text-info)", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>20 days</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {Object.entries(LANGS).map(([k, v]) => (
            <button key={k} onClick={() => setActiveLang(k)} style={{
              border: activeLang === k ? `1.5px solid ${v.color}` : "0.5px solid var(--color-border-tertiary)",
              background: activeLang === k ? v.light : "transparent", borderRadius: 8, padding: "4px 10px",
              cursor: "pointer", fontSize: 14, fontWeight: activeLang === k ? 500 : 400,
              color: activeLang === k ? v.color : "var(--color-text-secondary)", transition: "all 0.2s",
            }}>{v.flag} {v.name}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => { setView(n.id); setGameActive(null); }} style={{
            flex: 1, border: view === n.id ? `1.5px solid ${lang.color}` : "0.5px solid var(--color-border-tertiary)",
            background: view === n.id ? lang.light : "transparent", borderRadius: 8, padding: "8px 4px",
            cursor: "pointer", fontSize: 12, fontWeight: view === n.id ? 500 : 400,
            color: view === n.id ? lang.color : "var(--color-text-secondary)", transition: "all 0.15s",
          }}><span style={{ display: "block", fontSize: 16, marginBottom: 2 }}>{n.icon}</span>{n.label}</button>
        ))}
      </div>

      {view === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {Object.entries(LANGS).map(([k, v]) => (
              <MiniCard key={k} onClick={() => setActiveLang(k)} active={activeLang === k}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <ProgressRing pct={overallPct(k)} color={v.color} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 18 }}>{v.flag}</span>
                  <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "4px 0 0" }}>{overallPct(k)}% to B2</p>
                </div>
              </MiniCard>
            ))}
          </div>

          <MiniCard style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{lang.flag}</span>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{lang.name} — Skill profile</span>
              <span style={{ fontSize: 11, background: lang.light, color: lang.color, padding: "2px 8px", borderRadius: 12, marginLeft: "auto" }}>{lang.family}</span>
            </div>
            {SKILLS.map(s => <SkillBar key={s} skill={s} level={profile[activeLang][s]} color={lang.color} />)}
          </MiniCard>

          <MiniCard style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Day {currentDay}/20 — {DAY_PLAN[currentDay-1].title}</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
              Phase {DAY_PLAN[currentDay-1].phase}: {PHASES[DAY_PLAN[currentDay-1].phase].name}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => sendPrompt(`Start Day ${currentDay} for ${LANGS[activeLang].name}: ${DAY_PLAN[currentDay-1].title}`)}
                style={{ flex: 1, background: lang.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                Start today's session ↗
              </button>
              <button onClick={() => startQuiz(activeLang)}
                style={{ flex: 1, background: "transparent", border: `0.5px solid ${lang.color}`, color: lang.color, borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                Quick quiz
              </button>
            </div>
          </MiniCard>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MiniCard onClick={() => setView("news")} style={{ cursor: "pointer" }}>
              <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>◻ Morning news</p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>Practice reading in 4 languages</p>
            </MiniCard>
            <MiniCard onClick={() => setView("games")} style={{ cursor: "pointer" }}>
              <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>△ Interactive games</p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>6 games to reinforce learning</p>
            </MiniCard>
          </div>
        </div>
      )}

      {view === "plan" && (
        <div>
          {[1,2,3,4].map(phase => (
            <div key={phase} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: PHASES[phase].color }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: PHASES[phase].color }}>Phase {phase}: {PHASES[phase].name}</span>
              </div>
              {DAY_PLAN.filter(d => d.phase === phase).map(d => {
                const isToday = d.day === currentDay;
                const done = d.day < currentDay;
                return (
                  <div key={d.day} onClick={() => setCurrentDay(d.day)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", marginBottom: 4,
                    borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                    background: isToday ? PHASES[phase].bg : "transparent",
                    border: isToday ? `1.5px solid ${PHASES[phase].color}` : "0.5px solid transparent",
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 500, flexShrink: 0,
                      background: done ? PHASES[phase].color : isToday ? PHASES[phase].bg : "var(--color-background-secondary)",
                      color: done ? "#fff" : isToday ? PHASES[phase].color : "var(--color-text-secondary)",
                      border: done ? "none" : `0.5px solid ${isToday ? PHASES[phase].color : "var(--color-border-tertiary)"}`,
                    }}>{done ? "✓" : d.day}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: isToday ? 500 : 400, margin: 0, color: done ? "var(--color-text-secondary)" : "var(--color-text-primary)" }}>{d.title}</p>
                    </div>
                    {isToday && (
                      <button onClick={(e) => { e.stopPropagation(); sendPrompt(`Start Day ${d.day}: ${d.title} for all my languages`); }}
                        style={{ fontSize: 11, padding: "4px 12px", background: PHASES[phase].color, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}>
                        Start ↗
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {view === "quiz" && quizState.active && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{LANGS[quizState.lang].flag} Quick quiz</span>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{quizState.idx + 1} / {quizState.total}</span>
          </div>
          <div style={{ height: 4, background: "var(--color-background-tertiary)", borderRadius: 2, marginBottom: 20 }}>
            <div style={{ width: `${((quizState.idx + 1) / quizState.total) * 100}%`, height: "100%", background: LANGS[quizState.lang].color, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
          <MiniCard style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 8px" }}>{VOCAB_CHALLENGE[quizState.lang][quizState.idx].q}</p>
            {quizState.answered === null ? (
              <div>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
                  💡 {VOCAB_CHALLENGE[quizState.lang][quizState.idx].hint}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => answerQuiz(true)} style={{ flex: 1, padding: 10, border: "0.5px solid var(--color-border-success)", background: "var(--color-background-success)", color: "var(--color-text-success)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>I know it ✓</button>
                  <button onClick={() => answerQuiz(false)} style={{ flex: 1, padding: 10, border: "0.5px solid var(--color-border-danger)", background: "var(--color-background-danger)", color: "var(--color-text-danger)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Show answer</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: 12, background: quizState.answered ? "var(--color-background-success)" : "var(--color-background-warning)", borderRadius: 8, marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: quizState.answered ? "var(--color-text-success)" : "var(--color-text-warning)" }}>
                    {quizState.answered ? "✓ Correct!" : "→ Answer:"}
                  </p>
                  <p style={{ fontSize: 14, margin: "6px 0 0", fontWeight: 500 }}>{VOCAB_CHALLENGE[quizState.lang][quizState.idx].a}</p>
                </div>
                <button onClick={nextQuiz} style={{ width: "100%", padding: 10, background: LANGS[quizState.lang].color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  {quizState.idx + 1 >= quizState.total ? "See results" : "Next →"}
                </button>
              </div>
            )}
          </MiniCard>
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)" }}>
            Score: {quizState.score}/{quizState.idx + (quizState.answered !== null ? 1 : 0)}
          </div>
        </div>
      )}

      {view === "quiz" && !quizState.active && quizState.total > 0 && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ display: "inline-flex", marginBottom: 16 }}>
            <ProgressRing pct={Math.round((quizState.score / quizState.total) * 100)} size={80} stroke={6} color={LANGS[quizState.lang].color} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>{quizState.score}/{quizState.total}</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 20px" }}>
            {quizState.score === quizState.total ? "Perfect score!" : quizState.score >= 3 ? "Good work, keep practicing!" : "Review these concepts carefully"}
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={() => startQuiz(activeLang)} style={{ padding: "10px 20px", background: LANGS[activeLang].color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Retry ↻</button>
            <button onClick={() => setView("dashboard")} style={{ padding: "10px 20px", background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Back to dashboard</button>
            <button onClick={() => sendPrompt(`Generate 10 Anki flashcards for ${LANGS[activeLang].name} based on my weak areas`)} style={{ padding: "10px 20px", background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Export to Anki ↗</button>
          </div>
        </div>
      )}

      {view === "practice" && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>{lang.flag} Practice {lang.name}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { icon: "📖", label: "Reading", prompt: `Give me a B2 reading comprehension exercise in ${lang.name} with questions` },
              { icon: "🎧", label: "Listening", prompt: `Create a listening exercise for ${lang.name}: describe an audio scenario and ask comprehension questions` },
              { icon: "🗣️", label: "Speaking", prompt: `Give me a speaking exercise for ${lang.name}: a role-play situation where I practice at a restaurant` },
              { icon: "✍️", label: "Writing", prompt: `Give me a B2 writing task for ${lang.name}: write a formal letter or argumentative essay` },
              { icon: "📝", label: "Grammar drill", prompt: `Create 10 grammar exercises for ${lang.name} at B2 level, focusing on my weak areas` },
              { icon: "🔤", label: "Vocabulary", prompt: `Give me a B2 vocabulary exercise for ${lang.name} with context sentences and false friends` },
            ].map((item, i) => (
              <MiniCard key={i} onClick={() => sendPrompt(item.prompt)} style={{ cursor: "pointer", textAlign: "center" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 10, display: "block", color: "var(--color-text-secondary)", marginTop: 2 }}>↗</span>
              </MiniCard>
            ))}
          </div>

          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Exam practice</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { lang: "fr", exam: "DELF B2", prompt: "Generate a DELF B2 style exam section for French: compréhension écrite with a text and 5 questions" },
              { lang: "pt", exam: "CELPE-Bras", prompt: "Generate a CELPE-Bras style integrated task for Portuguese: read a text and write a response" },
              { lang: "de", exam: "Goethe B2", prompt: "Generate a Goethe-Zertifikat B2 style Lesen section with a German text and 5 questions" },
              { lang: "en", exam: "TOEFL iBT", prompt: "Generate a TOEFL iBT style reading passage with 5 questions including inference and vocabulary in context" },
            ].map((item, i) => (
              <MiniCard key={i} onClick={() => sendPrompt(item.prompt)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{LANGS[item.lang].flag}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{item.exam}</p>
                    <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>Mock exam ↗</p>
                  </div>
                </div>
              </MiniCard>
            ))}
          </div>
        </div>
      )}

      {view === "games" && !gameActive && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Interactive games</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {GAMES.map(g => (
              <MiniCard key={g.id} onClick={() => {
                if (g.id === "chain" || g.id === "detective" || g.id === "speed") {
                  setGameActive(g.id);
                } else {
                  sendPrompt(`Let's play ${g.name}! Rules: ${g.desc}. Use ${LANGS[activeLang].name} as the main language.`);
                }
              }} style={{ cursor: "pointer" }}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{g.icon}</span>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 4px" }}>{g.name}</p>
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>{g.desc}</p>
              </MiniCard>
            ))}
          </div>
        </div>
      )}

      {view === "games" && gameActive === "chain" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setGameActive(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--color-text-secondary)" }}>← Back</button>
            <span style={{ fontSize: 15, fontWeight: 500 }}>🔄 Polyglot chain</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Translate the word into all 4 languages. Think before revealing!</p>
          {["hospital", "libertad", "naturaleza", "gobierno", "desarrollo"].map((word, i) => (
            <MiniCard key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px" }}>🇪🇸 {word}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {Object.entries(LANGS).map(([k, v]) => (
                  <button key={k} onClick={() => sendPrompt(`How do you say "${word}" in ${v.name}? Give me the translation, pronunciation in IPA, and a B2 example sentence.`)}
                    style={{ padding: "6px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 6, background: "transparent", cursor: "pointer", fontSize: 12 }}>
                    {v.flag} ↗
                  </button>
                ))}
              </div>
            </MiniCard>
          ))}
        </div>
      )}

      {view === "games" && gameActive === "detective" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setGameActive(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--color-text-secondary)" }}>← Back</button>
            <span style={{ fontSize: 15, fontWeight: 500 }}>🕵️ Error detective — {lang.flag}</span>
          </div>
          <MiniCard style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>Find 5 grammar errors in this paragraph:</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 12px", fontStyle: "italic" }}>
              {activeLang === "fr" && "Je suis allé à la magasin hier. J'ai acheté des pommes et du lait. Ma soeur a dit que elle voulait venir aussi, mais je suis parti sans la attendre. Quand je suis revenu, elle était très en colère avec moi."}
              {activeLang === "pt" && "Eu fui na loja ontem. Comprei umas maçãs e leite. Minha irmã disse que ela queria vir também, mas eu saí sem esperar ela. Quando voltei, ela tava muito brava comigo."}
              {activeLang === "de" && "Ich bin zu der Laden gestern gegangen. Ich habe Äpfel und Milch gekooft. Meine Schwester hat gesagt, dass sie auch mitkommen wollte, aber ich bin ohne ihr gegangen. Als ich zurückkam, war sie sehr böse auf mich."}
              {activeLang === "en" && "I went to the store yesterday. I buyed some apples and milk. My sister said that she wanted to come too, but I leaved without waiting she. When I came back, she was very angry to me."}
            </p>
            <button onClick={() => sendPrompt(`I'm playing Error Detective in ${lang.name}. Here's the paragraph with errors. Help me identify all 5 grammar mistakes, explain the correct form according to ${activeLang === "fr" ? "Académie française" : activeLang === "pt" ? "Academia Brasileira de Letras" : activeLang === "de" ? "Duden/Rat für deutsche Rechtschreibung" : "Oxford/Cambridge"} standards, and explain why each is wrong.`)}
              style={{ width: "100%", padding: 10, background: lang.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              Check my answers ↗
            </button>
          </MiniCard>
        </div>
      )}

      {view === "games" && gameActive === "speed" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <button onClick={() => { setGameActive(null); if(timerRef.current) clearInterval(timerRef.current); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--color-text-secondary)" }}>← Back</button>
            <span style={{ fontSize: 15, fontWeight: 500 }}>⚡ Speed translation → {lang.flag}</span>
            {speedState.running && <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 500, color: speedState.time < 15 ? "var(--color-text-danger)" : "var(--color-text-secondary)" }}>{speedState.time}s</span>}
          </div>
          {!speedState.running && speedState.idx === 0 && (
            <MiniCard style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, margin: "0 0 12px" }}>Translate 5 sentences from Spanish to {lang.name}</p>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>You have 60 seconds. Go!</p>
              <button onClick={startSpeed} style={{ padding: "10px 24px", background: lang.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Start</button>
            </MiniCard>
          )}
          {speedState.running && speedState.idx < SPEED_SENTENCES.length && (
            <MiniCard>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{speedState.idx + 1} / {SPEED_SENTENCES.length}</p>
              <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px" }}>🇪🇸 {SPEED_SENTENCES[speedState.idx]}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={speedState.input} onChange={e => setSpeedState(s => ({ ...s, input: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter" && speedState.input.trim()) submitSpeed(); }}
                  placeholder={`${lang.flag} Your translation...`}
                  style={{ flex: 1, padding: "8px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
                <button onClick={submitSpeed} disabled={!speedState.input.trim()}
                  style={{ padding: "8px 16px", background: lang.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, opacity: speedState.input.trim() ? 1 : 0.5 }}>→</button>
              </div>
            </MiniCard>
          )}
          {(!speedState.running && speedState.idx > 0) && (
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Your translations:</p>
              {speedState.results.map((r, i) => (
                <MiniCard key={i} style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>🇪🇸 {r.sentence}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "4px 0 0" }}>{lang.flag} {r.answer}</p>
                </MiniCard>
              ))}
              <button onClick={() => sendPrompt(`Check my speed translations to ${lang.name}. Here are my answers:\n${speedState.results.map((r,i) => `${i+1}. "${r.sentence}" → "${r.answer}"`).join("\n")}\n\nCorrect each one according to ${activeLang === "fr" ? "Académie française" : activeLang === "pt" ? "ABL" : activeLang === "de" ? "Duden" : "Oxford"} standards. Score me and identify patterns in my errors.`)}
                style={{ width: "100%", padding: 10, marginTop: 8, background: lang.color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                Grade my translations ↗
              </button>
            </div>
          )}
        </div>
      )}

      {view === "news" && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Morning news briefing</p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 16 }}>Read news in all 4 languages. Tap to expand and practice.</p>
          {Object.entries(NEWS_TEMPLATES).map(([k, news]) => (
            <MiniCard key={k} onClick={() => setNewsExpanded(newsExpanded === k ? null : k)} style={{ marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: newsExpanded === k ? 10 : 0 }}>
                <span style={{ fontSize: 18 }}>{LANGS[k].flag}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{news.title}</p>
                  <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>{news.source}</p>
                </div>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)", transform: newsExpanded === k ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>
              </div>
              {newsExpanded === k && (
                <div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 12px", padding: 12, background: "var(--color-background-secondary)", borderRadius: 8 }}>
                    {news.sample}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={(e) => { e.stopPropagation(); sendPrompt(`Give me today's real news in ${LANGS[k].name} at B2 level. Include 3 key vocabulary words with translations. Then ask me a comprehension question.`); }}
                      style={{ flex: 1, padding: "8px", border: `0.5px solid ${LANGS[k].color}`, color: LANGS[k].color, background: "transparent", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                      Real news today ↗
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); sendPrompt(`Based on this ${LANGS[k].name} news text: "${news.sample}" — Ask me 3 B2 comprehension questions, then have me write a response in ${LANGS[k].name} giving my opinion.`); }}
                      style={{ flex: 1, padding: "8px", border: `0.5px solid ${LANGS[k].color}`, color: LANGS[k].color, background: "transparent", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                      Practice with this ↗
                    </button>
                  </div>
                </div>
              )}
            </MiniCard>
          ))}
        </div>
      )}
    </div>
  );
}
