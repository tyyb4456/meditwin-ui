import {
    Cpu, FileJson, AlertCircle, Loader2, ChevronDown,
    AlertTriangle, Copy, Check, X, Activity, BarChart2,
    TrendingUp, Zap, DollarSign, BookOpen, GitBranch
} from "lucide-react";

// ── Color tokens ──────────────────────────────────────────────────────────────
const BG      = "var(--color-bg)";
const SURFACE = "var(--color-surface)";
const BORDER  = "var(--color-border)";
const TEXT    = "var(--color-text)";
const MUTED   = "var(--color-text-subtle)";
const BLUE    = "#3B82F6";
const GREEN   = "#22C55E";
const RED     = "#EF4444";
const ORANGE  = "#F97316";
const YELLOW  = "#EAB308";
const CYAN    = "#06B6D4";
const AMBER   = "#F59E0B";
const PURPLE  = "#8B5CF6";

const TERMINAL_BG = "#07060F";

const riskColor = (risk) => {
    const r = (risk || "").toUpperCase();
    if (r === "CRITICAL" || r === "VERY_HIGH" || r === "VERY HIGH") return RED;
    if (r === "HIGH")                                                return ORANGE;
    if (r === "MODERATE" || r === "MEDIUM")                         return YELLOW;
    if (r === "LOW" || r === "MINIMAL")                             return GREEN;
    return MUTED;
};

const eventBadgeStyle = (type) => {
    const map = {
        error:    { color: RED,    bg: `${RED}18`    },
        complete: { color: GREEN,  bg: `${GREEN}18`  },
        status:   { color: BLUE,   bg: `${BLUE}18`   },
        progress: { color: YELLOW, bg: `${YELLOW}18` },
    };
    const { color, bg } = map[type] || { color: "#6B7280", bg: "#1F2937" };
    return {
        fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "2px 6px", borderRadius: 4,
        color, background: bg, border: `1px solid ${color}30`,
        fontFamily: "monospace", flexShrink: 0,
    };
};

function IdlePlaceholder() {
    return (
        <div style={{ padding: "56px 24px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                background: `${BLUE}12`, border: `1px solid ${BLUE}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <GitBranch size={24} color={BLUE} strokeWidth={1.5} style={{ opacity: 0.6 }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: MUTED, margin: "0 0 6px" }}>
                Ready to simulate
            </p>
            <p style={{ fontSize: 11, color: MUTED, margin: 0, opacity: 0.6 }}>
                Configure patient state, diagnosis, and treatment options — then run.
            </p>
            <p style={{ fontSize: 10, color: MUTED, margin: "10px 0 0", opacity: 0.4, fontFamily: "monospace" }}>
                SHAP · Monte-Carlo · Port :8006
            </p>
        </div>
    );
}

export default function TwinResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, partialResult, displayResult, isFinal,
    expandedScen, setExpandedScen,
    handleCopy, handleAbort, copied,
}) {
    const showIdle = !isStreaming && !finalResult && !partialResult && streamEvents.length === 0 && !error;

    return (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>

            {/* ── Panel header ── */}
            <div style={{
                padding: "12px 16px", borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: TEXT }}>
                    Live Stream Output
                </span>
                {isStreaming && (
                    <button onClick={handleAbort} style={{
                        padding: "4px 10px", border: `1px solid ${RED}`, color: RED,
                        background: `${RED}10`, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                        textTransform: "uppercase", cursor: "pointer", borderRadius: 6,
                        display: "flex", alignItems: "center", gap: 5,
                    }}>
                        <X size={11} /> Abort
                    </button>
                )}
            </div>

            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Idle placeholder */}
                {showIdle && <IdlePlaceholder />}

                {/* Current step */}
                {currentStep && (
                    <div style={{
                        padding: "10px 14px", background: `${BLUE}18`,
                        border: `1px solid ${BLUE}40`, borderRadius: 8,
                        display: "flex", alignItems: "center", gap: 10,
                        animation: "pulse 2s infinite",
                    }}>
                        <Loader2 size={14} color={BLUE} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>{currentStep}</span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ padding: "10px 14px", background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: RED, margin: "0 0 3px" }}>Stream Error</p>
                            <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* SSE terminal */}
                {(streamEvents.length > 0 || isStreaming) && (
                    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                        {/* Terminal header with traffic lights */}
                        <div style={{ padding: "8px 12px", background: "#111018", borderBottom: `1px solid #1E1B2E`, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ display: "flex", gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }} />
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4A4466", marginLeft: 4 }}>
                                SSE Events ({streamEvents.length})
                            </span>
                            {isStreaming && (
                                <Loader2 size={10} color={BLUE} style={{ marginLeft: "auto", animation: "spin 1.5s linear infinite" }} />
                            )}
                        </div>
                        <div style={{
                            padding: "10px 12px", maxHeight: 180, overflowY: "auto",
                            fontFamily: "monospace", fontSize: 11,
                            display: "flex", flexDirection: "column", gap: 5,
                            background: TERMINAL_BG,
                        }}>
                            {streamEvents.length === 0
                                ? <p style={{ color: "#4A4466", fontStyle: "italic", margin: 0 }}>Awaiting events…</p>
                                : streamEvents.map((event, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingBottom: 5, borderBottom: `1px solid #1A1730` }}>
                                        <span style={eventBadgeStyle(event.type)}>{event.type}</span>
                                        {event.message && <span style={{ color: "#C4C0D8", fontSize: 11 }}>{event.message}</span>}
                                        {event.pct !== undefined && <span style={{ color: "#4A4466", fontSize: 10 }}>({event.pct}%)</span>}
                                    </div>
                                ))
                            }
                            <div ref={eventsEndRef} />
                        </div>
                    </div>
                )}

                {/* Live text / final JSON */}
                {(liveText || finalResult) && (
                    <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {finalResult
                                    ? <FileJson size={12} color={GREEN} />
                                    : <Loader2  size={12} color={BLUE} style={{ animation: "spin 2s linear infinite" }} />}
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: finalResult ? GREEN : MUTED, margin: 0 }}>
                                    {finalResult ? "Final Clean JSON" : "Live LLM Output"}
                                </p>
                            </div>
                            <button onClick={handleCopy} style={{
                                background: "none", border: `1px solid ${BORDER}`, color: MUTED,
                                borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 4,
                                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                            }}>
                                {copied ? <Check size={10} color={GREEN} /> : <Copy size={10} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div style={{ maxHeight: 300, overflowY: "auto", background: TERMINAL_BG, padding: 14, borderRadius: 8, border: `1px solid #1A1730` }}>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                                {finalResult ? JSON.stringify(finalResult, null, 2) : liveText}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Structured result cards */}
                {displayResult && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isFinal ? 1 : 0.7, transition: "opacity 0.3s" }}>

                        {/* Simulation summary */}
                        {displayResult.simulation_summary && (
                            <div style={{
                                background: `${BLUE}0A`, border: `1px solid ${BLUE}30`,
                                borderLeft: `4px solid ${riskColor(displayResult.simulation_summary.patient_risk_profile)}`,
                                borderRadius: 10, padding: 14,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                    <Zap size={13} color={riskColor(displayResult.simulation_summary.patient_risk_profile)} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: riskColor(displayResult.simulation_summary.patient_risk_profile), margin: 0 }}>
                                        Simulation Summary — {displayResult.simulation_summary.patient_risk_profile}
                                    </p>
                                </div>
                                {displayResult.simulation_summary.primary_concern && (
                                    <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 4px" }}>
                                        {displayResult.simulation_summary.primary_concern}
                                    </p>
                                )}
                                {displayResult.simulation_summary.recommended_option && (
                                    <div style={{ marginTop: 8, padding: "8px 10px", background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                        <Activity size={12} color={GREEN} />
                                        <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>
                                            <span style={{ fontWeight: 700, color: GREEN }}>Recommended:</span> {displayResult.simulation_summary.recommended_option}
                                        </p>
                                    </div>
                                )}
                                {displayResult.simulation_summary.baseline_risks && (
                                    <div style={{ marginTop: 10 }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Baseline Risks</p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {Object.entries(displayResult.simulation_summary.baseline_risks).map(([k, v]) => (
                                                <div key={k} style={{ padding: "5px 10px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11 }}>
                                                    <span style={{ color: MUTED, textTransform: "capitalize" }}>{k.replace(/_/g, " ")}: </span>
                                                    <span style={{ color: TEXT, fontWeight: 700, fontFamily: "monospace" }}>
                                                        {typeof v === "number" ? `${(v * 100).toFixed(1)}%` : v}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Scenarios */}
                        {displayResult.scenarios?.length > 0 && (
                            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, background: `${BLUE}08` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT, margin: 0 }}>
                                        Scenarios ({displayResult.scenarios.length})
                                    </p>
                                </div>
                                {displayResult.scenarios.map((scen, idx) => {
                                    const isExp = expandedScen === idx;
                                    const rColor = riskColor(scen.outcomes?.risk_level);
                                    return (
                                        <div key={idx} style={{ borderBottom: `1px solid ${BORDER}` }}>
                                            <div
                                                style={{ padding: 12, cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
                                                onClick={() => setExpandedScen(isExp ? null : idx)}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                                                            padding: "2px 8px", background: `${BLUE}15`, color: BLUE,
                                                            border: `1px solid ${BLUE}30`, borderRadius: 6,
                                                        }}>
                                                            Option {scen.option_id}
                                                        </span>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{scen.treatment_label}</p>
                                                        {scen.outcomes?.risk_level && (
                                                            <span style={{
                                                                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                                                                padding: "2px 6px", color: rColor, background: `${rColor}15`,
                                                                border: `1px solid ${rColor}30`, borderRadius: 4,
                                                            }}>
                                                                {scen.outcomes.risk_level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {scen.outcomes?.narrative && (
                                                        <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.55 }}>
                                                            {scen.outcomes.narrative.slice(0, 120)}…
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronDown size={14} color={MUTED} style={{
                                                    marginLeft: 10, flexShrink: 0,
                                                    transform: isExp ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>

                                            {isExp && (
                                                <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                                                    {scen.outcomes?.predicted_outcomes && Object.keys(scen.outcomes.predicted_outcomes).length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>Predicted Outcomes</p>
                                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                                                                {Object.entries(scen.outcomes.predicted_outcomes).map(([horizon, outcomes]) => (
                                                                    <div key={horizon} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                                                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: BLUE, margin: "0 0 6px" }}>{horizon}</p>
                                                                        {Object.entries(outcomes).map(([metric, val]) => (
                                                                            <div key={metric} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11 }}>
                                                                                <span style={{ color: MUTED, textTransform: "capitalize" }}>{metric.replace(/_/g, " ")}</span>
                                                                                <span style={{ color: TEXT, fontWeight: 700, fontFamily: "monospace" }}>
                                                                                    {typeof val === "number" ? `${(val * 100).toFixed(1)}%` : String(val)}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {scen.outcomes?.narrative && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Narrative</p>
                                                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                                                                {scen.outcomes.narrative}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {scen.cost_estimate && (
                                                        <div style={{ padding: 10, background: `${GREEN}08`, border: `1px solid ${GREEN}25`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                                            <DollarSign size={12} color={GREEN} />
                                                            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                                                                {[
                                                                    { label: "Direct",     val: scen.cost_estimate.direct_cost_usd },
                                                                    { label: "Indirect",   val: scen.cost_estimate.indirect_cost_usd },
                                                                    { label: "Total Est.", val: scen.cost_estimate.total_estimated_cost_usd },
                                                                ].filter(f => f.val != null).map(f => (
                                                                    <div key={f.label} style={{ fontSize: 11 }}>
                                                                        <span style={{ color: MUTED }}>{f.label}: </span>
                                                                        <span style={{ color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>${f.val.toLocaleString()}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {scen.drug_synergies?.length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Drug Synergies</p>
                                                            {scen.drug_synergies.map((syn, si) => (
                                                                <div key={si} style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>
                                                                    <span style={{ color: CYAN, fontWeight: 700 }}>{syn.drug_a} + {syn.drug_b}</span>: {syn.effect}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* What-if narrative */}
                        {isFinal && displayResult.what_if_narrative && (
                            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <BookOpen size={13} color={BLUE} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: 0 }}>
                                        What-If Narrative
                                    </p>
                                </div>
                                <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.8, fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                                    {displayResult.what_if_narrative}
                                </p>
                            </div>
                        )}

                        {/* Feature attribution */}
                        {isFinal && displayResult.feature_attribution?.length > 0 && (
                            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, background: `${PURPLE}08` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT, margin: 0 }}>
                                        Feature Attribution (Top Factors)
                                    </p>
                                </div>
                                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                                    {displayResult.feature_attribution.slice(0, 6).map((feat, i) => {
                                        const absImpact = Math.abs(feat.impact || 0);
                                        const maxImpact = Math.abs(displayResult.feature_attribution[0]?.impact || 1);
                                        const pct = (absImpact / maxImpact) * 100;
                                        const barColor = (feat.impact || 0) >= 0 ? RED : GREEN;
                                        return (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <TrendingUp size={11} color={barColor} />
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{feat.feature}</span>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                                                            {feat.value !== undefined ? String(feat.value) : "—"}
                                                        </span>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: "monospace" }}>
                                                            {feat.impact >= 0 ? "+" : ""}{(feat.impact * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                                                </div>
                                                {feat.explanation && (
                                                    <p style={{ fontSize: 10, color: MUTED, margin: "3px 0 0", fontStyle: "italic" }}>{feat.explanation}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Sensitivity analysis */}
                        {isFinal && displayResult.sensitivity_analysis?.length > 0 && (
                            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, background: `${AMBER}08` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT, margin: 0 }}>
                                        Sensitivity Analysis
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {displayResult.sensitivity_analysis.map((item, idx) => (
                                        <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${BORDER}` }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: "0 0 2px" }}>{item.parameter}</p>
                                                    {item.description && (
                                                        <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{item.description}</p>
                                                    )}
                                                </div>
                                                {item.sensitivity_score !== undefined && (
                                                    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", color: AMBER, marginLeft: 10, flexShrink: 0 }}>
                                                        ×{item.sensitivity_score?.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            {item.impact_range && (
                                                <p style={{ fontSize: 10, color: MUTED, margin: 0, fontFamily: "monospace" }}>
                                                    Range: {JSON.stringify(item.impact_range)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cost effectiveness */}
                        {isFinal && displayResult.cost_effectiveness_summary && (
                            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <BarChart2 size={13} color={GREEN} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: 0 }}>
                                        Cost-Effectiveness Summary
                                    </p>
                                </div>
                                {displayResult.cost_effectiveness_summary.most_cost_effective_option && (
                                    <p style={{ fontSize: 12, color: TEXT, margin: "0 0 8px" }}>
                                        <span style={{ fontWeight: 700, color: GREEN }}>Most cost-effective:</span>{" "}
                                        {displayResult.cost_effectiveness_summary.most_cost_effective_option}
                                    </p>
                                )}
                                {displayResult.cost_effectiveness_summary.recommendation && (
                                    <p style={{ fontSize: 12, color: MUTED, margin: "0 0 8px", lineHeight: 1.6, fontStyle: "italic" }}>
                                        {displayResult.cost_effectiveness_summary.recommendation}
                                    </p>
                                )}
                                {displayResult.cost_effectiveness_summary.cost_comparisons?.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {displayResult.cost_effectiveness_summary.cost_comparisons.map((comp, i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                                <span style={{ fontSize: 11, color: TEXT, fontWeight: 600 }}>{comp.option}</span>
                                                <div style={{ display: "flex", gap: 12 }}>
                                                    {comp.total_cost_usd != null && (
                                                        <span style={{ fontSize: 11, color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>
                                                            ${comp.total_cost_usd.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {comp.cost_per_qaly != null && (
                                                        <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                                                            ${comp.cost_per_qaly.toLocaleString()}/QALY
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
