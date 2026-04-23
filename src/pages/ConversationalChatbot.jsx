import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Send, X, Loader2, Wrench,
  CheckCircle2, AlertCircle, MessageSquare, Zap, User, Bot
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

const C = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  border: "var(--color-border)",
  accent: "var(--color-accent)",
  text: "var(--color-text)",
  muted: "var(--color-text-subtle)",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#EAB308",
  cyan: "#06B6D4",
  purple: "#8b5cf6",
};

function ToolBadge({ event }) {
  const isStart = event.type === "tool_start";
  const isComplete = event.type === "tool_complete";
  const isError = event.type === "tool_error";
  const color = isComplete ? C.green : isError ? C.red : C.cyan;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      fontSize: 11, color,
      animation: isStart ? "pulse 2s infinite" : "none",
    }}>
      {isStart && <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />}
      {isComplete && <CheckCircle2 size={10} />}
      {isError && <AlertCircle size={10} />}
      <span style={{ fontWeight: 700 }}>
        {isStart ? `Calling ${event.tool}…` : isComplete ? `${event.tool} done` : event.tool}
      </span>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      gap: 6,
    }}>
      {/* Tool activity chips (only on assistant messages) */}
      {!isUser && msg.toolEvents?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingLeft: 36 }}>
          {msg.toolEvents.map((e, i) => <ToolBadge key={i} event={e} />)}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, maxWidth: "80%" }}>
        {!isUser && (
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: `${C.accent}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bot size={14} color={C.accent} />
          </div>
        )}

        <div style={{
          padding: "12px 16px",
          background: isUser ? C.accent : C.surface,
          border: `1px solid ${isUser ? C.accent : C.border}`,
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          color: isUser ? "#fff" : C.text,
          fontSize: 14, lineHeight: 1.65,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.content || (msg.streaming && (
            <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
              <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ color: C.muted, fontSize: 12 }}>Thinking…</span>
            </span>
          ))}
          {msg.streaming && msg.content && (
            <span style={{
              display: "inline-block", width: 2, height: 14,
              background: C.accent, marginLeft: 2,
              animation: "blink 0.8s step-end infinite",
              verticalAlign: "middle",
            }} />
          )}
        </div>

        {isUser && (
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: `${C.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <User size={14} color={C.accent} />
          </div>
        )}
      </div>

      {/* Mode badge for completed assistant messages */}
      {!isUser && msg.mode && !msg.streaming && (
        <div style={{ paddingLeft: 36 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", padding: "2px 7px",
            background: msg.mode === "patient_specific" ? `${C.cyan}15` : `${C.purple}15`,
            color: msg.mode === "patient_specific" ? C.cyan : C.purple,
            border: `1px solid ${msg.mode === "patient_specific" ? C.cyan : C.purple}30`,
            borderRadius: 10,
          }}>
            {msg.mode === "patient_specific" ? "🔬 Patient-Specific" : "🧠 General Knowledge"}
          </span>
        </div>
      )}
    </div>
  );
}

const SUGGESTIONS = [
  "Tell me about patient 7b9146b3-8b1b-4cf9-af36-530d8c4fcf05",
  "Analyze the labs for this patient",
  "What is the mechanism of action of azithromycin?",
  "Explore potential diagnoses",
  "Is the current medication safe for this patient?",
];

export default function ConversationalChatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (queryText) => {
    const q = (queryText || input).trim();
    if (!q || isStreaming) return;
    setInput("");
    setError(null);

    // Add user message
    const userMsg = { role: "user", content: q, id: Date.now() };
    const assistantId = Date.now() + 1;
    const assistantMsg = {
      role: "assistant", content: "", streaming: true,
      toolEvents: [], mode: null, id: assistantId,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("http://127.0.0.1:8010/query/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, session_id: sessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") { setIsStreaming(false); break; }
          try {
            const evt = JSON.parse(raw);

            if (evt.type === "llm_token") {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + evt.token }
                  : m
              ));
            } else if (evt.type === "tool_start" || evt.type === "tool_error") {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, toolEvents: [...(m.toolEvents || []), evt] }
                  : m
              ));
            } else if (evt.type === "tool_complete") {
              setMessages(prev => prev.map(m => {
                if (m.id !== assistantId) return m;
                // Remove the start event for this tool, and add the complete event
                const filteredEvents = (m.toolEvents || []).filter(e => 
                  !(e.type === "tool_start" && e.tool === evt.tool)
                );
                return { ...m, toolEvents: [...filteredEvents, evt] };
              }));
            } else if (evt.type === "complete") {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? {
                    ...m,
                    content: evt.answer || m.content,
                    streaming: false,
                    mode: evt.mode,
                    toolsUsed: evt.tools_called || [],
                  }
                  : m
              ));
              setIsStreaming(false);
            } else if (evt.type === "error" && evt.fatal) {
              setError(evt.message);
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, streaming: false, content: m.content || "⚠️ An error occurred." }
                  : m
              ));
              setIsStreaming(false);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, streaming: false, content: m.content || "⚠️ Connection failed." }
            : m
        ));
        setIsStreaming(false);
      }
    }

    // Ensure streaming flag is cleared
    setMessages(prev => prev.map(m =>
      m.id === assistantId ? { ...m, streaming: false } : m
    ));
    setIsStreaming(false);
    inputRef.current?.focus();
  };

  const handleAbort = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages(prev => prev.map(m =>
      m.streaming ? { ...m, streaming: false } : m
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      {/* NAV */}
      <div style={{
        flexShrink: 0, height: 56,
        background: `color-mix(in srgb, ${C.bg} 90%, transparent)`,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none", border: `1px solid ${C.border}`,
              color: C.muted, padding: "5px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.muted; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
          >
            <ArrowLeft size={11} /> Back
          </button>

          <div style={{ width: 1, height: 20, background: C.border }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
              <span style={{ color: C.bg, fontSize: 9, fontWeight: 900 }}>MT</span>
            </div>
            {[{ label: "MediTwin AI", path: "/" }, { label: "Dashboard", path: "/dashboard" }].map(c => (
              <span key={c.path} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                <button onClick={() => navigate(c.path)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = C.text}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}
                >{c.label}</button>
              </span>
            ))}
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text }}>Conversational AI</span>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", border: `1px solid ${C.border}`, fontSize: 11 }}>
            <Zap size={10} color={C.accent} />
            <span style={{ color: C.muted, fontFamily: "monospace" }}>:8010</span>
          </div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${C.border}`, color: C.accent }}>
            Tool Agent
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", border: `1px solid ${C.border}` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}80`, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>Live</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* SESSION BANNER */}
      <div style={{
        flexShrink: 0, padding: "6px 24px",
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <MessageSquare size={11} color={C.muted} />
        <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>session: {sessionId}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: C.muted }}>Conversation memory active · Session persists across messages</span>
      </div>

      {/* MESSAGES AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {isEmpty ? (
          /* Welcome screen */
          <div style={{ maxWidth: 640, margin: "60px auto 0", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: `${C.accent}15`, border: `1px solid ${C.accent}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Bot size={28} color={C.accent} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: C.text, marginBottom: 8 }}>
              MediTwin Conversational AI
            </h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 32 }}>
              Ask about any patient by their ID, analyze labs, check drug safety, explore diagnoses — or ask any general medical question. I'll route intelligently to the right specialist agents.
            </p>

            {/* Suggestion chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>
                Try asking:
              </p>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    color: C.text, padding: "10px 16px", cursor: "pointer",
                    fontSize: 13, textAlign: "left", transition: "all 0.2s",
                    borderRadius: 8,
                    animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = `${C.accent}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ animation: "fadeUp 0.3s ease" }}>
                <MessageBubble msg={msg} />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ERROR BAR */}
      {error && (
        <div style={{
          flexShrink: 0, padding: "10px 24px",
          background: `${C.red}12`, borderTop: `1px solid ${C.red}30`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={13} color={C.red} />
          <span style={{ fontSize: 12, color: C.red }}>{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: C.red }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* INPUT BAR */}
      <div style={{
        flexShrink: 0, borderTop: `1px solid ${C.border}`,
        padding: "16px 24px",
        background: C.surface,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a patient, diagnoses, drug safety, labs, or any medical question…"
              rows={1}
              style={{
                width: "100%", resize: "none", overflow: "hidden",
                background: C.bg, border: `1px solid ${C.border}`,
                color: C.text, padding: "12px 16px",
                fontSize: 14, fontFamily: "inherit",
                outline: "none", borderRadius: 12,
                lineHeight: 1.5, maxHeight: 120,
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              disabled={isStreaming}
            />
          </div>

          {isStreaming ? (
            <button
              onClick={handleAbort}
              style={{
                padding: "12px 16px", background: `${C.red}15`,
                border: `1px solid ${C.red}40`, color: C.red,
                cursor: "pointer", borderRadius: 12, flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700,
              }}
            >
              <X size={14} /> Stop
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              style={{
                padding: "12px 20px",
                background: input.trim() ? C.accent : C.border,
                border: "none", color: "#fff",
                cursor: input.trim() ? "pointer" : "not-allowed",
                borderRadius: 12, flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <Send size={14} /> Send
            </button>
          )}
        </div>
        <p style={{ maxWidth: 800, margin: "8px auto 0", fontSize: 10, color: C.muted, textAlign: "center" }}>
          Press <kbd style={{ background: C.border, padding: "1px 5px", borderRadius: 3, fontSize: 10 }}>Enter</kbd> to send · <kbd style={{ background: C.border, padding: "1px 5px", borderRadius: 3, fontSize: 10 }}>Shift+Enter</kbd> for new line · AI outputs require physician review
        </p>
      </div>
    </div>
  );
}
