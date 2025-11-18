import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

/**
 * HealthTalk - Frontend (clean white + pink accent)
 * - Left sidebar: Trusted Sources, Emergency, Instructions (collapsible)
 * - Right sidebar: Quick SRHR Topics (collapsible)
 * - Welcome floating toast
 * - Voice-to-text (Web Speech API fallback gracefully)
 * - Send on Enter, Shift+Enter for newline
 * - Typing animation
 */

const API_BASE = "http://localhost:5000"; // change only if your backend runs on a different port

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋 — I'm HealthTalk. Ask anything about sexual & reproductive health.",
      id: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Quick SRHR topics for the right sidebar
  const quickTopics = [
    { key: "contraception", title: "Contraception methods", text: "Explain contraception methods in simple terms." },
    { key: "sti", title: "STI prevention", text: "How can someone prevent STIs? Give simple, practical advice." },
    { key: "menstrual", title: "Menstrual health", text: "Explain menstrual health in a friendly and clear way." },
    { key: "emergency", title: "Emergency contraception", text: "What is emergency contraception and when should it be used?" },
    { key: "pregnancy", title: "Pregnancy info", text: "Give important pregnancy information for young women." },
  ];

  // Trusted sources for left sidebar
  const trustedSources = [
    { title: "WHO - Sexual Health", url: "https://www.who.int/health-topics/sexual-health" },
    { title: "UNFPA - SRHR", url: "https://www.unfpa.org/sexual-reproductive-health" },
    { title: "Planned Parenthood", url: "https://www.plannedparenthood.org" },
    { title: "CDC - Reproductive Health", url: "https://www.cdc.gov/reproductivehealth/" },
  ];

  // send message — accepts optional forced message (used by quick topics)
  const sendMessage = async (forcedText = null) => {
    const text = (forcedText ?? input).trim();
    if (!text) return;

    const userMsg = { role: "user", content: text, id: Date.now() + Math.random() };
    // add user locally
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${resp.status}`);
      }

      const data = await resp.json();
      const replyText = (data.reply || data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.");

      // ensure spacing / newlines are preserved by ReactMarkdown
      const assistantMsg = { role: "assistant", content: replyText, id: Date.now() + Math.random() };
      setMessages((m) => [...m, assistantMsg]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Server error — please make sure backend is running.", id: Date.now() + Math.random() }]);
    } finally {
      setIsTyping(false);
    }
  };

  // handle enter key: send on Enter, allow Shift+Enter for newline
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // quick topic click -> auto-send
  const handleQuickTopic = (topic) => {
    sendMessage(topic.text);
  };

  // Voice to text: simple Web Speech API wrapper (graceful fallback)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = "en-GB";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        setInput((cur) => (cur ? cur + " " + spoken : spoken));
      };
      rec.onerror = (e) => {
        console.warn("Speech error", e);
      };
      rec.onend = () => {
        setListening(false);
      };

      recognitionRef.current = rec;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        console.warn("Could not start speech recognition", e);
      }
    }
  };

  return (
    <div className="app-root">
      {/* Floating welcome toast */}
      {showWelcome && (
        <div className="welcome-toast">
          <div>
            <strong>Welcome to HealthTalk 💗</strong>
            <div className="small">Quick, private SRHR answers — click a topic or ask anything.</div>
          </div>
          <button className="tiny" onClick={() => setShowWelcome(false)}>Close</button>
        </div>
      )}

      {/* Left sidebar */}
      <aside className={`left-sidebar ${leftOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h4>Trusted Sources</h4>
          <button className="collapse-btn" onClick={() => setLeftOpen(!leftOpen)}>{leftOpen ? "⟨" : "⟩"}</button>
        </div>

        {leftOpen && (
          <>
            <ul className="sources-list">
              {trustedSources.map((s, i) => (
                <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>
              ))}
            </ul>

            <div className="emergency">
              <h5>Emergency Help</h5>
              <p>If someone is in danger, call local emergency services immediately.</p>
              <p><strong>Kenya:</strong> 999 / 112</p>
            </div>

            <div className="instructions">
              <h5>App instructions</h5>
              <ol>
                <li>Type your question and press <strong>Enter</strong> or click <em>Send</em>.</li>
                <li>Use quick topics on the right to auto-send common questions.</li>
                <li>Use voice input (mic) to speak your question.</li>
              </ol>
            </div>
          </>
        )}
      </aside>

      {/* Main content */}
      <main className="main-area">
        <header className="main-header">
          <div className="brand">
            <div className="logo">💗</div>
            <div>
              <h1 className="app-title">HealthTalk</h1>
              <div className="subtitle">Your SRHR AI assistant</div>
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => { setMessages([{ role: "assistant", content: "Hello 👋 — I'm HealthTalk. Ask anything about sexual & reproductive health.", id: Date.now() }]); }}>
              ↺ Reset
            </button>
            <button className="icon-btn" onClick={() => setLeftOpen(!leftOpen)}>{leftOpen ? "Hide sources" : "Show sources"}</button>
          </div>
        </header>

        <section className="chat-area">
          <div className="chat-window">
            {messages.map((m) => (
              <div key={m.id} className={`message-row ${m.role === "user" ? "from-user" : "from-bot"}`}>
                <div className={`avatar ${m.role === "user" ? "user" : "bot"}`}>
                  {m.role === "user" ? "🧑" : "🤖"}
                </div>
                <div className="bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row from-bot typing-row">
                <div className="avatar bot">🤖</div>
                <div className="bubble typing">
                  <span className="dot" /> <span className="dot" /> <span className="dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="composer">
            <div className="left-composer">
              <button className={`mic-btn ${listening ? "listening" : ""}`} onClick={toggleListening} title="Voice input">
                🎤
              </button>
            </div>

            <textarea
              className="text-input"
              rows={2}
              placeholder="Ask anything about SRHR..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />

            <div className="right-composer">
              <button className="send-btn" onClick={() => sendMessage()}>Send</button>
              <button className="clear-btn" onClick={() => { setInput(""); }}>Clear</button>
            </div>
          </div>
        </section>
      </main>

      {/* Right sidebar */}
      <aside className={`right-sidebar ${rightOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h4>Quick SRHR Topics</h4>
          <button className="collapse-btn" onClick={() => setRightOpen(!rightOpen)}>{rightOpen ? "⟩" : "⟨"}</button>
        </div>

        {rightOpen && (
          <div className="topics">
            {quickTopics.map((t) => (
              <button key={t.key} className="topic-btn" onClick={() => handleQuickTopic(t)}>{t.title}</button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

export default App;
