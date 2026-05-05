import { useState, useRef, useCallback } from "react";
import { FileJson, Image, ScanLine, AlertCircle, Loader2, CheckCircle2, Upload } from "lucide-react";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    accent: "#10b981", text: "var(--color-text)", muted: "var(--color-text-subtle)",
    dim: "var(--color-border)", red: "#EF4444", emerald: "#10b981",
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
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file (JPEG, PNG, etc.)");
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    }, []);

    const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!imageFile) { alert("Please upload a chest X-ray image."); return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl    = ev.target.result;
            const base64     = dataUrl.split(",")[1];
            const contentType = imageFile.type || "image/jpeg";

            onSubmit({
                patient_id: patientId,
                image_data: { format: "base64", content_type: contentType, data: base64 },
                patient_context: {
                    age: parseInt(age) || 40,
                    gender,
                    chief_complaint:   chiefComplaint,
                    current_diagnosis: currentDx,
                },
                patient_state: {
                    patient_id:          patientId,
                    demographics:        { age: parseInt(age) || 40, gender },
                    active_conditions:   [],
                    medications:         [],
                    allergies:           [],
                    lab_results:         [],
                    diagnostic_reports:  [],
                    recent_encounters:   [],
                    state_timestamp:     new Date().toISOString(),
                    imaging_available:   true,
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
                    <select style={inputStyle} value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </Field>
                <Field label="Chief Complaint">
                    <input style={inputStyle} value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)}
                        placeholder="e.g. fever and cough" />
                </Field>
            </div>

            <Field label="Working / Current Diagnosis (optional)">
                <input style={inputStyle} value={currentDx} onChange={e => setCurrentDx(e.target.value)}
                    placeholder="e.g. Community-acquired pneumonia" />
            </Field>

            <div>
                <label style={labelStyle}>Chest X-Ray Image *</label>
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${isDragging ? C.emerald : imageFile ? C.emerald : C.border}`,
                        background: isDragging ? `${C.emerald}08` : imageFile ? `${C.emerald}05` : C.bg,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        minHeight: imagePreview ? "auto" : 140,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {imagePreview ? (
                        <div style={{ width: "100%", position: "relative" }}>
                            <img
                                src={imagePreview}
                                alt="X-ray preview"
                                style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block", filter: "brightness(0.95)" }}
                            />
                            <div style={{
                                position: "absolute", top: 8, right: 8,
                                background: `${C.emerald}CC`, padding: "4px 8px",
                                display: "flex", alignItems: "center", gap: 4,
                            }}>
                                <CheckCircle2 size={11} color="#fff" />
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.1em" }}>
                                    {imageFile?.name}
                                </span>
                            </div>
                            <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0,
                                padding: "6px 10px",
                                background: "rgba(0,0,0,0.5)",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            }}>
                                <Image size={11} color="#aaa" />
                                <span style={{ fontSize: 10, color: "#aaa" }}>Click to replace image</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                width: 44, height: 44,
                                background: `${C.emerald}15`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                borderRadius: 4,
                            }}>
                                <Upload size={20} color={C.emerald} strokeWidth={1.5} />
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0, textAlign: "center" }}>
                                Drop chest X-ray here or click to upload
                            </p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0, textAlign: "center" }}>
                                JPEG, PNG, DICOM-derived — EfficientNetB0 CNN analyzes in real-time
                            </p>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={e => processFile(e.target.files[0])}
                    />
                </div>
            </div>

            <button type="submit" disabled={isStreaming || !imageFile} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming || !imageFile ? C.dim : C.emerald,
                border: "none", color: isStreaming || !imageFile ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming || !imageFile ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><ScanLine size={15} /> Run Imaging Triage</>}
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
                <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={14} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                </div>
            )}
            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? C.dim : C.emerald,
                border: "none", color: isStreaming ? C.muted : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Streaming...</>
                    : <><ScanLine size={15} /> Run Imaging Triage</>}
            </button>
        </form>
    );
}

export default function ImagingInputPanel({ inputMode, setInputMode, onSubmit, isStreaming }) {
    return (
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                {[
                    { id: "image", icon: Image,    label: "Upload Image" },
                    { id: "json",  icon: FileJson,  label: "Raw JSON" },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setInputMode(tab.id)}
                        style={{
                            flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            background: inputMode === tab.id ? C.emerald : "transparent",
                            color:      inputMode === tab.id ? "#fff"    : C.muted,
                            borderBottom: inputMode === tab.id ? `2px solid ${C.emerald}` : "2px solid transparent",
                            transition: "all 0.2s",
                        }}
                    >
                        <tab.icon size={13} /> {tab.label}
                    </button>
                ))}
            </div>
            <div style={{ padding: 20 }}>
                {inputMode === "image"
                    ? <ImageUploadMode onSubmit={onSubmit} isStreaming={isStreaming} />
                    : <JsonInputMode   onSubmit={onSubmit} isStreaming={isStreaming} />}
            </div>
        </div>
    );
}
