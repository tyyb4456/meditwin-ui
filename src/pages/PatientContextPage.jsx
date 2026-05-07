/**
 * PatientContextPage.jsx
 * ───────────────────────
 * Page shell — owns all state and the SSE stream logic.
 * Renders:
 *   1. Sticky nav
 *   2. <InputPanel />   — agent hero + inputs + progress bar
 *   3. <Result />       — SSE terminal, raw JSON, patient cards
 *   4. <PatientHistory />
 */
import { useState, useRef, useCallback } from "react";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Wifi, CheckCircle2, Loader2, XCircle, ChevronRight,
} from "lucide-react";

import ThemeToggle from "../components/theme/ThemeToggle";
import PatientHistory from "../components/history/PatientHistory";
import InputPanel from "../components/agents/patient/PatientInputPanel";
import Result from "../components/agents/patient/PatientResultPanel";

// ── Color tokens (CSS variables) ──────────────────────────────────────────────
const ACCENT  = "var(--color-accent)";
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const GREEN   = "#22C55E";
const RED     = "#EF4444";

// ── Global styles injected once ───────────────────────────────────────────────
const GLOBAL_STYLES = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin    { to   { transform: rotate(360deg); } }
    @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar       { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    input::placeholder, textarea::placeholder { color: var(--color-text-subtle); opacity: 0.7; }
    input:focus, textarea:focus { border-color: var(--color-accent) !important; }
`;

// ── Status config lookup ───────────────────────────────────────────────────────
function useStatusConfig(status) {
    return {
        idle:      { icon: null,                                                                               label: "Ready",     color: SUBTLE },
        streaming: { icon: <Loader2 size={12} color={ACCENT} style={{ animation: "spin 1s linear infinite" }} />, label: "Streaming", color: ACCENT },
        done:      { icon: <CheckCircle2 size={12} color={GREEN} />,                                           label: "Complete",  color: GREEN },
        error:     { icon: <XCircle size={12} color={RED} />,                                                  label: "Error",     color: RED },
    }[status];
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PatientContextPage() {
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────────────────────────
    const [patientId,    setPatientId]    = useState("");
    const [fhirUrl,      setFhirUrl]      = useState("https://hapi.fhir.org/baseR4");
    const [events,       setEvents]       = useState([]);
    const [status,       setStatus]       = useState("idle");   // idle | streaming | done | error
    const [patientState, setPatientState] = useState(null);
    const [elapsed,      setElapsed]      = useState(null);
    const [cacheHit,     setCacheHit]     = useState(false);

    const abortRef = useRef(null);
    const startRef = useRef(null);

    // ── Derived values ────────────────────────────────────────────────────────
    const statusConfig = useStatusConfig(status);
    const progressPct  = (() => {
        const prog = events.filter(e => e.type === "progress");
        return prog.length ? (prog[prog.length - 1].pct ?? 0) : 0;
    })();

    // ── SSE stream handler ────────────────────────────────────────────────────
    const runStream = useCallback(async () => {
        if (!patientId.trim()) return;

        setEvents([]);
        setPatientState(null);
        setElapsed(null);
        setStatus("streaming");

        startRef.current = Date.now();
        abortRef.current = new AbortController();

        try {
            const res = await fetch(`${API.PATIENT_CONTEXT}/stream`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ patient_id: patientId.trim(), fhir_base_url: fhirUrl }),
                signal:  abortRef.current.signal,
            });

            const reader  = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buf += decoder.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop(); // keep incomplete tail

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
                    } catch { /* malformed event — skip */ }
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

    // ── Breadcrumb config ─────────────────────────────────────────────────────
    const breadcrumbs = [
        { label: "Dashboard",     path: "/dashboard" },
        { label: "Microservices", path: "/dashboard/microservices" },
    ];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{GLOBAL_STYLES}</style>

            {/* ── Sticky top nav ── */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50, height: 56,
                background: "color-mix(in srgb, var(--color-bg) 90%, transparent)",
                backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px",
            }}>
                {/* Left: back button + breadcrumbs */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={() => navigate("/dashboard/microservices")}
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

                    {/* Logo + breadcrumbs */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{
                            width: 24, height: 24, background: ACCENT, borderRadius: 5,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>MT</span>
                        </div>

                        {breadcrumbs.map(c => (
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
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Patient Context</span>
                    </div>
                </div>

                {/* Right: port badge + A2A badge + theme toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 7, padding: "4px 10px",
                    }}>
                        <Wifi size={10} color={ACCENT} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8001</span>
                    </div>
                    <div style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                        padding: "4px 10px", border: `1px solid ${ACCENT}40`, borderRadius: 7,
                        color: ACCENT, background: `${ACCENT}0E`,
                    }}>A2A</div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── Agent hero + inputs ── */}
            <InputPanel
                patientId={patientId}
                setPatientId={setPatientId}
                fhirUrl={fhirUrl}
                setFhirUrl={setFhirUrl}
                onFetch={runStream}
                status={status}
                statusConfig={statusConfig}
                elapsed={elapsed}
                cacheHit={cacheHit}
                progressPct={progressPct}
            />

            {/* ── SSE terminal + raw JSON + patient cards ── */}
            <Result
                events={events}
                patientState={patientState}
                status={status}
                cacheHit={cacheHit}
                elapsed={elapsed}
            />

            {/* ── Fetch history section ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto 48px", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.24em",
                        textTransform: "uppercase", color: SUBTLE,
                    }}>Fetch History</span>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                </div>
                <PatientHistory defaultPatientId={patientId} />
            </div>
        </div>
    );
}