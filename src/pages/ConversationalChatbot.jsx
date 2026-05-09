import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, ChevronRight, Send, X, Loader2,
    CheckCircle2, AlertCircle, MessageSquare, User, Bot, Wifi,
    Plus, Trash2, PanelLeftClose, PanelLeftOpen, Clock,
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

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

const CONV_API = `${API.CONVERSATIVE}/conversations`;

const GLOBAL_STYLES = `
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes pulse   { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes blink   { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
    @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    input:focus, textarea:focus { border-color: #10B981 !important; outline: none; }
    input::placeholder, textarea::placeholder { color: var(--color-text-subtle); opacity: 0.7; }

    .md-body { font-size: 14px; line-height: 1.75; color: var(--color-text); word-break: break-word; }
    .md-body p  { margin: 0 0 10px; }
    .md-body p:last-child { margin-bottom: 0; }
    .md-body h1,.md-body h2,.md-body h3,.md-body h4 {
        font-weight: 800; letter-spacing: -0.02em; margin: 16px 0 8px;
        color: var(--color-text); line-height: 1.2;
    }
    .md-body h1 { font-size: 18px; }
    .md-body h2 { font-size: 16px; }
    .md-body h3 { font-size: 14px; }
    .md-body ul, .md-body ol { margin: 6px 0 10px; padding-left: 20px; }
    .md-body li { margin-bottom: 4px; }
    .md-body strong { font-weight: 700; color: var(--color-text); }
    .md-body em { font-style: italic; opacity: 0.85; }
    .md-body code {
        font-family: monospace; font-size: 12px;
        background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
        padding: 1px 5px; border-radius: 4px; color: #10B981;
    }
    .md-body pre {
        background: rgba(0,0,0,0.25); border: 1px solid var(--color-border);
        border-radius: 8px; padding: 14px 16px; overflow-x: auto; margin: 10px 0;
    }
    .md-body pre code { background: none; border: none; padding: 0; color: #a0f0c8; }
    .md-body blockquote {
        border-left: 3px solid #10B981; margin: 10px 0;
        padding: 4px 14px; opacity: 0.8; font-style: italic;
    }
    .md-body table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    .md-body th, .md-body td { padding: 7px 12px; border: 1px solid var(--color-border); text-align: left; }
    .md-body th { background: rgba(16,185,129,0.1); font-weight: 700; }
    .md-body tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
    .md-body a { color: #10B981; text-decoration: underline; }
    .conv-item { transition: background 0.15s, border-color 0.15s; }
    .conv-item:hover { background: rgba(16,185,129,0.07) !important; border-color: rgba(16,185,129,0.3) !important; }
`;

const SUGGESTIONS = [
    "Tell me about patient example",
    "Analyze the labs for this patient",
    "What is the mechanism of action of azithromycin?",
    "Explore potential diagnoses",
    "Is the current medication safe for this patient?",
];

function makeId()        { return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
function makeSessionId() { return `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function convTitle(messages) {
    const first = messages?.find(m => m.role === "user");
    if (!first) return "New conversation";
    return first.content.length > 48 ? first.content.slice(0, 48) + "…" : first.content;
}

function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000)    return "just now";
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

async function apiFetch(url, opts = {}) {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
}

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
            fontSize: 10, color, animation: isStart ? "pulse 2s infinite" : "none",
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

function MessageBubble({ msg }) {
    const isUser = msg.role === "user";
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 6, animation: "fadeIn 0.3s ease" }}>
            {!isUser && msg.toolEvents?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingLeft: 38 }}>
                    {msg.toolEvents.map((e, i) => <ToolBadge key={i} event={e} />)}
                </div>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, maxWidth: "85%" }}>
                {!isUser && (
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${EMERALD} 0%, rgba(16,185,129,0.55) 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${EMERALD}30` }}>
                        <Bot size={14} color="#fff" strokeWidth={1.75} />
                    </div>
                )}
                <div style={{
                    padding: "11px 15px",
                    background: isUser ? `linear-gradient(135deg, ${EMERALD}, rgba(16,185,129,0.8))` : SURFACE,
                    border: `1px solid ${isUser ? EMERALD : BORDER}`,
                    borderRadius: isUser ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                    color: isUser ? "#fff" : TEXT, fontSize: 14, lineHeight: 1.65, wordBreak: "break-word",
                    boxShadow: isUser ? `0 4px 16px ${EMERALD}25` : "none",
                }}>
                    {isUser ? (
                        <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                    ) : msg.content ? (
                        <div className="md-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                    ) : msg.streaming ? (
                        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                            <span style={{ color: MUTED, fontSize: 12 }}>Thinking…</span>
                        </span>
                    ) : null}
                    {msg.streaming && msg.content && (
                        <span style={{ display: "inline-block", width: 2, height: 13, background: EMERALD, marginLeft: 2, animation: "blink 0.8s step-end infinite", verticalAlign: "middle" }} />
                    )}
                </div>
                {isUser && (
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${EMERALD}20`, border: `1px solid ${EMERALD}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={14} color={EMERALD} strokeWidth={1.75} />
                    </div>
                )}
            </div>
            {!isUser && msg.mode && !msg.streaming && (
                <div style={{ paddingLeft: 38 }}>
                    <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                        padding: "2px 8px",
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

function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, collapsed, onToggle, loading }) {
    return (
        <div style={{
            width: collapsed ? 0 : 260, minWidth: collapsed ? 0 : 260,
            overflow: "hidden", transition: "width 0.25s ease, min-width 0.25s ease",
            borderRight: collapsed ? "none" : `1px solid ${BORDER}`,
            background: SURFACE, display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
            {!collapsed && (
                <>
                    <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            onClick={onNew}
                            style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: `${EMERALD}12`, border: `1px solid ${EMERALD}40`, color: EMERALD, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = `${EMERALD}22`}
                            onMouseLeave={e => e.currentTarget.style.background = `${EMERALD}12`}
                        >
                            <Plus size={13} /> New chat
                        </button>
                        <button
                            onClick={onToggle}
                            style={{ background: "none", border: `1px solid ${BORDER}`, color: SUBTLE, borderRadius: 7, padding: "7px 8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s", flexShrink: 0 }}
                            title="Collapse sidebar"
                            onMouseEnter={e => e.currentTarget.style.color = TEXT}
                            onMouseLeave={e => e.currentTarget.style.color = SUBTLE}
                        >
                            <PanelLeftClose size={13} />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "32px 0" }}>
                                <Loader2 size={18} color={SUBTLE} style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
                                <p style={{ fontSize: 11, color: SUBTLE, marginTop: 8 }}>Loading…</p>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "32px 16px" }}>
                                <MessageSquare size={24} color={SUBTLE} style={{ margin: "0 auto 10px" }} />
                                <p style={{ fontSize: 12, color: SUBTLE, margin: 0 }}>No conversations yet</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {conversations.map(conv => {
                                    const isActive = conv.id === activeId;
                                    return (
                                        <div
                                            key={conv.id}
                                            className="conv-item"
                                            style={{ padding: "9px 11px", borderRadius: 8, cursor: "pointer", background: isActive ? `${EMERALD}12` : "transparent", border: `1px solid ${isActive ? EMERALD + "40" : "transparent"}`, display: "flex", alignItems: "flex-start", gap: 8, animation: "slideIn 0.2s ease" }}
                                            onClick={() => onSelect(conv.id)}
                                        >
                                            <MessageSquare size={11} color={isActive ? EMERALD : SUBTLE} style={{ marginTop: 2, flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? EMERALD : TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
                                                    {convTitle(conv.messages)}
                                                </div>
                                                <div style={{ fontSize: 10, color: SUBTLE, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <Clock size={8} />
                                                    {timeAgo(conv.updated_at)}
                                                    <span style={{ opacity: 0.5 }}>·</span>
                                                    {conv.messages?.filter(m => m.role === "user").length || 0} msg{(conv.messages?.filter(m => m.role === "user").length || 0) !== 1 ? "s" : ""}
                                                </div>
                                            </div>
                                            <button
                                                onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: SUBTLE, padding: 2, display: "flex", borderRadius: 4, opacity: 0, transition: "opacity 0.2s", flexShrink: 0 }}
                                                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = RED; }}
                                                onMouseLeave={e => { e.currentTarget.style.opacity = "0"; e.currentTarget.style.color = SUBTLE; }}
                                                title="Delete"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: "10px 14px", borderTop: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 10, color: SUBTLE, textAlign: "center" }}>
                            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""} · stored in DB
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ConversationalChatbot() {
    const navigate = useNavigate();

    const [conversations,     setConversations]     = useState([]);
    const [activeId,          setActiveId]          = useState(null);
    const [messages,          setMessages]          = useState([]);
    const [sidebarCollapsed,  setSidebarCollapsed]  = useState(false);
    const [input,             setInput]             = useState("");
    const [isStreaming,       setIsStreaming]        = useState(false);
    const [error,             setError]             = useState(null);
    const [loadingConvs,      setLoadingConvs]      = useState(true);

    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);
    const abortRef       = useRef(null);
    const activeConvRef  = useRef(null);

    const activeConv = conversations.find(c => c.id === activeId) || null;
    activeConvRef.current = activeConv;

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    useEffect(() => {
        apiFetch(CONV_API)
            .then(data => {
                const convs = data.conversations || [];
                setConversations(convs);
                if (convs.length > 0) {
                    setActiveId(convs[0].id);
                    setMessages(convs[0].messages || []);
                }
            })
            .catch(() => {})
            .finally(() => setLoadingConvs(false));
    }, []);

    const selectConversation = useCallback((id) => {
        if (isStreaming) return;
        const conv = conversations.find(c => c.id === id);
        if (!conv) return;
        setActiveId(id);
        setMessages(conv.messages || []);
        setError(null);
        setInput("");
        inputRef.current?.focus();
    }, [conversations, isStreaming]);

    const newChat = useCallback(async () => {
        const id        = makeId();
        const sessionId = makeSessionId();
        const conv      = { id, session_id: sessionId, messages: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

        setConversations(prev => [conv, ...prev]);
        setActiveId(id);
        setMessages([]);
        setError(null);
        setInput("");
        inputRef.current?.focus();

        try { await apiFetch(CONV_API, { method: "POST", body: JSON.stringify({ id, session_id: sessionId }) }); }
        catch {}
    }, []);

    const deleteConversation = useCallback(async (id) => {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeId === id) {
            const remaining = conversations.filter(c => c.id !== id);
            if (remaining.length > 0) {
                setActiveId(remaining[0].id);
                setMessages(remaining[0].messages || []);
            } else {
                setActiveId(null);
                setMessages([]);
            }
        }
        try { await apiFetch(`${CONV_API}/${id}`, { method: "DELETE" }); }
        catch {}
    }, [activeId, conversations]);

    const persistMessages = useCallback(async (convId, msgs) => {
        try {
            await apiFetch(`${CONV_API}/${convId}`, {
                method: "PUT",
                body: JSON.stringify({ messages: msgs }),
            });
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, messages: msgs, updated_at: new Date().toISOString() } : c
            ));
        } catch {}
    }, []);

    const sendMessage = async (queryText) => {
        const q = (queryText || input).trim();
        if (!q || isStreaming) return;
        setInput("");
        setError(null);

        let convId    = activeId;
        let sessionId = activeConv?.session_id;

        if (!convId) {
            convId    = makeId();
            sessionId = makeSessionId();
            const conv = { id: convId, session_id: sessionId, messages: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            setConversations(prev => [conv, ...prev]);
            setActiveId(convId);
            try { await apiFetch(CONV_API, { method: "POST", body: JSON.stringify({ id: convId, session_id: sessionId }) }); }
            catch {}
        }

        const userMsg = { role: "user", content: q, id: Date.now(), toolEvents: [] };
        const assistantId = Date.now() + 1;
        const assistantMsg = { role: "assistant", content: "", streaming: true, toolEvents: [], mode: null, id: assistantId };

        const nextMessages = [...messages, userMsg, assistantMsg];
        setMessages(nextMessages);
        setIsStreaming(true);
        abortRef.current = new AbortController();

        const updateMsg = (fn) => setMessages(prev => prev.map(m => m.id === assistantId ? fn(m) : m));

        try {
            const res = await fetch(`${API.CONVERSATIVE}/query/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, session_id: sessionId }),
                signal: abortRef.current.signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
                            updateMsg(m => ({ ...m, content: m.content + evt.token }));
                        } else if (evt.type === "tool_start" || evt.type === "tool_error") {
                            updateMsg(m => ({ ...m, toolEvents: [...(m.toolEvents || []), evt] }));
                        } else if (evt.type === "tool_complete") {
                            updateMsg(m => {
                                const filtered = (m.toolEvents || []).filter(e => !(e.type === "tool_start" && e.tool === evt.tool));
                                return { ...m, toolEvents: [...filtered, evt] };
                            });
                        } else if (evt.type === "complete") {
                            updateMsg(m => ({ ...m, content: m.content || evt.answer, streaming: false, mode: evt.mode }));
                            setIsStreaming(false);
                        } else if (evt.type === "error" && evt.fatal) {
                            setError(evt.message);
                            updateMsg(m => ({ ...m, streaming: false, content: m.content || "⚠️ An error occurred." }));
                            setIsStreaming(false);
                        }
                    } catch {}
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message);
                updateMsg(m => ({ ...m, streaming: false, content: m.content || "⚠️ Connection failed." }));
                setIsStreaming(false);
            }
        }

        updateMsg(m => ({ ...m, streaming: false }));
        setIsStreaming(false);
        inputRef.current?.focus();

        setMessages(prev => {
            const finalMsgs = prev.map(m => m.streaming ? { ...m, streaming: false } : m);
            persistMessages(convId, finalMsgs);
            return finalMsgs;
        });
    };

    const handleAbort = () => {
        abortRef.current?.abort();
        setIsStreaming(false);
        setMessages(prev => {
            const finalMsgs = prev.map(m => m.streaming ? { ...m, streaming: false } : m);
            if (activeId) persistMessages(activeId, finalMsgs);
            return finalMsgs;
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const isEmpty = messages.length === 0;

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{GLOBAL_STYLES}</style>

            {/* ── Nav ── */}
            <nav style={{ flexShrink: 0, height: 52, zIndex: 50, background: "color-mix(in srgb, var(--color-bg) 90%, transparent)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{ background: "none", border: `1px solid ${BORDER}`, color: SUBTLE, borderRadius: 7, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = MUTED; }}
                        onMouseLeave={e => { e.currentTarget.style.color = SUBTLE; e.currentTarget.style.borderColor = BORDER; }}
                    >
                        <ArrowLeft size={11} /> Back
                    </button>

                    {sidebarCollapsed && (
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            style={{ background: "none", border: `1px solid ${BORDER}`, color: SUBTLE, borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.color = TEXT}
                            onMouseLeave={e => e.currentTarget.style.color = SUBTLE}
                        >
                            <PanelLeftOpen size={13} />
                        </button>
                    )}

                    <div style={{ width: 1, height: 18, background: BORDER }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 22, height: 22, background: EMERALD, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>MT</span>
                        </div>
                        <ChevronRight size={10} color={SUBTLE} />
                        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: SUBTLE, padding: 0 }}>Dashboard</button>
                        <ChevronRight size={10} color={SUBTLE} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Conversational AI</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "4px 10px" }}>
                        <Wifi size={10} color={EMERALD} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8010</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${EMERALD}40`, borderRadius: 7, color: EMERALD, background: `${EMERALD}0E` }}>
                        Tool Agent
                    </div>
                    {isStreaming && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: EMERALD }}>
                            <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Streaming
                        </div>
                    )}
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── Body ── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                <Sidebar
                    conversations={conversations}
                    activeId={activeId}
                    onSelect={selectConversation}
                    onNew={newChat}
                    onDelete={deleteConversation}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(v => !v)}
                    loading={loadingConvs}
                />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                    {/* ── Messages ── */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                        {isEmpty ? (
                            <div style={{ maxWidth: 620, margin: "32px auto 0", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
                                <div style={{ width: 60, height: 60, borderRadius: 16, margin: "0 auto 18px", background: `linear-gradient(135deg, ${EMERALD} 0%, rgba(16,185,129,0.55) 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 32px ${EMERALD}30` }}>
                                    <Bot size={26} color="#fff" strokeWidth={1.5} />
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: EMERALD, marginBottom: 8 }}>Agent 08 · Tool Agent</div>
                                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, marginBottom: 8, lineHeight: 1.1 }}>MediTwin Conversational AI</h2>
                                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
                                    Ask about any patient by their ID, analyze labs, check drug safety, explore diagnoses — or ask any general medical question.
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: SUBTLE, marginBottom: 2, textAlign: "center" }}>Try asking</p>
                                    {SUGGESTIONS.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(s)}
                                            style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT, padding: "10px 14px", cursor: "pointer", fontSize: 13, textAlign: "left", borderRadius: 8, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10, animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = EMERALD; e.currentTarget.style.background = `${EMERALD}08`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = SURFACE; }}
                                        >
                                            <span style={{ color: EMERALD, fontSize: 11 }}>→</span> {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
                                {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* ── Error bar ── */}
                    {error && (
                        <div style={{ flexShrink: 0, padding: "10px 24px", background: `${RED}10`, borderTop: `1px solid ${RED}30`, display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertCircle size={13} color={RED} />
                            <span style={{ fontSize: 12, color: RED, flex: 1 }}>{error}</span>
                            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: RED, display: "flex", alignItems: "center" }}><X size={13} /></button>
                        </div>
                    )}

                    {/* ── Input ── */}
                    <div style={{ flexShrink: 0, borderTop: `1px solid ${BORDER}`, padding: "14px 24px", background: SURFACE }}>
                        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
                            <div style={{ flex: 1 }}>
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about a patient, diagnoses, drug safety, labs, or any medical question…"
                                    rows={1}
                                    style={{ width: "100%", resize: "none", overflow: "hidden", background: BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", borderRadius: 10, lineHeight: 1.5, maxHeight: 120, transition: "border-color 0.2s" }}
                                    onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                                    disabled={isStreaming}
                                />
                            </div>
                            {isStreaming ? (
                                <button onClick={handleAbort} style={{ padding: "11px 16px", background: `${RED}12`, border: `1px solid ${RED}40`, color: RED, cursor: "pointer", borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}
                                    onMouseEnter={e => e.currentTarget.style.background = `${RED}20`}
                                    onMouseLeave={e => e.currentTarget.style.background = `${RED}12`}
                                >
                                    <X size={14} /> Stop
                                </button>
                            ) : (
                                <button onClick={() => sendMessage()} disabled={!input.trim()}
                                    style={{ padding: "11px 18px", background: input.trim() ? `linear-gradient(135deg, ${EMERALD}, rgba(16,185,129,0.8))` : BORDER, border: "none", color: "#fff", cursor: input.trim() ? "pointer" : "not-allowed", borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, transition: "all 0.2s", boxShadow: input.trim() ? `0 4px 14px ${EMERALD}35` : "none" }}
                                    onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                                >
                                    <Send size={14} /> Send
                                </button>
                            )}
                        </div>
                        <p style={{ maxWidth: 820, margin: "7px auto 0", fontSize: 10, color: SUBTLE, textAlign: "center" }}>
                            <kbd style={{ background: BG, border: `1px solid ${BORDER}`, padding: "1px 5px", borderRadius: 3, fontSize: 9, fontFamily: "monospace" }}>Enter</kbd>{" "}to send ·{" "}
                            <kbd style={{ background: BG, border: `1px solid ${BORDER}`, padding: "1px 5px", borderRadius: 3, fontSize: 9, fontFamily: "monospace" }}>Shift+Enter</kbd>{" "}for new line · AI outputs require physician review
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
