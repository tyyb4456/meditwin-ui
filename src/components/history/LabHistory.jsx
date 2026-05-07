import { useState } from "react";
import { API } from "../../config/api";
import {
    Clock, Search, Trash2, AlertTriangle,
    ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle,
    Copy, Check, FlaskConical, AlertCircle,
} from "lucide-react";

const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const CARD    = "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))";
const GREEN   = "#22C55E";
const AMBER   = "#F59E0B";
const RED     = "#EF4444";
const CYAN    = "#06B6D4";
const ORANGE  = "#F97316";
const BLUE    = "#60A5FA";

const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return RED;
    if (s === "HIGH")     return ORANGE;
    if (s === "MODERATE") return AMBER;
    if (s === "LOW" || s === "MINIMAL") return GREEN;
    return SUBTLE;
};

const flagColor = (flag) => {
    if (!flag) return SUBTLE;
    const f = flag.toUpperCase();
    if (f === "CRITICAL") return RED;
    if (f === "HIGH")     return ORANGE;
    if (f === "LOW")      return BLUE;
    return GREEN;
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function Label({ children }) {
    return (
        <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.25em",
            textTransform: "uppercase", color: MUTED, margin: "0 0 10px",
        }}>{children}</p>
    );
}

function MethodBadge({ method }) {
    const colors = { GET: CYAN, DELETE: RED };
    return (
        <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
            color: colors[method] || SUBTLE,
            border: `1px solid ${(colors[method] || SUBTLE)}40`,
            padding: "2px 6px", fontFamily: "monospace",
        }}>{method}</span>
    );
}

function EndpointTab({ active, onClick, method, path }) {
    return (
        <button onClick={onClick} style={{
            background: active ? CARD : "none",
            border: `1px solid ${active ? CYAN + "60" : BORDER}`,
            borderBottom: active ? `1px solid ${CARD}` : `1px solid ${BORDER}`,
            color: active ? TEXT : MUTED,
            padding: "8px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
            fontSize: 11, fontWeight: active ? 700 : 500,
            transition: "all 0.15s", flexShrink: 0,
        }}>
            <MethodBadge method={method} />
            <span style={{ fontFamily: "monospace", fontSize: 10 }}>{path}</span>
        </button>
    );
}

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
                <Label>Raw Record JSON</Label>
                <button onClick={handleCopy} style={{
                    background: "none", border: `1px solid ${BORDER}`, color: MUTED,
                    padding: "2px 7px", cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    borderRadius: 4,
                }}>
                    {copied
                        ? <><Check size={9} color={GREEN} /> Copied</>
                        : <><Copy size={9} /> Copy</>}
                </button>
            </div>
            <div style={{
                flex: 1, overflow: "auto", background: BG,
                border: `1px solid ${BORDER}`, padding: "10px 12px",
                fontFamily: "monospace", fontSize: 10, lineHeight: 1.6, color: SUBTLE,
                maxHeight: 420, borderRadius: 6,
            }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{text}</pre>
            </div>
        </div>
    );
}

function HistoryRecordCard({ record, index }) {
    const [expanded, setExpanded] = useState(false);
    const sevCol = severityColor(record.overall_severity);

    return (
        <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            opacity: 0, animation: `fadeSlideIn 0.3s ease ${index * 0.05}s forwards`,
        }}>
            <button onClick={() => setExpanded(p => !p)} style={{
                width: "100%", background: "none", border: "none",
                padding: "12px 14px", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 12,
            }}>
                <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", minWidth: 22, textAlign: "right" }}>#{record.id}</span>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>{record.request_id}</span>
                    <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                        color: sevCol, border: `1px solid ${sevCol}40`, padding: "1px 5px",
                    }}>{record.overall_severity} SEVERITY</span>
                    <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                        color: CYAN, border: `1px solid ${CYAN}40`, padding: "1px 5px",
                    }}>{record.source}</span>
                    {record.cache_hit && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, color: AMBER,
                            border: `1px solid ${AMBER}40`, padding: "1px 5px",
                        }}>CACHE HIT</span>
                    )}
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                        {record.elapsed_ms ? `${record.elapsed_ms}ms` : "—"}
                    </span>
                    <span style={{ fontSize: 10, color: MUTED }}>{record.created_at?.split("T")[0]}</span>
                    {expanded ? <ChevronDown size={12} color={MUTED} /> : <ChevronRight size={12} color={MUTED} />}
                </div>
            </button>

            {expanded && (
                <div style={{ borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: 200 }}>

                        {/* ── LEFT: structured detail ── */}
                        <div style={{ padding: "16px 14px", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 14 }}>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                {[
                                    { label: "Total", value: record.total_results,                      color: CYAN },
                                    { label: "Abn.",  value: record.abnormal_count,                     color: AMBER },
                                    { label: "Crit.", value: record.critical_count,                     color: RED },
                                    { label: "Score", value: record.severity_score?.score || "-",       color: sevCol },
                                ].map((stat, i) => (
                                    <div key={i} style={{ background: BG, padding: "8px 10px", border: `1px solid ${BORDER}`, borderTop: `3px solid ${stat.color}`, borderRadius: 6 }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 4px" }}>{stat.label}</p>
                                        <p style={{ fontSize: 14, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {(record.proposed_diagnosis || record.confirms_top_diagnosis !== null) && (
                                <div style={{
                                    background: BG, padding: "10px 12px", border: `1px solid ${BORDER}`,
                                    borderLeft: `4px solid ${record.confirms_top_diagnosis ? GREEN : RED}`,
                                    borderRadius: 8,
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        {record.confirms_top_diagnosis
                                            ? <CheckCircle2 size={14} color={GREEN} />
                                            : <AlertCircle  size={14} color={RED} />}
                                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: record.confirms_top_diagnosis ? GREEN : RED, margin: 0 }}>
                                            {record.confirms_top_diagnosis ? "Diagnosis Confirmed" : "Diagnosis Challenged"}
                                        </p>
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: "0 0 2px" }}>{record.proposed_diagnosis || "N/A"}</p>
                                    <p style={{ fontSize: 10, color: SUBTLE, margin: 0, fontFamily: "monospace" }}>ICD-10: {record.proposed_icd10 || "N/A"}</p>
                                </div>
                            )}

                            {record.flagged_results?.length > 0 && (
                                <div>
                                    <Label>Flagged Results ({record.flagged_results.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.flagged_results.slice(0, 3).map((res, i) => (
                                            <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 6 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{
                                                        fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
                                                        color: flagColor(res.flag), background: `${flagColor(res.flag)}18`,
                                                        padding: "1px 4px", border: `1px solid ${flagColor(res.flag)}40`, borderRadius: 3,
                                                    }}>{res.flag || "ABN"}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{res.display}</span>
                                                </div>
                                                <div style={{ fontSize: 11, fontFamily: "monospace", color: flagColor(res.flag), fontWeight: 700 }}>
                                                    {res.value} {res.unit}
                                                </div>
                                            </div>
                                        ))}
                                        {record.flagged_results.length > 3 && <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>+ {record.flagged_results.length - 3} more</p>}
                                    </div>
                                </div>
                            )}

                            {record.identified_patterns?.length > 0 && (
                                <div>
                                    <Label>Identified Patterns ({record.identified_patterns.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.identified_patterns.map((p, i) => (
                                            <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, padding: "6px 10px", display: "flex", alignItems: "flex-start", gap: 8, borderRadius: 6 }}>
                                                <div style={{ width: 5, height: 5, background: CYAN, borderRadius: "50%", flexShrink: 0, marginTop: 5 }} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: TEXT, margin: "0 0 2px" }}>{p.pattern || p.description}</p>
                                                    {p.description && p.pattern && <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{p.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", margin: "auto 0 0" }}>
                                <Clock size={9} style={{ verticalAlign: "middle", marginRight: 4 }} />
                                {record.created_at}
                            </p>
                        </div>

                        {/* ── RIGHT: raw JSON ── */}
                        <div style={{ padding: "16px 14px" }}>
                            <RecordJsonPanel record={record} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsPanel({ stats }) {
    const items = [
        { label: "Total Sessions",     value: stats.total_lab_sessions,      color: TEXT },
        { label: "Abnormal Findings",  value: stats.total_abnormal_findings,  color: AMBER },
        { label: "Critical Findings",  value: stats.total_critical_findings,  color: RED },
        { label: "Critical Sessions",  value: stats.critical_alert_sessions,  color: ORANGE },
        { label: "LLM Available",      value: stats.llm_available_sessions,   color: CYAN },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {items.map(({ label, value, color }) => (
                    <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "12px 14px", borderRadius: 8 }}>
                        <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: 9, color: MUTED, margin: "4px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {stats.top_icd10_confirmed?.length > 0 && (
                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "12px 14px", borderRadius: 8 }}>
                        <Label>Top Confirmed Diagnoses</Label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {stats.top_icd10_confirmed.map((c, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: TEXT }}>{c.display}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{c.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {stats.severity_breakdown && (
                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "12px 14px", borderRadius: 8 }}>
                        <Label>Severity Breakdown</Label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {Object.entries(stats.severity_breakdown).map(([sev, count], i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: 3, background: severityColor(sev) }} />
                                        <span style={{ fontSize: 11, color: TEXT, fontFamily: "monospace" }}>{sev}</span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "12px 14px", display: "flex", gap: 24, borderRadius: 8 }}>
                <div>
                    <Label>First Session</Label>
                    <p style={{ fontSize: 12, color: TEXT, fontFamily: "monospace", margin: 0 }}>
                        {stats.first_session?.split("T")[0] ?? "—"}
                    </p>
                </div>
                <div>
                    <Label>Latest Session</Label>
                    <p style={{ fontSize: 12, color: CYAN, fontFamily: "monospace", margin: 0 }}>
                        {stats.latest_session?.split("T")[0] ?? "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}

function renderResult(activeTab, result) {
    if (!result) return null;

    if (activeTab === "list") {
        const records = result.history || result;
        if (!Array.isArray(records) || records.length === 0) {
            return (
                <div style={{ padding: "24px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>No lab records found for this patient.</p>
                </div>
            );
        }
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {records.map((record, i) => <HistoryRecordCard key={record.id || i} record={record} index={i} />)}
            </div>
        );
    }
    if (activeTab === "latest" || activeTab === "request") {
        return <HistoryRecordCard record={result} index={0} />;
    }
    if (activeTab === "stats") {
        return <StatsPanel stats={result} />;
    }
    return (
        <div style={{ padding: "14px 20px" }}>
            <pre style={{ fontFamily: "monospace", fontSize: 11, color: TEXT, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LabHistory({ defaultPatientId = "" }) {
    const BASE = API.LAB_ANALYSIS;

    const [activeTab,     setActiveTab]     = useState("list");
    const [patientId,     setPatientId]     = useState(defaultPatientId);
    const [requestId,     setRequestId]     = useState("");
    const [loading,       setLoading]       = useState(false);
    const [result,        setResult]        = useState(null);
    const [error,         setError]         = useState(null);
    const [deleteToken,   setDeleteToken]   = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleted,       setDeleted]       = useState(null);

    const tabs = [
        { id: "list",    method: "GET",    path: "/history/{id}" },
        { id: "latest",  method: "GET",    path: "/history/{id}/latest" },
        { id: "request", method: "GET",    path: "/history/request/{id}" },
        { id: "stats",   method: "GET",    path: "/history/stats/{id}" },
        { id: "delete",  method: "DELETE", path: "/history/{id}" },
    ];

    const needsPatientId = ["list", "latest", "stats", "delete"].includes(activeTab);
    const needsRequestId = activeTab === "request";
    const canSubmit = needsPatientId ? !!patientId.trim() : !!requestId.trim();

    const fetchEndpoint = async () => {
        setLoading(true); setResult(null); setError(null); setDeleted(null);
        try {
            let url, method = "GET";
            if (activeTab === "list")    url = `${BASE}/history/${patientId}`;
            if (activeTab === "latest")  url = `${BASE}/history/${patientId}/latest`;
            if (activeTab === "request") url = `${BASE}/history/request/${requestId}`;
            if (activeTab === "stats")   url = `${BASE}/history/stats/${patientId}`;
            if (activeTab === "delete")  { url = `${BASE}/history/${patientId}`; method = "DELETE"; }

            const headers = { "Content-Type": "application/json" };
            if (activeTab === "delete" && deleteToken) headers["X-Internal-Token"] = deleteToken;

            const res  = await fetch(url, { method, headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
            if (activeTab === "delete") setDeleted(data);
            else setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", background: BG, border: `1px solid ${BORDER}`, color: TEXT,
        padding: "8px 11px", fontSize: 12, outline: "none", fontFamily: "monospace",
        borderRadius: 6, transition: "border-color 0.2s",
    };

    return (
        <div style={{
            background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 12, overflow: "hidden",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
        }}>
            <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

            {/* ── Header ── */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, background: `${CYAN}18`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FlaskConical size={14} color={CYAN} />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: "0.05em" }}>Lab Analysis History</p>
                    <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>Query the /history endpoints on the Lab Analysis Agent</p>
                </div>
            </div>

            {/* ── Endpoint tabs ── */}
            <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${BORDER}`, padding: "0 20px" }}>
                {tabs.map(t => (
                    <EndpointTab
                        key={t.id}
                        active={activeTab === t.id}
                        onClick={() => { setActiveTab(t.id); setResult(null); setError(null); setDeleted(null); }}
                        method={t.method}
                        path={t.path}
                    />
                ))}
            </div>

            {/* ── Controls row ── */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                {needsPatientId && (
                    <div style={{ flex: "1 1 180px" }}>
                        <p style={{ fontSize: 10, color: MUTED, margin: "0 0 4px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Patient ID</p>
                        <input value={patientId} onChange={e => setPatientId(e.target.value)} onKeyDown={e => e.key === "Enter" && canSubmit && fetchEndpoint()} placeholder="e.g. test_1" style={inputStyle} />
                    </div>
                )}
                {needsRequestId && (
                    <div style={{ flex: "1 1 200px" }}>
                        <p style={{ fontSize: 10, color: MUTED, margin: "0 0 4px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Request ID</p>
                        <input value={requestId} onChange={e => setRequestId(e.target.value)} onKeyDown={e => e.key === "Enter" && canSubmit && fetchEndpoint()} placeholder="e.g. a1b2c3d4" style={inputStyle} />
                    </div>
                )}
                {activeTab === "delete" && (
                    <div style={{ flex: "1 1 200px" }}>
                        <p style={{ fontSize: 10, color: MUTED, margin: "0 0 4px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Internal Token</p>
                        <input value={deleteToken} onChange={e => setDeleteToken(e.target.value)} placeholder="meditwin-internal" type="password" style={{ ...inputStyle, border: `1px solid ${RED}40` }} />
                    </div>
                )}

                {activeTab === "delete" && !deleteConfirm ? (
                    <button onClick={() => setDeleteConfirm(true)} disabled={!patientId.trim()} style={{ background: `${RED}20`, border: `1px solid ${RED}60`, color: RED, padding: "8px 16px", cursor: "pointer", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, borderRadius: 6 }}>
                        <Trash2 size={12} /> Delete
                    </button>
                ) : activeTab === "delete" && deleteConfirm ? (
                    <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { fetchEndpoint(); setDeleteConfirm(false); }} style={{ background: RED, border: "none", color: "#fff", padding: "8px 14px", cursor: "pointer", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 6 }}>Confirm</button>
                        <button onClick={() => setDeleteConfirm(false)} style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, padding: "8px 12px", cursor: "pointer", fontSize: 11, borderRadius: 6 }}>Cancel</button>
                    </div>
                ) : (
                    <button
                        onClick={fetchEndpoint}
                        disabled={loading || !canSubmit}
                        style={{
                            background: loading || !canSubmit ? BORDER : CYAN,
                            border: "none", color: "#fff", padding: "8px 18px",
                            cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                            fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
                            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", borderRadius: 6,
                            boxShadow: loading || !canSubmit ? "none" : `0 4px 14px ${CYAN}35`,
                        }}
                    >
                        {loading
                            ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Loading...</>
                            : <><Search size={12} /> Query</>}
                    </button>
                )}
            </div>

            {/* ── Results area ── */}
            <div style={{ minHeight: 80 }}>
                {error && (
                    <div style={{ padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <XCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                    </div>
                )}
                {deleted && (
                    <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircle2 size={14} color={GREEN} />
                        <p style={{ fontSize: 12, color: GREEN, fontWeight: 700, margin: 0 }}>
                            Deleted {deleted.deleted_count} record(s) for patient "{deleted.patient_id}"
                        </p>
                    </div>
                )}
                {!loading && !error && !deleted && result && renderResult(activeTab, result)}
                {loading && (
                    <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <Loader2 size={16} color={CYAN} style={{ animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: 12, color: MUTED }}>Fetching...</span>
                    </div>
                )}
                {!loading && !error && !deleted && !result && (
                    <div style={{ padding: "24px", textAlign: "center" }}>
                        <p style={{ fontSize: 12, color: SUBTLE, margin: 0, opacity: 0.6 }}>Enter a patient ID and click Query to load history</p>
                    </div>
                )}
            </div>
        </div>
    );
}
