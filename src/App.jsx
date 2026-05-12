import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const B2_TOPICS = [
  { id: "conditionals", label: "Conditionals & Future Forms", icon: "⚡" },
  { id: "modals", label: "Modal Verbs & Nuance", icon: "🎯" },
  { id: "narrative", label: "Narrative Tenses", icon: "📖" },
  { id: "passive", label: "Passive Voice", icon: "🔄" },
  { id: "relative", label: "Relative Clauses", icon: "🔗" },
  { id: "reported", label: "Reported Speech", icon: "💬" },
  { id: "linking", label: "Linking Words & Discourse Markers", icon: "🧩" },
  { id: "phrasal", label: "Phrasal Verbs", icon: "🚀" },
  { id: "collocations", label: "Collocations", icon: "🤝" },
  { id: "word_formation", label: "Word Formation", icon: "🔨" },
  { id: "idioms", label: "Idioms & Expressions", icon: "🎭" },
  { id: "vocabulary", label: "Contextual Vocabulary", icon: "📚" },
  { id: "fluency", label: "Fluency & Natural Speech", icon: "🌊" },
];

const SPEAKING_TOPICS = [
  "An unpopular opinion you genuinely hold",
  "A decision you made that surprised even yourself",
  "Something that's considered normal but you find strange",
  "A time you felt completely out of place",
  "What your relationship with social media really looks like",
  "A belief you used to have that you've completely changed",
  "The most overrated thing in your culture",
  "A moment that felt like a turning point",
  "Something you're quietly proud of",
  "A habit that says a lot about who you are",
  "What you wish people understood about you",
  "A time you had to disagree with someone you respect",
  "Something that makes you irrationally annoyed",
  "An experience that taught you something unexpected",
  "What 'success' actually means to you right now",
];

const READING_SOURCES = [
  { title: "The Conversation", url: "https://theconversation.com/us", tag: "Analysis" },
  { title: "Aeon Essays", url: "https://aeon.co", tag: "Ideas" },
  { title: "BBC Future", url: "https://www.bbc.com/future", tag: "Science" },
  { title: "Nautilus", url: "https://nautil.us", tag: "Deep Reads" },
  { title: "Wired", url: "https://wired.com", tag: "Tech & Culture" },
  { title: "The Atlantic", url: "https://theatlantic.com", tag: "Society" },
];

const LISTENING_SOURCES = [
  { title: "Hidden Brain", platform: "Spotify/Apple", level: "B1-B2", tag: "Psychology" },
  { title: "Radiolab", platform: "Spotify/Apple", level: "B2", tag: "Science" },
  { title: "Ted Talks Daily", platform: "Spotify/Apple", level: "B1-B2", tag: "Ideas" },
  { title: "How I Built This", platform: "Spotify/Apple", level: "B2", tag: "Business" },
  { title: "The Daily (NYT)", platform: "Spotify/Apple", level: "B2", tag: "News" },
  { title: "Stuff You Should Know", platform: "Spotify/Apple", level: "B1+", tag: "Fun" },
];

// ─── API CALL ─────────────────────────────────────────────────────────────────


async function callOpenAI(messages, systemPrompt) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      systemPrompt,
    }),
  });

  const data = await response.json();

  return data.reply || "";
}


// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveState(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function ProgressRing({ percent, size = 64, stroke = 5, color = "#f97316" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (percent / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e1e" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px`, fill: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}
      >{percent}%</text>
    </svg>
  );
}

function Badge({ text, color = "#f97316" }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: 1
    }}>{text}</span>
  );
}

function Spinner() {
  return (
    <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #f9741633", borderTop: "2px solid #f97316", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  );
}

// ─── SPEAKING MODULE ─────────────────────────────────────────────────────────

function SpeakingModule({ profile, onUpdate }) {
  const [topic] = useState(() => {
    const idx = new Date().getDate() % SPEAKING_TOPICS.length;
    return SPEAKING_TOPICS[idx];
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const SYSTEM = `You are a warm, engaging English fluency coach helping a B1 learner reach B2.
Your role in this Speaking Practice session:
- Topic for today: "${topic}"
- Have a REAL conversation. Ask one follow-up question at a time.
- After 2-3 exchanges, gently point out 1-2 phrases that could sound more natural.
- Encourage specificity: if they're vague, ask "Can you give me an example?"
- NEVER break the conversational flow with a grammar lecture.
- Suggest B2-level vocabulary naturally.
- Keep responses under 120 words. Be human, curious, a little witty.
- User profile notes: ${JSON.stringify(profile?.weaknesses || [])}`;

  async function startConversation() {
    setStarted(true);
    setLoading(true);
    const opening = await callOpenAI(
      [{ role: "user", content: "Start the conversation about today's topic." }],
      SYSTEM
    );
    setMessages([{ role: "assistant", content: opening }]);
    setLoading(false);
  }

  

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Badge text="SPEAKING" color="#f97316" />
          <Badge text="TODAY'S TOPIC" color="#6366f1" />
        </div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
          "{topic}"
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#666" }}>
          Write in English. The coach will keep the conversation going and help you sound more natural.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {!started && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎙️</div>
            <p style={{ color: "#666", marginBottom: 20 }}>Ready to practice speaking naturally?</p>
            <button onClick={startConversation} style={btnStyle("#f97316")}>
              Start Conversation
            </button>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "78%",
            background: m.role === "user" ? "#f97316" : "#141414",
            border: m.role === "user" ? "none" : "1px solid #222",
            borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            padding: "10px 14px",
            fontSize: 14,
            lineHeight: 1.6,
            color: m.role === "user" ? "#fff" : "#ccc",
            whiteSpace: "pre-wrap",
          }}>{m.content}</div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: "#141414", border: "1px solid #222", borderRadius: "16px 16px 16px 4px" }}>
            <Spinner />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {started && (
        <div style={{ padding: "12px 24px 20px", borderTop: "1px solid #1e1e1e" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Type your answer in English..."
              style={inputStyle}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={btnStyle("#f97316", { padding: "0 16px", flexShrink: 0 })}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );

  
// ─── WRITING MODULE ───────────────────────────────────────────────────────────

function WritingModule({ profile, onUpdate }) {
  const PROMPTS = [
    "Write about something you changed your mind about recently.",
    "Describe a place that shaped who you are.",
    "What's one thing most people get wrong about your generation?",
    "Write about a moment you felt genuinely proud of yourself.",
    "What does 'home' mean to you?",
    "Describe the last time you felt genuinely uncomfortable.",
    "Write a short argument for something most people disagree with.",
  ];
  const [prompt] = useState(() => PROMPTS[new Date().getDate() % PROMPTS.length]);
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const SYSTEM = `You are a precise, encouraging English writing coach. The learner is at B1 aiming for B2.
Analyze the text and return your feedback in this EXACT JSON structure (no markdown fences):
{
  "level": "B1" or "B1+" or "B2-" or "B2",
  "score": number 0-100,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "corrections": [{"original": "...", "better": "...", "note": "brief reason"}],
  "vocabulary_suggestions": [{"word": "...", "upgrade": "...", "context": "..."}],
  "overall_comment": "2-3 sentences, warm but direct"
}`;

  async function submit() {
    if (!draft.trim() || loading) return;
    setLoading(true);
    setSubmitted(true);
    const raw = await callOpenAI(
      [{ role: "user", content: `Prompt: "${prompt}"\n\nText: "${draft}"` }],
      SYSTEM
    );
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      setFeedback(JSON.parse(cleaned));
      onUpdate?.({ type: "writing_done", weaknesses: JSON.parse(cleaned).weaknesses });
    } catch {
      setFeedback({ overall_comment: raw });
    }
    setLoading(false);
  }

  const levelColor = { "B1": "#ef4444", "B1+": "#f97316", "B2-": "#eab308", "B2": "#22c55e" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Badge text="WRITING" color="#6366f1" />
          <Badge text="DAILY PROMPT" color="#a855f7" />
        </div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.4 }}>
          {prompt}
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#666" }}>
          Aim for 100-200 words. Write naturally - don't overthink it.
        </p>
      </div>

      <div style={{ padding: 24 }}>
        {!submitted ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Start writing here..."
              style={{
                ...inputStyle,
                height: 180,
                resize: "vertical",
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ color: "#555", fontSize: 12 }}>{draft.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button onClick={submit} disabled={draft.trim().split(/\s+/).length < 20 || loading} style={btnStyle("#6366f1")}>
                {loading ? <Spinner /> : "Get Feedback →"}
              </button>
            </div>
          </>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#555" }}>
            <Spinner /> <span style={{ marginLeft: 10 }}>Analyzing your writing...</span>
          </div>
        ) : feedback && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {feedback.level && (
              <div style={{
                display: "flex", alignItems: "center", gap: 16, padding: 16,
                background: "#111", border: `1px solid ${levelColor[feedback.level] || "#333"}33`,
                borderRadius: 10
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: levelColor[feedback.level] || "#fff" }}>{feedback.level}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>Level</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${feedback.score}%`, background: levelColor[feedback.level] || "#f97316", borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>{feedback.overall_comment}</p>
                </div>
              </div>
            )}

            {(feedback.strengths || feedback.weaknesses) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FeedbackCard title="✅ What's working" items={feedback.strengths} color="#22c55e" />
                <FeedbackCard title="⚠️ To improve" items={feedback.weaknesses} color="#f97316" />
              </div>
            )}

            {feedback.corrections?.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 12 }}>CORRECTIONS</div>
                {feedback.corrections.map((c, i) => (
                  <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < feedback.corrections.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                    <div style={{ fontSize: 13, color: "#ef4444", textDecoration: "line-through" }}>{c.original}</div>
                    <div style={{ fontSize: 13, color: "#22c55e", marginTop: 2 }}>→ {c.better}</div>
                    {c.note && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{c.note}</div>}
                  </div>
                ))}
              </div>
            )}

            {feedback.vocabulary_suggestions?.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: 1, marginBottom: 12 }}>VOCABULARY UPGRADES</div>
                {feedback.vocabulary_suggestions.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: "#666" }}>{v.word}</span>
                    <span style={{ color: "#444" }}>→</span>
                    <span style={{ color: "#6366f1", fontWeight: 700 }}>{v.upgrade}</span>
                    {v.context && <span style={{ color: "#444", fontSize: 11 }}>({v.context})</span>}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setSubmitted(false); setFeedback(null); setDraft(""); }} style={btnStyle("#333", { color: "#888" })}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackCard({ title, items = [], color }) {
  return (
    <div style={{ background: "#0d0d0d", border: `1px solid ${color}22`, borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 12, color: "#888", marginBottom: 4, lineHeight: 1.4 }}>• {item}</div>
      ))}
    </div>
  );
}

// ─── READING MODULE ───────────────────────────────────────────────────────────

function ReadingModule() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("paste");

  const SYSTEM = `You are an English reading coach. The learner is B1 heading to B2. Analyze the pasted text and return ONLY valid JSON (no markdown): { "summary": "2-3 sentence summary in simple English", "vocabulary": [{"word": "...", "definition": "...", "example": "..."}], "expressions": [{"phrase": "...", "meaning": "...", "natural_use": "..."}], "questions": ["comprehension question 1", "question 2", "question 3"], "reuse_phrases": ["phrase to reuse in your own speaking/writing 1", "phrase 2", "phrase 3"] } Vocabulary: pick 5 words the learner might not know at B1. Expressions: pick 3 natural phrases.`;

  async function analyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    const raw = await callOpenAI(
      [{ role: "user", content: `Analyze this text:\n\n${text.slice(0, 2000)}` }],
      SYSTEM
    );
    try {
      setAnalysis(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch {
      setAnalysis({ summary: raw });
    }
    setLoading(false);
  }

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Badge text="READING" color="#22c55e" />
        </div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>Daily Reading Coach</h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#666" }}>Find an article, paste it here, and get a full breakdown.</p>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {["paste", "sources"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              ...btnStyle(mode === m ? "#22c55e" : "#1a1a1a", { fontSize: 12 }),
              color: mode === m ? "#000" : "#555",
              border: `1px solid ${mode === m ? "#22c55e" : "#222"}`,
            }}>
              {m === "paste" ? "📋 Paste Text" : "🔗 Where to Read"}
            </button>
          ))}
        </div>

        {mode === "paste" ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any article, blog post, or text you want to analyze..."
              style={{ ...inputStyle, height: 160, resize: "vertical", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button onClick={analyze} disabled={text.length < 100 || loading} style={btnStyle("#22c55e", { color: "#000" })}>
                {loading ? <Spinner /> : "Analyze Text →"}
              </button>
            </div>

            {analysis && (
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#0d1a0d", border: "1px solid #22c55e33", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: 1, marginBottom: 8 }}>SUMMARY</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>{analysis.summary}</p>
                </div>

                {analysis.vocabulary?.length > 0 && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: 1, marginBottom: 10 }}>KEY VOCABULARY</div>
                    {analysis.vocabulary.map((v, i) => (
                      <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < analysis.vocabulary.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{v.word}</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{v.definition}</div>
                        {v.example && <div style={{ fontSize: 12, color: "#555", fontStyle: "italic", marginTop: 2 }}>e.g. "{v.example}"</div>}
                      </div>
                    ))}
                  </div>
                )}

                {analysis.expressions?.length > 0 && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: 1, marginBottom: 10 }}>NATURAL EXPRESSIONS</div>
                    {analysis.expressions.map((e, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ color: "#f97316", fontSize: 14, fontWeight: 700 }}>"{e.phrase}"</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{e.meaning}</div>
                        {e.natural_use && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>→ {e.natural_use}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {analysis.questions?.length > 0 && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#eab308", letterSpacing: 1, marginBottom: 10 }}>THINK ABOUT THIS</div>
                    {analysis.questions.map((q, i) => (
                      <div key={i} style={{ fontSize: 13, color: "#aaa", marginBottom: 6 }}>→ {q}</div>
                    ))}
                  </div>
                )}

                {analysis.reuse_phrases?.length > 0 && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#a855f7", letterSpacing: 1, marginBottom: 10 }}>PHRASES TO STEAL & USE</div>
                    {analysis.reuse_phrases.map((p, i) => (
                      <div key={i} style={{ fontSize: 13, color: "#c084fc", marginBottom: 6, fontStyle: "italic" }}>"{p}"</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#666" }}>Great sources for B1-B2 learners:</p>
            {READING_SOURCES.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", background: "#0d0d0d", border: "1px solid #1e1e1e",
                borderRadius: 8, textDecoration: "none", color: "#fff",
              }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</span>
                <Badge text={s.tag} color="#22c55e" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LISTENING MODULE ─────────────────────────────────────────────────────────

function ListeningModule() {
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const SYSTEM = `You are a listening coach for a B1 English learner going to B2. The learner will paste a transcript or notes from something they listened to. Return ONLY valid JSON: { "expressions_heard": [{"expression": "...", "meaning": "...", "formality": "casual/neutral/formal"}], "shadowing_phrases": ["phrase 1 to repeat aloud", "phrase 2", "phrase 3"], "accent_notes": "brief comment about speech patterns, speed, or pronunciation patterns in this content", "comprehension_check": ["question 1 about what they heard", "question 2"], "vocabulary": [{"word": "...", "definition": "..."}] }`;

  async function analyze() {
    if (!transcript.trim() || loading) return;
    setLoading(true);
    const raw = await callOpenAI(
      [{ role: "user", content: transcript.slice(0, 2000) }],
      SYSTEM
    );
    try {
      setAnalysis(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch {
      setAnalysis({ accent_notes: raw });
    }
    setLoading(false);
  }

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid #1e1e1e" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Badge text="LISTENING" color="#eab308" />
        </div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>Listening Lab</h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#666" }}>Listen to something, then paste the transcript or your notes for deep analysis.</p>
      </div>

      <div style={{ padding: 24 }}>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Recommended today:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {LISTENING_SOURCES.map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.platform}</div>
              <div style={{ marginTop: 4 }}><Badge text={s.tag} color="#eab308" /></div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0d0d1a", border: "1px solid #6366f133", borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 6 }}>🔊 SHADOWING TIP</div>
          <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.5 }}>
            Pause the audio every 10-15 seconds. Repeat exactly what you heard - same rhythm, same tone.
            Don't translate. Just copy the sound. Do this 3x per episode for 10 min/day.
          </p>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste transcript or notes from what you listened to..."
          style={{ ...inputStyle, height: 140, resize: "vertical", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button onClick={analyze} disabled={transcript.length < 50 || loading} style={btnStyle("#eab308", { color: "#000" })}>
            {loading ? <Spinner /> : "Analyze →"}
          </button>
        </div>

        {analysis && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {analysis.shadowing_phrases?.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#eab308", letterSpacing: 1, marginBottom: 10 }}>SHADOW THESE 🔊</div>
                {analysis.shadowing_phrases.map((p, i) => (
                  <div key={i} style={{ fontSize: 14, color: "#eab308", marginBottom: 8, padding: "6px 10px", background: "#eab30810", borderRadius: 6 }}>
                    "{p}"
                  </div>
                ))}
              </div>
            )}
            {analysis.expressions_heard?.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: 1, marginBottom: 10 }}>EXPRESSIONS DECODED</div>
                {analysis.expressions_heard.map((e, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#f97316", fontWeight: 700 }}>{e.expression}</span>
                      <Badge text={e.formality} color={e.formality === "casual" ? "#6366f1" : "#22c55e"} />
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{e.meaning}</div>
                  </div>
                ))}
              </div>
            )}
            {analysis.accent_notes && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#a855f7", letterSpacing: 1, marginBottom: 8 }}>PRONUNCIATION NOTES</div>
                <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.5 }}>{analysis.accent_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── B2 TOPICS MODULE ─────────────────────────────────────────────────────────

function TopicsModule({ profile }) {
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const completed = profile?.completedTopics || [];

  async function startTopic(topic) {
    setSelected(topic);
    setMessages([]);
    setLoading(true);
    const SYSTEM = `You are an English coach teaching "${topic.label}" to a B1 learner going to B2. Start with a natural, interesting mini-lesson (not a grammar lecture). Show real examples from everyday speech. Then ask the learner a question that makes them USE the topic immediately. Keep it conversational and under 150 words.`;
    const reply = await callOpenAI([{ role: "user", content: "Start the lesson." }], SYSTEM);
    setMessages([{ role: "assistant", content: reply }]);
    setLoading(false);
  }

  async function send() {
    if (!input.trim() || !selected || loading) return;
    const SYSTEM = `You are teaching "${selected.label}" to a B1→B2 English learner. Continue the lesson conversationally. Correct gently, explain briefly, always ask a follow-up to make them practice more. Max 120 words.`;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    const reply = await callOpenAI(newMsgs, SYSTEM);
    setMessages([...newMsgs, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  if (selected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>←</button>
          <span style={{ fontSize: 18 }}>{selected.icon}</span>
          <span style={{ color: "#fff", fontWeight: 700 }}>{selected.label}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "78%",
              background: m.role === "user" ? "#6366f1" : "#141414",
              border: m.role === "user" ? "none" : "1px solid #222",
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "10px 14px",
              fontSize: 14, lineHeight: 1.6,
              color: m.role === "user" ? "#fff" : "#ccc",
              whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          ))}
          {loading && <div style={{ padding: "10px 14px", background: "#141414", border: "1px solid #222", borderRadius: "16px 16px 16px 4px", alignSelf: "flex-start" }}><Spinner /></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 24px 20px", borderTop: "1px solid #1e1e1e" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Reply in English..." style={inputStyle} />
            <button onClick={send} disabled={loading || !input.trim()} style={btnStyle("#6366f1", { padding: "0 16px", flexShrink: 0 })}>→</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid #1e1e1e" }}>
        <Badge text="B1 → B2 ROADMAP" color="#a855f7" />
        <h2 style={{ margin: "8px 0 4px", fontSize: 17, fontWeight: 800, color: "#fff" }}>13 Topics to Master</h2>
        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Tap any topic to start a mini-lesson.</p>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
        {B2_TOPICS.map((t) => {
          const done = completed.includes(t.id);
          return (
            <button key={t.id} onClick={() => startTopic(t)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: done ? "#0d1a0d" : "#0d0d0d",
              border: `1px solid ${done ? "#22c55e33" : "#1e1e1e"}`,
              borderRadius: 10, textAlign: "left", cursor: "pointer",
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: done ? "#22c55e" : "#ccc" }}>{t.label}</div>
              </div>
              {done && <span style={{ color: "#22c55e", fontSize: 12 }}>✓</span>}
              <span style={{ color: "#333", fontSize: 12 }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ profile, stats }) {
  const totalSessions = stats?.sessions || 0;
  const level = totalSessions < 5 ? "B1" : totalSessions < 15 ? "B1+" : totalSessions < 30 ? "B2-" : "B2";
  const progress = Math.min(100, Math.floor((totalSessions / 40) * 100));

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "24px 24px 16px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#555", letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>YOUR PROGRESS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ProgressRing percent={progress} size={72} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{level}</div>
              <div style={{ fontSize: 12, color: "#555" }}>Current estimated level</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Day Streak", value: stats?.streak || 0, icon: "🔥", color: "#f97316" },
            { label: "Sessions", value: totalSessions, icon: "⚡", color: "#6366f1" },
          ].map((s, i) => (
            <div key={i} style={{ padding: 14, background: "#0d0d0d", border: `1px solid ${s.color}22`, borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0d0d1a", border: "1px solid #6366f133", borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: 1, marginBottom: 8 }}>TODAY'S PLAN</div>
          {["Speaking", "Writing", "Reading", "Listening"].map((skill, i) => {
            const done = stats?.todayDone?.[skill.toLowerCase()];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: done ? "#22c55e" : "#333" }} />
                <span style={{ fontSize: 13, color: done ? "#22c55e" : "#666" }}>{skill}</span>
                {done && <span style={{ fontSize: 11, color: "#22c55e" }}>done ✓</span>}
              </div>
            );
          })}
        </div>

        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: 1, marginBottom: 10 }}>B1 → B2 DAILY HABITS</div>
          {[
            "10 min of active speaking (aloud, not in your head)",
            "Write at least 100 words in English",
            "Read one article and note 3 expressions",
            "15 min listening + 5 min shadowing",
            "Review 5 words from previous sessions",
          ].map((h, i) => (
            <div key={i} style={{ fontSize: 12, color: "#666", marginBottom: 5 }}>• {h}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const btnStyle = (bg, extra = {}) => ({
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  transition: "opacity 0.2s",
  ...extra,
});

const inputStyle = {
  flex: 1,
  background: "#0d0d0d",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  color: "#fff",
  outline: "none",
  fontFamily: "inherit",
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "home", label: "Home", icon: "⚡" },
  { id: "speaking", label: "Speaking", icon: "🎙️" },
  { id: "writing", label: "Writing", icon: "✍️" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "listening", label: "Listening", icon: "🎧" },
  { id: "topics", label: "B2 Topics", icon: "🗺️" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [profile, setProfile] = useState(() => loadState("b2_profile", { weaknesses: [], completedTopics: [] }));
  const [stats, setStats] = useState(() => loadState("b2_stats", { streak: 1, sessions: 0, todayDone: {} }));

  function handleUpdate(event) {
    const today = new Date().toDateString();
    setStats((prev) => {
      const updated = {
        ...prev,
        sessions: (prev.sessions || 0) + 1,
        todayDone: { ...prev.todayDone, [event.type?.replace("_done", "")]: true },
        lastDate: today,
        streak: prev.lastDate === today ? prev.streak : (prev.streak || 0) + 1,
      };
      saveState("b2_stats", updated);
      return updated;
    });
    if (event.weaknesses) {
      setProfile((prev) => {
        const updated = { ...prev, weaknesses: [...(prev.weaknesses || []), ...event.weaknesses].slice(-20) };
        saveState("b2_profile", updated);
        return updated;
      });
    }
  }

  return (
    <div style={{
      background: "#080808",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap'); * { box-sizing: border-box; } body { margin: 0; background: #080808; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #080808; } ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; } @keyframes spin { to { transform: rotate(360deg); } } button:hover { opacity: 0.85 !important; } button:disabled { opacity: 0.4 !important; cursor: not-allowed !important; } textarea:focus, input:focus { border-color: #333 !important; }`}</style>

      {/* Header */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, fontWeight: 700 }}>FLUENCY TRAINER</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>B1 → B2</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20 }}>🔥</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>{stats.streak} day{stats.streak !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: "flex", overflowX: "auto", padding: "12px 16px 0", gap: 4, scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            ...btnStyle(tab === t.id ? "#f97316" : "#111", { padding: "7px 14px", fontSize: 12, flexShrink: 0 }),
            border: `1px solid ${tab === t.id ? "#f97316" : "#222"}`,
            color: tab === t.id ? "#fff" : "#555",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, marginTop: 12, overflowY: "hidden", display: "flex", flexDirection: "column", minHeight: 0, height: "calc(100vh - 120px)" }}>
        {tab === "home" && <Dashboard profile={profile} stats={stats} />}
        {tab === "speaking" && <SpeakingModule profile={profile} onUpdate={handleUpdate} />}
        {tab === "writing" && <WritingModule profile={profile} onUpdate={handleUpdate} />}
        {tab === "reading" && <ReadingModule profile={profile} />}
        {tab === "listening" && <ListeningModule />}
        {tab === "topics" && <TopicsModule profile={profile} />}
      </div>
    </div>
  );
}
