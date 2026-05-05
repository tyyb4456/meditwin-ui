import {
    Shield, AlertCircle, Loader2, ChevronDown,
    AlertTriangle, Copy, Check, X,
    Pill, ShieldAlert, ShieldCheck, ShieldX, Activity, CheckCircle2,
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
const YELLOW  = "#EAB308";
const PURPLE  = "#8B5CF6";

const safetyColor = (status) => {
    if (!status) return SUBTLE;
    const s = status.toUpperCase();
    if (s === "UNSAFE")  return RED;
    if (s === "CAUTION") return YELLOW;
    if (s === "SAFE")    return GREEN;
    return SUBTLE;
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
    if (s === "CRITICAL") return RED;
    if (s === "HIGH")     return ORANGE;
    if (s === "MODERATE") return YELLOW;
    return GREEN;
};

const eventColor = { error: RED, complete: GREEN, status: AMBER, progress: YELLOW };

function IdlePlaceholder() {
    return (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "var(--color-surface-2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Shield size={24} color={SUBTLE} style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, margin: "0 0 6px" }}>Ready to check</p>
            <p style={{ fontSize: 12, color: SUBTLE, margin: 0, opacity: 0.7 }}>Fill in the form and hit Run Drug Safety Check to start streaming</p>
        </div>
    );
}

export default function DrugResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, partialResult, displayResult, isFinal,
    expandedContra, setExpandedContra,
    expandedInteract, setExpandedInteract,
    expandedAlt, setExpandedAlt,
    handleCopy, handleAbort, copied,
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Step banner */}
            {currentStep && (
                <div style={{
                    background: `${AMBER}15`, border: `1px solid ${AMBER}40`, borderRadius: 10,
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                    animation: "pulse 2s ease-in-out infinite",
                }}>
                    <Loader2 size={15} color={AMBER} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
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
                    background: `color-mix(in srgb, ${AMBER} 5%, var(--color-surface))`,
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

            {/* Live / final JSON */}
            {(liveText || finalResult) && (
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ padding: "11px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {finalResult
                                ? <CheckCircle2 size={13} color={GREEN} />
                                : <Loader2 size={13} color={AMBER} style={{ animation: "spin 2s linear infinite" }} />}
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

                    {/* Safety verdict banner */}
                    {displayResult.safety_status && (() => {
                        const status = displayResult.safety_status;
                        const color  = safetyColor(status);
                        const IconComp = safetyIcon(status);
                        return (
                            <div style={{
                                padding: "16px 18px", borderRadius: 12,
                                background: `${color}12`, border: `1px solid ${color}40`,
                                borderLeft: `4px solid ${color}`,
                                display: "flex", alignItems: "center", gap: 14,
                            }}>
                                <IconComp size={24} color={color} style={{ flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Safety Verdict</p>
                                    <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, lineHeight: 1.2 }}>{status}</p>
                                </div>
                                {!isFinal && <Loader2 size={14} color={color} style={{ animation: "spin 2s linear infinite", marginLeft: "auto" }} />}
                            </div>
                        );
                    })()}

                    {/* Summary stats */}
                    {displayResult.summary && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                            {[
                                { label: "Proposed",     value: displayResult.summary.proposed_count,         color: AMBER },
                                { label: "Approved",     value: displayResult.summary.approved_count,         color: GREEN },
                                { label: "Flagged",      value: displayResult.summary.flagged_count,          color: RED },
                                { label: "Interactions", value: displayResult.summary.interaction_count,      color: ORANGE },
                                { label: "Contra.",      value: displayResult.summary.contraindication_count, color: YELLOW },
                                { label: "Black Box",    value: displayResult.summary.black_box_warnings,     color: RED },
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

                    {/* Approved / Flagged med lists */}
                    {((displayResult.approved_medications?.length > 0) || (displayResult.flagged_medications?.length > 0)) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <ShieldCheck size={13} color={GREEN} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: 0 }}>
                                        Approved ({displayResult.approved_medications?.length || 0})
                                    </p>
                                </div>
                                {displayResult.approved_medications?.length === 0
                                    ? <p style={{ fontSize: 11, color: SUBTLE, margin: 0, fontStyle: "italic" }}>None</p>
                                    : displayResult.approved_medications.map((med, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: TEXT, marginBottom: 5 }}>
                                            <Pill size={11} color={GREEN} /> {med}
                                        </div>
                                    ))
                                }
                            </div>
                            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <ShieldX size={13} color={RED} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: 0 }}>
                                        Flagged ({displayResult.flagged_medications?.length || 0})
                                    </p>
                                </div>
                                {displayResult.flagged_medications?.length === 0
                                    ? <p style={{ fontSize: 11, color: SUBTLE, margin: 0, fontStyle: "italic" }}>None</p>
                                    : displayResult.flagged_medications.map((med, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: TEXT, marginBottom: 5 }}>
                                            <Pill size={11} color={RED} /> {med}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {/* Lab assessment */}
                    {isFinal && displayResult.lab_assessment && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <Activity size={13} color={CYAN} />
                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: CYAN, margin: 0 }}>Lab Assessment</p>
                            </div>
                            <p style={{ fontSize: 12, color: TEXT, margin: "0 0 10px", lineHeight: 1.6 }}>
                                {displayResult.lab_assessment.overall_lab_summary}
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {displayResult.lab_assessment.sepsis_suspicion && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${RED}15`, border: `1px solid ${RED}40`, color: RED, borderRadius: 4 }}>⚠ Sepsis Suspected</span>
                                )}
                                {displayResult.lab_assessment.renal_impairment_suspected && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${ORANGE}15`, border: `1px solid ${ORANGE}40`, color: ORANGE, borderRadius: 4 }}>Renal Impairment</span>
                                )}
                                {displayResult.lab_assessment.hepatic_impairment_suspected && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${YELLOW}15`, border: `1px solid ${YELLOW}40`, color: YELLOW, borderRadius: 4 }}>Hepatic Impairment</span>
                                )}
                                {displayResult.lab_assessment.coagulopathy_suspected && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${PURPLE}15`, border: `1px solid ${PURPLE}40`, color: PURPLE, borderRadius: 4 }}>Coagulopathy</span>
                                )}
                            </div>
                            {displayResult.lab_assessment.critical_flags?.length > 0 && (
                                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                                    {displayResult.lab_assessment.critical_flags.map((flag, i) => (
                                        <div key={i} style={{ padding: "8px 12px", background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                                            <AlertTriangle size={12} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                                            <div>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>
                                                    {flag.display}: <span style={{ color: RED }}>{flag.value} {flag.unit}</span>
                                                </p>
                                                <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{flag.drug_safety_implication}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contraindications */}
                    {isFinal && displayResult.contraindications?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${RED} 6%, var(--color-surface))` }}>
                                <ShieldX size={13} color={RED} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Contraindications ({displayResult.contraindications.length})
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {displayResult.contraindications.map((contra, idx) => (
                                    <div key={idx} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                                        <div
                                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                            onClick={() => setExpandedContra(expandedContra === idx ? null : idx)}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                                                        padding: "2px 6px", borderRadius: 4,
                                                        color: severityColor(contra.severity),
                                                        background: `${severityColor(contra.severity)}15`,
                                                        border: `1px solid ${severityColor(contra.severity)}40`,
                                                    }}>{contra.severity}</span>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: 0 }}>{contra.drug}</p>
                                                </div>
                                                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{contra.reason?.slice(0, 80)}...</p>
                                            </div>
                                            <ChevronDown size={14} color={SUBTLE} style={{
                                                marginLeft: 10, flexShrink: 0,
                                                transform: expandedContra === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s",
                                            }} />
                                        </div>
                                        {expandedContra === idx && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.2s ease" }}>
                                                <div>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 4px" }}>Reason</p>
                                                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{contra.reason}</p>
                                                </div>
                                                {contra.recommendation && (
                                                    <div>
                                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER, margin: "0 0 4px" }}>Recommendation</p>
                                                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{contra.recommendation}</p>
                                                    </div>
                                                )}
                                                {contra.type && (
                                                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 8px", background: `${BORDER}60`, color: MUTED, borderRadius: 4, alignSelf: "flex-start" }}>
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

                    {/* Drug interactions */}
                    {isFinal && displayResult.critical_interactions?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${ORANGE} 6%, var(--color-surface))` }}>
                                <Activity size={13} color={ORANGE} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Drug Interactions ({displayResult.critical_interactions.length})
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {displayResult.critical_interactions.map((inter, idx) => (
                                    <div key={idx} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                                        <div
                                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                            onClick={() => setExpandedInteract(expandedInteract === idx ? null : idx)}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                                                        padding: "2px 6px", borderRadius: 4,
                                                        color: severityColor(inter.severity),
                                                        background: `${severityColor(inter.severity)}15`,
                                                        border: `1px solid ${severityColor(inter.severity)}40`,
                                                    }}>{inter.severity}</span>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: 0 }}>
                                                        {inter.drugs ? inter.drugs.join(" ↔ ") : [inter.drug_a, inter.drug_b].filter(Boolean).join(" ↔ ")}
                                                    </p>
                                                </div>
                                                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                                                    {(inter.description || inter.clinical_significance || "")?.slice(0, 90)}...
                                                </p>
                                            </div>
                                            <ChevronDown size={14} color={SUBTLE} style={{
                                                marginLeft: 10, flexShrink: 0,
                                                transform: expandedInteract === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s",
                                            }} />
                                        </div>
                                        {expandedInteract === idx && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 8, animation: "fadeIn 0.2s ease" }}>
                                                <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>
                                                    {inter.description || inter.clinical_significance}
                                                </p>
                                                {inter.mechanism && (
                                                    <div>
                                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 4px" }}>Mechanism</p>
                                                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{inter.mechanism}</p>
                                                    </div>
                                                )}
                                                {inter.recommendation && (
                                                    <div>
                                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER, margin: "0 0 4px" }}>Recommendation</p>
                                                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{inter.recommendation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Alternative medications */}
                    {isFinal && displayResult.alternative_medications?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${GREEN} 6%, var(--color-surface))` }}>
                                <Pill size={13} color={GREEN} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Alternative Medications ({displayResult.alternative_medications.length})
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {displayResult.alternative_medications.map((alt, idx) => (
                                    <div key={idx} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                                        <div
                                            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer" }}
                                            onClick={() => setExpandedAlt(expandedAlt === idx ? null : idx)}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: 0 }}>{alt.instead_of}</p>
                                                    <span style={{ fontSize: 11, color: SUBTLE }}>→</span>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: GREEN, margin: 0 }}>{alt.alternative}</p>
                                                </div>
                                                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{alt.reason?.slice(0, 80)}</p>
                                            </div>
                                            <ChevronDown size={14} color={SUBTLE} style={{
                                                marginLeft: 10, flexShrink: 0,
                                                transform: expandedAlt === idx ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s",
                                            }} />
                                        </div>
                                        {expandedAlt === idx && alt.reason && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BORDER}`, animation: "fadeIn 0.2s ease" }}>
                                                <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{alt.reason}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Patient risk profile */}
                    {isFinal && displayResult.patient_risk_profile && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <ShieldAlert size={13} color={AMBER} />
                                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: AMBER, margin: 0 }}>Patient Risk Profile</p>
                                <span style={{
                                    fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
                                    color: severityColor(displayResult.patient_risk_profile.overall_risk_level),
                                    background: `${severityColor(displayResult.patient_risk_profile.overall_risk_level)}15`,
                                    border: `1px solid ${severityColor(displayResult.patient_risk_profile.overall_risk_level)}40`,
                                }}>{displayResult.patient_risk_profile.overall_risk_level}</span>
                            </div>
                            {displayResult.patient_risk_profile.risk_narrative && (
                                <p style={{ fontSize: 12, color: TEXT, margin: "0 0 10px", lineHeight: 1.65 }}>
                                    {displayResult.patient_risk_profile.risk_narrative}
                                </p>
                            )}
                            {displayResult.patient_risk_profile.risk_factors?.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {displayResult.patient_risk_profile.risk_factors.map((rf, i) => (
                                        <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", background: `${AMBER}10`, border: `1px solid ${AMBER}30`, color: TEXT, borderRadius: 4 }}>{rf}</span>
                                    ))}
                                </div>
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
