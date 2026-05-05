import { useState } from "react";
import {
    Cpu, FileJson, AlertCircle, Loader2, ChevronDown,
    AlertTriangle, Copy, Check, X, Activity, BarChart2,
    TrendingUp, Zap, DollarSign, BookOpen
} from "lucide-react";

const C = {
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)",
    accent: "#3b82f6", text: "var(--color-text)", muted: "var(--color-text-subtle)",
    dim: "var(--color-border)", green: "#22C55E", yellow: "#EAB308",
    red: "#EF4444", cyan: "#06B6D4", orange: "#F97316", purple: "#8b5cf6", blue: "#3b82f6", amber: "#F59E0B",
};

const riskColor = (risk) => {
    const r = (risk || "").toUpperCase();
    if (r === "CRITICAL" || r === "VERY_HIGH" || r === "VERY HIGH") return C.red;
    if (r === "HIGH")                                                return C.orange;
    if (r === "MODERATE" || r === "MEDIUM")                         return C.yellow;
    if (r === "LOW" || r === "MINIMAL")                             return C.green;
    return C.muted;
};

export default function TwinResultsPanel({
    isStreaming, currentStep, error, streamEvents, eventsEndRef,
    liveText, finalResult, displayResult, isFinal,
    expandedScen, setExpandedScen,
    handleCopy, handleAbort, copied,
}) {
    const eventBadgeStyle = (type) => {
        const map = {
            error:    [C.red,    "#FEE2E2"],
            complete: [C.green,  "#DCFCE7"],
            status:   [C.blue,   "#DBEAFE"],
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
                    <div style={{ padding: "10px 14px", background: C.blue, color: "#fff", display: "flex", alignItems: "center", gap: 10, animation: "pulse 2s infinite" }}>
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
                    <div style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.blue} 6%, ${C.surface})` }}>
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
                                    : <Loader2  size={12} color={C.blue} style={{ animation: "spin 2s linear infinite" }} />}
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

                        {displayResult.simulation_summary && (
                            <div style={{
                                background: `${C.blue}10`, border: `1px solid ${C.blue}40`,
                                borderLeft: `4px solid ${riskColor(displayResult.simulation_summary.patient_risk_profile)}`,
                                padding: 14,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                                    <Zap size={13} color={riskColor(displayResult.simulation_summary.patient_risk_profile)} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: riskColor(displayResult.simulation_summary.patient_risk_profile), margin: 0 }}>
                                        Simulation Summary — {displayResult.simulation_summary.patient_risk_profile}
                                    </p>
                                </div>
                                {displayResult.simulation_summary.primary_concern && (
                                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>
                                        {displayResult.simulation_summary.primary_concern}
                                    </p>
                                )}
                                {displayResult.simulation_summary.recommended_option && (
                                    <div style={{ marginTop: 8, padding: "8px 10px", background: `${C.green}10`, border: `1px solid ${C.green}30`, display: "flex", alignItems: "center", gap: 8 }}>
                                        <Activity size={12} color={C.green} />
                                        <p style={{ fontSize: 12, color: C.text, margin: 0 }}>
                                            <span style={{ fontWeight: 700, color: C.green }}>Recommended:</span> {displayResult.simulation_summary.recommended_option}
                                        </p>
                                    </div>
                                )}
                                {displayResult.simulation_summary.baseline_risks && (
                                    <div style={{ marginTop: 10 }}>
                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Baseline Risks</p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {Object.entries(displayResult.simulation_summary.baseline_risks).map(([k, v]) => (
                                                <div key={k} style={{ padding: "5px 10px", background: C.bg, border: `1px solid ${C.border}`, fontSize: 11 }}>
                                                    <span style={{ color: C.muted, textTransform: "capitalize" }}>{k.replace(/_/g, " ")}: </span>
                                                    <span style={{ color: C.text, fontWeight: 700, fontFamily: "monospace" }}>
                                                        {typeof v === "number" ? `${(v * 100).toFixed(1)}%` : v}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {displayResult.scenarios?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.blue} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Scenarios ({displayResult.scenarios.length})
                                    </p>
                                </div>
                                {displayResult.scenarios.map((scen, idx) => {
                                    const isExp = expandedScen === idx;
                                    const rColor = riskColor(scen.outcomes?.risk_level);
                                    return (
                                        <div key={idx} style={{ borderBottom: `1px solid ${C.border}` }}>
                                            <div
                                                style={{ padding: 12, cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}
                                                onClick={() => setExpandedScen(isExp ? null : idx)}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                                                            padding: "2px 8px", background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}30`,
                                                        }}>
                                                            Option {scen.option_id}
                                                        </span>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>{scen.treatment_label}</p>
                                                        {scen.outcomes?.risk_level && (
                                                            <span style={{
                                                                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                                                                padding: "2px 6px", color: rColor, background: `${rColor}15`, border: `1px solid ${rColor}30`,
                                                            }}>
                                                                {scen.outcomes.risk_level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {scen.outcomes?.narrative && (
                                                        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.55 }}>
                                                            {scen.outcomes.narrative.slice(0, 120)}...
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronDown size={14} color={C.muted} style={{
                                                    marginLeft: 10, flexShrink: 0,
                                                    transform: isExp ? "rotate(180deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s",
                                                }} />
                                            </div>

                                            {isExp && (
                                                <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
                                                    {scen.outcomes?.predicted_outcomes && Object.keys(scen.outcomes.predicted_outcomes).length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 8px" }}>Predicted Outcomes</p>
                                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                                                                {Object.entries(scen.outcomes.predicted_outcomes).map(([horizon, outcomes]) => (
                                                                    <div key={horizon} style={{ padding: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                                                                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.blue, margin: "0 0 6px" }}>{horizon}</p>
                                                                        {Object.entries(outcomes).map(([metric, val]) => (
                                                                            <div key={metric} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11 }}>
                                                                                <span style={{ color: C.muted, textTransform: "capitalize" }}>{metric.replace(/_/g, " ")}</span>
                                                                                <span style={{ color: C.text, fontWeight: 700, fontFamily: "monospace" }}>
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
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Narrative</p>
                                                            <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                                                                {scen.outcomes.narrative}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {scen.cost_estimate && (
                                                        <div style={{ padding: 10, background: `${C.green}08`, border: `1px solid ${C.green}25`, display: "flex", alignItems: "center", gap: 8 }}>
                                                            <DollarSign size={12} color={C.green} />
                                                            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                                                                {[
                                                                    { label: "Direct",      val: scen.cost_estimate.direct_cost_usd },
                                                                    { label: "Indirect",    val: scen.cost_estimate.indirect_cost_usd },
                                                                    { label: "Total Est.",  val: scen.cost_estimate.total_estimated_cost_usd },
                                                                ].filter(f => f.val != null).map(f => (
                                                                    <div key={f.label} style={{ fontSize: 11 }}>
                                                                        <span style={{ color: C.muted }}>{f.label}: </span>
                                                                        <span style={{ color: C.green, fontWeight: 700, fontFamily: "monospace" }}>${f.val.toLocaleString()}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {scen.drug_synergies?.length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, margin: "0 0 6px" }}>Drug Synergies</p>
                                                            {scen.drug_synergies.map((syn, si) => (
                                                                <div key={si} style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
                                                                    <span style={{ color: C.cyan, fontWeight: 700 }}>{syn.drug_a} + {syn.drug_b}</span>: {syn.effect}
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

                        {isFinal && displayResult.what_if_narrative && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <BookOpen size={13} color={C.blue} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                        What-If Narrative
                                    </p>
                                </div>
                                <p style={{ fontSize: 12, color: C.text, margin: 0, lineHeight: 1.8, fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                                    {displayResult.what_if_narrative}
                                </p>
                            </div>
                        )}

                        {isFinal && displayResult.feature_attribution?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.purple} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Feature Attribution (Top Factors)
                                    </p>
                                </div>
                                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                                    {displayResult.feature_attribution.slice(0, 6).map((feat, i) => {
                                        const absImpact = Math.abs(feat.impact || 0);
                                        const maxImpact = Math.abs(displayResult.feature_attribution[0]?.impact || 1);
                                        const pct = (absImpact / maxImpact) * 100;
                                        const barColor = (feat.impact || 0) >= 0 ? C.red : C.green;
                                        return (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <TrendingUp size={11} color={barColor} />
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{feat.feature}</span>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                                                            {feat.value !== undefined ? String(feat.value) : "—"}
                                                        </span>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: "monospace" }}>
                                                            {feat.impact >= 0 ? "+" : ""}{(feat.impact * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                                                </div>
                                                {feat.explanation && (
                                                    <p style={{ fontSize: 10, color: C.muted, margin: "3px 0 0", fontStyle: "italic" }}>{feat.explanation}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.sensitivity_analysis?.length > 0 && (
                            <div style={{ border: `1px solid ${C.border}` }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: `color-mix(in srgb, ${C.amber} 6%, ${C.surface})` }}>
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.text, margin: 0 }}>
                                        Sensitivity Analysis
                                    </p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {displayResult.sensitivity_analysis.map((item, idx) => (
                                        <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{item.parameter}</p>
                                                    {item.description && (
                                                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{item.description}</p>
                                                    )}
                                                </div>
                                                {item.sensitivity_score !== undefined && (
                                                    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", color: C.amber, marginLeft: 10, flexShrink: 0 }}>
                                                        ×{item.sensitivity_score?.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            {item.impact_range && (
                                                <p style={{ fontSize: 10, color: C.muted, margin: 0, fontFamily: "monospace" }}>
                                                    Range: {JSON.stringify(item.impact_range)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.cost_effectiveness_summary && (
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <BarChart2 size={13} color={C.green} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, margin: 0 }}>
                                        Cost-Effectiveness Summary
                                    </p>
                                </div>
                                {displayResult.cost_effectiveness_summary.most_cost_effective_option && (
                                    <p style={{ fontSize: 12, color: C.text, margin: "0 0 8px" }}>
                                        <span style={{ fontWeight: 700, color: C.green }}>Most cost-effective:</span>{" "}
                                        {displayResult.cost_effectiveness_summary.most_cost_effective_option}
                                    </p>
                                )}
                                {displayResult.cost_effectiveness_summary.recommendation && (
                                    <p style={{ fontSize: 12, color: C.muted, margin: "0 0 8px", lineHeight: 1.6, fontStyle: "italic" }}>
                                        {displayResult.cost_effectiveness_summary.recommendation}
                                    </p>
                                )}
                                {displayResult.cost_effectiveness_summary.cost_comparisons?.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {displayResult.cost_effectiveness_summary.cost_comparisons.map((comp, i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: C.surface, border: `1px solid ${C.border}` }}>
                                                <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{comp.option}</span>
                                                <div style={{ display: "flex", gap: 12 }}>
                                                    {comp.total_cost_usd != null && (
                                                        <span style={{ fontSize: 11, color: C.green, fontWeight: 700, fontFamily: "monospace" }}>
                                                            ${comp.total_cost_usd.toLocaleString()}
                                                        </span>
                                                    )}
                                                    {comp.cost_per_qaly != null && (
                                                        <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
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

                        {!isStreaming && streamEvents.length === 0 && (
                            <div style={{ padding: "48px 0", textAlign: "center" }}>
                                <Cpu size={40} color={C.dim} style={{ margin: "0 auto 12px", display: "block" }} strokeWidth={1} />
                                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 4px" }}>
                                    Ready to simulate. Configure patient state, diagnosis, and treatment options.
                                </p>
                                <p style={{ fontSize: 11, color: C.muted, margin: 0, opacity: 0.6 }}>
                                    Powered by SHAP · Monte-Carlo · Port :8006
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
