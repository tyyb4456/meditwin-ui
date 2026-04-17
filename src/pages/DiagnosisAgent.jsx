import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Microscope, FileJson, FormInput, Play, X,
    CheckCircle2, AlertCircle, Loader2, ChevronDown,
    Activity, Pill, AlertTriangle, Clock, TrendingUp,
    ArrowLeft, ChevronRight, Wifi, Copy, Check
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
};

// ── Example patient state for quick testing ─────────────────────────────────
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

// ── Form input component ─────────────────────────────────────────────────────
function Field({ label, children }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

function FormInputMode({ onSubmit, isStreaming }) {
    const [formData, setFormData] = useState({
        patientId: "example-patient-001",
        name: "Aseel Mustafa",
        age: "56",
        gender: "male",
        dob: "1970-01-01",
        chiefComplaint: "fever and weakness",
        medications: "Amoxicillin 500mg, 1 capsule 3x daily",
        allergies: "",
        conditions: "",
        labs: "",
        diagnosticReports: "Hemograma completo - within normal limits",
    });

    const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const parseMeds = (str) => str.trim()
            ? str.split("\n").map(line => { const p = line.split(",").map(s => s.trim()); return { drug: p[0] || "", dose: p[1] || "", frequency: p[2] || "1x per 1d", status: "active" }; }) : [];
        const parseConds = (str) => str.trim()
            ? str.split("\n").map(line => ({ code: "UNKNOWN", display: line.trim(), onset: new Date().toISOString() })) : [];
        const parseAllergies = (str) => str.trim()
            ? str.split("\n").map(line => ({ substance: line.trim(), reaction: "", severity: "unknown" })) : [];
        const parseDiag = (str) => str.trim()
            ? str.split("\n").map(line => ({ code: "UNKNOWN", display: line.split("-")[0].trim(), conclusion: line.split("-")[1]?.trim() || "", issued: new Date().toISOString() })) : [];

        onSubmit({
            patient_id: formData.patientId,
            demographics: { name: formData.name, age: parseInt(formData.age), gender: formData.gender, dob: formData.dob },
            active_conditions: parseConds(formData.conditions),
            medications: parseMeds(formData.medications),
            allergies: parseAllergies(formData.allergies),
            lab_results: [],
            diagnostic_reports: parseDiag(formData.diagnosticReports),
            recent_encounters: [],
            state_timestamp: new Date().toISOString(),
            imaging_available: false,
        }, formData.chiefComplaint);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Patient ID">
                    <input style={inputStyle} value={formData.patientId} onChange={set("patientId")} required />
                </Field>
                <Field label="Patient Name">
                    <input style={inputStyle} value={formData.name} onChange={set("name")} required />
                </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Age">
                    <input type="number" style={inputStyle} value={formData.age} onChange={set("age")} required />
                </Field>
                <Field label="Gender">
                    <select style={inputStyle} value={formData.gender} onChange={set("gender")}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </Field>
                <Field label="Date of Birth">
                    <input type="date" style={inputStyle} value={formData.dob} onChange={set("dob")} required />
                </Field>
            </div>

            <Field label="Chief Complaint *">
                <input style={inputStyle} value={formData.chiefComplaint} onChange={set("chiefComplaint")}
                    placeholder="e.g., fever and weakness" required />
            </Field>

            <Field label="Current Medications (one per line: drug, dose, frequency)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3}
                    value={formData.medications} onChange={set("medications")}
                    placeholder="Amoxicillin 500mg, 1 capsule, 3x daily" />
            </Field>

            <Field label="Allergies (one per line)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2}
                    value={formData.allergies} onChange={set("allergies")} placeholder="Penicillin" />
            </Field>

            <Field label="Active Conditions (one per line)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2}
                    value={formData.conditions} onChange={set("conditions")} placeholder="Hypertension" />
            </Field>

            <Field label="Recent Diagnostic Reports (one per line: test - conclusion)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2}
                    value={formData.diagnosticReports} onChange={set("diagnosticReports")}
                    placeholder="Hemograma completo - within normal limits" />
            </Field>

            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? C.dim : C.accent,
                border: "none", color: "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Diagnosis</>}
            </button>
        </form>
    );
}

// ── JSON input mode ──────────────────────────────────────────────────────────
function JsonInputMode({ onSubmit, isStreaming }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify({
        patient_state: EXAMPLE_PATIENT_STATE,
        chief_complaint: "fever and weakness",
        include_fhir_resources: true,
    }, null, 2));
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.patient_state || !parsed.chief_complaint) throw new Error("Missing required fields: patient_state and chief_complaint");
            onSubmit(parsed.patient_state, parsed.chief_complaint);
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
                    rows={22} spellCheck={false}
                />
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
                {isStreaming ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Diagnosis</>}
            </button>
        </form>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
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
        if (isStreaming) {
            eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setExpandedDiagnosis(null); setLiveText("");
        setCopied(false);
    };

    // Incremental parsing of the JSON structure
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
                        display: displayMatch[1] || "...",
                        icd10_code: codeMatch ? codeMatch[1] : "...",
                        confidence: confMatch ? parseFloat(confMatch[1]) : 0,
                        clinical_reasoning: "Reasoning stream...",
                        supporting_evidence: [],
                        against_evidence: []
                    });
                }
            }
            if (partial.differential_diagnosis.length > 0) {
                const top = partial.differential_diagnosis[0];
                partial.top_diagnosis = top.display;
                partial.top_icd10_code = top.icd10_code;
                if (top.confidence >= 0.75) partial.confidence_level = "HIGH";
                else if (top.confidence >= 0.5) partial.confidence_level = "MODERATE";
                else if (top.confidence > 0) partial.confidence_level = "LOW";
                setPartialResult(partial);
            }
        } catch { /* ignore parsing errors */ }
    }, [liveText, isStreaming, finalResult]);

    const handleCopy = () => {
        const textToCopy = finalResult ? JSON.stringify(finalResult, null, 2) : liveText;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAbort = () => {
        abortControllerRef.current?.abort();
        setIsStreaming(false);
    };

    const runDiagnosis = async (patientState, chiefComplaint) => {
        handleReset();
        setIsStreaming(true);
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
                            if (event.type === "status") setCurrentStep(event.message);
                            else if (event.type === "complete") { setFinalResult(event.data); setCurrentStep(null); }
                            else if (event.type === "error") { setError(event.message); if (event.fatal) setIsStreaming(false); }
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
        const map = { error: [C.red, "#FEE2E2"], complete: [C.green, "#DCFCE7"], status: [C.cyan, "#CFFAFE"], progress: [C.yellow, "#FEF9C3"] };
        const [fg, bg] = map[type] || ["#6B7280", "#F3F4F6"];
        return { fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 2, color: fg, background: bg, fontFamily: "monospace" };
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
                select option { background: var(--color-bg); color: var(--color-text); }
                input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
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
                {/* Left: back + breadcrumb */}
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

                    {/* Breadcrumb */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 26, height: 26, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 4 }}>
                            <span style={{ color: "var(--color-bg)", fontSize: 9, fontWeight: 900 }}>MT</span>
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
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, transition: "color 0.2s", padding: 0 }}
                                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                >{crumb.label}</button>
                            </span>
                        ))}
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text }}>
                                Diagnosis Agent
                            </span>
                        </span>
                    </div>
                </div>

                {/* Right: port badge + type + theme toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11 }}>
                        <Wifi size={11} color={C.purple} />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8002</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${C.border}`, color: C.purple }}>
                        A2A
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* ── Page Header ── */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.purple}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            <Microscope size={18} color={C.purple} strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Agent 02</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Diagnosis Agent
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 600 }}>
                        RAG-based differential diagnosis engine. Retrieves from medical knowledge base and runs Gemini inference with streaming token output.
                    </p>
                </div>
            </div>

            {/* ── Main 2-col grid ── */}
            <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start",
            }}>

                {/* ── LEFT: Input Panel ── */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {/* Mode tabs */}
                    <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                        {[{ id: "form", icon: FormInput, label: "Form Input" }, { id: "json", icon: FileJson, label: "Raw JSON" }].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setInputMode(tab.id)}
                                style={{
                                    flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                                    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    background: inputMode === tab.id ? C.accent : "transparent",
                                    color: inputMode === tab.id ? "#fff" : C.muted,
                                    borderBottom: inputMode === tab.id ? `2px solid ${C.accent}` : "2px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                <tab.icon size={13} /> {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: 20 }}>
                        {inputMode === "form"
                            ? <FormInputMode onSubmit={runDiagnosis} isStreaming={isStreaming} />
                            : <JsonInputMode onSubmit={runDiagnosis} isStreaming={isStreaming} />}
                    </div>
                </div>

                {/* ── RIGHT: Output Panel ── */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {/* Output header */}
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.text }}>
                            Live Stream Output
                        </span>
                        {isStreaming && (
                            <button onClick={handleAbort} style={{
                                padding: "4px 10px", border: `1px solid ${C.red}`, color: C.red,
                                background: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                                textTransform: "uppercase", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 5,
                            }}>
                                <X size={11} /> Abort
                            </button>
                        )}
                    </div>

                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Current step indicator */}
                        {currentStep && (
                            <div style={{ padding: "10px 14px", background: C.accent, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
                                <Loader2 size={14} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{currentStep}</span>
                            </div>
                        )}

                        {/* Error display */}
                        {error && (
                            <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <AlertCircle size={14} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: "0 0 3px" }}>Stream Error</p>
                                    <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Raw SSE event log */}
                        <div style={{ border: `1px solid ${C.border}` }}>
                            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted }}>
                                    Raw SSE Events ({streamEvents.length})
                                </span>
                            </div>
                            <div style={{ padding: "8px 12px", maxHeight: 240, overflowY: "auto", fontFamily: "monospace", fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                                {streamEvents.length === 0
                                    ? <p style={{ color: C.muted, fontStyle: "italic", margin: 0 }}>No events yet...</p>
                                    : streamEvents.map((event, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                                            <span style={eventBadgeStyle(event.type)}>{event.type}</span>
                                            {event.message && <span style={{ color: C.text, fontSize: 11 }}>{event.message}</span>}
                                            {event.pct !== undefined && <span style={{ color: C.muted, fontSize: 10 }}>({event.pct}%)</span>}
                                        </div>
                                    ))
                                }
                                <div ref={eventsEndRef} />
                            </div>
                        </div>

                        {/* ── Live / Raw Output ── */}
                        {(liveText || finalResult) && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {finalResult ? (
                                            <FileJson size={12} color={C.green} />
                                        ) : (
                                            <Loader2 size={12} color={C.accent} style={{ animation: "spin 2s linear infinite" }} />
                                        )}
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: finalResult ? C.green : C.muted, margin: 0 }}>
                                            {finalResult ? "Final Clean JSON" : "Live LLM Output"}
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
                                    maxHeight: 400, overflowY: "auto", background: "#080810", padding: 14,
                                    border: `1px solid ${C.border}`, borderRadius: 2
                                }}>
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                        {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* ── Final Result ── */}
                        {(finalResult || partialResult) && (() => {
                            const displayResult = finalResult || partialResult;
                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: finalResult ? 1 : 0.6, transition: "opacity 0.3s" }}>

                                    {/* Summary cards */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div style={{ background: C.bg, padding: 14, borderLeft: `4px solid ${C.accent}`, border: `1px solid ${C.border}` }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Top Diagnosis</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                {!finalResult && <Loader2 size={12} color={C.accent} style={{ animation: "spin 2s linear infinite" }} />}
                                                <p style={{ fontSize: 13, fontWeight: 900, color: C.text, margin: 0 }}>{displayResult.top_diagnosis || "N/A"}</p>
                                            </div>
                                            <p style={{ fontSize: 10, color: C.muted, margin: "3px 0 0", fontFamily: "monospace" }}>ICD-10: {displayResult.top_icd10_code || "N/A"}</p>
                                        </div>
                                        <div style={{ background: C.bg, padding: 14, borderLeft: `4px solid ${C.cyan}`, border: `1px solid ${C.border}` }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Confidence</p>
                                            <p style={{ fontSize: 13, fontWeight: 900, margin: 0, color: displayResult.confidence_level === "HIGH" ? C.green : displayResult.confidence_level === "MODERATE" ? C.yellow : C.red }}>
                                                {displayResult.confidence_level || "CALCULATING"}
                                            </p>
                                            <div style={{ marginTop: 8, height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%", borderRadius: 2, transition: "width 0.5s ease",
                                                    background: displayResult.confidence_level === "HIGH" ? C.green : displayResult.confidence_level === "MODERATE" ? C.yellow : C.red,
                                                    width: displayResult.confidence_level === "HIGH" ? "85%" : displayResult.confidence_level === "MODERATE" ? "60%" : displayResult.confidence_level === "LOW" ? "35%" : "10%",
                                                }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical alerts */}
                                    {(displayResult.penicillin_allergy_flagged || displayResult.high_suspicion_sepsis || displayResult.requires_isolation) && (
                                        <div style={{ background: `${C.yellow}10`, border: `1px solid ${C.yellow}40`, padding: 14 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                                <AlertTriangle size={14} color={C.yellow} />
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.yellow, margin: 0 }}>Clinical Alerts</p>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                {displayResult.penicillin_allergy_flagged && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.text }}><div style={{ width: 6, height: 6, background: C.yellow, borderRadius: "50%" }} />Beta-lactam allergy detected — avoid penicillin-class antibiotics</div>}
                                                {displayResult.high_suspicion_sepsis && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.text }}><div style={{ width: 6, height: 6, background: C.red, borderRadius: "50%" }} />High suspicion of sepsis — urgent evaluation required</div>}
                                                {displayResult.requires_isolation && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.text }}><div style={{ width: 6, height: 6, background: C.purple, borderRadius: "50%" }} />Isolation precautions recommended</div>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Differential diagnosis list */}
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Differential Diagnosis ({displayResult.differential_diagnosis?.length || 0})
                                                {!finalResult && <Loader2 size={10} color={C.text} style={{ animation: "spin 2s linear infinite", display: "inline-block", marginLeft: 8 }} />}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            {displayResult.differential_diagnosis?.map((diag, idx) => (
                                                <div key={idx} style={{ padding: 14, borderBottom: `1px solid ${C.border}` }}>
                                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                        onClick={() => setExpandedDiagnosis(expandedDiagnosis === idx ? null : idx)}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                                                <span style={{ width: 24, height: 24, background: C.accent, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3, flexShrink: 0 }}>{diag.rank}</span>
                                                                <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{diag.display}</p>
                                                                <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{diag.icd10_code}</span>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <TrendingUp size={11} color={C.muted} />
                                                                <span style={{ fontSize: 11, color: C.muted }}>{(diag.confidence * 100).toFixed(0)}% confidence</span>
                                                                <div style={{ flex: 1, height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                                                                    <div style={{ height: "100%", width: `${diag.confidence * 100}%`, background: C.accent, borderRadius: 2 }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronDown size={15} color={C.muted} style={{ marginLeft: 10, flexShrink: 0, transform: expandedDiagnosis === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                                                    </div>

                                                    {expandedDiagnosis === idx && (
                                                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
                                                            <div>
                                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>Clinical Reasoning</p>
                                                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{diag.clinical_reasoning}</p>
                                                            </div>
                                                            {diag.supporting_evidence?.length > 0 && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, margin: "0 0 5px" }}>Supporting Evidence</p>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                        {diag.supporting_evidence.map((ev, i) => (
                                                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.text }}>
                                                                                <CheckCircle2 size={12} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {diag.against_evidence?.length > 0 && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: "0 0 5px" }}>Against Evidence</p>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                                        {diag.against_evidence.map((ev, i) => (
                                                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.text }}>
                                                                                <X size={12} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
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

                                    {/* Recommended next steps */}
                                    {displayResult.recommended_next_steps?.length > 0 && (
                                        <div style={{ border: `1px solid ${C.border}` }}>
                                            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                    Recommended Next Steps ({displayResult.recommended_next_steps.length})
                                                </p>
                                            </div>
                                            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                                {displayResult.recommended_next_steps.map((step, idx) => (
                                                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: C.bg, borderLeft: `4px solid ${C.cyan}`, border: `1px solid ${C.border}` }}>
                                                        <div style={{ width: 30, height: 30, background: `${C.cyan}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}>
                                                            {step.category === "MEDICATION" ? <Pill size={13} color={C.cyan} /> : step.category === "LABORATORY" ? <Activity size={13} color={C.cyan} /> : <Clock size={13} color={C.cyan} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", background: `${C.cyan}18`, color: C.cyan }}>{step.category}</span>
                                                                {step.urgency !== "routine" && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", background: `${C.red}18`, color: C.red }}>{step.urgency}</span>}
                                                            </div>
                                                            <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{step.description}</p>
                                                            {step.drug_name && <p style={{ fontSize: 11, color: C.muted, margin: "3px 0 0" }}>{step.drug_name} {step.drug_dose} {step.drug_route && `(${step.drug_route})`}</p>}
                                                            {step.rationale && <p style={{ fontSize: 11, color: C.muted, margin: "3px 0 0", fontStyle: "italic" }}>{step.rationale}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reasoning summary */}
                                    {finalResult?.reasoning_summary && (
                                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>AI Reasoning Summary</p>
                                            <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.65 }}>{finalResult.reasoning_summary}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                        
                        {/* Empty state */}
                        {!isStreaming && streamEvents.length === 0 && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <Microscope size={40} color={C.dim} style={{ margin: "0 auto 12px" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                                    Ready to run diagnosis. Fill in patient data and click "Run Diagnosis".
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}