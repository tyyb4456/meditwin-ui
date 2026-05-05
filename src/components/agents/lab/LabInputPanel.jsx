import { useState } from "react";
import { FileJson, FormInput, Play, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    accent: "#06B6D4", text: "var(--color-text)", muted: "var(--color-text-subtle)",
    dim: "var(--color-border)", red: "#EF4444", cyan: "#06B6D4",
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

const EXAMPLE_LAB_ROWS = [
    { loinc: "26464-8", value: "14.5", label: "WBC" },
    { loinc: "1988-5",  value: "120",  label: "CRP" },
    { loinc: "770-8",   value: "82",   label: "Neutrophil %" },
    { loinc: "2345-7",  value: "160",  label: "Glucose" },
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Patient ID">
                    <input style={inputStyle} value={patientId} onChange={e => setPatientId(e.target.value)} required />
                </Field>
                <Field label="Age">
                    <input type="number" style={inputStyle} value={age} onChange={e => setAge(e.target.value)} required />
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

export default function LabInputPanel({ inputMode, setInputMode, onSubmit, isStreaming }) {
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
                    ? <FormInputMode onSubmit={onSubmit} isStreaming={isStreaming} />
                    : <JsonInputMode onSubmit={onSubmit} isStreaming={isStreaming} />}
            </div>
        </div>
    );
}
