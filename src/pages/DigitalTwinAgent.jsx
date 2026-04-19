import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    GitBranch, FileJson, FormInput, Play, X, AlertCircle,
    Loader2, ChevronDown, AlertTriangle, ArrowLeft, ChevronRight,
    Wifi, Copy, Check, Plus, Trash2, TrendingUp, TrendingDown,
    DollarSign, CheckCircle2, Shield, Activity, BarChart3, Clock,
    Target,
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

// ── Colour tokens — blue accent for Digital Twin ─────────────────────────────
const C = {
    bg:      "var(--color-bg)",
    surface: "var(--color-surface)",
    border:  "var(--color-border)",
    accent:  "#3b82f6",
    text:    "var(--color-text)",
    muted:   "var(--color-text-subtle)",
    dim:     "var(--color-border)",
    green:   "#22C55E",
    yellow:  "#EAB308",
    red:     "#EF4444",
    cyan:    "#06B6D4",
    purple:  "#8b5cf6",
    orange:  "#F97316",
};

// ── Shared input styles ───────────────────────────────────────────────────────
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

// ── Example JSON payload ──────────────────────────────────────────────────────
const EXAMPLE_JSON = {
    patient_state: {
        patient_id: "test-dt-001",
        demographics: { name: "John Test", age: 54, gender: "male", dob: "1970-03-14" },
        active_conditions: [
            { code: "J18.9", display: "Pneumonia" },
            { code: "E11.9", display: "Type 2 Diabetes" },
            { code: "I48.0", display: "Atrial fibrillation" },
        ],
        medications: [
            { drug: "Warfarin 5mg",   dose: "5mg",   frequency: "OD",  status: "active" },
            { drug: "Metformin 850mg", dose: "850mg", frequency: "BID", status: "active" },
        ],
        allergies: [{ substance: "Penicillin", reaction: "Anaphylaxis", severity: "severe" }],
        lab_results: [
            { loinc: "26464-8", display: "WBC",        value: 18.4,  unit: "10*3/uL", flag: "CRITICAL" },
            { loinc: "1988-5",  display: "CRP",        value: 142.0, unit: "mg/L",    flag: "HIGH"     },
            { loinc: "2160-0",  display: "Creatinine", value: 1.1,   unit: "mg/dL",   flag: "NORMAL"   },
        ],
        diagnostic_reports: [],
        recent_encounters: [],
        state_timestamp: "2025-04-01T10:30:00Z",
        imaging_available: true,
    },
    diagnosis: "Community-acquired pneumonia (J18.9)",
    treatment_options: [
        {
            option_id: "A", label: "Azithromycin outpatient",
            drugs: ["Azithromycin 500mg"], interventions: ["O2 supplementation"],
        },
        {
            option_id: "B", label: "Ceftriaxone IV + Azithromycin (hospitalization)",
            drugs: ["Ceftriaxone 1g IV", "Azithromycin 500mg"],
            interventions: ["Hospitalization", "IV fluids", "Continuous monitoring"],
        },
    ],
    include_sensitivity_analysis: true,
    include_cost_analysis: true,
    prediction_horizons: ["7d", "30d", "90d"],
    patient_preferences: {},
};

// ── Colour helpers ─────────────────────────────────────────────────────────────
const riskColor = (level) => {
    const l = (level || "").toUpperCase();
    if (l === "HIGH"     || l === "CRITICAL")               return C.red;
    if (l === "MODERATE" || l === "INTERACTION_WARNING")    return C.yellow;
    if (l === "LOW"      || l === "SAFE")                   return C.green;
    return C.muted;
};
const safetyColor = (flag) => {
    if (!flag) return C.muted;
    const f = flag.toUpperCase();
    if (f === "CONTRAINDICATED")      return C.red;
    if (f === "ALLERGY_RISK")         return C.orange;
    if (f === "INTERACTION_WARNING")  return C.yellow;
    if (f === "SAFE")                 return C.green;
    return C.muted;
};
const adherenceColor = (a) => {
    if (!a) return C.muted;
    if (a === "FIRST_LINE")            return C.green;
    if (a === "OFF_GUIDELINE")         return C.red;
    if (a === "SECOND_LINE")           return C.yellow;
    if (a === "INPATIENT_APPROPRIATE") return C.cyan;
    return C.muted;
};

// ── FORM INPUT MODE ───────────────────────────────────────────────────────────
function FormInputMode({ onSubmit, isStreaming }) {
    const [patientId,   setPatientId]   = useState("test-dt-001");
    const [name,        setName]        = useState("John Test");
    const [age,         setAge]         = useState("54");
    const [gender,      setGender]      = useState("male");
    const [dob,         setDob]         = useState("1970-03-14");
    const [conditions,  setConditions]  = useState(
        "J18.9 - Pneumonia\nE11.9 - Type 2 Diabetes\nI48.0 - Atrial fibrillation"
    );
    const [medications, setMedications] = useState(
        "Warfarin 5mg, 5mg, OD\nMetformin 850mg, 850mg, BID"
    );
    const [allergies,   setAllergies]   = useState("Penicillin, Anaphylaxis, severe");
    const [labRows,     setLabRows]     = useState([
        { loinc: "26464-8", display: "WBC",        value: "18.4",  unit: "10*3/uL", flag: "CRITICAL" },
        { loinc: "1988-5",  display: "CRP",        value: "142.0", unit: "mg/L",    flag: "HIGH"     },
        { loinc: "2160-0",  display: "Creatinine", value: "1.1",   unit: "mg/dL",   flag: "NORMAL"   },
    ]);
    const [diagnosis,   setDiagnosis]   = useState("Community-acquired pneumonia (J18.9)");
    const [options,     setOptions]     = useState([
        { label: "Azithromycin outpatient",                       drugs: "Azithromycin 500mg",                        interventions: "O2 supplementation"                              },
        { label: "Ceftriaxone IV + Azithromycin (hospitalization)", drugs: "Ceftriaxone 1g IV\nAzithromycin 500mg", interventions: "Hospitalization\nIV fluids\nContinuous monitoring" },
    ]);
    const [horizons,      setHorizons]      = useState(["7d", "30d", "90d"]);
    const [prioritizeCost, setPrioritizeCost] = useState(false);
    const [avoidHosp,     setAvoidHosp]     = useState(false);

    // Lab row helpers
    const addLabRow    = () => setLabRows(p => [...p, { loinc: "", display: "", value: "", unit: "", flag: "NORMAL" }]);
    const removeLabRow = (i) => setLabRows(p => p.filter((_, idx) => idx !== i));
    const updateLabRow = (i, k, v) => setLabRows(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

    // Treatment option helpers
    const addOption    = () => setOptions(p => [...p, { label: "", drugs: "", interventions: "" }]);
    const removeOption = (i) => setOptions(p => p.filter((_, idx) => idx !== i));
    const updateOption = (i, k, v) => setOptions(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

    const toggleHorizon = (h) =>
        setHorizons(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const parseConds   = (str) => str.trim()
            ? str.split("\n").filter(Boolean).map(line => {
                const dash = line.indexOf("-");
                return dash > -1
                    ? { code: line.slice(0, dash).trim(), display: line.slice(dash + 1).trim() }
                    : { code: "UNKNOWN", display: line.trim() };
              })
            : [];
        const parseMeds    = (str) => str.trim()
            ? str.split("\n").filter(Boolean).map(line => {
                const [drug, dose, freq] = line.split(",").map(s => s.trim());
                return { drug: drug || "", dose: dose || "", frequency: freq || "1x per 1d", status: "active" };
              })
            : [];
        const parseAllergs = (str) => str.trim()
            ? str.split("\n").filter(Boolean).map(line => {
                const [substance, reaction, severity] = line.split(",").map(s => s.trim());
                return { substance, reaction: reaction || "", severity: severity || "unknown" };
              })
            : [];

        const labResults = labRows
            .filter(r => r.loinc && r.value)
            .map(r => ({
                loinc: r.loinc.trim(), display: r.display.trim(),
                value: parseFloat(r.value), unit: r.unit.trim(), flag: r.flag,
            }));

        const treatmentOptions = options.map((opt, idx) => ({
            option_id:     String.fromCharCode(65 + idx),
            label:         opt.label,
            drugs:         opt.drugs.split("\n").map(s => s.trim()).filter(Boolean),
            interventions: opt.interventions.split("\n").map(s => s.trim()).filter(Boolean),
        }));

        onSubmit({
            patient_state: {
                patient_id:          patientId,
                demographics:        { name, age: parseInt(age), gender, dob },
                active_conditions:   parseConds(conditions),
                medications:         parseMeds(medications),
                allergies:           parseAllergs(allergies),
                lab_results:         labResults,
                diagnostic_reports:  [],
                recent_encounters:   [],
                state_timestamp:     new Date().toISOString(),
                imaging_available:   false,
            },
            diagnosis,
            treatment_options:            treatmentOptions,
            include_sensitivity_analysis: true,
            include_cost_analysis:        true,
            prediction_horizons:          horizons.length > 0 ? horizons : ["7d", "30d"],
            patient_preferences:          { prioritize_cost: prioritizeCost, avoid_hospitalization: avoidHosp },
        });
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
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
                <Field label="Date of Birth">
                    <input type="date" style={inputStyle} value={dob} onChange={e => setDob(e.target.value)} />
                </Field>
            </div>

            <Field label="Active Conditions (one per line: ICD-10 code - display)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3}
                    value={conditions} onChange={e => setConditions(e.target.value)}
                    placeholder="J18.9 - Community-acquired pneumonia" />
            </Field>

            <Field label="Medications (one per line: drug, dose, frequency)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3}
                    value={medications} onChange={e => setMedications(e.target.value)}
                    placeholder="Warfarin 5mg, 5mg, OD" />
            </Field>

            <Field label="Allergies (one per line: substance, reaction, severity)">
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2}
                    value={allergies} onChange={e => setAllergies(e.target.value)}
                    placeholder="Penicillin, Anaphylaxis, severe" />
            </Field>

            {/* Lab Results */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Lab Results</label>
                    <button type="button" onClick={addLabRow} style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: "none", border: `1px solid ${C.accent}`, color: C.accent,
                        padding: "3px 8px", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    }}>
                        <Plus size={10} /> Add Row
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {labRows.map((row, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "105px 85px 65px 60px 90px auto", gap: 5, alignItems: "center" }}>
                            <input style={{ ...inputStyle, fontFamily: "monospace", fontSize: 11 }} placeholder="LOINC"
                                value={row.loinc} onChange={e => updateLabRow(i, "loinc", e.target.value)} />
                            <input style={inputStyle} placeholder="Display"
                                value={row.display} onChange={e => updateLabRow(i, "display", e.target.value)} />
                            <input type="number" step="any" style={inputStyle} placeholder="Value"
                                value={row.value} onChange={e => updateLabRow(i, "value", e.target.value)} />
                            <input style={inputStyle} placeholder="Unit"
                                value={row.unit} onChange={e => updateLabRow(i, "unit", e.target.value)} />
                            <select style={inputStyle} value={row.flag} onChange={e => updateLabRow(i, "flag", e.target.value)}>
                                <option value="NORMAL">NORMAL</option>
                                <option value="HIGH">HIGH</option>
                                <option value="LOW">LOW</option>
                                <option value="CRITICAL">CRITICAL</option>
                            </select>
                            <button type="button" onClick={() => removeLabRow(i)} style={{
                                background: "none", border: "none", cursor: "pointer", color: C.muted,
                                padding: 4, display: "flex", alignItems: "center", transition: "color 0.2s",
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

            {/* Diagnosis — critical for Digital Twin */}
            <div style={{ padding: 12, background: `${C.accent}08`, border: `1px solid ${C.accent}30` }}>
                <p style={{ ...labelStyle, color: C.accent, margin: "0 0 8px" }}>Diagnosis * (required by Digital Twin)</p>
                <input style={inputStyle} value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                    placeholder="Community-acquired pneumonia (J18.9)" required />
            </div>

            {/* Treatment Options */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Treatment Options to Simulate</label>
                    {options.length < 5 && (
                        <button type="button" onClick={addOption} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "none", border: `1px solid ${C.accent}`, color: C.accent,
                            padding: "3px 8px", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                        }}>
                            <Plus size={10} /> Add Option
                        </button>
                    )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {options.map((opt, i) => (
                        <div key={i} style={{ padding: 12, border: `1px solid ${C.border}`, background: C.bg }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 900, color: C.accent,
                                    background: `${C.accent}12`, padding: "2px 8px",
                                    border: `1px solid ${C.accent}30`,
                                }}>
                                    Option {String.fromCharCode(65 + i)}
                                </span>
                                {options.length > 1 && (
                                    <button type="button" onClick={() => removeOption(i)} style={{
                                        background: "none", border: "none", cursor: "pointer", color: C.muted,
                                        padding: 2, display: "flex", alignItems: "center", transition: "color 0.2s",
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = C.red}
                                        onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <Field label="Label">
                                    <input style={inputStyle} value={opt.label}
                                        onChange={e => updateOption(i, "label", e.target.value)}
                                        placeholder="e.g. Azithromycin outpatient" required />
                                </Field>
                                <Field label="Drugs (one per line)">
                                    <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2}
                                        value={opt.drugs} onChange={e => updateOption(i, "drugs", e.target.value)}
                                        placeholder="Azithromycin 500mg" />
                                </Field>
                                <Field label="Interventions (one per line)">
                                    <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2}
                                        value={opt.interventions}
                                        onChange={e => updateOption(i, "interventions", e.target.value)}
                                        placeholder="O2 supplementation" />
                                </Field>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Prediction Horizons */}
            <div>
                <label style={labelStyle}>Prediction Horizons</label>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {["7d", "30d", "90d", "1yr"].map(h => (
                        <label key={h} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: C.text }}>
                            <input type="checkbox" checked={horizons.includes(h)} onChange={() => toggleHorizon(h)}
                                style={{ accentColor: C.accent }} />
                            {h}
                        </label>
                    ))}
                </div>
            </div>

            {/* Patient Preferences */}
            <div style={{ padding: 12, background: `${C.accent}06`, border: `1px solid ${C.border}` }}>
                <label style={{ ...labelStyle, marginBottom: 10 }}>Patient Preferences</label>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: C.text }}>
                        <input type="checkbox" checked={prioritizeCost} onChange={e => setPrioritizeCost(e.target.checked)}
                            style={{ accentColor: C.accent }} />
                        Prioritize lower cost
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: C.text }}>
                        <input type="checkbox" checked={avoidHosp} onChange={e => setAvoidHosp(e.target.checked)}
                            style={{ accentColor: C.accent }} />
                        Avoid hospitalization
                    </label>
                </div>
            </div>

            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? C.dim : C.accent,
                border: "none", color: isStreaming ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Simulation</>}
            </button>
        </form>
    );
}

// ── JSON INPUT MODE ───────────────────────────────────────────────────────────
function JsonInputMode({ onSubmit, isStreaming }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(EXAMPLE_JSON, null, 2));
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.patient_state) throw new Error("Missing required field: patient_state");
            if (!parsed.diagnosis)     throw new Error("Missing required field: diagnosis");
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
                background: isStreaming ? C.dim : C.accent,
                border: "none", color: isStreaming ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Simulation</>}
            </button>
        </form>
    );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────
export default function DigitalTwinAgent() {
    const navigate         = useNavigate();
    const [inputMode,      setInputMode]      = useState("form");
    const [isStreaming,    setIsStreaming]     = useState(false);
    const [streamEvents,   setStreamEvents]   = useState([]);
    const [finalResult,    setFinalResult]    = useState(null);
    const [currentStep,    setCurrentStep]    = useState(null);
    const [error,          setError]          = useState(null);
    const [liveText,       setLiveText]       = useState("");
    const [copied,         setCopied]         = useState(false);
    const [expandedScen,   setExpandedScen]   = useState(null);

    const abortControllerRef = useRef(null);
    const eventsEndRef       = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setCurrentStep(null);
        setError(null); setLiveText(""); setCopied(false); setExpandedScen(null);
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

    // ── SSE fetch ─────────────────────────────────────────────────────────────
    const runSimulation = async (payload) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("http://127.0.0.1:8006/stream", {
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
                    const raw = line.slice(6);
                    if (raw === "[DONE]") { setIsStreaming(false); continue; }
                    try {
                        const event = JSON.parse(raw);
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

    // ── Event badge ───────────────────────────────────────────────────────────
    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,    "#FEE2E2"],
            complete: [C.green,  "#DCFCE7"],
            status:   [C.accent, "#DBEAFE"],
            progress: [C.yellow, "#FEF9C3"],
        };
        const [fg, bg] = map[type] || ["#6B7280", "#F3F4F6"];
        return {
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 6px", borderRadius: 2, color: fg, background: bg, fontFamily: "monospace",
        };
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const result       = finalResult;
    const summary      = result?.simulation_summary;
    const scenarios    = result?.scenarios || [];
    const attribution  = result?.feature_attribution || [];
    const sensitivity  = result?.sensitivity_analysis || [];
    const costEff      = result?.cost_effectiveness_summary;
    const recommendedId = summary?.recommended_option;

    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <style>{`
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar       { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: var(--color-surface); }
                ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
                select option             { background: var(--color-bg); color: var(--color-text); }
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
                        <div style={{ width: 26, height: 26, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 4 }}>
                            <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>MT</span>
                        </div>
                        {[
                            { label: "MediTwin AI",   path: "/" },
                            { label: "Dashboard",     path: "/dashboard" },
                            { label: "Microservices", path: "/dashboard/microservices" },
                        ].map(crumb => (
                            <span key={crumb.path} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                                <button onClick={() => navigate(crumb.path)} style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                                    textTransform: "uppercase", color: C.muted, transition: "color 0.2s", padding: 0,
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                                >{crumb.label}</button>
                            </span>
                        ))}
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text }}>
                                Digital Twin Agent
                            </span>
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11 }}>
                        <Wifi size={11} color={C.accent} />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8006</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${C.border}`, color: C.accent }}>
                        A2A
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* ── Page Header ── */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            <GitBranch size={18} color={C.accent} strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Agent 06</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Digital Twin Agent
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 700 }}>
                        XGBoost risk prediction engine with uncertainty quantification. Simulates treatment scenarios, checks drug safety, runs sensitivity and cost-effectiveness analysis — with streaming LLM clinical narrative.
                    </p>
                </div>
            </div>

            {/* ── Main 2-col Grid ── */}
            <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start",
            }}>

                {/* ── LEFT: Input Panel ── */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                        {[{ id: "form", icon: FormInput, label: "Form Input" }, { id: "json", icon: FileJson, label: "Raw JSON" }].map(tab => (
                            <button key={tab.id} onClick={() => setInputMode(tab.id)} style={{
                                flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                background:   inputMode === tab.id ? C.accent : "transparent",
                                color:        inputMode === tab.id ? "#fff"  : C.muted,
                                borderBottom: inputMode === tab.id ? `2px solid ${C.accent}` : "2px solid transparent",
                                transition: "all 0.2s",
                            }}>
                                <tab.icon size={13} /> {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: 20 }}>
                        {inputMode === "form"
                            ? <FormInputMode onSubmit={runSimulation} isStreaming={isStreaming} />
                            : <JsonInputMode onSubmit={runSimulation} isStreaming={isStreaming} />
                        }
                    </div>
                </div>

                {/* ── RIGHT: Output Panel ── */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {/* Header */}
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

                        {/* Step indicator */}
                        {currentStep && (
                            <div style={{ padding: "10px 14px", background: C.accent, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
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

                        {/* SSE event log */}
                        <div style={{ border: `1px solid ${C.border}` }}>
                            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
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

                        {/* Live clinical narrative (streaming) / Final JSON block */}
                        {(liveText || finalResult) && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {finalResult
                                            ? <FileJson size={12} color={C.green} />
                                            : <Loader2  size={12} color={C.accent} style={{ animation: "spin 2s linear infinite" }} />}
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: finalResult ? C.green : C.muted, margin: 0 }}>
                                            {finalResult ? "Final Clean JSON" : "Clinical Narrative (Streaming...)"}
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
                                <div style={{ maxHeight: 340, overflowY: "auto", background: "#080810", padding: 14, border: `1px solid ${C.border}`, borderRadius: 2 }}>
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                        {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* ── Structured Result sections ── */}
                        {result && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                                {/* ── 1. Simulation Summary ── */}
                                {summary && (
                                    <>
                                        {/* Risk profile + Recommendation */}
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                            <div style={{ background: C.bg, padding: 14, border: `1px solid ${C.border}`, borderLeft: `4px solid ${riskColor(summary.patient_risk_profile)}` }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Patient Risk Profile</p>
                                                <p style={{ fontSize: 20, fontWeight: 900, color: riskColor(summary.patient_risk_profile), margin: 0 }}>
                                                    {summary.patient_risk_profile}
                                                </p>
                                                <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0", lineHeight: 1.4 }}>{summary.primary_concern}</p>
                                            </div>
                                            <div style={{ background: C.bg, padding: 14, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.accent}` }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>Recommended Option</p>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <span style={{ width: 32, height: 32, background: C.accent, color: "#fff", fontSize: 16, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                                                        {summary.recommended_option}
                                                    </span>
                                                    <div>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>Option {summary.recommended_option}</p>
                                                        <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: "monospace" }}>{(summary.recommendation_confidence * 100).toFixed(0)}% conf.</p>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: 8, height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${summary.recommendation_confidence * 100}%`, background: C.accent, borderRadius: 2, transition: "width 1s ease" }} />
                                                </div>
                                                <p style={{ fontSize: 10, color: C.muted, margin: "6px 0 0", fontFamily: "monospace" }}>Model: {summary.model_confidence}</p>
                                            </div>
                                        </div>

                                        {/* Baseline risk bars */}
                                        <div style={{ background: C.bg, padding: 14, border: `1px solid ${C.border}` }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 12px" }}>
                                                Baseline Risks (No Treatment) — 95% CI
                                            </p>
                                            {[
                                                { label: "30-day Mortality",     key: "mortality_30d",   color: C.red    },
                                                { label: "30-day Readmission",   key: "readmission_30d", color: C.yellow },
                                                { label: "Complication Risk",    key: "complication",    color: C.orange },
                                            ].map(({ label, key, color }) => {
                                                const val = summary.baseline_risks?.[key] || 0;
                                                const ci  = summary.baseline_risks_with_ci?.[key];
                                                return (
                                                    <div key={key} style={{ marginBottom: 10 }}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                                            <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                {ci && (
                                                                    <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
                                                                        [{(ci.lower_bound_95ci * 100).toFixed(0)}%–{(ci.upper_bound_95ci * 100).toFixed(0)}%]
                                                                    </span>
                                                                )}
                                                                <span style={{ fontSize: 14, fontWeight: 900, color, fontFamily: "monospace" }}>
                                                                    {(val * 100).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ height: 6, background: C.dim, borderRadius: 3, overflow: "hidden" }}>
                                                            <div style={{ height: "100%", width: `${Math.min(val * 100, 100)}%`, background: color, borderRadius: 3, transition: "width 1.2s ease" }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {/* ── 2. Treatment Scenarios ── */}
                                {scenarios.length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Treatment Scenarios ({scenarios.length})
                                            </p>
                                        </div>
                                        {scenarios.map((scen, idx) => {
                                            const isExpanded    = expandedScen === idx;
                                            const isRecommended = scen.option_id === recommendedId;
                                            const safetyFlag    = scen.safety_check?.safety_flag || "SAFE";
                                            const sColor        = safetyColor(safetyFlag);
                                            const preds         = scen.predictions || {};

                                            return (
                                                <div key={idx} style={{
                                                    borderBottom: `1px solid ${C.border}`,
                                                    borderLeft: isRecommended ? `3px solid ${C.accent}` : `3px solid transparent`,
                                                }}>
                                                    {/* Scenario header (clickable) */}
                                                    <div style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
                                                        onClick={() => setExpandedScen(isExpanded ? null : idx)}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                                                <span style={{
                                                                    width: 24, height: 24, background: isRecommended ? C.accent : C.surface,
                                                                    border: `1px solid ${isRecommended ? C.accent : C.border}`,
                                                                    color: isRecommended ? "#fff" : C.muted,
                                                                    fontSize: 12, fontWeight: 900,
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    borderRadius: 3, flexShrink: 0,
                                                                }}>
                                                                    {scen.option_id}
                                                                </span>
                                                                <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{scen.label}</p>
                                                                {isRecommended && (
                                                                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", background: `${C.accent}18`, color: C.accent, border: `1px solid ${C.accent}40`, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}40`, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                                                    {safetyFlag.replace(/_/g, " ")}
                                                                </span>
                                                            </div>

                                                            {/* 4 prediction mini stats */}
                                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                                                                {[
                                                                    { label: "7d Recovery",    val: preds.recovery_probability_7d,   color: C.green  },
                                                                    { label: "30d Mortality",  val: preds.mortality_risk_30d,         color: C.red    },
                                                                    { label: "30d Readmission",val: preds.readmission_risk_30d,       color: C.yellow },
                                                                    { label: "Complication",   val: preds.complication_risk,          color: C.orange },
                                                                ].map(({ label, val, color }) => (
                                                                    <div key={label}>
                                                                        <p style={{ fontSize: 9, color: C.muted, margin: "0 0 2px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
                                                                        <p style={{ fontSize: 14, fontWeight: 900, color, margin: 0, fontFamily: "monospace" }}>
                                                                            {val !== undefined ? `${(val * 100).toFixed(0)}%` : "–"}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Cost + recovery days */}
                                                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                                    <DollarSign size={11} color={C.muted} />
                                                                    <span style={{ fontSize: 11, color: C.muted }}>
                                                                        <strong style={{ color: C.text }}>${scen.estimated_cost_usd?.toLocaleString() ?? "N/A"}</strong>
                                                                        <span style={{ marginLeft: 4, fontSize: 10 }}>({scen.cost_source})</span>
                                                                    </span>
                                                                </div>
                                                                {preds.estimated_recovery_days && (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                                        <Clock size={11} color={C.muted} />
                                                                        <span style={{ fontSize: 11, color: C.muted }}>~<strong style={{ color: C.text }}>{preds.estimated_recovery_days}d</strong> recovery</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronDown size={15} color={C.muted} style={{ marginLeft: 10, flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                                                    </div>

                                                    {/* ── Expanded detail ── */}
                                                    {isExpanded && (
                                                        <div style={{ padding: "0 14px 16px", display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${C.border}` }}>

                                                            {/* Key Risks */}
                                                            {scen.key_risks?.length > 0 && (
                                                                <div style={{ padding: 12, background: `${C.red}06`, border: `1px solid ${C.red}20`, marginTop: 12 }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                                                        <AlertTriangle size={12} color={C.red} />
                                                                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: 0 }}>Key Risks</p>
                                                                    </div>
                                                                    {scen.key_risks.map((risk, i) => (
                                                                        <p key={i} style={{ fontSize: 11, color: C.text, margin: "0 0 4px", lineHeight: 1.55, paddingLeft: 10, borderLeft: `2px solid ${C.red}40` }}>{risk}</p>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Safety check */}
                                                            {scen.safety_check && (scen.safety_check.allergy_alerts?.length > 0 || scen.safety_check.interaction_alerts?.length > 0) && (
                                                                <div>
                                                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>
                                                                        Safety Check — {scen.safety_check.summary}
                                                                    </p>
                                                                    {scen.safety_check.allergy_alerts?.map((a, i) => (
                                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "7px 10px", background: `${C.red}10`, border: `1px solid ${C.red}30`, marginBottom: 4 }}>
                                                                            <Shield size={11} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                                                            <p style={{ fontSize: 11, color: C.text, margin: 0, lineHeight: 1.5 }}>{a.alert}</p>
                                                                        </div>
                                                                    ))}
                                                                    {scen.safety_check.interaction_alerts?.map((ia, i) => (
                                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "7px 10px", background: `${C.yellow}10`, border: `1px solid ${C.yellow}30`, marginBottom: 4 }}>
                                                                            <AlertTriangle size={11} color={C.yellow} style={{ flexShrink: 0, marginTop: 1 }} />
                                                                            <p style={{ fontSize: 11, color: C.text, margin: 0, lineHeight: 1.5 }}>
                                                                                DDI: {ia.warning}<br />
                                                                                <span style={{ color: C.muted }}>{ia.proposed_drug} ↔ {ia.existing_drug}</span>
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Guideline adherence */}
                                                            {scen.guideline_adherence && (
                                                                <div>
                                                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Guideline Adherence</p>
                                                                    {(Array.isArray(scen.guideline_adherence) ? scen.guideline_adherence : [scen.guideline_adherence]).filter(Boolean).map((g, i) => {
                                                                        const adColor = adherenceColor(g.adherence);
                                                                        return (
                                                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 8px", background: C.bg, border: `1px solid ${C.border}`, marginBottom: 4 }}>
                                                                                <CheckCircle2 size={11} color={adColor} style={{ flexShrink: 0, marginTop: 2 }} />
                                                                                <div>
                                                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                                                                        <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", background: `${adColor}18`, color: adColor, border: `1px solid ${adColor}40`, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                                                                            {g.adherence?.replace(/_/g, " ")}
                                                                                        </span>
                                                                                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{g.drug}</span>
                                                                                    </div>
                                                                                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{g.message}</p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* Temporal predictions */}
                                                            {scen.temporal_predictions && Object.keys(scen.temporal_predictions).length > 0 && (
                                                                <div>
                                                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>
                                                                        Clinical Improvement Probability Over Time
                                                                    </p>
                                                                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Object.keys(scen.temporal_predictions).length}, 1fr)`, gap: 8 }}>
                                                                        {Object.entries(scen.temporal_predictions).map(([tp, data]) => {
                                                                            const prob = data.clinical_improvement_probability;
                                                                            const pColor = prob >= 0.7 ? C.green : prob >= 0.4 ? C.yellow : C.red;
                                                                            return (
                                                                                <div key={tp} style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}`, textAlign: "center" }}>
                                                                                    <p style={{ fontSize: 9, fontWeight: 800, color: C.muted, margin: "0 0 4px", textTransform: "uppercase" }}>{tp}</p>
                                                                                    <p style={{ fontSize: 18, fontWeight: 900, color: pColor, margin: 0, fontFamily: "monospace" }}>
                                                                                        {prob !== undefined ? `${(prob * 100).toFixed(0)}%` : "–"}
                                                                                    </p>
                                                                                    <p style={{ fontSize: 9, color: C.muted, margin: "2px 0 0" }}>prob. improve</p>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Treatment failure guidance */}
                                                            {scen.treatment_failure_guidance && (
                                                                <div style={{ padding: 12, background: `${C.yellow}08`, border: `1px solid ${C.yellow}20` }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                                                                        <Clock size={11} color={C.yellow} />
                                                                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.yellow, margin: 0 }}>
                                                                            Failure Guidance — Decision: {scen.treatment_failure_guidance.critical_decision_point}
                                                                        </p>
                                                                    </div>
                                                                    <p style={{ fontSize: 11, color: C.text, margin: "0 0 6px" }}>{scen.treatment_failure_guidance.recommendation}</p>
                                                                    {scen.treatment_failure_guidance.escalation_options?.slice(0, 3).map((opt, i) => (
                                                                        <p key={i} style={{ fontSize: 11, color: C.muted, margin: "0 0 3px", paddingLeft: 10, lineHeight: 1.4 }}>• {opt}</p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* ── 3. What-if Narrative ── */}
                                {result.what_if_narrative && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                            <Activity size={13} color={C.accent} />
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                                Clinical What-if Narrative
                                            </p>
                                        </div>
                                        <div style={{ padding: "12px 14px", background: `${C.accent}05`, border: `1px solid ${C.accent}20`, borderRadius: 2 }}>
                                            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                                                {result.what_if_narrative}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ── 4. Feature Attribution ── */}
                                {attribution.length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <BarChart3 size={12} color={C.accent} />
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                    Feature Attribution — XGBoost Risk Drivers
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
                                            {attribution.map((feat, i) => {
                                                const isRisk = feat.direction === "increases_risk";
                                                const fColor = isRisk ? C.red : C.green;
                                                const pct    = (feat.importance_score || 0) * 100;
                                                return (
                                                    <div key={i}>
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                                {isRisk
                                                                    ? <TrendingUp   size={11} color={C.red}   />
                                                                    : <TrendingDown size={11} color={C.green} />}
                                                                <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{feat.feature}</span>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <span style={{ fontSize: 10, fontFamily: "monospace", color: fColor, fontWeight: 700 }}>{feat.contribution}</span>
                                                                <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{pct.toFixed(0)}%</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ height: 5, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                                                            <div style={{ height: "100%", width: `${pct}%`, background: fColor, borderRadius: 2, transition: "width 1.2s ease" }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── 5. Sensitivity Analysis ── */}
                                {sensitivity.filter(s => s.modifiable).length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Target size={12} color={C.accent} />
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                    Sensitivity Analysis — Modifiable Risk Factors
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                                        {["Feature", "Baseline", "↑ 20% Mortality Δ", "↓ 20% Mortality Δ", "Intervention"].map(h => (
                                                            <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sensitivity.filter(s => s.modifiable).map((s, i) => {
                                                        const improved = s.risk_impact_if_improved_20_percent?.mortality_30d_change || 0;
                                                        const worsened = s.risk_impact_if_worsened_20_percent?.mortality_30d_change || 0;
                                                        return (
                                                            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                                                                <td style={{ padding: "8px 10px", fontWeight: 700, color: C.text }}>{s.feature_name}</td>
                                                                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: C.muted }}>{s.baseline_value}</td>
                                                                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: improved < 0 ? C.green : improved > 0 ? C.red : C.muted, fontWeight: 700 }}>
                                                                    {improved !== 0 ? `${improved > 0 ? "+" : ""}${improved.toFixed(1)}%` : "~0%"}
                                                                </td>
                                                                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: worsened > 0 ? C.red : C.muted, fontWeight: 700 }}>
                                                                    {worsened !== 0 ? `+${worsened.toFixed(1)}%` : "~0%"}
                                                                </td>
                                                                <td style={{ padding: "8px 10px", color: C.muted, fontSize: 10 }}>{s.clinical_intervention || "–"}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ── 6. Cost-Effectiveness ── */}
                                {costEff?.scenarios && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <DollarSign size={12} color={C.accent} />
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                    Cost-Effectiveness — WTP: ${costEff.threshold_used_usd_per_qaly?.toLocaleString()}/QALY
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                                        {["Option", "Cost (USD)", "QALYs", "Cost / QALY", "Verdict"].map(h => (
                                                            <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {costEff.scenarios.map((s, i) => {
                                                        const isBest    = s.option_id === costEff.most_cost_effective;
                                                        const vColor    = s.cost_effective === true ? C.green : s.cost_effective === "CONTRAINDICATED" ? C.red : C.muted;
                                                        const vLabel    = s.cost_effective === true ? "Cost-Effective" : String(s.cost_effective).replace(/_/g, " ");
                                                        return (
                                                            <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: isBest ? `${C.accent}06` : "transparent" }}>
                                                                <td style={{ padding: "8px 10px" }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                                        <span style={{ width: 20, height: 20, background: isBest ? C.accent : C.surface, border: `1px solid ${isBest ? C.accent : C.border}`, color: isBest ? "#fff" : C.muted, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>
                                                                            {s.option_id}
                                                                        </span>
                                                                        <span style={{ fontSize: 10, color: C.muted, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                            {s.label?.split(" ").slice(0, 2).join(" ")}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: C.text }}>${s.estimated_cost_usd?.toLocaleString()}</td>
                                                                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: C.text }}>{s.estimated_qalys?.toFixed(1)}</td>
                                                                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: C.text }}>{s.cost_per_qaly != null ? `$${s.cost_per_qaly.toFixed(0)}` : "–"}</td>
                                                                <td style={{ padding: "8px 10px" }}>
                                                                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", background: `${vColor}18`, color: vColor, border: `1px solid ${vColor}40`, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                                                        {vLabel}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        {costEff.interpretation && (
                                            <p style={{ fontSize: 11, color: C.muted, margin: 0, padding: "10px 12px", lineHeight: 1.6, fontStyle: "italic", borderTop: `1px solid ${C.border}` }}>
                                                {costEff.interpretation}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* ── 7. Provenance ── */}
                                {result.provenance && (
                                    <div style={{ background: C.bg, padding: 12, border: `1px solid ${C.border}` }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 10px" }}>
                                            Provenance
                                        </p>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                                            {[
                                                { label: "Model Version", value: result.provenance.model_version },
                                                { label: "Confidence",    value: result.provenance.overall_confidence },
                                                { label: "Features",      value: result.provenance.feature_count },
                                                { label: "Sim ID",        value: result.provenance.simulation_id?.slice(0, 10) + "…" },
                                                { label: "LLM Tokens",    value: result.provenance.llm_tokens_generated ?? "–" },
                                                { label: "Elapsed",       value: result.provenance.elapsed_ms ? `${result.provenance.elapsed_ms}ms` : "–" },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <p style={{ fontSize: 9, color: C.muted, margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
                                                    <p style={{ fontSize: 11, fontFamily: "monospace", color: C.text, margin: 0, fontWeight: 600 }}>{value ?? "–"}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        {/* Empty state */}
                        {!isStreaming && streamEvents.length === 0 && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <GitBranch size={40} color={C.dim} style={{ margin: "0 auto 12px" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                                    Ready to simulate. Fill in patient data, diagnosis, and treatment options — then click "Run Simulation".
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
