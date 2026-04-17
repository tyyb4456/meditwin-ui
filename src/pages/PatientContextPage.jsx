import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Activity, Pill, FlaskConical, AlertTriangle,
    FileText, ArrowLeft, Send, Loader2, CheckCircle2,
    XCircle, Clock, Wifi, Database, Heart, Thermometer,
    ShieldAlert, Scan, ChevronRight, Copy, Check
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import PatientHistory from "../components/history/PatientHistory"

// ── Color tokens — use CSS variables so ThemeToggle works ─────────────────
const C = {
    bg: "var(--color-bg)",
    panel: "var(--color-surface)",
    card: "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))",
    border: "var(--color-border)",
    accent: "var(--color-accent)",
    accentDim: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
    green: "#22C55E",
    yellow: "#EAB308",
    red: "#EF4444",
    cyan: "#06B6D4",
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
    dim: "var(--color-border)",
};

// ── Stream event log entry ──────────────────────────────────────────────────
function EventEntry({ evt, index }) {
    const typeColor = {
        status: C.cyan,
        progress: C.accent,
        complete: C.green,
        error: C.red,
        result: C.green,
    }[evt.type] || C.muted;

    const TypeBadge = () => (
        <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: typeColor,
            border: `1px solid ${typeColor}40`, padding: "1px 6px",
            borderRadius: 2, fontFamily: "monospace",
        }}>{evt.type}</span>
    );

    return (
        <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            padding: "8px 0", borderBottom: `1px solid ${C.border}`,
            opacity: 0, animation: `fadeSlideIn 0.3s ease ${index * 0.04}s forwards`,
        }}>
            <span style={{ color: C.muted, fontSize: 11, fontFamily: "monospace", minWidth: 28, paddingTop: 2 }}>
                {String(index + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <TypeBadge />
                    {evt.step > 0 && (
                        <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
                            step {evt.step}/{evt.total}
                        </span>
                    )}
                    {evt.pct !== undefined && (
                        <span style={{ fontSize: 10, color: C.accent, fontFamily: "monospace" }}>
                            {evt.pct}%
                        </span>
                    )}
                </div>
                {evt.message && (
                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5 }}>{evt.message}</p>
                )}
                {evt.type === "complete" && evt.data?.summary && (
                    <p style={{ fontSize: 11, color: C.green, margin: "4px 0 0", fontFamily: "monospace" }}>
                        ✓ {evt.data.summary.name} · age {evt.data.summary.age} · {evt.data.summary.conditions} conditions · {evt.data.summary.medications} medications · {evt.data.summary.labs} labs
                    </p>
                )}
                {evt.type === "progress" && (
                    <div style={{ marginTop: 6, height: 2, background: C.dim, borderRadius: 1 }}>
                        <div style={{
                            height: "100%", width: `${evt.pct}%`, background: C.accent,
                            borderRadius: 1, transition: "width 0.4s ease",
                        }} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Section label ───────────────────────────────────────────────────────────
function Label({ children }) {
    return (
        <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.25em",
            textTransform: "uppercase", color: C.muted, margin: "0 0 10px",
        }}>{children}</p>
    );
}

// ── Patient data cards ──────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = C.accent }) {
    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
        }}>
            <div style={{
                width: 36, height: 36, background: `${color}18`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
                <Icon size={16} color={color} strokeWidth={1.75} />
            </div>
            <div>
                <p style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 10, color: C.muted, margin: "3px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
                {sub && <p style={{ fontSize: 11, color: color, margin: "2px 0 0" }}>{sub}</p>}
            </div>
        </div>
    );
}

function ConditionBadge({ condition }) {
    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10,
        }}>
            <div style={{
                width: 6, height: 6, background: C.yellow, borderRadius: "50%",
                marginTop: 5, flexShrink: 0,
            }} />
            <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{condition.display}</p>
                <p style={{ fontSize: 10, color: C.muted, margin: "3px 0 0", fontFamily: "monospace" }}>
                    {condition.code}{condition.onset && ` · ${condition.onset?.split("T")[0]}`}
                </p>
            </div>
        </div>
    );
}

function MedBadge({ med }) {
    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            padding: "10px 14px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{med.drug}</p>
                <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                    color: med.status === "active" ? C.green : C.muted,
                    border: `1px solid ${med.status === "active" ? C.green : C.muted}40`,
                    padding: "1px 5px", textTransform: "uppercase",
                }}>{med.status}</span>
            </div>
            {(med.dose || med.frequency) && (
                <p style={{ fontSize: 10, color: C.muted, margin: "4px 0 0" }}>
                    {[med.dose, med.frequency].filter(Boolean).join(" · ")}
                </p>
            )}
        </div>
    );
}

function LabRow({ lab }) {
    const flagColor = {
        HIGH: C.red, LOW: C.yellow, CRITICAL: "#FF0000", NORMAL: C.green,
    }[lab.flag] || C.muted;

    const pct = lab.reference_high
        ? Math.min(100, Math.round((lab.value / lab.reference_high) * 100))
        : 50;

    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            padding: "10px 14px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{lab.display}</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>{lab.loinc}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 900, color: flagColor, margin: 0 }}>
                        {lab.value} <span style={{ fontSize: 10, fontWeight: 400 }}>{lab.unit}</span>
                    </p>
                    <span style={{
                        fontSize: 9, fontWeight: 700, color: flagColor,
                        border: `1px solid ${flagColor}40`, padding: "1px 5px", letterSpacing: "0.1em",
                    }}>{lab.flag}</span>
                </div>
            </div>
            {lab.reference_high && (
                <div style={{ height: 3, background: C.dim, borderRadius: 2 }}>
                    <div style={{
                        height: "100%", width: `${pct}%`,
                        background: flagColor, borderRadius: 2, maxWidth: "100%",
                    }} />
                </div>
            )}
            {lab.reference_high && (
                <p style={{ fontSize: 9, color: C.muted, margin: "3px 0 0" }}>
                    ref: {lab.reference_low ?? 0} – {lab.reference_high} {lab.unit}
                </p>
            )}
        </div>
    );
}

function AllergyChip({ allergy }) {
    return (
        <div style={{
            background: `${C.red}10`, border: `1px solid ${C.red}30`,
            padding: "8px 12px", display: "flex", gap: 8, alignItems: "center",
        }}>
            <ShieldAlert size={12} color={C.red} />
            <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{allergy.substance}</p>
                {allergy.reaction && (
                    <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                        {allergy.reaction}{allergy.severity && ` · ${allergy.severity}`}
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Raw JSON panel with copy ────────────────────────────────────────────────
function RawJsonPanel({ data }) {
    const [copied, setCopied] = useState(false);
    const text = JSON.stringify(data, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Label>Raw Patient State JSON</Label>
                <button onClick={handleCopy} style={{
                    background: "none", border: `1px solid ${C.border}`, color: C.muted,
                    padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                    {copied ? <Check size={10} color={C.green} /> : <Copy size={10} />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <div style={{
                flex: 1, overflow: "auto", background: "#080810",
                border: `1px solid ${C.border}`, padding: 14,
                fontFamily: "monospace", fontSize: 10.5, lineHeight: 1.6,
                color: "#9D9DB8",
            }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {text}
                </pre>
            </div>
        </div>
    );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function PatientContextPage() {
    const navigate = useNavigate();
    const [patientId, setPatientId] = useState("");
    const [fhirUrl, setFhirUrl] = useState("https://hapi.fhir.org/baseR4");
    const [events, setEvents] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | streaming | done | error
    const [patientState, setPatientState] = useState(null);
    const [elapsed, setElapsed] = useState(null);
    const [cacheHit, setCacheHit] = useState(false);
    const abortRef = useRef(null);
    const startRef = useRef(null);

    const runStream = useCallback(async () => {
        if (!patientId.trim()) return;
        setEvents([]);
        setPatientState(null);
        setElapsed(null);
        setStatus("streaming");
        startRef.current = Date.now();

        abortRef.current = new AbortController();

        try {
            const res = await fetch("http://127.0.0.1:8001/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_id: patientId.trim(), fhir_base_url: fhirUrl }),
                signal: abortRef.current.signal,
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });

                const lines = buf.split("\n");
                buf = lines.pop();

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const raw = line.slice(6).trim();
                    if (raw === "[DONE]") {
                        setStatus("done");
                        setElapsed(Math.round((Date.now() - startRef.current) / 10) / 100);
                        break;
                    }
                    try {
                        const evt = JSON.parse(raw);
                        setEvents(prev => [...prev, evt]);
                        if (evt.type === "complete" && evt.data?.patient_state) {
                            setPatientState(evt.data.patient_state);
                            setCacheHit(evt.data.cache_hit || false);
                        }
                        if (evt.type === "error" && evt.fatal) {
                            setStatus("error");
                        }
                    } catch { /* ignore parse errors */ }
                }
            }

            if (status !== "error") setStatus("done");
        } catch (err) {
            if (err.name !== "AbortError") {
                setEvents(prev => [...prev, { type: "error", message: String(err), fatal: true }]);
                setStatus("error");
            }
        }
    }, [patientId, fhirUrl]);

    const ps = patientState;
    const demo = ps?.demographics;

    const statusIcon = {
        idle: null,
        streaming: <Loader2 size={13} color={C.accent} style={{ animation: "spin 1s linear infinite" }} />,
        done: <CheckCircle2 size={13} color={C.green} />,
        error: <XCircle size={13} color={C.red} />,
    }[status];

    const progressPct = (() => {
        const progEvts = events.filter(e => e.type === "progress");
        if (!progEvts.length) return 0;
        return progEvts[progEvts.length - 1].pct ?? 0;
    })();

    return (
        <div style={{
            minHeight: "100vh", background: C.bg, color: C.text,
            fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${C.panel}; }
        ::-webkit-scrollbar-thumb { background: ${C.dim}; border-radius: 2px; }
        input::placeholder { color: ${C.muted}; }
      `}</style>

            {/* ── Top bar ── */}
            <div style={{
                position: "sticky", top: 0, zIndex: 50,
                background: `${C.bg}E8`, backdropFilter: "blur(12px)",
                borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px", height: 56,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button onClick={() => navigate("/dashboard/microservices")} style={{
                        background: "none", border: `1px solid ${C.border}`,
                        color: C.muted, padding: "5px 10px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5, fontSize: 11,
                        fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        transition: "color 0.2s, border-color 0.2s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.muted; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                    >
                        <ArrowLeft size={11} /> Back
                    </button>
                    <div style={{ width: 1, height: 20, background: C.border }} />
                    {/* ── Breadcrumb ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                            width: 26, height: 26, background: "#3D3A5C",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>MT</span>
                        </div>
                        {[
                            { label: "MediTwin AI", path: "/" },
                            { label: "Dashboard", path: "/dashboard" },
                            { label: "Microservices", path: "/dashboard/microservices" },
                        ].map(crumb => (
                            <span key={crumb.path} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                                <button
                                    onClick={() => navigate(crumb.path)}
                                    style={{
                                        background: "none", border: "none", cursor: "pointer",
                                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                                        textTransform: "uppercase", color: C.muted,
                                        transition: "color 0.2s", padding: 0,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                >
                                    {crumb.label}
                                </button>
                            </span>
                        ))}
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                            <span style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                                textTransform: "uppercase", color: C.text,
                            }}>
                                Patient Context Agent
                            </span>
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11,
                    }}>
                        <Wifi size={11} color="#3D3A5C" />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8001</span>
                    </div>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                        border: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C6FE0",
                    }}>
                        A2A
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* ── Input bar ── */}
            <div style={{
                background: C.panel, borderBottom: `1px solid ${C.border}`,
                padding: "16px 24px",
            }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <Label>Patient Context Agent — FHIR R4 Fetch + Stream</Label>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 200px", minWidth: 160 }}>
                            <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>PATIENT ID</p>
                            <input
                                value={patientId}
                                onChange={e => setPatientId(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && runStream()}
                                placeholder="e.g. example, patient-123"
                                style={{
                                    width: "100%", background: C.bg, border: `1px solid ${C.border}`,
                                    color: C.text, padding: "9px 12px", fontSize: 13, outline: "none",
                                    fontFamily: "monospace",
                                }}
                            />
                        </div>
                        <div style={{ flex: "2 1 300px" }}>
                            <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>FHIR BASE URL</p>
                            <input
                                value={fhirUrl}
                                onChange={e => setFhirUrl(e.target.value)}
                                style={{
                                    width: "100%", background: C.bg, border: `1px solid ${C.border}`,
                                    color: C.text, padding: "9px 12px", fontSize: 13, outline: "none",
                                    fontFamily: "monospace",
                                }}
                            />
                        </div>
                        <button
                            onClick={runStream}
                            disabled={status === "streaming" || !patientId.trim()}
                            style={{
                                background: status === "streaming" ? C.dim : "#3D3A5C",
                                border: "none", color: "#fff", padding: "9px 20px",
                                cursor: status === "streaming" ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", gap: 7,
                                fontSize: 12, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
                                transition: "all 0.2s",
                            }}
                        >
                            {status === "streaming"
                                ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                                : <><Send size={13} /> Fetch Patient</>}
                        </button>
                    </div>

                    {/* Progress bar */}
                    {status === "streaming" && (
                        <div style={{ marginTop: 10, height: 2, background: C.dim, borderRadius: 1 }}>
                            <div style={{
                                height: "100%", background: C.accent, borderRadius: 1,
                                width: `${progressPct}%`, transition: "width 0.5s ease",
                            }} />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main 3-col layout ── */}
            <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: patientState ? "1fr 1fr 1fr" : "1fr 1fr",
                gap: 16, alignItems: "start",
            }}>

                {/* ── LEFT: Stream log ── */}
                <div style={{
                    background: C.panel, border: `1px solid ${C.border}`,
                    gridColumn: patientState ? "1" : "1",
                }}>
                    <div style={{
                        padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            {statusIcon}
                            <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
                                textTransform: "uppercase", color: C.text,
                            }}>SSE Stream Log</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {events.length > 0 && (
                                <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
                                    {events.length} events
                                </span>
                            )}
                            {elapsed && (
                                <span style={{
                                    fontSize: 10, color: C.green, fontFamily: "monospace",
                                    border: `1px solid ${C.green}30`, padding: "1px 6px",
                                }}>
                                    {elapsed}s {cacheHit && "· CACHE HIT"}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ padding: "8px 16px", maxHeight: 500, overflowY: "auto" }}>
                        {events.length === 0 ? (
                            <div style={{ padding: "40px 0", textAlign: "center" }}>
                                <Activity size={28} color={C.dim} style={{ margin: "0 auto 10px" }} />
                                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                                    Enter a patient ID and hit Fetch to start streaming
                                </p>
                            </div>
                        ) : (
                            events.map((evt, i) => <EventEntry key={i} evt={evt} index={i} />)
                        )}
                    </div>
                </div>

                {/* ── MIDDLE / RIGHT: Raw JSON ── */}
                <div style={{
                    background: C.panel, border: `1px solid ${C.border}`,
                    padding: "14px 16px",
                    minHeight: patientState ? "auto" : 300,
                    gridColumn: patientState ? "2" : "2",
                }}>
                    {patientState ? (
                        <RawJsonPanel data={patientState} />
                    ) : (
                        <div style={{ height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <Database size={28} color={C.dim} style={{ marginBottom: 10 }} />
                            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Raw PatientState JSON will appear here</p>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Patient data (only when loaded) ── */}
                {patientState && (
                    <div style={{ gridColumn: "3", display: "flex", flexDirection: "column", gap: 14 }}>
                        {/* Demographics */}
                        {demo && (
                            <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16 }}>
                                <Label>Demographics</Label>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                    <div style={{
                                        width: 44, height: 44, background: "#3D3A5C",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <User size={20} color="#fff" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: 0 }}>{demo.name}</p>
                                        <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>
                                            {demo.gender} · {demo.age} yrs · DOB {demo.dob}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    <StatCard icon={Heart} label="Conditions" value={ps.active_conditions?.length ?? 0} color={C.yellow} />
                                    <StatCard icon={Pill} label="Medications" value={ps.medications?.length ?? 0} color={C.accent} />
                                    <StatCard icon={FlaskConical} label="Lab Results" value={ps.lab_results?.length ?? 0} color={C.cyan} />
                                    <StatCard icon={AlertTriangle} label="Allergies" value={ps.allergies?.length ?? 0} color={C.red} />
                                </div>
                            </div>
                        )}

                        {/* Conditions */}
                        {ps.active_conditions?.length > 0 && (
                            <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16 }}>
                                <Label>Active Conditions</Label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {ps.active_conditions.map((c, i) => <ConditionBadge key={i} condition={c} />)}
                                </div>
                            </div>
                        )}

                        {/* Medications */}
                        {ps.medications?.length > 0 && (
                            <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16 }}>
                                <Label>Medications</Label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {ps.medications.map((m, i) => <MedBadge key={i} med={m} />)}
                                </div>
                            </div>
                        )}

                        {/* Lab Results */}
                        {ps.lab_results?.length > 0 && (
                            <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16 }}>
                                <Label>Lab Results</Label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {ps.lab_results.map((l, i) => <LabRow key={i} lab={l} />)}
                                </div>
                            </div>
                        )}

                        {/* Allergies */}
                        {ps.allergies?.length > 0 && (
                            <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16 }}>
                                <Label>Allergies</Label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {ps.allergies.map((a, i) => <AllergyChip key={i} allergy={a} />)}
                                </div>
                            </div>
                        )}

                        {/* Diagnostic Reports */}
                        {ps.diagnostic_reports?.length > 0 && (
                            <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16 }}>
                                <Label>Diagnostic Reports</Label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {ps.diagnostic_reports.map((r, i) => (
                                        <div key={i} style={{
                                            background: C.card, border: `1px solid ${C.border}`,
                                            padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
                                        }}>
                                            <Scan size={14} color={C.cyan} />
                                            <div>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{r.display}</p>
                                                {r.conclusion && <p style={{ fontSize: 10, color: C.muted, margin: "3px 0 0" }}>{r.conclusion}</p>}
                                                {r.issued && <p style={{ fontSize: 9, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>{r.issued?.split("T")[0]}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Imaging flag */}
                        {ps.imaging_available && (
                            <div style={{
                                background: `${C.cyan}10`, border: `1px solid ${C.cyan}30`,
                                padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <Scan size={14} color={C.cyan} />
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.cyan, margin: 0 }}>Imaging data available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Footer status ── */}
            {status === "done" && ps && (
                <div style={{
                    maxWidth: 1400, margin: "0 auto 8px", padding: "0 24px",
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    <CheckCircle2 size={13} color={C.green} />
                    <span style={{ fontSize: 11, color: C.green, fontFamily: "monospace" }}>
                        Patient state loaded in {elapsed}s
                        {cacheHit ? " — served from Redis cache" : " — fetched from FHIR server"}
                    </span>
                </div>
            )}

            {/* ── History section ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto 40px", padding: "0 24px" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
                    paddingTop: 24, borderTop: `1px solid ${C.border}`,
                }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.25em",
                        textTransform: "uppercase", color: C.muted, padding: "0 12px",
                    }}>Fetch History</span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <PatientHistory defaultPatientId={patientId} />
            </div>
        </div>
    );
}