import {
    Shield, FileJson, AlertCircle, Loader2, ChevronDown,
    AlertTriangle, Copy, Check, X,
    Pill, ShieldAlert, ShieldCheck, ShieldX, Activity, Zap, CheckCircle2, FileWarning
} from "lucide-react";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    accent: "#f59e0b", text: "var(--color-text)", muted: "var(--color-text-subtle)",
    dim: "var(--color-border)", green: "#22C55E", yellow: "#EAB308",
    red: "#EF4444", cyan: "#06B6D4", orange: "#F97316", purple: "#8b5cf6", amber: "#f59e0b", blue: "#60A5FA",
};

const safetyColor = (status) => {
    if (!status) return C.muted;
    const s = status.toUpperCase();
    if (s === "UNSAFE")  return C.red;
    if (s === "CAUTION") return C.yellow;
    if (s === "SAFE")    return C.green;
    return C.muted;
};
const safetyIcon = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "UNSAFE")  return ShieldX;
    if (s === "CAUTION") return ShieldAlert;
    if (s === "SAFE")    return ShieldCheck;
    return Shield;
};
const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return C.red;
    if (s === "HIGH")     return C.orange;
    if (s === "MODERATE") return C.yellow;
    return C.green;
};

export default function DrugResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, displayResult, isFinal,
    expandedContra, setExpandedContra,
    expandedInteract, setExpandedInteract,
    expandedAlt, setExpandedAlt,
    handleCopy, handleAbort, copied,
}) {
    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,    "#FEE2E2"],
            complete: [C.green,  "#DCFCE7"],
            status:   [C.amber,  "#FEF3C7"],
            progress: [C.yellow, "#FEF9C3"],
        };
        const [fg, bg] = map[type] || ["#6B7280", "#F3F4F6"];
        return {
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 6px", borderRadius: 2, color: fg, background: bg, fontFamily: "monospace",
        };
    };

    return (
        <div style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.text }}>
                    Live Stream Output
                </span>
                {isStreaming && (
                    <button onClick={handleAbort} style={{
                        padding: "4px 10px", border: `1px solid ${C.red}`, color: C.red,
                        background: "none", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5,
                    }}>
                        <X size={11} /> Abort
                    </button>
                )}
            </div>

            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

                {currentStep && (
                    <div style={{ padding: "10px 14px", background: C.amber, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{currentStep}</span>
                    </div>
                )}

                {error && (
                    <div style={{ padding: "10px 14px", background: `${C.red}12`, border: `1px solid ${C.red}40`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <AlertCircle size={14} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: C.red, margin: "0 0 3px" }}>Stream Error</p>
                            <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{error}</p>
                        </div>
                    </div>
                )}

                <div style={{ border: `1px solid ${C.border}` }}>
                    <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.amber} 6%, ${C.surface})` }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted }}>
                            Raw SSE Events ({streamEvents.length})
                        </span>
                    </div>
                    <div style={{ padding: "8px 12px", maxHeight: 180, overflowY: "auto", fontFamily: "monospace", fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                        {streamEvents.length === 0
                            ? <p style={{ color: C.muted, fontStyle: "italic", margin: 0 }}>No events yet...</p>
                            : streamEvents.map((event, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                                    <span style={eventBadgeStyle(event.type)}>{event.type}</span>
                                    {event.message && <span style={{ color: C.text, fontSize: 11 }}>{event.message}</span>}
                                    {event.pct !== undefined && <span style={{ color: C.muted, fontSize: 10 }}>({event.pct}%)</span>}
                                </div>
                            ))
                        }
                        <div ref={eventsEndRef} />
                    </div>
                </div>

                {(liveText || finalResult) && (
                    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {finalResult
                                    ? <FileJson size={12} color={C.green} />
                                    : <Loader2  size={12} color={C.amber} style={{ animation: "spin 2s linear infinite" }} />}
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: finalResult ? C.green : C.muted, margin: 0 }}>
                                    {finalResult ? "Final Clean JSON" : "Live LLM Output"}
                                </p>
                            </div>
                            <button onClick={handleCopy} style={{
                                background: "none", border: `1px solid ${C.border}`, color: C.muted,
                                padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                                gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                            }}>
                                {copied ? <Check size={10} color={C.green} /> : <Copy size={10} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div style={{ maxHeight: 300, overflowY: "auto", background: "#080810", padding: 14, border: `1px solid ${C.border}`, borderRadius: 2 }}>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                            </pre>
                        </div>
                    </div>
                )}

                {displayResult && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isFinal ? 1 : 0.65, transition: "opacity 0.3s" }}>

                        {displayResult.safety_status && (() => {
                            const status = displayResult.safety_status;
                            const color  = safetyColor(status);
                            const IconComp = safetyIcon(status);
                            return (
                                <div style={{
                                    padding: "16px 18px",
                                    background: `${color}12`,
                                    border: `1px solid ${color}40`,
                                    borderLeft: `4px solid ${color}`,
                                    display: "flex", alignItems: "center", gap: 12,
                                }}>
                                    <IconComp size={22} color={color} style={{ flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Safety Verdict</p>
                                        <p style={{ fontSize: 20, fontWeight: 900, color, margin: 0, lineHeight: 1.2 }}>{status}</p>
                                    </div>
                                    {!isFinal && <Loader2 size={14} color={color} style={{ animation: "spin 2s linear infinite", marginLeft: "auto" }} />}
                                </div>
                            );
                        })()}

                        {displayResult.summary && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                {[
                                    { label: "Proposed",     value: displayResult.summary.proposed_count,         color: C.amber },
                                    { label: "Approved",     value: displayResult.summary.approved_count,         color: C.green },
                                    { label: "Flagged",      value: displayResult.summary.flagged_count,          color: C.red },
                                    { label: "Interactions", value: displayResult.summary.interaction_count,      color: C.orange },
                                    { label: "Contra.",      value: displayResult.summary.contraindication_count, color: C.yellow },
                                    { label: "Black Box",    value: displayResult.summary.black_box_warnings,     color: C.red },
                                ].map((stat, i) => (
                                    <div key={i} style={{ background: C.bg, padding: "10px 12px", border: `1px solid ${C.border}`, borderTop: `3px solid ${stat.color}` }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>{stat.label}</p>
                                        {isFinal
                                            ? <p style={{ fontSize: 15, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value ?? "–"}</p>
                                            : <Loader2 size={12} color={stat.color} style={{ animation: "spin 2s linear infinite" }} />
                                        }
                                    </div>
                                ))}
                            </div>
                        )}

                        {((displayResult.approved_medications?.length > 0) || (displayResult.flagged_medications?.length > 0)) && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <ShieldCheck size={13} color={C.green} />
                                        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.green, margin: 0 }}>
                                            Approved ({displayResult.approved_medications?.length || 0})
                                        </p>
                                    </div>
                                    {displayResult.approved_medications?.length === 0
                                        ? <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>None</p>
                                        : displayResult.approved_medications.map((med, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text, marginBottom: 4 }}>
                                                <Pill size={11} color={C.green} /> {med}
                                            </div>
                                        ))
                                    }
                                </div>
                                <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <ShieldX size={13} color={C.red} />
                                        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.red, margin: 0 }}>
                                            Flagged ({displayResult.flagged_medications?.length || 0})
                                        </p>
                                    </div>
                                    {displayResult.flagged_medications?.length === 0
                                        ? <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>None</p>
                                        : displayResult.flagged_medications.map((med, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text, marginBottom: 4 }}>
                                                <Pill size={11} color={C.red} /> {med}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.lab_assessment && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <Activity size={13} color={C.cyan} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.cyan, margin: 0 }}>Lab Assessment</p>
                                </div>
                                <p style={{ fontSize: 12, color: C.text, margin: "0 0 8px", lineHeight: 1.6 }}>
                                    {displayResult.lab_assessment.overall_lab_summary}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {displayResult.lab_assessment.sepsis_suspicion && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.red}15`, border: `1px solid ${C.red}40`, color: C.red }}>⚠ Sepsis Suspected</span>
                                    )}
                                    {displayResult.lab_assessment.renal_impairment_suspected && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.orange}15`, border: `1px solid ${C.orange}40`, color: C.orange }}>Renal Impairment Suspected</span>
                                    )}
                                    {displayResult.lab_assessment.hepatic_impairment_suspected && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.yellow}15`, border: `1px solid ${C.yellow}40`, color: C.yellow }}>Hepatic Impairment Suspected</span>
                                    )}
                                    {displayResult.lab_assessment.coagulopathy_suspected && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${C.purple}15`, border: `1px solid ${C.purple}40`, color: C.purple }}>Coagulopathy Suspected</span>
                                    )}
                                </div>
                                {displayResult.lab_assessment.critical_flags?.length > 0 && (
                                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                                        {displayResult.lab_assessment.critical_flags.map((flag, i) => (
                                            <div key={i} style={{ padding: "8px 10px", background: `${C.red}08`, border: `1px solid ${C.red}30`, display: "flex", alignItems: "flex-start", gap: 8 }}>
                                                <AlertTriangle size={12} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
                                                <div>
                                                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>
                                                        {flag.display}: <span style={{ color: C.red }}>{flag.value} {flag.unit}</span>
                                                    </p>
                                                    <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>{flag.drug_safety_implication}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {isFinal && displayResult.contraindications?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.red} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Contraindications ({displayResult.contraindications.length})
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {displayResult.contraindications.map((contra, idx) => (
                                        <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                            <div
                                                style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                onClick={() => setExpandedContra(expandedContra === idx ? null : idx)}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                                                            padding: "2px 6px",
                                                            color: severityColor(contra.severity),
                                                            background: `${severityColor(contra.severity)}15`,
                                                            border: `1px solid ${severityColor(contra.severity)}40`,
                                                        }}>{contra.severity}</span>
                                                        <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{contra.drug}</p>
                                                    </div>
                                                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{contra.reason?.slice(0, 80)}...</p>
                                                </div>
                                                <ChevronDown size={14} color={C.muted} style={{
                                                    marginLeft: 10, flexShrink: 0,
                                                    transform: expandedContra === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>
                                            {expandedContra === idx && (
                                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                    <div>
                                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Reason</p>
                                                        <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{contra.reason}</p>
                                                    </div>
                                                    {contra.recommendation && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.amber, margin: "0 0 4px" }}>Recommendation</p>
                                                            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{contra.recommendation}</p>
                                                        </div>
                                                    )}
                                                    {contra.type && (
                                                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", background: `${C.muted}12`, color: C.muted }}>
                                                            {contra.type.replace(/_/g, " ")}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.critical_interactions?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.orange} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Drug Interactions ({displayResult.critical_interactions.length})
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {displayResult.critical_interactions.map((inter, idx) => (
                                        <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                            <div
                                                style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                onClick={() => setExpandedInteract(expandedInteract === idx ? null : idx)}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                                                            padding: "2px 6px",
                                                            color: severityColor(inter.severity),
                                                            background: `${severityColor(inter.severity)}15`,
                                                            border: `1px solid ${severityColor(inter.severity)}40`,
                                                        }}>{inter.severity}</span>
                                                        <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>
                                                            {inter.drug_a} + {inter.drug_b}
                                                        </p>
                                                        {inter.severity_upgraded && (
                                                            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
                                                                ↑ UPGRADED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                                        {inter.description?.slice(0, 80)}...
                                                    </p>
                                                </div>
                                                <ChevronDown size={14} color={C.muted} style={{
                                                    marginLeft: 10, flexShrink: 0,
                                                    transform: expandedInteract === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>
                                            {expandedInteract === idx && (
                                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                    {inter.mechanism && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Mechanism</p>
                                                            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{inter.mechanism}</p>
                                                        </div>
                                                    )}
                                                    {inter.clinical_significance && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.orange, margin: "0 0 4px" }}>Clinical Significance</p>
                                                            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{inter.clinical_significance}</p>
                                                        </div>
                                                    )}
                                                    {inter.management_strategy && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.amber, margin: "0 0 4px" }}>Management Strategy</p>
                                                            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{inter.management_strategy}</p>
                                                        </div>
                                                    )}
                                                    {inter.monitoring_parameters?.length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.cyan, margin: "0 0 4px" }}>Monitoring Parameters</p>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                                {inter.monitoring_parameters.map((m, i) => (
                                                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.text }}>
                                                                        <CheckCircle2 size={11} color={C.cyan} style={{ flexShrink: 0, marginTop: 1 }} /> {m}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {inter.time_to_onset && (
                                                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                                                            <span style={{ fontWeight: 700 }}>Time to onset:</span> {inter.time_to_onset}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.patient_risk_profile && (
                            <div style={{
                                background: C.bg, padding: 14, border: `1px solid ${C.border}`,
                                borderLeft: `4px solid ${severityColor(displayResult.patient_risk_profile.overall_risk_level)}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                    <Zap size={13} color={severityColor(displayResult.patient_risk_profile.overall_risk_level)} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: severityColor(displayResult.patient_risk_profile.overall_risk_level), margin: 0 }}>
                                        Patient Risk Profile — {displayResult.patient_risk_profile.overall_risk_level}
                                    </p>
                                    {displayResult.patient_risk_profile.safe_to_proceed === false && (
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", background: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
                                            DO NOT PRESCRIBE
                                        </span>
                                    )}
                                    {displayResult.patient_risk_profile.safe_to_proceed === true && (
                                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30` }}>
                                            SAFE TO PROCEED
                                        </span>
                                    )}
                                </div>
                                {displayResult.patient_risk_profile.clinical_summary && (
                                    <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px", lineHeight: 1.65, fontStyle: "italic" }}>
                                        {displayResult.patient_risk_profile.clinical_summary}
                                    </p>
                                )}
                                {displayResult.patient_risk_profile.primary_risk_factors?.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Primary Risk Factors</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                            {displayResult.patient_risk_profile.primary_risk_factors.map((f, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.text }}>
                                                    <AlertTriangle size={11} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isFinal && displayResult.interaction_risk_narrative && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <Activity size={13} color={C.amber} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                        Interaction Risk Narrative
                                    </p>
                                </div>
                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                                    {displayResult.interaction_risk_narrative}
                                </p>
                            </div>
                        )}

                        {isFinal && displayResult.proactive_alternatives && Object.keys(displayResult.proactive_alternatives).length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.green} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Proactive Alternatives
                                    </p>
                                </div>
                                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                                    {Object.entries(displayResult.proactive_alternatives).map(([drug, data], idx) => (
                                        <div key={idx} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
                                            <div
                                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                                                onClick={() => setExpandedAlt(expandedAlt === idx ? null : idx)}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <FileWarning size={13} color={C.amber} />
                                                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>
                                                        Alternatives for: <span style={{ color: C.amber }}>{drug}</span>
                                                    </p>
                                                    <span style={{ fontSize: 10, padding: "2px 6px", background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30` }}>
                                                        {data.alternatives?.length || 0} options
                                                    </span>
                                                </div>
                                                <ChevronDown size={13} color={C.muted} style={{
                                                    transform: expandedAlt === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>
                                            {expandedAlt === idx && data.alternatives?.length > 0 && (
                                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                    {data.alternatives.map((alt, i) => (
                                                        <div key={i} style={{ padding: "8px 10px", background: C.surface, border: `1px solid ${C.border}` }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                                                                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{alt.drug}</p>
                                                                {alt.equivalence && (
                                                                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}30` }}>
                                                                        {alt.equivalence}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {alt.rationale && (
                                                                <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.55 }}>{alt.rationale}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.fda_warnings?.length > 0 && (
                            <div style={{ background: `${C.red}08`, border: `1px solid ${C.red}30`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <FileWarning size={13} color={C.red} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.red, margin: 0 }}>
                                        FDA Black Box Warnings ({displayResult.fda_warnings.length})
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {displayResult.fda_warnings.map((w, i) => (
                                        <div key={i} style={{ padding: "8px 10px", background: C.bg, border: `1px solid ${C.red}25` }}>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: "0 0 3px" }}>
                                                <span style={{ color: C.red }}>{w.drug}</span> — {w.warning_type}
                                            </p>
                                            <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.55 }}>{w.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isStreaming && streamEvents.length === 0 && !displayResult && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <Shield size={40} color={C.dim} style={{ margin: "0 auto 12px", display: "block" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                                    Ready for drug safety analysis. Enter medications and click "Run Drug Safety Check".
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
