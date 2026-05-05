import { User, Send, Loader2 } from "lucide-react";

const ACCENT  = "var(--color-accent)";
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const SURFACE2 = "var(--color-surface-2)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const SUBTLE  = "var(--color-text-subtle)";

const inputStyle = {
    width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8,
    color: TEXT, padding: "10px 14px", fontSize: 13, outline: "none",
    fontFamily: "monospace", transition: "border-color 0.2s",
};

export default function InputPanel({
    patientId,
    setPatientId,
    fhirUrl,
    setFhirUrl,
    onFetch,
    status,
    statusConfig,
    elapsed,
    cacheHit,
    progressPct,
}) {
    const busy = status === "streaming";
    const disabled = busy || !patientId.trim();

    return (
        <div style={{
            background: SURFACE, borderBottom: `1px solid ${BORDER}`,
            position: "relative", overflow: "hidden",
        }}>
            {/* Top accent stripe */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${ACCENT}, rgba(129,140,248,0.3))`,
            }} />

            {/* Background glow */}
            <div style={{
                position: "absolute", top: -60, right: -60,
                width: 300, height: 300, borderRadius: "50%",
                background: `radial-gradient(circle, ${ACCENT}10 0%, transparent 70%)`,
                pointerEvents: "none",
            }} />

            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px 24px", position: "relative" }}>

                {/* ── Agent identity + status pill ── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {/* Avatar */}
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: `linear-gradient(135deg, ${ACCENT} 0%, rgba(129,140,248,0.6) 100%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 8px 24px ${ACCENT}30`,
                        }}>
                            <User size={22} color="#fff" strokeWidth={1.75} />
                        </div>

                        {/* Title */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
                                    textTransform: "uppercase", color: ACCENT,
                                }}>Agent 01</span>
                                <span style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
                                    color: ACCENT, border: `1px solid ${ACCENT}50`, background: `${ACCENT}0E`,
                                    padding: "1px 6px", borderRadius: 4,
                                }}>A2A</span>
                                <span style={{
                                    fontSize: 9, color: SUBTLE, fontFamily: "monospace",
                                    border: `1px solid ${BORDER}`, padding: "1px 6px", borderRadius: 4,
                                }}>::8001</span>
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, margin: 0, lineHeight: 1 }}>
                                Patient Context Agent
                            </h1>
                            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "6px 0 0", maxWidth: 520 }}>
                                Fetches FHIR R4 resources in parallel and normalises them into a unified PatientState for downstream agents.
                            </p>
                        </div>
                    </div>

                    {/* Status pill */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: BG, border: `1px solid ${BORDER}`,
                        borderRadius: 10, padding: "8px 16px", flexShrink: 0,
                    }}>
                        {statusConfig.icon}
                        <span style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                            textTransform: "uppercase", color: statusConfig.color,
                        }}>{statusConfig.label}</span>
                        {elapsed && (
                            <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace", marginLeft: 4 }}>
                                {elapsed}s{cacheHit ? " · CACHED" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Input controls ── */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>

                    <div style={{ flex: "0 0 220px", minWidth: 160 }}>
                        <p style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: SUBTLE, margin: "0 0 6px",
                        }}>Patient ID</p>
                        <input
                            value={patientId}
                            onChange={e => setPatientId(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && onFetch()}
                            placeholder="e.g. example"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ flex: 1, minWidth: 240 }}>
                        <p style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: SUBTLE, margin: "0 0 6px",
                        }}>FHIR Base URL</p>
                        <input
                            value={fhirUrl}
                            onChange={e => setFhirUrl(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <button
                        onClick={onFetch}
                        disabled={disabled}
                        style={{
                            background: disabled ? SURFACE2 : ACCENT,
                            border: "none", borderRadius: 8, color: "#fff",
                            padding: "10px 22px",
                            cursor: disabled ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 8,
                            fontSize: 12, fontWeight: 800, letterSpacing: "0.14em",
                            textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap",
                            boxShadow: disabled ? "none" : `0 4px 14px ${ACCENT}35`,
                        }}
                    >
                        {busy
                            ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                            : <><Send size={13} /> Fetch Patient</>
                        }
                    </button>
                </div>

                {/* ── Progress bar ── */}
                {busy && (
                    <div style={{ marginTop: 14, height: 2, background: BORDER, borderRadius: 1, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", background: ACCENT, borderRadius: 1,
                            width: `${progressPct}%`, transition: "width 0.5s ease",
                        }} />
                    </div>
                )}
            </div>
        </div>
    );
}