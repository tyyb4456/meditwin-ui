import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity, ShieldAlert, HeartPulse, BrainCircuit,
    Pill, Image as ImageIcon, FileJson, Play, X,
    AlertCircle, Loader2, Workflow, ArrowLeft, ChevronRight,
    Wifi, CheckCircle2, Copy, Check, Upload, Trash2
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

// ── CSS variable colour tokens (theme-aware) ────────────────────────────────
const C = {
    bg: "var(--color-bg)",
    surface: "var(--color-surface)",
    border: "var(--color-border)",
    accent: "var(--color-accent)",
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
    dim: "var(--color-border)",
    green: "#22C55E",
    yellow: "#EAB308",
    red: "#EF4444",
    cyan: "#06B6D4",
    purple: "#8b5cf6",
    pink: "#ec4899",
    orange: "#f97316"
};

// ── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
    width: "100%", background: C.bg, border: `1px solid ${C.border}`,
    color: C.text, padding: "8px 10px", fontSize: 13, outline: "none",
    fontFamily: "inherit", borderRadius: 0,
};

const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: C.muted, marginBottom: 6,
};

function Field({ label, children }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

// ── JSON input mode ──────────────────────────────────────────────────────────
function JsonInputMode({ onSubmit, isStreaming }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify({
        patient_id: "example-patient-001",
        chief_complaint: "fever and weakness",
        fhir_base_url: "https://hapi.fhir.org/baseR4",
    }, null, 2));
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            setImagePreview(dataUrl);
            setImageBase64(dataUrl.split(',')[1]);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        // Reset file input if needed
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.patient_id || !parsed.chief_complaint) throw new Error("Missing required fields: patient_id and chief_complaint");
            if (imageBase64) {
                parsed.image_data = imageBase64;
            }
            onSubmit(parsed);
        } catch (err) { setError(err.message); }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
                <label style={labelStyle}>Request Payload (JSON)</label>
                <textarea
                    value={jsonInput}
                    onChange={(e) => { setJsonInput(e.target.value); setError(""); }}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
                    rows={8} spellCheck={false}
                />
            </div>
            
            <div>
                <label style={labelStyle}>Medical Image (Chest X-Ray)</label>
                {!imagePreview ? (
                    <div>
                        <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        <label htmlFor="image-upload" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '12px', border: `1px dashed ${C.border}`, background: `color-mix(in srgb, ${C.accent} 5%, transparent)`,
                            color: C.accent, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer',
                            textTransform: 'uppercase', transition: 'background 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.background = `color-mix(in srgb, ${C.accent} 10%, transparent)`} onMouseLeave={e => e.currentTarget.style.background = `color-mix(in srgb, ${C.accent} 5%, transparent)`}>
                            <Upload size={14} /> Upload Image (Optional)
                        </label>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, border: `1px solid ${C.border}`, background: C.bg }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={imagePreview} alt="Preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2 }} />
                            <span style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>Image Ready</span>
                        </div>
                        <button type="button" onClick={handleRemoveImage} style={{
                            background: 'none', border: 'none', color: C.red, cursor: 'pointer', padding: 6, display: 'flex'
                        }}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={14} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                </div>
            )}
            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? C.dim : C.accent,
                border: "none", color: "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Running Workflow...</>
                    : <><Play size={15} /> Run Orchestrator</>}
            </button>
        </form>
    );
}

// ── Agent Cell Component ──────────────────────────────────────────────────────
function AgentCell({ title, icon: Icon, color, data, isLoading, isError, children }) {
    const isCompleted = !!data;
    
    return (
        <div style={{
            background: C.bg, 
            border: `1px solid ${isCompleted ? color : isError ? C.red : C.border}`,
            borderLeft: `4px solid ${isCompleted ? color : isError ? C.red : C.dim}`,
            padding: 14,
            opacity: isLoading || isCompleted || isError ? 1 : 0.4,
            transition: "all 0.3s ease"
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, background: `${color}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={12} color={color} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text }}>
                        {title}
                    </span>
                </div>
                {isLoading && !isCompleted && <Loader2 size={12} color={color} style={{ animation: "spin 1s linear infinite" }} />}
                {isCompleted && !isError && <CheckCircle2 size={12} color={color} />}
                {isError && <AlertCircle size={12} color={C.red} />}
            </div>
            
            <div style={{ minHeight: 40 }}>
                {isCompleted ? children : isLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                        <div style={{ width: "100%", height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: "60%", height: "100%", background: color, animation: "pulse 1.5s infinite" }} />
                        </div>
                    </div>
                ) : (
                    <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>Waiting...</p>
                )}
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function OrchestratorPage() {
    const navigate = useNavigate();
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamEvents, setStreamEvents] = useState([]);
    const [liveText, setLiveText] = useState("");
    
    // Track results per agent
    const [results, setResults] = useState({
        patient_context: null,
        diagnosis: null,
        lab_analysis: null,
        drug_safety: null,
        imaging_triage: null,
        digital_twin: null,
        consensus: null,
        explanation: null,
        final: null
    });
    
    const [currentStep, setCurrentStep] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const abortControllerRef = useRef(null);
    const eventsEndRef = useRef(null);

    useEffect(() => {
        if (isStreaming) {
            eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); 
        setResults({
            patient_context: null, diagnosis: null, lab_analysis: null, drug_safety: null,
            imaging_triage: null, digital_twin: null, consensus: null, explanation: null, final: null
        });
        setCurrentStep(null); 
        setError(null); 
        setLiveText("");
        setCopied(false);
    };

    const handleCopy = () => {
        const textToCopy = results.final ? JSON.stringify(results.final, null, 2) : liveText;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAbort = () => {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
    };

    const runOrchestrator = async (payload) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("http://127.0.0.1:8000/analyze/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const reader = response.body.getReader();
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
                    const dataStr = line.slice(6);
                    if (dataStr === "[DONE]") { setIsStreaming(false); continue; }
                    
                    try {
                        const event = JSON.parse(dataStr);
                        if (event.type === "token") {
                            setLiveText(prev => prev + event.token);
                        } else {
                            setStreamEvents(prev => [...prev, event]);
                            
                            if (event.type === "status") {
                                setCurrentStep(event.message);
                            } else if (event.type === "result" || event.type === "complete") {
                                if (event.node) {
                                    setResults(prev => ({ ...prev, [event.node]: event.data || event.summary || event }));
                                }
                            } else if (event.type === "final") {
                                setResults(prev => ({ ...prev, final: event.data }));
                                setCurrentStep("Analysis Complete");
                            } else if (event.type === "error") {
                                if (event.fatal) {
                                    setError(event.message);
                                    setIsStreaming(false);
                                }
                            }
                        }
                    } catch { /* ignore */ }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") { setError(err.message); setIsStreaming(false); }
        }
    };

    // ── event badge colours ──
    const eventBadgeStyle = (type) => {
        const map = { error: [C.red, "#FEE2E2"], complete: [C.green, "#DCFCE7"], result: [C.green, "#DCFCE7"], final: [C.purple, "#F3E8FF"], status: [C.cyan, "#CFFAFE"], progress: [C.yellow, "#FEF9C3"] };
        const [fg, bg] = map[type] || ["#6B7280", "#F3F4F6"];
        return { fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 2, color: fg, background: bg, fontFamily: "monospace" };
    };
    
    const isWorking = (nodeNames) => {
        if (!isStreaming) return false;
        if (results.final) return false;
        // True if any of the provided node names have not yet completed but we are streaming
        for (const name of nodeNames) {
            if (!results[name]) return true;
        }
        return false;
    };

    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: var(--color-surface); }
                ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
            `}</style>

            {/* ── Sticky Top Nav ── */}
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
                        onClick={() => navigate("/dashboard")}
                        style={{
                            background: "none", border: `1px solid ${C.border}`,
                            color: C.muted, padding: "5px 10px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 5, fontSize: 11,
                            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                            transition: "color 0.2s, border-color 0.2s",
                        }}
                    >
                        <ArrowLeft size={11} /> Back
                    </button>

                    <div style={{ width: 1, height: 20, background: C.border }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 26, height: 26, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 4 }}>
                            <span style={{ color: "var(--color-bg)", fontSize: 9, fontWeight: 900 }}>MT</span>
                        </div>
                        {[
                            { label: "MediTwin AI", path: "/" },
                            { label: "Dashboard", path: "/dashboard" },
                        ].map(crumb => (
                            <span key={crumb.path} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                                <button
                                    onClick={() => navigate(crumb.path)}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, padding: 0 }}
                                >{crumb.label}</button>
                            </span>
                        ))}
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text }}>
                                Orchestrator Mode
                            </span>
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11 }}>
                        <Wifi size={11} color={C.accent} />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8000</span>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* ── Page Header ── */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            <Workflow size={18} color={C.accent} strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Omni-Agent Pipeline</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Orchestrator Mode Stream
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 600 }}>
                        Triggers all microservices in sequence and parallel to formulate a comprehensive clinical evaluation.
                    </p>
                </div>
            </div>

            {/* ── Main 2-col grid ── */}
            <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start",
            }}>

                {/* ── LEFT: Input & Stream ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 20 }}>
                        <JsonInputMode onSubmit={runOrchestrator} isStreaming={isStreaming} />
                    </div>
                    
                    {/* Raw SSE event log */}
                    <div style={{ border: `1px solid ${C.border}`, background: C.surface, flex: 1 }}>
                        <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})`, display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text }}>
                                Raw SSE Stream
                            </span>
                            {isStreaming && (
                                <button onClick={handleAbort} style={{
                                    padding: "2px 8px", border: `1px solid ${C.red}`, color: C.red,
                                    background: "none", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                                    textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                                }}>
                                    <X size={9} /> Abort
                                </button>
                            )}
                        </div>
                        <div style={{ padding: "8px 12px", height: "400px", overflowY: "auto", fontFamily: "monospace", fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                            {streamEvents.length === 0
                                ? <p style={{ color: C.muted, fontStyle: "italic", margin: 0 }}>Waiting for stream to start...</p>
                                : streamEvents.map((event, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                                        <span style={eventBadgeStyle(event.type)}>{event.type}</span>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <span style={{ color: C.text, fontSize: 10, fontWeight: "bold" }}>{event.node?.toUpperCase()}</span>
                                            {event.message && <span style={{ color: C.muted, fontSize: 11 }}>{event.message}</span>}
                                        </div>
                                    </div>
                                ))
                            }
                            <div ref={eventsEndRef} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Structured Grids ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Status header */}
                    {currentStep && (
                        <div style={{ padding: "10px 14px", background: results.final ? C.green : C.accent, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: results.final ? "none" : "pulse 2s infinite" }}>
                            {!results.final && <Loader2 size={14} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />}
                            {results.final && <CheckCircle2 size={14} style={{ flexShrink: 0 }} />}
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{currentStep}</span>
                        </div>
                    )}
                    
                    {error && (
                        <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <AlertCircle size={14} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: "0 0 3px" }}>Pipeline Error</p>
                                <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {!isStreaming && streamEvents.length === 0 && (
                        <div style={{ border: `1px solid ${C.border}`, padding: 48, textAlign: "center", background: C.surface }}>
                            <Workflow size={40} color={C.dim} style={{ margin: "0 auto 12px" }} strokeWidth={1} />
                            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                                Press Run Orchestrator to orchestrate the AI workflow.
                            </p>
                        </div>
                    )}

                    {(isStreaming || streamEvents.length > 0) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {/* Patient Context */}
                            <AgentCell 
                                title="Patient Context" icon={HeartPulse} color={C.cyan} 
                                isLoading={isWorking(["patient_context"])} data={results.patient_context}
                            >
                                <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: "bold" }}>
                                    {results.patient_context?.patient_state?.demographics?.name || "Patient Data Fetch"}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                                    {results.patient_context?.patient_state?.active_conditions?.length || 0} active conditions
                                </p>
                            </AgentCell>

                            {/* Diagnosis */}
                            <AgentCell 
                                title="Diagnosis Agent" icon={BrainCircuit} color={C.purple} 
                                isLoading={isWorking(["diagnosis"])} data={results.diagnosis}
                            >
                                <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: "bold" }}>
                                    {results.diagnosis?.top_diagnosis || "N/A"}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                                    Confidence: <span style={{ color: results.diagnosis?.confidence_level === "HIGH" ? C.green : C.yellow }}>{results.diagnosis?.confidence_level || "-"}</span>
                                </p>
                            </AgentCell>

                            {/* Lab Analysis */}
                            <AgentCell 
                                title="Lab Analysis" icon={Activity} color={C.green} 
                                isLoading={isWorking(["lab_analysis"])} data={results.lab_analysis}
                            >
                                <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: "bold" }}>
                                    {results.lab_analysis?.summary || "Routine labs normal"}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                                    {results.lab_analysis?.critical_flags?.length || 0} Critical Flags
                                </p>
                            </AgentCell>

                            {/* Drug Safety */}
                            <AgentCell 
                                title="Drug Safety MCP" icon={Pill} color={C.orange} 
                                isLoading={isWorking(["drug_safety"])} data={results.drug_safety}
                            >
                                <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: "bold" }}>
                                    {results.drug_safety?.safety_status?.replace(/_/g, " ") || "Safe"}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                                    {results.drug_safety?.interactions?.length || 0} Interactions Found
                                </p>
                            </AgentCell>

                            {/* Digital Twin */}
                            <AgentCell 
                                title="Digital Twin" icon={Workflow} color={C.pink} 
                                isLoading={isWorking(["digital_twin"])} data={results.digital_twin}
                            >
                                <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: "bold" }}>
                                    Option {results.digital_twin?.recommended_option} selected
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                                    Simulations finished processing
                                </p>
                            </AgentCell>

                            {/* Consensus */}
                            <AgentCell 
                                title="Consensus Agent" icon={CheckCircle2} color={C.accent} 
                                isLoading={isWorking(["consensus", "final"])} data={results.consensus}
                            >
                                <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: "bold" }}>
                                    {results.consensus?.consensus_status?.replace(/_/g, " ") || "Full Consensus"}
                                </p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                                    {results.consensus?.conflict_count || 0} Conflicts detected
                                </p>
                            </AgentCell>
                        </div>
                    )}
                    
                    {/* Live LLM Box for final output explanation */}
                    {(liveText || results.final) && (
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 14, flex: 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {results.final ? (
                                        <FileJson size={12} color={C.green} />
                                    ) : (
                                        <Loader2 size={12} color={C.accent} style={{ animation: "spin 2s linear infinite" }} />
                                    )}
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: results.final ? C.green : C.muted, margin: 0 }}>
                                        {results.final ? "Final Response" : "Live Output"}
                                    </p>
                                </div>
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
                                flex: 1, minHeight: 200, overflowY: "auto", background: "#080810", padding: 14,
                                border: `1px solid ${C.border}`, borderRadius: 2
                            }}>
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                    {results.final ? JSON.stringify(results.final, null, 2) : liveText}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
