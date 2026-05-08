import { useState } from "react";
import { AlertCircle, Loader2, Play, Upload, Trash2 } from "lucide-react";
import { Field } from "./Shared";
import { ACCENT, BORDER, BG, TEXT, MUTED, DIM, RED, inputStyle, labelStyle } from "./tokens";

export default function InputPanel({ onSubmit, isStreaming }) {
    const [jsonInput, setJsonInput] = useState(JSON.stringify({
        patient_id: "example-patient-001",
        chief_complaint: "fever and weakness",
        fhir_base_url: "https://hapi.fhir.org/baseR4",
    }, null, 2));
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target.result);
            setImageBase64(ev.target.result.split(",")[1]);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        const fi = document.getElementById("orch-image-upload");
        if (fi) fi.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.patient_id || !parsed.chief_complaint)
                throw new Error("Missing required fields: patient_id and chief_complaint");
            if (imageBase64) parsed.image_data = imageBase64;
            onSubmit(parsed);
        } catch (err) { setError(err.message); }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Request Payload (JSON)">
                <textarea
                    value={jsonInput}
                    onChange={(e) => { setJsonInput(e.target.value); setError(""); }}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
                    rows={9} spellCheck={false}
                />
            </Field>

            <div>
                <label style={labelStyle}>Medical Image (Chest X-Ray — optional)</label>
                {!imagePreview ? (
                    <div>
                        <input type="file" id="orch-image-upload" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                        <label htmlFor="orch-image-upload" style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "12px", border: `1px dashed ${BORDER}`, borderRadius: 8,
                            background: `${ACCENT}06`, color: ACCENT,
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer",
                            textTransform: "uppercase", transition: "background 0.2s",
                        }}>
                            <Upload size={14} /> Upload Image
                        </label>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, border: `1px solid ${BORDER}`, borderRadius: 8, background: BG }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={imagePreview} alt="Preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
                            <span style={{ fontSize: 11, color: TEXT, fontWeight: 700 }}>Image Ready</span>
                        </div>
                        <button type="button" onClick={handleRemoveImage} style={{ background: "none", border: "none", color: RED, cursor: "pointer", padding: 6, display: "flex" }}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ padding: "10px 14px", background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                </div>
            )}

            <button type="submit" disabled={isStreaming} style={{
                width: "100%", padding: "11px 0",
                background: isStreaming ? DIM : ACCENT,
                border: "none", color: isStreaming ? MUTED : "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                borderRadius: 9, transition: "all 0.2s",
                boxShadow: isStreaming ? "none" : `0 4px 16px ${ACCENT}40`,
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Running Pipeline...</>
                    : <><Play size={15} /> Run Orchestrator</>}
            </button>
        </form>
    );
}
