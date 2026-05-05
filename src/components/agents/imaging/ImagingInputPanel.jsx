import { useState, useRef, useCallback } from "react";
import { FileJson, Image, ScanLine, AlertCircle, Loader2, CheckCircle2, Upload } from "lucide-react";

const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const RED     = "#EF4444";
const EMERALD = "#10B981";

const inputStyle = {
    width: "100%", background: BG, border: `1px solid ${BORDER}`,
    color: TEXT, padding: "9px 12px", fontSize: 13, outline: "none",
    fontFamily: "inherit", borderRadius: 8, transition: "border-color 0.2s",
};
const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: SUBTLE, marginBottom: 6,
};
function Field({ label, children }) {
    return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

const EXAMPLE_JSON = {
    patient_id: "patient-x-ray-001",
    image_data: {
        format: "base64",
        content_type: "image/jpeg",
        data: "<base64_encoded_image_data>",
    },
    patient_context: {
        age: 40,
        gender: "male",
        chief_complaint: "fever and cough",
        current_diagnosis: "Community-acquired pneumonia",
    },
    patient_state: {
        patient_id: "patient-x-ray-001",
        demographics: { age: 40, gender: "male" },
        active_conditions: [],
        medications: [],
        allergies: [],
        lab_results: [],
        diagnostic_reports: [],
        recent_encounters: [],
        state_timestamp: new Date().toISOString(),
        imaging_available: true,
    },
};

function ImageUploadMode({ onSubmit, isStreaming }) {
    const [patientId,      setPatientId]      = useState("patient-x-ray-001");
    const [age,            setAge]            = useState("40");
    const [gender,         setGender]         = useState("male");
    const [chiefComplaint, setChiefComplaint] = useState("fever and cough");
    const [currentDx,      setCurrentDx]      = useState("Community-acquired pneumonia");
    const [imageFile,      setImageFile]      = useState(null);
    const [imagePreview,   setImagePreview]   = useState(null);
    const [isDragging,     setIsDragging]     = useState(false);
    const fileInputRef = useRef(null);

    const processFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) { alert("Please upload an image file (JPEG, PNG, etc.)"); return; }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        processFile(e.dataTransfer.files[0]);
    }, []);

    const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!imageFile) { alert("Please upload a chest X-ray image."); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result.split(",")[1];
            onSubmit({
                patient_id: patientId,
                image_data: { format: "base64", content_type: imageFile.type || "image/jpeg", data: base64 },
                patient_context: {
                    age: parseInt(age) || 40, gender,
                    chief_complaint: chiefComplaint,
                    current_diagnosis: currentDx,
                },
                patient_state: {
                    patient_id: patientId,
                    demographics: { age: parseInt(age) || 40, gender },
                    active_conditions: [], medications: [], allergies: [],
                    lab_results: [], diagnostic_reports: [], recent_encounters: [],
                    state_timestamp: new Date().toISOString(),
                    imaging_available: true,
                },
            });
        };
        reader.readAsDataURL(imageFile);
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Gender">
                    <select style={{ ...inputStyle, appearance: "none" }} value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </Field>
                <Field label="Chief Complaint">
                    <input style={inputStyle} value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="e.g. fever and cough" />
                </Field>
            </div>

            <Field label="Working / Current Diagnosis (optional)">
                <input style={inputStyle} value={currentDx} onChange={e => setCurrentDx(e.target.value)} placeholder="e.g. Community-acquired pneumonia" />
            </Field>

            {/* Drop zone */}
            <div>
                <label style={labelStyle}>Chest X-Ray Image *</label>
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${isDragging ? EMERALD : imageFile ? EMERALD : BORDER}`,
                        background: isDragging ? `${EMERALD}08` : imageFile ? `${EMERALD}05` : BG,
                        cursor: "pointer", transition: "all 0.2s", borderRadius: 10,
                        minHeight: imagePreview ? "auto" : 140,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 8, position: "relative", overflow: "hidden",
                    }}
                >
                    {imagePreview ? (
                        <div style={{ width: "100%", position: "relative" }}>
                            <img
                                src={imagePreview}
                                alt="X-ray preview"
                                style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block", filter: "brightness(0.95)" }}
                            />
                            <div style={{ position: "absolute", top: 8, right: 8, background: `${EMERALD}CC`, padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                <CheckCircle2 size={11} color="#fff" />
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.1em" }}>{imageFile?.name}</span>
                            </div>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <Image size={11} color="#aaa" />
                                <span style={{ fontSize: 10, color: "#aaa" }}>Click to replace image</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: 48, height: 48, background: `${EMERALD}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Upload size={22} color={EMERALD} strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0, textAlign: "center" }}>
                                Drop chest X-ray here or click to upload
                            </p>
                            <p style={{ fontSize: 11, color: MUTED, margin: 0, textAlign: "center" }}>
                                JPEG, PNG, DICOM-derived — EfficientNetB0 CNN analyzes in real-time
                            </p>
                        </>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => processFile(e.target.files[0])} />
                </div>
            </div>

            <button type="submit" disabled={isStreaming || !imageFile} style={{
                width: "100%", padding: "12px 0",
                background: isStreaming || !imageFile ? "var(--color-surface-2)" : EMERALD,
                border: "none", color: "#fff", borderRadius: 8,
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming || !imageFile ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
                boxShadow: isStreaming || !imageFile ? "none" : `0 4px 14px ${EMERALD}35`,
            }}>
                {isStreaming
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><ScanLine size={14} /> Run Imaging Triage</>}
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
            if (!parsed.image_data?.data) throw new Error("Missing required field: image_data.data (base64 image)");
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
                    rows={26} spellCheck={false}
                />
            </div>
            {error && (
                <div style={{ padding: "10px 14px", background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                </div>
            )}
            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "12px 0",
                background: isStreaming ? "var(--color-surface-2)" : EMERALD,
                border: "none", color: "#fff", borderRadius: 8,
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 14px ${EMERALD}35`,
            }}>
                {isStreaming
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><ScanLine size={14} /> Run Imaging Triage</>}
            </button>
        </form>
    );
}

export default function ImagingInputPanel({ inputMode, setInputMode, onSubmit, isStreaming }) {
    return (
        <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 12, overflow: "hidden", position: "sticky", top: 72,
        }}>
            {/* Mode tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
                {[
                    { id: "image", icon: Image,   label: "Upload Image" },
                    { id: "json",  icon: FileJson, label: "Raw JSON" },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setInputMode(tab.id)}
                        style={{
                            flex: 1, padding: "13px 0", border: "none", cursor: "pointer",
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                            background: inputMode === tab.id ? `${EMERALD}15` : "transparent",
                            color:      inputMode === tab.id ? EMERALD : SUBTLE,
                            borderBottom: inputMode === tab.id ? `2px solid ${EMERALD}` : "2px solid transparent",
                            transition: "all 0.2s",
                        }}
                    >
                        <tab.icon size={13} /> {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: 20, maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                {inputMode === "image"
                    ? <ImageUploadMode onSubmit={onSubmit} isStreaming={isStreaming} />
                    : <JsonInputMode   onSubmit={onSubmit} isStreaming={isStreaming} />}
            </div>
        </div>
    );
}
