import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield, FileJson, FormInput, Play, X,
    CheckCircle2, AlertCircle, Loader2, ChevronDown,
    AlertTriangle, ArrowLeft, ChevronRight,
    Wifi, Copy, Check, Plus, Trash2,
    Pill, ShieldAlert, ShieldCheck, ShieldX, Activity, Zap, FileWarning
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";
import DrugSafetyHistory from "../components/history/DrugSafetyHistory";

// ── CSS variable colour tokens (theme-aware) ─────────────────────────────────
const C = {
    bg:      "var(--color-bg)",
    surface: "var(--color-surface)",
    border:  "var(--color-border)",
    accent:  "#f59e0b",          // amber — drug safety agent colour
    text:    "var(--color-text)",
    muted:   "var(--color-text-subtle)",
    dim:     "var(--color-border)",
    green:   "#22C55E",
    yellow:  "#EAB308",
    red:     "#EF4444",
    cyan:    "#06B6D4",
    orange:  "#F97316",
    purple:  "#8b5cf6",
    amber:   "#f59e0b",
    blue:    "#60A5FA",
};

// ── Example payload ───────────────────────────────────────────────────────────
const EXAMPLE_JSON = {
    proposed_medications: ["Amoxicillin 500mg", "Ibuprofen 400mg"],
    current_medications:  ["Warfarin 5mg", "Metformin 850mg"],
    patient_allergies: [
        { substance: "Penicillin", reaction: "Anaphylaxis", severity: "severe" }
    ],
    active_conditions: [
        { code: "J18.9", display: "Pneumonia" },
        { code: "I48.0", display: "Atrial fibrillation" }
    ],
    patient_id: "test-patient-001",
    patient_state: {
        patient_id: "test-patient-001",
        demographics: { name: "John Test", age: 54, gender: "male", dob: "1970-03-14" },
        active_conditions: [
            { code: "E11.9", display: "Type 2 diabetes mellitus", onset: "2018-01-01" },
            { code: "I48.0", display: "Atrial fibrillation", onset: "2020-06-15" }
        ],
        medications: [
            { drug: "Warfarin", dose: "5mg", frequency: "OD", status: "active" },
            { drug: "Metformin", dose: "850mg", frequency: "BID", status: "active" }
        ],
        allergies: [
            { substance: "Penicillin", reaction: "Anaphylaxis", severity: "high" }
        ],
        lab_results: [
            {
                loinc: "26464-8", display: "White Blood Cell Count",
                value: 18.4, unit: "10*3/uL",
                reference_high: 11.0, reference_low: 4.5, flag: "CRITICAL"
            }
        ],
        diagnostic_reports: [],
        recent_encounters: [],
        state_timestamp: "2025-04-01T10:30:00Z",
        imaging_available: false
    },
    enrich_with_llm: true,
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
const safetyColor = (status) => {
    if (!status) return C.muted;
    const s = status.toUpperCase();
    if (s === "UNSAFE")  return C.red;
    if (s === "CAUTION") return C.yellow;
    if (s === "SAFE")    return C.green;
    return C.muted;
};
const safetyIcon = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "UNSAFE")  return ShieldX;
    if (s === "CAUTION") return ShieldAlert;
    if (s === "SAFE")    return ShieldCheck;
    return Shield;
};
const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return C.red;
    if (s === "HIGH")     return C.orange;
    if (s === "MODERATE") return C.yellow;
    return C.green;
};

// ── Form input mode ───────────────────────────────────────────────────────────
function FormInputMode({ onSubmit, isStreaming }) {
    const [patientId,    setPatientId]    = useState("test-patient-001");
    const [name,         setName]         = useState("John Test");
    const [age,          setAge]          = useState("54");
    const [gender,       setGender]       = useState("male");
    const [proposedMeds, setProposedMeds] = useState([
        { value: "Amoxicillin 500mg" }, { value: "Ibuprofen 400mg" }
    ]);
    const [currentMeds, setCurrentMeds] = useState([
        { value: "Warfarin 5mg" }, { value: "Metformin 850mg" }
    ]);
    const [allergies,    setAllergies]    = useState([
        { substance: "Penicillin", reaction: "Anaphylaxis", severity: "severe" }
    ]);
    const [conditions,   setConditions]   = useState([
        { code: "J18.9", display: "Pneumonia" },
        { code: "I48.0", display: "Atrial fibrillation" }
    ]);
    const [enrich, setEnrich] = useState(true);

    const addProposed = () => setProposedMeds(p => [...p, { value: "" }]);
    const removeProposed = (i) => setProposedMeds(p => p.filter((_,idx) => idx !== i));
    const updateProposed = (i, val) =>
        setProposedMeds(p => { const n=[...p]; n[i]={value:val}; return n; });

    const addCurrent = () => setCurrentMeds(p => [...p, { value: "" }]);
    const removeCurrent = (i) => setCurrentMeds(p => p.filter((_,idx) => idx !== i));
    const updateCurrent = (i, val) =>
        setCurrentMeds(p => { const n=[...p]; n[i]={value:val}; return n; });

    const addAllergy = () => setAllergies(p => [...p, { substance: "", reaction: "", severity: "moderate" }]);
    const removeAllergy = (i) => setAllergies(p => p.filter((_,idx) => idx !== i));
    const updateAllergy = (i, field, val) =>
        setAllergies(p => { const n=[...p]; n[i]={...n[i],[field]:val}; return n; });

    const addCondition = () => setConditions(p => [...p, { code: "", display: "" }]);
    const removeCondition = (i) => setConditions(p => p.filter((_,idx) => idx !== i));
    const updateCondition = (i, field, val) =>
        setConditions(p => { const n=[...p]; n[i]={...n[i],[field]:val}; return n; });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            proposed_medications: proposedMeds.map(m => m.value).filter(Boolean),
            current_medications:  currentMeds.map(m => m.value).filter(Boolean),
            patient_allergies:    allergies.filter(a => a.substance),
            active_conditions:    conditions.filter(c => c.display),
            patient_id: patientId,
            patient_state: {
                patient_id: patientId,
                demographics: { name, age: parseInt(age), gender, dob: "" },
                active_conditions: conditions.filter(c => c.display),
                medications: currentMeds.map(m => ({ drug: m.value, status: "active" })).filter(m => m.drug),
                allergies: allergies.filter(a => a.substance),
                lab_results: [],
                diagnostic_reports: [], recent_encounters: [],
                state_timestamp: new Date().toISOString(), imaging_available: false,
            },
            enrich_with_llm: enrich,
        });
    };

    const rowBtnStyle = {
        background: "none", border: "none", cursor: "pointer",
        color: C.muted, padding: 4, display: "flex", alignItems: "center",
        transition: "color 0.2s",
    };
    const addBtnStyle = {
        display: "flex", alignItems: "center", gap: 4,
        background: "none", border: `1px solid ${C.amber}`,
        color: C.amber, padding: "3px 8px", cursor: "pointer",
        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Patient basics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Patient ID">
                    <input style={inputStyle} value={patientId} onChange={e => setPatientId(e.target.value)} required />
                </Field>
                <Field label="Patient Name">
                    <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
                </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Age">
                    <input type="number" style={inputStyle} value={age} onChange={e => setAge(e.target.value)} required />
                </Field>
                <Field label="Gender">
                    <select style={inputStyle} value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </Field>
            </div>

            {/* Proposed medications */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Proposed Medications</label>
                    <button type="button" onClick={addProposed} style={addBtnStyle}><Plus size={10} /> Add</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {proposedMeds.map((med, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                            <input
                                style={inputStyle} placeholder="e.g. Amoxicillin 500mg"
                                value={med.value} onChange={e => updateProposed(i, e.target.value)}
                            />
                            <button type="button" onClick={() => removeProposed(i)} style={rowBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = C.red}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current medications */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Current Medications (patient's existing regimen)</label>
                    <button type="button" onClick={addCurrent} style={addBtnStyle}><Plus size={10} /> Add</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {currentMeds.map((med, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                            <input
                                style={inputStyle} placeholder="e.g. Warfarin 5mg"
                                value={med.value} onChange={e => updateCurrent(i, e.target.value)}
                            />
                            <button type="button" onClick={() => removeCurrent(i)} style={rowBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = C.red}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Allergies */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Patient Allergies</label>
                    <button type="button" onClick={addAllergy} style={addBtnStyle}><Plus size={10} /> Add</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {allergies.map((a, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px auto", gap: 6, alignItems: "center" }}>
                            <input style={inputStyle} placeholder="Substance" value={a.substance}
                                onChange={e => updateAllergy(i, "substance", e.target.value)} />
                            <input style={inputStyle} placeholder="Reaction" value={a.reaction}
                                onChange={e => updateAllergy(i, "reaction", e.target.value)} />
                            <select style={inputStyle} value={a.severity}
                                onChange={e => updateAllergy(i, "severity", e.target.value)}>
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                            </select>
                            <button type="button" onClick={() => removeAllergy(i)} style={rowBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = C.red}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active conditions */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Active Conditions</label>
                    <button type="button" onClick={addCondition} style={addBtnStyle}><Plus size={10} /> Add</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {conditions.map((c, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 6, alignItems: "center" }}>
                            <input style={{ ...inputStyle, fontFamily: "monospace", fontSize: 11 }}
                                placeholder="ICD-10" value={c.code}
                                onChange={e => updateCondition(i, "code", e.target.value)} />
                            <input style={inputStyle} placeholder="Display name" value={c.display}
                                onChange={e => updateCondition(i, "display", e.target.value)} />
                            <button type="button" onClick={() => removeCondition(i)} style={rowBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = C.red}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* LLM enrichment toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: `${C.amber}08`, border: `1px solid ${C.amber}30` }}>
                <input type="checkbox" id="enrich-llm" checked={enrich} onChange={e => setEnrich(e.target.checked)}
                    style={{ accentColor: C.amber, width: 14, height: 14, cursor: "pointer" }} />
                <label htmlFor="enrich-llm" style={{ fontSize: 12, color: C.text, cursor: "pointer", fontWeight: 600 }}>
                    Enable LLM enrichment (interaction analysis + patient risk profile)
                </label>
            </div>

            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? C.dim : C.amber,
                border: "none", color: isStreaming ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Drug Safety Check</>}
            </button>
        </form>
    );
}

// ── JSON input mode ───────────────────────────────────────────────────────────
function JsonInputMode({ onSubmit, isStreaming }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(EXAMPLE_JSON, null, 2));
    const [error,     setError]     = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.proposed_medications?.length) throw new Error("Missing required field: proposed_medications");
            onSubmit(parsed);
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
                    rows={28} spellCheck={false}
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
                background: isStreaming ? C.dim : C.amber,
                border: "none", color: isStreaming ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Drug Safety Check</>}
            </button>
        </form>
    );
}

// ── Main page component ───────────────────────────────────────────────────────
export default function DrugSafetyAgent() {
    const navigate = useNavigate();

    const [inputMode,     setInputMode]     = useState("form");
    const [isStreaming,   setIsStreaming]   = useState(false);
    const [streamEvents,  setStreamEvents]  = useState([]);
    const [finalResult,   setFinalResult]   = useState(null);
    const [currentStep,   setCurrentStep]   = useState(null);
    const [error,         setError]         = useState(null);
    const [liveText,      setLiveText]      = useState("");
    const [partialResult, setPartialResult] = useState(null);
    const [copied,        setCopied]        = useState(false);
    const [expandedContra,  setExpandedContra]  = useState(null);
    const [expandedInteract, setExpandedInteract] = useState(null);
    const [expandedAlt,   setExpandedAlt]   = useState(null);

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

    // ── Incremental parsing during token stream ──────────────────────────────
    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = {};

            const safetyMatch  = liveText.match(/"safety_status"\s*:\s*"([^"]+)"/);
            if (safetyMatch) partial.safety_status = safetyMatch[1];

            const approvedMatch = [...liveText.matchAll(/"approved_medications"\s*:\s*\[([^\]]*)\]/g)];
            const flaggedMatch  = [...liveText.matchAll(/"flagged_medications"\s*:\s*\[([^\]]*)\]/g)];
            if (approvedMatch.length) {
                const raw = approvedMatch[approvedMatch.length - 1][1];
                partial.approved_medications = raw.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g,"")) || [];
            }
            if (flaggedMatch.length) {
                const raw = flaggedMatch[flaggedMatch.length - 1][1];
                partial.flagged_medications = raw.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g,"")) || [];
            }

            const riskMatch = liveText.match(/"overall_risk_level"\s*:\s*"([^"]+)"/);
            if (riskMatch) partial.patient_risk_profile = { overall_risk_level: riskMatch[1] };

            const propMatch  = liveText.match(/"proposed_count"\s*:\s*(\d+)/);
            const appMatch   = liveText.match(/"approved_count"\s*:\s*(\d+)/);
            const flagMatch  = liveText.match(/"flagged_count"\s*:\s*(\d+)/);
            const interMatch = liveText.match(/"interaction_count"\s*:\s*(\d+)/);
            const contraMatch = liveText.match(/"contraindication_count"\s*:\s*(\d+)/);
            const bbMatch    = liveText.match(/"black_box_warnings"\s*:\s*(\d+)/);
            if (propMatch || appMatch || flagMatch) {
                partial.summary = {
                    proposed_count:         propMatch  ? parseInt(propMatch[1])  : 0,
                    approved_count:         appMatch   ? parseInt(appMatch[1])   : 0,
                    flagged_count:          flagMatch  ? parseInt(flagMatch[1])  : 0,
                    interaction_count:      interMatch ? parseInt(interMatch[1]) : 0,
                    contraindication_count: contraMatch? parseInt(contraMatch[1]): 0,
                    black_box_warnings:     bbMatch    ? parseInt(bbMatch[1])    : 0,
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

    // ── SSE fetch ────────────────────────────────────────────────────────────
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

    // Route form submit: build full payload
    const handleFormSubmit = (payload) => runDrugSafety(payload);
    const handleJsonSubmit = (payload) => runDrugSafety(payload);

    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,    "#FEE2E2"],
            complete: [C.green,  "#DCFCE7"],
            status:   [C.amber,  "#FEF3C7"],
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

                {/* Right — port + type + theme toggle */}
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

            {/* ── Page Header ────────────────────────────────────────────────── */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.amber}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            <Shield size={18} color={C.amber} strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Agent 04</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Drug Safety Agent
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 640 }}>
                        FDA OpenFDA + RxNav interactions engine with LLM enrichment. Checks allergy cross-reactivity, condition contraindications, and drug-drug interactions — streaming real-time safety verdicts with proactive alternatives.
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
                                    background: inputMode === tab.id ? C.amber : "transparent",
                                    color:      inputMode === tab.id ? "#fff"  : C.muted,
                                    borderBottom: inputMode === tab.id ? `2px solid ${C.amber}` : "2px solid transparent",
                                    transition: "all 0.2s",
                                }}
                            >
                                <tab.icon size={13} /> {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: 20 }}>
                        {inputMode === "form"
                            ? <FormInputMode onSubmit={handleFormSubmit} isStreaming={isStreaming} />
                            : <JsonInputMode onSubmit={handleJsonSubmit} isStreaming={isStreaming} />}
                    </div>
                </div>

                {/* ── RIGHT: Output Panel ── */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
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
                            <div style={{ padding: "10px 14px", background: C.amber, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
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

                        {/* Raw SSE event log */}
                        <div style={{ border: `1px solid ${C.border}` }}>
                            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.amber} 6%, ${C.surface})` }}>
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
                                            : <Loader2  size={12} color={C.amber} style={{ animation: "spin 2s linear infinite" }} />}
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

                                {/* Safety Status Banner */}
                                {displayResult.safety_status && (() => {
                                    const status = displayResult.safety_status;
                                    const color  = safetyColor(status);
                                    const IconComp = safetyIcon(status);
                                    return (
                                        <div style={{
                                            padding: "16px 18px",
                                            background: `${color}12`,
                                            border: `1px solid ${color}40`,
                                            borderLeft: `4px solid ${color}`,
                                            display: "flex", alignItems: "center", gap: 12,
                                        }}>
                                            <IconComp size={22} color={color} style={{ flexShrink: 0 }} />
                                            <div>
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                                    Safety Verdict
                                                </p>
                                                <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1.2 }}>{status}</p>
                                            </div>
                                            {!isFinal && <Loader2 size={14} color={color} style={{ animation: "spin 2s linear infinite", marginLeft: "auto" }} />}
                                        </div>
                                    );
                                })()}

                                {/* Summary stat cards */}
                                {displayResult.summary && (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                        {[
                                            { label: "Proposed", value: displayResult.summary.proposed_count,         color: C.amber },
                                            { label: "Approved", value: displayResult.summary.approved_count,         color: C.green },
                                            { label: "Flagged",  value: displayResult.summary.flagged_count,          color: C.red },
                                            { label: "Interactions", value: displayResult.summary.interaction_count,  color: C.orange },
                                            { label: "Contra.",  value: displayResult.summary.contraindication_count, color: C.yellow },
                                            { label: "Black Box", value: displayResult.summary.black_box_warnings,   color: C.red },
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

                                {/* Approved / Flagged medication lists */}
                                {((displayResult.approved_medications?.length > 0) || (displayResult.flagged_medications?.length > 0)) && (
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                        {/* Approved */}
                                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <ShieldCheck size={13} color={C.green} />
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, margin: 0 }}>
                                                    Approved ({displayResult.approved_medications?.length || 0})
                                                </p>
                                            </div>
                                            {displayResult.approved_medications?.length === 0
                                                ? <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>None</p>
                                                : displayResult.approved_medications.map((med, i) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text, marginBottom: 4 }}>
                                                        <Pill size={11} color={C.green} /> {med}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        {/* Flagged */}
                                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                <ShieldX size={13} color={C.red} />
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: 0 }}>
                                                    Flagged ({displayResult.flagged_medications?.length || 0})
                                                </p>
                                            </div>
                                            {displayResult.flagged_medications?.length === 0
                                                ? <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>None</p>
                                                : displayResult.flagged_medications.map((med, i) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text, marginBottom: 4 }}>
                                                        <Pill size={11} color={C.red} /> {med}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Lab Assessment */}
                                {isFinal && displayResult.lab_assessment && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                            <Activity size={13} color={C.cyan} />
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.cyan, margin: 0 }}>
                                                Lab Assessment
                                            </p>
                                        </div>
                                        <p style={{ fontSize: 12, color: C.text, margin: "0 0 8px", lineHeight: 1.6 }}>
                                            {displayResult.lab_assessment.overall_lab_summary}
                                        </p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {displayResult.lab_assessment.sepsis_suspicion && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.red}15`, border: `1px solid ${C.red}40`, color: C.red }}>⚠ Sepsis Suspected</span>
                                            )}
                                            {displayResult.lab_assessment.renal_impairment_suspected && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.orange}15`, border: `1px solid ${C.orange}40`, color: C.orange }}>Renal Impairment Suspected</span>
                                            )}
                                            {displayResult.lab_assessment.hepatic_impairment_suspected && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.yellow}15`, border: `1px solid ${C.yellow}40`, color: C.yellow }}>Hepatic Impairment Suspected</span>
                                            )}
                                            {displayResult.lab_assessment.coagulopathy_suspected && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.purple}15`, border: `1px solid ${C.purple}40`, color: C.purple }}>Coagulopathy Suspected</span>
                                            )}
                                        </div>
                                        {displayResult.lab_assessment.critical_flags?.length > 0 && (
                                            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                                                {displayResult.lab_assessment.critical_flags.map((flag, i) => (
                                                    <div key={i} style={{ padding: "8px 10px", background: `${C.red}08`, border: `1px solid ${C.red}30`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                                                        <AlertTriangle size={12} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                                        <div>
                                                            <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>
                                                                {flag.display}: <span style={{ color: C.red }}>{flag.value} {flag.unit}</span>
                                                            </p>
                                                            <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>{flag.drug_safety_implication}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Contraindications */}
                                {isFinal && displayResult.contraindications?.length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.red} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Contraindications ({displayResult.contraindications.length})
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            {displayResult.contraindications.map((contra, idx) => (
                                                <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                                    <div
                                                        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                        onClick={() => setExpandedContra(expandedContra === idx ? null : idx)}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                <span style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                                                                    padding: "2px 6px",
                                                                    color: severityColor(contra.severity),
                                                                    background: `${severityColor(contra.severity)}15`,
                                                                    border: `1px solid ${severityColor(contra.severity)}40`,
                                                                }}>{contra.severity}</span>
                                                                <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{contra.drug}</p>
                                                            </div>
                                                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{contra.reason?.slice(0, 80)}...</p>
                                                        </div>
                                                        <ChevronDown size={14} color={C.muted} style={{
                                                            marginLeft: 10, flexShrink: 0,
                                                            transform: expandedContra === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                            transition: "transform 0.2s",
                                                        }} />
                                                    </div>
                                                    {expandedContra === idx && (
                                                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                            <div>
                                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Reason</p>
                                                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{contra.reason}</p>
                                                            </div>
                                                            {contra.recommendation && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.amber, margin: "0 0 4px" }}>Recommendation</p>
                                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{contra.recommendation}</p>
                                                                </div>
                                                            )}
                                                            {contra.type && (
                                                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", background: `${C.muted}12`, color: C.muted, display: "inline-fit-content" }}>
                                                                    {contra.type.replace(/_/g, " ")}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Drug Interactions */}
                                {isFinal && displayResult.critical_interactions?.length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.orange} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Drug Interactions ({displayResult.critical_interactions.length})
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            {displayResult.critical_interactions.map((inter, idx) => (
                                                <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                                    <div
                                                        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                        onClick={() => setExpandedInteract(expandedInteract === idx ? null : idx)}
                                                    >
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 , flexWrap: "wrap" }}>
                                                                <span style={{
                                                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                                                                    padding: "2px 6px",
                                                                    color: severityColor(inter.severity),
                                                                    background: `${severityColor(inter.severity)}15`,
                                                                    border: `1px solid ${severityColor(inter.severity)}40`,
                                                                }}>{inter.severity}</span>
                                                                <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>
                                                                    {inter.drug_a} + {inter.drug_b}
                                                                </p>
                                                                {inter.severity_upgraded && (
                                                                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
                                                                        ↑ UPGRADED
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                                                {inter.description?.slice(0, 80)}...
                                                            </p>
                                                        </div>
                                                        <ChevronDown size={14} color={C.muted} style={{
                                                            marginLeft: 10, flexShrink: 0,
                                                            transform: expandedInteract === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                            transition: "transform 0.2s",
                                                        }} />
                                                    </div>
                                                    {expandedInteract === idx && (
                                                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                            {inter.mechanism && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Mechanism</p>
                                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{inter.mechanism}</p>
                                                                </div>
                                                            )}
                                                            {inter.clinical_significance && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.orange, margin: "0 0 4px" }}>Clinical Significance</p>
                                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{inter.clinical_significance}</p>
                                                                </div>
                                                            )}
                                                            {inter.management_strategy && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.amber, margin: "0 0 4px" }}>Management Strategy</p>
                                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{inter.management_strategy}</p>
                                                                </div>
                                                            )}
                                                            {inter.monitoring_parameters?.length > 0 && (
                                                                <div>
                                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.cyan, margin: "0 0 4px" }}>Monitoring Parameters</p>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                                        {inter.monitoring_parameters.map((m, i) => (
                                                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.text }}>
                                                                                <CheckCircle2 size={11} color={C.cyan} style={{ flexShrink: 0, marginTop: 1 }} /> {m}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {inter.time_to_onset && (
                                                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                                                    <span style={{ fontWeight: 700 }}>Time to onset:</span> {inter.time_to_onset}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Patient Risk Profile */}
                                {isFinal && displayResult.patient_risk_profile && (
                                    <div style={{
                                        background: C.bg, padding: 14, border: `1px solid ${C.border}`,
                                        borderLeft: `4px solid ${severityColor(displayResult.patient_risk_profile.overall_risk_level)}`,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                            <Zap size={13} color={severityColor(displayResult.patient_risk_profile.overall_risk_level)} />
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: severityColor(displayResult.patient_risk_profile.overall_risk_level), margin: 0 }}>
                                                Patient Risk Profile — {displayResult.patient_risk_profile.overall_risk_level}
                                            </p>
                                            {displayResult.patient_risk_profile.safe_to_proceed === false && (
                                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
                                                    DO NOT PRESCRIBE
                                                </span>
                                            )}
                                            {displayResult.patient_risk_profile.safe_to_proceed === true && (
                                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30` }}>
                                                    SAFE TO PROCEED
                                                </span>
                                            )}
                                        </div>
                                        {displayResult.patient_risk_profile.clinical_summary && (
                                            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px", lineHeight: 1.65, fontStyle: "italic" }}>
                                                {displayResult.patient_risk_profile.clinical_summary}
                                            </p>
                                        )}
                                        {displayResult.patient_risk_profile.primary_risk_factors?.length > 0 && (
                                            <div>
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Primary Risk Factors</p>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                    {displayResult.patient_risk_profile.primary_risk_factors.map((f, i) => (
                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.text }}>
                                                            <AlertTriangle size={11} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Interaction risk narrative */}
                                {isFinal && displayResult.interaction_risk_narrative && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>
                                            Interaction Risk Narrative
                                        </p>
                                        <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.65 }}>
                                            {displayResult.interaction_risk_narrative}
                                        </p>
                                    </div>
                                )}

                                {/* Proactive Alternatives */}
                                {isFinal && displayResult.proactive_alternatives && Object.keys(displayResult.proactive_alternatives).length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.green} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Proactive Alternatives ({Object.keys(displayResult.proactive_alternatives).length} drug(s))
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            {Object.entries(displayResult.proactive_alternatives).map(([drug, altData], idx) => (
                                                altData && (
                                                    <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                                        <div
                                                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                            onClick={() => setExpandedAlt(expandedAlt === idx ? null : idx)}
                                                        >
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                    <Pill size={12} color={C.green} />
                                                                    <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>
                                                                        Replace: {drug}
                                                                    </p>
                                                                    {altData.urgency && (
                                                                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", background: `${safetyColor("UNSAFE")}15`, color: safetyColor("UNSAFE"), border: `1px solid ${safetyColor("UNSAFE")}30` }}>
                                                                            {altData.urgency}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                                                    {altData.alternatives?.length} alternative(s) available
                                                                </p>
                                                            </div>
                                                            <ChevronDown size={14} color={C.muted} style={{
                                                                marginLeft: 10, flexShrink: 0,
                                                                transform: expandedAlt === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                                transition: "transform 0.2s",
                                                            }} />
                                                        </div>
                                                        {expandedAlt === idx && (
                                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                                {altData.clinical_note && (
                                                                    <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                                                                        {altData.clinical_note}
                                                                    </p>
                                                                )}
                                                                {altData.alternatives?.map((alt, i) => (
                                                                    <div key={i} style={{
                                                                        padding: 10, background: C.surface,
                                                                        border: `1px solid ${C.border}`,
                                                                        borderLeft: `3px solid ${alt.safe_to_prescribe ? C.green : C.yellow}`,
                                                                    }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                                                            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{alt.drug}</p>
                                                                            {alt.safe_to_prescribe
                                                                                ? <CheckCircle2 size={12} color={C.green} />
                                                                                : <AlertCircle  size={12} color={C.yellow} />}
                                                                            {alt.drug_class && (
                                                                                <span style={{ fontSize: 9, padding: "2px 6px", background: `${C.cyan}12`, color: C.cyan, border: `1px solid ${C.cyan}30`, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                                                                    {alt.drug_class}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 5px", lineHeight: 1.5 }}>{alt.rationale}</p>
                                                                        {alt.cautions && (
                                                                            <p style={{ fontSize: 11, color: C.yellow, margin: 0, fontStyle: "italic" }}>⚠ {alt.cautions}</p>
                                                                        )}
                                                                        {alt.interaction_check_needed?.length > 0 && (
                                                                            <p style={{ fontSize: 10, color: C.muted, margin: "4px 0 0" }}>
                                                                                Interaction check needed with: {alt.interaction_check_needed.join(", ")}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* FDA Warnings */}
                                {isFinal && displayResult.fda_warnings && Object.values(displayResult.fda_warnings).some(w => w?.length > 0) && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                            <FileWarning size={13} color={C.red} />
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.red, margin: 0 }}>
                                                FDA Warnings
                                            </p>
                                        </div>
                                        {Object.entries(displayResult.fda_warnings).map(([drug, warnings]) => (
                                            warnings?.length > 0 && (
                                                <div key={drug} style={{ marginBottom: 10 }}>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: "0 0 5px" }}>{drug}</p>
                                                    {warnings.map((w, i) => (
                                                        <p key={i} style={{ fontSize: 11, color: C.muted, margin: "0 0 4px", lineHeight: 1.5, paddingLeft: 10, borderLeft: `2px solid ${C.red}40` }}>
                                                            {w.slice(0, 300)}{w.length > 300 ? "..." : ""}
                                                        </p>
                                                    ))}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}

                            </div>
                        )}

                        {/* Empty state */}
                        {!isStreaming && streamEvents.length === 0 && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <Shield size={40} color={C.dim} style={{ margin: "0 auto 12px" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                                    Ready to check drug safety. Fill in medications and click "Run Drug Safety Check".
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
                <DrugSafetyHistory defaultPatientId={inputMode === "form" ? "test-patient-001" : ""} />
            </div>
        </div>
    );
}
