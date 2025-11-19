import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

/** ----------------------------------------------------------
 *  HealthTalk – SRHR Chatbot (Final Version)
 * ----------------------------------------------------------
 *  ✔ Trusted Sources (LEFT)
 *  ✔ Quick SRHR Topics (RIGHT)
 *  ✔ Emergency Help + Instructions (LEFT)
 *  ✔ Welcome toast
 *  ✔ Voice-to-text
 *  ✔ Avatars
 *  ✔ Typing animation
 *  ✔ Clean white UI with pink accents
 *  ✔ Send on Enter
 *  ✔ Works with your Render backend
 * ---------------------------------------------------------- */

const API_BASE = "https://healthtalk-srhr-chatbot.onrender.com";  
// IMPORTANT: this connects your frontend to your deployed backend

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello 👋 — I'm HealthTalk. Ask anything about sexual & reproductive health.",
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

  // QUICK TOPICS
  const quickTopics = [
    { title: "Contraception", text: "Explain contraception methods in simple terms." },
    { title: "STI prevention", text: "How can someone prevent STIs? Give simple, practical advice." },
    { title: "Menstrual health", text: "Explain menstrual health in a friendly and clear way." },
    { title: "Emergency contraception", text: "What is emergency contraception and when should it be used?" },
    { title: "Pregnancy info", text: "Give important pregnancy information for young women." },
  ];

  // TRUSTED SOURCES
  const trustedSources = [
    { title: "WHO – Sexual Health", url: "https://www.who.int/health-topics/sexual-health" },
    { title: "UNFPA – SRHR", url: "https://www.unfpa.org/sexual-reproductive-health" },
    { title: "Planned Parenthood", url: "https://www.plannedparenthood.org" },
    { title: "CDC – Reproductive Health", url: "https://www.cdc.gov/reproductivehealth/" },
  ];

  // SEND MESSAGE
  const sendMessage = async (forcedText = null) => {
    const text = (forcedText ?? input).trim();
    if (!text) return;

    const userMsg = { role: "user", content: text, id: Date.now() + Math.random() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await resp.json();
      const reply = data.reply || "Sorry, I couldn’t generate a response.";

      setMessages((m) => [...m, { role: "assistant", content: reply, id: Date.now() + Math.random() }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Server error — please try again later.", id: Date.now() + Math.random() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ENTER KEY HANDLER
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // CLICK QUICK TOPIC
  const handleQuickTopic = (topic) => {
    sendMessage(topic.text);
  };

  // VOICE INPUT
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input not supported.");

    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = "en-GB";
      rec.onresult = (event) => {
        setInput((prev) => prev + " " + event.results[0][0].transcript);
      };
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="app-root">

      {/* WELCOME TOAST */}
      {showWelcome && (
        <div className="welcome-toast">
          <div>
            <strong>Welcome to HealthTalk 💗</strong>
            <p className="small">Quick, private SRHR answers — ask anything.</p>
          </div>
          <button className="tiny" onClick={() => setShowWelcome(false)}>✖</button>
        </div>
      )}

      {/* LEFT SIDEBAR */}
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
              <p>If someone is in danger, call:</p>
              <p><strong>Kenya:</strong> 999 / 112</p>
            </div>

            <div className="instructions">
              <h5>How to use</h5>
              <ol>
                <li>Type and press Enter</li>
                <li>Use quick topics (right side)</li>
                <li>Use microphone for voice input</li>
              </ol>
            </div>
          </>
        )}
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="main-area">

        {/* HEADER */}
        <header className="main-header">
          <div className="brand">
            <div className="logo">💗</div>
            <div>
              <h1 className="app-title">HealthTalk</h1>
              <div className="subtitle">Your SRHR AI assistant</div>
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn" onClick={() =>
              setMessages([
                {
                  role: "assistant",
                  content:
                    "Hello 👋 — I'm HealthTalk. Ask anything about sexual & reproductive health.",
                  id: Date.now(),
                },
              ])
            }>
              ↺ Reset
            </button>
          </div>
        </header>

        {/* CHAT WINDOW */}
        <section className="chat-area">
          <div className="chat-window">
            {messages.map((m) => (
              <div key={m.id} className={`message-row ${m.role === "user" ? "from-user" : "from-bot"}`}>
                <div className={`avatar ${m.role === "user" ? "user" : "bot"}`}>
                  {m.role === "user" ? "🧑" : "🤖"}
                </div>

                <div className="bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row from-bot typing-row">
                <div className="avatar bot">🤖</div>
                <div className="bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* MESSAGE BOX */}
          <div className="composer">
            <button className={`mic-btn ${listening ? "listening" : ""}`} onClick={toggleListening}>
              🎤
            </button>

            <textarea
              className="text-input"
              placeholder="Ask anything about SRHR…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />

            <button className="send-btn" onClick={() => sendMessage()}>Send</button>
          </div>
        </section>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className={`right-sidebar ${rightOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h4>Quick Topics</h4>
          <button className="collapse-btn" onClick={() => setRightOpen(!rightOpen)}>
            {rightOpen ? "⟩" : "⟨"}
          </button>
        </div>

        {rightOpen && (
          <div className="topics">
            {quickTopics.map((t, i) => (
              <button key={i} className="topic-btn" onClick={() => handleQuickTopic(t)}>
                {t.title}
              </button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

export default App;
