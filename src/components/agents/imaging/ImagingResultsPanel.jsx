import {
    Eye, FileJson, AlertCircle, Loader2,
    Copy, Check, X, ScanLine, Stethoscope, Target, FileWarning,
} from "lucide-react";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    accent: "#10b981", text: "var(--color-text)", muted: "var(--color-text-subtle)",
    dim: "var(--color-border)", green: "#22C55E", yellow: "#EAB308",
    red: "#EF4444", cyan: "#06B6D4", orange: "#F97316", purple: "#8b5cf6", emerald: "#10b981", blue: "#60A5FA",
};

const triageColor = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "IMMEDIATE")   return C.red;
    if (l === "URGENT")      return C.orange;
    if (l === "SEMI-URGENT") return C.yellow;
    if (l === "NON-URGENT")  return C.green;
    return C.muted;
};
const gradeColor = (grade) => {
    const g = (grade || "").toUpperCase();
    if (g === "SEVERE")   return C.red;
    if (g === "MODERATE") return C.yellow;
    if (g === "MILD")     return C.green;
    return C.muted;
};
const predictionColor = (pred) => {
    if ((pred || "").toUpperCase() === "PNEUMONIA") return C.red;
    if ((pred || "").toUpperCase() === "NORMAL")    return C.green;
    return C.muted;
};
const priorityColor = (priority) => {
    const p = (priority || "").toUpperCase();
    if (p === "IMMEDIATE" || p === "P1") return C.red;
    if (p === "URGENT"    || p === "P2") return C.orange;
    if (p === "P3")                      return C.yellow;
    return C.green;
};

export default function ImagingResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, displayResult, isFinal,
    expandedAction, setExpandedAction,
    handleCopy, handleAbort, copied,
}) {
    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,     "#FEE2E2"],
            complete: [C.green,   "#DCFCE7"],
            status:   [C.emerald, "#D1FAE5"],
            progress: [C.yellow,  "#FEF9C3"],
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
                    <div style={{ padding: "10px 14px", background: C.emerald, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
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
                    <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.emerald} 6%, ${C.surface})` }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted }}>
                            Raw SSE Events ({streamEvents.length})
                        </span>
                    </div>
                    <div style={{ padding: "8px 12px", maxHeight: 160, overflowY: "auto", fontFamily: "monospace", fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
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
                                    : <Loader2  size={12} color={C.emerald} style={{ animation: "spin 2s linear infinite" }} />}
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
                        <div style={{ maxHeight: 280, overflowY: "auto", background: "#080810", padding: 14, border: `1px solid ${C.border}`, borderRadius: 2 }}>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                            </pre>
                        </div>
                    </div>
                )}

                {displayResult && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isFinal ? 1 : 0.65, transition: "opacity 0.3s" }}>

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
                                    <div style={{
                                        background: `${pColor}12`, border: `1px solid ${pColor}40`,
                                        borderLeft: `4px solid ${pColor}`, padding: "14px 16px",
                                    }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>CNN Prediction</p>
                                        <p style={{ fontSize: 20, fontWeight: 900, color: pColor, margin: "0 0 4px", lineHeight: 1 }}>{pred || "…"}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <div style={{ flex: 1, height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${(conf || 0) * 100}%`, background: pColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: pColor, fontFamily: "monospace", flexShrink: 0 }}>
                                                {((conf || 0) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: `${tColor}12`, border: `1px solid ${tColor}40`,
                                        borderLeft: `4px solid ${tColor}`, padding: "14px 16px",
                                    }}>
                                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, margin: "0 0 4px" }}>Triage Priority</p>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                            <span style={{ fontSize: 28, fontWeight: 900, color: tColor, lineHeight: 1 }}>P{priority ?? "?"}</span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: tColor }}>{label || "…"}</span>
                                        </div>
                                        <p style={{ fontSize: 10, color: gradeColor(grade), fontWeight: 700, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                            Grade: {grade || "…"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {displayResult.model_output && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: "0 0 12px" }}>
                                    Model Probabilities
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[
                                        { label: "Pneumonia", value: displayResult.model_output.pneumonia_probability, color: C.red },
                                        { label: "Normal",    value: displayResult.model_output.normal_probability,    color: C.green },
                                    ].map(bar => (
                                        <div key={bar.label}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{bar.label}</span>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: bar.color, fontFamily: "monospace" }}>
                                                    {((bar.value || 0) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div style={{ height: 6, background: C.dim, borderRadius: 3, overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%", borderRadius: 3, transition: "width 1s ease",
                                                    background: bar.color,
                                                    width: `${(bar.value || 0) * 100}%`,
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayResult.imaging_findings && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <ScanLine size={13} color={C.emerald} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                        Imaging Findings
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {[
                                        { label: "Pattern",           value: displayResult.imaging_findings.pattern },
                                        { label: "Affected Area",     value: displayResult.imaging_findings.affected_area },
                                        { label: "Distribution",      value: displayResult.imaging_findings.distribution },
                                    ].filter(f => f.value).map(f => (
                                        <div key={f.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 95, flexShrink: 0 }}>{f.label}</span>
                                            <span style={{ fontSize: 12, color: C.text }}>{f.value}</span>
                                        </div>
                                    ))}
                                    {displayResult.imaging_findings.key_features?.length > 0 && (
                                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 95, flexShrink: 0 }}>Key Features</span>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                                {displayResult.imaging_findings.key_features.map(f => (
                                                    <span key={f} style={{ fontSize: 10, padding: "2px 7px", background: `${C.emerald}12`, color: C.emerald, border: `1px solid ${C.emerald}30` }}>{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.clinical_impression && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <Stethoscope size={13} color={C.cyan} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                        Clinical Impression
                                    </p>
                                </div>
                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.8, fontStyle: "italic" }}>
                                    {displayResult.clinical_impression}
                                </p>
                            </div>
                        )}

                        {isFinal && displayResult.recommended_actions?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.emerald} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Recommended Actions ({displayResult.recommended_actions.length})
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {displayResult.recommended_actions.map((action, idx) => {
                                        const aColor = priorityColor(action.priority);
                                        const isExpanded = expandedAction === idx;
                                        return (
                                            <div key={idx} style={{ borderBottom: `1px solid ${C.border}` }}>
                                                <div
                                                    style={{ padding: 12, cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10 }}
                                                    onClick={() => setExpandedAction(isExpanded ? null : idx)}
                                                >
                                                    <div style={{ width: 26, height: 26, background: `${aColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}>
                                                        <Target size={12} color={aColor} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                                                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", background: `${aColor}18`, color: aColor }}>
                                                                {action.priority}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: 0 }}>{action.action}</p>
                                                        <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>{action.rationale}</p>
                                                    </div>
                                                </div>
                                                {isExpanded && action.details && (
                                                    <div style={{ padding: "0 12px 12px 48px" }}>
                                                        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>{action.details}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.fhir_diagnostic_report && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <FileWarning size={13} color={C.purple} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                        FHIR Diagnostic Report
                                    </p>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", background: `${C.purple}18`, color: C.purple, border: `1px solid ${C.purple}30`, marginLeft: "auto" }}>
                                        {displayResult.fhir_diagnostic_report.resourceType}
                                    </span>
                                </div>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                                    {displayResult.fhir_diagnostic_report.conclusion}
                                </p>
                            </div>
                        )}

                        {!isStreaming && streamEvents.length === 0 && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <Eye size={40} color={C.dim} style={{ margin: "0 auto 12px" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 4px" }}>
                                    Ready to analyze. Upload a chest X-ray and click "Run Imaging Triage".
                                </p>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0, opacity: 0.6 }}>
                                    EfficientNetB0 · AUC 0.981 · Port :8005
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
