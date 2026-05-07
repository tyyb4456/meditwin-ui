import { useState, useRef, useEffect, useCallback } from "react";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";
import { Eye, ArrowLeft, ChevronRight, Wifi, Loader2 } from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import ImagingTriageHistory from "../components/history/ImagingTriageHistory";
import ImagingInputPanel from "../components/agents/imaging/ImagingInputPanel";
import ImagingResultsPanel from "../components/agents/imaging/ImagingResultsPanel";

// ── Color tokens ──────────────────────────────────────────────────────────────
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const EMERALD = "#10B981";

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
    input:focus, textarea:focus, select:focus { border-color: #10B981 !important; outline: none; }
    input::placeholder, textarea::placeholder { color: var(--color-text-subtle); opacity: 0.7; }
`;

const BREADCRUMBS = [
    { label: "Dashboard",     path: "/dashboard" },
    { label: "Microservices", path: "/dashboard/microservices" },
];

export default function ImagingTriageAgent() {
    const navigate = useNavigate();

    const [inputMode,      setInputMode]      = useState("image");
    const [isStreaming,    setIsStreaming]     = useState(false);
    const [streamEvents,   setStreamEvents]   = useState([]);
    const [finalResult,    setFinalResult]    = useState(null);
    const [currentStep,    setCurrentStep]    = useState(null);
    const [error,          setError]          = useState(null);
    const [liveText,       setLiveText]       = useState("");
    const [partialResult,  setPartialResult]  = useState(null);
    const [copied,         setCopied]         = useState(false);
    const [expandedAction, setExpandedAction] = useState(null);

    const abortControllerRef = useRef(null);
    const eventsEndRef       = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setLiveText(""); setCopied(false);
        setExpandedAction(null);
    };

    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = {};

            const predMatch  = liveText.match(/"prediction"\s*:\s*"([^"]+)"/);
            const confMatch  = liveText.match(/"confidence"\s*:\s*([\d.]+)/);
            const pneuMatch  = liveText.match(/"pneumonia_probability"\s*:\s*([\d.]+)/);
            if (predMatch) {
                partial.model_output = {
                    prediction:            predMatch[1],
                    confidence:            confMatch ? parseFloat(confMatch[1]) : 0,
                    pneumonia_probability: pneuMatch ? parseFloat(pneuMatch[1]) : 0,
                    normal_probability:    pneuMatch ? 1 - parseFloat(pneuMatch[1]) : 1,
                };
            }

            const gradeMatch    = liveText.match(/"grade"\s*:\s*"([^"]+)"/);
            const labelMatch    = liveText.match(/"triage_label"\s*:\s*"([^"]+)"/);
            const priorityMatch = liveText.match(/"triage_priority"\s*:\s*(\d+)/);
            if (gradeMatch || labelMatch) {
                partial.severity_assessment = {
                    grade:           gradeMatch    ? gradeMatch[1]              : "…",
                    triage_label:    labelMatch    ? labelMatch[1]              : "…",
                    triage_priority: priorityMatch ? parseInt(priorityMatch[1]) : 4,
                };
            }

            const patternMatch = liveText.match(/"pattern"\s*:\s*"([^"]+)"/);
            if (patternMatch) partial.imaging_findings = { pattern: patternMatch[1] };

            if (Object.keys(partial).length > 0) setPartialResult(partial);
        } catch { }
    }, [liveText, isStreaming, finalResult]);

    const handleCopy = () => {
        navigator.clipboard.writeText(finalResult ? JSON.stringify(finalResult, null, 2) : liveText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAbort = () => {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
    };

    const runImagingTriage = useCallback(async (payload) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${API.IMAGING_TRIAGE}/stream`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload),
                signal:  abortControllerRef.current.signal,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const reader  = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer    = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const pl = line.slice(6);
                    if (pl === "[DONE]") { setIsStreaming(false); continue; }
                    try {
                        const event = JSON.parse(pl);
                        if (event.type === "token") {
                            setLiveText(prev => prev + event.token);
                        } else {
                            setStreamEvents(prev => [...prev, event]);
                            if (event.type === "status")   setCurrentStep(event.message);
                            if (event.type === "complete") { setFinalResult(event.data); setCurrentStep(null); setIsStreaming(false); }
                            if (event.type === "error")    { setError(event.message); if (event.fatal) setIsStreaming(false); }
                        }
                    } catch { }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") { setError(err.message); setIsStreaming(false); }
        }
    }, []);

    const displayResult = finalResult || partialResult;
    const isFinal = !!finalResult;

    return (
        <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{GLOBAL_STYLES}</style>

            {/* ── Sticky nav ── */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50, height: 56,
                background: "color-mix(in srgb, var(--color-bg) 90%, transparent)",
                backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px",
            }}>
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
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Imaging Triage Agent</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 7, padding: "4px 10px",
                    }}>
                        <Wifi size={10} color={EMERALD} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8005</span>
                    </div>
                    <div style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                        padding: "4px 10px", border: `1px solid ${EMERALD}40`, borderRadius: 7,
                        color: EMERALD, background: `${EMERALD}0E`,
                    }}>A2A</div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── Agent hero ── */}
            <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${EMERALD}, rgba(16,185,129,0.3))` }} />
                <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${EMERALD}10 0%, transparent 70%)`, pointerEvents: "none" }} />

                <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: `linear-gradient(135deg, ${EMERALD} 0%, rgba(16,185,129,0.55) 100%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 8px 24px ${EMERALD}30`,
                        }}>
                            <Eye size={22} color="#fff" strokeWidth={1.75} />
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: EMERALD }}>Agent 05</span>
                                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: EMERALD, border: `1px solid ${EMERALD}50`, background: `${EMERALD}0E`, padding: "1px 6px", borderRadius: 4 }}>A2A</span>
                                <span style={{ fontSize: 9, color: SUBTLE, fontFamily: "monospace", border: `1px solid ${BORDER}`, padding: "1px 6px", borderRadius: 4 }}>::8005</span>
                                {isStreaming && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: EMERALD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Streaming
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, margin: 0, lineHeight: 1 }}>Imaging Triage Agent</h1>
                            <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0", maxWidth: 580 }}>
                                EfficientNetB0 CNN chest X-ray classifier with real-time pneumonia detection, severity grading, triage prioritization, and LLM-powered radiological narrative via streaming SSE.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main 2-col grid ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "460px 1fr", gap: 16, alignItems: "start" }}>
                <ImagingInputPanel
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    onSubmit={runImagingTriage}
                    isStreaming={isStreaming}
                />
                <ImagingResultsPanel
                    isStreaming={isStreaming}
                    currentStep={currentStep}
                    error={error}
                    streamEvents={streamEvents}
                    eventsEndRef={eventsEndRef}
                    liveText={liveText}
                    finalResult={finalResult}
                    partialResult={partialResult}
                    displayResult={displayResult}
                    isFinal={isFinal}
                    expandedAction={expandedAction}
                    setExpandedAction={setExpandedAction}
                    handleCopy={handleCopy}
                    handleAbort={handleAbort}
                    copied={copied}
                />
            </div>

            {/* ── Imaging History ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto 48px", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: SUBTLE }}>Imaging History</span>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                </div>
                <ImagingTriageHistory defaultPatientId="" />
            </div>
        </div>
    );
}
