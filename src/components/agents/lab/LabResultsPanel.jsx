import {
    FlaskConical, AlertCircle, Loader2, ChevronDown,
    Activity, CheckCircle2, Copy, Check, X, Brain,
    ShieldAlert, Zap, Clock, ListChecks, TestTube2, Database, Stethoscope,
} from "lucide-react";

const ACCENT  = "var(--color-accent)";
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const SURFACE2 = "var(--color-surface-2)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const GREEN   = "#22C55E";
const AMBER   = "#F59E0B";
const RED     = "#EF4444";
const CYAN    = "#06B6D4";
const ORANGE  = "#F97316";
const BLUE    = "#60A5FA";
const PURPLE  = "#8B5CF6";

const flagColor = (flag) => {
    if (!flag) return SUBTLE;
    const f = flag.toUpperCase();
    if (f === "CRITICAL") return RED;
    if (f === "HIGH")     return ORANGE;
    if (f === "LOW")      return BLUE;
    return GREEN;
};

const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return RED;
    if (s === "HIGH")     return ORANGE;
    if (s === "MODERATE") return AMBER;
    if (s === "LOW" || s === "MINIMAL") return GREEN;
    return SUBTLE;
};

const eventColor = { error: RED, complete: GREEN, status: CYAN, progress: AMBER };

function IdlePlaceholder() {
    return (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: SURFACE2, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <FlaskConical size={24} color={SUBTLE} style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, margin: "0 0 6px" }}>Ready to analyse</p>
            <p style={{ fontSize: 12, color: SUBTLE, margin: 0, opacity: 0.7 }}>Fill in the form and hit Run Lab Analysis to start streaming</p>
        </div>
    );
}

export default function LabResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, partialResult, displayResult, isFinal,
    expandedFlag, setExpandedFlag, expandedPattern, setExpandedPattern,
    handleCopy, handleAbort, copied,
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Current step banner */}
            {currentStep && (
                <div style={{
                    background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`, borderRadius: 10,
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                    animation: "pulse 2s ease-in-out infinite",
                }}>
                    <Loader2 size={15} color={ACCENT} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{currentStep}</span>
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div style={{ background: `${RED}10`, border: `1px solid ${RED}40`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <AlertCircle size={15} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: RED, margin: "0 0 3px" }}>Stream Error</p>
                        <p style={{ fontSize: 12, color: RED, margin: 0, opacity: 0.8 }}>{error}</p>
                    </div>
                </div>
            )}

            {/* SSE Events Terminal */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{
                    padding: "11px 16px", borderBottom: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: `color-mix(in srgb, ${CYAN} 5%, var(--color-surface))`,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: RED }} />
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: AMBER }} />
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: GREEN }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT, marginLeft: 4 }}>SSE Events</span>
                        <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>({streamEvents.length})</span>
                    </div>
                    {isStreaming && (
                        <button onClick={handleAbort} style={{
                            padding: "4px 12px", border: `1px solid ${RED}50`, color: RED,
                            background: `${RED}10`, borderRadius: 6, fontSize: 10, fontWeight: 700,
                            letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 5,
                        }}>
                            <X size={10} /> Abort
                        </button>
                    )}
                </div>
                <div style={{ padding: "8px 16px", maxHeight: 200, overflowY: "auto", background: "#07060F", display: "flex", flexDirection: "column", gap: 3 }}>
                    {streamEvents.length === 0
                        ? <p style={{ color: SUBTLE, fontStyle: "italic", margin: "16px 0", fontFamily: "monospace", fontSize: 12, opacity: 0.5 }}>Waiting for stream events...</p>
                        : streamEvents.map((event, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                                    padding: "2px 6px", borderRadius: 3, fontFamily: "monospace", flexShrink: 0,
                                    color: eventColor[event.type] || SUBTLE,
                                    background: `${eventColor[event.type] || SUBTLE}15`,
                                    border: `1px solid ${eventColor[event.type] || SUBTLE}30`,
                                }}>{event.type}</span>
                                {event.message && <span style={{ color: "#C5C5DE", fontSize: 11, fontFamily: "monospace" }}>{event.message}</span>}
                                {event.pct !== undefined && <span style={{ color: SUBTLE, fontSize: 10, fontFamily: "monospace" }}>({event.pct}%)</span>}
                            </div>
                        ))
                    }
                    <div ref={eventsEndRef} />
                </div>
            </div>

            {/* Live / Final JSON output */}
            {(liveText || finalResult) && (
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ padding: "11px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {finalResult
                                ? <CheckCircle2 size={13} color={GREEN} />
                                : <Loader2  size={13} color={ACCENT} style={{ animation: "spin 2s linear infinite" }} />}
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: finalResult ? GREEN : MUTED }}>
                                {finalResult ? "Final Clean JSON" : "Live LLM Output"}
                            </span>
                        </div>
                        <button onClick={handleCopy} style={{
                            background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6,
                            padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center",
                            gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        }}>
                            {copied ? <Check size={10} color={GREEN} /> : <Copy size={10} />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto", background: "#07060F", padding: "14px 16px" }}>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.65 }}>
                            {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                        </pre>
                    </div>
                </div>
            )}

            {/* Structured results */}
            {displayResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isFinal ? 1 : 0.65, transition: "opacity 0.3s" }}>

                    {/* Summary stats */}
                    {displayResult.lab_summary && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                            {[
                                { label: "Total",    value: displayResult.lab_summary.total_results,    color: CYAN },
                                { label: "Abnormal", value: displayResult.lab_summary.abnormal_count,   color: AMBER },
                                { label: "Critical", value: displayResult.lab_summary.critical_count,   color: RED },
                                { label: "Severity", value: displayResult.lab_summary.overall_severity, color: severityColor(displayResult.lab_summary.overall_severity) },
                            ].map((stat, i) => (
                                <div key={i} style={{ background: BG, padding: "12px 14px", border: `1px solid ${BORDER}`, borderRadius: 10, borderTop: `3px solid ${stat.color}` }}>
                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 5px" }}>{stat.label}</p>
                                    {isFinal
                                        ? <p style={{ fontSize: 16, fontWeight: 900, color: stat.color, margin: 0, lineHeight: 1 }}>{stat.value ?? "–"}</p>
                                        : <Loader2 size={12} color={stat.color} style={{ animation: "spin 2s linear infinite" }} />
                                    }
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Severity score */}
                    {displayResult.severity_score && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: SUBTLE, margin: 0 }}>Severity Score</p>
                                <span style={{ fontSize: 14, fontWeight: 900, color: severityColor(displayResult.severity_score.risk_category), fontFamily: "monospace" }}>
                                    {displayResult.severity_score.score ?? "–"} / 100
                                    <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginLeft: 8 }}>({displayResult.severity_score.risk_category})</span>
                                </span>
                            </div>
                            <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", borderRadius: 3, transition: "width 1s ease",
                                    background: severityColor(displayResult.severity_score.risk_category),
                                    width: `${Math.min(displayResult.severity_score.score || 0, 100)}%`,
                                }} />
                            </div>
                            {displayResult.severity_score.contributors?.length > 0 && (
                                <p style={{ fontSize: 11, color: MUTED, margin: "8px 0 0", lineHeight: 1.5 }}>
                                    {displayResult.severity_score.contributors.join(" · ")}
                                </p>
                            )}
                            {displayResult.severity_score.organ_systems_affected !== undefined && (
                                <p style={{ fontSize: 11, color: SUBTLE, margin: "5px 0 0", fontFamily: "monospace" }}>
                                    Organ systems affected: <span style={{ color: AMBER, fontWeight: 700 }}>{displayResult.severity_score.organ_systems_affected}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Diagnosis confirmation */}
                    {displayResult.diagnosis_confirmation && (
                        <div style={{
                            background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
                            borderLeft: `4px solid ${displayResult.diagnosis_confirmation.confirms_top_diagnosis ? GREEN : RED}`,
                            padding: "16px 18px",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                {displayResult.diagnosis_confirmation.confirms_top_diagnosis
                                    ? <CheckCircle2 size={16} color={GREEN} />
                                    : <AlertCircle  size={16} color={RED} />}
                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: displayResult.diagnosis_confirmation.confirms_top_diagnosis ? GREEN : RED, margin: 0 }}>
                                    {displayResult.diagnosis_confirmation.confirms_top_diagnosis ? "Lab Confirms Diagnosis" : "Lab Challenges Diagnosis"}
                                </p>
                                {displayResult.diagnosis_confirmation.lab_confidence_boost > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: `${GREEN}18`, color: GREEN, border: `1px solid ${GREEN}40`, borderRadius: 4 }}>
                                        +{(displayResult.diagnosis_confirmation.lab_confidence_boost * 100).toFixed(0)}% confidence
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 800, color: TEXT, margin: "0 0 3px" }}>{displayResult.diagnosis_confirmation.proposed_diagnosis}</p>
                            <p style={{ fontSize: 10, color: SUBTLE, margin: "0 0 8px", fontFamily: "monospace" }}>ICD-10: {displayResult.diagnosis_confirmation.proposed_icd10}</p>
                            {displayResult.diagnosis_confirmation.reasoning && (
                                <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                                    {displayResult.diagnosis_confirmation.reasoning}
                                </p>
                            )}
                            {displayResult.diagnosis_confirmation.alternative_diagnosis_display && (
                                <div style={{ marginTop: 10, padding: "8px 12px", background: `${AMBER}10`, border: `1px solid ${AMBER}30`, borderRadius: 8 }}>
                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER, margin: "0 0 3px" }}>Alternative Diagnosis</p>
                                    <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>
                                        {displayResult.diagnosis_confirmation.alternative_diagnosis_display}
                                        <span style={{ color: SUBTLE, fontFamily: "monospace", marginLeft: 8 }}>
                                            {displayResult.diagnosis_confirmation.alternative_diagnosis_code}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Flagged results */}
                    {displayResult.flagged_results?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${CYAN} 6%, var(--color-surface))` }}>
                                <Activity size={13} color={CYAN} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Flagged Results ({displayResult.flagged_results.length})
                                </span>
                                {!isFinal && <Loader2 size={10} color={SUBTLE} style={{ animation: "spin 2s linear infinite", marginLeft: 4 }} />}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {displayResult.flagged_results.map((res, idx) => (
                                    <div key={idx} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                                        <div
                                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                            onClick={() => setExpandedFlag(expandedFlag === idx ? null : idx)}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                                                        textTransform: "uppercase", padding: "2px 6px", borderRadius: 4,
                                                        color: flagColor(res.flag),
                                                        background: `${flagColor(res.flag)}18`,
                                                        border: `1px solid ${flagColor(res.flag)}40`,
                                                    }}>{res.flag || "–"}</span>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: 0 }}>{res.display}</p>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                                    <span style={{ fontSize: 14, fontWeight: 900, color: flagColor(res.flag), fontFamily: "monospace" }}>
                                                        {res.value} {res.unit}
                                                    </span>
                                                    {res.reference_range && (
                                                        <span style={{ fontSize: 11, color: MUTED }}>ref: {res.reference_range}</span>
                                                    )}
                                                    {res.loinc && (
                                                        <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>LOINC: {res.loinc}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown size={14} color={SUBTLE} style={{
                                                marginLeft: 10, flexShrink: 0,
                                                transform: expandedFlag === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s",
                                            }} />
                                        </div>
                                        {expandedFlag === idx && res.clinical_significance && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, animation: "fadeIn 0.2s ease" }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 5px" }}>Clinical Significance</p>
                                                <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{res.clinical_significance}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pattern analysis */}
                    {displayResult.pattern_analysis?.identified_patterns?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${PURPLE} 6%, var(--color-surface))` }}>
                                <Brain size={13} color={PURPLE} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Pattern Analysis ({displayResult.pattern_analysis.identified_patterns.length})
                                </span>
                            </div>
                            {displayResult.pattern_analysis.pattern_interpretation && (
                                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, background: `${PURPLE}06` }}>
                                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65 }}>
                                        {displayResult.pattern_analysis.pattern_interpretation}
                                    </p>
                                </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {displayResult.pattern_analysis.identified_patterns.map((pat, idx) => (
                                    <div key={idx} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                                        <div style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
                                            onClick={() => setExpandedPattern(expandedPattern === idx ? null : idx)}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, margin: "0 0 3px" }}>{pat.pattern}</p>
                                                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{pat.description}</p>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 10 }}>
                                                {pat.rules_met !== undefined && (
                                                    <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: pat.rules_met === pat.rules_total ? GREEN : AMBER }}>
                                                        {pat.rules_met}/{pat.rules_total} rules
                                                    </span>
                                                )}
                                                <ChevronDown size={14} color={SUBTLE} style={{
                                                    transform: expandedPattern === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>
                                        </div>
                                        {expandedPattern === idx && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.2s ease" }}>
                                                {pat.markers?.length > 0 && (
                                                    <div>
                                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 5px" }}>Markers</p>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                            {pat.markers.map((m, i) => (
                                                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT }}>
                                                                    <div style={{ width: 5, height: 5, background: CYAN, borderRadius: "50%", flexShrink: 0 }} />
                                                                    {m}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {pat.sensitivity_note && (
                                                    <p style={{ fontSize: 11, color: MUTED, margin: 0, fontStyle: "italic" }}>{pat.sensitivity_note}</p>
                                                )}
                                                {pat.supports_icd10?.length > 0 && (
                                                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                        <span style={{ fontSize: 10, color: SUBTLE, fontWeight: 700 }}>Supports:</span>
                                                        {pat.supports_icd10.map((code, i) => (
                                                            <span key={i} style={{ fontSize: 10, fontFamily: "monospace", color: CYAN, background: `${CYAN}10`, border: `1px solid ${CYAN}30`, padding: "1px 6px", borderRadius: 4 }}>{code}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Critical alerts */}
                    {isFinal && displayResult.critical_alerts?.length > 0 && (
                        <div style={{ background: `${RED}08`, border: `1px solid ${RED}50`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${RED}30`, display: "flex", alignItems: "center", gap: 8, background: `${RED}10` }}>
                                <ShieldAlert size={13} color={RED} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: RED }}>
                                    Critical Alerts ({displayResult.critical_alerts.length})
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: `${RED}20` }}>
                                {displayResult.critical_alerts.map((alert, idx) => (
                                    <div key={idx} style={{ background: SURFACE, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                                        <div style={{ width: 28, height: 28, background: `${RED}18`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                            <ShieldAlert size={13} color={RED} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                                                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", background: `${RED}18`, color: RED, border: `1px solid ${RED}40`, borderRadius: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>{alert.level}</span>
                                                <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>{alert.display} · {alert.value} {alert.unit}</span>
                                            </div>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{alert.message}</p>
                                            {alert.action_required && (
                                                <p style={{ fontSize: 10, color: RED, margin: "4px 0 0", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>⚠ Action Required</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clinical decision support */}
                    {isFinal && displayResult.clinical_decision_support && (() => {
                        const cds = displayResult.clinical_decision_support;
                        const allActions = [
                            ...(cds.immediate_actions || []),
                            ...(cds.urgent_actions || []),
                            ...(cds.routine_actions || []),
                        ];
                        const priorityColor = (p) => {
                            const u = (p || "").toUpperCase();
                            if (u === "STAT")    return RED;
                            if (u === "URGENT")  return ORANGE;
                            return GREEN;
                        };
                        return (
                            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${CYAN} 6%, var(--color-surface))` }}>
                                    <Stethoscope size={13} color={CYAN} />
                                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                        Clinical Decision Support
                                    </span>
                                </div>
                                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

                                    {/* Actions */}
                                    {allActions.length > 0 && (
                                        <div>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, margin: "0 0 10px" }}>Actions ({allActions.length})</p>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                {allActions.map((a, i) => {
                                                    const pc = priorityColor(a.priority);
                                                    return (
                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: `${pc}08`, border: `1px solid ${pc}30`, borderLeft: `3px solid ${pc}`, borderRadius: 8 }}>
                                                            <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", background: `${pc}18`, color: pc, border: `1px solid ${pc}40`, borderRadius: 4, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0, marginTop: 1 }}>{a.priority}</span>
                                                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{a.action}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Follow-up labs */}
                                    {cds.follow_up_labs?.length > 0 && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                                                <TestTube2 size={12} color={CYAN} />
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Follow-up Labs</p>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                {cds.follow_up_labs.map((lab, i) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{lab.test}</p>
                                                                {lab.loinc && <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>LOINC: {lab.loinc}</span>}
                                                                {lab.timing && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", background: `${AMBER}18`, color: AMBER, border: `1px solid ${AMBER}40`, borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{lab.timing}</span>}
                                                            </div>
                                                            {lab.rationale && <p style={{ fontSize: 11, color: MUTED, margin: 0, fontStyle: "italic" }}>{lab.rationale}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Monitoring plan */}
                                    {cds.monitoring_plan?.length > 0 && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                                <ListChecks size={12} color={GREEN} />
                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Monitoring Plan</p>
                                            </div>
                                            {cds.monitoring_plan.map((item, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: TEXT, marginBottom: 4 }}>
                                                    <div style={{ width: 5, height: 5, background: GREEN, borderRadius: "50%", flexShrink: 0, marginTop: 5 }} />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Metadata footer */}
                    {isFinal && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 4px", flexWrap: "wrap" }}>
                            {displayResult.llm_interpretation_available !== undefined && (
                                <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>
                                    llm: <span style={{ color: displayResult.llm_interpretation_available ? GREEN : MUTED }}>{displayResult.llm_interpretation_available ? "AVAILABLE" : "N/A"}</span>
                                </span>
                            )}
                            {displayResult.cache_hit !== undefined && (
                                <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>
                                    cache: <span style={{ color: displayResult.cache_hit ? GREEN : MUTED }}>{displayResult.cache_hit ? "HIT" : "MISS"}</span>
                                </span>
                            )}
                            {displayResult.request_id && (
                                <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>
                                    req: <span style={{ color: MUTED }}>{displayResult.request_id}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Idle placeholder */}
            {!isStreaming && !finalResult && !partialResult && streamEvents.length === 0 && !error && (
                <IdlePlaceholder />
            )}
        </div>
    );
}