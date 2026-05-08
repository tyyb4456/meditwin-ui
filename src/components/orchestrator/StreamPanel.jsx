import { useRef, useEffect } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";
import { ACCENT, BORDER, RED, GREEN, CYAN, YELLOW, PURPLE, MUTED, SURFACE, TERMINAL_BG } from "./tokens";

function eventBadgeStyle(type) {
    const map = {
        error:    { color: RED,    bg: `${RED}18`    },
        complete: { color: GREEN,  bg: `${GREEN}18`  },
        result:   { color: GREEN,  bg: `${GREEN}18`  },
        final:    { color: PURPLE, bg: `${PURPLE}18` },
        status:   { color: CYAN,   bg: `${CYAN}18`   },
        progress: { color: YELLOW, bg: `${YELLOW}18` },
    };
    const { color, bg } = map[type] || { color: MUTED, bg: SURFACE };
    return {
        fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "2px 6px", borderRadius: 4, color, background: bg,
        border: `1px solid ${color}30`, fontFamily: "monospace", flexShrink: 0,
    };
}

export default function StreamPanel({ streamEvents, isStreaming, onAbort }) {
    const eventsEndRef = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    return (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", background: "#111018", borderBottom: "1px solid #1E1B2E", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 5 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4A4466", marginLeft: 4 }}>SSE Stream Log</span>
                </div>
                {isStreaming && (
                    <button onClick={onAbort} style={{
                        padding: "2px 8px", border: `1px solid ${RED}40`, color: RED,
                        background: `${RED}10`, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", cursor: "pointer", borderRadius: 5,
                        display: "flex", alignItems: "center", gap: 4,
                    }}>
                        <X size={9} /> Abort
                    </button>
                )}
            </div>
            <div style={{
                padding: "8px 12px", height: 300, overflowY: "auto",
                fontFamily: "monospace", fontSize: 10,
                display: "flex", flexDirection: "column", gap: 4,
                background: TERMINAL_BG,
            }}>
                {streamEvents.length === 0
                    ? <p style={{ color: "#4A4466", fontStyle: "italic", margin: 0 }}>Waiting for stream…</p>
                    : streamEvents.map((event, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingBottom: 4, borderBottom: "1px solid #1A1730" }}>
                            <span style={eventBadgeStyle(event.type)}>{event.type}</span>
                            <div style={{ flex: 1 }}>
                                {event.node    && <span style={{ color: ACCENT, fontSize: 9, fontWeight: "bold" }}>{event.node?.toUpperCase()} </span>}
                                {event.message && <span style={{ color: "#9D9DB8", fontSize: 10 }}>{event.message}</span>}
                            </div>
                        </div>
                    ))
                }
                <div ref={eventsEndRef} />
            </div>
        </div>
    );
}

export function LiveTextPanel({ liveText, copied, onCopy }) {
    return (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `${ACCENT}08` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Loader2 size={12} color={ACCENT} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED }}>Live Output</span>
                </div>
                <button onClick={onCopy} style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {copied ? <Check size={10} color={GREEN} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <div style={{ padding: 14, maxHeight: 320, overflowY: "auto", background: TERMINAL_BG }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                    {liveText || "Waiting for agent output…"}
                </pre>
            </div>
        </div>
    );
}
