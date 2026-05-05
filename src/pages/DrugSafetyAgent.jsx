import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, ChevronRight, Wifi } from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import DrugSafetyHistory from "../components/history/DrugSafetyHistory";
import DrugInputPanel from "../components/agents/drug/DrugInputPanel";
import DrugResultsPanel from "../components/agents/drug/DrugResultsPanel";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    text: "var(--color-text)", muted: "var(--color-text-subtle)", dim: "var(--color-border)",
    amber: "#F59E0B",
};

export default function DrugSafetyAgent() {
    const navigate = useNavigate();

    const [inputMode,        setInputMode]        = useState("form");
    const [isStreaming,      setIsStreaming]       = useState(false);
    const [streamEvents,     setStreamEvents]     = useState([]);
    const [finalResult,      setFinalResult]      = useState(null);
    const [currentStep,      setCurrentStep]      = useState(null);
    const [error,            setError]            = useState(null);
    const [liveText,         setLiveText]         = useState("");
    const [partialResult,    setPartialResult]    = useState(null);
    const [copied,           setCopied]           = useState(false);
    const [expandedContra,   setExpandedContra]   = useState(null);
    const [expandedInteract, setExpandedInteract] = useState(null);
    const [expandedAlt,      setExpandedAlt]      = useState(null);

    const abortControllerRef = useRef(null);
    const eventsEndRef       = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setLiveText(""); setCopied(false);
        setExpandedContra(null); setExpandedInteract(null); setExpandedAlt(null);
    };

    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = {};

            const safetyMatch = liveText.match(/"safety_status"\s*:\s*"([^"]+)"/);
            if (safetyMatch) partial.safety_status = safetyMatch[1];

            const approvedMatch = [...liveText.matchAll(/"approved_medications"\s*:\s*\[([^\]]*)\]/g)];
            const flaggedMatch  = [...liveText.matchAll(/"flagged_medications"\s*:\s*\[([^\]]*)\]/g)];
            if (approvedMatch.length) {
                const raw = approvedMatch[approvedMatch.length - 1][1];
                partial.approved_medications = raw.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) || [];
            }
            if (flaggedMatch.length) {
                const raw = flaggedMatch[flaggedMatch.length - 1][1];
                partial.flagged_medications = raw.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) || [];
            }

            const riskMatch = liveText.match(/"overall_risk_level"\s*:\s*"([^"]+)"/);
            if (riskMatch) partial.patient_risk_profile = { overall_risk_level: riskMatch[1] };

            const propMatch   = liveText.match(/"proposed_count"\s*:\s*(\d+)/);
            const appMatch    = liveText.match(/"approved_count"\s*:\s*(\d+)/);
            const flagMatch   = liveText.match(/"flagged_count"\s*:\s*(\d+)/);
            const interMatch  = liveText.match(/"interaction_count"\s*:\s*(\d+)/);
            const contraMatch = liveText.match(/"contraindication_count"\s*:\s*(\d+)/);
            const bbMatch     = liveText.match(/"black_box_warnings"\s*:\s*(\d+)/);
            if (propMatch || appMatch || flagMatch) {
                partial.summary = {
                    proposed_count:         propMatch   ? parseInt(propMatch[1])   : 0,
                    approved_count:         appMatch    ? parseInt(appMatch[1])    : 0,
                    flagged_count:          flagMatch   ? parseInt(flagMatch[1])   : 0,
                    interaction_count:      interMatch  ? parseInt(interMatch[1])  : 0,
                    contraindication_count: contraMatch ? parseInt(contraMatch[1]) : 0,
                    black_box_warnings:     bbMatch     ? parseInt(bbMatch[1])     : 0,
                };
            }

            if (Object.keys(partial).length > 0) setPartialResult(partial);
        } catch { /* ignore */ }
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

    const runDrugSafety = async (payload) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("http://127.0.0.1:8004/stream", {
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

    const handleFormSubmit = (payload) => runDrugSafety(payload);
    const handleJsonSubmit = (payload) => runDrugSafety(payload);

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
                        <div style={{ width: 26, height: 26, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 4 }}>
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
                                Drug Safety Agent
                            </span>
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11 }}>
                        <Wifi size={11} color={C.amber} />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8004</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${C.border}`, color: C.amber }}>
                        MCP
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* Page Header */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.amber}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                            <Shield size={18} color={C.amber} strokeWidth={1.75} />
                            {isStreaming && (
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: C.amber, animation: "pulse 1s infinite" }} />
                            )}
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Agent 04</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Drug Safety Agent
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 660 }}>
                        Pharmacovigilance engine using RxNorm and DrugBank. Detects drug interactions, contraindications, allergy conflicts, and black-box warnings with LLM-enriched streaming narrative.
                    </p>
                </div>
            </div>

            {/* Main 2-col Grid */}
            <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start",
            }}>
                <DrugInputPanel
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    onSubmit={runDrugSafety}
                    isStreaming={isStreaming}
                />
                <DrugResultsPanel
                    isStreaming={isStreaming}
                    currentStep={currentStep}
                    error={error}
                    streamEvents={streamEvents}
                    eventsEndRef={eventsEndRef}
                    liveText={liveText}
                    finalResult={finalResult}
                    displayResult={displayResult}
                    isFinal={isFinal}
                    expandedContra={expandedContra}
                    setExpandedContra={setExpandedContra}
                    expandedInteract={expandedInteract}
                    setExpandedInteract={setExpandedInteract}
                    expandedAlt={expandedAlt}
                    setExpandedAlt={setExpandedAlt}
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
                <DrugSafetyHistory defaultPatientId="" />
            </div>
        </div>
    );
}
