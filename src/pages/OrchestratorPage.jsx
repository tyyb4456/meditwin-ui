import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity, ShieldAlert, HeartPulse, BrainCircuit,
    Pill, Image as ImageIcon, FileJson, Play, X,
    AlertCircle, Loader2, Workflow, ArrowLeft, ChevronRight,
    Wifi, CheckCircle2, Copy, Check, Upload, Trash2,
    ChevronDown, TrendingUp, TrendingDown, Clock, User,
    FlaskConical, ShieldCheck, GitMerge, Layers, FileText,
    AlertTriangle, BarChart3, Heart, Zap, Target, Info
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

// ── CSS variable colour tokens (theme-aware) ────────────────────────────────
const C = {
    bg: "var(--color-bg)",
    surface: "var(--color-surface)",
    border: "var(--color-border)",
    accent: "var(--color-accent)",
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
    dim: "var(--color-border)",
    green: "#22C55E",
    yellow: "#EAB308",
    red: "#EF4444",
    cyan: "#06B6D4",
    purple: "#8b5cf6",
    pink: "#ec4899",
    orange: "#f97316",
    teal: "#14b8a6",
    indigo: "#6366f1",
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
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

function SectionHeader({ title, count }) {
    return (
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                {title}{count !== undefined ? ` (${count})` : ""}
            </p>
        </div>
    );
}

function Badge({ label, color = C.accent, bg }) {
    return (
        <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 7px", color, background: bg || `${color}18`,
            border: `1px solid ${color}30`, flexShrink: 0
        }}>{label}</span>
    );
}

function ConfBar({ value, color = C.accent }) {
    const pct = Math.round((value || 0) * 100);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", flexShrink: 0 }}>{pct}%</span>
        </div>
    );
}

// ── JSON input mode ──────────────────────────────────────────────────────────
function JsonInputMode({ onSubmit, isStreaming }) {
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
        const fi = document.getElementById("image-upload");
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
            <div>
                <label style={labelStyle}>Request Payload (JSON)</label>
                <textarea
                    value={jsonInput}
                    onChange={(e) => { setJsonInput(e.target.value); setError(""); }}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
                    rows={8} spellCheck={false}
                />
            </div>

            <div>
                <label style={labelStyle}>Medical Image (Chest X-Ray)</label>
                {!imagePreview ? (
                    <div>
                        <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                        <label htmlFor="image-upload" style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "12px", border: `1px dashed ${C.border}`, background: `color-mix(in srgb, ${C.accent} 5%, transparent)`,
                            color: C.accent, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer",
                            textTransform: "uppercase", transition: "background 0.2s"
                        }}>
                            <Upload size={14} /> Upload Image (Optional)
                        </label>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, border: `1px solid ${C.border}`, background: C.bg }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <img src={imagePreview} alt="Preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 2 }} />
                            <span style={{ fontSize: 11, color: C.text, fontWeight: 700 }}>Image Ready</span>
                        </div>
                        <button type="button" onClick={handleRemoveImage} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", padding: 6, display: "flex" }}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
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
                border: "none", color: "#fff",
                fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: isStreaming ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
            }}>
                {isStreaming
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Running Workflow...</>
                    : <><Play size={15} /> Run Orchestrator</>}
            </button>
        </form>
    );
}

// ── Agent mini-cell (live status grid) ───────────────────────────────────────
function AgentCell({ title, icon: Icon, color, data, isLoading, children }) {
    const done = !!data;
    return (
        <div style={{
            background: C.bg,
            border: `1px solid ${done ? color : C.border}`,
            borderLeft: `4px solid ${done ? color : C.dim}`,
            padding: 14,
            opacity: isLoading || done ? 1 : 0.4,
            transition: "all 0.3s ease"
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, background: `${color}18`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={12} color={color} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text }}>{title}</span>
                </div>
                {isLoading && !done && <Loader2 size={12} color={color} style={{ animation: "spin 1s linear infinite" }} />}
                {done && <CheckCircle2 size={12} color={color} />}
            </div>
            <div style={{ minHeight: 36 }}>
                {done ? children : isLoading ? (
                    <div style={{ height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: "60%", height: "100%", background: color, animation: "pulse 1.5s infinite" }} />
                    </div>
                ) : (
                    <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>Waiting...</p>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED RESULT PANELS
// Each panel reads from results.final (the complete orchestrator response)
// or from individual agent result events where available
// ─────────────────────────────────────────────────────────────────────────────

function PatientSummaryCard({ finalData }) {
    const agent = finalData?.agent_outputs;
    const dx = agent?.diagnosis;
    const soap = finalData?.clinician_output?.soap_note;
    const cons = finalData?.consensus;
    if (!dx && !soap) return null;

    const confColor = cons?.aggregate_confidence >= 0.7 ? C.green : cons?.aggregate_confidence >= 0.45 ? C.yellow : C.red;

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Clinical Summary" />
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {soap?.clinical_summary_one_liner && (
                    <div style={{ padding: 14, background: C.bg, borderLeft: `4px solid ${C.accent}`, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.6 }}>
                            {soap.clinical_summary_one_liner}
                        </p>
                    </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {dx?.top_diagnosis && (
                        <div style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Top Diagnosis</p>
                            <p style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>{dx.top_diagnosis}</p>
                            <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: "monospace" }}>{dx.top_icd10_code}</p>
                        </div>
                    )}
                    {cons?.aggregate_confidence !== undefined && (
                        <div style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Confidence</p>
                            <p style={{ fontSize: 20, fontWeight: 900, color: confColor, margin: 0, fontFamily: "monospace" }}>
                                {Math.round(cons.aggregate_confidence * 100)}%
                            </p>
                        </div>
                    )}
                    {cons?.status && (
                        <div style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Consensus</p>
                            <p style={{ fontSize: 10, fontWeight: 800, color: cons.status === "FULL_CONSENSUS" ? C.green : C.yellow, margin: 0 }}>
                                {cons.status?.replace(/_/g, " ")}
                            </p>
                            {cons.conflict_count > 0 && (
                                <p style={{ fontSize: 9, color: C.red, margin: "3px 0 0" }}>{cons.conflict_count} conflict{cons.conflict_count !== 1 ? "s" : ""}</p>
                            )}
                        </div>
                    )}
                </div>
                {cons?.human_review_required && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: `${C.yellow}12`, border: `1px solid ${C.yellow}40` }}>
                        <AlertTriangle size={14} color={C.yellow} />
                        <p style={{ fontSize: 12, color: C.yellow, fontWeight: 700, margin: 0 }}>Human physician review required</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DiagnosisCard({ finalData }) {
    const dx = finalData?.agent_outputs?.diagnosis;
    const [expanded, setExpanded] = useState(null);
    if (!dx) return null;

    const confColor = (c) => c >= 0.7 ? C.green : c >= 0.45 ? C.yellow : C.red;

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Differential Diagnosis" count={dx.differential_diagnosis?.length} />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {dx.differential_diagnosis?.map((diag, idx) => (
                    <div key={idx} style={{ border: `1px solid ${C.border}`, background: C.bg }}>
                        <div
                            style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                            onClick={() => setExpanded(expanded === idx ? null : idx)}
                        >
                            <span style={{ width: 22, height: 22, background: C.accent, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}>{diag.rank}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <p style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: 0 }}>{diag.display}</p>
                                    <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", background: C.surface, padding: "1px 5px", border: `1px solid ${C.border}` }}>{diag.icd10_code}</span>
                                </div>
                                <ConfBar value={diag.confidence} color={confColor(diag.confidence)} />
                            </div>
                            <ChevronDown size={14} color={C.muted} style={{ flexShrink: 0, transform: expanded === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                        </div>
                        {expanded === idx && (
                            <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{diag.clinical_reasoning}</p>
                                {diag.supporting_evidence?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, margin: "0 0 5px" }}>Supporting</p>
                                        {diag.supporting_evidence.map((ev, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: C.text, marginBottom: 3 }}>
                                                <CheckCircle2 size={11} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {diag.against_evidence?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: "0 0 5px" }}>Against</p>
                                        {diag.against_evidence.map((ev, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: C.text, marginBottom: 3 }}>
                                                <X size={11} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {dx.recommended_next_steps?.length > 0 && (
                    <div style={{ marginTop: 4, border: `1px solid ${C.border}` }}>
                        <SectionHeader title={`Recommended Next Steps`} count={dx.recommended_next_steps.length} />
                        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                            {dx.recommended_next_steps.map((step, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 10, background: C.bg, borderLeft: `3px solid ${C.cyan}`, border: `1px solid ${C.border}` }}>
                                    <div style={{ width: 26, height: 26, background: `${C.cyan}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}>
                                        {step.category === "MEDICATION" ? <Pill size={12} color={C.cyan} /> : step.category === "INVESTIGATION" ? <FlaskConical size={12} color={C.cyan} /> : <Clock size={12} color={C.cyan} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                                            <Badge label={step.category} color={C.cyan} />
                                            {step.urgency && step.urgency !== "routine" && <Badge label={step.urgency} color={C.red} />}
                                        </div>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{step.description}</p>
                                        {step.drug_name && <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>{step.drug_name} {step.drug_dose} {step.drug_route ? `(${step.drug_route})` : ""}</p>}
                                        {step.rationale && <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0", fontStyle: "italic" }}>{step.rationale}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {dx.reasoning_summary && (
                    <div style={{ padding: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>AI Reasoning</p>
                        <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.65 }}>{dx.reasoning_summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function LabCard({ finalData }) {
    const lab = finalData?.agent_outputs?.lab;
    if (!lab) return null;
    const summary = lab.lab_summary || {};
    const sevColor = summary.overall_severity === "CRITICAL" ? C.red : summary.overall_severity === "HIGH" ? C.orange : summary.overall_severity === "MODERATE" ? C.yellow : C.green;

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Lab Analysis" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    {[
                        { label: "Severity", value: summary.overall_severity || "N/A", color: sevColor },
                        { label: "Total Results", value: summary.total_results ?? "-", color: C.text },
                        { label: "Abnormal", value: summary.abnormal_count ?? 0, color: summary.abnormal_count > 0 ? C.yellow : C.text },
                        { label: "Critical", value: summary.critical_count ?? 0, color: summary.critical_count > 0 ? C.red : C.text },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}`, textAlign: "center" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>{label}</p>
                            <p style={{ fontSize: 18, fontWeight: 900, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
                        </div>
                    ))}
                </div>
                {lab.critical_alerts?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: "0 0 6px" }}>Critical Alerts</p>
                        {lab.critical_alerts.map((alert, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: `${C.red}08`, border: `1px solid ${C.red}30`, marginBottom: 6 }}>
                                <AlertCircle size={13} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{alert.message || JSON.stringify(alert)}</p>
                            </div>
                        ))}
                    </div>
                )}
                {lab.flagged_results?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.yellow, margin: "0 0 6px" }}>Flagged Results</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {lab.flagged_results.map((r, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.bg, border: `1px solid ${C.border}` }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.display || r.test}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 12, color: C.text, fontFamily: "monospace" }}>{r.value} {r.unit}</span>
                                        <Badge label={r.flag || "FLAG"} color={r.flag === "CRITICAL" ? C.red : C.yellow} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {lab.diagnosis_confirmation?.confirms_top_diagnosis !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {lab.diagnosis_confirmation.confirms_top_diagnosis
                            ? <CheckCircle2 size={14} color={C.green} />
                            : <X size={14} color={C.red} />}
                        <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: 600 }}>
                            Labs {lab.diagnosis_confirmation.confirms_top_diagnosis ? "support" : "do not support"} top diagnosis
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DrugSafetyCard({ finalData }) {
    const drug = finalData?.agent_outputs?.drug_safety;
    if (!drug) return null;
    const isSafe = drug.safety_status === "SAFE";

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Drug Safety" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: isSafe ? `${C.green}10` : `${C.red}10`, border: `1px solid ${isSafe ? C.green : C.red}40` }}>
                    <ShieldCheck size={20} color={isSafe ? C.green : C.red} />
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 900, color: isSafe ? C.green : C.red, margin: 0 }}>{drug.safety_status?.replace(/_/g, " ")}</p>
                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                            {drug.approved_medications?.length || 0} approved · {drug.critical_interactions?.length || 0} interactions · {drug.contraindications?.length || 0} contraindications
                        </p>
                    </div>
                </div>

                {drug.approved_medications?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, margin: "0 0 6px" }}>Approved Medications</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {drug.approved_medications.map((med, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: `${C.green}10`, border: `1px solid ${C.green}30` }}>
                                    <CheckCircle2 size={11} color={C.green} />
                                    <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{med}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {drug.critical_interactions?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: "0 0 6px" }}>Critical Interactions</p>
                        {drug.critical_interactions.map((inter, i) => (
                            <div key={i} style={{ padding: 10, background: `${C.red}08`, border: `1px solid ${C.red}30`, marginBottom: 6 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.red, margin: "0 0 2px" }}>{inter.drug_pair || inter.drug || JSON.stringify(inter)}</p>
                                {inter.description && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{inter.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {drug.alternatives?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.cyan, margin: "0 0 6px" }}>Suggested Alternatives</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {drug.alternatives.map((alt, i) => (
                                <Badge key={i} label={typeof alt === "string" ? alt : alt.drug || JSON.stringify(alt)} color={C.cyan} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DigitalTwinCard({ finalData }) {
    const twin = finalData?.agent_outputs?.digital_twin;
    if (!twin) return null;
    const sim = twin.simulation_summary || {};
    const scenarios = twin.scenarios || [];
    const riskColor = sim.patient_risk_profile === "HIGH" ? C.red : sim.patient_risk_profile === "MODERATE" ? C.yellow : C.green;
    const baseline = sim.baseline_risks || {};
    const costs = twin.cost_effectiveness_summary?.scenarios || [];

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Digital Twin Simulation" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Risk Overview */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                        { label: "Risk Profile", value: sim.patient_risk_profile || "N/A", color: riskColor },
                        { label: "30d Mortality", value: baseline.mortality_30d != null ? `${(baseline.mortality_30d * 100).toFixed(1)}%` : "N/A", color: C.text },
                        { label: "30d Readmission", value: baseline.readmission_30d != null ? `${(baseline.readmission_30d * 100).toFixed(1)}%` : "N/A", color: C.text },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}`, textAlign: "center" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>{label}</p>
                            <p style={{ fontSize: 16, fontWeight: 900, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Scenarios */}
                {scenarios.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>Treatment Scenarios</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {scenarios.map((sc, i) => {
                                const pred = sc.predictions || {};
                                const isRec = sc.option_id === sim.recommended_option;
                                const recovery7d = pred.recovery_probability_7d;
                                return (
                                    <div key={i} style={{ padding: 12, background: C.bg, border: `1px solid ${isRec ? C.accent : C.border}`, borderLeft: `4px solid ${isRec ? C.accent : C.dim}` }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <span style={{ width: 22, height: 22, background: isRec ? C.accent : C.dim, color: isRec ? "#fff" : C.muted, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>{sc.option_id}</span>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0, flex: 1 }}>{sc.label}</p>
                                            {isRec && <Badge label="Recommended" color={C.accent} />}
                                        </div>
                                        {recovery7d != null && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 10, color: C.muted }}>7d Recovery</span>
                                                <ConfBar value={recovery7d} color={isRec ? C.accent : C.cyan} />
                                            </div>
                                        )}
                                        {pred.mortality_30d != null && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                                                <span style={{ fontSize: 10, color: C.muted }}>30d Mortality</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>{(pred.mortality_30d * 100).toFixed(1)}%</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cost-effectiveness */}
                {costs.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>Cost-Effectiveness</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {costs.filter(c => !c.is_baseline_comparator).map((c, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.bg, border: `1px solid ${C.border}` }}>
                                    <div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{c.label}</span>
                                        <Badge label={c.cost_effective === true ? "Cost-Effective" : "Not cost-effective"} color={c.cost_effective === true ? C.green : C.red} />
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontSize: 13, fontWeight: 900, color: C.text, margin: 0, fontFamily: "monospace" }}>${c.estimated_cost_usd?.toLocaleString()}</p>
                                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>${c.cost_per_qaly?.toFixed(0)}/QALY</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {twin.what_if_narrative && (
                    <div style={{ padding: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>AI Narrative</p>
                        <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.65 }}>{twin.what_if_narrative}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SOAPNoteCard({ finalData }) {
    const soap = finalData?.clinician_output?.soap_note;
    if (!soap) return null;
    const sections = [
        { key: "subjective", label: "S — Subjective", color: C.cyan },
        { key: "objective", label: "O — Objective", color: C.purple },
        { key: "assessment", label: "A — Assessment", color: C.orange },
    ];

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="SOAP Note" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {sections.map(({ key, label, color }) => soap[key] && (
                    <div key={key} style={{ padding: 12, background: C.bg, borderLeft: `3px solid ${color}`, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, margin: "0 0 5px" }}>{label}</p>
                        <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.65 }}>{soap[key]}</p>
                    </div>
                ))}
                {soap.plan?.length > 0 && (
                    <div style={{ padding: 12, background: C.bg, borderLeft: `3px solid ${C.green}`, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, margin: "0 0 8px" }}>P — Plan</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {soap.plan.map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <span style={{ width: 18, height: 18, background: `${C.green}20`, color: C.green, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2, flexShrink: 0 }}>{i + 1}</span>
                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5 }}>{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PatientExplanationCard({ finalData }) {
    const po = finalData?.patient_output;
    if (!po) return null;
    const rl = po.reading_level_check || finalData?.reading_level_check;

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Patient Explanation" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {rl && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: 18, fontWeight: 900, color: rl.acceptable ? C.green : C.yellow, margin: 0, fontFamily: "monospace" }}>G{rl.grade_level?.toFixed(1)}</p>
                            <p style={{ fontSize: 9, color: C.muted, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Grade Level</p>
                        </div>
                        <div style={{ width: 1, height: 30, background: C.border }} />
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: rl.acceptable ? C.green : C.yellow, margin: 0 }}>
                                {rl.acceptable ? "✓ Reading level acceptable" : "⚠ Reading level too high"}
                            </p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Ease score {rl.reading_ease}/100 · Target grade {rl.target}</p>
                        </div>
                    </div>
                )}
                {po.condition_explanation && (
                    <div style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>Condition</p>
                        <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.6 }}>{po.condition_explanation}</p>
                    </div>
                )}
                {po.what_happens_next && (
                    <div style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>What Happens Next</p>
                        <p style={{ fontSize: 13, color: C.text, margin: 0, lineHeight: 1.6 }}>{po.what_happens_next}</p>
                    </div>
                )}
                {po.what_to_expect?.length > 0 && (
                    <div style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>What To Expect</p>
                        {po.what_to_expect.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                                <ChevronRight size={11} color={C.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{item}</p>
                            </div>
                        ))}
                    </div>
                )}
                {po.when_to_call_the_nurse?.length > 0 && (
                    <div style={{ padding: 10, background: `${C.red}08`, border: `1px solid ${C.red}30` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: "0 0 5px" }}>When To Call The Nurse</p>
                        {po.when_to_call_the_nurse.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                                <AlertTriangle size={11} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{item}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RiskAttributionCard({ finalData }) {
    const ra = finalData?.risk_attribution;
    if (!ra) return null;
    const shap = ra.shap_style_breakdown || [];

    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Risk Attribution (SHAP)" count={shap.length} />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {ra.readmission_risk_explanation && (
                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6, padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>{ra.readmission_risk_explanation}</p>
                )}
                {shap.map((item, i) => {
                    const isReduce = item.direction === "reduces_risk";
                    const color = isReduce ? C.green : C.red;
                    const importance = item.importance_score || 0;
                    return (
                        <div key={i} style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                {isReduce ? <TrendingDown size={13} color={C.green} /> : <TrendingUp size={13} color={C.red} />}
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0, flex: 1 }}>{item.feature}</p>
                                <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{item.contribution}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 10, color: C.muted }}>Importance</span>
                                <ConfBar value={importance} color={color} />
                            </div>
                        </div>
                    );
                })}
                {ra.model_note && (
                    <p style={{ fontSize: 10, color: C.muted, margin: 0, fontStyle: "italic", padding: "6px 10px", background: C.bg, border: `1px solid ${C.border}` }}>{ra.model_note}</p>
                )}
            </div>
        </div>
    );
}

function MetaCard({ finalData }) {
    if (!finalData) return null;
    return (
        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <SectionHeader title="Run Metadata" />
            <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                    { label: "Patient ID", value: finalData.patient_id, mono: true },
                    { label: "Elapsed", value: `${finalData.elapsed_seconds}s`, mono: true },
                    { label: "Version", value: finalData.meditwin_version, mono: true },
                    { label: "Imaging", value: finalData.imaging_performed ? "Yes" : "No" },
                    { label: "Timestamp", value: finalData.analysis_timestamp ? new Date(finalData.analysis_timestamp).toLocaleTimeString() : "N/A" },
                    { label: "Errors", value: finalData.error_log?.length || 0, color: finalData.error_log?.length > 0 ? C.red : C.green },
                ].map(({ label, value, mono, color }) => (
                    <div key={label} style={{ padding: 8, background: C.bg, border: `1px solid ${C.border}` }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 3px" }}>{label}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: color || C.text, margin: 0, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{String(value)}</p>
                    </div>
                ))}
                {finalData.error_log?.length > 0 && (
                    <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4 }}>
                        {finalData.error_log.map((e, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: 8, background: `${C.yellow}08`, border: `1px solid ${C.yellow}30` }}>
                                <Info size={12} color={C.yellow} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 11, color: C.yellow, margin: 0 }}>{e}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function OrchestratorPage() {
    const navigate = useNavigate();
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamEvents, setStreamEvents] = useState([]);
    const [liveText, setLiveText] = useState("");
    const [results, setResults] = useState({
        patient_context: null, diagnosis: null, lab_analysis: null,
        drug_safety: null, imaging_triage: null, digital_twin: null,
        consensus: null, explanation: null, final: null
    });
    const [currentStep, setCurrentStep] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [jsonOpen, setJsonOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("structured");

    const abortControllerRef = useRef(null);
    const eventsEndRef = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setLiveText(""); setCurrentStep(null); setError(null); setCopied(false); setJsonOpen(false);
        setResults({ patient_context: null, diagnosis: null, lab_analysis: null, drug_safety: null, imaging_triage: null, digital_twin: null, consensus: null, explanation: null, final: null });
    };

    const handleCopy = () => {
        const text = results.final ? JSON.stringify(results.final, null, 2) : liveText;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAbort = () => { abortControllerRef.current?.abort(); setIsStreaming(false); };

    const runOrchestrator = async (payload) => {
        handleReset();
        setIsStreaming(true);
        setActiveTab("structured");
        abortControllerRef.current = new AbortController();
        try {
            const response = await fetch("http://127.0.0.1:8000/analyze/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current.signal,
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const dataStr = line.slice(6);
                    if (dataStr === "[DONE]") { setIsStreaming(false); continue; }
                    try {
                        const event = JSON.parse(dataStr);
                        if (event.type === "token") {
                            setLiveText(prev => prev + event.token);
                        } else {
                            setStreamEvents(prev => [...prev, event]);
                            if (event.type === "status") setCurrentStep(event.message);
                            else if (event.type === "result" || event.type === "complete") {
                                if (event.node) setResults(prev => ({ ...prev, [event.node]: event.data || event.summary || event }));
                            } else if (event.type === "final") {
                                setResults(prev => ({ ...prev, final: event.data }));
                                setCurrentStep("Analysis Complete");
                            } else if (event.type === "error" && event.fatal) {
                                setError(event.message);
                                setIsStreaming(false);
                            }
                        }
                    } catch { /* ignore */ }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") { setError(err.message); setIsStreaming(false); }
        }
    };

    const eventBadgeStyle = (type) => {
        const map = { error: [C.red, `${C.red}15`], complete: [C.green, `${C.green}15`], result: [C.green, `${C.green}15`], final: [C.purple, `${C.purple}15`], status: [C.cyan, `${C.cyan}15`], progress: [C.yellow, `${C.yellow}15`] };
        const [fg, bg] = map[type] || [C.muted, C.surface];
        return { fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 2, color: fg, background: bg, fontFamily: "monospace", flexShrink: 0 };
    };

    const isWorking = (nodeNames) => {
        if (!isStreaming || results.final) return false;
        return nodeNames.some(n => !results[n]);
    };

    const finalData = results.final;
    const hasResults = isStreaming || streamEvents.length > 0;

    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: var(--color-surface); }
                ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }
            `}</style>

            {/* ── Sticky Top Nav ── */}
            <div style={{ position: "sticky", top: 0, zIndex: 50, background: `color-mix(in srgb, ${C.bg} 92%, transparent)`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        <ArrowLeft size={11} /> Back
                    </button>
                    <div style={{ width: 1, height: 20, background: C.border }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 26, height: 26, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            <span style={{ color: "var(--color-bg)", fontSize: 9, fontWeight: 900 }}>MT</span>
                        </div>
                        {[{ label: "MediTwin AI", path: "/" }, { label: "Dashboard", path: "/dashboard" }].map(crumb => (
                            <span key={crumb.path} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                                <button onClick={() => navigate(crumb.path)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, padding: 0 }}>{crumb.label}</button>
                            </span>
                        ))}
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <ChevronRight size={10} color={C.muted} style={{ opacity: 0.5 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.text }}>Orchestrator</span>
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11 }}>
                        <Wifi size={11} color={C.accent} />
                        <span style={{ color: C.muted, fontFamily: "monospace" }}>:8000</span>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            {/* ── Page Header ── */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
                <div style={{ maxWidth: 1500, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 38, height: 38, background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            <Workflow size={18} color={C.accent} strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Omni-Agent Pipeline</p>
                            <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: C.text, margin: 0, lineHeight: 1.1 }}>Orchestrator Mode</h1>
                        </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>8-agent clinical pipeline · FHIR R4 · Digital Twin · Consensus arbitration</p>
                </div>
            </div>

            {/* ── Main layout ── */}
            <div style={{ maxWidth: 1500, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, alignItems: "start" }}>

                {/* ── LEFT: Input + SSE log ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 20 }}>
                        <JsonInputMode onSubmit={runOrchestrator} isStreaming={isStreaming} />
                    </div>

                    {/* Raw SSE log */}
                    <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
                        <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text }}>SSE Stream Log</span>
                            {isStreaming && (
                                <button onClick={handleAbort} style={{ padding: "2px 8px", border: `1px solid ${C.red}`, color: C.red, background: "none", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                    <X size={9} /> Abort
                                </button>
                            )}
                        </div>
                        <div style={{ padding: "8px 12px", height: 320, overflowY: "auto", fontFamily: "monospace", fontSize: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                            {streamEvents.length === 0
                                ? <p style={{ color: C.muted, fontStyle: "italic", margin: 0 }}>Waiting for stream...</p>
                                : streamEvents.map((event, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingBottom: 3, borderBottom: `1px solid ${C.border}` }}>
                                        <span style={eventBadgeStyle(event.type)}>{event.type}</span>
                                        <div style={{ flex: 1 }}>
                                            {event.node && <span style={{ color: C.accent, fontSize: 9, fontWeight: "bold" }}>{event.node?.toUpperCase()} </span>}
                                            {event.message && <span style={{ color: C.muted, fontSize: 10 }}>{event.message}</span>}
                                        </div>
                                    </div>
                                ))}
                            <div ref={eventsEndRef} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Results ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* Status bar */}
                    {currentStep && (
                        <div style={{ padding: "10px 16px", background: results.final ? `${C.green}18` : `${C.accent}18`, border: `1px solid ${results.final ? C.green : C.accent}40`, display: "flex", alignItems: "center", gap: 10 }}>
                            {results.final ? <CheckCircle2 size={14} color={C.green} /> : <Loader2 size={14} color={C.accent} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />}
                            <span style={{ fontSize: 12, fontWeight: 600, color: results.final ? C.green : C.text }}>{currentStep}</span>
                            {results.final && <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{finalData?.elapsed_seconds}s total</span>}
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", gap: 8 }}>
                            <AlertCircle size={14} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: "0 0 2px" }}>Pipeline Error</p>
                                <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!hasResults && (
                        <div style={{ border: `1px solid ${C.border}`, padding: 60, textAlign: "center", background: C.surface }}>
                            <Workflow size={44} color={C.dim} style={{ margin: "0 auto 14px" }} strokeWidth={1} />
                            <p style={{ fontSize: 14, fontWeight: 700, color: C.muted, margin: "0 0 6px" }}>Orchestrator Ready</p>
                            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Fill in the patient payload and press Run Orchestrator to launch all 8 agents.</p>
                        </div>
                    )}

                    {/* Agent status grid — visible while streaming */}
                    {hasResults && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                            <AgentCell title="Patient Context" icon={HeartPulse} color={C.cyan} isLoading={isWorking(["patient_context"])} data={results.patient_context}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{results.patient_context?.patient_state?.demographics?.name || "Data Fetched"}</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{results.patient_context?.patient_state?.active_conditions?.length || 0} conditions · {results.patient_context?.patient_state?.lab_results?.length || 0} labs</p>
                            </AgentCell>
                            <AgentCell title="Diagnosis" icon={BrainCircuit} color={C.purple} isLoading={isWorking(["diagnosis"])} data={results.diagnosis}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{results.diagnosis?.top_diagnosis || "N/A"}</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{results.diagnosis?.top_icd10_code} · <span style={{ color: results.diagnosis?.confidence_level === "HIGH" ? C.green : C.yellow }}>{results.diagnosis?.confidence_level}</span></p>
                            </AgentCell>
                            <AgentCell title="Lab Analysis" icon={FlaskConical} color={C.green} isLoading={isWorking(["lab_analysis"])} data={results.lab_analysis}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{results.lab_analysis?.lab_summary?.overall_severity || "Complete"}</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{results.lab_analysis?.lab_summary?.abnormal_count || 0} abnormal · {results.lab_analysis?.lab_summary?.critical_count || 0} critical</p>
                            </AgentCell>
                            <AgentCell title="Drug Safety" icon={Pill} color={C.orange} isLoading={isWorking(["drug_safety"])} data={results.drug_safety}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: results.drug_safety?.safety_status === "SAFE" ? C.green : C.red, margin: 0 }}>{results.drug_safety?.safety_status?.replace(/_/g, " ") || "Checked"}</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{results.drug_safety?.approved_medications?.length || 0} approved · {results.drug_safety?.critical_interactions?.length || 0} interactions</p>
                            </AgentCell>
                            <AgentCell title="Digital Twin" icon={Layers} color={C.pink} isLoading={isWorking(["digital_twin"])} data={results.digital_twin}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>Option {results.digital_twin?.simulation_summary?.recommended_option || "?"} Recommended</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{results.digital_twin?.simulation_summary?.patient_risk_profile || "?"} risk profile</p>
                            </AgentCell>
                            <AgentCell title="Consensus" icon={GitMerge} color={C.indigo} isLoading={isWorking(["consensus"])} data={results.consensus}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{results.consensus?.consensus_status?.replace(/_/g, " ") || "Resolved"}</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>{Math.round((results.consensus?.aggregate_confidence || 0) * 100)}% confidence · {results.consensus?.conflict_count || 0} conflicts</p>
                            </AgentCell>
                        </div>
                    )}

                    {/* Live token stream — visible while streaming, before final arrives */}
                    {(isStreaming || liveText) && !finalData && (
                        <div style={{ border: `1px solid ${C.border}`, background: C.surface }}>
                            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Loader2 size={12} color={C.accent} style={{ animation: "spin 1s linear infinite" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted }}>Live Output</span>
                                </div>
                                <button onClick={handleCopy} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                    {copied ? <Check size={10} color={C.green} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <div style={{ padding: 14, maxHeight: 320, overflowY: "auto", background: "#080810" }}>
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                    {liveText || "Waiting for agent output..."}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    {(finalData || (!isStreaming && streamEvents.length > 0)) && (
                        <>
                            <div style={{ display: "flex", gap: 0, border: `1px solid ${C.border}`, background: C.surface }}>
                                {[
                                    { id: "structured", label: "Structured Results", icon: BarChart3 },
                                    { id: "json", label: "Raw JSON", icon: FileJson },
                                ].map(({ id, label, icon: Icon }) => (
                                    <button key={id} onClick={() => setActiveTab(id)} style={{
                                        flex: 1, padding: "10px 0", border: "none",
                                        borderBottom: activeTab === id ? `2px solid ${C.accent}` : "2px solid transparent",
                                        background: activeTab === id ? `color-mix(in srgb, ${C.accent} 8%, ${C.surface})` : C.surface,
                                        color: activeTab === id ? C.accent : C.muted,
                                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                        opacity: id === "structured" && !finalData ? 0.45 : 1,
                                    }}>
                                        <Icon size={13} /> {label}
                                        {id === "structured" && !finalData && (
                                            <span style={{ fontSize: 8, color: C.muted, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>pending</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {activeTab === "structured" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.3s ease" }}>
                                    <PatientSummaryCard finalData={finalData} />
                                    <DiagnosisCard finalData={finalData} />
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <LabCard finalData={finalData} />
                                        <DrugSafetyCard finalData={finalData} />
                                    </div>
                                    <DigitalTwinCard finalData={finalData} />
                                    <SOAPNoteCard finalData={finalData} />
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <PatientExplanationCard finalData={finalData} />
                                        <RiskAttributionCard finalData={finalData} />
                                    </div>
                                    <MetaCard finalData={finalData} />
                                </div>
                            )}

                            {activeTab === "json" && (() => {
                                // Prefer finalData; fall back to last "final" event in stream log
                                const jsonPayload = finalData ?? (() => {
                                    for (let i = streamEvents.length - 1; i >= 0; i--) {
                                        const ev = streamEvents[i];
                                        if (ev.type === "final" && ev.data) return ev.data;
                                    }
                                    // last resort: dump all agent outputs collected so far
                                    return Object.fromEntries(
                                        Object.entries(results).filter(([, v]) => v !== null)
                                    );
                                })();
                                const jsonText = JSON.stringify(jsonPayload, null, 2);
                                return (
                                    <div style={{ border: `1px solid ${C.border}`, background: C.surface, animation: "fadeIn 0.3s ease" }}>
                                        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `color-mix(in srgb, ${C.accent} 6%, ${C.surface})` }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <FileJson size={13} color={C.green} />
                                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.green }}>
                                                    {finalData ? "Final Response" : "Partial Agent Outputs"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(jsonText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                                style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                                {copied ? <Check size={10} color={C.green} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <div style={{ padding: 14, maxHeight: 700, overflowY: "auto", background: "#080810" }}>
                                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                                {jsonText}
                                            </pre>
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}