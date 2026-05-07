import { useState } from "react";
import { API } from "../../config/api";
import {
    Clock, Search, Trash2, AlertTriangle, Database,
    ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle,
    Copy, Check, Activity, ScanLine, Eye, BrainCircuit,
} from "lucide-react";

const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const CARD    = "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))";
const GREEN   = "#22C55E";
const EMERALD = "#10B981";
const RED     = "#EF4444";
const ORANGE  = "#F97316";
const YELLOW  = "#EAB308";
const PURPLE  = "#8B5CF6";
const BLUE    = "#60A5FA";

const triageColor = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "IMMEDIATE")   return RED;
    if (l === "URGENT")      return ORANGE;
    if (l === "SEMI-URGENT") return YELLOW;
    if (l === "NON-URGENT")  return GREEN;
    return SUBTLE;
};
const predictionColor = (pred) => {
    if ((pred || "").toUpperCase() === "PNEUMONIA") return RED;
    if ((pred || "").toUpperCase() === "NORMAL")    return GREEN;
    return SUBTLE;
};

function Label({ children }) {
    return (
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>
            {children}
        </p>
    );
}

function HistoryRecordCard({ record }) {
    const [expanded, setExpanded] = useState(false);

    const pred   = record.prediction || "UNKNOWN";
    const conf   = record.confidence ? (record.confidence * 100).toFixed(1) + "%" : "--";
    const tLabel = record.triage_label || "UNKNOWN";
    const pColor = predictionColor(pred);
    const tColor = triageColor(tLabel);

    return (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden", transition: "all 0.2s" }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
                    background: expanded ? `color-mix(in srgb, ${EMERALD} 4%, transparent)` : "transparent",
                }}
            >
                <div style={{ color: MUTED }}>
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                <div style={{ width: 220, flexShrink: 0 }}>
                    <p style={{ fontSize: 10, color: MUTED, margin: "0 0 3px", fontFamily: "monospace" }}>
                        #{record.id} <span style={{ color: TEXT }}>{record.request_id}</span>
                    </p>
                    <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4,
                        border: `1px solid ${pColor}40`, color: pColor, background: `${pColor}12`,
                    }}>
                        {pred} ({conf})
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 180, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, border: `1px solid ${tColor}40`, color: tColor, background: `${tColor}12` }}>
                        {tLabel}
                    </span>
                    {record.triage_priority !== null && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: tColor }}>P{record.triage_priority}</span>
                    )}
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {record.llm_enriched && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", border: `1px solid ${PURPLE}40`, color: PURPLE, background: `${PURPLE}12`, letterSpacing: "0.1em", borderRadius: 4 }}>LLM ENRICHED</span>
                    )}
                    {record.confirms_diagnosis && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", border: `1px solid ${BLUE}40`, color: BLUE, background: `${BLUE}12`, letterSpacing: "0.1em", borderRadius: 4 }}>CONFIRMS DX</span>
                    )}
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
                    {record.elapsed_ms && (
                        <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{record.elapsed_ms}ms</span>
                    )}
                    <span style={{ fontSize: 11, color: MUTED }}>{new Date(record.created_at).toLocaleString()}</span>
                </div>
            </div>

            {expanded && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: 16, background: BG, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", gap: 10 }}>
                            <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, padding: 12, borderRadius: 8 }}>
                                <Label>Triage Details</Label>
                                <p style={{ fontSize: 12, margin: "0 0 4px", color: TEXT }}>
                                    <strong style={{ color: tColor }}>Grade:</strong> {record.triage_grade || "N/A"}
                                </p>
                                <p style={{ fontSize: 12, margin: 0, color: TEXT }}>
                                    <strong>Priority:</strong> {record.triage_priority !== null ? `P${record.triage_priority}` : "N/A"}
                                </p>
                            </div>
                            <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, padding: 12, borderRadius: 8 }}>
                                <Label>Patient Context</Label>
                                <p style={{ fontSize: 12, margin: "0 0 4px", color: TEXT }}>
                                    {record.patient_age ? `${record.patient_age}y/o` : "Age unknown"} {record.patient_gender || ""}
                                </p>
                                {record.chief_complaint && (
                                    <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>CC: {record.chief_complaint}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Imaging Findings</Label>
                            {record.pattern || record.affected_area ? (
                                <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "10px 12px", borderRadius: 8 }}>
                                    {record.pattern && <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 4px", color: TEXT }}>{record.pattern}</p>}
                                    {record.affected_area && <p style={{ fontSize: 11, color: MUTED, margin: "0 0 4px" }}>Area: {record.affected_area}</p>}
                                    {record.bilateral && <span style={{ fontSize: 9, fontWeight: 700, background: `${ORANGE}20`, color: ORANGE, padding: "2px 6px", borderRadius: 4 }}>BILATERAL</span>}
                                </div>
                            ) : (
                                <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic", margin: 0 }}>No structured findings recorded.</p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                            <Label>Clinical Interpretation</Label>
                            {record.clinical_interpretation ? (
                                <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.55, padding: 12, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                    {record.clinical_interpretation}
                                </p>
                            ) : (
                                <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic", margin: 0 }}>No interpretation provided.</p>
                            )}
                        </div>

                        {record.fhir_diagnostic_report && (
                            <div>
                                <Label>FHIR Conclusion</Label>
                                <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic", margin: 0, padding: "8px 12px", background: `${PURPLE}08`, borderLeft: `3px solid ${PURPLE}`, borderRadius: 4 }}>
                                    {record.fhir_diagnostic_report.conclusion || "No conclusion in FHIR report."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ImagingTriageHistory({ defaultPatientId = "" }) {
    const [activeTab, setActiveTab] = useState("get");
    const [patientId, setPatientId] = useState(defaultPatientId);
    const [endpoint,  setEndpoint]  = useState("/history/{patient_id}");
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState(null);
    const [data,      setData]      = useState(null);

    const ENDPOINTS = [
        { id: "get",     path: "/history/{patient_id}",         label: "All Records",   method: "GET" },
        { id: "latest",  path: "/history/{patient_id}/latest",  label: "Latest",        method: "GET" },
        { id: "request", path: "/history/request/{patient_id}", label: "By Request",    method: "GET" },
        { id: "stats",   path: "/history/stats/{patient_id}",   label: "Stats",         method: "GET" },
        { id: "delete",  path: "/history/{patient_id}",         label: "Delete All",    method: "DELETE" },
    ];

    const runQuery = async () => {
        if (!patientId.trim()) { setError("Patient ID / Request ID is required"); return; }
        setLoading(true); setError(null); setData(null);

        const url    = `${API.IMAGING_TRIAGE}${endpoint.replace("{patient_id}", patientId).replace("{id}", patientId)}`;
        const method = activeTab === "delete" ? "DELETE" : "GET";
        const headers = method === "DELETE" ? { "X-Internal-Token": "meditwin-internal" } : {};

        try {
            const res  = await fetch(url, { method, headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || `HTTP ${res.status}`);
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", padding: "9px 12px", background: SURFACE,
        border: `1px solid ${BORDER}`, color: TEXT, outline: "none",
        fontFamily: "monospace", fontSize: 13, borderRadius: 8,
        transition: "border-color 0.2s",
    };

    return (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: `${EMERALD}15`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ScanLine size={16} color={EMERALD} />
                </div>
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: TEXT }}>Imaging Triage History</h2>
                    <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Query the /history endpoints on the Imaging Triage Agent (Port 8005)</p>
                </div>
            </div>

            {/* Endpoint tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, padding: "0 10px", gap: 4, overflowX: "auto" }}>
                {ENDPOINTS.map(ep => (
                    <button
                        key={ep.id}
                        onClick={() => { setActiveTab(ep.id); setEndpoint(ep.path); setData(null); setError(null); }}
                        style={{
                            padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 8,
                            borderBottom: activeTab === ep.id ? `2px solid ${EMERALD}` : "2px solid transparent",
                            opacity: activeTab === ep.id ? 1 : 0.6, transition: "all 0.15s",
                        }}
                    >
                        <span style={{
                            fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 3,
                            background: ep.method === "GET" ? `${YELLOW}20` : `${RED}20`,
                            color: ep.method === "GET" ? YELLOW : RED,
                        }}>{ep.method}</span>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: TEXT }}>{ep.path}</span>
                    </button>
                ))}
            </div>

            {/* Search bar */}
            <div style={{ padding: "16px 20px", display: "flex", gap: 12, background: BG, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ flex: 1 }}>
                    <Label>{endpoint.includes("request") ? "Request ID" : "Patient ID"}</Label>
                    <input
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                        placeholder="e.g. patient-x-ray-001"
                        style={inputStyle}
                        onKeyDown={e => e.key === "Enter" && runQuery()}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                        onClick={runQuery}
                        disabled={loading}
                        style={{
                            height: 42, padding: "0 24px",
                            background: loading ? BORDER : activeTab === "delete" ? RED : EMERALD,
                            border: "none", color: "#fff", borderRadius: 8,
                            fontSize: 12, fontWeight: 800, letterSpacing: "0.1em",
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 8,
                            transition: "all 0.2s",
                            boxShadow: loading ? "none" : `0 4px 14px ${activeTab === "delete" ? RED : EMERALD}35`,
                        }}
                    >
                        {loading
                            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading...</>
                            : activeTab === "delete"
                                ? <><Trash2 size={14} /> Delete</>
                                : <><Search size={14} /> Query</>}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div style={{ padding: 20, minHeight: 200, background: BG }}>
                {error && (
                    <div style={{ padding: 16, background: `${RED}10`, border: `1px solid ${RED}30`, borderRadius: 8, display: "flex", gap: 12, color: RED }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <div>
                            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Error</p>
                            <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
                        </div>
                    </div>
                )}

                {!error && !data && !loading && (
                    <div style={{ textAlign: "center", padding: "48px 0", color: MUTED }}>
                        <Database size={32} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
                        <p style={{ margin: 0, fontSize: 13 }}>Enter an ID and query to fetch history data.</p>
                    </div>
                )}

                {loading && (
                    <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <Loader2 size={18} color={EMERALD} style={{ animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: 12, color: MUTED }}>Fetching...</span>
                    </div>
                )}

                {data && activeTab === "delete" && (
                    <div style={{ padding: 16, background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 8, color: GREEN, display: "flex", gap: 12 }}>
                        <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                        <div>
                            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Success</p>
                            <p style={{ margin: 0, fontSize: 13 }}>Deleted {data.deleted_records} records for {data.patient_id}.</p>
                        </div>
                    </div>
                )}

                {data && (activeTab === "get" || activeTab === "latest" || activeTab === "request") && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <Label>{data.records ? `${data.total_records} Records for ${data.patient_id}` : "1 Record Found"}</Label>
                            {data.records && <span style={{ fontSize: 11, color: MUTED }}>showing {data.records.length}</span>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {data.records
                                ? data.records.map(rec => <HistoryRecordCard key={rec.id} record={rec} />)
                                : <HistoryRecordCard record={data} />}
                        </div>
                    </div>
                )}

                {data && activeTab === "stats" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: 20, borderRadius: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 36, height: 36, background: `${EMERALD}20`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ScanLine size={18} color={EMERALD} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: MUTED, margin: 0, textTransform: "uppercase" }}>Total Scans Analyzed</p>
                                    <p style={{ fontSize: 26, fontWeight: 900, color: TEXT, margin: 0 }}>{data.total_scans}</p>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div style={{ padding: 12, background: `${RED}10`, border: `1px solid ${RED}20`, borderRadius: 8 }}>
                                    <p style={{ fontSize: 10, color: RED, fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase" }}>Pneumonia</p>
                                    <p style={{ fontSize: 20, color: RED, fontWeight: 800, margin: 0 }}>{data.pneumonia_detected}</p>
                                </div>
                                <div style={{ padding: 12, background: `${GREEN}10`, border: `1px solid ${GREEN}20`, borderRadius: 8 }}>
                                    <p style={{ fontSize: 10, color: GREEN, fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase" }}>Normal</p>
                                    <p style={{ fontSize: 20, color: GREEN, fontWeight: 800, margin: 0 }}>{data.normal_detected}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: 20, borderRadius: 10 }}>
                            <Label>Triage Priority Breakdown</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                                {Object.entries(data.triage_breakdown || {}).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: triageColor(label), width: 90 }}>{label}</span>
                                        <div style={{ flex: 1, height: 8, background: BG, borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ width: `${(count / data.total_scans) * 100}%`, height: "100%", background: triageColor(label), borderRadius: 4 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: TEXT, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: 20, borderRadius: 10 }}>
                            <Label>Severity Grades</Label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                                {Object.entries(data.grade_breakdown || {}).map(([grade, count]) => {
                                    const cols = { SEVERE: RED, MODERATE: YELLOW, MILD: GREEN, NORMAL: SUBTLE };
                                    const col  = cols[grade] || SUBTLE;
                                    return (
                                        <div key={grade} style={{ flex: "1 1 calc(50% - 5px)", border: `1px solid ${BORDER}`, padding: 10, background: BG, borderRadius: 8 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: col, margin: "0 0 2px", textTransform: "uppercase" }}>{grade}</p>
                                            <p style={{ fontSize: 18, fontWeight: 800, color: TEXT, margin: 0 }}>{count}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: 20, borderRadius: 10 }}>
                            <Label>AI Performance</Label>
                            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: MUTED }}>LLM Enriched Scans</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{data.llm_enriched_count}</span>
                                </div>
                                {data.avg_confidence !== null && (
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: 8 }}>
                                        <span style={{ fontSize: 12, color: MUTED }}>Avg. CNN Confidence</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: EMERALD }}>{(data.avg_confidence * 100).toFixed(1)}%</span>
                                    </div>
                                )}
                                {data.first_scan && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: 12, color: MUTED }}>Date Range</span>
                                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                                            {data.first_scan?.split("T")[0]} → {data.latest_scan?.split("T")[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
