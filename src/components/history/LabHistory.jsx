import { useState } from "react";
import {
    Clock, Search, Trash2, Database, AlertTriangle, Activity,
    ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle,
    Copy, Check, FlaskConical, AlertCircle
} from "lucide-react";

const C = {
    bg: "var(--color-bg)",
    panel: "var(--color-surface)",
    card: "color-mix(in srgb, var(--color-surface) 60%, var(--color-bg))",
    border: "var(--color-border)",
    accent: "var(--color-accent)",
    green: "#22C55E",
    yellow: "#EAB308",
    red: "#EF4444",
    cyan: "#06B6D4",
    orange: "#F97316",
    blue: "#60A5FA",
    purple: "#8b5cf6",
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
    dim: "var(--color-border)",
};

const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return C.red;
    if (s === "HIGH") return C.orange;
    if (s === "MODERATE") return C.yellow;
    if (s === "LOW" || s === "MINIMAL") return C.green;
    return C.muted;
};

const flagColor = (flag) => {
    if (!flag) return C.muted;
    const f = flag.toUpperCase();
    if (f === "CRITICAL") return C.red;
    if (f === "HIGH") return C.orange;
    if (f === "LOW") return C.blue;
    return C.green;
};

function Label({ children }) {
    return (
        <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.25em",
            textTransform: "uppercase", color: C.muted, margin: "0 0 10px",
        }}>{children}</p>
    );
}

function MethodBadge({ method }) {
    const colors = { GET: C.cyan, DELETE: C.red };
    return (
        <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
            color: colors[method] || C.muted,
            border: `1px solid ${(colors[method] || C.muted)}40`,
            padding: "2px 6px", fontFamily: "monospace",
        }}>{method}</span>
    );
}

function EndpointTab({ active, onClick, method, path, label }) {
    return (
        <button onClick={onClick} style={{
            background: active ? C.card : "none",
            border: `1px solid ${active ? C.accent + "60" : C.border}`,
            borderBottom: active ? `1px solid ${C.card}` : `1px solid ${C.border}`,
            color: active ? C.text : C.muted,
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

function HistoryRecordCard({ record, index }) {
    const [expanded, setExpanded] = useState(false);
    const sevCol = severityColor(record.overall_severity);

    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            opacity: 0, animation: `fadeSlideIn 0.3s ease ${index * 0.05}s forwards`,
        }}>
            <button onClick={() => setExpanded(p => !p)} style={{
                width: "100%", background: "none", border: "none",
                padding: "12px 14px", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 12,
            }}>
                <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", minWidth: 22, textAlign: "right" }}>#{record.id}</span>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>{record.request_id}</span>
                    <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                        color: sevCol, border: `1px solid ${sevCol}40`, padding: "1px 5px",
                    }}>{record.overall_severity} SEVERITY</span>
                    <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                        color: C.cyan, border: `1px solid ${C.cyan}40`, padding: "1px 5px",
                    }}>{record.source}</span>
                    {record.cache_hit && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, color: C.yellow,
                            border: `1px solid ${C.yellow}40`, padding: "1px 5px",
                        }}>CACHE HIT</span>
                    )}
                </div>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
                        {record.elapsed_ms ? `${record.elapsed_ms}ms` : "—"}
                    </span>
                    <span style={{ fontSize: 10, color: C.muted }}>{record.created_at?.split("T")[0]}</span>
                    {expanded ? <ChevronDown size={12} color={C.muted} /> : <ChevronRight size={12} color={C.muted} />}
                </div>
            </button>

            {expanded && (
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: 200 }}>
                        <div style={{ padding: "16px 14px", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 14 }}>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                {[
                                    { label: "Total", value: record.total_results, color: C.cyan },
                                    { label: "Abn.", value: record.abnormal_count, color: C.yellow },
                                    { label: "Crit.", value: record.critical_count, color: C.red },
                                    { label: "Score", value: record.severity_score?.score || "-", color: sevCol }
                                ].map((stat, i) => (
                                    <div key={i} style={{ background: C.bg, padding: "8px 10px", border: `1px solid ${C.border}`, borderTop: `3px solid ${stat.color}` }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>{stat.label}</p>
                                        <p style={{ fontSize: 14, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {(record.proposed_diagnosis || record.confirms_top_diagnosis !== null) && (
                                <div style={{
                                    background: C.bg, padding: "10px 12px", border: `1px solid ${C.border}`,
                                    borderLeft: `4px solid ${record.confirms_top_diagnosis ? C.green : C.red}`,
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        {record.confirms_top_diagnosis ? <CheckCircle2 size={14} color={C.green} /> : <AlertCircle size={14} color={C.red} />}
                                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: record.confirms_top_diagnosis ? C.green : C.red, margin: 0 }}>
                                            {record.confirms_top_diagnosis ? "Diagnosis Confirmed" : "Diagnosis Challenged"}
                                        </p>
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>{record.proposed_diagnosis || "N/A"}</p>
                                    <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: "monospace" }}>ICD-10: {record.proposed_icd10 || "N/A"}</p>
                                </div>
                            )}

                            {record.flagged_results?.length > 0 && (
                                <div>
                                    <Label>Flagged Results ({record.flagged_results.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.flagged_results.slice(0, 3).map((res, i) => (
                                            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{
                                                        fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
                                                        color: flagColor(res.flag), background: `${flagColor(res.flag)}18`,
                                                        padding: "1px 4px", border: `1px solid ${flagColor(res.flag)}40`,
                                                    }}>{res.flag || "ABN"}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{res.display}</span>
                                                </div>
                                                <div style={{ fontSize: 11, fontFamily: "monospace", color: flagColor(res.flag), fontWeight: 700 }}>
                                                    {res.value} {res.unit}
                                                </div>
                                            </div>
                                        ))}
                                        {record.flagged_results.length > 3 && <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>+ {record.flagged_results.length - 3} more</p>}
                                    </div>
                                </div>
                            )}

                            {record.identified_patterns?.length > 0 && (
                                <div>
                                    <Label>Identified Patterns ({record.identified_patterns.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.identified_patterns.map((p, i) => (
                                            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "6px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                                                <div style={{ width: 5, height: 5, background: C.cyan, borderRadius: "50%", flexShrink: 0, marginTop: 5 }} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{p.pattern || p.description}</p>
                                                    {p.description && p.pattern && <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{p.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", margin: "auto 0 0" }}>
                                <Clock size={9} style={{ verticalAlign: "middle", marginRight: 4 }} />
                                {record.created_at}
                            </p>
                        </div>
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
        { label: "Total Sessions", value: stats.total_lab_sessions, color: C.text },
        { label: "Abnormal Findings", value: stats.total_abnormal_findings, color: C.yellow },
        { label: "Critical Findings", value: stats.total_critical_findings, color: C.red },
        { label: "Critical Sessions", value: stats.critical_alert_sessions, color: C.orange },
        { label: "LLM Available", value: stats.llm_available_sessions, color: C.cyan },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {items.map(({ label, value, color }) => (
                    <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px" }}>
                        <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: 9, color: C.muted, margin: "4px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {stats.top_icd10_confirmed && stats.top_icd10_confirmed.length > 0 && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px" }}>
                        <Label>Top Confirmed Diagnoses</Label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {stats.top_icd10_confirmed.map((c, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: C.text }}>{c.display}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{c.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {stats.severity_breakdown && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px" }}>
                        <Label>Severity Breakdown</Label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {Object.entries(stats.severity_breakdown).map(([sev, count], i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: 3, background: severityColor(sev) }} />
                                        <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace" }}>{sev}</span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", gap: 24 }}>
                <div>
                    <Label>First Session</Label>
                    <p style={{ fontSize: 12, color: C.text, fontFamily: "monospace", margin: 0 }}>
                        {stats.first_session?.split("T")[0] ?? "—"}
                    </p>
                </div>
                <div>
                    <Label>Latest Session</Label>
                    <p style={{ fontSize: 12, color: C.cyan, fontFamily: "monospace", margin: 0 }}>
                        {stats.latest_session?.split("T")[0] ?? "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LabHistory({ defaultPatientId = "" }) {
    const BASE = "http://127.0.0.1:8003";

    const [activeTab, setActiveTab] = useState("list");
    const [patientId, setPatientId] = useState(defaultPatientId);
    const [requestId, setRequestId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const [deleteToken, setDeleteToken] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleted, setDeleted] = useState(null);

    const tabs = [
        { id: "list", method: "GET", path: "/history/{id}", label: "Patient History" },
        { id: "latest", method: "GET", path: "/history/{id}/latest", label: "Latest Record" },
        { id: "request", method: "GET", path: "/history/request/{id}", label: "By Request ID" },
        { id: "stats", method: "GET", path: "/history/stats/{id}", label: "Stats" },
        { id: "delete", method: "DELETE", path: "/history/{id}", label: "Delete History" },
    ];

    const fetchEndpoint = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        setDeleted(null);

        try {
            let url, method = "GET";

            if (activeTab === "list") url = `${BASE}/history/${patientId}`;
            if (activeTab === "latest") url = `${BASE}/history/${patientId}/latest`;
            if (activeTab === "request") url = `${BASE}/history/request/${requestId}`;
            if (activeTab === "stats") url = `${BASE}/history/stats/${patientId}`;
            if (activeTab === "delete") {
                url = `${BASE}/history/${patientId}`;
                method = "DELETE";
            }

            const headers = { "Content-Type": "application/json" };
            if (activeTab === "delete" && deleteToken) {
                headers["X-Internal-Token"] = deleteToken;
            }

            const res = await fetch(url, { method, headers });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);

            if (activeTab === "delete") {
                setDeleted(data);
            } else {
                setResult(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const needsPatientId = ["list", "latest", "stats", "delete"].includes(activeTab);
    const needsRequestId = activeTab === "request";
    const canSubmit = needsPatientId ? !!patientId.trim() : !!requestId.trim();

    return (
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, background: `${C.cyan}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FlaskConical size={14} color={C.cyan} />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "0.05em" }}>Lab Analysis History</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>Query the /history endpoints on the Lab Analysis Agent</p>
                </div>
            </div>

            <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${C.border}`, padding: "0 20px" }}>
                {tabs.map(t => (
                    <EndpointTab key={t.id} active={activeTab === t.id} onClick={() => { setActiveTab(t.id); setResult(null); setError(null); setDeleted(null); }} method={t.method} path={t.path} label={t.label} />
                ))}
            </div>

            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                {needsPatientId && (
                    <div style={{ flex: "1 1 180px" }}>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>PATIENT ID</p>
                        <input value={patientId} onChange={e => setPatientId(e.target.value)} onKeyDown={e => e.key === "Enter" && canSubmit && fetchEndpoint()} placeholder="e.g. test_1" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "8px 11px", fontSize: 12, outline: "none", fontFamily: "monospace" }} />
                    </div>
                )}
                {needsRequestId && (
                    <div style={{ flex: "1 1 200px" }}>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>REQUEST ID</p>
                        <input value={requestId} onChange={e => setRequestId(e.target.value)} onKeyDown={e => e.key === "Enter" && canSubmit && fetchEndpoint()} placeholder="e.g. a1b2c3d4" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "8px 11px", fontSize: 12, outline: "none", fontFamily: "monospace" }} />
                    </div>
                )}
                {activeTab === "delete" && (
                    <div style={{ flex: "1 1 200px" }}>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>INTERNAL TOKEN</p>
                        <input value={deleteToken} onChange={e => setDeleteToken(e.target.value)} placeholder="meditwin-internal" type="password" style={{ width: "100%", background: C.bg, border: `1px solid ${C.red}40`, color: C.text, padding: "8px 11px", fontSize: 12, outline: "none", fontFamily: "monospace" }} />
                    </div>
                )}
                {activeTab === "delete" && !deleteConfirm ? (
                    <button onClick={() => setDeleteConfirm(true)} disabled={!patientId.trim()} style={{ background: `${C.red}20`, border: `1px solid ${C.red}60`, color: C.red, padding: "8px 16px", cursor: "pointer", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                        <Trash2 size={12} /> Delete
                    </button>
                ) : activeTab === "delete" && deleteConfirm ? (
                    <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { fetchEndpoint(); setDeleteConfirm(false); }} style={{ background: C.red, border: "none", color: "#fff", padding: "8px 14px", cursor: "pointer", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>Confirm</button>
                        <button onClick={() => setDeleteConfirm(false)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, padding: "8px 12px", cursor: "pointer", fontSize: 11 }}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={fetchEndpoint} disabled={loading || !canSubmit} style={{ background: loading || !canSubmit ? C.dim : C.cyan, border: "none", color: loading || !canSubmit ? C.muted : "#fff", padding: "8px 18px", cursor: loading || !canSubmit ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                        {loading ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Loading...</> : <><Search size={12} /> Query</>}
                    </button>
                )}
            </div>

            <div style={{ padding: "16px 20px", minHeight: 120 }}>
                {error && <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}30`, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}><XCircle size={14} color={C.red} /><p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p></div>}
                {deleted && <div style={{ background: `${C.green}10`, border: `1px solid ${C.green}30`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}><CheckCircle2 size={14} color={C.green} /><div><p style={{ fontSize: 12, fontWeight: 700, color: C.green, margin: 0 }}>Deleted {deleted.deleted_records} record{deleted.deleted_records !== 1 ? "s" : ""}</p><p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>patient_id: {deleted.patient_id} · status: {deleted.status}</p></div></div>}

                {result && activeTab === "list" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <Label>{result.total_records} record{result.total_records !== 1 ? "s" : ""} for {result.patient_id}</Label>
                            <span style={{ fontSize: 10, color: C.muted }}>showing {result.records?.length}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {result.records?.map((rec, i) => <HistoryRecordCard key={rec.id} record={rec} index={i} />)}
                        </div>
                    </div>
                )}
                {result && activeTab === "latest" && <div><Label>Latest record for {result.patient_id}</Label><HistoryRecordCard record={result} index={0} /></div>}
                {result && activeTab === "request" && <div><Label>Record for request {result.request_id}</Label><HistoryRecordCard record={result} index={0} /></div>}
                {result && activeTab === "stats" && <div><div style={{ marginBottom: 14 }}><Label>Aggregate Stats — {result.patient_id}</Label></div><StatsPanel stats={result} /></div>}

                {!result && !error && !deleted && !loading && (
                    <div style={{ textAlign: "center", padding: "30px 0" }}>
                        <Database size={24} color={C.dim} style={{ margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{tabs.find(t => t.id === activeTab)?.label} — enter {needsRequestId ? "a request ID" : "a patient ID"} and query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
