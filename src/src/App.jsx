```jsx
import { useState, useEffect, useRef } from "react";

const TABS = [
  { id: "home", label: "Home", icon: "⚡" },
  { id: "speaking", label: "Speaking", icon: "🎙️" },
  { id: "writing", label: "Writing", icon: "✍️" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "listening", label: "Listening", icon: "🎧" },
];

const SPEAKING_TOPICS = [
  "An unpopular opinion you genuinely hold",
  "A decision you made that surprised even yourself",
  "Something that's considered normal but you find strange",
  "A time you felt completely out of place",
  "What success actually means to you right now",
];

const READING_SOURCES = [
  {
    title: "BBC Future",
    url: "https://www.bbc.com/future",
    tag: "Science",
  },
  {
    title: "The Atlantic",
    url: "https://www.theatlantic.com",
    tag: "Society",
  },
];

const LISTENING_SOURCES = [
  {
    title: "Hidden Brain",
    platform: "Spotify / Apple",
    tag: "Psychology",
  },
  {
    title: "TED Talks Daily",
    platform: "Spotify / Apple",
    tag: "Ideas",
  },
];

function Badge({ text, color = "#f97316" }) {
  return (
    <span
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 6,
        padding: "4px 8px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {text}
    </span>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>🔥 Your B1 → B2 Journey</h2>
        <p style={{ color: "#888", lineHeight: 1.6 }}>
          Practice every day using speaking, writing, reading and listening.
        </p>
      </div>

      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3>Daily Habits</h3>

        <ul style={{ color: "#888", lineHeight: 1.8 }}>
          <li>10 minutes speaking aloud</li>
          <li>Write 100+ words</li>
          <li>Read one article</li>
          <li>Shadow audio for pronunciation</li>
        </ul>
      </div>
    </div>
  );
}

function SpeakingModule() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);

  const topic =
    SPEAKING_TOPICS[new Date().getDate() % SPEAKING_TOPICS.length];

  function startConversation() {
    setStarted(true);

    setMessages([
      {
        role: "assistant",
        content: `Let's talk about: "${topic}". What do you think?`,
      },
    ]);
  }

  function sendMessage() {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      {
        role: "assistant",
        content:
          "Interesting answer! Can you explain that in more detail?",
      },
    ]);

    setInput("");
  }

  return (
    <div style={{ padding: 24 }}>
      <Badge text="SPEAKING" color="#f97316" />

      <h2>{topic}</h2>

      {!started && (
        <button onClick={startConversation} style={buttonStyle("#f97316")}>
          Start Conversation
        </button>
      )}

      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf:
                m.role === "user" ? "flex-end" : "flex-start",
              background:
                m.role === "user" ? "#f97316" : "#111",
              border: "1px solid #222",
              borderRadius: 12,
              padding: "10px 14px",
              maxWidth: "80%",
            }}
          >
            {m.content}
          </div>
        ))}
      </div>

      {started && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 20,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reply in English..."
            style={inputStyle}
          />

          <button
            onClick={sendMessage}
            style={buttonStyle("#f97316")}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

function WritingModule() {
  const [text, setText] = useState("");

  return (
    <div style={{ padding: 24 }}>
      <Badge text="WRITING" color="#6366f1" />

      <h2>Daily Writing</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write about your day in English..."
        style={{
          ...inputStyle,
          height: 180,
          resize: "vertical",
          width: "100%",
          marginTop: 16,
        }}
      />

      <button
        style={{
          ...buttonStyle("#6366f1"),
          marginTop: 16,
        }}
      >
        Get Feedback
      </button>
    </div>
  );
}

function ReadingModule() {
  return (
    <div style={{ padding: 24 }}>
      <Badge text="READING" color="#22c55e" />

      <h2>Recommended Reading</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 20,
        }}
      >
        {READING_SOURCES.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#111",
              border: "1px solid #222",
              borderRadius: 10,
              padding: 16,
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div>{item.title}</div>

            <div
              style={{
                marginTop: 8,
              }}
            >
              <Badge text={item.tag} color="#22c55e" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ListeningModule() {
  return (
    <div style={{ padding: 24 }}>
      <Badge text="LISTENING" color="#eab308" />

      <h2>Listening Practice</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 20,
        }}
      >
        {LISTENING_SOURCES.map((item, i) => (
          <div
            key={i}
            style={{
              background: "#111",
              border: "1px solid #222",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {item.title}
            </div>

            <div style={{ color: "#666", marginTop: 6 }}>
              {item.platform}
            </div>

            <div style={{ marginTop: 10 }}>
              <Badge text={item.tag} color="#eab308" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const buttonStyle = (bg) => ({
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
});

const inputStyle = {
  flex: 1,
  background: "#111",
  border: "1px solid #222",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#fff",
  outline: "none",
};

export default function App() {
  const [tab, setTab] = useState("home");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#666",
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          FLUENCY TRAINER
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            marginTop: 4,
          }}
        >
          B1 → B2
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          padding: 16,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...buttonStyle(
                tab === t.id ? "#f97316" : "#111"
              ),
              border:
                tab === t.id
                  ? "1px solid #f97316"
                  : "1px solid #222",
              color:
                tab === t.id ? "#fff" : "#666",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "home" && <Dashboard />}
      {tab === "speaking" && <SpeakingModule />}
      {tab === "writing" && <WritingModule />}
      {tab === "reading" && <ReadingModule />}
      {tab === "listening" && <ListeningModule />}
    </div>
  );
}
```
