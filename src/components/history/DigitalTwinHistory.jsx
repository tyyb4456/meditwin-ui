import { useState } from "react";
import {
    Clock, Search, Trash2, Database, AlertTriangle, ChevronDown, ChevronRight,
    Loader2, Activity, GitBranch, ShieldAlert, TrendingUp, TrendingDown,
    Zap, Target, HeartPulse
} from "lucide-react";

const C = {
    bg: "var(--color-bg)",
    panel: "var(--color-surface)",
    card: "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))",
    border: "var(--color-border)",
    accent: "#3b82f6", // blue
    green: "#22C55E",
    yellow: "#EAB308",
    red: "#EF4444",
    cyan: "#06B6D4",
    orange: "#F97316",
    blue: "#60A5FA",
    purple: "#8b5cf6",
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
};

const riskColor = (level) => {
    const l = (level || "").toUpperCase();
    if (l === "CRITICAL" || l === "HIGH") return C.red;
    if (l === "MODERATE") return C.yellow;
    if (l === "LOW" || l === "SAFE") return C.green;
    return C.muted;
};

// ── Components ───────────────────────────────────────────────────────────────

const Label = ({ children }) => (
    <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
        color: C.muted, margin: "0 0 6px"
    }}>{children}</p>
);

function HistoryRecordCard({ record }) {
    const [expanded, setExpanded] = useState(false);
    
    const risk = record.patient_risk_profile || "UNKNOWN";
    const rColor = riskColor(risk);
    
    const fmtPct = (val) => val != null ? `${(val * 100).toFixed(1)}%` : "--";

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
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: 280, flexShrink: 0 }}>
                    <div style={{ color: C.muted }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    <div>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 2px", fontFamily: "monospace" }}>
                            #{record.id} <span style={{ color: C.text }}>{record.request_id}</span>
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                            {record.diagnosis}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 140, flexShrink: 0 }}>
                     <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 6px",
                        border: `1px solid ${rColor}40`, color: rColor, background: `${rColor}12`
                    }}>
                        {risk} RISK
                    </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Target size={12} color={C.accent} />
                        <span style={{ fontSize: 11, color: C.muted }}>Rec: Option <strong style={{ color: C.text }}>{record.recommended_option}</strong></span>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: C.accent }}>({fmtPct(record.recommendation_confidence)})</span>
                    </div>
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
                                <Label>Baseline Risks (30d)</Label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                                    <div>
                                        <p style={{ fontSize: 9, color: C.muted, margin: "0 0 2px", textTransform: "uppercase" }}>Mortality</p>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: C.red, margin: 0, fontFamily: "monospace" }}>
                                            {fmtPct(record.baseline_mortality_30d)}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 9, color: C.muted, margin: "0 0 2px", textTransform: "uppercase" }}>Readmission</p>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: C.orange, margin: 0, fontFamily: "monospace" }}>
                                            {fmtPct(record.baseline_readmission_30d)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, padding: "12px" }}>
                                <Label>Model Info</Label>
                                <p style={{ fontSize: 12, margin: "0 0 4px", color: C.text }}>
                                    <strong>Confidence:</strong> <span style={{ color: riskColor(record.model_confidence === "HIGH" ? "LOW" : "HIGH") }}>{record.model_confidence}</span>
                                </p>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Simulated {record.treatment_options_count} treatments.</p>
                            </div>
                        </div>

                        <div>
                            <Label>What-If Narrative (LLM)</Label>
                            {record.what_if_narrative ? (
                                <p style={{ fontSize: 11, color: C.text, margin: 0, lineHeight: 1.5, padding: "10px", background: C.card, border: `1px solid ${C.border}` }}>
                                    {record.what_if_narrative}
                                </p>
                            ) : (
                                <p style={{ fontSize: 11, color: C.muted, fontStyle: "italic", margin: 0 }}>No narrative provided.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Col */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <Label>Scenarios Output ({record.scenarios?.length || 0})</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {record.scenarios?.map((scen, i) => {
                                    const isRec = scen.option_id === record.recommended_option;
                                    return (
                                        <div key={i} style={{ padding: "8px 10px", background: isRec ? `${C.accent}10` : C.card, border: `1px solid ${isRec ? C.accent : C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 20, height: 20, background: isRec ? C.accent : C.bg, border: `1px solid ${isRec ? C.accent : C.border}`, color: isRec ? "#fff" : C.muted, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {scen.option_id}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 11, color: C.text, margin: "0 0 2px", fontWeight: isRec ? 700 : 400 }}>{scen.label || "Unnamed"}</p>
                                                {scen.predictions && (
                                                    <p style={{ fontSize: 9, color: C.muted, margin: 0, fontFamily: "monospace" }}>
                                                        Mortality: {fmtPct(scen.predictions.mortality_risk_30d)} | 
                                                        Recovery (7d): {fmtPct(scen.predictions.recovery_probability_7d)}
                                                    </p>
                                                )}
                                            </div>
                                            {isRec && <Target size={14} color={C.accent} />}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}

export default function DigitalTwinHistory({ defaultPatientId = "" }) {
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

        let url = `http://127.0.0.1:8006${endpoint.replace("{patient_id}", patientId).replace("{id}", patientId)}`;
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
                    <GitBranch size={16} color={C.accent} />
                </div>
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: C.text }}>Digital Twin Simulation History</h2>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Query the /history endpoints on the Digital Twin Agent (Port 8006)</p>
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
                        key={ep.id}
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
                        placeholder="e.g. test-dt-001"
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
                                    <GitBranch size={18} color={C.accent} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: C.muted, margin: 0 }}>Total Simulations</p>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>{data.total_simulations}</p>
                                </div>
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                                <div style={{ padding: 12, background: `${C.red}10`, border: `1px solid ${C.red}20` }}>
                                    <p style={{ fontSize: 10, color: C.red, fontWeight: 700, margin: "0 0 4px" }}>Avg Mortality Risk</p>
                                    <p style={{ fontSize: 18, color: C.red, fontWeight: 800, margin: 0, fontFamily: "monospace" }}>
                                        {(data.average_mortality_risk * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div style={{ padding: 12, background: `${C.orange}10`, border: `1px solid ${C.orange}20` }}>
                                    <p style={{ fontSize: 10, color: C.orange, fontWeight: 700, margin: "0 0 4px" }}>Avg Readmission</p>
                                    <p style={{ fontSize: 18, color: C.orange, fontWeight: 800, margin: 0, fontFamily: "monospace" }}>
                                        {(data.average_readmission_risk * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>Risk Profile Breakdown</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                {Object.entries(data.risk_profile_breakdown || {}).sort((a,b) => b[1] - a[1]).map(([label, count]) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: riskColor(label), width: 90 }}>{label}</span>
                                        <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ width: `${(count / data.total_simulations) * 100}%`, height: "100%", background: riskColor(label) }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: C.text, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>Recommendation Trends</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                {Object.entries(data.recommendation_trends || {}).sort((a,b) => b[1] - a[1]).map(([label, count]) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, width: 20 }}>{label}</span>
                                        <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ width: `${(count / data.total_simulations) * 100}%`, height: "100%", background: C.accent }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: C.text, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: 11, color: C.muted, margin: "12px 0 0", fontStyle: "italic" }}>
                                Most common: {data.most_recommended_option}
                            </p>
                        </div>

                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>Model Performance</Label>
                            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: C.muted }}>Avg Recommendation Confidence</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>
                                        {(data.average_recommendation_confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: C.muted }}>Unique Diagnoses Analyzed</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{data.unique_diagnoses}</span>
                                </div>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>
                                    Most common: {data.most_common_diagnosis?.split(" (")[0]}
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
