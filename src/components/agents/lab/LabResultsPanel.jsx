import { useState } from "react";
import {
    FlaskConical, FileJson, AlertCircle, Loader2, ChevronDown,
    Activity, AlertTriangle, CheckCircle2, Copy, Check, X,
} from "lucide-react";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    accent: "#06B6D4", text: "var(--color-text)", muted: "var(--color-text-subtle)",
    dim: "var(--color-border)", green: "#22C55E", yellow: "#EAB308",
    red: "#EF4444", cyan: "#06B6D4", orange: "#F97316", purple: "#8b5cf6", blue: "#60A5FA",
};

const flagColor = (flag) => {
    if (!flag) return C.muted;
    const f = flag.toUpperCase();
    if (f === "CRITICAL") return C.red;
    if (f === "HIGH")     return C.orange;
    if (f === "LOW")      return C.blue;
    return C.green;
};

const severityColor = (sev) => {
    const s = (sev || "").toUpperCase();
    if (s === "CRITICAL") return C.red;
    if (s === "HIGH")     return C.orange;
    if (s === "MODERATE") return C.yellow;
    if (s === "LOW" || s === "MINIMAL") return C.green;
    return C.muted;
};

export default function LabResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, displayResult, isFinal,
    expandedFlag, setExpandedFlag, expandedPattern, setExpandedPattern,
    handleCopy, handleAbort, copied,
}) {
    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,    "#FEE2E2"],
            complete: [C.green,  "#DCFCE7"],
            status:   [C.cyan,   "#CFFAFE"],
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
                    <div style={{ padding: "10px 14px", background: C.cyan, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
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
                    <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.cyan} 6%, ${C.surface})` }}>
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
                                    : <Loader2  size={12} color={C.cyan} style={{ animation: "spin 2s linear infinite" }} />}
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

                        {displayResult.lab_summary && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                {[
                                    { label: "Total",    value: displayResult.lab_summary.total_results,    color: C.cyan },
                                    { label: "Abnormal", value: displayResult.lab_summary.abnormal_count,   color: C.yellow },
                                    { label: "Critical", value: displayResult.lab_summary.critical_count,   color: C.red },
                                    { label: "Severity", value: displayResult.lab_summary.overall_severity, color: severityColor(displayResult.lab_summary.overall_severity) },
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

                        {displayResult.severity_score && (
                            <div style={{ background: C.bg, padding: 14, border: `1px solid ${C.border}` }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: 0 }}>Severity Score</p>
                                    <span style={{ fontSize: 13, fontWeight: 900, color: severityColor(displayResult.severity_score.risk_category), fontFamily: "monospace" }}>
                                        {displayResult.severity_score.score ?? "–"} / 100
                                        <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 6 }}>({displayResult.severity_score.risk_category})</span>
                                    </span>
                                </div>
                                <div style={{ height: 6, background: C.dim, borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", borderRadius: 3, transition: "width 1s ease",
                                        background: severityColor(displayResult.severity_score.risk_category),
                                        width: `${Math.min(displayResult.severity_score.score || 0, 100)}%`,
                                    }} />
                                </div>
                                {displayResult.severity_score.contributors?.length > 0 && (
                                    <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>
                                        {displayResult.severity_score.contributors.join(" · ")}
                                    </p>
                                )}
                            </div>
                        )}

                        {displayResult.diagnosis_confirmation && (
                            <div style={{
                                background: C.bg, padding: 14, border: `1px solid ${C.border}`,
                                borderLeft: `4px solid ${displayResult.diagnosis_confirmation.confirms_top_diagnosis ? C.green : C.red}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                    {displayResult.diagnosis_confirmation.confirms_top_diagnosis
                                        ? <CheckCircle2 size={16} color={C.green} />
                                        : <AlertCircle  size={16} color={C.red} />}
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: displayResult.diagnosis_confirmation.confirms_top_diagnosis ? C.green : C.red, margin: 0 }}>
                                        {displayResult.diagnosis_confirmation.confirms_top_diagnosis ? "Lab Confirms Diagnosis" : "Lab Challenges Diagnosis"}
                                    </p>
                                    {displayResult.diagnosis_confirmation.lab_confidence_boost > 0 && (
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}40` }}>
                                            +{(displayResult.diagnosis_confirmation.lab_confidence_boost * 100).toFixed(0)}% confidence
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>{displayResult.diagnosis_confirmation.proposed_diagnosis}</p>
                                <p style={{ fontSize: 10, color: C.muted, margin: "0 0 8px", fontFamily: "monospace" }}>ICD-10: {displayResult.diagnosis_confirmation.proposed_icd10}</p>
                                {displayResult.diagnosis_confirmation.reasoning && (
                                    <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                                        {displayResult.diagnosis_confirmation.reasoning}
                                    </p>
                                )}
                                {displayResult.diagnosis_confirmation.alternative_diagnosis_display && (
                                    <div style={{ marginTop: 10, padding: "8px 10px", background: `${C.yellow}10`, border: `1px solid ${C.yellow}30` }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.yellow, margin: "0 0 3px" }}>Alternative Diagnosis</p>
                                        <p style={{ fontSize: 12, color: C.text, margin: 0 }}>
                                            {displayResult.diagnosis_confirmation.alternative_diagnosis_display}
                                            <span style={{ color: C.muted, fontFamily: "monospace", marginLeft: 8 }}>
                                                {displayResult.diagnosis_confirmation.alternative_diagnosis_code}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {displayResult.flagged_results?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.cyan} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Flagged Results ({displayResult.flagged_results.length})
                                        {!isFinal && <Loader2 size={10} color={C.text} style={{ animation: "spin 2s linear infinite", display: "inline-block", marginLeft: 8 }} />}
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {displayResult.flagged_results.map((res, idx) => (
                                        <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                            <div
                                                style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                                onClick={() => setExpandedFlag(expandedFlag === idx ? null : idx)}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                                                            textTransform: "uppercase", padding: "2px 6px",
                                                            color: flagColor(res.flag),
                                                            background: `${flagColor(res.flag)}18`,
                                                            border: `1px solid ${flagColor(res.flag)}40`,
                                                        }}>{res.flag || "–"}</span>
                                                        <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0 }}>{res.display}</p>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                                        <span style={{ fontSize: 14, fontWeight: 900, color: flagColor(res.flag), fontFamily: "monospace" }}>
                                                            {res.value} {res.unit}
                                                        </span>
                                                        {res.reference_range && (
                                                            <span style={{ fontSize: 11, color: C.muted }}>ref: {res.reference_range}</span>
                                                        )}
                                                        {res.loinc && (
                                                            <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>LOINC: {res.loinc}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronDown size={14} color={C.muted} style={{
                                                    marginLeft: 10, flexShrink: 0,
                                                    transform: expandedFlag === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>
                                            {expandedFlag === idx && res.clinical_significance && (
                                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>Clinical Significance</p>
                                                    <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.6 }}>{res.clinical_significance}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayResult.pattern_analysis?.identified_patterns?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.purple} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Pattern Analysis ({displayResult.pattern_analysis.identified_patterns.length})
                                    </p>
                                </div>
                                {displayResult.pattern_analysis.pattern_interpretation && (
                                    <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, background: `${C.purple}08` }}>
                                        <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.65 }}>
                                            {displayResult.pattern_analysis.pattern_interpretation}
                                        </p>
                                    </div>
                                )}
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {displayResult.pattern_analysis.identified_patterns.map((pat, idx) => (
                                        <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                            <div
                                                style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
                                                onClick={() => setExpandedPattern(expandedPattern === idx ? null : idx)}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 800, color: C.text, margin: "0 0 2px" }}>{pat.pattern}</p>
                                                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{pat.description}</p>
                                                </div>
                                                <ChevronDown size={14} color={C.muted} style={{
                                                    flexShrink: 0, marginLeft: 10,
                                                    transform: expandedPattern === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>
                                            {expandedPattern === idx && (
                                                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
                                                    {pat.markers?.length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 5px" }}>Markers</p>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                                {pat.markers.map((m, i) => (
                                                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text }}>
                                                                        <div style={{ width: 5, height: 5, background: C.cyan, borderRadius: "50%", flexShrink: 0 }} />
                                                                        {m}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {pat.sensitivity_note && (
                                                        <p style={{ fontSize: 11, color: C.muted, margin: 0, fontStyle: "italic" }}>{pat.sensitivity_note}</p>
                                                    )}
                                                    {pat.supports_icd10?.length > 0 && (
                                                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                            <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>Supports:</span>
                                                            {pat.supports_icd10.map(code => (
                                                                <span key={code} style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 7px", background: `${C.cyan}15`, color: C.cyan, border: `1px solid ${C.cyan}30` }}>
                                                                    {code}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {pat.rules_met !== undefined && (
                                                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>
                                                            Rules met: {pat.rules_met} / {pat.rules_total}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(() => {
                            const actions = [
                                ...(displayResult.clinical_decision_support?.immediate_actions || []),
                                ...(displayResult.clinical_decision_support?.urgent_actions   || []),
                            ];
                            if (actions.length === 0) return null;
                            return (
                                <div style={{ border: `1px solid ${C.border}` }}>
                                    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.orange} 6%, ${C.surface})` }}>
                                        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                            Clinical Decision Support ({actions.length})
                                        </p>
                                    </div>
                                    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                        {actions.map((action, idx) => {
                                            const isImmediate = (action.priority || "").toUpperCase() === "IMMEDIATE";
                                            const acColor = isImmediate ? C.red : C.orange;
                                            return (
                                                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, background: C.bg, borderLeft: `3px solid ${acColor}`, border: `1px solid ${C.border}` }}>
                                                    <div style={{ width: 26, height: 26, background: `${acColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}>
                                                        <Activity size={12} color={acColor} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                                                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", background: `${acColor}18`, color: acColor }}>
                                                                {action.priority}
                                                            </span>
                                                            {action.timeframe && (
                                                                <span style={{ fontSize: 10, color: C.muted }}>{action.timeframe}</span>
                                                            )}
                                                        </div>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{action.action}</p>
                                                        {action.details && action.details !== "AI-generated recommendation based on lab pattern analysis" && (
                                                            <p style={{ fontSize: 11, color: C.muted, margin: "3px 0 0", fontStyle: "italic" }}>{action.details}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {displayResult.critical_alerts?.length > 0 && (
                            <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}40`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <AlertTriangle size={14} color={C.red} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.red, margin: 0 }}>
                                        Critical Alerts ({displayResult.critical_alerts.length})
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {displayResult.critical_alerts.map((alert, i) => {
                                        if (typeof alert === "string") {
                                            return (
                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.text }}>
                                                    <div style={{ width: 6, height: 6, background: C.red, borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />
                                                    {alert}
                                                </div>
                                            );
                                        }
                                        const lvl = (alert.level || "").toUpperCase();
                                        const lvlColor = lvl.includes("CRITICAL") ? C.red : C.orange;
                                        return (
                                            <div key={i} style={{
                                                background: C.bg, padding: "10px 12px",
                                                border: `1px solid ${C.red}40`,
                                                borderLeft: `3px solid ${lvlColor}`,
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                                                    {alert.level && (
                                                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 6px", background: `${lvlColor}20`, color: lvlColor, border: `1px solid ${lvlColor}40` }}>
                                                            {alert.level.replace(/_/g, " ")}
                                                        </span>
                                                    )}
                                                    {alert.action_required && (
                                                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 6px", background: `${C.red}15`, color: C.red }}>
                                                            Action Required
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>
                                                    {alert.display || alert.loinc || "Unknown Test"}
                                                    {alert.value !== undefined && (
                                                        <span style={{ fontFamily: "monospace", color: lvlColor, marginLeft: 10, fontWeight: 900 }}>
                                                            {alert.value} {alert.unit}
                                                        </span>
                                                    )}
                                                </p>
                                                {alert.message && (
                                                    <p style={{ fontSize: 12, color: C.muted, margin: "0 0 3px", lineHeight: 1.55 }}>{alert.message}</p>
                                                )}
                                                {alert.loinc && alert.display && (
                                                    <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: "monospace" }}>LOINC: {alert.loinc}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isStreaming && streamEvents.length === 0 && !displayResult && (
                    <div style={{ padding: "48px 0", textAlign: "center" }}>
                        <FlaskConical size={40} color={C.dim} style={{ margin: "0 auto 12px", display: "block" }} strokeWidth={1} />
                        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                            Ready for lab analysis. Enter LOINC-coded results and click "Run Lab Analysis".
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
