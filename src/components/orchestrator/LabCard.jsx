import { AlertCircle, CheckCircle2, X, Zap, Activity } from "lucide-react";
import { SectionHeader, Badge, StatBox } from "./Shared";
import { BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED, ORANGE, CYAN, ACCENT } from "./tokens";

const sevColor = (s) => s === "CRITICAL" ? RED : s === "HIGH" ? ORANGE : s === "MODERATE" ? YELLOW : GREEN;

function ClinicalActions({ cds }) {
    if (!cds) return null;
    const allActions = [
        ...(cds.immediate_actions || []).map(a => ({ ...a, urgencyColor: RED })),
        ...(cds.urgent_actions || []).map(a => ({ ...a, urgencyColor: ORANGE })),
        ...(cds.routine_actions || []).map(a => ({ ...a, urgencyColor: CYAN })),
    ];
    if (allActions.length === 0 && !cds.monitoring_plan?.length) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {allActions.length > 0 && (
                <div>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Clinical Decision Support</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {allActions.map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${a.urgencyColor}`, borderRadius: 8 }}>
                                <Zap size={11} color={a.urgencyColor} style={{ flexShrink: 0, marginTop: 2 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{a.action}</p>
                                    {a.timeframe && <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{a.timeframe}</p>}
                                </div>
                                <Badge label={a.priority || "ACTION"} color={a.urgencyColor} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {cds.monitoring_plan?.length > 0 && (
                <div style={{ padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, margin: "0 0 5px" }}>Monitoring Plan</p>
                    {cds.monitoring_plan.map((m, i) => (
                        <p key={i} style={{ fontSize: 12, color: TEXT, margin: "0 0 2px" }}>• {m}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function LabCard({ finalData }) {
    const lab = finalData?.agent_outputs?.lab;
    if (!lab) return null;
    const summary = lab.lab_summary || {};
    const pattern = lab.pattern_analysis || {};
    const severity = lab.severity_score || {};

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Lab Analysis" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    <StatBox label="Severity"      value={summary.overall_severity ?? "N/A"} color={sevColor(summary.overall_severity)} />
                    <StatBox label="Total Results" value={summary.total_results ?? "-"} />
                    <StatBox label="Abnormal"      value={summary.abnormal_count ?? 0}        color={summary.abnormal_count > 0 ? YELLOW : TEXT} />
                    <StatBox label="Critical"      value={summary.critical_count ?? 0}        color={summary.critical_count > 0 ? RED : TEXT} />
                </div>

                {severity.risk_category && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Risk Category</p>
                            <p style={{ fontSize: 14, fontWeight: 900, color: sevColor(severity.risk_category), margin: 0 }}>{severity.risk_category}</p>
                        </div>
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Organ Systems</p>
                            <p style={{ fontSize: 14, fontWeight: 900, color: TEXT, margin: 0 }}>{severity.organ_systems_affected ?? 0}</p>
                        </div>
                    </div>
                )}

                {lab.critical_alerts?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 6px" }}>Critical Alerts</p>
                        {lab.critical_alerts.map((alert, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 8, marginBottom: 6 }}>
                                <AlertCircle size={13} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>{alert.message || JSON.stringify(alert)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {lab.flagged_results?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: YELLOW, margin: "0 0 6px" }}>Flagged Results</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {lab.flagged_results.map((r, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{r.display || r.test}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 12, color: TEXT, fontFamily: "monospace" }}>{r.value} {r.unit}</span>
                                        <Badge label={r.flag || "FLAG"} color={r.flag === "CRITICAL" ? RED : YELLOW} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {pattern.pattern_interpretation && (
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>Pattern Analysis</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{pattern.pattern_interpretation}</p>
                        {pattern.identified_patterns?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                                {pattern.identified_patterns.map((p, i) => (
                                    <Badge key={i} label={typeof p === "string" ? p : p.name || JSON.stringify(p)} color={ORANGE} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {lab.diagnosis_confirmation?.confirms_top_diagnosis !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {lab.diagnosis_confirmation.confirms_top_diagnosis
                            ? <CheckCircle2 size={14} color={GREEN} />
                            : <X size={14} color={RED} />}
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, fontWeight: 600 }}>
                            Labs {lab.diagnosis_confirmation.confirms_top_diagnosis ? "support" : "do not support"} top diagnosis
                        </p>
                        {lab.diagnosis_confirmation.reasoning && (
                            <p style={{ fontSize: 11, color: MUTED, margin: "4px 0 0", lineHeight: 1.5 }}>{lab.diagnosis_confirmation.reasoning}</p>
                        )}
                    </div>
                )}

                <ClinicalActions cds={lab.clinical_decision_support} />
            </div>
        </div>
    );
}
