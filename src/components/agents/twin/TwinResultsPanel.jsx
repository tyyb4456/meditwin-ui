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
                                    <div style={{ marginTop: 8, padding: "8px 10px", background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                        <Activity size={12} color={GREEN} />
                                        <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>
                                            <span style={{ fontWeight: 700, color: GREEN }}>Recommended:</span>{" "}
                                            Option {displayResult.simulation_summary.recommended_option}
                                            {(() => {
                                                const rec = displayResult.scenarios?.find(s => s.option_id === displayResult.simulation_summary.recommended_option);
                                                return rec ? ` — ${rec.label}` : "";
                                            })()}
                                        </p>
                                        {displayResult.simulation_summary.recommendation_confidence != null && (
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: `${GREEN}12`, border: `1px solid ${GREEN}30`, color: GREEN, borderRadius: 4, fontFamily: "monospace", marginLeft: "auto" }}>
                                                {(displayResult.simulation_summary.recommendation_confidence * 100).toFixed(0)}% confidence
                                            </span>
                                        )}
                                    </div>
                                )}
                                {/* Model confidence badge */}
                                {displayResult.simulation_summary.model_confidence && (
                                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: 10, color: MUTED }}>Model confidence:</span>
                                        <span style={{
                                            fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, letterSpacing: "0.1em",
                                            color: displayResult.simulation_summary.model_confidence === "HIGH" ? GREEN : displayResult.simulation_summary.model_confidence === "MODERATE" ? AMBER : RED,
                                            background: `${displayResult.simulation_summary.model_confidence === "HIGH" ? GREEN : displayResult.simulation_summary.model_confidence === "MODERATE" ? AMBER : RED}15`,
                                            border: `1px solid ${displayResult.simulation_summary.model_confidence === "HIGH" ? GREEN : displayResult.simulation_summary.model_confidence === "MODERATE" ? AMBER : RED}30`,
                                        }}>{displayResult.simulation_summary.model_confidence}</span>
                                    </div>
                                )}
                                {/* Baseline risks — prefer with_ci version for CI bounds + extended horizons */}
                                {(displayResult.simulation_summary.baseline_risks_with_ci || displayResult.simulation_summary.baseline_risks) && (() => {
                                    const withCI = displayResult.simulation_summary.baseline_risks_with_ci;
                                    const plain  = displayResult.simulation_summary.baseline_risks;
                                    const source = withCI || plain;
                                    return (
                                        <div style={{ marginTop: 10 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Baseline Risks (No Treatment)</p>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 6 }}>
                                                {Object.entries(source).map(([k, v]) => {
                                                    const point = withCI ? v.point_estimate : v;
                                                    const lo    = withCI ? v.lower_bound_95ci : null;
                                                    const hi    = withCI ? v.upper_bound_95ci : null;
                                                    const conf  = withCI ? v.confidence_level : null;
                                                    return (
                                                        <div key={k} style={{ padding: "8px 10px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "capitalize", color: MUTED, margin: "0 0 3px" }}>{k.replace(/_/g, " ")}</p>
                                                            <p style={{ fontSize: 15, fontWeight: 900, color: TEXT, margin: 0, fontFamily: "monospace" }}>
                                                                {typeof point === "number" ? `${(point * 100).toFixed(1)}%` : point}
                                                            </p>
                                                            {lo != null && hi != null && (
                                                                <p style={{ fontSize: 9, color: MUTED, margin: "2px 0 0", fontFamily: "monospace" }}>
                                                                    95% CI: {(lo * 100).toFixed(1)}%–{(hi * 100).toFixed(1)}%
                                                                    {conf && <span style={{ marginLeft: 4, color: conf === "HIGH" ? GREEN : AMBER }}>[{conf}]</span>}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
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
                                    // safety flag drives color
                                    const safeFlag = scen.safety_check?.safety_flag ?? "";
                                    const rColor = safeFlag === "CONTRAINDICATED" ? RED
                                        : safeFlag === "INTERACTION_WARNING"  ? AMBER
                                        : safeFlag === "SAFE"                 ? GREEN : BLUE;
                                    const isRecommended = displayResult.simulation_summary?.recommended_option === scen.option_id;
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
                                                            padding: "2px 8px",
                                                            background: isRecommended ? `${GREEN}15` : `${BLUE}15`,
                                                            color: isRecommended ? GREEN : BLUE,
                                                            border: `1px solid ${isRecommended ? GREEN : BLUE}30`, borderRadius: 6,
                                                        }}>
                                                            Option {scen.option_id}{isRecommended ? " ★" : ""}
                                                        </span>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>
                                                            {scen.label ?? scen.treatment_label}
                                                        </p>
                                                        {safeFlag && (
                                                            <span style={{
                                                                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                                                                padding: "2px 6px", color: rColor, background: `${rColor}15`,
                                                                border: `1px solid ${rColor}30`, borderRadius: 4,
                                                            }}>
                                                                {safeFlag.replace(/_/g, " ")}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Quick stats row */}
                                                    {scen.predictions && (
                                                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                            {[
                                                                { label: "Mortality 30d", val: scen.predictions.mortality_risk_30d },
                                                                { label: "Readmission 30d", val: scen.predictions.readmission_risk_30d },
                                                                { label: "Recovery 7d", val: scen.predictions.recovery_probability_7d },
                                                            ].filter(s => s.val != null).map(s => (
                                                                <span key={s.label} style={{ fontSize: 10, color: MUTED }}>
                                                                    {s.label}: <span style={{ fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>
                                                                        {(s.val * 100).toFixed(1)}%
                                                                    </span>
                                                                </span>
                                                            ))}
                                                        </div>
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
                                                    {/* Drugs + interventions */}
                                                    {(scen.drugs?.length > 0 || scen.interventions?.length > 0) && (
                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                                            {scen.drugs?.length > 0 && (
                                                                <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                                                    <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: CYAN, margin: "0 0 6px" }}>Drugs</p>
                                                                    {scen.drugs.map((d, i) => (
                                                                        <p key={i} style={{ fontSize: 11, color: TEXT, margin: "0 0 3px" }}>• {d}</p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {scen.interventions?.length > 0 && (
                                                                <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                                                    <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: PURPLE, margin: "0 0 6px" }}>Interventions</p>
                                                                    {scen.interventions.map((v, i) => (
                                                                        <p key={i} style={{ fontSize: 11, color: TEXT, margin: "0 0 3px" }}>• {v}</p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Predictions grid — with CI bounds if available */}
                                                    {scen.predictions && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>Predicted Outcomes</p>
                                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                                                                {Object.entries(scen.predictions).map(([metric, val]) => {
                                                                    const ci = scen.predictions_with_ci?.[metric];
                                                                    return (
                                                                        <div key={metric} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                                                            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE, margin: "0 0 4px" }}>
                                                                                {metric.replace(/_/g, " ")}
                                                                            </p>
                                                                            <p style={{ fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, fontFamily: "monospace" }}>
                                                                                {metric.includes("days") ? `${val}d` : `${(val * 100).toFixed(1)}%`}
                                                                            </p>
                                                                            {ci && ci.lower_bound_95ci != null && ci.upper_bound_95ci != null && (
                                                                                <p style={{ fontSize: 9, color: MUTED, margin: "2px 0 0", fontFamily: "monospace" }}>
                                                                                    95% CI: {(ci.lower_bound_95ci * 100).toFixed(1)}%–{(ci.upper_bound_95ci * 100).toFixed(1)}%
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Guideline adherence */}
                                                    {scen.guideline_adherence?.length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Guideline Adherence</p>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                                {scen.guideline_adherence.map((g, gi) => {
                                                                    const adColor = g.adherence === "FIRST_LINE" ? GREEN : g.adherence === "INPATIENT_APPROPRIATE" ? CYAN : AMBER;
                                                                    return (
                                                                        <div key={gi} style={{ padding: "8px 10px", background: BG, border: `1px solid ${adColor}30`, borderRadius: 8 }}>
                                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                                                                <BookOpen size={10} color={adColor} />
                                                                                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{g.drug}</span>
                                                                                <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 4, background: `${adColor}12`, border: `1px solid ${adColor}30`, color: adColor, letterSpacing: "0.08em" }}>
                                                                                    {(g.adherence || "").replace(/_/g, " ")}
                                                                                </span>
                                                                            </div>
                                                                            {g.message && <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{g.message}</p>}
                                                                            {g.alternatives?.length > 0 && (
                                                                                <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0" }}>
                                                                                    Alternatives: {g.alternatives.join(", ")}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Structured safety check — allergy + interaction alerts */}
                                                    {(scen.safety_check?.allergy_alerts?.length > 0 || scen.safety_check?.interaction_alerts?.length > 0) && (
                                                        <div>
                                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Safety Check Detail</p>
                                                                {scen.safety_check.summary && (
                                                                    <span style={{ fontSize: 10, color: MUTED, fontStyle: "italic" }}>{scen.safety_check.summary}</span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                                {scen.safety_check.allergy_alerts?.map((a, ai) => (
                                                                    <div key={ai} style={{ padding: "7px 10px", background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 7, display: "flex", alignItems: "flex-start", gap: 7 }}>
                                                                        <AlertTriangle size={11} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                                                                        <div>
                                                                            <p style={{ fontSize: 11, fontWeight: 700, color: RED, margin: 0 }}>
                                                                                {a.drug} ↔ {a.allergen}
                                                                                {a.severity && <span style={{ fontWeight: 400, marginLeft: 6, opacity: 0.8 }}>({a.severity})</span>}
                                                                            </p>
                                                                            {a.alert && <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0", lineHeight: 1.4 }}>{a.alert}</p>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {scen.safety_check.interaction_alerts?.map((ia, iai) => (
                                                                    <div key={iai} style={{ padding: "7px 10px", background: `${AMBER}08`, border: `1px solid ${AMBER}30`, borderRadius: 7, display: "flex", alignItems: "flex-start", gap: 7 }}>
                                                                        <AlertTriangle size={11} color={AMBER} style={{ flexShrink: 0, marginTop: 1 }} />
                                                                        <div>
                                                                            <p style={{ fontSize: 11, fontWeight: 700, color: AMBER, margin: 0 }}>
                                                                                {ia.proposed_drug} ↔ {ia.existing_drug}
                                                                            </p>
                                                                            {ia.warning && <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0", lineHeight: 1.4 }}>{ia.warning}</p>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Key risks (text summary) */}
                                                    {scen.key_risks?.length > 0 && (
                                                        <div>
                                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Key Risks</p>
                                                            {scen.key_risks.map((r, i) => (
                                                                <p key={i} style={{ fontSize: 11, color: r.includes("🚨") ? RED : AMBER, margin: "0 0 4px", lineHeight: 1.5 }}>{r}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {scen.estimated_cost_usd != null && (
                                                        <div style={{ padding: 10, background: `${GREEN}08`, border: `1px solid ${GREEN}25`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                                            <DollarSign size={12} color={GREEN} />
                                                            <span style={{ fontSize: 12, color: MUTED }}>Estimated cost: </span>
                                                            <span style={{ fontSize: 13, fontWeight: 800, color: GREEN, fontFamily: "monospace" }}>
                                                                ${scen.estimated_cost_usd.toLocaleString()}
                                                            </span>
                                                            {scen.cost_source && (
                                                                <span style={{ fontSize: 10, color: MUTED, fontStyle: "italic" }}>({scen.cost_source})</span>
                                                            )}
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
                                        // contribution is a string like "+0.12" or "-0.05"
                                        const contribNum = parseFloat(feat.contribution ?? feat.impact ?? 0);
                                        const impScore   = feat.importance_score ?? Math.abs(contribNum);
                                        const maxScore   = displayResult.feature_attribution[0]?.importance_score
                                            ?? Math.abs(parseFloat(displayResult.feature_attribution[0]?.contribution ?? 1));
                                        const pct = maxScore > 0 ? (impScore / maxScore) * 100 : 0;
                                        const increases = (feat.direction ?? "increases_risk") === "increases_risk";
                                        const barColor  = increases ? RED : GREEN;
                                        const contribLabel = feat.contribution
                                            ? `${feat.contribution} risk`
                                            : `${contribNum >= 0 ? "+" : ""}${(contribNum * 100).toFixed(1)}%`;
                                        return (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <TrendingUp size={11} color={barColor} />
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{feat.feature}</span>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                                                            score: {impScore.toFixed(2)}
                                                        </span>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: "monospace" }}>
                                                            {contribLabel}
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
                                    {displayResult.sensitivity_analysis.map((item, idx) => {
                                        const magnitude = item.sensitivity_magnitude ?? item.sensitivity_score ?? 0;
                                        const isInsensitive = (item.model_sensitivity || "").includes("INSENSITIVE");
                                        const magColor = isInsensitive ? MUTED : magnitude >= 3 ? RED : magnitude >= 1 ? AMBER : GREEN;
                                        const improved = item.risk_impact_if_improved?.mortality_30d_change ?? 0;
                                        const worsened = item.risk_impact_if_worsened?.mortality_30d_change ?? 0;
                                        return (
                                            <div key={idx} style={{ padding: 12, borderBottom: `1px solid ${BORDER}` }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                                            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, textTransform: "capitalize" }}>
                                                                {(item.feature_name ?? item.parameter ?? "").replace(/_/g, " ")}
                                                            </p>
                                                            <span style={{
                                                                fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 4,
                                                                color: magColor, background: `${magColor}15`, border: `1px solid ${magColor}30`,
                                                                textTransform: "uppercase", letterSpacing: "0.1em",
                                                            }}>
                                                                {item.model_sensitivity ?? "—"}
                                                            </span>
                                                        </div>
                                                        {item.clinical_intervention && (
                                                            <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                                                                Intervention: {item.clinical_intervention}
                                                            </p>
                                                        )}
                                                        {item.insensitive_note && (
                                                            <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0", fontStyle: "italic", opacity: 0.7 }}>
                                                                {item.insensitive_note}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span style={{
                                                        fontSize: 13, fontWeight: 800, fontFamily: "monospace",
                                                        color: magColor, marginLeft: 10, flexShrink: 0,
                                                    }}>
                                                        ×{magnitude.toFixed(2)}
                                                    </span>
                                                </div>
                                                {/* Improve / worsen impact pills */}
                                                {!isInsensitive && (improved !== 0 || worsened !== 0) && (
                                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                        {improved !== 0 && (
                                                            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", padding: "2px 8px", borderRadius: 4, background: `${GREEN}15`, border: `1px solid ${GREEN}30`, color: GREEN }}>
                                                                ↓ {Math.abs(improved).toFixed(2)}% mortality if improved
                                                            </span>
                                                        )}
                                                        {worsened !== 0 && (
                                                            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", padding: "2px 8px", borderRadius: 4, background: `${RED}15`, border: `1px solid ${RED}30`, color: RED }}>
                                                                ↑ +{Math.abs(worsened).toFixed(2)}% mortality if worsened
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {isFinal && displayResult.cost_effectiveness_summary && (
                            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <BarChart2 size={13} color={GREEN} />
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: 0 }}>
                                        Cost-Effectiveness Summary
                                    </p>
                                </div>
                                {(displayResult.cost_effectiveness_summary.most_cost_effective ?? displayResult.cost_effectiveness_summary.most_cost_effective_option) && (
                                    <p style={{ fontSize: 12, color: TEXT, margin: "0 0 8px" }}>
                                        <span style={{ fontWeight: 700, color: GREEN }}>Most cost-effective:</span>{" "}
                                        Option {displayResult.cost_effectiveness_summary.most_cost_effective ?? displayResult.cost_effectiveness_summary.most_cost_effective_option}
                                    </p>
                                )}
                                {displayResult.cost_effectiveness_summary.interpretation && (
                                    <p style={{ fontSize: 11, color: MUTED, margin: "0 0 10px", lineHeight: 1.6, fontStyle: "italic" }}>
                                        {displayResult.cost_effectiveness_summary.interpretation}
                                    </p>
                                )}
                                {/* scenarios array from backend */}
                                {displayResult.cost_effectiveness_summary.scenarios?.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {/* Threshold / discount metadata */}
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                                            {displayResult.cost_effectiveness_summary.threshold_used_usd_per_qaly != null && (
                                                <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                                                    Threshold: ${displayResult.cost_effectiveness_summary.threshold_used_usd_per_qaly.toLocaleString()}/QALY
                                                </span>
                                            )}
                                            {displayResult.cost_effectiveness_summary.discount_rate_used != null && (
                                                <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                                                    · Discount rate: {(displayResult.cost_effectiveness_summary.discount_rate_used * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        {displayResult.cost_effectiveness_summary.scenarios.map((comp, i) => {
                                            const isBest = comp.option_id === (displayResult.cost_effectiveness_summary.most_cost_effective ?? displayResult.cost_effectiveness_summary.most_cost_effective_option);
                                            const isContra = comp.cost_effective === "CONTRAINDICATED";
                                            const isBaseline = comp.cost_effective === "BASELINE_COMPARATOR";
                                            const rowColor = isContra ? RED : isBest ? GREEN : isBaseline ? MUTED : BLUE;
                                            return (
                                                <div key={i} style={{
                                                    padding: "10px 12px", background: SURFACE,
                                                    border: `1px solid ${isContra ? RED + "40" : isBest ? GREEN + "40" : BORDER}`,
                                                    borderRadius: 8,
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                                                        <div>
                                                            <span style={{ fontSize: 11, color: rowColor, fontWeight: 700 }}>Option {comp.option_id}</span>
                                                            <span style={{ fontSize: 11, color: MUTED, marginLeft: 6 }}>{comp.label}</span>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                                            {comp.estimated_cost_usd != null && (
                                                                <span style={{ fontSize: 12, color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>
                                                                    ${comp.estimated_cost_usd.toLocaleString()}
                                                                </span>
                                                            )}
                                                            {typeof comp.cost_per_qaly === "number" && (
                                                                <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                                                                    ${comp.cost_per_qaly.toLocaleString()}/QALY
                                                                </span>
                                                            )}
                                                            {comp.estimated_qalys != null && (
                                                                <span style={{ fontSize: 10, color: CYAN, fontFamily: "monospace" }}>
                                                                    {comp.estimated_qalys.toFixed(2)} QALYs
                                                                </span>
                                                            )}
                                                            {isContra && (
                                                                <span style={{ fontSize: 9, fontWeight: 800, color: RED, background: `${RED}15`, border: `1px solid ${RED}30`, padding: "1px 6px", borderRadius: 4 }}>
                                                                    CONTRAINDICATED
                                                                </span>
                                                            )}
                                                            {isBaseline && (
                                                                <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, background: `${MUTED}15`, border: `1px solid ${MUTED}30`, padding: "1px 6px", borderRadius: 4 }}>
                                                                    BASELINE
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Survival + QoL row */}
                                                    {(comp.survival_probability_30d != null || comp.quality_of_life_score != null) && (
                                                        <div style={{ display: "flex", gap: 12, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${BORDER}` }}>
                                                            {comp.survival_probability_30d != null && (
                                                                <span style={{ fontSize: 10, color: MUTED }}>
                                                                    Survival 30d: <span style={{ color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>{(comp.survival_probability_30d * 100).toFixed(1)}%</span>
                                                                </span>
                                                            )}
                                                            {comp.quality_of_life_score != null && (
                                                                <span style={{ fontSize: 10, color: MUTED }}>
                                                                    QoL score: <span style={{ color: CYAN, fontWeight: 700, fontFamily: "monospace" }}>{comp.quality_of_life_score.toFixed(3)}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {/* fallback: old cost_comparisons shape */}
                                {!displayResult.cost_effectiveness_summary.scenarios && displayResult.cost_effectiveness_summary.cost_comparisons?.length > 0 && (
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

                        {/* Provenance */}
                        {isFinal && displayResult.provenance && (
                            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, background: `${BLUE}06`, display: "flex", alignItems: "center", gap: 8 }}>
                                    <Cpu size={12} color={BLUE} />
                                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT, margin: 0 }}>Provenance</p>
                                </div>
                                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6 }}>
                                        {[
                                            { label: "Simulation ID",  val: displayResult.provenance.simulation_id, mono: true },
                                            { label: "Model Version",  val: `v${displayResult.provenance.model_version}` },
                                            { label: "Feature Count",  val: displayResult.provenance.feature_count },
                                            { label: "Confidence",     val: displayResult.provenance.overall_confidence },
                                            { label: "Reproducible",   val: displayResult.provenance.reproducible ? "Yes" : "No" },
                                        ].filter(r => r.val != null).map((r, i) => (
                                            <div key={i} style={{ padding: "6px 10px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 7 }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 2px" }}>{r.label}</p>
                                                <p style={{ fontSize: 11, fontWeight: 700, color: TEXT, margin: 0, fontFamily: r.mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{r.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {displayResult.provenance.models_used?.length > 0 && (
                                        <div>
                                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>Models Used</p>
                                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                {displayResult.provenance.models_used.map((m, i) => (
                                                    <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", background: `${BLUE}10`, border: `1px solid ${BLUE}25`, color: BLUE, borderRadius: 4, fontFamily: "monospace" }}>{m}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {displayResult.provenance.fulfilled_horizons?.length > 0 && (
                                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                            <div>
                                                <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, margin: "0 0 4px" }}>Fulfilled Horizons</p>
                                                <div style={{ display: "flex", gap: 4 }}>
                                                    {displayResult.provenance.fulfilled_horizons.map((h, i) => (
                                                        <span key={i} style={{ fontSize: 10, padding: "1px 7px", background: `${GREEN}12`, border: `1px solid ${GREEN}30`, color: GREEN, borderRadius: 4 }}>{h}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {displayResult.provenance.unfulfilled_horizons?.length > 0 && (
                                                <div>
                                                    <p style={{ fontSize: 9, fontWeight: 700, color: MUTED, margin: "0 0 4px" }}>Unfulfilled</p>
                                                    <div style={{ display: "flex", gap: 4 }}>
                                                        {displayResult.provenance.unfulfilled_horizons.map((h, i) => (
                                                            <span key={i} style={{ fontSize: 10, padding: "1px 7px", background: `${RED}12`, border: `1px solid ${RED}30`, color: RED, borderRadius: 4 }}>{h}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {displayResult.provenance.timestamp && (
                                        <p style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", margin: 0 }}>
                                            {new Date(displayResult.provenance.timestamp).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}