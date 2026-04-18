import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Eye, FileJson, Image, Play, X,
    CheckCircle2, AlertCircle, Loader2, ChevronDown,
    AlertTriangle, ArrowLeft, ChevronRight,
    Wifi, Copy, Check, Upload, ScanLine, Activity,
    Stethoscope, Target, FileWarning, Zap
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

// ── CSS variable colour tokens (theme-aware) ─────────────────────────────────
const C = {
    bg:      "var(--color-bg)",
    surface: "var(--color-surface)",
    border:  "var(--color-border)",
    accent:  "#10b981",          // emerald — imaging triage agent colour
    text:    "var(--color-text)",
    muted:   "var(--color-text-subtle)",
    dim:     "var(--color-border)",
    green:   "#22C55E",
    yellow:  "#EAB308",
    red:     "#EF4444",
    cyan:    "#06B6D4",
    orange:  "#F97316",
    purple:  "#8b5cf6",
    emerald: "#10b981",
    blue:    "#60A5FA",
};

// ── Example JSON payload ───────────────────────────────────────────────────────
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
const triageColor = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "IMMEDIATE")   return C.red;
    if (l === "URGENT")      return C.orange;
    if (l === "SEMI-URGENT") return C.yellow;
    if (l === "NON-URGENT")  return C.green;
    return C.muted;
};

const gradeColor = (grade) => {
    const g = (grade || "").toUpperCase();
    if (g === "SEVERE")   return C.red;
    if (g === "MODERATE") return C.yellow;
    if (g === "MILD")     return C.green;
    return C.muted;
};

const predictionColor = (pred) => {
    if ((pred || "").toUpperCase() === "PNEUMONIA") return C.red;
    if ((pred || "").toUpperCase() === "NORMAL")    return C.green;
    return C.muted;
};

// ── Image Upload input mode ───────────────────────────────────────────────────
function ImageUploadMode({ onSubmit, isStreaming }) {
    const [patientId,       setPatientId]       = useState("patient-x-ray-001");
    const [age,             setAge]             = useState("40");
    const [gender,          setGender]          = useState("male");
    const [chiefComplaint,  setChiefComplaint]  = useState("fever and cough");
    const [currentDx,       setCurrentDx]       = useState("Community-acquired pneumonia");
    const [imageFile,       setImageFile]       = useState(null);
    const [imagePreview,    setImagePreview]    = useState(null);
    const [isDragging,      setIsDragging]      = useState(false);
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

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!imageFile) { alert("Please upload a chest X-ray image."); return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            // strip the "data:image/jpeg;base64," prefix
            const base64 = dataUrl.split(",")[1];
            const contentType = imageFile.type || "image/jpeg";

            onSubmit({
                patient_id: patientId,
                image_data: { format: "base64", content_type: contentType, data: base64 },
                patient_context: {
                    age: parseInt(age) || 40,
                    gender,
                    chief_complaint: chiefComplaint,
                    current_diagnosis: currentDx,
                },
                patient_state: {
                    patient_id: patientId,
                    demographics: { age: parseInt(age) || 40, gender },
                    active_conditions: [],
                    medications: [],
                    allergies: [],
                    lab_results: [],
                    diagnostic_reports: [],
                    recent_encounters: [],
                    state_timestamp: new Date().toISOString(),
                    imaging_available: true,
                },
            });
        };
        reader.readAsDataURL(imageFile);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Patient basics */}
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

            {/* Image Upload Drop Zone */}
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

// ── JSON input mode ───────────────────────────────────────────────────────────
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

// ── Main page component ───────────────────────────────────────────────────────
export default function ImagingTriageAgent() {
    const navigate = useNavigate();

    const [inputMode,       setInputMode]       = useState("image");
    const [isStreaming,     setIsStreaming]      = useState(false);
    const [streamEvents,    setStreamEvents]    = useState([]);
    const [finalResult,     setFinalResult]     = useState(null);
    const [currentStep,     setCurrentStep]     = useState(null);
    const [error,           setError]           = useState(null);
    const [liveText,        setLiveText]        = useState("");
    const [partialResult,   setPartialResult]   = useState(null);
    const [copied,          setCopied]          = useState(false);
    const [expandedAction,  setExpandedAction]  = useState(null);

    const abortControllerRef = useRef(null);
    const eventsEndRef       = useRef(null);

    // Auto-scroll event log while streaming
    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setFinalResult(null); setPartialResult(null);
        setCurrentStep(null); setError(null); setLiveText(""); setCopied(false);
        setExpandedAction(null);
    };

    // ── Incremental partial parsing during token stream ─────────────────────
    useEffect(() => {
        if (!isStreaming || !liveText || finalResult) return;
        try {
            const partial = {};

            // prediction
            const predMatch  = liveText.match(/"prediction"\s*:\s*"([^"]+)"/);
            const confMatch  = liveText.match(/"confidence"\s*:\s*([\d.]+)/);
            const pneuMatch  = liveText.match(/"pneumonia_probability"\s*:\s*([\d.]+)/);
            if (predMatch) {
                partial.model_output = {
                    prediction:             predMatch[1],
                    confidence:             confMatch  ? parseFloat(confMatch[1]) : 0,
                    pneumonia_probability:  pneuMatch  ? parseFloat(pneuMatch[1]) : 0,
                    normal_probability:     pneuMatch  ? 1 - parseFloat(pneuMatch[1]) : 1,
                };
            }

            // severity
            const gradeMatch    = liveText.match(/"grade"\s*:\s*"([^"]+)"/);
            const labelMatch    = liveText.match(/"triage_label"\s*:\s*"([^"]+)"/);
            const priorityMatch = liveText.match(/"triage_priority"\s*:\s*(\d+)/);
            if (gradeMatch || labelMatch) {
                partial.severity_assessment = {
                    grade:           gradeMatch    ? gradeMatch[1]              : "…",
                    triage_label:    labelMatch    ? labelMatch[1]              : "…",
                    triage_priority: priorityMatch ? parseInt(priorityMatch[1]) : 4,
                };
            }

            // imaging_findings
            const patternMatch = liveText.match(/"pattern"\s*:\s*"([^"]+)"/);
            if (patternMatch) {
                partial.imaging_findings = { pattern: patternMatch[1] };
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
    const runImagingTriage = async (payload) => {
        handleReset();
        setIsStreaming(true);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch("http://127.0.0.1:8005/stream", {
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

    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,     "#FEE2E2"],
            complete: [C.green,   "#DCFCE7"],
            status:   [C.emerald, "#D1FAE5"],
            progress: [C.yellow,  "#FEF9C3"],
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
                @keyframes scanLine {
                    0%   { transform: translateY(0); opacity: 0.7; }
                    100% { transform: translateY(100%); opacity: 0; }
                }
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
                        <div style={{ width: 26, height: 26, background: C.emerald, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 4 }}>
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
                                Imaging Triage Agent
                            </span>
                        </span>
                    </div>
                </div>

                {/* Right — port + type + theme toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11 }}>
                        <Wifi size={11} color={C.emerald} />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8005</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${C.border}`, color: C.emerald }}>
                        A2A
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* ── Page Header ────────────────────────────────────────────────── */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.emerald}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                            <Eye size={18} color={C.emerald} strokeWidth={1.75} />
                            {/* scan animation */}
                            {isStreaming && (
                                <div style={{
                                    position: "absolute", top: 0, left: 0, right: 0,
                                    height: 2, background: C.emerald,
                                    animation: "scanLine 1.5s linear infinite",
                                    opacity: 0.8,
                                }} />
                            )}
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Agent 05</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>
                                Imaging Triage Agent
                            </h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 660 }}>
                        EfficientNetB0 CNN trained on chest X-rays (AUC 0.981 · Precision 0.976 · Recall 0.939). Upload an image and receive real-time triage priority, severity grade, FHIR DiagnosticReport, and LLM clinical interpretation via streaming SSE.
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
                            { id: "image", icon: Image,    label: "Upload Image" },
                            { id: "json",  icon: FileJson, label: "Raw JSON" },
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
                            ? <ImageUploadMode onSubmit={runImagingTriage} isStreaming={isStreaming} />
                            : <JsonInputMode   onSubmit={runImagingTriage} isStreaming={isStreaming} />}
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
                            <div style={{ padding: "10px 14px", background: C.emerald, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
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
                            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.emerald} 6%, ${C.surface})` }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted }}>
                                    Raw SSE Events ({streamEvents.length})
                                </span>
                            </div>
                            <div style={{ padding: "8px 12px", maxHeight: 160, overflowY: "auto", fontFamily: "monospace", fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
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
                                            : <Loader2  size={12} color={C.emerald} style={{ animation: "spin 2s linear infinite" }} />}
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
                                <div style={{ maxHeight: 280, overflowY: "auto", background: "#080810", padding: 14, border: `1px solid ${C.border}`, borderRadius: 2 }}>
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                        {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* ── Structured Result Panels ── */}
                        {displayResult && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isFinal ? 1 : 0.65, transition: "opacity 0.3s" }}>

                                {/* ── Prediction + Triage Banner ── */}
                                {displayResult.model_output && displayResult.severity_assessment && (() => {
                                    const pred     = displayResult.model_output.prediction;
                                    const conf     = displayResult.model_output.confidence;
                                    const grade    = displayResult.severity_assessment?.grade;
                                    const label    = displayResult.severity_assessment?.triage_label;
                                    const priority = displayResult.severity_assessment?.triage_priority;
                                    const pColor   = predictionColor(pred);
                                    const tColor   = triageColor(label);
                                    return (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                            {/* Prediction */}
                                            <div style={{
                                                background: `${pColor}12`, border: `1px solid ${pColor}40`,
                                                borderLeft: `4px solid ${pColor}`, padding: "14px 16px",
                                            }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>CNN Prediction</p>
                                                <p style={{ fontSize: 20, fontWeight: 900, color: pColor, margin: "0 0 4px", lineHeight: 1 }}>{pred || "…"}</p>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <div style={{ flex: 1, height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                                                        <div style={{ height: "100%", width: `${(conf || 0) * 100}%`, background: pColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: 800, color: pColor, fontFamily: "monospace", flexShrink: 0 }}>
                                                        {((conf || 0) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Triage Priority */}
                                            <div style={{
                                                background: `${tColor}12`, border: `1px solid ${tColor}40`,
                                                borderLeft: `4px solid ${tColor}`, padding: "14px 16px",
                                            }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Triage Priority</p>
                                                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                                    <span style={{ fontSize: 28, fontWeight: 900, color: tColor, lineHeight: 1 }}>P{priority ?? "?"}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: tColor }}>{label || "…"}</span>
                                                </div>
                                                <p style={{ fontSize: 10, color: gradeColor(grade), fontWeight: 700, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                                    Grade: {grade || "…"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* ── Probability Bars ── */}
                                {displayResult.model_output && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 12px" }}>
                                            Model Probabilities
                                        </p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                            {[
                                                { label: "Pneumonia", value: displayResult.model_output.pneumonia_probability, color: C.red },
                                                { label: "Normal",    value: displayResult.model_output.normal_probability,    color: C.green },
                                            ].map(bar => (
                                                <div key={bar.label}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{bar.label}</span>
                                                        <span style={{ fontSize: 12, fontWeight: 800, color: bar.color, fontFamily: "monospace" }}>
                                                            {((bar.value || 0) * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 6, background: C.dim, borderRadius: 3, overflow: "hidden" }}>
                                                        <div style={{
                                                            height: "100%", borderRadius: 3, transition: "width 1s ease",
                                                            background: bar.color,
                                                            width: `${(bar.value || 0) * 100}%`,
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Imaging Findings ── */}
                                {displayResult.imaging_findings && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                            <ScanLine size={13} color={C.emerald} />
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                                Imaging Findings
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {[
                                                { label: "Pattern",           value: displayResult.imaging_findings.pattern },
                                                { label: "Affected Area",     value: displayResult.imaging_findings.affected_area },
                                                { label: "Bilateral",         value: displayResult.imaging_findings.bilateral ? "Yes" : "No" },
                                                { label: "Finding Confidence",value: displayResult.imaging_findings.confidence_in_findings },
                                            ].map((row, i) => row.value !== undefined && (
                                                <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 8, alignItems: "start" }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: 1 }}>{row.label}</span>
                                                    <span style={{ fontSize: 12, color: C.text }}>{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Clinical Urgency ── */}
                                {displayResult.severity_assessment?.clinical_urgency && (
                                    <div style={{ background: `${C.yellow}08`, border: `1px solid ${C.yellow}30`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <AlertTriangle size={13} color={C.yellow} />
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.yellow, margin: 0 }}>
                                                Clinical Urgency
                                            </p>
                                        </div>
                                        <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.6 }}>
                                            {displayResult.severity_assessment.clinical_urgency}
                                        </p>
                                    </div>
                                )}

                                {/* ── Clinical Interpretation ── */}
                                {displayResult.clinical_interpretation && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <Stethoscope size={13} color={C.emerald} />
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                                Clinical Interpretation
                                            </p>
                                        </div>
                                        <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.65 }}>
                                            {displayResult.clinical_interpretation}
                                        </p>
                                    </div>
                                )}

                                {/* ── LLM Clinical Opinion ── */}
                                {displayResult.llm_interpretation && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.emerald} 6%, ${C.surface})` }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Zap size={12} color={C.emerald} />
                                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                    LLM Clinical Opinion
                                                    {!isFinal && <Loader2 size={10} color={C.text} style={{ animation: "spin 2s linear infinite", display: "inline-block", marginLeft: 8 }} />}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                                            {displayResult.llm_interpretation.clinical_opinion && (
                                                <div>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>Radiologist opinion</p>
                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.65 }}>{displayResult.llm_interpretation.clinical_opinion}</p>
                                                </div>
                                            )}
                                            {displayResult.llm_interpretation.key_concern && (
                                                <div style={{ background: `${C.red}08`, border: `1px solid ${C.red}25`, padding: "10px 12px" }}>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.red, margin: "0 0 4px" }}>Key Concern</p>
                                                    <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{displayResult.llm_interpretation.key_concern}</p>
                                                </div>
                                            )}
                                            {displayResult.llm_interpretation.differential?.length > 0 && (
                                                <div>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Differential Diagnoses</p>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                        {displayResult.llm_interpretation.differential.map((dx, i) => (
                                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.text }}>
                                                                <span style={{
                                                                    width: 18, height: 18, background: C.emerald, color: "#fff",
                                                                    fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center",
                                                                    justifyContent: "center", borderRadius: 3, flexShrink: 0,
                                                                }}>{i + 1}</span>
                                                                {dx}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {displayResult.llm_interpretation.follow_up && (
                                                <div>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Follow-Up</p>
                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>{displayResult.llm_interpretation.follow_up}</p>
                                                </div>
                                            )}
                                            {displayResult.llm_interpretation.safety_net && (
                                                <div style={{ background: `${C.yellow}08`, border: `1px solid ${C.yellow}25`, padding: "8px 12px" }}>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.yellow, margin: "0 0 3px" }}>Safety Net</p>
                                                    <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{displayResult.llm_interpretation.safety_net}</p>
                                                </div>
                                            )}
                                            {displayResult.llm_interpretation.llm_disclaimer && (
                                                <p style={{ fontSize: 10, color: C.muted, margin: 0, fontStyle: "italic", lineHeight: 1.5, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                                                    ⚠ {displayResult.llm_interpretation.llm_disclaimer}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Recommended Actions ── */}
                                {displayResult.recommended_actions?.length > 0 && (
                                    <div style={{ border: `1px solid ${C.border}` }}>
                                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.emerald} 6%, ${C.surface})` }}>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                                Recommended Actions ({displayResult.recommended_actions.length})
                                            </p>
                                        </div>
                                        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                                            {displayResult.recommended_actions.map((action, idx) => (
                                                <div key={idx} style={{
                                                    display: "flex", alignItems: "flex-start", gap: 10,
                                                    padding: "10px 12px",
                                                    background: C.bg,
                                                    borderLeft: `3px solid ${C.emerald}`,
                                                    border: `1px solid ${C.border}`,
                                                }}>
                                                    <div style={{
                                                        width: 22, height: 22, background: `${C.emerald}18`,
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        flexShrink: 0, borderRadius: 3,
                                                    }}>
                                                        <Activity size={11} color={C.emerald} />
                                                    </div>
                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{action}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Diagnosis Confirmation Banner ── */}
                                {isFinal && displayResult.confirms_diagnosis !== undefined && (
                                    <div style={{
                                        background: displayResult.confirms_diagnosis ? `${C.green}10` : `${C.yellow}10`,
                                        border: `1px solid ${displayResult.confirms_diagnosis ? C.green : C.yellow}30`,
                                        borderLeft: `4px solid ${displayResult.confirms_diagnosis ? C.green : C.yellow}`,
                                        padding: "12px 14px",
                                        display: "flex", alignItems: "center", gap: 10,
                                    }}>
                                        {displayResult.confirms_diagnosis
                                            ? <CheckCircle2 size={16} color={C.green} />
                                            : <AlertTriangle size={16} color={C.yellow} />}
                                        <div>
                                            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: displayResult.confirms_diagnosis ? C.green : C.yellow, margin: "0 0 2px" }}>
                                                {displayResult.confirms_diagnosis ? "Imaging Confirms Diagnosis" : "Imaging Inconclusive"}
                                            </p>
                                            {displayResult.diagnosis_code && (
                                                <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: "monospace" }}>ICD-10: {displayResult.diagnosis_code}</p>
                                            )}
                                        </div>
                                        {displayResult.analysis_mode && (
                                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", border: `1px solid ${C.border}`, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: C.muted }}>
                                                <Target size={9} color={C.emerald} />
                                                {displayResult.analysis_mode.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── FHIR Diagnostic Report Summary ── */}
                                {isFinal && displayResult.fhir_diagnostic_report && (
                                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <FileWarning size={13} color={C.purple} />
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                                FHIR Diagnostic Report
                                            </p>
                                            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", background: `${C.purple}18`, color: C.purple, border: `1px solid ${C.purple}30`, marginLeft: "auto" }}>
                                                {displayResult.fhir_diagnostic_report.resourceType}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                                            {displayResult.fhir_diagnostic_report.conclusion}
                                        </p>
                                    </div>
                                )}

                            </div>
                        )}

                        {/* Empty state */}
                        {!isStreaming && streamEvents.length === 0 && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <Eye size={40} color={C.dim} style={{ margin: "0 auto 12px" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 4px" }}>
                                    Ready to analyze. Upload a chest X-ray and click "Run Imaging Triage".
                                </p>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0, opacity: 0.6 }}>
                                    EfficientNetB0 · AUC 0.981 · Port :8005
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
