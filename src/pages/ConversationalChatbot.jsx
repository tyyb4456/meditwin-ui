import { useState, useRef, useEffect } from "react";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, ChevronRight, Send, X, Loader2, Wrench,
    CheckCircle2, AlertCircle, MessageSquare, Zap, User, Bot, Wifi,
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

// ── Color tokens ────────────────────────────────────────────────────────────
const ACCENT  = "var(--color-accent)";
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const EMERALD = "#10B981";
const CYAN    = "#06B6D4";
const PURPLE  = "#8B5CF6";
const RED     = "#EF4444";
const GREEN   = "#22C55E";

// ── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes pulse   { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes blink   { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    input:focus, textarea:focus, select:focus { border-color: #10B981 !important; outline: none; }
    input::placeholder, textarea::placeholder { color: var(--color-text-subtle); opacity: 0.7; }
`;

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
const BREADCRUMBS = [
    { label: "Dashboard", path: "/dashboard" },
];

// ── Suggestion chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
    "Tell me about patient 7b9146b3-8b1b-4cf9-af36-530d8c4fcf05",
    "Analyze the labs for this patient",
    "What is the mechanism of action of azithromycin?",
    "Explore potential diagnoses",
    "Is the current medication safe for this patient?",
];

// ── Tool badge ────────────────────────────────────────────────────────────────
function ToolBadge({ event }) {
    const isComplete = event.type === "tool_complete";
    const isError    = event.type === "tool_error";
    const isStart    = event.type === "tool_start";
    const color      = isComplete ? GREEN : isError ? RED : CYAN;

    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 9px", borderRadius: 20,
            background: `${color}15`, border: `1px solid ${color}30`,
            fontSize: 10, color,
            animation: isStart ? "pulse 2s infinite" : "none",
        }}>
            {isStart    && <Loader2 size={9} style={{ animation: "spin 1s linear infinite" }} />}
            {isComplete && <CheckCircle2 size={9} />}
            {isError    && <AlertCircle size={9} />}
            <span style={{ fontWeight: 700 }}>
                {isStart ? `Calling ${event.tool}…` : isComplete ? `${event.tool} done` : event.tool}
            </span>
        </div>
    );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
    const isUser = msg.role === "user";

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            gap: 6, animation: "fadeIn 0.3s ease",
        }}>
            {/* Tool chips */}
            {!isUser && msg.toolEvents?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingLeft: 38 }}>
                    {msg.toolEvents.map((e, i) => <ToolBadge key={i} event={e} />)}
                </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, maxWidth: "80%" }}>
                {!isUser && (
                    <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: `linear-gradient(135deg, ${EMERALD} 0%, rgba(16,185,129,0.55) 100%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: `0 4px 12px ${EMERALD}30`,
                    }}>
                        <Bot size={14} color="#fff" strokeWidth={1.75} />
                    </div>
                )}

                <div style={{
                    padding: "11px 15px",
                    background: isUser ? `linear-gradient(135deg, ${EMERALD}, rgba(16,185,129,0.8))` : SURFACE,
                    border: `1px solid ${isUser ? EMERALD : BORDER}`,
                    borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                    color: isUser ? "#fff" : TEXT,
                    fontSize: 14, lineHeight: 1.65,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    boxShadow: isUser ? `0 4px 16px ${EMERALD}25` : "none",
                }}>
                    {msg.content || (msg.streaming && (
                        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                            <span style={{ color: MUTED, fontSize: 12 }}>Thinking…</span>
                        </span>
                    ))}
                    {msg.streaming && msg.content && (
                        <span style={{
                            display: "inline-block", width: 2, height: 13,
                            background: EMERALD, marginLeft: 2,
                            animation: "blink 0.8s step-end infinite",
                            verticalAlign: "middle",
                        }} />
                    )}
                </div>

                {isUser && (
                    <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: `${EMERALD}20`, border: `1px solid ${EMERALD}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <User size={14} color={EMERALD} strokeWidth={1.75} />
                    </div>
                )}
            </div>

            {/* Mode badge */}
            {!isUser && msg.mode && !msg.streaming && (
                <div style={{ paddingLeft: 38 }}>
                    <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                        textTransform: "uppercase", padding: "2px 8px",
                        background: msg.mode === "patient_specific" ? `${CYAN}15` : `${PURPLE}15`,
                        color: msg.mode === "patient_specific" ? CYAN : PURPLE,
                        border: `1px solid ${msg.mode === "patient_specific" ? CYAN : PURPLE}30`,
                        borderRadius: 4,
                    }}>
                        {msg.mode === "patient_specific" ? "🔬 Patient-Specific" : "🧠 General Knowledge"}
                    </span>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ConversationalChatbot() {
    const navigate = useNavigate();
    const [messages,   setMessages]   = useState([]);
    const [input,      setInput]      = useState("");
    const [sessionId]                 = useState(() => `session-${Date.now()}`);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error,      setError]      = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);
    const abortRef       = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── SSE stream (untouched) ────────────────────────────────────────────────
    const sendMessage = async (queryText) => {
        const q = (queryText || input).trim();
        if (!q || isStreaming) return;
        setInput("");
        setError(null);

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
            const res = await fetch(`${API.CONVERSATIVE}/query/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, session_id: sessionId }),
                signal: abortRef.current.signal,
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

            const reader = res.body.getReader();
            const dec    = new TextDecoder();
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
                                m.id === assistantId ? { ...m, content: m.content + evt.token } : m
                            ));
                        } else if (evt.type === "tool_start" || evt.type === "tool_error") {
                            setMessages(prev => prev.map(m =>
                                m.id === assistantId ? { ...m, toolEvents: [...(m.toolEvents || []), evt] } : m
                            ));
                        } else if (evt.type === "tool_complete") {
                            setMessages(prev => prev.map(m => {
                                if (m.id !== assistantId) return m;
                                const filteredEvents = (m.toolEvents || []).filter(e =>
                                    !(e.type === "tool_start" && e.tool === evt.tool)
                                );
                                return { ...m, toolEvents: [...filteredEvents, evt] };
                            }));
                        } else if (evt.type === "complete") {
                            setMessages(prev => prev.map(m =>
                                m.id === assistantId
                                    ? { ...m, content: m.content || evt.answer, streaming: false, mode: evt.mode, toolsUsed: evt.tools_called || [] }
                                    : m
                            ));
                            setIsStreaming(false);
                        } else if (evt.type === "error" && evt.fatal) {
                            setError(evt.message);
                            setMessages(prev => prev.map(m =>
                                m.id === assistantId ? { ...m, streaming: false, content: m.content || "⚠️ An error occurred." } : m
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
                    m.id === assistantId ? { ...m, streaming: false, content: m.content || "⚠️ Connection failed." } : m
                ));
                setIsStreaming(false);
            }
        }

        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m));
        setIsStreaming(false);
        inputRef.current?.focus();
    };

    const handleAbort = () => {
        abortRef.current?.abort();
        setIsStreaming(false);
        setMessages(prev => prev.map(m => m.streaming ? { ...m, streaming: false } : m));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const isEmpty = messages.length === 0;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{GLOBAL_STYLES}</style>

            {/* ── Sticky nav ── */}
            <nav style={{
                flexShrink: 0, height: 56, zIndex: 50,
                background: "color-mix(in srgb, var(--color-bg) 90%, transparent)",
                backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            background: "none", border: `1px solid ${BORDER}`, color: SUBTLE,
                            borderRadius: 7, padding: "5px 12px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                            textTransform: "uppercase", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = MUTED; }}
                        onMouseLeave={e => { e.currentTarget.style.color = SUBTLE; e.currentTarget.style.borderColor = BORDER; }}
                    >
                        <ArrowLeft size={11} /> Back
                    </button>

                    <div style={{ width: 1, height: 20, background: BORDER }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 24, height: 24, background: EMERALD, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>MT</span>
                        </div>
                        {BREADCRUMBS.map(c => (
                            <span key={c.path} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <ChevronRight size={10} color={SUBTLE} />
                                <button
                                    onClick={() => navigate(c.path)}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: SUBTLE, padding: 0, transition: "color 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.color = TEXT}
                                    onMouseLeave={e => e.currentTarget.style.color = SUBTLE}
                                >{c.label}</button>
                            </span>
                        ))}
                        <ChevronRight size={10} color={SUBTLE} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Conversational AI</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 7, padding: "4px 10px",
                    }}>
                        <Wifi size={10} color={EMERALD} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8010</span>
                    </div>
                    <div style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                        padding: "4px 10px", border: `1px solid ${EMERALD}40`, borderRadius: 7,
                        color: EMERALD, background: `${EMERALD}0E`,
                    }}>Tool Agent</div>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "4px 10px", border: `1px solid ${BORDER}`, borderRadius: 7,
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}80`, animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 10, color: MUTED, fontWeight: 700 }}>Live</span>
                    </div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── Agent hero ── */}
            <div style={{ flexShrink: 0, background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${EMERALD}, rgba(16,185,129,0.3))` }} />
                <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${EMERALD}10 0%, transparent 70%)`, pointerEvents: "none" }} />

                <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: `linear-gradient(135deg, ${EMERALD} 0%, rgba(16,185,129,0.55) 100%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 8px 24px ${EMERALD}30`,
                        }}>
                            <Bot size={22} color="#fff" strokeWidth={1.75} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: EMERALD }}>Agent 08</span>
                                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: EMERALD, border: `1px solid ${EMERALD}50`, background: `${EMERALD}0E`, padding: "1px 6px", borderRadius: 4 }}>Tool Agent</span>
                                <span style={{ fontSize: 9, color: SUBTLE, fontFamily: "monospace", border: `1px solid ${BORDER}`, padding: "1px 6px", borderRadius: 4 }}>::8010</span>
                                {isStreaming && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: EMERALD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Streaming
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, margin: 0, lineHeight: 1 }}>Conversational AI</h1>
                            <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0", maxWidth: 620 }}>
                                Agentic chatbot with tool-calling. Routes intelligently to specialist agents — ask about any patient, analyze labs, check drug safety, or explore diagnoses with real-time streaming.
                            </p>
                        </div>

                        {/* Session info */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 14px", borderRadius: 8,
                            background: BG, border: `1px solid ${BORDER}`,
                        }}>
                            <MessageSquare size={12} color={SUBTLE} />
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: SUBTLE, marginBottom: 2 }}>Session ID</div>
                                <div style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{sessionId.slice(0, 22)}…</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Messages area ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                {isEmpty ? (
                    /* Welcome screen */
                    <div style={{ maxWidth: 640, margin: "40px auto 0", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
                        <div style={{
                            width: 68, height: 68, borderRadius: 18, margin: "0 auto 20px",
                            background: `linear-gradient(135deg, ${EMERALD} 0%, rgba(16,185,129,0.55) 100%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 12px 32px ${EMERALD}30`,
                        }}>
                            <Bot size={30} color="#fff" strokeWidth={1.5} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: EMERALD, marginBottom: 10 }}>
                            Agent 08 · Tool Agent
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, marginBottom: 8, lineHeight: 1.1 }}>
                            MediTwin Conversational AI
                        </h2>
                        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>
                            Ask about any patient by their ID, analyze labs, check drug safety, explore diagnoses — or ask any general medical question. I'll route intelligently to the right specialist agents.
                        </p>

                        {/* Suggestion chips */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: SUBTLE, marginBottom: 4, textAlign: "center" }}>
                                Try asking
                            </p>
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(s)}
                                    style={{
                                        background: SURFACE, border: `1px solid ${BORDER}`,
                                        color: TEXT, padding: "11px 16px", cursor: "pointer",
                                        fontSize: 13, textAlign: "left", borderRadius: 8,
                                        transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10,
                                        animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = EMERALD; e.currentTarget.style.background = `${EMERALD}08`; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = SURFACE; }}
                                >
                                    <span style={{ color: EMERALD, fontSize: 11 }}>→</span>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
                        {messages.map(msg => (
                            <MessageBubble key={msg.id} msg={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ── Error bar ── */}
            {error && (
                <div style={{
                    flexShrink: 0, padding: "10px 24px",
                    background: `${RED}10`, borderTop: `1px solid ${RED}30`,
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    <AlertCircle size={13} color={RED} />
                    <span style={{ fontSize: 12, color: RED, flex: 1 }}>{error}</span>
                    <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: RED, display: "flex", alignItems: "center" }}>
                        <X size={13} />
                    </button>
                </div>
            )}

            {/* ── Input bar ── */}
            <div style={{
                flexShrink: 0, borderTop: `1px solid ${BORDER}`,
                padding: "16px 24px", background: SURFACE,
            }}>
                <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about a patient, diagnoses, drug safety, labs, or any medical question…"
                            rows={1}
                            style={{
                                width: "100%", resize: "none", overflow: "hidden",
                                background: BG, border: `1px solid ${BORDER}`,
                                color: TEXT, padding: "12px 16px",
                                fontSize: 14, fontFamily: "inherit",
                                outline: "none", borderRadius: 10,
                                lineHeight: 1.5, maxHeight: 120,
                                transition: "border-color 0.2s",
                            }}
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
                                padding: "12px 16px",
                                background: `${RED}12`, border: `1px solid ${RED}40`,
                                color: RED, cursor: "pointer", borderRadius: 10, flexShrink: 0,
                                display: "flex", alignItems: "center", gap: 6,
                                fontSize: 12, fontWeight: 700, transition: "all 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = `${RED}20`}
                            onMouseLeave={e => e.currentTarget.style.background = `${RED}12`}
                        >
                            <X size={14} /> Stop
                        </button>
                    ) : (
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim()}
                            style={{
                                padding: "12px 20px",
                                background: input.trim() ? `linear-gradient(135deg, ${EMERALD}, rgba(16,185,129,0.8))` : BORDER,
                                border: "none", color: "#fff",
                                cursor: input.trim() ? "pointer" : "not-allowed",
                                borderRadius: 10, flexShrink: 0,
                                display: "flex", alignItems: "center", gap: 6,
                                fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
                                transition: "all 0.2s",
                                boxShadow: input.trim() ? `0 4px 14px ${EMERALD}35` : "none",
                            }}
                            onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            <Send size={14} /> Send
                        </button>
                    )}
                </div>
                <p style={{ maxWidth: 820, margin: "8px auto 0", fontSize: 10, color: SUBTLE, textAlign: "center" }}>
                    Press{" "}
                    <kbd style={{ background: BG, border: `1px solid ${BORDER}`, padding: "1px 5px", borderRadius: 3, fontSize: 9, fontFamily: "monospace" }}>Enter</kbd>
                    {" "}to send ·{" "}
                    <kbd style={{ background: BG, border: `1px solid ${BORDER}`, padding: "1px 5px", borderRadius: 3, fontSize: 9, fontFamily: "monospace" }}>Shift+Enter</kbd>
                    {" "}for new line · AI outputs require physician review
                </p>
            </div>
        </div>
    );
}
