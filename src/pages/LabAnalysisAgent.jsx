import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, ArrowLeft, ChevronRight, Wifi } from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import LabHistory from "../components/history/LabHistory";
import LabInputPanel from "../components/agents/lab/LabInputPanel";
import LabResultsPanel from "../components/agents/lab/LabResultsPanel";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    text: "var(--color-text)", muted: "var(--color-text-subtle)", dim: "var(--color-border)",
    cyan: "#06B6D4",
};

export default function LabAnalysisAgent() {
    const navigate = useNavigate();

    const [inputMode,       setInputMode]       = useState("form");
    const [isStreaming,     setIsStreaming]      = useState(false);
    const [streamEvents,    setStreamEvents]    = useState([]);
    const [finalResult,     setFinalResult]     = useState(null);
    const [currentStep,     setCurrentStep]     = useState(null);
    const [error,           setError]           = useState(null);
    const [liveText,        setLiveText]        = useState("");
    const [partialResult,   setPartialResult]   = useState(null);
    const [copied,          setCopied]          = useState(false);
    const [expandedFlag,    setExpandedFlag]    = useState(null);
    const [expandedPattern, setExpandedPattern] = useState(null);

    const abortControllerRef = useRef(null);
    const eventsEndRef       = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setLiveText(""); setCopied(false);
        setExpandedFlag(null); setExpandedPattern(null);
    };

    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = {};

            const sevMatch   = liveText.match(/"overall_severity"\s*:\s*"([^"]+)"/);
            const totalMatch = liveText.match(/"total_results"\s*:\s*(\d+)/);
            const abnMatch   = liveText.match(/"abnormal_count"\s*:\s*(\d+)/);
            const critMatch  = liveText.match(/"critical_count"\s*:\s*(\d+)/);
            if (sevMatch || totalMatch) {
                partial.lab_summary = {
                    overall_severity: sevMatch   ? sevMatch[1]             : "...",
                    total_results:    totalMatch ? parseInt(totalMatch[1]) : 0,
                    abnormal_count:   abnMatch   ? parseInt(abnMatch[1])   : 0,
                    critical_count:   critMatch  ? parseInt(critMatch[1])  : 0,
                };
            }

            const displays = [...liveText.matchAll(/"display"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
            const flags    = [...liveText.matchAll(/"flag"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
            const vals     = [...liveText.matchAll(/"value"\s*:\s*([\d.]+)/g)].map(m => parseFloat(m[1]));
            const units    = [...liveText.matchAll(/"unit"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
            const loincs   = [...liveText.matchAll(/"loinc"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
            if (displays.length > 0) {
                partial.flagged_results = displays.map((display, i) => ({
                    display, loinc: loincs[i] || "", flag: flags[i] || "",
                    value: vals[i] || 0, unit: units[i] || "",
                    reference_range: "", clinical_significance: "",
                }));
            }

            const scoreMatch = liveText.match(/"score"\s*:\s*(\d+)/);
            const riskMatch  = liveText.match(/"risk_category"\s*:\s*"([^"]+)"/);
            if (scoreMatch || riskMatch) {
                partial.severity_score = {
                    score:         scoreMatch ? parseInt(scoreMatch[1]) : 0,
                    risk_category: riskMatch  ? riskMatch[1]           : "...",
                };
            }

            if (Object.keys(partial).length > 0) setPartialResult(partial);
        } catch { /* ignore incremental parse errors */ }
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

    const runLabAnalysis = async (patientState, diagnosisOutput) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const body = { patient_state: patientState };
            if (diagnosisOutput) body.diagnosis_agent_output = diagnosisOutput;

            const response = await fetch("http://127.0.0.1:8003/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: abortControllerRef.current.signal,
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
                    const payload = line.slice(6);
                    if (payload === "[DONE]") { setIsStreaming(false); continue; }
                    try {
                        const event = JSON.parse(payload);
                        if (event.type === "token") {
                            setLiveText(prev => prev + event.token);
                        } else {
                            setStreamEvents(prev => [...prev, event]);
                            if (event.type === "status")   setCurrentStep(event.message);
                            if (event.type === "complete") { setFinalResult(event.data); setCurrentStep(null); setIsStreaming(false); }
                            if (event.type === "error")    { setError(event.message); if (event.fatal) setIsStreaming(false); }
                        }
                    } catch { /* ignore */ }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") { setError(err.message); setIsStreaming(false); }
        }
    };

    const displayResult = finalResult || partialResult;
    const isFinal = !!finalResult;

    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes pulse   { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar       { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: var(--color-surface); }
                ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
                select option             { background: var(--color-bg); color: var(--color-text); }
            `}</style>

            {/* Sticky Nav */}
            <div style={{
                position: "sticky", top: 0, zIndex: 50,
                background: `color-mix(in srgb, ${C.bg} 92%, transparent)`,
                backdropFilter: "blur(12px)",
                borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px", height: 56,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button
                        onClick={() => navigate("/dashboard/microservices")}
                        style={{
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
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 26, height: 26, background: C.cyan, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 4 }}>
                            <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>MT</span>
                        </div>
                        {[
                            { label: "MediTwin AI",   path: "/" },
                            { label: "Dashboard",     path: "/dashboard" },
                            { label: "Microservices", path: "/dashboard/microservices" },
                        ].map(crumb => (
                            <span key={crumb.path} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                                <button
                                    onClick={() => navigate(crumb.path)}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, transition: "color 0.2s", padding: 0 }}
                                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                >{crumb.label}</button>
                            </span>
                        ))}
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text }}>
                                Lab Analysis Agent
                            </span>
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11 }}>
                        <Wifi size={11} color={C.cyan} />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8003</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${C.border}`, color: C.cyan }}>
                        A2A
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* Page Header */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.cyan}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                            <FlaskConical size={18} color={C.cyan} strokeWidth={1.75} />
                            {isStreaming && (
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: C.cyan, animation: "pulse 1s infinite" }} />
                            )}
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Agent 03</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Lab Analysis Agent
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 660 }}>
                        LOINC-aware lab intelligence engine with pattern analysis, diagnosis confirmation, severity scoring, and real-time clinical decision support via streaming SSE.
                    </p>
                </div>
            </div>

            {/* Main 2-col Grid */}
            <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start",
            }}>
                <LabInputPanel
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    onSubmit={runLabAnalysis}
                    isStreaming={isStreaming}
                />
                <LabResultsPanel
                    isStreaming={isStreaming}
                    currentStep={currentStep}
                    error={error}
                    streamEvents={streamEvents}
                    eventsEndRef={eventsEndRef}
                    liveText={liveText}
                    finalResult={finalResult}
                    displayResult={displayResult}
                    isFinal={isFinal}
                    expandedFlag={expandedFlag}
                    setExpandedFlag={setExpandedFlag}
                    expandedPattern={expandedPattern}
                    setExpandedPattern={setExpandedPattern}
                    handleCopy={handleCopy}
                    handleAbort={handleAbort}
                    copied={copied}
                />
            </div>

            {/* History */}
            <div style={{ maxWidth: 1400, margin: "0 auto 40px", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: C.muted, padding: "0 12px" }}>Fetch History</span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <LabHistory defaultPatientId="" />
            </div>
        </div>
    );
}
