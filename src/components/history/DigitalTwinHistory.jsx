import { useState } from "react";
import { API } from "../../config/api";
import {
    Clock, Search, Trash2, Database, AlertTriangle, ChevronDown, ChevronRight,
    Loader2, Activity, GitBranch, Target, TrendingUp, DollarSign, BarChart2
} from "lucide-react";

// ── Color tokens ──────────────────────────────────────────────────────────────
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-subtle)";
const BLUE    = "#3B82F6";
const GREEN   = "#22C55E";
const YELLOW  = "#EAB308";
const RED     = "#EF4444";
const ORANGE  = "#F97316";
const CYAN    = "#06B6D4";

const CARD_BG = "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))";

const riskColor = (level) => {
    const l = (level || "").toUpperCase();
    if (l === "CRITICAL" || l === "HIGH") return RED;
    if (l === "MODERATE")                 return YELLOW;
    if (l === "LOW" || l === "SAFE")      return GREEN;
    return MUTED;
};

function Label({ children }) {
    return (
        <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
            color: MUTED, margin: "0 0 6px",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
        }}>{children}</p>
    );
}

function HistoryRecordCard({ record }) {
    const [expanded, setExpanded] = useState(false);

    const risk   = record.patient_risk_profile || "UNKNOWN";
    const rColor = riskColor(risk);
    const fmtPct = (val) => val != null ? `${(val * 100).toFixed(1)}%` : "--";

    return (
        <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 10, overflow: "hidden", transition: "all 0.2s",
        }}>
            {/* Summary row */}
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: "12px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 16,
                    background: expanded ? `${BLUE}08` : "transparent",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: 280, flexShrink: 0 }}>
                    <div style={{ color: MUTED }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    <div>
                        <p style={{ fontSize: 10, color: MUTED, margin: "0 0 2px", fontFamily: "monospace" }}>
                            #{record.id} <span style={{ color: TEXT }}>{record.request_id}</span>
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: TEXT, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                            {record.diagnosis}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, width: 140, flexShrink: 0 }}>
                    <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 6,
                        border: `1px solid ${rColor}40`, color: rColor, background: `${rColor}12`,
                    }}>
                        {risk} RISK
                    </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Target size={12} color={BLUE} />
                        <span style={{ fontSize: 11, color: MUTED }}>Rec: Option <strong style={{ color: TEXT }}>{record.recommended_option}</strong></span>
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: BLUE }}>({fmtPct(record.recommendation_confidence)})</span>
                    </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
                    {record.elapsed_ms && (
                        <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{record.elapsed_ms}ms</span>
                    )}
                    <span style={{ fontSize: 11, color: MUTED }}>{new Date(record.created_at).toLocaleString()}</span>
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: 16, background: BG, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

                    {/* Left col */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ flex: 1, background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12 }}>
                                <Label>Baseline Risks (30d)</Label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                                    <div>
                                        <p style={{ fontSize: 9, color: MUTED, margin: "0 0 2px", textTransform: "uppercase" }}>Mortality</p>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: RED, margin: 0, fontFamily: "monospace" }}>
                                            {fmtPct(record.baseline_mortality_30d)}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 9, color: MUTED, margin: "0 0 2px", textTransform: "uppercase" }}>Readmission</p>
                                        <p style={{ fontSize: 13, fontWeight: 800, color: ORANGE, margin: 0, fontFamily: "monospace" }}>
                                            {fmtPct(record.baseline_readmission_30d)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12 }}>
                                <Label>Model Info</Label>
                                <p style={{ fontSize: 12, margin: "0 0 4px", color: TEXT }}>
                                    <strong>Confidence:</strong>{" "}
                                    <span style={{ color: riskColor(record.model_confidence === "HIGH" ? "LOW" : "HIGH") }}>{record.model_confidence}</span>
                                </p>
                                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Simulated {record.treatment_options_count} treatments.</p>
                            </div>
                        </div>

                        <div>
                            <Label>What-If Narrative (LLM)</Label>
                            {record.what_if_narrative ? (
                                <p style={{ fontSize: 11, color: TEXT, margin: 0, lineHeight: 1.5, padding: 10, background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                    {record.what_if_narrative}
                                </p>
                            ) : (
                                <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic", margin: 0 }}>No narrative provided.</p>
                            )}
                        </div>
                    </div>

                    {/* Right col */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <Label>Scenarios Output ({record.scenarios?.length || 0})</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {record.scenarios?.map((scen, i) => {
                                    const isRec = scen.option_id === record.recommended_option;
                                    return (
                                        <div key={i} style={{
                                            padding: "8px 10px", background: isRec ? `${BLUE}10` : CARD_BG,
                                            border: `1px solid ${isRec ? BLUE : BORDER}`,
                                            borderRadius: 8, display: "flex", alignItems: "center", gap: 12,
                                        }}>
                                            <div style={{
                                                width: 22, height: 22, borderRadius: 6,
                                                background: isRec ? BLUE : BG,
                                                border: `1px solid ${isRec ? BLUE : BORDER}`,
                                                color: isRec ? "#fff" : MUTED,
                                                fontSize: 11, fontWeight: 900,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                {scen.option_id}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 11, color: TEXT, margin: "0 0 2px", fontWeight: isRec ? 700 : 400 }}>{scen.label || "Unnamed"}</p>
                                                {scen.predictions && (
                                                    <p style={{ fontSize: 9, color: MUTED, margin: 0, fontFamily: "monospace" }}>
                                                        Mortality: {fmtPct(scen.predictions.mortality_risk_30d)} | Recovery (7d): {fmtPct(scen.predictions.recovery_probability_7d)}
                                                    </p>
                                                )}
                                            </div>
                                            {isRec && <Target size={14} color={BLUE} />}
                                        </div>
                                    );
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
    const [activeTab,  setActiveTab]  = useState("get");
    const [patientId,  setPatientId]  = useState(defaultPatientId);
    const [endpoint,   setEndpoint]   = useState("/history/{patient_id}");
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState(null);
    const [data,       setData]       = useState(null);

    const ENDPOINTS = [
        { id: "get",     path: "/history/{patient_id}",         label: "All Records",   method: "GET"    },
        { id: "latest",  path: "/history/{patient_id}/latest",  label: "Latest Record", method: "GET"    },
        { id: "request", path: "/history/request/{id}",         label: "By Request",    method: "GET"    },
        { id: "stats",   path: "/history/stats/{id}",           label: "Stats",         method: "GET"    },
        { id: "delete",  path: "/history/{patient_id}",         label: "Delete All",    method: "DELETE" },
    ];

    const runQuery = async () => {
        if (!patientId.trim()) { setError("Patient ID / Request ID is required"); return; }
        setLoading(true); setError(null); setData(null);

        const url    = `${API.DIGITAL_TWIN}${endpoint.replace("{patient_id}", patientId).replace("{id}", patientId)}`;
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

    return (
        <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
        }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, background: `${BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9 }}>
                    <GitBranch size={16} color={BLUE} />
                </div>
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: TEXT }}>Digital Twin Simulation History</h2>
                    <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Query the /history endpoints on the Digital Twin Agent (Port 8006)</p>
                </div>
            </div>

            {/* Endpoint tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, padding: "0 10px", gap: 4, overflowX: "auto" }}>
                {ENDPOINTS.map(ep => {
                    const isActive = activeTab === ep.id;
                    const isDel    = ep.method === "DELETE";
                    return (
                        <button
                            key={ep.id}
                            onClick={() => { setActiveTab(ep.id); setEndpoint(ep.path); }}
                            style={{
                                padding: "10px 14px", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 8,
                                background:   isActive ? `${isDel ? RED : BLUE}10` : "transparent",
                                borderBottom: isActive ? `2px solid ${isDel ? RED : BLUE}` : "2px solid transparent",
                                opacity: isActive ? 1 : 0.6,
                                transition: "all 0.15s",
                            }}
                        >
                            <span style={{
                                fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 4,
                                background: isDel ? `${RED}20` : `${YELLOW}20`,
                                color: isDel ? RED : YELLOW,
                            }}>{ep.method}</span>
                            <span style={{ fontSize: 12, fontFamily: "monospace", color: TEXT }}>{ep.path}</span>
                        </button>
                    );
                })}
            </div>

            {/* Search bar */}
            <div style={{ padding: "14px 20px", display: "flex", gap: 12, background: BG, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ flex: 1 }}>
                    <Label>{endpoint.includes("request") ? "REQUEST ID" : "PATIENT ID"}</Label>
                    <input
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                        placeholder="e.g. test-dt-001"
                        style={{
                            width: "100%", padding: "10px 14px", background: SURFACE,
                            border: `1px solid ${BORDER}`, color: TEXT,
                            outline: "none", fontFamily: "monospace", fontSize: 13, borderRadius: 8,
                        }}
                        onKeyDown={e => e.key === "Enter" && runQuery()}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                        onClick={runQuery}
                        disabled={loading}
                        style={{
                            height: 42, padding: "0 24px", background: BLUE, border: "none", color: "#fff",
                            fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", borderRadius: 8,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 8,
                            opacity: loading ? 0.8 : 1,
                            boxShadow: loading ? "none" : `0 4px 12px ${BLUE}35`,
                        }}
                    >
                        {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
                        QUERY
                    </button>
                </div>
            </div>

            {/* Results area */}
            <div style={{ padding: 20, minHeight: 200, background: BG }}>
                {error && (
                    <div style={{ padding: 16, background: `${RED}10`, border: `1px solid ${RED}30`, borderRadius: 10, display: "flex", gap: 12, color: RED }}>
                        <AlertTriangle size={18} />
                        <div>
                            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Error</p>
                            <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
                        </div>
                    </div>
                )}

                {!error && !data && !loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: MUTED }}>
                        <Database size={32} style={{ margin: "0 auto 12px", opacity: 0.2, display: "block" }} />
                        <p style={{ margin: 0, fontSize: 13 }}>Enter an ID and query to fetch history data.</p>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: MUTED }}>
                        <Loader2 size={28} color={BLUE} style={{ margin: "0 auto 12px", display: "block", animation: "spin 1s linear infinite" }} />
                        <p style={{ margin: 0, fontSize: 13 }}>Querying…</p>
                    </div>
                )}

                {data && activeTab === "delete" && (
                    <div style={{ padding: 16, background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 10, color: GREEN, display: "flex", gap: 12 }}>
                        <Trash2 size={18} />
                        <div>
                            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Deleted</p>
                            <p style={{ margin: 0, fontSize: 13 }}>Removed {data.deleted_records} records for {data.patient_id}.</p>
                        </div>
                    </div>
                )}

                {data && (activeTab === "get" || activeTab === "latest" || activeTab === "request") && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <Label>{data.records ? `${data.total_records} RECORDS — ${data.patient_id}` : "1 RECORD FOUND"}</Label>
                            {data.records && <span style={{ fontSize: 11, color: MUTED }}>showing {data.records.length}</span>}
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

                        {/* Total simulations */}
                        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, background: `${BLUE}15`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }}>
                                    <GitBranch size={18} color={BLUE} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: MUTED, margin: 0 }}>Total Simulations</p>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: TEXT, margin: 0 }}>{data.total_simulations}</p>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div style={{ padding: 12, background: `${RED}10`, border: `1px solid ${RED}20`, borderRadius: 8 }}>
                                    <p style={{ fontSize: 10, color: RED, fontWeight: 700, margin: "0 0 4px" }}>Avg Mortality Risk</p>
                                    <p style={{ fontSize: 18, color: RED, fontWeight: 800, margin: 0, fontFamily: "monospace" }}>
                                        {(data.average_mortality_risk * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div style={{ padding: 12, background: `${ORANGE}10`, border: `1px solid ${ORANGE}20`, borderRadius: 8 }}>
                                    <p style={{ fontSize: 10, color: ORANGE, fontWeight: 700, margin: "0 0 4px" }}>Avg Readmission</p>
                                    <p style={{ fontSize: 18, color: ORANGE, fontWeight: 800, margin: 0, fontFamily: "monospace" }}>
                                        {(data.average_readmission_risk * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Risk profile breakdown */}
                        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                            <Label>Risk Profile Breakdown</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                {Object.entries(data.risk_profile_breakdown || {}).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: riskColor(label), width: 90 }}>{label}</span>
                                        <div style={{ flex: 1, height: 8, background: BG, borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ width: `${(count / data.total_simulations) * 100}%`, height: "100%", background: riskColor(label), borderRadius: 4 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: TEXT, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation trends */}
                        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                            <Label>Recommendation Trends</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                {Object.entries(data.recommendation_trends || {}).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: BLUE, width: 20 }}>{label}</span>
                                        <div style={{ flex: 1, height: 8, background: BG, borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ width: `${(count / data.total_simulations) * 100}%`, height: "100%", background: BLUE, borderRadius: 4 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: TEXT, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: 11, color: MUTED, margin: "12px 0 0", fontStyle: "italic" }}>
                                Most common: {data.most_recommended_option}
                            </p>
                        </div>

                        {/* Model performance */}
                        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                            <Label>Model Performance</Label>
                            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: MUTED }}>Avg Recommendation Confidence</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>
                                        {(data.average_recommendation_confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}`, paddingBottom: 8 }}>
                                    <span style={{ fontSize: 12, color: MUTED }}>Unique Diagnoses Analyzed</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{data.unique_diagnoses}</span>
                                </div>
                                <p style={{ fontSize: 11, color: MUTED, margin: 0, fontStyle: "italic" }}>
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
