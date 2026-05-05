import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Microscope, FileJson, FormInput, Play, X,
    CheckCircle2, AlertCircle, Loader2, ChevronDown,
    Activity, Pill, AlertTriangle, Clock, TrendingUp,
    ArrowLeft, ChevronRight, Wifi, Copy, Check, Zap,
    Brain, BarChart2,
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import DiagnosisHistory from "../components/history/DiagnosisHistory";

const ACCENT = "var(--color-accent)";
const BG = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const SURFACE2 = "var(--color-surface-2)";
const BORDER = "var(--color-border)";
const TEXT = "var(--color-text)";
const MUTED = "var(--color-text-muted)";
const SUBTLE = "var(--color-text-subtle)";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const CYAN = "#06B6D4";
const PURPLE = "#8B5CF6";

const EXAMPLE_PATIENT_STATE = {
    patient_id: "example-patient-001",
    demographics: { name: "Aseel Mustafa", age: 56, gender: "male", dob: "1970-01-01" },
    active_conditions: [],
    medications: [{ drug: "Amoxicillin 500mg", dose: "Take 1 capsule 3 times a day", frequency: "1x per 1d", status: "active" }],
    allergies: [],
    lab_results: [],
    diagnostic_reports: [{ code: "58410-2", display: "Hemograma completo", conclusion: "Hemograma dentro dos limites normais.", issued: "2026-04-13T15:31:13Z" }],
    recent_encounters: [],
    state_timestamp: new Date().toISOString(),
    imaging_available: false,
};

const inputStyle = {
    width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8,
    color: TEXT, padding: "9px 12px", fontSize: 13, outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s",
};
const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase", color: SUBTLE, marginBottom: 6,
};

function Field({ label, children }) {
    return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

function FormInputMode({ onSubmit, isStreaming }) {
    const [formData, setFormData] = useState({
        patientId: "example-patient-001", name: "Aseel Mustafa", age: "56",
        gender: "male", dob: "1970-01-01", chiefComplaint: "fever and weakness",
        medications: "Amoxicillin 500mg, 1 capsule 3x daily",
        allergies: "", conditions: "",
        diagnosticReports: "Hemograma completo - within normal limits",
    });
    const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const parseMeds = (str) => str.trim() ? str.split("\n").map(line => { const p = line.split(",").map(s => s.trim()); return { drug: p[0] || "", dose: p[1] || "", frequency: p[2] || "1x per 1d", status: "active" }; }) : [];
        const parseConds = (str) => str.trim() ? str.split("\n").map(line => ({ code: "UNKNOWN", display: line.trim(), onset: new Date().toISOString() })) : [];
        const parseAllergies = (str) => str.trim() ? str.split("\n").map(line => ({ substance: line.trim(), reaction: "", severity: "unknown" })) : [];
        const parseDiag = (str) => str.trim() ? str.split("\n").map(line => ({ code: "UNKNOWN", display: line.split("-")[0].trim(), conclusion: line.split("-")[1]?.trim() || "", issued: new Date().toISOString() })) : [];
        onSubmit({
            patient_id: formData.patientId,
            demographics: { name: formData.name, age: parseInt(formData.age), gender: formData.gender, dob: formData.dob },
            active_conditions: parseConds(formData.conditions),
            medications: parseMeds(formData.medications),
            allergies: parseAllergies(formData.allergies),
            lab_results: [], diagnostic_reports: parseDiag(formData.diagnosticReports),
            recent_encounters: [], state_timestamp: new Date().toISOString(), imaging_available: false,
        }, formData.chiefComplaint);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Patient ID"><input style={inputStyle} value={formData.patientId} onChange={set("patientId")} required /></Field>
                <Field label="Patient Name"><input style={inputStyle} value={formData.name} onChange={set("name")} required /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Age"><input type="number" style={inputStyle} value={formData.age} onChange={set("age")} required /></Field>
                <Field label="Gender">
                    <select style={{ ...inputStyle, appearance: "none" }} value={formData.gender} onChange={set("gender")}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </Field>
                <Field label="Date of Birth"><input type="date" style={inputStyle} value={formData.dob} onChange={set("dob")} required /></Field>
            </div>
            <Field label="Chief Complaint *">
                <input style={{ ...inputStyle, borderColor: `${ACCENT}50` }} value={formData.chiefComplaint} onChange={set("chiefComplaint")} placeholder="e.g., fever and weakness" required />
            </Field>
            <Field label="Current Medications (one per line: drug, dose, frequency)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={formData.medications} onChange={set("medications")} placeholder="Amoxicillin 500mg, 1 capsule, 3x daily" />
            </Field>
            <Field label="Allergies (one per line)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={formData.allergies} onChange={set("allergies")} placeholder="Penicillin" />
            </Field>
            <Field label="Active Conditions (one per line)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={formData.conditions} onChange={set("conditions")} placeholder="Hypertension" />
            </Field>
            <Field label="Recent Diagnostic Reports (test - conclusion)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={formData.diagnosticReports} onChange={set("diagnosticReports")} placeholder="Hemograma - within normal limits" />
            </Field>
            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "12px 0", background: isStreaming ? SURFACE2 : ACCENT,
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 14px ${ACCENT}35`,
            }}>
                {isStreaming ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</> : <><Play size={14} /> Run Diagnosis</>}
            </button>
        </form>
    );
}

function JsonInputMode({ onSubmit, isStreaming }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify({ patient_state: EXAMPLE_PATIENT_STATE, chief_complaint: "fever and weakness", include_fhir_resources: true }, null, 2));
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault(); setError("");
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.patient_state || !parsed.chief_complaint) throw new Error("Missing required fields: patient_state and chief_complaint");
            onSubmit(parsed.patient_state, parsed.chief_complaint);
        } catch (err) { setError(err.message); }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
                <label style={labelStyle}>Request Payload (JSON)</label>
                <textarea value={jsonInput} onChange={(e) => { setJsonInput(e.target.value); setError(""); }}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
                    rows={24} spellCheck={false} />
            </div>
            {error && (
                <div style={{ padding: "10px 14px", background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                </div>
            )}
            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "12px 0", background: isStreaming ? SURFACE2 : ACCENT,
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 14px ${ACCENT}35`,
            }}>
                {isStreaming ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</> : <><Play size={14} /> Run Diagnosis</>}
            </button>
        </form>
    );
}

function ConfidenceBadge({ level }) {
    const map = { HIGH: [GREEN, "HIGH"], MODERATE: [AMBER, "MODERATE"], LOW: [RED, "LOW"] };
    const [color, label] = map[level] || [SUBTLE, level || "—"];
    const pct = level === "HIGH" ? 85 : level === "MODERATE" ? 60 : level === "LOW" ? 35 : 10;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: "-0.01em" }}>{label}</span>
                <span style={{ fontSize: 11, color: MUTED }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
        </div>
    );
}

export default function DiagnosisAgent() {
    const navigate = useNavigate();
    const [inputMode, setInputMode] = useState("form");
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamEvents, setStreamEvents] = useState([]);
    const [finalResult, setFinalResult] = useState(null);
    const [currentStep, setCurrentStep] = useState(null);
    const [error, setError] = useState(null);
    const [expandedDiagnosis, setExpandedDiagnosis] = useState(null);
    const [liveText, setLiveText] = useState("");
    const [partialResult, setPartialResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const abortControllerRef = useRef(null);
    const eventsEndRef = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setExpandedDiagnosis(null);
        setLiveText(""); setCopied(false);
    };

    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = { differential_diagnosis: [] };
            const blocks = liveText.split(/"rank"\s*:\s*\d+/).slice(1);
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                const displayMatch = block.match(/"display"\s*:\s*"([^"]+)"/);
                const codeMatch = block.match(/"icd10_code"\s*:\s*"([^"]+)"/);
                const confMatch = block.match(/"confidence"\s*:\s*(0\.\d+)/);
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
                partial.top_diagnosis = top.display; partial.top_icd10_code = top.icd10_code;
                if (top.confidence >= 0.75) partial.confidence_level = "HIGH";
                else if (top.confidence >= 0.5) partial.confidence_level = "MODERATE";
                else if (top.confidence > 0) partial.confidence_level = "LOW";
                setPartialResult(partial);
            }
        } catch { }
    }, [liveText, isStreaming, finalResult]);

    const handleCopy = () => {
        navigator.clipboard.writeText(finalResult ? JSON.stringify(finalResult, null, 2) : liveText);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };
    const handleAbort = () => { abortControllerRef.current?.abort(); setIsStreaming(false); };

    const runDiagnosis = async (patientState, chiefComplaint) => {
        handleReset(); setIsStreaming(true);
        abortControllerRef.current = new AbortController();
        try {
            const response = await fetch("http://127.0.0.1:8002/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_state: patientState, chief_complaint: chiefComplaint, include_fhir_resources: true }),
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
                const lines = buffer.split("\n"); buffer = lines.pop() || "";
                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const payload = line.slice(6);
                    if (payload === "[DONE]") { setIsStreaming(false); continue; }
                    try {
                        const event = JSON.parse(payload);
                        if (event.type === "token") { setLiveText(prev => prev + event.token); }
                        else {
                            setStreamEvents(prev => [...prev, event]);
                            if (event.type === "status") setCurrentStep(event.message);
                            else if (event.type === "complete") { setFinalResult(event.data); setCurrentStep(null); }
                            else if (event.type === "error") { setError(event.message); if (event.fatal) setIsStreaming(false); }
                        }
                    } catch { }
                }
            }
        } catch (err) { if (err.name !== "AbortError") { setError(err.message); setIsStreaming(false); } }
    };

    const eventColor = { error: RED, complete: GREEN, status: CYAN, progress: AMBER };
    const displayResult = finalResult || partialResult;

    return (
        <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 4px; }
                select option { background: var(--color-bg); color: var(--color-text); }
                input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
                input:focus, textarea:focus, select:focus { border-color: ${ACCENT} !important; outline: none; }
            `}</style>

            {/* ── Sticky top nav ── */}
            <div style={{
                position: "sticky", top: 0, zIndex: 50, height: 56,
                background: "color-mix(in srgb, var(--color-bg) 90%, transparent)",
                backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => navigate("/dashboard/microservices")} style={{
                        background: "none", border: `1px solid ${BORDER}`, color: SUBTLE, borderRadius: 7,
                        padding: "5px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s",
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
                        {[{ label: "Dashboard", path: "/dashboard" }, { label: "Microservices", path: "/dashboard/microservices" }].map(c => (
                            <span key={c.path} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <ChevronRight size={10} color={SUBTLE} />
                                <button onClick={() => navigate(c.path)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: SUBTLE, padding: 0, transition: "color 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.color = TEXT}
                                    onMouseLeave={e => e.currentTarget.style.color = SUBTLE}
                                >{c.label}</button>
                            </span>
                        ))}
                        <ChevronRight size={10} color={SUBTLE} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Diagnosis Agent</span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "4px 10px" }}>
                        <Wifi size={10} color={PURPLE} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8002</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${PURPLE}40`, borderRadius: 7, color: PURPLE, background: `${PURPLE}0E` }}>
                        A2A
                    </div>
                    <ThemeToggle />
                </div>
            </div>

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

                {/* ── LEFT: Input Panel ── */}
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", position: "sticky", top: 72 }}>
                    {/* Mode tabs */}
                    <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
                        {[{ id: "form", icon: FormInput, label: "Form Input" }, { id: "json", icon: FileJson, label: "Raw JSON" }].map(tab => (
                            <button key={tab.id} onClick={() => setInputMode(tab.id)} style={{
                                flex: 1, padding: "13px 0", border: "none", cursor: "pointer",
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                background: inputMode === tab.id ? `${PURPLE}15` : "transparent",
                                color: inputMode === tab.id ? PURPLE : SUBTLE,
                                borderBottom: inputMode === tab.id ? `2px solid ${PURPLE}` : "2px solid transparent",
                                transition: "all 0.2s",
                            }}>
                                <tab.icon size={13} /> {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: 20, maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                        {inputMode === "form"
                            ? <FormInputMode onSubmit={runDiagnosis} isStreaming={isStreaming} />
                            : <JsonInputMode onSubmit={runDiagnosis} isStreaming={isStreaming} />}
                    </div>
                </div>

                {/* ── RIGHT: Output Panel ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* Current step banner */}
                    {currentStep && (
                        <div style={{
                            background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`, borderRadius: 10,
                            padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                            animation: "pulse 2s ease-in-out infinite",
                        }}>
                            <Loader2 size={15} color={ACCENT} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{currentStep}</span>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{ background: `${RED}10`, border: `1px solid ${RED}40`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <AlertCircle size={15} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: RED, margin: "0 0 3px" }}>Stream Error</p>
                                <p style={{ fontSize: 12, color: RED, margin: 0, opacity: 0.8 }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* ── SSE Events Terminal ── */}
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: "11px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "color-mix(in srgb, var(--color-accent) 5%, var(--color-surface))" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: RED }} />
                                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: AMBER }} />
                                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: GREEN }} />
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT, marginLeft: 4 }}>SSE Events</span>
                                <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>({streamEvents.length})</span>
                            </div>
                            {isStreaming && (
                                <button onClick={handleAbort} style={{
                                    padding: "4px 12px", border: `1px solid ${RED}50`, color: RED, background: `${RED}10`,
                                    borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                                    textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                                }}>
                                    <X size={10} /> Abort
                                </button>
                            )}
                        </div>
                        <div style={{ padding: "8px 16px", maxHeight: 200, overflowY: "auto", background: "#07060F", display: "flex", flexDirection: "column", gap: 3 }}>
                            {streamEvents.length === 0
                                ? <p style={{ color: SUBTLE, fontStyle: "italic", margin: "16px 0", fontFamily: "monospace", fontSize: 12, opacity: 0.5 }}>Waiting for stream events...</p>
                                : streamEvents.map((event, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                                        <span style={{
                                            fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                                            padding: "2px 6px", borderRadius: 3, fontFamily: "monospace", flexShrink: 0,
                                            color: eventColor[event.type] || SUBTLE,
                                            background: `${eventColor[event.type] || SUBTLE}15`,
                                            border: `1px solid ${eventColor[event.type] || SUBTLE}30`,
                                        }}>{event.type}</span>
                                        {event.message && <span style={{ color: "#C5C5DE", fontSize: 11, fontFamily: "monospace" }}>{event.message}</span>}
                                        {event.pct !== undefined && <span style={{ color: SUBTLE, fontSize: 10, fontFamily: "monospace" }}>({event.pct}%)</span>}
                                    </div>
                                ))
                            }
                            <div ref={eventsEndRef} />
                        </div>
                    </div>

                    {/* ── Live / Final JSON Output ── */}
                    {(liveText || finalResult) && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "11px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {finalResult
                                        ? <CheckCircle2 size={13} color={GREEN} />
                                        : <Loader2 size={13} color={ACCENT} style={{ animation: "spin 2s linear infinite" }} />}
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: finalResult ? GREEN : MUTED }}>
                                        {finalResult ? "Final Clean JSON" : "Live LLM Output"}
                                    </span>
                                </div>
                                <button onClick={handleCopy} style={{
                                    background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6,
                                    padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center",
                                    gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                                }}>
                                    {copied ? <Check size={10} color={GREEN} /> : <Copy size={10} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <div style={{ maxHeight: 320, overflowY: "auto", background: "#07060F", padding: "14px 16px" }}>
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.65 }}>
                                    {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* ── Structured Results ── */}
                    {displayResult && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, opacity: finalResult ? 1 : 0.65, transition: "opacity 0.4s" }}>

                            {/* Summary row */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {/* Top diagnosis */}
                                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ACCENT}`, borderRadius: 10, padding: "16px 18px" }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 8px" }}>Top Diagnosis</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                        {!finalResult && <Loader2 size={12} color={ACCENT} style={{ animation: "spin 2s linear infinite", flexShrink: 0 }} />}
                                        <p style={{ fontSize: 14, fontWeight: 900, color: TEXT, margin: 0, lineHeight: 1.3 }}>{displayResult.top_diagnosis || "Calculating..."}</p>
                                    </div>
                                    <p style={{ fontSize: 10, color: SUBTLE, margin: 0, fontFamily: "monospace" }}>ICD-10: {displayResult.top_icd10_code || "—"}</p>
                                </div>
                                {/* Confidence */}
                                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CYAN}`, borderRadius: 10, padding: "16px 18px" }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 8px" }}>Confidence Level</p>
                                    <ConfidenceBadge level={displayResult.confidence_level} />
                                </div>
                            </div>

                            {/* Clinical alerts */}
                            {(displayResult.penicillin_allergy_flagged || displayResult.high_suspicion_sepsis || displayResult.requires_isolation) && (
                                <div style={{ background: `${AMBER}0D`, border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                        <AlertTriangle size={14} color={AMBER} />
                                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: AMBER }}>Clinical Alerts</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                        {displayResult.penicillin_allergy_flagged && <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: TEXT }}><div style={{ width: 6, height: 6, background: AMBER, borderRadius: "50%", marginTop: 4, flexShrink: 0 }} />Beta-lactam allergy detected — avoid penicillin-class antibiotics</div>}
                                        {displayResult.high_suspicion_sepsis && <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: TEXT }}><div style={{ width: 6, height: 6, background: RED, borderRadius: "50%", marginTop: 4, flexShrink: 0 }} />High suspicion of sepsis — urgent evaluation required</div>}
                                        {displayResult.requires_isolation && <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: TEXT }}><div style={{ width: 6, height: 6, background: PURPLE, borderRadius: "50%", marginTop: 4, flexShrink: 0 }} />Isolation precautions recommended</div>}
                                    </div>
                                </div>
                            )}

                            {/* Differential diagnosis grid */}
                            {displayResult.differential_diagnosis?.length > 0 && (
                                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${PURPLE} 6%, var(--color-surface))` }}>
                                        <BarChart2 size={13} color={PURPLE} />
                                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                            Differential Diagnosis ({displayResult.differential_diagnosis.length})
                                        </span>
                                        {!finalResult && <Loader2 size={10} color={SUBTLE} style={{ animation: "spin 2s linear infinite", marginLeft: 4 }} />}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: BORDER }}>
                                        {displayResult.differential_diagnosis.map((diag, idx) => (
                                            <div key={idx} style={{
                                                background: SURFACE, padding: 16,
                                                cursor: "pointer", transition: "background 0.18s",
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = `color-mix(in srgb, ${ACCENT} 6%, var(--color-surface))`}
                                                onMouseLeave={e => e.currentTarget.style.background = SURFACE}
                                                onClick={() => setExpandedDiagnosis(expandedDiagnosis === idx ? null : idx)}
                                            >
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                                                    <span style={{ width: 26, height: 26, background: idx === 0 ? ACCENT : SURFACE2, color: idx === 0 ? "#fff" : MUTED, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, flexShrink: 0, border: idx === 0 ? "none" : `1px solid ${BORDER}` }}>{diag.rank}</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.3 }}>{diag.display}</p>
                                                        <p style={{ fontSize: 10, color: SUBTLE, margin: "2px 0 0", fontFamily: "monospace" }}>{diag.icd10_code}</p>
                                                    </div>
                                                    <ChevronDown size={14} color={SUBTLE} style={{ flexShrink: 0, marginTop: 2, transform: expandedDiagnosis === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ flex: 1, height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                                                        <div style={{ height: "100%", width: `${diag.confidence * 100}%`, background: idx === 0 ? ACCENT : PURPLE, borderRadius: 2, transition: "width 0.6s ease" }} />
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, minWidth: 36, textAlign: "right" }}>{(diag.confidence * 100).toFixed(0)}%</span>
                                                </div>

                                                {expandedDiagnosis === idx && (
                                                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.2s ease" }}>
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 5px" }}>Clinical Reasoning</p>
                                                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{diag.clinical_reasoning}</p>
                                                        </div>
                                                        {diag.supporting_evidence?.length > 0 && (
                                                            <div>
                                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 5px" }}>Supporting Evidence</p>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    {diag.supporting_evidence.map((ev, i) => (
                                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: TEXT }}>
                                                                            <CheckCircle2 size={12} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {diag.against_evidence?.length > 0 && (
                                                            <div>
                                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 5px" }}>Against Evidence</p>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                    {diag.against_evidence.map((ev, i) => (
                                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: TEXT }}>
                                                                            <X size={12} color={RED} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommended next steps */}
                            {displayResult.recommended_next_steps?.length > 0 && (
                                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
                                        <Zap size={13} color={CYAN} />
                                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                            Recommended Next Steps ({displayResult.recommended_next_steps.length})
                                        </span>
                                    </div>
                                    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                        {displayResult.recommended_next_steps.map((step, idx) => (
                                            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: BG, borderLeft: `3px solid ${CYAN}`, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                                                <div style={{ width: 32, height: 32, background: `${CYAN}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 8 }}>
                                                    {step.category === "MEDICATION" ? <Pill size={14} color={CYAN} /> : step.category === "LABORATORY" ? <Activity size={14} color={CYAN} /> : <Clock size={14} color={CYAN} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", background: `${CYAN}18`, color: CYAN, borderRadius: 4 }}>{step.category}</span>
                                                        {step.urgency !== "routine" && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", background: `${RED}18`, color: RED, borderRadius: 4 }}>{step.urgency}</span>}
                                                    </div>
                                                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{step.description}</p>
                                                    {step.drug_name && <p style={{ fontSize: 11, color: MUTED, margin: "3px 0 0" }}>{step.drug_name} {step.drug_dose} {step.drug_route && `(${step.drug_route})`}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Idle placeholder */}
                            {!isStreaming && !finalResult && !partialResult && streamEvents.length === 0 && !error && (
                                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
                                    <div style={{ width: 56, height: 56, background: SURFACE2, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                                        <Brain size={24} color={SUBTLE} style={{ opacity: 0.4 }} />
                                    </div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, margin: "0 0 6px" }}>Ready to diagnose</p>
                                    <p style={{ fontSize: 12, color: SUBTLE, margin: 0, opacity: 0.7 }}>Fill in the form and hit Run Diagnosis to start streaming</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Idle state when nothing has run yet */}
                    {!displayResult && streamEvents.length === 0 && !isStreaming && !error && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
                            <div style={{ width: 56, height: 56, background: SURFACE2, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                                <Brain size={24} color={SUBTLE} style={{ opacity: 0.4 }} />
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, margin: "0 0 6px" }}>Ready to diagnose</p>
                            <p style={{ fontSize: 12, color: SUBTLE, margin: 0, opacity: 0.7 }}>Fill in the form and hit Run Diagnosis to start streaming</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── History ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto 48px", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: SUBTLE }}>Diagnosis History</span>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                </div>
                <DiagnosisHistory />
            </div>
        </div>
    );
}
