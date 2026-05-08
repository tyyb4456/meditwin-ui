import { useState, useRef } from "react";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";
import { Workflow, ArrowLeft, ChevronRight, Wifi, Loader2 } from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import InputPanel from "../components/orchestrator/InputPanel";
import StreamPanel from "../components/orchestrator/StreamPanel";
import AgentStatusGrid, { IdlePlaceholder } from "../components/orchestrator/AgentStatusGrid";
import ResultsPanel from "../components/orchestrator/ResultsPanel";
import { LiveTextPanel } from "../components/orchestrator/StreamPanel";
import { GLOBAL_STYLES, BG, SURFACE, BORDER, TEXT, MUTED, SUBTLE, ACCENT, CYAN, PURPLE } from "../components/orchestrator/tokens";

const INITIAL_RESULTS = {
    patient_context: null, diagnosis: null, lab_analysis: null,
    drug_safety: null, imaging_triage: null, digital_twin: null,
    consensus: null, explanation: null, final: null,
};

export default function OrchestratorPage() {
    const navigate = useNavigate();
    const [isStreaming,  setIsStreaming]  = useState(false);
    const [streamEvents, setStreamEvents] = useState([]);
    const [liveText,     setLiveText]     = useState("");
    const [results,      setResults]      = useState(INITIAL_RESULTS);
    const [currentStep,  setCurrentStep]  = useState(null);
    const [error,        setError]        = useState(null);
    const [copied,       setCopied]       = useState(false);

    const abortControllerRef = useRef(null);

    const handleReset = () => {
        setStreamEvents([]); setLiveText(""); setCurrentStep(null);
        setError(null); setCopied(false); setResults(INITIAL_RESULTS);
    };

    const handleCopy = () => {
        const text = results.final ? JSON.stringify(results.final, null, 2) : liveText;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAbort = () => { abortControllerRef.current?.abort(); setIsStreaming(false); };

    const runOrchestrator = async (payload) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();
        try {
            const response = await fetch(`${API.ORCHESTRATOR}/analyze/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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
                    const dataStr = line.slice(6);
                    if (dataStr === "[DONE]") { setIsStreaming(false); continue; }
                    try {
                        const event = JSON.parse(dataStr);
                        if (event.type === "token") {
                            setLiveText(prev => prev + event.token);
                        } else {
                            setStreamEvents(prev => [...prev, event]);
                            if (event.type === "status") setCurrentStep(event.message);
                            else if (event.type === "result" || event.type === "complete") {
                                if (event.node) setResults(prev => ({ ...prev, [event.node]: event.data || event.summary || event }));
                            } else if (event.type === "final") {
                                setResults(prev => ({ ...prev, final: event.data }));
                                setCurrentStep("Analysis Complete");
                            } else if (event.type === "error" && event.fatal) {
                                setError(event.message);
                                setIsStreaming(false);
                            }
                        }
                    } catch { }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") { setError(err.message); setIsStreaming(false); }
        }
    };

    const isWorking = (nodeNames) => {
        if (!isStreaming || results.final) return false;
        return nodeNames.some(n => !results[n]);
    };

    const finalData  = results.final;
    const hasResults = isStreaming || streamEvents.length > 0;

    return (
        <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{GLOBAL_STYLES}</style>

            {/* Sticky nav */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50, height: 56,
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
                        <div style={{ width: 24, height: 24, background: ACCENT, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>MT</span>
                        </div>
                        <ChevronRight size={10} color={SUBTLE} />
                        <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: SUBTLE, padding: 0 }}>Dashboard</button>
                        <ChevronRight size={10} color={SUBTLE} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Orchestrator</span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "4px 10px" }}>
                        <Wifi size={10} color={ACCENT} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8000</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${ACCENT}40`, borderRadius: 7, color: ACCENT, background: `${ACCENT}0E` }}>A2A</div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Hero */}
            <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${ACCENT}, ${CYAN}, ${PURPLE}, rgba(99,102,241,0.3))` }} />
                <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}0E 0%, transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ maxWidth: 1500, margin: "0 auto", padding: "28px 24px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 24px ${ACCENT}30` }}>
                            <Workflow size={22} color="#fff" strokeWidth={1.75} />
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT }}>Omni-Agent Pipeline</span>
                                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}50`, background: `${ACCENT}0E`, padding: "1px 6px", borderRadius: 4 }}>A2A</span>
                                {isStreaming && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: ACCENT }}>
                                        <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Running
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, margin: 0, lineHeight: 1 }}>Orchestrator Mode</h1>
                            <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0" }}>8-agent clinical pipeline · FHIR R4 · Digital Twin · Consensus arbitration · LLM narrative synthesis</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main layout */}
            <div style={{ maxWidth: 1500, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, alignItems: "start" }}>

                {/* LEFT: Input + SSE log */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 72 }}>
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                        <InputPanel onSubmit={runOrchestrator} isStreaming={isStreaming} />
                    </div>
                    <StreamPanel streamEvents={streamEvents} isStreaming={isStreaming} onAbort={handleAbort} />
                </div>

                {/* RIGHT: Results */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {!hasResults && <IdlePlaceholder />}
                    {hasResults && <AgentStatusGrid results={results} isStreaming={isStreaming} isWorking={isWorking} />}
                    {(isStreaming || liveText) && !finalData && (
                        <LiveTextPanel liveText={liveText} copied={copied} onCopy={handleCopy} />
                    )}
                    <ResultsPanel
                        finalData={finalData}
                        streamEvents={streamEvents}
                        isStreaming={isStreaming}
                        currentStep={currentStep}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
}
