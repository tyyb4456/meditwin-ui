/**
 * components/agents/patient/Result.jsx
 * ──────────────────────────────────────
 * FIXED: All 12 lab results now visible
 * 
 * Change: SectionCard overflow handling fixed
 */
import { useState, useRef, useCallback } from "react";
import {
    User, Activity, Pill, FlaskConical, AlertTriangle,
    FileText, Database, Heart, Clock,
    ShieldAlert, Scan, Copy, Check, Hash, CalendarDays,
} from "lucide-react";

const ACCENT  = "var(--color-accent)";
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const GREEN   = "#22C55E";
const AMBER   = "#F59E0B";
const RED     = "#EF4444";
const CYAN    = "#06B6D4";

const typeColor = {
    status: CYAN, progress: ACCENT, complete: GREEN, error: RED, result: GREEN,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function EventEntry({ evt, index }) {
    const color = typeColor[evt.type] || SUBTLE;
    return (
        <div style={{
            display: "flex", gap: 10, padding: "7px 0",
            borderBottom: `1px solid ${BORDER}`,
            opacity: 0, animation: `fadeIn 0.3s ease ${index * 0.03}s forwards`,
        }}>
            <span style={{
                color: SUBTLE, fontSize: 10, fontFamily: "monospace",
                minWidth: 22, paddingTop: 1, flexShrink: 0,
            }}>
                {String(index + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                        textTransform: "uppercase", color,
                        background: `${color}14`, border: `1px solid ${color}35`,
                        padding: "1px 6px", borderRadius: 3, fontFamily: "monospace", flexShrink: 0,
                    }}>{evt.type}</span>
                    {evt.step > 0 && (
                        <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>
                            step {evt.step}/{evt.total}
                        </span>
                    )}
                    {evt.pct !== undefined && (
                        <span style={{ fontSize: 10, color: ACCENT, fontFamily: "monospace" }}>{evt.pct}%</span>
                    )}
                </div>

                {evt.message && (
                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>
                        {evt.message}
                    </p>
                )}
                {evt.type === "complete" && evt.data?.summary && (
                    <p style={{ fontSize: 10, color: GREEN, margin: "4px 0 0", fontFamily: "monospace" }}>
                        ✓ {evt.data.summary.name} · age {evt.data.summary.age} · {evt.data.summary.conditions} conditions · {evt.data.summary.medications} meds
                    </p>
                )}
                {evt.type === "progress" && (
                    <div style={{ marginTop: 5, height: 2, background: BORDER, borderRadius: 1 }}>
                        <div style={{
                            height: "100%", width: `${evt.pct}%`,
                            background: ACCENT, borderRadius: 1, transition: "width 0.4s ease",
                        }} />
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color = ACCENT }) {
    return (
        <div style={{
            background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        }}>
            <div style={{
                width: 36, height: 36, background: `${color}18`, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
                <Icon size={16} color={color} strokeWidth={1.75} />
            </div>
            <div>
                <p style={{ fontSize: 22, fontWeight: 900, color: TEXT, margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{
                    fontSize: 10, color: SUBTLE, margin: "3px 0 0",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                }}>{label}</p>
            </div>
        </div>
    );
}

function SectionCard({ title, icon: Icon, iconColor = ACCENT, children }) {
    return (
        <div style={{ 
            background: SURFACE, 
            border: `1px solid ${BORDER}`, 
            borderRadius: 12, 
            overflow: "visible"  // ← FIXED: was "hidden", now all content shows
        }}>
            <div style={{
                padding: "12px 16px", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", gap: 8,
            }}>
                <div style={{
                    width: 28, height: 28, background: `${iconColor}18`, borderRadius: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={13} color={iconColor} strokeWidth={2} />
                </div>
                <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: TEXT,
                }}>{title}</span>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {children}
            </div>
        </div>
    );
}

function ConditionBadge({ condition }) {
    return (
        <div style={{
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: "10px 14px",
            display: "flex", gap: 10, alignItems: "center",
        }}>
            <Activity size={13} color={AMBER} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{condition.display}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 9, color: SUBTLE, fontFamily: "monospace" }}>{condition.code}</span>
                    {condition.onset && (
                        <span style={{ fontSize: 9, color: MUTED }}>onset: {condition.onset.split("T")[0]}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function MedBadge({ med }) {
    const statusColor = med.status === "active" ? GREEN : SUBTLE;
    return (
        <div style={{
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: "10px 14px",
            display: "flex", gap: 10, alignItems: "flex-start",
        }}>
            <Pill size={13} color={statusColor} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{med.drug}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{med.dose}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 9, color: SUBTLE }}>{med.frequency}</span>
                    <span style={{
                        fontSize: 9, fontWeight: 700, color: statusColor,
                        background: `${statusColor}14`, border: `1px solid ${statusColor}35`,
                        padding: "1px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>{med.status}</span>
                </div>
            </div>
        </div>
    );
}

function LabRow({ lab }) {
    const flagColor = { HIGH: RED, LOW: AMBER, CRITICAL: "#FF0000", NORMAL: GREEN }[lab.flag] || SUBTLE;
    const hasRange = lab.reference_high != null;
    const pct = hasRange ? Math.min(100, Math.round((lab.value / lab.reference_high) * 100)) : null;
    const isFlagged = lab.flag && lab.flag !== "NORMAL";

    return (
        <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{lab.display}</p>
                    <p style={{ fontSize: 9, color: SUBTLE, margin: "2px 0 0", fontFamily: "monospace" }}>{lab.loinc}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 900, color: flagColor, margin: 0 }}>
                        {lab.value}{" "}
                        <span style={{ fontSize: 10, fontWeight: 400 }}>{lab.unit}</span>
                    </p>
                    <span style={{
                        fontSize: 9, fontWeight: 700, color: flagColor,
                        background: `${flagColor}14`, border: `1px solid ${flagColor}35`,
                        padding: "1px 5px", borderRadius: 3, letterSpacing: "0.1em",
                    }}>{lab.flag}</span>
                </div>
            </div>

            {hasRange && (
                <>
                    <div style={{ height: 3, background: BORDER, borderRadius: 2 }}>
                        <div style={{
                            height: "100%", width: `${pct}%`,
                            background: flagColor, borderRadius: 2, maxWidth: "100%",
                        }} />
                    </div>
                    <p style={{ fontSize: 9, color: SUBTLE, margin: "3px 0 0" }}>
                        ref: {lab.reference_low ?? 0} – {lab.reference_high} {lab.unit}
                    </p>
                </>
            )}

            {!hasRange && isFlagged && (
                <p style={{ fontSize: 9, color: flagColor, margin: "2px 0 0", opacity: 0.7 }}>
                    No reference range on file
                </p>
            )}
        </div>
    );
}

function AllergyChip({ allergy }) {
    return (
        <div style={{
            background: `${RED}10`, border: `1px solid ${RED}40`,
            borderRadius: 8, padding: "8px 12px",
            display: "flex", gap: 8, alignItems: "center",
        }}>
            <ShieldAlert size={13} color={RED} />
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{allergy.display}</p>
                {allergy.severity && (
                    <span style={{ fontSize: 9, color: RED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {allergy.severity}
                    </span>
                )}
            </div>
        </div>
    );
}

function EncounterRow({ encounter }) {
    return (
        <div style={{
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: "10px 14px",
            display: "flex", gap: 10, alignItems: "flex-start",
        }}>
            <FileText size={13} color={SUBTLE} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{encounter.type || "Encounter"}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{encounter.reason || "No reason documented"}</p>
                {encounter.date && (
                    <p style={{ fontSize: 9, color: SUBTLE, margin: "2px 0 0", fontFamily: "monospace" }}>
                        {encounter.date.split("T")[0]}
                    </p>
                )}
            </div>
        </div>
    );
}

function Divider({ onMouseDown }) {
    return (
        <div
            className="patient-divider"
            onMouseDown={onMouseDown}
            style={{
                width: 3, cursor: "col-resize", background: BORDER,
                position: "relative", flexShrink: 0,
            }}
        >
            <div style={{
                position: "absolute", left: -2, top: 0, bottom: 0, width: 7, cursor: "col-resize",
            }} />
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PatientResultPanel({ status, elapsed, events, patientState, cacheHit }) {
    const [[p1, p2, p3], setPcts] = useState([25, 35, 40]);
    const dragRef = useRef(null);

    const startDrag = useCallback((divIdx, e) => {
        e.preventDefault();
        const startX = e.clientX;
        const [oldP1, oldP2, oldP3] = [p1, p2, p3];

        const onMove = (me) => {
            const dx = me.clientX - startX;
            const containerW = window.innerWidth - 48;
            const delta = (dx / containerW) * 100;
            if (divIdx === 0) {
                const newP1 = Math.max(15, Math.min(50, oldP1 + delta));
                const newP2 = oldP2 - delta;
                if (newP2 < 15 || newP2 > 60) return;
                setPcts([newP1, newP2, oldP3]);
            } else {
                const newP2 = Math.max(15, Math.min(60, oldP2 + delta));
                const newP3 = oldP3 - delta;
                if (newP3 < 20 || newP3 > 60) return;
                setPcts([oldP1, newP2, newP3]);
            }
        };

        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }, [p1, p2, p3]);

    const ps = patientState;
    const demo = ps?.demographics;
    const pcts = [p1, p2, p3];

    const [copied, setCopied] = useState(false);
    const copyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify(ps, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const PANEL_H = "calc(100vh - 180px)";

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1024px) {
                    .patient-panel-grid { flex-direction: column !important; }
                    .patient-col { flex: none !important; width: 100% !important; height: 500px !important; margin-bottom: 8px; }
                    .patient-col.right-panel { height: auto !important; max-height: none !important; overflow: visible !important; }
                    .patient-divider { display: none !important; }
                    .patient-stat-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            {/* ── Content grid ── */}
            <div style={{ maxWidth: 1400, margin: "0 auto 16px", padding: "0 16px", overflowX: "hidden" }}>
                <div className="patient-panel-grid" style={{ display: "flex", gap: 12 }}>
                    {/* ── LEFT: SSE stream ── */}
                    <div className="patient-col" style={{
                        flex: `0 0 calc(${pcts[0]}% - 12px)`,
                        height: PANEL_H, overflowY: "auto",
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 12, padding: 16, minWidth: 0,
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            paddingBottom: 12, borderBottom: `1px solid ${BORDER}`, marginBottom: 12,
                        }}>
                            <Database size={14} color={ACCENT} />
                            <span style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                                textTransform: "uppercase", color: TEXT,
                            }}>SSE STREAM</span>
                            <span style={{
                                marginLeft: "auto", fontSize: 10, color: SUBTLE,
                                fontFamily: "monospace", background: BG,
                                border: `1px solid ${BORDER}`, padding: "2px 7px", borderRadius: 4,
                            }}>{events.length} events</span>
                        </div>
                        {events.map((evt, i) => <EventEntry key={i} evt={evt} index={i} />)}
                    </div>

                    <Divider onMouseDown={(e) => startDrag(0, e)} />

                    {/* ── MIDDLE: Raw JSON ── */}
                    <div className="patient-col" style={{
                        flex: `0 0 calc(${pcts[1]}% - 12px)`,
                        height: PANEL_H, overflowY: "auto",
                        background: SURFACE, border: `1px solid ${BORDER}`,
                        borderRadius: 12, padding: 16, minWidth: 0,
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            paddingBottom: 12, borderBottom: `1px solid ${BORDER}`, marginBottom: 12,
                        }}>
                            <Database size={14} color={CYAN} />
                            <span style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                                textTransform: "uppercase", color: TEXT,
                            }}>RAW PATIENTSTATE</span>
                            <button
                                onClick={copyJSON}
                                style={{
                                    marginLeft: "auto", padding: "4px 9px", fontSize: 10,
                                    background: copied ? GREEN : BG, color: copied ? "#fff" : TEXT,
                                    border: `1px solid ${copied ? GREEN : BORDER}`,
                                    borderRadius: 5, cursor: "pointer", display: "flex",
                                    alignItems: "center", gap: 5, fontWeight: 600, transition: "all 0.2s",
                                }}
                            >
                                {copied ? <Check size={11} /> : <Copy size={11} />}
                                {copied ? "COPIED" : "COPY"}
                            </button>
                        </div>
                        <pre style={{
                            fontSize: 10, fontFamily: "monospace", color: TEXT,
                            margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all",
                        }}>
                            {JSON.stringify(ps, null, 2)}
                        </pre>
                    </div>

                    {ps && (
                        <>
                            <Divider onMouseDown={(e) => startDrag(1, e)} />

                            {/* ── RIGHT: Patient cards ── */}
                            <div className="patient-col right-panel" style={{
                                flex: `0 0 calc(${pcts[2]}% - 12px)`,
                                height: PANEL_H, overflowY: "auto",
                                display: "flex", flexDirection: "column", gap: 12,
                                paddingRight: 2, minWidth: 0,
                            }}>
                                {/* Demographics */}
                                {demo && (
                                    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "visible" }}>
                                        <div style={{ padding: "16px 16px 0" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                                                <div style={{
                                                    width: 44, height: 44, background: `${ACCENT}18`, borderRadius: 12,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    flexShrink: 0, border: `1px solid ${ACCENT}25`,
                                                }}>
                                                    <User size={20} color={ACCENT} strokeWidth={1.75} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 17, fontWeight: 900, color: TEXT, margin: 0, letterSpacing: "-0.01em" }}>{demo.name}</p>
                                                    <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{demo.gender} · {demo.age} yrs · DOB {demo.dob}</p>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: "flex", gap: 8, marginBottom: 12, padding: "8px 10px",
                                                background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, flexWrap: "wrap",
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, minWidth: 100 }}>
                                                    <Hash size={10} color={SUBTLE} />
                                                    <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>{ps.patient_id}</span>
                                                </div>
                                                {ps.state_timestamp && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                        <Clock size={10} color={SUBTLE} />
                                                        <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>
                                                            {ps.state_timestamp.replace("T", " ").split(".")[0]}Z
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="patient-stat-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingBottom: 14 }}>
                                                <StatCard icon={Heart}         label="Conditions"  value={ps.active_conditions?.length ?? 0} color={AMBER} />
                                                <StatCard icon={Pill}          label="Medications" value={ps.medications?.length ?? 0}        color={ACCENT} />
                                                <StatCard icon={FlaskConical}  label="Lab Results" value={ps.lab_results?.length ?? 0}        color={CYAN} />
                                                <StatCard icon={AlertTriangle} label="Allergies"   value={ps.allergies?.length ?? 0}          color={RED} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {ps.active_conditions?.length > 0 && (
                                    <SectionCard title="Active Conditions" icon={Activity} iconColor={AMBER}>
                                        {ps.active_conditions.map((c, i) => <ConditionBadge key={i} condition={c} />)}
                                    </SectionCard>
                                )}
                                {ps.medications?.length > 0 && (
                                    <SectionCard title="Medications" icon={Pill} iconColor={ACCENT}>
                                        {ps.medications.map((m, i) => <MedBadge key={i} med={m} />)}
                                    </SectionCard>
                                )}
                                {ps.lab_results?.length > 0 && (
                                    <SectionCard title="Lab Results" icon={FlaskConical} iconColor={CYAN}>
                                        {ps.lab_results.map((l, i) => <LabRow key={i} lab={l} />)}
                                    </SectionCard>
                                )}
                                {ps.allergies?.length > 0 && (
                                    <SectionCard title="Allergies & Reactions" icon={ShieldAlert} iconColor={RED}>
                                        {ps.allergies.map((a, i) => <AllergyChip key={i} allergy={a} />)}
                                    </SectionCard>
                                )}
                                {ps.diagnostic_reports?.length > 0 && (
                                    <SectionCard title="Diagnostic Reports" icon={Scan} iconColor={CYAN}>
                                        {ps.diagnostic_reports.map((r, i) => (
                                            <div key={i} style={{
                                                background: BG, border: `1px solid ${BORDER}`,
                                                borderRadius: 8, padding: "10px 14px",
                                                display: "flex", gap: 10, alignItems: "flex-start",
                                            }}>
                                                <Scan size={13} color={CYAN} style={{ flexShrink: 0, marginTop: 1 }} />
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{r.display}</p>
                                                        <span style={{
                                                            fontSize: 9, color: SUBTLE, fontFamily: "monospace",
                                                            background: BG, border: `1px solid ${BORDER}`,
                                                            padding: "1px 5px", borderRadius: 3, flexShrink: 0,
                                                        }}>{r.code}</span>
                                                    </div>
                                                    {r.conclusion && <p style={{ fontSize: 10, color: MUTED, margin: "3px 0 0" }}>{r.conclusion}</p>}
                                                    {r.issued && <p style={{ fontSize: 9, color: SUBTLE, margin: "2px 0 0", fontFamily: "monospace" }}>{r.issued?.split("T")[0]}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </SectionCard>
                                )}
                                {ps.recent_encounters?.length > 0 && (
                                    <SectionCard title="Recent Encounters" icon={FileText} iconColor={SUBTLE}>
                                        {ps.recent_encounters.map((e, i) => <EncounterRow key={i} encounter={e} />)}
                                    </SectionCard>
                                )}
                                {ps.imaging_available && (
                                    <div style={{
                                        background: `${CYAN}0E`, border: `1px solid ${CYAN}30`,
                                        borderRadius: 10, padding: "10px 14px",
                                        display: "flex", gap: 8, alignItems: "center",
                                    }}>
                                        <Scan size={14} color={CYAN} />
                                        <p style={{ fontSize: 12, fontWeight: 700, color: CYAN, margin: 0 }}>Imaging data available</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Footer status ── */}
            {status === "done" && ps && (
                <div style={{ maxWidth: 1400, margin: "0 auto 8px", padding: "0 24px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: GREEN, fontFamily: "monospace" }}>
                        ✓ Patient state loaded in {elapsed}s — {cacheHit ? "served from Redis cache" : "fetched from FHIR server"}
                    </span>
                </div>
            )}
        </>
    );
}