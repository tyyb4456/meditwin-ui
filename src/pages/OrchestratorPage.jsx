import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity, ShieldAlert, HeartPulse, BrainCircuit,
    Pill, Image as ImageIcon, FileJson, Play, X,
    AlertCircle, Loader2, Workflow, ArrowLeft, ChevronRight,
    Wifi, CheckCircle2, Copy, Check, Upload, Trash2,
    ChevronDown, TrendingUp, TrendingDown, Clock, User,
    FlaskConical, ShieldCheck, GitMerge, Layers, FileText,
    AlertTriangle, BarChart3, Heart, Zap, Target, Info, GitBranch
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

// ── Color tokens ──────────────────────────────────────────────────────────────
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-subtle)";
const SUBTLE  = "var(--color-text-subtle)";
const DIM     = "var(--color-border)";
const ACCENT  = "#6366F1";
const GREEN   = "#22C55E";
const YELLOW  = "#EAB308";
const RED     = "#EF4444";
const CYAN    = "#06B6D4";
const PURPLE  = "#8B5CF6";
const PINK    = "#EC4899";
const ORANGE  = "#F97316";
const TEAL    = "#14B8A6";
const INDIGO  = "#6366F1";

const TERMINAL_BG = "#07060F";

const GLOBAL_STYLES = `
    @keyframes spin  { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    select option { background: var(--color-bg); color: var(--color-text); }
    input:focus, textarea:focus, select:focus { border-color: #6366F1 !important; outline: none; }
    input::placeholder, textarea::placeholder { color: var(--color-text-subtle); opacity: 0.7; }
`;

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

function SectionHeader({ title, count }) {
    return (
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, background: `${ACCENT}08` }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT, margin: 0 }}>
                {title}{count !== undefined ? ` (${count})` : ""}
            </p>
        </div>
    );
}

function Badge({ label, color = ACCENT }) {
    return (
        <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 7px", borderRadius: 5, color,
            background: `${color}18`, border: `1px solid ${color}30`, flexShrink: 0,
        }}>{label}</span>
    );
}

function ConfBar({ value, color = ACCENT }) {
    const pct = Math.round((value || 0) * 100);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: DIM, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", flexShrink: 0 }}>{pct}%</span>
        </div>
    );
}

// ── JSON / Image Input ────────────────────────────────────────────────────────
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

// ── Agent status mini-cell ────────────────────────────────────────────────────
function AgentCell({ title, icon: Icon, color, data, isLoading, children }) {
    const done = !!data;
    return (
        <div style={{
            background: BG, border: `1px solid ${done ? color : BORDER}`,
            borderLeft: `4px solid ${done ? color : DIM}`,
            borderRadius: 10, padding: 14,
            opacity: isLoading || done ? 1 : 0.4,
            transition: "all 0.3s ease",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, background: `${color}18`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={13} color={color} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT }}>{title}</span>
                </div>
                {isLoading && !done && <Loader2 size={12} color={color} style={{ animation: "spin 1s linear infinite" }} />}
                {done && <CheckCircle2 size={12} color={color} />}
            </div>
            <div style={{ minHeight: 36 }}>
                {done ? children : isLoading ? (
                    <div style={{ height: 4, background: DIM, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: "60%", height: "100%", background: color, animation: "pulse 1.5s infinite" }} />
                    </div>
                ) : (
                    <p style={{ fontSize: 11, color: MUTED, margin: 0, fontStyle: "italic" }}>Waiting…</p>
                )}
            </div>
        </div>
    );
}

// ── Result panels ─────────────────────────────────────────────────────────────

function PatientSummaryCard({ finalData }) {
    const agent = finalData?.agent_outputs;
    const dx    = agent?.diagnosis;
    const soap  = finalData?.clinician_output?.soap_note;
    const cons  = finalData?.consensus;
    if (!dx && !soap) return null;

    const confColor = cons?.aggregate_confidence >= 0.7 ? GREEN : cons?.aggregate_confidence >= 0.45 ? YELLOW : RED;

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Clinical Summary" />
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {soap?.clinical_summary_one_liner && (
                    <div style={{ padding: 14, background: BG, borderLeft: `4px solid ${ACCENT}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.6 }}>
                            {soap.clinical_summary_one_liner}
                        </p>
                    </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {dx?.top_diagnosis && (
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Top Diagnosis</p>
                            <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, margin: "0 0 2px" }}>{dx.top_diagnosis}</p>
                            <p style={{ fontSize: 10, color: MUTED, margin: 0, fontFamily: "monospace" }}>{dx.top_icd10_code}</p>
                        </div>
                    )}
                    {cons?.aggregate_confidence !== undefined && (
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Confidence</p>
                            <p style={{ fontSize: 20, fontWeight: 900, color: confColor, margin: 0, fontFamily: "monospace" }}>
                                {Math.round(cons.aggregate_confidence * 100)}%
                            </p>
                        </div>
                    )}
                    {cons?.status && (
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Consensus</p>
                            <p style={{ fontSize: 10, fontWeight: 800, color: cons.status === "FULL_CONSENSUS" ? GREEN : YELLOW, margin: 0 }}>
                                {cons.status?.replace(/_/g, " ")}
                            </p>
                            {cons.conflict_count > 0 && (
                                <p style={{ fontSize: 9, color: RED, margin: "3px 0 0" }}>{cons.conflict_count} conflict{cons.conflict_count !== 1 ? "s" : ""}</p>
                            )}
                        </div>
                    )}
                </div>
                {cons?.human_review_required && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: `${YELLOW}12`, border: `1px solid ${YELLOW}40`, borderRadius: 8 }}>
                        <AlertTriangle size={14} color={YELLOW} />
                        <p style={{ fontSize: 12, color: YELLOW, fontWeight: 700, margin: 0 }}>Human physician review required</p>
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

    const confColor = (c) => c >= 0.7 ? GREEN : c >= 0.45 ? YELLOW : RED;

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Differential Diagnosis" count={dx.differential_diagnosis?.length} />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {dx.differential_diagnosis?.map((diag, idx) => (
                    <div key={idx} style={{ border: `1px solid ${BORDER}`, background: BG, borderRadius: 8, overflow: "hidden" }}>
                        <div
                            style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                            onClick={() => setExpanded(expanded === idx ? null : idx)}
                        >
                            <span style={{ width: 22, height: 22, background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 5 }}>{diag.rank}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, margin: 0 }}>{diag.display}</p>
                                    <span style={{ fontSize: 9, color: MUTED, fontFamily: "monospace", background: SURFACE, padding: "1px 5px", border: `1px solid ${BORDER}`, borderRadius: 4 }}>{diag.icd10_code}</span>
                                </div>
                                <ConfBar value={diag.confidence} color={confColor(diag.confidence)} />
                            </div>
                            <ChevronDown size={14} color={MUTED} style={{ flexShrink: 0, transform: expanded === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                        </div>
                        {expanded === idx && (
                            <div style={{ padding: "12px 12px 12px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10 }}>
                                <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{diag.clinical_reasoning}</p>
                                {diag.supporting_evidence?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 5px" }}>Supporting</p>
                                        {diag.supporting_evidence.map((ev, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: TEXT, marginBottom: 3 }}>
                                                <CheckCircle2 size={11} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {diag.against_evidence?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 5px" }}>Against</p>
                                        {diag.against_evidence.map((ev, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: TEXT, marginBottom: 3 }}>
                                                <X size={11} color={RED} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {dx.recommended_next_steps?.length > 0 && (
                    <div style={{ marginTop: 4, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                        <SectionHeader title="Recommended Next Steps" count={dx.recommended_next_steps.length} />
                        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                            {dx.recommended_next_steps.map((step, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 10, background: BG, borderLeft: `3px solid ${CYAN}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                    <div style={{ width: 26, height: 26, background: `${CYAN}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 6 }}>
                                        {step.category === "MEDICATION" ? <Pill size={12} color={CYAN} /> : step.category === "INVESTIGATION" ? <FlaskConical size={12} color={CYAN} /> : <Clock size={12} color={CYAN} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                                            <Badge label={step.category} color={CYAN} />
                                            {step.urgency && step.urgency !== "routine" && <Badge label={step.urgency} color={RED} />}
                                        </div>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{step.description}</p>
                                        {step.drug_name && <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{step.drug_name} {step.drug_dose} {step.drug_route ? `(${step.drug_route})` : ""}</p>}
                                        {step.rationale && <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0", fontStyle: "italic" }}>{step.rationale}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {dx.reasoning_summary && (
                    <div style={{ padding: 12, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>AI Reasoning</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65 }}>{dx.reasoning_summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function LabCard({ finalData }) {
    const lab = finalData?.agent_outputs?.lab;
    if (!lab) return null;
    const summary  = lab.lab_summary || {};
    const sevColor = summary.overall_severity === "CRITICAL" ? RED : summary.overall_severity === "HIGH" ? ORANGE : summary.overall_severity === "MODERATE" ? YELLOW : GREEN;

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Lab Analysis" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    {[
                        { label: "Severity",      value: summary.overall_severity ?? "N/A", color: sevColor },
                        { label: "Total Results", value: summary.total_results ?? "-",       color: TEXT },
                        { label: "Abnormal",      value: summary.abnormal_count ?? 0,        color: summary.abnormal_count > 0 ? YELLOW : TEXT },
                        { label: "Critical",      value: summary.critical_count ?? 0,        color: summary.critical_count > 0 ? RED : TEXT },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, textAlign: "center" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>{label}</p>
                            <p style={{ fontSize: 18, fontWeight: 900, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
                        </div>
                    ))}
                </div>
                {lab.critical_alerts?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 6px" }}>Critical Alerts</p>
                        {lab.critical_alerts.map((alert, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 8, marginBottom: 6 }}>
                                <AlertCircle size={13} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>{alert.message || JSON.stringify(alert)}</p>
                            </div>
                        ))}
                    </div>
                )}
                {lab.flagged_results?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: YELLOW, margin: "0 0 6px" }}>Flagged Results</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {lab.flagged_results.map((r, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{r.display || r.test}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 12, color: TEXT, fontFamily: "monospace" }}>{r.value} {r.unit}</span>
                                        <Badge label={r.flag || "FLAG"} color={r.flag === "CRITICAL" ? RED : YELLOW} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {lab.diagnosis_confirmation?.confirms_top_diagnosis !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {lab.diagnosis_confirmation.confirms_top_diagnosis
                            ? <CheckCircle2 size={14} color={GREEN} />
                            : <X size={14} color={RED} />}
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, fontWeight: 600 }}>
                            Labs {lab.diagnosis_confirmation.confirms_top_diagnosis ? "support" : "do not support"} top diagnosis
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DrugSafetyCard({ finalData }) {
    const drug   = finalData?.agent_outputs?.drug_safety;
    if (!drug) return null;
    const isSafe = drug.safety_status === "SAFE";

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Drug Safety" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: isSafe ? `${GREEN}10` : `${RED}10`, border: `1px solid ${isSafe ? GREEN : RED}40`, borderRadius: 10 }}>
                    <ShieldCheck size={20} color={isSafe ? GREEN : RED} />
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 900, color: isSafe ? GREEN : RED, margin: 0 }}>{drug.safety_status?.replace(/_/g, " ")}</p>
                        <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                            {drug.approved_medications?.length || 0} approved · {drug.critical_interactions?.length || 0} interactions · {drug.contraindications?.length || 0} contraindications
                        </p>
                    </div>
                </div>
                {drug.approved_medications?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 6px" }}>Approved Medications</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {drug.approved_medications.map((med, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 7 }}>
                                    <CheckCircle2 size={11} color={GREEN} />
                                    <span style={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{med}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {drug.critical_interactions?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 6px" }}>Critical Interactions</p>
                        {drug.critical_interactions.map((inter, i) => (
                            <div key={i} style={{ padding: 10, background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 8, marginBottom: 6 }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: RED, margin: "0 0 2px" }}>{inter.drug_pair || inter.drug || JSON.stringify(inter)}</p>
                                {inter.description && <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{inter.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
                {drug.alternatives?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CYAN, margin: "0 0 6px" }}>Suggested Alternatives</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {drug.alternatives.map((alt, i) => (
                                <Badge key={i} label={typeof alt === "string" ? alt : alt.drug || JSON.stringify(alt)} color={CYAN} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function DigitalTwinCard({ finalData }) {
    const twin      = finalData?.agent_outputs?.digital_twin;
    if (!twin) return null;
    const sim       = twin.simulation_summary || {};
    const scenarios = twin.scenarios || [];
    const rColor    = sim.patient_risk_profile === "HIGH" ? RED : sim.patient_risk_profile === "MODERATE" ? YELLOW : GREEN;
    const baseline  = sim.baseline_risks || {};
    const costs     = twin.cost_effectiveness_summary?.scenarios || [];

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Digital Twin Simulation" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                        { label: "Risk Profile",   value: sim.patient_risk_profile || "N/A",                                                                          color: rColor },
                        { label: "30d Mortality",  value: baseline.mortality_30d  != null ? `${(baseline.mortality_30d * 100).toFixed(1)}%`  : "N/A",                 color: TEXT   },
                        { label: "30d Readmission",value: baseline.readmission_30d != null ? `${(baseline.readmission_30d * 100).toFixed(1)}%` : "N/A",               color: TEXT   },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, textAlign: "center" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>{label}</p>
                            <p style={{ fontSize: 16, fontWeight: 900, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
                        </div>
                    ))}
                </div>
                {scenarios.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>Treatment Scenarios</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {scenarios.map((sc, i) => {
                                const pred      = sc.predictions || {};
                                const isRec     = sc.option_id === sim.recommended_option;
                                const recovery7d = pred.recovery_probability_7d;
                                return (
                                    <div key={i} style={{ padding: 12, background: BG, border: `1px solid ${isRec ? ACCENT : BORDER}`, borderLeft: `4px solid ${isRec ? ACCENT : DIM}`, borderRadius: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <span style={{ width: 22, height: 22, background: isRec ? ACCENT : DIM, color: isRec ? "#fff" : MUTED, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5 }}>{sc.option_id}</span>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, flex: 1 }}>{sc.label}</p>
                                            {isRec && <Badge label="Recommended" color={ACCENT} />}
                                        </div>
                                        {recovery7d != null && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 10, color: MUTED }}>7d Recovery</span>
                                                <ConfBar value={recovery7d} color={isRec ? ACCENT : CYAN} />
                                            </div>
                                        )}
                                        {pred.mortality_30d != null && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                                                <span style={{ fontSize: 10, color: MUTED }}>30d Mortality</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>{(pred.mortality_30d * 100).toFixed(1)}%</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {costs.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>Cost-Effectiveness</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {costs.filter(c => !c.is_baseline_comparator).map((c, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{c.label}</span>
                                        <Badge label={c.cost_effective === true ? "Cost-Effective" : "Not cost-effective"} color={c.cost_effective === true ? GREEN : RED} />
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontSize: 13, fontWeight: 900, color: TEXT, margin: 0, fontFamily: "monospace" }}>${c.estimated_cost_usd?.toLocaleString()}</p>
                                        <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>${c.cost_per_qaly?.toFixed(0)}/QALY</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {twin.what_if_narrative && (
                    <div style={{ padding: 12, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>AI Narrative</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65 }}>{twin.what_if_narrative}</p>
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
        { key: "subjective", label: "S — Subjective", color: CYAN   },
        { key: "objective",  label: "O — Objective",  color: PURPLE },
        { key: "assessment", label: "A — Assessment", color: ORANGE },
    ];

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="SOAP Note" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {sections.map(({ key, label, color }) => soap[key] && (
                    <div key={key} style={{ padding: 12, background: BG, borderLeft: `3px solid ${color}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, margin: "0 0 5px" }}>{label}</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65 }}>{soap[key]}</p>
                    </div>
                ))}
                {soap.plan?.length > 0 && (
                    <div style={{ padding: 12, background: BG, borderLeft: `3px solid ${GREEN}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 8px" }}>P — Plan</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {soap.plan.map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <span style={{ width: 18, height: 18, background: `${GREEN}20`, color: GREEN, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, flexShrink: 0 }}>{i + 1}</span>
                                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.5 }}>{item}</p>
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
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Patient Explanation" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {rl && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: 18, fontWeight: 900, color: rl.acceptable ? GREEN : YELLOW, margin: 0, fontFamily: "monospace" }}>G{rl.grade_level?.toFixed(1)}</p>
                            <p style={{ fontSize: 9, color: MUTED, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Grade Level</p>
                        </div>
                        <div style={{ width: 1, height: 30, background: BORDER }} />
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: rl.acceptable ? GREEN : YELLOW, margin: 0 }}>
                                {rl.acceptable ? "✓ Reading level acceptable" : "⚠ Reading level too high"}
                            </p>
                            <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Ease score {rl.reading_ease}/100 · Target grade {rl.target}</p>
                        </div>
                    </div>
                )}
                {po.condition_explanation && (
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>Condition</p>
                        <p style={{ fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.6 }}>{po.condition_explanation}</p>
                    </div>
                )}
                {po.what_happens_next && (
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>What Happens Next</p>
                        <p style={{ fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.6 }}>{po.what_happens_next}</p>
                    </div>
                )}
                {po.what_to_expect?.length > 0 && (
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>What To Expect</p>
                        {po.what_to_expect.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                                <ChevronRight size={11} color={ACCENT} style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>{item}</p>
                            </div>
                        ))}
                    </div>
                )}
                {po.when_to_call_the_nurse?.length > 0 && (
                    <div style={{ padding: 10, background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 5px" }}>When To Call The Nurse</p>
                        {po.when_to_call_the_nurse.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                                <AlertTriangle size={11} color={RED} style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>{item}</p>
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
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Risk Attribution (SHAP)" count={shap.length} />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {ra.readmission_risk_explanation && (
                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6, padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>{ra.readmission_risk_explanation}</p>
                )}
                {shap.map((item, i) => {
                    const isReduce  = item.direction === "reduces_risk";
                    const color     = isReduce ? GREEN : RED;
                    const importance = item.importance_score || 0;
                    return (
                        <div key={i} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                {isReduce ? <TrendingDown size={13} color={GREEN} /> : <TrendingUp size={13} color={RED} />}
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, flex: 1 }}>{item.feature}</p>
                                <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{item.contribution}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 10, color: MUTED }}>Importance</span>
                                <ConfBar value={importance} color={color} />
                            </div>
                        </div>
                    );
                })}
                {ra.model_note && (
                    <p style={{ fontSize: 10, color: MUTED, margin: 0, fontStyle: "italic", padding: "6px 10px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 6 }}>{ra.model_note}</p>
                )}
            </div>
        </div>
    );
}

function MetaCard({ finalData }) {
    if (!finalData) return null;
    return (
        <div style={{ border: `1px solid ${BORDER}`, background: SURFACE, borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Run Metadata" />
            <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                    { label: "Patient ID",  value: finalData.patient_id,                                                                                              mono: true  },
                    { label: "Elapsed",     value: `${finalData.elapsed_seconds}s`,                                                                                  mono: true  },
                    { label: "Version",     value: finalData.meditwin_version,                                                                                       mono: true  },
                    { label: "Imaging",     value: finalData.imaging_performed ? "Yes" : "No"                                                                                   },
                    { label: "Timestamp",   value: finalData.analysis_timestamp ? new Date(finalData.analysis_timestamp).toLocaleTimeString() : "N/A"                           },
                    { label: "Errors",      value: finalData.error_log?.length || 0, color: finalData.error_log?.length > 0 ? RED : GREEN                                       },
                ].map(({ label, value, mono, color }) => (
                    <div key={label} style={{ padding: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 3px" }}>{label}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: color || TEXT, margin: 0, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{String(value)}</p>
                    </div>
                ))}
                {finalData.error_log?.length > 0 && (
                    <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4 }}>
                        {finalData.error_log.map((e, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: 8, background: `${YELLOW}08`, border: `1px solid ${YELLOW}30`, borderRadius: 6 }}>
                                <Info size={12} color={YELLOW} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 11, color: YELLOW, margin: 0 }}>{e}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const BREADCRUMBS = [{ label: "Dashboard", path: "/dashboard" }];

// ── Main component ────────────────────────────────────────────────────────────
export default function OrchestratorPage() {
    const navigate = useNavigate();
    const [isStreaming,  setIsStreaming]  = useState(false);
    const [streamEvents, setStreamEvents] = useState([]);
    const [liveText,     setLiveText]     = useState("");
    const [results,      setResults]      = useState({
        patient_context: null, diagnosis: null, lab_analysis: null,
        drug_safety: null, imaging_triage: null, digital_twin: null,
        consensus: null, explanation: null, final: null,
    });
    const [currentStep, setCurrentStep] = useState(null);
    const [error,       setError]       = useState(null);
    const [copied,      setCopied]      = useState(false);
    const [activeTab,   setActiveTab]   = useState("structured");

    const abortControllerRef = useRef(null);
    const eventsEndRef       = useRef(null);

    useEffect(() => {
        if (isStreaming) eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [streamEvents, isStreaming]);

    const handleReset = () => {
        setStreamEvents([]); setLiveText(""); setCurrentStep(null); setError(null); setCopied(false);
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
                    } catch { }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") { setError(err.message); setIsStreaming(false); }
        }
    };

    const eventBadgeStyle = (type) => {
        const map = {
            error:    { color: RED,    bg: `${RED}18`    },
            complete: { color: GREEN,  bg: `${GREEN}18`  },
            result:   { color: GREEN,  bg: `${GREEN}18`  },
            final:    { color: PURPLE, bg: `${PURPLE}18` },
            status:   { color: CYAN,   bg: `${CYAN}18`   },
            progress: { color: YELLOW, bg: `${YELLOW}18` },
        };
        const { color, bg } = map[type] || { color: MUTED, bg: SURFACE };
        return {
            fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 6px", borderRadius: 4, color, background: bg,
            border: `1px solid ${color}30`, fontFamily: "monospace", flexShrink: 0,
        };
    };

    const isWorking = (nodeNames) => {
        if (!isStreaming || results.final) return false;
        return nodeNames.some(n => !results[n]);
    };

    const finalData  = results.final;
    const hasResults = isStreaming || streamEvents.length > 0;

    return (
        <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{GLOBAL_STYLES}</style>

            {/* ── Sticky nav ── */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50, height: 56,
                background: "color-mix(in srgb, var(--color-bg) 90%, transparent)",
                backdropFilter: "blur(16px)", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 24px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            background: "none", border: `1px solid ${BORDER}`, color: SUBTLE,
                            borderRadius: 7, padding: "5px 12px", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                            textTransform: "uppercase", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = MUTED; }}
                        onMouseLeave={e => { e.currentTarget.style.color = SUBTLE; e.currentTarget.style.borderColor = BORDER; }}
                    >
                        <ArrowLeft size={11} /> Back
                    </button>

                    <div style={{ width: 1, height: 20, background: BORDER }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 24, height: 24, background: ACCENT, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>MT</span>
                        </div>
                        {BREADCRUMBS.map(c => (
                            <span key={c.path} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <ChevronRight size={10} color={SUBTLE} />
                                <button
                                    onClick={() => navigate(c.path)}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: SUBTLE, padding: 0, transition: "color 0.2s" }}
                                    onMouseEnter={e => e.currentTarget.style.color = TEXT}
                                    onMouseLeave={e => e.currentTarget.style.color = SUBTLE}
                                >{c.label}</button>
                            </span>
                        ))}
                        <ChevronRight size={10} color={SUBTLE} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>Orchestrator</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 7, padding: "4px 10px",
                    }}>
                        <Wifi size={10} color={ACCENT} />
                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>:8000</span>
                    </div>
                    <div style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                        padding: "4px 10px", border: `1px solid ${ACCENT}40`, borderRadius: 7,
                        color: ACCENT, background: `${ACCENT}0E`,
                    }}>A2A</div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── Agent hero ── */}
            <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${ACCENT}, ${CYAN}, ${PURPLE}, rgba(99,102,241,0.3))` }} />
                <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}0E 0%, transparent 70%)`, pointerEvents: "none" }} />

                <div style={{ maxWidth: 1500, margin: "0 auto", padding: "28px 24px", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE} 100%)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 8px 24px ${ACCENT}30`,
                        }}>
                            <Workflow size={22} color="#fff" strokeWidth={1.75} />
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT }}>Omni-Agent Pipeline</span>
                                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: ACCENT, border: `1px solid ${ACCENT}50`, background: `${ACCENT}0E`, padding: "1px 6px", borderRadius: 4 }}>A2A</span>
                                <span style={{ fontSize: 9, color: SUBTLE, fontFamily: "monospace", border: `1px solid ${BORDER}`, padding: "1px 6px", borderRadius: 4 }}>::8000</span>
                                {isStreaming && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                        <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Running
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: TEXT, margin: 0, lineHeight: 1 }}>Orchestrator Mode</h1>
                            <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0", maxWidth: 640 }}>
                                8-agent clinical pipeline · FHIR R4 · Digital Twin · Consensus arbitration · LLM narrative synthesis
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main layout ── */}
            <div style={{ maxWidth: 1500, margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, alignItems: "start" }}>

                {/* ── LEFT: Input + SSE log ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 72 }}>
                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
                        <JsonInputMode onSubmit={runOrchestrator} isStreaming={isStreaming} />
                    </div>

                    {/* SSE terminal */}
                    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: "8px 12px", background: "#111018", borderBottom: `1px solid #1E1B2E`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ display: "flex", gap: 5 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4A4466", marginLeft: 4 }}>SSE Stream Log</span>
                            </div>
                            {isStreaming && (
                                <button onClick={handleAbort} style={{
                                    padding: "2px 8px", border: `1px solid ${RED}40`, color: RED,
                                    background: `${RED}10`, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                                    textTransform: "uppercase", cursor: "pointer", borderRadius: 5,
                                    display: "flex", alignItems: "center", gap: 4,
                                }}>
                                    <X size={9} /> Abort
                                </button>
                            )}
                        </div>
                        <div style={{
                            padding: "8px 12px", height: 300, overflowY: "auto",
                            fontFamily: "monospace", fontSize: 10,
                            display: "flex", flexDirection: "column", gap: 4,
                            background: TERMINAL_BG,
                        }}>
                            {streamEvents.length === 0
                                ? <p style={{ color: "#4A4466", fontStyle: "italic", margin: 0 }}>Waiting for stream…</p>
                                : streamEvents.map((event, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingBottom: 4, borderBottom: `1px solid #1A1730` }}>
                                        <span style={eventBadgeStyle(event.type)}>{event.type}</span>
                                        <div style={{ flex: 1 }}>
                                            {event.node    && <span style={{ color: ACCENT, fontSize: 9, fontWeight: "bold" }}>{event.node?.toUpperCase()} </span>}
                                            {event.message && <span style={{ color: "#9D9DB8", fontSize: 10 }}>{event.message}</span>}
                                        </div>
                                    </div>
                                ))
                            }
                            <div ref={eventsEndRef} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Results ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* Status bar */}
                    {currentStep && (
                        <div style={{
                            padding: "10px 16px", borderRadius: 8,
                            background: results.final ? `${GREEN}18` : `${ACCENT}18`,
                            border: `1px solid ${results.final ? GREEN : ACCENT}40`,
                            display: "flex", alignItems: "center", gap: 10,
                        }}>
                            {results.final
                                ? <CheckCircle2 size={14} color={GREEN} />
                                : <Loader2 size={14} color={ACCENT} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />}
                            <span style={{ fontSize: 12, fontWeight: 600, color: results.final ? GREEN : TEXT }}>{currentStep}</span>
                            {results.final && <span style={{ fontSize: 11, color: MUTED, marginLeft: "auto" }}>{finalData?.elapsed_seconds}s total</span>}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{ padding: "10px 14px", background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 8, display: "flex", gap: 8 }}>
                            <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: RED, margin: "0 0 2px" }}>Pipeline Error</p>
                                <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Idle placeholder */}
                    {!hasResults && (
                        <div style={{ border: `1px solid ${BORDER}`, padding: "64px 32px", textAlign: "center", background: SURFACE, borderRadius: 12 }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px",
                                background: `linear-gradient(135deg, ${ACCENT}18, ${PURPLE}18)`,
                                border: `1px solid ${ACCENT}20`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Workflow size={26} color={ACCENT} strokeWidth={1.5} style={{ opacity: 0.7 }} />
                            </div>
                            <p style={{ fontSize: 15, fontWeight: 700, color: MUTED, margin: "0 0 8px" }}>Orchestrator Ready</p>
                            <p style={{ fontSize: 12, color: MUTED, margin: 0, maxWidth: 360, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                                Fill in the patient payload and press Run Orchestrator to launch all 8 agents in sequence.
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
                                {[
                                    { label: "Patient Context", color: CYAN   },
                                    { label: "Diagnosis",       color: PURPLE },
                                    { label: "Lab Analysis",    color: GREEN  },
                                    { label: "Drug Safety",     color: ORANGE },
                                    { label: "Digital Twin",    color: PINK   },
                                    { label: "Consensus",       color: INDIGO },
                                ].map(({ label, color }) => (
                                    <span key={label} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 5, color, background: `${color}12`, border: `1px solid ${color}25` }}>{label}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agent status grid */}
                    {hasResults && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                            <AgentCell title="Patient Context" icon={HeartPulse} color={CYAN}   isLoading={isWorking(["patient_context"])} data={results.patient_context}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.patient_context?.patient_state?.demographics?.name || "Data Fetched"}</p>
                                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.patient_context?.patient_state?.active_conditions?.length || 0} conditions · {results.patient_context?.patient_state?.lab_results?.length || 0} labs</p>
                            </AgentCell>
                            <AgentCell title="Diagnosis"       icon={BrainCircuit} color={PURPLE} isLoading={isWorking(["diagnosis"])}       data={results.diagnosis}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.diagnosis?.top_diagnosis || "N/A"}</p>
                                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.diagnosis?.top_icd10_code} · <span style={{ color: results.diagnosis?.confidence_level === "HIGH" ? GREEN : YELLOW }}>{results.diagnosis?.confidence_level}</span></p>
                            </AgentCell>
                            <AgentCell title="Imaging Triage"  icon={ImageIcon}    color={TEAL}   isLoading={isWorking(["imaging_triage"])}  data={results.imaging_triage}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.imaging_triage?.triage_label || results.imaging_triage?.prediction || "Analysed"}</p>
                                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.imaging_triage?.grade || ""}</p>
                            </AgentCell>
                            <AgentCell title="Lab Analysis"    icon={FlaskConical} color={GREEN}  isLoading={isWorking(["lab_analysis"])}    data={results.lab_analysis}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.lab_analysis?.lab_summary?.overall_severity || "Complete"}</p>
                                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.lab_analysis?.lab_summary?.abnormal_count || 0} abnormal · {results.lab_analysis?.lab_summary?.critical_count || 0} critical</p>
                            </AgentCell>
                            <AgentCell title="Drug Safety"     icon={Pill}         color={ORANGE} isLoading={isWorking(["drug_safety"])}     data={results.drug_safety}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: results.drug_safety?.safety_status === "SAFE" ? GREEN : RED, margin: 0 }}>{results.drug_safety?.safety_status?.replace(/_/g, " ") || "Checked"}</p>
                                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.drug_safety?.approved_medications?.length || 0} approved · {results.drug_safety?.critical_interactions?.length || 0} interactions</p>
                            </AgentCell>
                            <AgentCell title="Digital Twin"    icon={GitBranch}    color={PINK}   isLoading={isWorking(["digital_twin"])}    data={results.digital_twin}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>Option {results.digital_twin?.simulation_summary?.recommended_option || "?"} Recommended</p>
                                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.digital_twin?.simulation_summary?.patient_risk_profile || "?"} risk profile</p>
                            </AgentCell>
                            <AgentCell title="Consensus"       icon={GitMerge}     color={INDIGO} isLoading={isWorking(["consensus"])}       data={results.consensus}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.consensus?.consensus_status?.replace(/_/g, " ") || "Resolved"}</p>
                                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{Math.round((results.consensus?.aggregate_confidence || 0) * 100)}% confidence · {results.consensus?.conflict_count || 0} conflicts</p>
                            </AgentCell>
                        </div>
                    )}

                    {/* Live token stream */}
                    {(isStreaming || liveText) && !finalData && (
                        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `${ACCENT}08` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Loader2 size={12} color={ACCENT} style={{ animation: "spin 1s linear infinite" }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED }}>Live Output</span>
                                </div>
                                <button onClick={handleCopy} style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                    {copied ? <Check size={10} color={GREEN} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <div style={{ padding: 14, maxHeight: 320, overflowY: "auto", background: TERMINAL_BG }}>
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                    {liveText || "Waiting for agent output…"}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Result tabs */}
                    {(finalData || (!isStreaming && streamEvents.length > 0)) && (
                        <>
                            <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                                {[
                                    { id: "structured", label: "Structured Results", icon: BarChart3 },
                                    { id: "json",       label: "Raw JSON",           icon: FileJson  },
                                ].map(({ id, label, icon: Icon }) => (
                                    <button key={id} onClick={() => setActiveTab(id)} style={{
                                        flex: 1, padding: "10px 0", border: "none",
                                        borderBottom: activeTab === id ? `2px solid ${ACCENT}` : "2px solid transparent",
                                        background:   activeTab === id ? `${ACCENT}10` : SURFACE,
                                        color:        activeTab === id ? ACCENT : MUTED,
                                        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                        opacity: id === "structured" && !finalData ? 0.45 : 1,
                                        transition: "all 0.2s",
                                    }}>
                                        <Icon size={13} /> {label}
                                        {id === "structured" && !finalData && (
                                            <span style={{ fontSize: 8, color: MUTED, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>pending</span>
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
                                const jsonPayload = finalData ?? (() => {
                                    for (let i = streamEvents.length - 1; i >= 0; i--) {
                                        const ev = streamEvents[i];
                                        if (ev.type === "final" && ev.data) return ev.data;
                                    }
                                    return Object.fromEntries(Object.entries(results).filter(([, v]) => v !== null));
                                })();
                                const jsonText = JSON.stringify(jsonPayload, null, 2);
                                return (
                                    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
                                        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `${ACCENT}08` }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <FileJson size={13} color={GREEN} />
                                                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GREEN }}>
                                                    {finalData ? "Final Response" : "Partial Agent Outputs"}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(jsonText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                                style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
                                            >
                                                {copied ? <Check size={10} color={GREEN} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <div style={{ padding: 14, maxHeight: 700, overflowY: "auto", background: TERMINAL_BG }}>
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
