import { useState } from "react";
import {
    Clock, Search, Trash2, Database, AlertTriangle, Shield,
    ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle,
    Copy, Check, Activity, ScanLine, Eye, BrainCircuit
} from "lucide-react";

const C = {
    bg: "var(--color-bg)",
    panel: "var(--color-surface)",
    card: "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))",
    border: "var(--color-border)",
    accent: "#10b981", // emerald
    green: "#22C55E",
    yellow: "#EAB308",
    red: "#EF4444",
    cyan: "#06B6D4",
    orange: "#F97316",
    blue: "#60A5FA",
    purple: "#8b5cf6",
    emerald: "#10b981",
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
};

const triageColor = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "IMMEDIATE") return C.red;
    if (l === "URGENT") return C.orange;
    if (l === "SEMI-URGENT") return C.yellow;
    if (l === "NON-URGENT") return C.green;
    return C.muted;
};

const predictionColor = (pred) => {
    if ((pred || "").toUpperCase() === "PNEUMONIA") return C.red;
    if ((pred || "").toUpperCase() === "NORMAL") return C.green;
    return C.muted;
};

// ── Components ───────────────────────────────────────────────────────────────

const Label = ({ children }) => (
    <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
        color: C.muted, margin: "0 0 6px"
    }}>{children}</p>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1, padding: "10px 0", border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: active ? `${C.accent}15` : "transparent",
            color: active ? C.accent : C.muted,
            borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
            transition: "all 0.2s",
        }}
    >
        {Icon && <Icon size={12} />} {label}
    </button>
);

function HistoryRecordCard({ record }) {
    const [expanded, setExpanded] = useState(false);
    
    const pred = record.prediction || "UNKNOWN";
    const conf = record.confidence ? ((record.confidence) * 100).toFixed(1) + "%" : "--";
    const tLabel = record.triage_label || "UNKNOWN";
    const pColor = predictionColor(pred);
    const tColor = triageColor(tLabel);

    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            overflow: "hidden", transition: "all 0.2s"
        }}>
            {/* Header / Summary row */}
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
                    background: expanded ? `color-mix(in srgb, ${C.accent} 4%, transparent)` : "transparent"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: 240, flexShrink: 0 }}>
                    <div style={{ color: C.muted }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    <div>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 2px", fontFamily: "monospace" }}>
                            #{record.id} <span style={{ color: C.text }}>{record.request_id}</span>
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                                fontSize: 10, fontWeight: 800, padding: "2px 6px",
                                border: `1px solid ${pColor}40`, color: pColor, background: `${pColor}12`
                            }}>
                                {pred} ({conf})
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 180, flexShrink: 0 }}>
                     <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 6px",
                        border: `1px solid ${tColor}40`, color: tColor, background: `${tColor}12`
                    }}>
                        {tLabel}
                    </span>
                    {record.triage_priority !== null && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: tColor }}>P{record.triage_priority}</span>
                    )}
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    {record.llm_enriched && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 6px", border: `1px solid ${C.purple}40`,
                            color: C.purple, background: `${C.purple}12`, letterSpacing: "0.1em"
                        }}>LLM ENRICHED</span>
                    )}
                    {record.confirms_diagnosis && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 6px", border: `1px solid ${C.blue}40`,
                            color: C.blue, background: `${C.blue}12`, letterSpacing: "0.1em"
                        }}>CONFIRMS DX</span>
                    )}
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
                    {record.elapsed_ms && (
                        <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{record.elapsed_ms}ms</span>
                    )}
                    <span style={{ fontSize: 11, color: C.muted }}>{new Date(record.created_at).toLocaleString()}</span>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px", background: C.bg, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    
                    {/* Left Col */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        
                        <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, padding: "12px" }}>
                                <Label>Triage Details</Label>
                                <p style={{ fontSize: 12, margin: "0 0 4px", color: C.text }}>
                                    <strong style={{ color: tColor }}>Grade:</strong> {record.triage_grade || "N/A"}
                                </p>
                                <p style={{ fontSize: 12, margin: 0, color: C.text }}>
                                    <strong>Priority:</strong> {record.triage_priority !== null ? `P${record.triage_priority}` : "N/A"}
                                </p>
                            </div>
                            <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, padding: "12px" }}>
                                <Label>Patient Context</Label>
                                <p style={{ fontSize: 12, margin: "0 0 4px", color: C.text }}>
                                    {record.patient_age ? `${record.patient_age}y/o` : "Age unknown"} {record.patient_gender ? record.patient_gender : "gender unknown"}
                                </p>
                                {record.chief_complaint && (
                                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>CC: {record.chief_complaint}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Imaging Findings</Label>
                            {record.pattern || record.affected_area ? (
                                <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
                                    {record.pattern && <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 4px", color: C.text }}>{record.pattern}</p>}
                                    {record.affected_area && <p style={{ fontSize: 11, color: C.muted, margin: "0 0 4px" }}>Area: {record.affected_area}</p>}
                                    {record.bilateral && <span style={{ fontSize: 9, fontWeight: 700, background: `${C.orange}20`, color: C.orange, padding: "2px 6px" }}>BILATERAL</span>}
                                </div>
                            ) : (
                                <p style={{ fontSize: 11, color: C.muted, fontStyle: "italic", margin: 0 }}>No structured findings recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Col */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <Label>Clinical Interpretation</Label>
                            {record.clinical_interpretation ? (
                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5, padding: "10px", background: C.card, border: `1px solid ${C.border}` }}>
                                    {record.clinical_interpretation}
                                </p>
                            ) : (
                                <p style={{ fontSize: 11, color: C.muted, fontStyle: "italic", margin: 0 }}>No interpretation provided.</p>
                            )}
                        </div>

                        {record.fhir_diagnostic_report && (
                            <div>
                                <Label>FHIR Conclusion</Label>
                                <p style={{ fontSize: 11, color: C.muted, fontStyle: "italic", margin: 0, padding: "8px 10px", background: `${C.purple}08`, borderLeft: `2px solid ${C.purple}` }}>
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
    const [endpoint, setEndpoint] = useState("/history/{patient_id}");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const runQuery = async () => {
        if (!patientId.trim()) {
            setError("Patient ID / Request ID is required");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        let url = `http://127.0.0.1:8005${endpoint.replace("{patient_id}", patientId).replace("{id}", patientId)}`;
        let method = activeTab === "delete" ? "DELETE" : "GET";
        let headers = {};

        if (method === "DELETE") {
            headers["X-Internal-Token"] = "meditwin-internal";
        }

        try {
            const res = await fetch(url, { method, headers });
            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || `HTTP ${res.status}`);
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: `${C.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                    <ScanLine size={16} color={C.accent} />
                </div>
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: C.text }}>Imaging Triage History</h2>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Query the /history endpoints on the Imaging Triage Agent (Port 8005)</p>
                </div>
            </div>

            {/* Endpoints */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 10px", gap: 4, overflowX: "auto" }}>
                {[
                    { id: "get", path: "/history/{id}", label: "All Records", method: "GET" },
                    { id: "latest", path: "/history/{id}/latest", label: "Latest Record", method: "GET" },
                    { id: "request", path: "/history/request/{id}", label: "By Request", method: "GET" },
                    { id: "stats", path: "/history/stats/{id}", label: "Stats", method: "GET" },
                    { id: "delete", path: "/history/{id}", label: "Delete All", method: "DELETE" },
                ].map(ep => (
                    <button
                        key={ep.path}
                        onClick={() => { setActiveTab(ep.id); setEndpoint(ep.path); }}
                        style={{
                            padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 8,
                            borderBottom: activeTab === ep.id ? `2px solid ${C.accent}` : "2px solid transparent",
                            opacity: activeTab === ep.id ? 1 : 0.6,
                        }}
                    >
                        <span style={{
                            fontSize: 9, fontWeight: 800, padding: "2px 4px", borderRadius: 2,
                            background: ep.method === "GET" ? `${C.yellow}20` : `${C.red}20`,
                            color: ep.method === "GET" ? C.yellow : C.red,
                        }}>{ep.method}</span>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: C.text }}>{ep.path}</span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div style={{ padding: "16px 20px", display: "flex", gap: 12, background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                    <Label>{endpoint.includes("request") ? "REQUEST ID" : "PATIENT ID"}</Label>
                    <input
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                        placeholder="e.g. patient-x-ray-001"
                        style={{
                            width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.border}`,
                            color: C.text, outline: "none", fontFamily: "monospace", fontSize: 13
                        }}
                        onKeyDown={e => e.key === "Enter" && runQuery()}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                        onClick={runQuery}
                        disabled={loading}
                        style={{
                            height: 40, padding: "0 24px", background: C.accent, border: "none", color: "#fff",
                            fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.8 : 1
                        }}
                    >
                        {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
                        QUERY
                    </button>
                </div>
            </div>

            {/* Results Area */}
            <div style={{ padding: 20, minHeight: 200, background: C.bg }}>
                {error && (
                    <div style={{ padding: 16, background: `${C.red}10`, border: `1px solid ${C.red}30`, display: "flex", gap: 12, color: C.red }}>
                        <AlertTriangle size={18} />
                        <div>
                            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Error</p>
                            <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
                        </div>
                    </div>
                )}

                {!error && !data && !loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                        <Database size={32} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
                        <p style={{ margin: 0, fontSize: 13 }}>Enter an ID and query to fetch history data.</p>
                    </div>
                )}

                {data && activeTab === "delete" && (
                    <div style={{ padding: 16, background: `${C.green}10`, border: `1px solid ${C.green}30`, color: C.green, display: "flex", gap: 12 }}>
                        <Trash2 size={18} />
                        <div>
                            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Success</p>
                            <p style={{ margin: 0, fontSize: 13 }}>Deleted {data.deleted_records} records for {data.patient_id}.</p>
                        </div>
                    </div>
                )}

                {data && (activeTab === "get" || activeTab === "latest" || activeTab === "request") && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <Label>{data.records ? `${data.total_records} RECORDS FOR ${data.patient_id}` : "1 RECORD FOUND"}</Label>
                            {data.records && <span style={{ fontSize: 11, color: C.muted }}>showing {data.records.length}</span>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {data.records
                                ? data.records.map((rec) => <HistoryRecordCard key={rec.id} record={rec} />)
                                : <HistoryRecordCard record={data} />
                            }
                        </div>
                    </div>
                )}

                {data && activeTab === "stats" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                                    <ScanLine size={18} color={C.accent} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: C.muted, margin: 0 }}>Total Scans analyzed</p>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>{data.total_scans}</p>
                                </div>
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                                <div style={{ padding: 12, background: `${C.red}10`, border: `1px solid ${C.red}20` }}>
                                    <p style={{ fontSize: 10, color: C.red, fontWeight: 700, margin: "0 0 4px" }}>PNEUMONIA</p>
                                    <p style={{ fontSize: 18, color: C.red, fontWeight: 800, margin: 0 }}>{data.pneumonia_detected}</p>
                                </div>
                                <div style={{ padding: 12, background: `${C.green}10`, border: `1px solid ${C.green}20` }}>
                                    <p style={{ fontSize: 10, color: C.green, fontWeight: 700, margin: "0 0 4px" }}>NORMAL</p>
                                    <p style={{ fontSize: 18, color: C.green, fontWeight: 800, margin: 0 }}>{data.normal_detected}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>Triage Priority Breakdown</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                {Object.entries(data.triage_breakdown || {}).sort((a,b) => b[1] - a[1]).map(([label, count]) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: triageColor(label), width: 90 }}>{label}</span>
                                        <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ width: `${(count / data.total_scans) * 100}%`, height: "100%", background: triageColor(label) }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: C.text, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>Severity Grades</Label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
                                {Object.entries(data.grade_breakdown || {}).map(([grade, count]) => {
                                    const colors = { SEVERE: C.red, MODERATE: C.yellow, MILD: C.green, NORMAL: C.muted };
                                    const col = colors[grade] || C.muted;
                                    return (
                                        <div key={grade} style={{ flex: "1 1 calc(50% - 6px)", border: `1px solid ${C.border}`, padding: "10px", background: C.bg }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: col, margin: "0 0 2px" }}>{grade}</p>
                                            <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>{count}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>AI Performance</Label>
                            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: C.muted }}>LLM Enriched Scans</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{data.llm_enriched_count}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: C.muted }}>Avg Tokens / Scan</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{data.avg_llm_tokens || "--"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: C.muted }}>Confirmed Diagnosis</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{data.diagnosis_confirmed_count}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
