import {
    Eye, AlertCircle, Loader2,
    Copy, Check, X, ScanLine, Stethoscope, Target, FileWarning, CheckCircle2,
    Brain, AlertTriangle, GitBranch, Zap, Clock, ShieldAlert, XCircle,
} from "lucide-react";

const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-muted)";
const SUBTLE  = "var(--color-text-subtle)";
const GREEN   = "#22C55E";
const EMERALD = "#10B981";
const RED     = "#EF4444";
const CYAN    = "#06B6D4";
const ORANGE  = "#F97316";
const YELLOW  = "#EAB308";
const PURPLE  = "#8B5CF6";

const triageColor = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "IMMEDIATE")   return RED;
    if (l === "URGENT")      return ORANGE;
    if (l === "SEMI-URGENT") return YELLOW;
    if (l === "NON-URGENT")  return GREEN;
    return SUBTLE;
};
const gradeColor = (grade) => {
    const g = (grade || "").toUpperCase();
    if (g === "SEVERE")   return RED;
    if (g === "MODERATE") return YELLOW;
    if (g === "MILD")     return GREEN;
    return SUBTLE;
};
const predictionColor = (pred) => {
    if ((pred || "").toUpperCase() === "PNEUMONIA") return RED;
    if ((pred || "").toUpperCase() === "NORMAL")    return GREEN;
    return SUBTLE;
};
const priorityColor = (priority) => {
    const p = (priority || "").toUpperCase();
    if (p === "IMMEDIATE" || p === "P1") return RED;
    if (p === "URGENT"    || p === "P2") return ORANGE;
    if (p === "P3")                       return YELLOW;
    return GREEN;
};

const eventColor = { error: RED, complete: GREEN, status: EMERALD, progress: YELLOW };

function IdlePlaceholder() {
    return (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "var(--color-surface-2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Eye size={24} color={SUBTLE} style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, margin: "0 0 6px" }}>Ready to analyze</p>
            <p style={{ fontSize: 12, color: SUBTLE, margin: "0 0 4px", opacity: 0.7 }}>Upload a chest X-ray and click Run Imaging Triage to start streaming</p>
            <p style={{ fontSize: 11, color: SUBTLE, margin: 0, opacity: 0.45, fontFamily: "monospace" }}>EfficientNetB0 · AUC 0.981 · Port :8005</p>
        </div>
    );
}

export default function ImagingResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, partialResult, displayResult, isFinal,
    expandedAction, setExpandedAction,
    handleCopy, handleAbort, copied,
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Step banner */}
            {currentStep && (
                <div style={{
                    background: `${EMERALD}15`, border: `1px solid ${EMERALD}40`, borderRadius: 10,
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                    animation: "pulse 2s ease-in-out infinite",
                }}>
                    <Loader2 size={15} color={EMERALD} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
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

            {/* SSE terminal */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{
                    padding: "11px 16px", borderBottom: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: `color-mix(in srgb, ${EMERALD} 5%, var(--color-surface))`,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: RED }} />
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: YELLOW }} />
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

            {/* Live / final JSON */}
            {(liveText || finalResult) && (
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ padding: "11px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {finalResult
                                ? <CheckCircle2 size={13} color={GREEN} />
                                : <Loader2 size={13} color={EMERALD} style={{ animation: "spin 2s linear infinite" }} />}
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
                    <div style={{ maxHeight: 300, overflowY: "auto", background: "#07060F", padding: "14px 16px" }}>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.65 }}>
                            {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                        </pre>
                    </div>
                </div>
            )}

            {/* Structured results */}
            {displayResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isFinal ? 1 : 0.65, transition: "opacity 0.3s" }}>

                    {/* CNN prediction + triage cards */}
                    {displayResult.model_output && displayResult.severity_assessment && (() => {
                        const pred     = displayResult.model_output.prediction;
                        const conf     = displayResult.model_output.confidence;
                        const grade    = displayResult.severity_assessment?.grade;
                        const label    = displayResult.severity_assessment?.triage_label;
                        const priority = displayResult.severity_assessment?.triage_priority;
                        const pColor   = predictionColor(pred);
                        const tColor   = triageColor(label);
                        return (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div style={{ background: `${pColor}12`, border: `1px solid ${pColor}40`, borderLeft: `4px solid ${pColor}`, padding: "14px 16px", borderRadius: 10 }}>
                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>CNN Prediction</p>
                                    <p style={{ fontSize: 22, fontWeight: 900, color: pColor, margin: "0 0 6px", lineHeight: 1 }}>{pred || "…"}</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ flex: 1, height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${(conf || 0) * 100}%`, background: pColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: pColor, fontFamily: "monospace", flexShrink: 0 }}>{((conf || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div style={{ background: `${tColor}12`, border: `1px solid ${tColor}40`, borderLeft: `4px solid ${tColor}`, padding: "14px 16px", borderRadius: 10 }}>
                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>Triage Priority</p>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                        <span style={{ fontSize: 30, fontWeight: 900, color: tColor, lineHeight: 1 }}>P{priority ?? "?"}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: tColor }}>{label || "…"}</span>
                                    </div>
                                    <p style={{ fontSize: 10, color: gradeColor(grade), fontWeight: 700, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                        Grade: {grade || "…"}
                                    </p>
                                    {displayResult.severity_assessment?.clinical_urgency && (
                                        <p style={{ fontSize: 10, color: MUTED, margin: "6px 0 0", lineHeight: 1.5 }}>
                                            {displayResult.severity_assessment.clinical_urgency}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Model probabilities */}
                    {displayResult.model_output && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: "0 0 12px" }}>Model Probabilities</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {[
                                    { label: "Pneumonia", value: displayResult.model_output.pneumonia_probability, color: RED },
                                    { label: "Normal",    value: displayResult.model_output.normal_probability,    color: GREEN },
                                ].map(bar => (
                                    <div key={bar.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{bar.label}</span>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: bar.color, fontFamily: "monospace" }}>{((bar.value || 0) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{ height: "100%", borderRadius: 3, transition: "width 1s ease", background: bar.color, width: `${(bar.value || 0) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Imaging findings */}
                    {displayResult.imaging_findings && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <ScanLine size={13} color={EMERALD} />
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Imaging Findings</p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {[
                                    { label: "Pattern",       value: displayResult.imaging_findings.pattern },
                                    { label: "Affected Area", value: displayResult.imaging_findings.affected_area },
                                    { label: "Distribution",  value: displayResult.imaging_findings.distribution },
                                ].filter(f => f.value).map(f => (
                                    <div key={f.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: SUBTLE, letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 120, flexShrink: 0 }}>{f.label}</span>
                                        <span style={{ fontSize: 12, color: TEXT }}>{f.value}</span>
                                    </div>
                                ))}
                                {displayResult.imaging_findings.bilateral !== undefined && (
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: SUBTLE, letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 120, flexShrink: 0 }}>Bilateral</span>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                                            background: displayResult.imaging_findings.bilateral ? `${ORANGE}18` : `${GREEN}18`,
                                            color: displayResult.imaging_findings.bilateral ? ORANGE : GREEN,
                                            border: `1px solid ${displayResult.imaging_findings.bilateral ? ORANGE : GREEN}40`,
                                        }}>{displayResult.imaging_findings.bilateral ? "YES" : "NO"}</span>
                                    </div>
                                )}
                                {displayResult.imaging_findings.confidence_in_findings && (
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: SUBTLE, letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 120, flexShrink: 0 }}>Confidence</span>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                                            background: `${EMERALD}18`, color: EMERALD, border: `1px solid ${EMERALD}40`,
                                        }}>{displayResult.imaging_findings.confidence_in_findings}</span>
                                    </div>
                                )}
                                {displayResult.imaging_findings.key_features?.length > 0 && (
                                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: SUBTLE, letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 120, flexShrink: 0 }}>Key Features</span>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                            {displayResult.imaging_findings.key_features.map(f => (
                                                <span key={f} style={{ fontSize: 10, padding: "2px 8px", background: `${EMERALD}12`, color: EMERALD, border: `1px solid ${EMERALD}30`, borderRadius: 4 }}>{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Clinical interpretation */}
                    {isFinal && (displayResult.clinical_interpretation || displayResult.clinical_impression) && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <Stethoscope size={13} color={CYAN} />
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Clinical Interpretation</p>
                            </div>
                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.8, fontStyle: "italic" }}>
                                {displayResult.clinical_interpretation || displayResult.clinical_impression}
                            </p>
                        </div>
                    )}

                    {/* Recommended actions */}
                    {isFinal && displayResult.recommended_actions?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${EMERALD} 6%, var(--color-surface))` }}>
                                <Target size={13} color={EMERALD} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Recommended Actions ({displayResult.recommended_actions.length})
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {displayResult.recommended_actions.map((action, idx) => (
                                    <div key={idx} style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                                        <div style={{ width: 28, height: 28, background: `${EMERALD}18`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                            <Target size={13} color={EMERALD} />
                                        </div>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.6 }}>
                                            {typeof action === "string" ? action : action.action || JSON.stringify(action)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Confirms diagnosis */}
                    {isFinal && displayResult.confirms_diagnosis !== undefined && (
                        <div style={{
                            background: SURFACE, border: `1px solid ${displayResult.confirms_diagnosis ? GREEN : ORANGE}40`,
                            borderLeft: `4px solid ${displayResult.confirms_diagnosis ? GREEN : ORANGE}`,
                            borderRadius: 10, padding: "12px 16px",
                            display: "flex", alignItems: "center", gap: 10,
                        }}>
                            {displayResult.confirms_diagnosis
                                ? <CheckCircle2 size={15} color={GREEN} />
                                : <XCircle size={15} color={ORANGE} />}
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, margin: "0 0 2px" }}>Diagnosis Confirmation</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: displayResult.confirms_diagnosis ? GREEN : ORANGE, margin: 0 }}>
                                    {displayResult.confirms_diagnosis
                                        ? "Imaging confirms working diagnosis"
                                        : "Imaging does not confirm working diagnosis"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* LLM Interpretation */}
                    {isFinal && displayResult.llm_interpretation && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${CYAN} 6%, var(--color-surface))` }}>
                                <Brain size={13} color={CYAN} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>LLM Clinical Interpretation</span>
                            </div>
                            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

                                {/* Clinical opinion */}
                                {displayResult.llm_interpretation.clinical_opinion && (
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                            <Stethoscope size={11} color={CYAN} />
                                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: CYAN }}>Clinical Opinion</span>
                                        </div>
                                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.7 }}>{displayResult.llm_interpretation.clinical_opinion}</p>
                                    </div>
                                )}

                                {/* Key concern */}
                                {displayResult.llm_interpretation.key_concern && (
                                    <div style={{ background: `${ORANGE}0E`, border: `1px solid ${ORANGE}30`, borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                                        <AlertTriangle size={13} color={ORANGE} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <div>
                                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, margin: "0 0 4px" }}>Key Concern</p>
                                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{displayResult.llm_interpretation.key_concern}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Differential */}
                                {displayResult.llm_interpretation.differential?.length > 0 && (
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                            <GitBranch size={11} color={PURPLE} />
                                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: PURPLE }}>Differential Diagnosis</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                            {displayResult.llm_interpretation.differential.map((d, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                                    <span style={{ fontSize: 9, fontWeight: 800, color: PURPLE, fontFamily: "monospace", minWidth: 18, marginTop: 2 }}>#{i + 1}</span>
                                                    <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{d}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Immediate actions */}
                                {displayResult.llm_interpretation.immediate_actions?.length > 0 && (
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                            <Zap size={11} color={YELLOW} />
                                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: YELLOW }}>Immediate Actions</span>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                            {displayResult.llm_interpretation.immediate_actions.map((a, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: `${YELLOW}20`, border: `1px solid ${YELLOW}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                                        <span style={{ fontSize: 8, fontWeight: 800, color: YELLOW }}>{i + 1}</span>
                                                    </div>
                                                    <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{a}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Follow up */}
                                {displayResult.llm_interpretation.follow_up && (
                                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                        <Clock size={13} color={EMERALD} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <div>
                                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: EMERALD, margin: "0 0 4px" }}>Follow Up</p>
                                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{displayResult.llm_interpretation.follow_up}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Safety net */}
                                {displayResult.llm_interpretation.safety_net && (
                                    <div style={{ background: `${RED}0E`, border: `1px solid ${RED}30`, borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                                        <ShieldAlert size={13} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <div>
                                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: RED, margin: "0 0 4px" }}>Safety Net</p>
                                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{displayResult.llm_interpretation.safety_net}</p>
                                        </div>
                                    </div>
                                )}

                                {/* LLM disclaimer */}
                                {displayResult.llm_interpretation.llm_disclaimer && (
                                    <p style={{ fontSize: 10, color: SUBTLE, margin: 0, fontStyle: "italic", opacity: 0.7 }}>
                                        {displayResult.llm_interpretation.llm_disclaimer}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* FHIR diagnostic report */}
                    {isFinal && displayResult.fhir_diagnostic_report && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <FileWarning size={13} color={PURPLE} />
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: 0 }}>FHIR Diagnostic Report</p>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", background: `${PURPLE}18`, color: PURPLE, border: `1px solid ${PURPLE}30`, borderRadius: 4, marginLeft: "auto" }}>
                                    {displayResult.fhir_diagnostic_report.resourceType}
                                </span>
                            </div>
                            <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                                {displayResult.fhir_diagnostic_report.conclusion}
                            </p>
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