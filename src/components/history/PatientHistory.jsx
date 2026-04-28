import { useState } from "react";
import {
    Clock, Search, Trash2, FileSearch, BarChart3,
    ChevronDown, ChevronRight, Loader2, CheckCircle2,
    XCircle, Database, AlertTriangle, RefreshCw, Calendar,
    User, Pill, FlaskConical, ShieldAlert, Scan, Activity,
    TrendingUp, Hash, Copy, Check
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
    text: "var(--color-text)",
    muted: "var(--color-text-subtle)",
    dim: "var(--color-border)",
};

// ── Tiny helpers ────────────────────────────────────────────────────────────

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

function StatusBadge({ ok }) {
    return ok
        ? <CheckCircle2 size={13} color={C.green} />
        : <XCircle size={13} color={C.red} />;
}

function MiniStat({ label, value, color = C.text }) {
    return (
        <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 18, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 9, color: C.muted, margin: "3px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
        </div>
    );
}

// ── Endpoint tab button ─────────────────────────────────────────────────────
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
            <span style={{ fontSize: 10, color: C.muted, display: "none" }}>{label}</span>
        </button>
    );
}

// ── Mini raw JSON panel inside record ──────────────────────────────────────
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
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 8,
            }}>
                <Label>Raw Record JSON</Label>
                <button onClick={handleCopy} style={{
                    background: "none", border: `1px solid ${C.border}`, color: C.muted,
                    padding: "2px 7px", cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                    {copied
                        ? <><Check size={9} color={C.green} /> Copied</>
                        : <><Copy size={9} /> Copy</>}
                </button>
            </div>
            <div style={{
                flex: 1, overflow: "auto", background: "var(--color-bg)",
                border: `1px solid ${C.border}`, padding: "10px 12px",
                fontFamily: "monospace", fontSize: 10, lineHeight: 1.6, color: "var(--color-text-subtle)",
                maxHeight: 420,
            }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {text}
                </pre>
            </div>
        </div>
    );
}

// ── Single history record card ──────────────────────────────────────────────
function HistoryRecordCard({ record, index }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            opacity: 0, animation: `fadeSlideIn 0.3s ease ${index * 0.05}s forwards`,
        }}>
            {/* ── Collapsed header ── */}
            <button
                onClick={() => setExpanded(p => !p)}
                style={{
                    width: "100%", background: "none", border: "none",
                    padding: "12px 14px", cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 12,
                }}
            >
                <span style={{
                    fontSize: 10, color: C.muted, fontFamily: "monospace",
                    minWidth: 22, textAlign: "right",
                }}>#{record.id}</span>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{
                        fontSize: 11, fontWeight: 700, color: C.text, fontFamily: "monospace",
                    }}>{record.request_id}</span>

                    <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                        color: record.source === "SHARP" ? C.accent : C.cyan,
                        border: `1px solid ${record.source === "SHARP" ? C.accent : C.cyan}40`,
                        padding: "1px 5px",
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
                        {record.fetch_time_ms ? `${record.fetch_time_ms}ms` : "—"}
                    </span>
                    <span style={{ fontSize: 10, color: C.muted }}>
                        {record.created_at?.split("T")[0]}
                    </span>
                    {expanded
                        ? <ChevronDown size={12} color={C.muted} />
                        : <ChevronRight size={12} color={C.muted} />}
                </div>
            </button>

            {/* ── Expanded body: stats bar + two-col layout ── */}
            {expanded && (
                <div style={{ borderTop: `1px solid ${C.border}` }}>

                    {/* Stats bar — full width */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 0, borderBottom: `1px solid ${C.border}`,
                    }}>
                        {[
                            { label: "CONDITIONS", value: record.conditions_count ?? 0, color: C.yellow },
                            { label: "MEDICATIONS", value: record.medications_count ?? 0, color: C.accent },
                            { label: "LABS", value: record.lab_results_count ?? 0, color: C.cyan },
                            { label: "ALLERGIES", value: record.allergies_count ?? 0, color: C.red },
                            { label: "REPORTS", value: record.diagnostic_reports_count ?? 0, color: C.green },
                        ].map(({ label, value, color }, i, arr) => (
                            <div key={label} style={{
                                padding: "14px 0", textAlign: "center",
                                borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                                background: C.bg,
                            }}>
                                <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
                                <p style={{ fontSize: 9, color: C.muted, margin: "4px 0 0", letterSpacing: "0.12em" }}>{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Two-col: structured LEFT, raw JSON RIGHT */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: 0, minHeight: 200,
                    }}>
                        {/* ── LEFT: structured detail ── */}
                        <div style={{
                            padding: "16px 14px", borderRight: `1px solid ${C.border}`,
                            display: "flex", flexDirection: "column", gap: 14,
                        }}>
                            {/* Demographics */}
                            {record.demographics && (
                                <div>
                                    <Label>Demographics</Label>
                                    <div style={{
                                        background: C.bg, border: `1px solid ${C.border}`,
                                        padding: "10px 12px", display: "flex", alignItems: "center", gap: 10,
                                    }}>
                                        <div style={{
                                            width: 32, height: 32, background: "#3D3A5C",
                                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                        }}>
                                            <User size={14} color="#fff" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>
                                                {record.demographics.name}
                                            </p>
                                            <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                                                {record.demographics.gender} · {record.demographics.age} yrs · DOB {record.demographics.dob}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FHIR meta */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div>
                                    <Label>FHIR Base URL</Label>
                                    <p style={{ fontSize: 10, color: C.cyan, fontFamily: "monospace", margin: 0, wordBreak: "break-all" }}>
                                        {record.fhir_base_url || "—"}
                                    </p>
                                </div>
                                <div>
                                    <Label>Resources Fetched</Label>
                                    <p style={{ fontSize: 10, color: C.text, fontFamily: "monospace", margin: 0 }}>
                                        {record.fhir_resources_fetched ?? 0} resource types
                                    </p>
                                </div>
                            </div>

                            {/* Active Conditions */}
                            {record.active_conditions?.length > 0 && (
                                <div>
                                    <Label>Active Conditions ({record.active_conditions.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.active_conditions.map((c, i) => (
                                            <div key={i} style={{
                                                background: C.bg, border: `1px solid ${C.border}`,
                                                padding: "6px 10px", display: "flex", gap: 8, alignItems: "center",
                                            }}>
                                                <div style={{ width: 5, height: 5, background: C.yellow, borderRadius: "50%", flexShrink: 0 }} />
                                                <span style={{ fontSize: 11, color: C.text }}>{c.display}</span>
                                                <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", marginLeft: "auto" }}>{c.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Medications */}
                            {record.medications?.length > 0 && (
                                <div>
                                    <Label>Medications ({record.medications.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.medications.map((m, i) => (
                                            <div key={i} style={{
                                                background: C.bg, border: `1px solid ${C.border}`,
                                                padding: "8px 10px",
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{m.drug}</span>
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 700,
                                                        color: m.status === "active" ? C.green : C.muted,
                                                        border: `1px solid ${m.status === "active" ? C.green : C.muted}40`,
                                                        padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.1em",
                                                    }}>{m.status}</span>
                                                </div>
                                                {(m.dose || m.frequency) && (
                                                    <p style={{ fontSize: 10, color: C.muted, margin: "3px 0 0" }}>
                                                        {[m.dose, m.frequency].filter(Boolean).join(" · ")}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lab Results */}
                            {record.lab_results?.length > 0 && (
                                <div>
                                    <Label>Lab Results ({record.lab_results.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.lab_results.map((l, i) => {
                                            const flagColor = { HIGH: C.red, LOW: C.yellow, CRITICAL: "#FF0000", NORMAL: C.green }[l.flag] || C.muted;
                                            return (
                                                <div key={i} style={{
                                                    background: C.bg, border: `1px solid ${C.border}`,
                                                    padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center",
                                                }}>
                                                    <div>
                                                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>{l.display}</p>
                                                        <p style={{ fontSize: 9, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>{l.loinc}</p>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <p style={{ fontSize: 13, fontWeight: 900, color: flagColor, margin: 0 }}>
                                                            {l.value} <span style={{ fontSize: 9, fontWeight: 400 }}>{l.unit}</span>
                                                        </p>
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 700, color: flagColor,
                                                            border: `1px solid ${flagColor}40`, padding: "1px 4px",
                                                        }}>{l.flag}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Allergies */}
                            {record.allergies?.length > 0 && (
                                <div>
                                    <Label>Allergies ({record.allergies.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.allergies.map((a, i) => (
                                            <div key={i} style={{
                                                background: `${C.red}10`, border: `1px solid ${C.red}30`,
                                                padding: "8px 10px", display: "flex", gap: 8, alignItems: "center",
                                            }}>
                                                <ShieldAlert size={12} color={C.red} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>{a.substance}</p>
                                                    {a.reaction && (
                                                        <p style={{ fontSize: 9, color: C.muted, margin: "2px 0 0" }}>
                                                            {a.reaction}{a.severity && ` · ${a.severity}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Diagnostic Reports */}
                            {record.diagnostic_reports?.length > 0 && (
                                <div>
                                    <Label>Diagnostic Reports ({record.diagnostic_reports.length})</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        {record.diagnostic_reports.map((r, i) => (
                                            <div key={i} style={{
                                                background: C.bg, border: `1px solid ${C.border}`,
                                                padding: "8px 10px", display: "flex", gap: 8, alignItems: "center",
                                            }}>
                                                <Scan size={12} color={C.cyan} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>{r.display}</p>
                                                    {r.conclusion && <p style={{ fontSize: 9, color: C.muted, margin: "2px 0 0" }}>{r.conclusion}</p>}
                                                    {r.issued && <p style={{ fontSize: 9, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>{r.issued?.split("T")[0]}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timestamp footer */}
                            <p style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", margin: "auto 0 0" }}>
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

// ── Stats panel ─────────────────────────────────────────────────────────────
function StatsPanel({ stats }) {
    const items = [
        { label: "Total Sessions", value: stats.total_fetch_sessions, color: C.text },
        { label: "Cache Hits", value: stats.cache_hit_sessions, color: C.green },
        { label: "Cache Misses", value: stats.cache_miss_sessions, color: C.yellow },
        { label: "SHARP Sessions", value: stats.sharp_sessions, color: C.accent },
        { label: "Direct Sessions", value: stats.direct_sessions, color: C.cyan },
        { label: "Imaging Available", value: stats.imaging_available_sessions, color: C.cyan },
        { label: "Avg Fetch (ms)", value: stats.avg_fetch_time_ms ?? "—", color: C.text },
        { label: "Avg Conditions", value: stats.avg_conditions_count ?? "—", color: C.yellow },
        { label: "Avg Medications", value: stats.avg_medications_count ?? "—", color: C.accent },
        { label: "Peak Conditions", value: stats.peak_conditions_count, color: C.red },
        { label: "Peak Labs", value: stats.peak_lab_results_count, color: C.red },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Overview grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 8,
            }}>
                {items.map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: C.card, border: `1px solid ${C.border}`,
                        padding: "12px 14px",
                    }}>
                        <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
                        <p style={{ fontSize: 9, color: C.muted, margin: "4px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                padding: "12px 14px", display: "flex", gap: 24,
            }}>
                <div>
                    <Label>First Fetch</Label>
                    <p style={{ fontSize: 12, color: C.text, fontFamily: "monospace", margin: 0 }}>
                        {stats.first_fetch?.split("T")[0] ?? "—"}
                    </p>
                </div>
                <div>
                    <Label>Latest Fetch</Label>
                    <p style={{ fontSize: 12, color: C.green, fontFamily: "monospace", margin: 0 }}>
                        {stats.latest_fetch?.split("T")[0] ?? "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Main PatientHistory component ───────────────────────────────────────────
export default function PatientHistory({ defaultPatientId = "" }) {
    const BASE = "http://127.0.0.1:8001";

    const [activeTab, setActiveTab] = useState("list"); // list | latest | request | stats
    const [patientId, setPatientId] = useState(defaultPatientId);
    const [requestId, setRequestId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // DELETE state
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
        <div style={{
            background: C.panel, border: `1px solid ${C.border}`,
            fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
            {/* Section header */}
            <div style={{
                padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 10,
            }}>
                <div style={{
                    width: 30, height: 30, background: `${C.accent}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Clock size={14} color={C.accent} />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "0.05em" }}>
                        Patient Fetch History
                    </p>
                    <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>
                        Query the /history endpoints on the Patient Context Agent
                    </p>
                </div>
            </div>

            {/* Tab bar */}
            <div style={{
                display: "flex", gap: 0, overflowX: "auto",
                borderBottom: `1px solid ${C.border}`,
                padding: "0 20px",
            }}>
                {tabs.map(t => (
                    <EndpointTab
                        key={t.id}
                        active={activeTab === t.id}
                        onClick={() => { setActiveTab(t.id); setResult(null); setError(null); setDeleted(null); }}
                        method={t.method}
                        path={t.path}
                        label={t.label}
                    />
                ))}
            </div>

            {/* Input area */}
            <div style={{
                padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap",
            }}>
                {needsPatientId && (
                    <div style={{ flex: "1 1 180px" }}>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>
                            PATIENT ID
                        </p>
                        <input
                            value={patientId}
                            onChange={e => setPatientId(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && canSubmit && fetchEndpoint()}
                            placeholder="e.g. example"
                            style={{
                                width: "100%", background: C.bg, border: `1px solid ${C.border}`,
                                color: C.text, padding: "8px 11px", fontSize: 12,
                                outline: "none", fontFamily: "monospace",
                            }}
                        />
                    </div>
                )}

                {needsRequestId && (
                    <div style={{ flex: "1 1 200px" }}>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>
                            REQUEST ID
                        </p>
                        <input
                            value={requestId}
                            onChange={e => setRequestId(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && canSubmit && fetchEndpoint()}
                            placeholder="e.g. a1b2c3d4"
                            style={{
                                width: "100%", background: C.bg, border: `1px solid ${C.border}`,
                                color: C.text, padding: "8px 11px", fontSize: 12,
                                outline: "none", fontFamily: "monospace",
                            }}
                        />
                    </div>
                )}

                {activeTab === "delete" && (
                    <div style={{ flex: "1 1 200px" }}>
                        <p style={{ fontSize: 10, color: C.muted, margin: "0 0 4px", fontWeight: 600 }}>
                            INTERNAL TOKEN
                        </p>
                        <input
                            value={deleteToken}
                            onChange={e => setDeleteToken(e.target.value)}
                            placeholder="meditwin-internal"
                            type="password"
                            style={{
                                width: "100%", background: C.bg, border: `1px solid ${C.red}40`,
                                color: C.text, padding: "8px 11px", fontSize: 12,
                                outline: "none", fontFamily: "monospace",
                            }}
                        />
                    </div>
                )}

                {activeTab === "delete" && !deleteConfirm ? (
                    <button
                        onClick={() => setDeleteConfirm(true)}
                        disabled={!patientId.trim()}
                        style={{
                            background: `${C.red}20`, border: `1px solid ${C.red}60`,
                            color: C.red, padding: "8px 16px", cursor: "pointer",
                            fontSize: 11, fontWeight: 800, letterSpacing: "0.12em",
                            textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
                        }}
                    >
                        <Trash2 size={12} /> Delete
                    </button>
                ) : activeTab === "delete" && deleteConfirm ? (
                    <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => { fetchEndpoint(); setDeleteConfirm(false); }} style={{
                            background: C.red, border: "none", color: "#fff",
                            padding: "8px 14px", cursor: "pointer",
                            fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                        }}>
                            Confirm Delete
                        </button>
                        <button onClick={() => setDeleteConfirm(false)} style={{
                            background: "none", border: `1px solid ${C.border}`, color: C.muted,
                            padding: "8px 12px", cursor: "pointer", fontSize: 11,
                        }}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={fetchEndpoint}
                        disabled={loading || !canSubmit}
                        style={{
                            background: loading || !canSubmit ? C.dim : "#3D3A5C",
                            border: "none", color: "#fff", padding: "8px 18px",
                            cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                            fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
                            textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
                            transition: "all 0.2s",
                        }}
                    >
                        {loading
                            ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Loading...</>
                            : <><Search size={12} /> Query</>}
                    </button>
                )}
            </div>

            {/* Results */}
            <div style={{ padding: "16px 20px", minHeight: 120 }}>
                {/* Error */}
                {error && (
                    <div style={{
                        background: `${C.red}10`, border: `1px solid ${C.red}30`,
                        padding: "12px 14px", display: "flex", alignItems: "center", gap: 8,
                    }}>
                        <XCircle size={14} color={C.red} />
                        <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* Delete success */}
                {deleted && (
                    <div style={{
                        background: `${C.green}10`, border: `1px solid ${C.green}30`,
                        padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                    }}>
                        <CheckCircle2 size={14} color={C.green} />
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: C.green, margin: 0 }}>
                                Deleted {deleted.deleted_records} record{deleted.deleted_records !== 1 ? "s" : ""}
                            </p>
                            <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0", fontFamily: "monospace" }}>
                                patient_id: {deleted.patient_id} · status: {deleted.status}
                            </p>
                        </div>
                    </div>
                )}

                {/* LIST: history records */}
                {result && activeTab === "list" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginBottom: 12,
                        }}>
                            <Label>{result.total_records} record{result.total_records !== 1 ? "s" : ""} for {result.patient_id}</Label>
                            <span style={{ fontSize: 10, color: C.muted }}>
                                showing {result.records?.length}
                            </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {result.records?.map((rec, i) => (
                                <HistoryRecordCard key={rec.id} record={rec} index={i} />
                            ))}
                        </div>
                    </div>
                )}

                {/* LATEST: single record */}
                {result && activeTab === "latest" && (
                    <div>
                        <Label>Latest record for {result.patient_id}</Label>
                        <HistoryRecordCard record={result} index={0} />
                    </div>
                )}

                {/* REQUEST: single record by request_id */}
                {result && activeTab === "request" && (
                    <div>
                        <Label>Record for request {result.request_id}</Label>
                        <HistoryRecordCard record={result} index={0} />
                    </div>
                )}

                {/* STATS */}
                {result && activeTab === "stats" && (
                    <div>
                        <div style={{ marginBottom: 14 }}>
                            <Label>Aggregate Stats — {result.patient_id}</Label>
                        </div>
                        <StatsPanel stats={result} />
                    </div>
                )}

                {/* Empty state */}
                {!result && !error && !deleted && !loading && (
                    <div style={{ textAlign: "center", padding: "30px 0" }}>
                        <Database size={24} color={C.dim} style={{ margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                            {tabs.find(t => t.id === activeTab)?.label} — enter {needsRequestId ? "a request ID" : "a patient ID"} and query
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}