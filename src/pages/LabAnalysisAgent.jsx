import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FlaskConical, FileJson, FormInput, Play, X,
    CheckCircle2, AlertCircle, Loader2, ChevronDown,
    Activity, AlertTriangle, ArrowLeft, ChevronRight,
    Wifi, Copy, Check, Plus, Trash2,
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import LabHistory from "../components/history/LabHistory";

// ── CSS variable colour tokens (theme-aware) ─────────────────────────────────
const C = {
    bg:      "var(--color-bg)",
    surface: "var(--color-surface)",
    border:  "var(--color-border)",
    accent:  "#06B6D4",          // cyan  — lab agent colour
    text:    "var(--color-text)",
    muted:   "var(--color-text-subtle)",
    dim:     "var(--color-border)",
    green:   "#22C55E",
    yellow:  "#EAB308",
    red:     "#EF4444",
    cyan:    "#06B6D4",
    orange:  "#F97316",
    purple:  "#8b5cf6",
    blue:    "#60A5FA",
};

// ── Example defaults ──────────────────────────────────────────────────────────
const EXAMPLE_LAB_ROWS = [
    { loinc: "26464-8", value: "14.5",  label: "WBC" },
    { loinc: "1988-5",  value: "120",   label: "CRP" },
    { loinc: "770-8",   value: "82",    label: "Neutrophil %" },
    { loinc: "2345-7",  value: "160",   label: "Glucose" },
];

const EXAMPLE_JSON = {
    patient_state: {
        patient_id: "test_1",
        demographics: { age: 56, gender: "male" },
        lab_results: [
            { loinc: "26464-8", value: 14.5 },
            { loinc: "1988-5",  value: 120 },
            { loinc: "770-8",   value: 82 },
            { loinc: "2345-7",  value: 160 },
        ],
    },
    diagnosis_agent_output: {
        top_diagnosis: "Community-acquired pneumonia",
        top_icd10_code: "J18.9",
    },
};

// ── Shared styles ─────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const flagColor = (flag) => {
    if (!flag) return C.muted;
    const f = flag.toUpperCase();
    if (f === "CRITICAL") return C.red;
    if (f === "HIGH")     return C.orange;
    if (f === "LOW")      return C.blue;
    return C.green;
};

const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return C.red;
    if (s === "HIGH")     return C.orange;
    if (s === "MODERATE") return C.yellow;
    if (s === "LOW" || s === "MINIMAL") return C.green;
    return C.muted;
};

// ── Dynamic-row form input ────────────────────────────────────────────────────
function FormInputMode({ onSubmit, isStreaming }) {
    const [patientId, setPatientId] = useState("test_1");
    const [age,       setAge]       = useState("56");
    const [gender,    setGender]    = useState("male");
    const [labRows,   setLabRows]   = useState([...EXAMPLE_LAB_ROWS]);
    const [topDx,     setTopDx]     = useState("Community-acquired pneumonia");
    const [topIcd,    setTopIcd]    = useState("J18.9");

    const addRow    = () => setLabRows(p => [...p, { loinc: "", value: "", label: "" }]);
    const removeRow = (i) => setLabRows(p => p.filter((_, idx) => idx !== i));
    const updateRow = (i, field, val) =>
        setLabRows(p => { const n = [...p]; n[i] = { ...n[i], [field]: val }; return n; });

    const handleSubmit = (e) => {
        e.preventDefault();
        const lab_results = labRows
            .filter(r => r.loinc && r.value)
            .map(r => ({ loinc: r.loinc.trim(), value: parseFloat(r.value) }));

        const patient_state = {
            patient_id: patientId,
            demographics: { age: parseInt(age), gender },
            lab_results,
        };
        const diagnosis_agent_output = (topDx || topIcd)
            ? { top_diagnosis: topDx, top_icd10_code: topIcd }
            : null;

        onSubmit(patient_state, diagnosis_agent_output);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Patient basics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Patient ID">
                    <input style={inputStyle} value={patientId}
                        onChange={e => setPatientId(e.target.value)} required />
                </Field>
                <Field label="Age">
                    <input type="number" style={inputStyle} value={age}
                        onChange={e => setAge(e.target.value)} required />
                </Field>
            </div>

            <Field label="Gender">
                <select style={inputStyle} value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                </select>
            </Field>

            {/* Lab result rows */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Lab Results (LOINC + Value)</label>
                    <button type="button" onClick={addRow} style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: "none", border: `1px solid ${C.cyan}`,
                        color: C.cyan, padding: "3px 8px", cursor: "pointer",
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    }}>
                        <Plus size={10} /> Add Row
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {labRows.map((row, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 90px 1fr auto", gap: 6, alignItems: "center" }}>
                            <input
                                style={{ ...inputStyle, fontFamily: "monospace", fontSize: 11 }}
                                placeholder="LOINC code"
                                value={row.loinc}
                                onChange={e => updateRow(i, "loinc", e.target.value)}
                            />
                            <input
                                type="number" step="any"
                                style={inputStyle}
                                placeholder="Value"
                                value={row.value}
                                onChange={e => updateRow(i, "value", e.target.value)}
                            />
                            <input
                                style={{ ...inputStyle, color: C.muted }}
                                placeholder="Label (optional)"
                                value={row.label || ""}
                                onChange={e => updateRow(i, "label", e.target.value)}
                            />
                            <button type="button" onClick={() => removeRow(i)} style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: C.muted, padding: 4, display: "flex", alignItems: "center",
                                transition: "color 0.2s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = C.red}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Diagnosis context */}
            <div style={{ padding: 12, background: `${C.cyan}08`, border: `1px solid ${C.cyan}30` }}>
                <p style={{ ...labelStyle, color: C.cyan, margin: "0 0 10px" }}>Diagnosis Context (Optional)</p>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                    <Field label="Top Diagnosis">
                        <input style={inputStyle} value={topDx} onChange={e => setTopDx(e.target.value)}
                            placeholder="Community-acquired pneumonia" />
                    </Field>
                    <Field label="ICD-10 Code">
                        <input style={{ ...inputStyle, fontFamily: "monospace" }} value={topIcd}
                            onChange={e => setTopIcd(e.target.value)} placeholder="J18.9" />
                    </Field>
                </div>
            </div>

            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? C.dim : C.cyan,
                border: "none", color: isStreaming ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Lab Analysis</>}
            </button>
        </form>
    );
}

// ── Raw JSON input mode ───────────────────────────────────────────────────────
function JsonInputMode({ onSubmit, isStreaming }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(EXAMPLE_JSON, null, 2));
    const [error,     setError]     = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.patient_state) throw new Error("Missing required field: patient_state");
            onSubmit(parsed.patient_state, parsed.diagnosis_agent_output || null);
        } catch (err) { setError(err.message); }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
                <label style={labelStyle}>Request Payload (JSON)</label>
                <textarea
                    value={jsonInput}
                    onChange={e => { setJsonInput(e.target.value); setError(""); }}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
                    rows={24} spellCheck={false}
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
                background: isStreaming ? C.dim : C.cyan,
                border: "none", color: isStreaming ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Lab Analysis</>}
            </button>
        </form>
    );
}

// ── Main page component ───────────────────────────────────────────────────────
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

    // Auto-scroll event log while streaming
    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setLiveText(""); setCopied(false);
        setExpandedFlag(null); setExpandedPattern(null);
    };

    // ── Incremental partial parsing during token stream ──────────────────────
    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = {};

            // lab_summary
            const sevMatch      = liveText.match(/"overall_severity"\s*:\s*"([^"]+)"/);
            const totalMatch    = liveText.match(/"total_results"\s*:\s*(\d+)/);
            const abnMatch      = liveText.match(/"abnormal_count"\s*:\s*(\d+)/);
            const critMatch     = liveText.match(/"critical_count"\s*:\s*(\d+)/);
            if (sevMatch || totalMatch) {
                partial.lab_summary = {
                    overall_severity: sevMatch   ? sevMatch[1]         : "...",
                    total_results:    totalMatch ? parseInt(totalMatch[1]) : 0,
                    abnormal_count:   abnMatch   ? parseInt(abnMatch[1])   : 0,
                    critical_count:   critMatch  ? parseInt(critMatch[1])  : 0,
                };
            }

            // flagged_results (best-effort)
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

            // severity_score
            const scoreMatch = liveText.match(/"score"\s*:\s*(\d+)/);
            const riskMatch  = liveText.match(/"risk_category"\s*:\s*"([^"]+)"/);
            if (scoreMatch || riskMatch) {
                partial.severity_score = {
                    score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
                    risk_category: riskMatch ? riskMatch[1] : "...",
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

    // ── SSE fetch ────────────────────────────────────────────────────────────
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

    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,    "#FEE2E2"],
            complete: [C.green,  "#DCFCE7"],
            status:   [C.cyan,   "#CFFAFE"],
            progress: [C.yellow, "#FEF9C3"],
        };
        const [fg, bg] = map[type] || ["#6B7280", "#F3F4F6"];
        return {
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 6px", borderRadius: 2, color: fg, background: bg, fontFamily: "monospace",
        };
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

            {/* ── Sticky Top Nav ─────────────────────────────────────────────── */}
            <div style={{
                position: "sticky", top: 0, zIndex: 50,
                background: `color-mix(in srgb, ${C.bg} 92%, transparent)`,
                backdropFilter: "blur(12px)",
                borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px", height: 56,
            }}>
                {/* Left — back + breadcrumb */}
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
                            <span style={{ color: C.bg, fontSize: 9, fontWeight: 900 }}>MT</span>
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

                {/* Right — port + type + theme toggle */}
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

            {/* ── Page Header ────────────────────────────────────────────────── */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.cyan}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            <FlaskConical size={18} color={C.cyan} strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Agent 03</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Lab Analysis Agent
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 620 }}>
                        Rules engine + LLM interpretation over FHIR Observation resources. Flags abnormal LOINC-coded values, detects clinical patterns, and confirms or challenges the diagnosis agent output — with live SSE token streaming.
                    </p>
                </div>
            </div>

            {/* ── Main 2-col Grid ────────────────────────────────────────────── */}
            <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start",
            }}>

                {/* ── LEFT: Input Panel ── */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {/* Tab bar */}
                    <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                        {[
                            { id: "form", icon: FormInput, label: "Form Input" },
                            { id: "json", icon: FileJson,  label: "Raw JSON" },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setInputMode(tab.id)}
                                style={{
                                    flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                                    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    background: inputMode === tab.id ? C.cyan : "transparent",
                                    color:      inputMode === tab.id ? "#fff"  : C.muted,
                                    borderBottom: inputMode === tab.id ? `2px solid ${C.cyan}` : "2px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                <tab.icon size={13} /> {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: 20 }}>
                        {inputMode === "form"
                            ? <FormInputMode onSubmit={runLabAnalysis} isStreaming={isStreaming} />
                            : <JsonInputMode onSubmit={runLabAnalysis} isStreaming={isStreaming} />}
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
                            <div style={{ padding: "10px 14px", background: C.cyan, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
                                <Loader2 size={14} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{currentStep}</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <AlertCircle size={14} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: "0 0 3px" }}>Stream Error</p>
                                    <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Raw SSE Event Log */}
                        <div style={{ border: `1px solid ${C.border}` }}>
                            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.cyan} 6%, ${C.surface})` }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted }}>
                                    Raw SSE Events ({streamEvents.length})
                                </span>
                            </div>
                            <div style={{ padding: "8px 12px", maxHeight: 180, overflowY: "auto", fontFamily: "monospace", fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
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

                        {/* Live / Final JSON block */}
                        {(liveText || finalResult) && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {finalResult
                                            ? <FileJson size={12} color={C.green} />
                                            : <Loader2  size={12} color={C.cyan} style={{ animation: "spin 2s linear infinite" }} />}
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
                                <div style={{ maxHeight: 300, overflowY: "auto", background: "#080810", padding: 14, border: `1px solid ${C.border}`, borderRadius: 2 }}>
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                        {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* ── Structured Result Panels ── */}
                        {displayResult && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isFinal ? 1 : 0.65, transition: "opacity 0.3s" }}>

                                {/* Lab Summary Stat Cards */}
                                {displayResult.lab_summary && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                        {[
                                            { label: "Total",    value: displayResult.lab_summary.total_results,    color: C.cyan },
                                            { label: "Abnormal", value: displayResult.lab_summary.abnormal_count,   color: C.yellow },
                                            { label: "Critical", value: displayResult.lab_summary.critical_count,   color: C.red },
                                            { label: "Severity", value: displayResult.lab_summary.overall_severity, color: severityColor(displayResult.lab_summary.overall_severity) },
                                        ].map((stat, i) => (
                                            <div key={i} style={{ background: C.bg, padding: "10px 12px", border: `1px solid ${C.border}`, borderTop: `3px solid ${stat.color}` }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>{stat.label}</p>
                                                {isFinal
                                                    ? <p style={{ fontSize: 15, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value ?? "–"}</p>
                                                    : <Loader2 size={12} color={stat.color} style={{ animation: "spin 2s linear infinite" }} />
                                                }
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Severity Score Bar */}
                                {displayResult.severity_score && (
                                    <div style={{ background: C.bg, padding: 14, border: `1px solid ${C.border}` }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Severity Score</p>
                                            <span style={{ fontSize: 13, fontWeight: 900, color: severityColor(displayResult.severity_score.risk_category), fontFamily: "monospace" }}>
                                                {displayResult.severity_score.score ?? "–"} / 100
                                                <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 6 }}>({displayResult.severity_score.risk_category})</span>
                                            </span>
                                        </div>
                                        <div style={{ height: 6, background: C.dim, borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%", borderRadius: 3, transition: "width 1s ease",
                                                background: severityColor(displayResult.severity_score.risk_category),
                                                width: `${Math.min(displayResult.severity_score.score || 0, 100)}%`,
                                            }} />
                                        </div>
                                        {displayResult.severity_score.contributors?.length > 0 && (
                                            <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>
                                                {displayResult.severity_score.contributors.join(" · ")}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Diagnosis Confirmation */}
                                {displayResult.diagnosis_confirmation && (
                                    <div style={{
                                        background: C.bg, padding: 14, border: `1px solid ${C.border}`,
                                        borderLeft: `4px solid ${displayResult.diagnosis_confirmation.confirms_top_diagnosis ? C.green : C.red}`,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                            {displayResult.diagnosis_confirmation.confirms_top_diagnosis
                                                ? <CheckCircle2 size={16} color={C.green} />
                                                : <AlertCircle  size={16} color={C.red} />}
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: displayResult.diagnosis_confirmation.confirms_top_diagnosis ? C.green : C.red, margin: 0 }}>
                                                {displayResult.diagnosis_confirmation.confirms_top_diagnosis ? "Lab Confirms Diagnosis" : "Lab Challenges Diagnosis"}
                                            </p>
                                            {displayResult.diagnosis_confirmation.lab_confidence_boost > 0 && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}40` }}>
                                                    +{(displayResult.diagnosis_confirmation.lab_confidence_boost * 100).toFixed(0)}% confidence
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>{displayResult.diagnosis_confirmation.proposed_diagnosis}</p>
                                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 8px", fontFamily: "monospace" }}>ICD-10: {displayResult.diagnosis_confirmation.proposed_icd10}</p>
                                        {displayResult.diagnosis_confirmation.reasoning && (
                                            <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                                                {displayResult.diagnosis_confirmation.reasoning}
                                            </p>
                                        )}
                                        {displayResult.diagnosis_confirmation.alternative_diagnosis_display && (
                                            <div style={{ marginTop: 10, padding: "8px 10px", background: `${C.yellow}10`, border: `1px solid ${C.yellow}30` }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.yellow, margin: "0 0 3px" }}>Alternative Diagnosis</p>
                                                <p style={{ fontSize: 12, color: C.text, margin: 0 }}>
                                                    {displayResult.diagnosis_confirmation.alternative_diagnosis_display}
                                                    <span style={{ color: C.muted, fontFamily: "monospace", marginLeft: 8 }}>
                                                        {displayResult.diagnosis_confirmation.alternative_diagnosis_code}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Flagged Results */}
                                {displayResult.flagged_results?.length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.cyan} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Flagged Results ({displayResult.flagged_results.length})
                                                {!isFinal && <Loader2 size={10} color={C.text} style={{ animation: "spin 2s linear infinite", display: "inline-block", marginLeft: 8 }} />}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            {displayResult.flagged_results.map((res, idx) => (
                                                <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                                    <div
                                                        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                        onClick={() => setExpandedFlag(expandedFlag === idx ? null : idx)}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                <span style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                                                                    textTransform: "uppercase", padding: "2px 6px",
                                                                    color: flagColor(res.flag),
                                                                    background: `${flagColor(res.flag)}18`,
                                                                    border: `1px solid ${flagColor(res.flag)}40`,
                                                                }}>{res.flag || "–"}</span>
                                                                <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{res.display}</p>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                                                <span style={{ fontSize: 14, fontWeight: 900, color: flagColor(res.flag), fontFamily: "monospace" }}>
                                                                    {res.value} {res.unit}
                                                                </span>
                                                                {res.reference_range && (
                                                                    <span style={{ fontSize: 11, color: C.muted }}>ref: {res.reference_range}</span>
                                                                )}
                                                                {res.loinc && (
                                                                    <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>LOINC: {res.loinc}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronDown size={14} color={C.muted} style={{
                                                            marginLeft: 10, flexShrink: 0,
                                                            transform: expandedFlag === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                            transition: "transform 0.2s",
                                                        }} />
                                                    </div>
                                                    {expandedFlag === idx && res.clinical_significance && (
                                                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>Clinical Significance</p>
                                                            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{res.clinical_significance}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pattern Analysis */}
                                {displayResult.pattern_analysis?.identified_patterns?.length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.purple} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Pattern Analysis ({displayResult.pattern_analysis.identified_patterns.length})
                                            </p>
                                        </div>
                                        {displayResult.pattern_analysis.pattern_interpretation && (
                                            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, background: `${C.purple}08` }}>
                                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.65 }}>
                                                    {displayResult.pattern_analysis.pattern_interpretation}
                                                </p>
                                            </div>
                                        )}
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            {displayResult.pattern_analysis.identified_patterns.map((pat, idx) => (
                                                <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                                    <div
                                                        style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
                                                        onClick={() => setExpandedPattern(expandedPattern === idx ? null : idx)}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>{pat.pattern}</p>
                                                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{pat.description}</p>
                                                        </div>
                                                        <ChevronDown size={14} color={C.muted} style={{
                                                            flexShrink: 0, marginLeft: 10,
                                                            transform: expandedPattern === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                            transition: "transform 0.2s",
                                                        }} />
                                                    </div>

                                                    {expandedPattern === idx && (
                                                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                            {pat.markers?.length > 0 && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>Markers</p>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                                        {pat.markers.map((m, i) => (
                                                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text }}>
                                                                                <div style={{ width: 5, height: 5, background: C.cyan, borderRadius: "50%", flexShrink: 0 }} />
                                                                                {m}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {pat.sensitivity_note && (
                                                                <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>{pat.sensitivity_note}</p>
                                                            )}
                                                            {pat.supports_icd10?.length > 0 && (
                                                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                                    <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>Supports:</span>
                                                                    {pat.supports_icd10.map(code => (
                                                                        <span key={code} style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 7px", background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}30` }}>
                                                                            {code}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {pat.rules_met !== undefined && (
                                                                <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                                                                    Rules met: {pat.rules_met} / {pat.rules_total}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Clinical Decision Support */}
                                {(() => {
                                    const actions = [
                                        ...(displayResult.clinical_decision_support?.immediate_actions || []),
                                        ...(displayResult.clinical_decision_support?.urgent_actions   || []),
                                    ];
                                    if (actions.length === 0) return null;
                                    return (
                                        <div style={{ border: `1px solid ${C.border}` }}>
                                            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.orange} 6%, ${C.surface})` }}>
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                    Clinical Decision Support ({actions.length})
                                                </p>
                                            </div>
                                            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                                {actions.map((action, idx) => {
                                                    const isImmediate = (action.priority || "").toUpperCase() === "IMMEDIATE";
                                                    const acColor = isImmediate ? C.red : C.orange;
                                                    return (
                                                        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: C.bg, borderLeft: `3px solid ${acColor}`, border: `1px solid ${C.border}` }}>
                                                            <div style={{ width: 26, height: 26, background: `${acColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}>
                                                                <Activity size={12} color={acColor} />
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                                                                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", background: `${acColor}18`, color: acColor }}>
                                                                        {action.priority}
                                                                    </span>
                                                                    {action.timeframe && (
                                                                        <span style={{ fontSize: 10, color: C.muted }}>{action.timeframe}</span>
                                                                    )}
                                                                </div>
                                                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{action.action}</p>
                                                                {action.details && action.details !== "AI-generated recommendation based on lab pattern analysis" && (
                                                                    <p style={{ fontSize: 11, color: C.muted, margin: "3px 0 0", fontStyle: "italic" }}>{action.details}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Critical Alerts */}
                                {displayResult.critical_alerts?.length > 0 && (
                                    <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}40`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                            <AlertTriangle size={14} color={C.red} />
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.red, margin: 0 }}>
                                                Critical Alerts ({displayResult.critical_alerts.length})
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {displayResult.critical_alerts.map((alert, i) => {
                                                if (typeof alert === "string") {
                                                    return (
                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.text }}>
                                                            <div style={{ width: 6, height: 6, background: C.red, borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />
                                                            {alert}
                                                        </div>
                                                    );
                                                }
                                                // Object alert — render as structured card
                                                const lvl = (alert.level || "").toUpperCase();
                                                const lvlColor = lvl.includes("CRITICAL") ? C.red : C.orange;
                                                return (
                                                    <div key={i} style={{
                                                        background: C.bg, padding: "10px 12px",
                                                        border: `1px solid ${C.red}40`,
                                                        borderLeft: `3px solid ${lvlColor}`,
                                                    }}>
                                                        {/* Level + Action Required badges */}
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                                                            {alert.level && (
                                                                <span style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                                                                    textTransform: "uppercase", padding: "2px 6px",
                                                                    background: `${lvlColor}20`, color: lvlColor,
                                                                    border: `1px solid ${lvlColor}40`,
                                                                }}>
                                                                    {alert.level.replace(/_/g, " ")}
                                                                </span>
                                                            )}
                                                            {alert.action_required && (
                                                                <span style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                                                                    textTransform: "uppercase", padding: "2px 6px",
                                                                    background: `${C.red}15`, color: C.red,
                                                                }}>
                                                                    Action Required
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Test name + value */}
                                                        <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>
                                                            {alert.display || alert.loinc || "Unknown Test"}
                                                            {alert.value !== undefined && (
                                                                <span style={{ fontFamily: "monospace", color: lvlColor, marginLeft: 10, fontWeight: 900 }}>
                                                                    {alert.value} {alert.unit}
                                                                </span>
                                                            )}
                                                        </p>
                                                        {/* Clinical message */}
                                                        {alert.message && (
                                                            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 3px", lineHeight: 1.55 }}>
                                                                {alert.message}
                                                            </p>
                                                        )}
                                                        {/* LOINC */}
                                                        {alert.loinc && alert.display && (
                                                            <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: "monospace" }}>
                                                                LOINC: {alert.loinc}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty state */}
                        {!isStreaming && streamEvents.length === 0 && !displayResult && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <FlaskConical size={40} color={C.dim} style={{ margin: "0 auto 12px", display: "block" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                                    Ready for lab analysis. Enter LOINC-coded results and click "Run Lab Analysis".
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                <LabHistory defaultPatientId={inputMode === "form" ? "test_1" : ""} />
            </div>
        </div>
    );
}
