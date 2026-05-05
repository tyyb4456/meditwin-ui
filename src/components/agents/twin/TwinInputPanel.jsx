import { useState } from "react";
import { FileJson, FormInput, Play, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

// ── Color tokens ──────────────────────────────────────────────────────────────
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-subtle)";
const RED     = "#EF4444";
const BLUE    = "#3B82F6";

const inputStyle = {
    width: "100%", background: BG, border: `1px solid ${BORDER}`,
    color: TEXT, padding: "8px 10px", fontSize: 13, outline: "none",
    fontFamily: "'Space Grotesk', system-ui, sans-serif", borderRadius: 8,
};
const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: MUTED, marginBottom: 6,
};
function Field({ label, children }) {
    return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

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
            { drug: "Warfarin 5mg",    dose: "5mg",   frequency: "OD",  status: "active" },
            { drug: "Metformin 850mg", dose: "850mg", frequency: "BID", status: "active" },
        ],
        allergies: [{ substance: "Penicillin", reaction: "Anaphylaxis", severity: "severe" }],
        lab_results: [
            { loinc: "26464-8", display: "WBC",        value: 18.4,  unit: "10*3/uL", flag: "CRITICAL" },
            { loinc: "1988-5",  display: "CRP",        value: 142.0, unit: "mg/L",    flag: "HIGH"     },
            { loinc: "2160-0",  display: "Creatinine", value: 1.1,   unit: "mg/dL",   flag: "NORMAL"   },
        ],
        diagnostic_reports: [], recent_encounters: [],
        state_timestamp: "2025-04-01T10:30:00Z", imaging_available: true,
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
    const [diagnosis,      setDiagnosis]      = useState("Community-acquired pneumonia (J18.9)");
    const [options,        setOptions]        = useState([
        { label: "Azithromycin outpatient",                         drugs: "Azithromycin 500mg",                         interventions: "O2 supplementation" },
        { label: "Ceftriaxone IV + Azithromycin (hospitalization)", drugs: "Ceftriaxone 1g IV\nAzithromycin 500mg",      interventions: "Hospitalization\nIV fluids\nContinuous monitoring" },
    ]);
    const [horizons,       setHorizons]       = useState(["7d", "30d", "90d"]);
    const [prioritizeCost, setPrioritizeCost] = useState(false);
    const [avoidHosp,      setAvoidHosp]      = useState(false);

    const addLabRow    = () => setLabRows(p => [...p, { loinc: "", display: "", value: "", unit: "", flag: "NORMAL" }]);
    const removeLabRow = (i) => setLabRows(p => p.filter((_, idx) => idx !== i));
    const updateLabRow = (i, k, v) => setLabRows(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });

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

    const rowBtnStyle = {
        background: "none", border: "none", cursor: "pointer",
        color: MUTED, padding: 4, display: "flex", alignItems: "center", transition: "color 0.2s",
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

            {/* Lab results */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Lab Results</label>
                    <button type="button" onClick={addLabRow} style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: "none", border: `1px solid ${BLUE}`, color: BLUE,
                        borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
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
                            <button type="button" onClick={() => removeLabRow(i)} style={rowBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = RED}
                                onMouseLeave={e => e.currentTarget.style.color = MUTED}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Diagnosis */}
            <div style={{ padding: 12, background: `${BLUE}08`, border: `1px solid ${BLUE}30`, borderRadius: 8 }}>
                <p style={{ ...labelStyle, color: BLUE, margin: "0 0 8px" }}>Diagnosis * (required by Digital Twin)</p>
                <input style={inputStyle} value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                    placeholder="Community-acquired pneumonia (J18.9)" required />
            </div>

            {/* Treatment options */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Treatment Options to Simulate</label>
                    {options.length < 5 && (
                        <button type="button" onClick={addOption} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "none", border: `1px solid ${BLUE}`, color: BLUE,
                            borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                        }}>
                            <Plus size={10} /> Add Option
                        </button>
                    )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {options.map((opt, i) => (
                        <div key={i} style={{ padding: 12, border: `1px solid ${BORDER}`, background: BG, borderRadius: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 900, color: BLUE,
                                    background: `${BLUE}12`, padding: "2px 8px",
                                    border: `1px solid ${BLUE}30`, borderRadius: 6,
                                }}>
                                    Option {String.fromCharCode(65 + i)}
                                </span>
                                {options.length > 1 && (
                                    <button type="button" onClick={() => removeOption(i)} style={rowBtnStyle}
                                        onMouseEnter={e => e.currentTarget.style.color = RED}
                                        onMouseLeave={e => e.currentTarget.style.color = MUTED}>
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

            {/* Prediction horizons */}
            <div>
                <label style={labelStyle}>Prediction Horizons</label>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {["7d", "30d", "90d", "1yr"].map(h => (
                        <label key={h} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: TEXT }}>
                            <input type="checkbox" checked={horizons.includes(h)} onChange={() => toggleHorizon(h)}
                                style={{ accentColor: BLUE }} />
                            {h}
                        </label>
                    ))}
                </div>
            </div>

            {/* Patient preferences */}
            <div style={{ padding: 12, background: `${BLUE}06`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 10 }}>Patient Preferences</label>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: TEXT }}>
                        <input type="checkbox" checked={prioritizeCost} onChange={e => setPrioritizeCost(e.target.checked)}
                            style={{ accentColor: BLUE }} />
                        Prioritize lower cost
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: TEXT }}>
                        <input type="checkbox" checked={avoidHosp} onChange={e => setAvoidHosp(e.target.checked)}
                            style={{ accentColor: BLUE }} />
                        Avoid hospitalization
                    </label>
                </div>
            </div>

            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? BORDER : BLUE,
                border: "none", color: isStreaming ? MUTED : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                borderRadius: 9, transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 16px ${BLUE}40`,
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Simulation</>}
            </button>
        </form>
    );
}

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
                <div style={{ padding: "10px 14px", background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                </div>
            )}
            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? BORDER : BLUE,
                border: "none", color: isStreaming ? MUTED : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                borderRadius: 9, transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 16px ${BLUE}40`,
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={15} /> Run Simulation</>}
            </button>
        </form>
    );
}

export default function TwinInputPanel({ inputMode, setInputMode, onSubmit, isStreaming }) {
    return (
        <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
            position: "sticky", top: 72,
            maxHeight: "calc(100vh - 88px)", overflowY: "auto",
        }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
                {[
                    { id: "form", icon: FormInput, label: "Form Input" },
                    { id: "json", icon: FileJson,  label: "Raw JSON"   },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setInputMode(tab.id)} style={{
                        flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        background:   inputMode === tab.id ? `${BLUE}15` : "transparent",
                        color:        inputMode === tab.id ? BLUE : MUTED,
                        borderBottom: inputMode === tab.id ? `2px solid ${BLUE}` : "2px solid transparent",
                        transition: "all 0.2s",
                    }}>
                        <tab.icon size={13} /> {tab.label}
                    </button>
                ))}
            </div>
            <div style={{ padding: 20 }}>
                {inputMode === "form"
                    ? <FormInputMode onSubmit={onSubmit} isStreaming={isStreaming} />
                    : <JsonInputMode onSubmit={onSubmit} isStreaming={isStreaming} />
                }
            </div>
        </div>
    );
}
