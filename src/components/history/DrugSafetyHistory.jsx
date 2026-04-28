import { useState } from "react";
import {
    Clock, Search, Trash2, Database, AlertTriangle, Shield,
    ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle,
    Copy, Check, ShieldAlert, ShieldCheck, ShieldX, Activity
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
    amber: "#f59e0b",
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
    dim: "var(--color-border)",
};

const safetyColor = (status) => {
    if (!status) return C.muted;
    const s = status.toUpperCase();
    if (s === "UNSAFE") return C.red;
    if (s === "CAUTION") return C.yellow;
    if (s === "SAFE") return C.green;
    return C.muted;
};

const safetyIcon = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "UNSAFE") return ShieldX;
    if (s === "CAUTION") return ShieldAlert;
    if (s === "SAFE") return ShieldCheck;
    return Shield;
};

const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return C.red;
    if (s === "HIGH") return C.orange;
    if (s === "MODERATE") return C.yellow;
    if (s === "LOW" || s === "MINIMAL") return C.green;
    return C.muted;
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
    const colors = { GET: C.amber, DELETE: C.red };
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
    const sColor = safetyColor(record.safety_status);
    const SIcon = safetyIcon(record.safety_status);

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
                        color: sColor, border: `1px solid ${sColor}40`, padding: "1px 5px",
                        display: "flex", alignItems: "center", gap: 4
                    }}>
                        <SIcon size={9} />
                        {record.safety_status}
                    </span>
                    {record.overall_risk_level && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                            color: severityColor(record.overall_risk_level), border: `1px solid ${severityColor(record.overall_risk_level)}40`, padding: "1px 5px",
                        }}>{record.overall_risk_level} RISK</span>
                    )}
                    {record.llm_enriched && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, color: C.purple,
                            border: `1px solid ${C.purple}40`, padding: "1px 5px",
                        }}>LLM ENRICHED</span>
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
                            
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                {[
                                    { label: "Contras", value: record.contraindication_count, color: record.contraindication_count > 0 ? C.red : C.green },
                                    { label: "Interacts", value: record.interaction_count, color: record.interaction_count > 0 ? C.orange : C.green },
                                    { label: "Black Box", value: record.black_box_count, color: record.black_box_count > 0 ? C.red : C.green }
                                ].map((stat, i) => (
                                    <div key={i} style={{ background: C.bg, padding: "8px 10px", border: `1px solid ${C.border}`, borderTop: `3px solid ${stat.color}` }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>{stat.label}</p>
                                        <p style={{ fontSize: 14, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderLeft: `4px solid ${sColor}`, padding: "10px 12px" }}>
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Recommended Action</p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{record.recommended_action || "None specified"}</p>
                                {record.interaction_risk_narrative && (
                                    <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0", fontStyle: "italic" }}>{record.interaction_risk_narrative}</p>
                                )}
                            </div>

                            {record.flagged_medications?.length > 0 && (
                                <div>
                                    <Label>Flagged Medications</Label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {record.flagged_medications.map((m, i) => (
                                            <span key={i} style={{ fontSize: 10, fontWeight: 700, color: C.red, background: `${C.red}18`, border: `1px solid ${C.red}30`, padding: "2px 8px", borderRadius: 12 }}>
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {record.contraindications?.length > 0 && (
                                <div>
                                    <Label>Contraindications ({record.contraindications.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.contraindications.slice(0, 3).map((c, i) => (
                                            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "8px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                                                <AlertTriangle size={12} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{c.drug}</p>
                                                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{c.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {record.contraindications.length > 3 && <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>+ {record.contraindications.length - 3} more</p>}
                                    </div>
                                </div>
                            )}

                            {record.critical_interactions?.length > 0 && (
                                <div>
                                    <Label>Interactions ({record.critical_interactions.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.critical_interactions.slice(0, 3).map((inter, i) => (
                                            <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "8px 10px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                                                <Activity size={12} color={severityColor(inter.severity)} style={{ flexShrink: 0, marginTop: 2 }} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>
                                                        {inter.drugs ? inter.drugs.join(" ↔ ") : [inter.drug_a, inter.drug_b].filter(Boolean).join(" ↔ ")}
                                                    </p>
                                                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{inter.description || inter.clinical_significance || "Interaction details not available."}</p>
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
        { label: "Total Checks", value: stats.total_checks, color: C.text },
        { label: "Unsafe Verdicts", value: stats.unsafe_count, color: C.red },
        { label: "Total Contras", value: stats.total_contraindications, color: C.orange },
        { label: "Interactions", value: stats.total_interactions, color: C.yellow },
        { label: "Black Box", value: stats.total_black_box_warnings, color: C.red },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {items.map(({ label, value, color }) => (
                    <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px" }}>
                        <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: 9, color: C.muted, margin: "4px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {stats.most_flagged_drugs && stats.most_flagged_drugs.length > 0 && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px" }}>
                        <Label>Most Flagged Drugs</Label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {stats.most_flagged_drugs.map((d, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: C.text }}>{d.drug}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{d.flag_count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {stats.risk_level_breakdown && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px" }}>
                        <Label>Risk Level Breakdown</Label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {Object.entries(stats.risk_level_breakdown).map(([level, count], i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: 3, background: severityColor(level) }} />
                                        <span style={{ fontSize: 11, color: C.text, fontFamily: "monospace" }}>{level}</span>
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
                    <Label>First Check</Label>
                    <p style={{ fontSize: 12, color: C.text, fontFamily: "monospace", margin: 0 }}>
                        {stats.first_check?.split("T")[0] ?? "—"}
                    </p>
                </div>
                <div>
                    <Label>Latest Check</Label>
                    <p style={{ fontSize: 12, color: C.amber, fontFamily: "monospace", margin: 0 }}>
                        {stats.latest_check?.split("T")[0] ?? "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function DrugSafetyHistory({ defaultPatientId = "" }) {
    const BASE = "http://127.0.0.1:8004";

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
                <div style={{ width: 30, height: 30, background: `${C.amber}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Shield size={14} color={C.amber} />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "0.05em" }}>Drug Safety History</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>Query the /history endpoints on the Drug Safety Agent</p>
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
                        <input value={patientId} onChange={e => setPatientId(e.target.value)} onKeyDown={e => e.key === "Enter" && canSubmit && fetchEndpoint()} placeholder="e.g. test-patient-001" style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "8px 11px", fontSize: 12, outline: "none", fontFamily: "monospace" }} />
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
                    <button onClick={fetchEndpoint} disabled={loading || !canSubmit} style={{ background: loading || !canSubmit ? C.dim : C.amber, border: "none", color: loading || !canSubmit ? C.muted : "#fff", padding: "8px 18px", cursor: loading || !canSubmit ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
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
