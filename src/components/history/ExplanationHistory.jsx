import { useState } from "react";
import {
    Search, Trash2, Database, AlertTriangle, ChevronDown, ChevronRight,
    Loader2, FileText, BookOpen, ShieldAlert, CheckCircle2, AlertCircle,
    Copy, Check
} from "lucide-react";

const C = {
    bg: "var(--color-bg)",
    panel: "var(--color-surface)",
    card: "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))",
    border: "var(--color-border)",
    accent: "#f97316", // orange
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

const consensusColor = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "FULL_CONSENSUS") return C.green;
    if (s === "CONFLICT_RESOLVED") return C.yellow;
    if (s === "ESCALATED" || s === "UNRESOLVED") return C.red;
    return C.muted;
};

const Label = ({ children }) => (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>
        {children}
    </p>
);

function RecordJsonPanel({ record }) {
    const [copied, setCopied] = useState(false);
    const text = JSON.stringify(record, null, 2);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Label>Raw JSON</Label>
                <button onClick={handleCopy} style={{
                    background: "none", border: `1px solid ${C.border}`, color: C.muted,
                    padding: "2px 7px", cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                    {copied ? <><Check size={9} color={C.green} /> Copied</> : <><Copy size={9} /> Copy</>}
                </button>
            </div>
            <div style={{
                flex: 1, overflow: "auto", background: C.bg,
                border: `1px solid ${C.border}`, padding: "10px 12px",
                fontFamily: "monospace", fontSize: 10, lineHeight: 1.6, color: C.muted,
                maxHeight: 420,
            }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{text}</pre>
            </div>
        </div>
    );
}

function HistoryRecordCard({ record }) {
    const [expanded, setExpanded] = useState(false);
    const cColor = consensusColor(record.consensus_status);
    const fmtPct = (v) => v != null ? `${(v * 100).toFixed(1)}%` : "--";

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {/* Summary row */}
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
                    background: expanded ? `color-mix(in srgb, ${C.accent} 4%, transparent)` : "transparent"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: 300, flexShrink: 0 }}>
                    <div style={{ color: C.muted }}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    <div>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 2px", fontFamily: "monospace" }}>
                            #{record.id} <span style={{ color: C.text }}>{record.request_id}</span>
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0, maxWidth: 240, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {record.chief_complaint}
                        </p>
                    </div>
                </div>

                <div style={{ width: 160, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", border: `1px solid ${cColor}40`, color: cColor, background: `${cColor}12` }}>
                        {record.consensus_status || "UNKNOWN"}
                    </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>
                        Confidence: <strong style={{ color: C.text }}>{fmtPct(record.aggregate_confidence)}</strong>
                    </span>
                    {record.human_review_required && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", border: `1px solid ${C.red}40`, color: C.red, background: `${C.red}10`, letterSpacing: "0.1em" }}>
                            HUMAN REVIEW
                        </span>
                    )}
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", border: `1px solid ${C.muted}30`, color: C.muted }}>
                        Gr. {record.reading_grade_level?.toFixed(1)}
                    </span>
                </div>

                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 12 }}>
                    {record.elapsed_ms && <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{record.elapsed_ms}ms</span>}
                    <span style={{ fontSize: 11, color: C.muted }}>{new Date(record.created_at).toLocaleString()}</span>
                </div>
            </div>

            {/* Expanded */}
            {expanded && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: 16, background: C.bg, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>

                    {/* Left */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <Label>Final Diagnosis</Label>
                            <p style={{ fontSize: 12, color: C.text, margin: 0, padding: "8px 10px", background: C.card, border: `1px solid ${C.border}`, fontWeight: 600 }}>
                                {record.final_diagnosis || "Not recorded"}
                            </p>
                        </div>

                        {record.soap_note && Object.keys(record.soap_note).length > 0 && (
                            <div>
                                <Label>SOAP Note Summary</Label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {["subjective", "objective", "assessment", "plan"].map(key => (
                                        record.soap_note[key] && (
                                            <div key={key} style={{ padding: "8px 10px", background: C.card, border: `1px solid ${C.border}` }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 3px" }}>{key}</p>
                                                <p style={{ fontSize: 11, color: C.text, margin: 0, lineHeight: 1.5 }}>
                                                    {Array.isArray(record.soap_note[key])
                                                        ? record.soap_note[key].join(" • ")
                                                        : String(record.soap_note[key]).slice(0, 200) + (String(record.soap_note[key]).length > 200 ? "…" : "")}
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {record.risk_flags?.length > 0 && (
                            <div>
                                <Label>Risk Flags ({record.risk_flags.length})</Label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {record.risk_flags.map((flag, i) => (
                                        <div key={i} style={{ fontSize: 11, color: C.red, padding: "6px 10px", background: `${C.red}08`, border: `1px solid ${C.red}20`, display: "flex", gap: 8, alignItems: "flex-start" }}>
                                            <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                                            <span>{typeof flag === "string" ? flag : flag.message || JSON.stringify(flag)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {record.patient_output && Object.keys(record.patient_output).length > 0 && (
                            <div>
                                <Label>Patient Explanation</Label>
                                <div style={{ padding: "10px 12px", background: `${C.cyan}08`, border: `1px solid ${C.cyan}20` }}>
                                    {record.patient_output.condition_explanation && (
                                        <p style={{ fontSize: 11, color: C.text, margin: "0 0 8px", lineHeight: 1.5 }}>
                                            {record.patient_output.condition_explanation}
                                        </p>
                                    )}
                                    {record.patient_output.what_to_expect && (
                                        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                                            {record.patient_output.what_to_expect}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            <div style={{ padding: 10, background: C.card, border: `1px solid ${C.border}` }}>
                                <p style={{ fontSize: 9, color: C.muted, margin: "0 0 2px", textTransform: "uppercase" }}>SOAP Tokens</p>
                                <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0, fontFamily: "monospace" }}>{record.soap_tokens}</p>
                            </div>
                            <div style={{ padding: 10, background: C.card, border: `1px solid ${C.border}` }}>
                                <p style={{ fontSize: 9, color: C.muted, margin: "0 0 2px", textTransform: "uppercase" }}>Patient Tokens</p>
                                <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0, fontFamily: "monospace" }}>{record.patient_tokens}</p>
                            </div>
                            <div style={{ padding: 10, background: C.card, border: `1px solid ${C.border}` }}>
                                <p style={{ fontSize: 9, color: C.muted, margin: "0 0 2px", textTransform: "uppercase" }}>Reading Gr.</p>
                                <p style={{ fontSize: 14, fontWeight: 800, color: record.reading_acceptable ? C.green : C.red, margin: 0, fontFamily: "monospace" }}>
                                    {record.reading_grade_level?.toFixed(1)}
                                </p>
                            </div>
                        </div>

                        {record.fhir_bundle_summary && (
                            <div>
                                <Label>FHIR Bundle</Label>
                                <div style={{ padding: "8px 12px", background: `${C.purple}08`, border: `1px solid ${C.purple}20`, display: "flex", gap: 16, alignItems: "center" }}>
                                    <span style={{ fontSize: 12, color: C.purple, fontWeight: 700 }}>
                                        {record.fhir_bundle_summary.entry_count || 0} resources
                                    </span>
                                    {record.fhir_bundle_summary.resource_types?.length > 0 && (
                                        <span style={{ fontSize: 10, color: C.muted }}>
                                            {record.fhir_bundle_summary.resource_types.join(" · ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Raw JSON */}
                    <div>
                        <RecordJsonPanel record={record} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ExplanationHistory({ defaultPatientId = "" }) {
    const [activeTab, setActiveTab] = useState("get");
    const [patientId, setPatientId] = useState(defaultPatientId);
    const [endpoint, setEndpoint] = useState("/history/{patient_id}");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const ENDPOINTS = [
        { id: "get", path: "/history/{id}", label: "All Records", method: "GET" },
        { id: "latest", path: "/history/{id}/latest", label: "Latest Record", method: "GET" },
        { id: "request", path: "/history/request/{id}", label: "By Request", method: "GET" },
        { id: "stats", path: "/history/stats/{id}", label: "Stats", method: "GET" },
        { id: "delete", path: "/history/{id}", label: "Delete All", method: "DELETE" },
    ];

    const runQuery = async () => {
        if (!patientId.trim()) { setError("ID is required"); return; }
        setLoading(true); setError(null); setData(null);

        const url = `http://127.0.0.1:8009${endpoint.replace("{patient_id}", patientId).replace("{id}", patientId)}`;
        const method = activeTab === "delete" ? "DELETE" : "GET";
        const headers = method === "DELETE" ? { "X-Internal-Token": "meditwin-internal" } : {};

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
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: `${C.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                    <FileText size={16} color={C.accent} />
                </div>
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: C.text }}>Explanation Agent History</h2>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Query the /history endpoints on the Explanation Agent (Port 8009)</p>
                </div>
            </div>

            {/* Endpoint tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 10px", gap: 4, overflowX: "auto" }}>
                {ENDPOINTS.map(ep => (
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

            {/* Search */}
            <div style={{ padding: "16px 20px", display: "flex", gap: 12, background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ flex: 1 }}>
                    <Label>{activeTab === "request" ? "REQUEST ID" : "PATIENT ID"}</Label>
                    <input
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && runQuery()}
                        placeholder="e.g. patient-001"
                        style={{ width: "100%", padding: "10px 14px", background: C.panel, border: `1px solid ${C.border}`, color: C.text, outline: "none", fontFamily: "monospace", fontSize: 13 }}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                        onClick={runQuery}
                        disabled={loading}
                        style={{
                            height: 40, padding: "0 24px",
                            background: loading ? "#4b5563" : C.accent,  // gray when loading
                            border: "none", color: "#fff",
                            fontSize: 12, fontWeight: 800, letterSpacing: "0.1em",
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 8,
                            opacity: 1,
                            transition: "background 0.2s",
                        }}
                    >
                        {loading
                            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> LOADING...</>
                            : <><Search size={14} /> QUERY</>
                        }
                    </button>
                </div>
            </div>

            {/* Results */}
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

                {data && ["get", "latest", "request"].includes(activeTab) && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <Label>{data.records ? `${data.total_records} RECORDS FOR ${data.patient_id}` : "1 RECORD FOUND"}</Label>
                            {data.records && <span style={{ fontSize: 11, color: C.muted }}>showing {data.records.length}</span>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {data.records
                                ? data.records.map(rec => <HistoryRecordCard key={rec.id} record={rec} />)
                                : <HistoryRecordCard record={data} />
                            }
                        </div>
                    </div>
                )}

                {data && activeTab === "stats" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                        {/* Overview */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                                    <FileText size={18} color={C.accent} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: C.muted, margin: 0 }}>Total Explanations</p>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>{data.total_explanations}</p>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div style={{ padding: 12, background: `${C.red}10`, border: `1px solid ${C.red}20` }}>
                                    <p style={{ fontSize: 10, color: C.red, fontWeight: 700, margin: "0 0 4px" }}>Human Review Flagged</p>
                                    <p style={{ fontSize: 18, color: C.red, fontWeight: 800, margin: 0 }}>{data.human_review_count}</p>
                                </div>
                                <div style={{ padding: 12, background: `${C.cyan}10`, border: `1px solid ${C.cyan}20` }}>
                                    <p style={{ fontSize: 10, color: C.cyan, fontWeight: 700, margin: "0 0 4px" }}>Unique Complaints</p>
                                    <p style={{ fontSize: 18, color: C.cyan, fontWeight: 800, margin: 0 }}>{data.unique_complaints}</p>
                                </div>
                            </div>
                        </div>

                        {/* Consensus */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>Consensus Breakdown</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                {Object.entries(data.consensus_breakdown || {}).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                                    <div key={status} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: consensusColor(status), width: 120, flexShrink: 0 }}>{status}</span>
                                        <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                                            <div style={{ width: `${(count / data.total_explanations) * 100}%`, height: "100%", background: consensusColor(status) }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text, width: 24, textAlign: "right" }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* LLM Performance */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>LLM Performance</Label>
                            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { label: "Avg Confidence", value: `${(data.avg_confidence * 100).toFixed(1)}%` },
                                    { label: "Avg Reading Grade Level", value: data.avg_reading_grade?.toFixed(1) },
                                    { label: "Total SOAP Tokens", value: data.total_soap_tokens?.toLocaleString() },
                                    { label: "Total Patient Tokens", value: data.total_patient_tokens?.toLocaleString() },
                                    { label: "Avg Elapsed", value: data.avg_elapsed_ms ? `${data.avg_elapsed_ms.toFixed(0)}ms` : "--" },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                                        <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Diagnoses */}
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 20 }}>
                            <Label>Top Diagnoses Seen</Label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                                {(data.diagnoses_seen || []).map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, color: C.accent, width: 16, textAlign: "center" }}>{i + 1}</span>
                                        <span style={{ flex: 1, fontSize: 11, color: C.text }}>{item.diagnosis}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{item.count}×</span>
                                    </div>
                                ))}
                                {(!data.diagnoses_seen || data.diagnoses_seen.length === 0) && (
                                    <p style={{ fontSize: 11, color: C.muted, fontStyle: "italic", margin: 0 }}>No diagnosis data available.</p>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}