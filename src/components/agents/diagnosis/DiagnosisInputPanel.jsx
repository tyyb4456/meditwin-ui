import { useState } from "react";
import { FileJson, FormInput, Play, Loader2, AlertCircle } from "lucide-react";

const ACCENT  = "var(--color-accent)";
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const SURFACE2 = "var(--color-surface-2)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const RED     = "#EF4444";
const PURPLE  = "#8B5CF6";

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
                <input style={{ ...inputStyle, borderColor: `${PURPLE}50` }} value={formData.chiefComplaint} onChange={set("chiefComplaint")} placeholder="e.g., fever and weakness" required />
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
                width: "100%", padding: "12px 0", background: isStreaming ? SURFACE2 : PURPLE,
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 14px ${PURPLE}35`,
            }}>
                {isStreaming
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={14} /> Run Diagnosis</>}
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
                width: "100%", padding: "12px 0", background: isStreaming ? SURFACE2 : PURPLE,
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 14px ${PURPLE}35`,
            }}>
                {isStreaming
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><Play size={14} /> Run Diagnosis</>}
            </button>
        </form>
    );
}

export default function DiagnosisInputPanel({ inputMode, setInputMode, isStreaming, onSubmit }) {
    return (
        <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
            overflow: "hidden", position: "sticky", top: 72,
        }}>
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
                    ? <FormInputMode onSubmit={onSubmit} isStreaming={isStreaming} />
                    : <JsonInputMode onSubmit={onSubmit} isStreaming={isStreaming} />}
            </div>
        </div>
    );
}
