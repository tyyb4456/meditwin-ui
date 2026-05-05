import { useState } from "react";
import { FileJson, FormInput, Play, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    accent: "#f59e0b", text: "var(--color-text)", muted: "var(--color-text-subtle)",
    dim: "var(--color-border)", red: "#EF4444", amber: "#f59e0b",
};

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
    return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

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
        allergies: [{ substance: "Penicillin", reaction: "Anaphylaxis", severity: "high" }],
        lab_results: [
            {
                loinc: "26464-8", display: "White Blood Cell Count",
                value: 18.4, unit: "10*3/uL",
                reference_high: 11.0, reference_low: 4.5, flag: "CRITICAL"
            }
        ],
        diagnostic_reports: [], recent_encounters: [],
        state_timestamp: "2025-04-01T10:30:00Z", imaging_available: false
    },
    enrich_with_llm: true,
};

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
    const [allergies,   setAllergies]   = useState([
        { substance: "Penicillin", reaction: "Anaphylaxis", severity: "severe" }
    ]);
    const [conditions,  setConditions]  = useState([
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

            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Proposed Medications</label>
                    <button type="button" onClick={addProposed} style={addBtnStyle}><Plus size={10} /> Add</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {proposedMeds.map((med, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                            <input style={inputStyle} placeholder="e.g. Amoxicillin 500mg"
                                value={med.value} onChange={e => updateProposed(i, e.target.value)} />
                            <button type="button" onClick={() => removeProposed(i)} style={rowBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = C.red}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={labelStyle}>Current Medications (patient's existing regimen)</label>
                    <button type="button" onClick={addCurrent} style={addBtnStyle}><Plus size={10} /> Add</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {currentMeds.map((med, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                            <input style={inputStyle} placeholder="e.g. Warfarin 5mg"
                                value={med.value} onChange={e => updateCurrent(i, e.target.value)} />
                            <button type="button" onClick={() => removeCurrent(i)} style={rowBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = C.red}
                                onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

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

export default function DrugInputPanel({ inputMode, setInputMode, onSubmit, isStreaming }) {
    return (
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
                    ? <FormInputMode onSubmit={onSubmit} isStreaming={isStreaming} />
                    : <JsonInputMode onSubmit={onSubmit} isStreaming={isStreaming} />}
            </div>
        </div>
    );
}
