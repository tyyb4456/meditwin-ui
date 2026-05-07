/**
 * DiagnosisAgent.jsx
 * ──────────────────
 * Page shell — owns all state and SSE stream logic.
 * Renders:
 *   1. Sticky nav
 *   2. Agent hero
 *   3. 2-col grid: <DiagnosisInputPanel> + <DiagnosisResultPanel>
 *   4. <DiagnosisHistory>
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Wifi, Loader2, ChevronRight, Brain,
} from "lucide-react";

import ThemeToggle from "../components/theme/ThemeToggle";
import DiagnosisInputPanel from "../components/agents/diagnosis/DiagnosisInputPanel";
import DiagnosisResultPanel from "../components/agents/diagnosis/DiagnosisResultPanel";
import DiagnosisHistory from "../components/history/DiagnosisHistory";

// ── Color tokens ────────────────────────────────────────────────────────────
const ACCENT  = "var(--color-accent)";
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const PURPLE  = "#8B5CF6";

// ── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes pulse   { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    select option { background: var(--color-bg); color: var(--color-text); }
    input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
    input:focus, textarea:focus, select:focus { border-color: var(--color-accent) !important; outline: none; }
    input::placeholder, textarea::placeholder { color: var(--color-text-subtle); opacity: 0.7; }
`;

// ── Breadcrumbs config ───────────────────────────────────────────────────────
const BREADCRUMBS = [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Microservices", path: "/dashboard/microservices" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function DiagnosisAgent() {
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────────────────────────
    const [inputMode,         setInputMode]         = useState("form");
    const [isStreaming,       setIsStreaming]        = useState(false);
    const [streamEvents,      setStreamEvents]      = useState([]);
    const [finalResult,       setFinalResult]       = useState(null);
    const [currentStep,       setCurrentStep]       = useState(null);
    const [error,             setError]             = useState(null);
    const [expandedDiagnosis, setExpandedDiagnosis] = useState(null);
    const [liveText,          setLiveText]          = useState("");
    const [partialResult,     setPartialResult]     = useState(null);
    const [copied,            setCopied]            = useState(false);

    const abortControllerRef = useRef(null);
    const eventsEndRef       = useRef(null);

    // ── Auto-scroll on new events ─────────────────────────────────────────────
    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    // ── Partial result parser ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = { differential_diagnosis: [] };
            const blocks  = liveText.split(/"rank"\s*:\s*\d+/).slice(1);
            for (let i = 0; i < blocks.length; i++) {
                const block        = blocks[i];
                const displayMatch = block.match(/"display"\s*:\s*"([^"]+)"/);
                const codeMatch    = block.match(/"icd10_code"\s*:\s*"([^"]+)"/);
                const confMatch    = block.match(/"confidence"\s*:\s*(0\.\d+)/);
                if (displayMatch) {
                    partial.differential_diagnosis.push({
                        rank: partial.differential_diagnosis.length + 1,
                        display: displayMatch[1] || "...", icd10_code: codeMatch ? codeMatch[1] : "...",
                        confidence: confMatch ? parseFloat(confMatch[1]) : 0,
                        clinical_reasoning: "Reasoning stream...", supporting_evidence: [], against_evidence: [],
                    });
                }
            }
            if (partial.differential_diagnosis.length > 0) {
                const top = partial.differential_diagnosis[0];
                partial.top_diagnosis   = top.display;
                partial.top_icd10_code  = top.icd10_code;
                if (top.confidence >= 0.75)       partial.confidence_level = "HIGH";
                else if (top.confidence >= 0.5)   partial.confidence_level = "MODERATE";
                else if (top.confidence > 0)      partial.confidence_level = "LOW";
                setPartialResult(partial);
            }
        } catch { }
    }, [liveText, isStreaming, finalResult]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setExpandedDiagnosis(null);
        setLiveText(""); setCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(finalResult ? JSON.stringify(finalResult, null, 2) : liveText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAbort = () => {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
    };

    // ── SSE stream ────────────────────────────────────────────────────────────
    const runDiagnosis = useCallback(async (patientState, chiefComplaint) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${API.DIAGNOSIS}/stream`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ patient_state: patientState, chief_complaint: chiefComplaint, include_fhir_resources: true }),
                signal:  abortControllerRef.current.signal,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const reader  = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const payload = line.slice(6);
                    if (payload === "[DONE]") { setIsStreaming(false); continue; }
                    try {
                        const event = JSON.parse(payload);
                        if (event.type === "token") {
                            setLiveText(prev => prev + event.token);
                        } else {
                            setStreamEvents(prev => [...prev, event]);
                            if (event.type === "status")        setCurrentStep(event.message);
                            else if (event.type === "complete") { setFinalResult(event.data); setCurrentStep(null); }
                            else if (event.type === "error")    { setError(event.message); if (event.fatal) setIsStreaming(false); }
                        }
                    } catch { }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message);
                setIsStreaming(false);
            }
        }
    }, []);

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
                {/* Left: back + breadcrumbs */}
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

                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 24, height: 24, background: PURPLE, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Diagnosis Agent</span>
                    </div>
                </div>

                {/* Right: port badge + A2A badge + theme toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 7, padding: "4px 10px",
                    }}>
                        <Wifi size={10} color={PURPLE} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8002</span>
                    </div>
                    <div style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                        padding: "4px 10px", border: `1px solid ${PURPLE}40`, borderRadius: 7,
                        color: PURPLE, background: `${PURPLE}0E`,
                    }}>A2A</div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── Agent hero ── */}
            <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${PURPLE}, rgba(139,92,246,0.3))` }} />
                <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${PURPLE}10 0%, transparent 70%)`, pointerEvents: "none" }} />

                <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: `linear-gradient(135deg, ${PURPLE} 0%, rgba(139,92,246,0.55) 100%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 8px 24px ${PURPLE}30`,
                        }}>
                            <Brain size={22} color="#fff" strokeWidth={1.75} />
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: PURPLE }}>Agent 02</span>
                                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: PURPLE, border: `1px solid ${PURPLE}50`, background: `${PURPLE}0E`, padding: "1px 6px", borderRadius: 4 }}>A2A</span>
                                <span style={{ fontSize: 9, color: SUBTLE, fontFamily: "monospace", border: `1px solid ${BORDER}`, padding: "1px 6px", borderRadius: 4 }}>::8002</span>
                                {isStreaming && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Streaming
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, margin: 0, lineHeight: 1 }}>Diagnosis Agent</h1>
                            <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0", maxWidth: 560 }}>
                                RAG-based differential diagnosis engine. Retrieves from medical knowledge base and runs Gemini inference with real-time streaming output.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main 2-col grid ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "460px 1fr", gap: 16, alignItems: "start" }}>
                <DiagnosisInputPanel
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    isStreaming={isStreaming}
                    onSubmit={runDiagnosis}
                />
                <DiagnosisResultPanel
                    isStreaming={isStreaming}
                    streamEvents={streamEvents}
                    finalResult={finalResult}
                    partialResult={partialResult}
                    liveText={liveText}
                    currentStep={currentStep}
                    error={error}
                    expandedDiagnosis={expandedDiagnosis}
                    setExpandedDiagnosis={setExpandedDiagnosis}
                    handleAbort={handleAbort}
                    handleCopy={handleCopy}
                    copied={copied}
                    eventsEndRef={eventsEndRef}
                />
            </div>

            {/* ── Diagnosis History ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto 48px", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.24em",
                        textTransform: "uppercase", color: SUBTLE,
                    }}>Diagnosis History</span>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                </div>
                <DiagnosisHistory />
            </div>
        </div>
    );
}
