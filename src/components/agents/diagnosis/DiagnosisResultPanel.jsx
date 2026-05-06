import {
    CheckCircle2, AlertCircle, Loader2, X, AlertTriangle,
    Activity, Pill, Clock, TrendingUp, ChevronDown,
    Copy, Check, Zap, Brain, BarChart2, FileWarning, BookOpen, Database,
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
const PURPLE  = "#8B5CF6";

const eventColor = { error: RED, complete: GREEN, status: CYAN, progress: AMBER };

function ConfidenceBadge({ level }) {
    const map = { HIGH: [GREEN, "HIGH"], MODERATE: [AMBER, "MODERATE"], LOW: [RED, "LOW"] };
    const [color, label] = map[level] || [SUBTLE, level || "—"];
    const pct = level === "HIGH" ? 85 : level === "MODERATE" ? 60 : level === "LOW" ? 35 : 10;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: "-0.01em" }}>{label}</span>
                <span style={{ fontSize: 11, color: MUTED }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
            </div>
        </div>
    );
}

function IdlePlaceholder() {
    return (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: SURFACE2, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Brain size={24} color={SUBTLE} style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: MUTED, margin: "0 0 6px" }}>Ready to diagnose</p>
            <p style={{ fontSize: 12, color: SUBTLE, margin: 0, opacity: 0.7 }}>Fill in the form and hit Run Diagnosis to start streaming</p>
        </div>
    );
}

export default function DiagnosisResultPanel({
    isStreaming, streamEvents, finalResult, partialResult,
    liveText, currentStep, error,
    expandedDiagnosis, setExpandedDiagnosis,
    handleAbort, handleCopy, copied, eventsEndRef,
}) {
    const displayResult = finalResult || partialResult;

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
                    background: "color-mix(in srgb, var(--color-accent) 5%, var(--color-surface))",
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

            {/* Live / Final JSON Output */}
            {(liveText || finalResult) && (
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ padding: "11px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {finalResult
                                ? <CheckCircle2 size={13} color={GREEN} />
                                : <Loader2 size={13} color={ACCENT} style={{ animation: "spin 2s linear infinite" }} />}
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

            {/* Structured Results */}
            {displayResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, opacity: finalResult ? 1 : 0.65, transition: "opacity 0.4s" }}>

                    {/* Summary row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${PURPLE}`, borderRadius: 10, padding: "16px 18px" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 8px" }}>Top Diagnosis</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                {!finalResult && <Loader2 size={12} color={ACCENT} style={{ animation: "spin 2s linear infinite", flexShrink: 0 }} />}
                                <p style={{ fontSize: 14, fontWeight: 900, color: TEXT, margin: 0, lineHeight: 1.3 }}>{displayResult.top_diagnosis || "Calculating..."}</p>
                            </div>
                            <p style={{ fontSize: 10, color: SUBTLE, margin: 0, fontFamily: "monospace" }}>ICD-10: {displayResult.top_icd10_code || "—"}</p>
                        </div>
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CYAN}`, borderRadius: 10, padding: "16px 18px" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 8px" }}>Confidence Level</p>
                            <ConfidenceBadge level={displayResult.confidence_level} />
                        </div>
                    </div>

                    {/* Clinical alerts */}
                    {(displayResult.penicillin_allergy_flagged || displayResult.high_suspicion_sepsis || displayResult.requires_isolation) && (
                        <div style={{ background: `${AMBER}0D`, border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <AlertTriangle size={14} color={AMBER} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: AMBER }}>Clinical Alerts</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                {displayResult.penicillin_allergy_flagged && <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: TEXT }}><div style={{ width: 6, height: 6, background: AMBER, borderRadius: "50%", marginTop: 4, flexShrink: 0 }} />Beta-lactam allergy detected — avoid penicillin-class antibiotics</div>}
                                {displayResult.high_suspicion_sepsis && <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: TEXT }}><div style={{ width: 6, height: 6, background: RED, borderRadius: "50%", marginTop: 4, flexShrink: 0 }} />High suspicion of sepsis — urgent evaluation required</div>}
                                {displayResult.requires_isolation && <div style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: TEXT }}><div style={{ width: 6, height: 6, background: PURPLE, borderRadius: "50%", marginTop: 4, flexShrink: 0 }} />Isolation precautions recommended</div>}
                            </div>
                        </div>
                    )}

                    {/* Differential diagnosis grid */}
                    {displayResult.differential_diagnosis?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, ${PURPLE} 6%, var(--color-surface))` }}>
                                <BarChart2 size={13} color={PURPLE} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Differential Diagnosis ({displayResult.differential_diagnosis.length})
                                </span>
                                {!finalResult && <Loader2 size={10} color={SUBTLE} style={{ animation: "spin 2s linear infinite", marginLeft: 4 }} />}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: BORDER }}>
                                {displayResult.differential_diagnosis.map((diag, idx) => (
                                    <div key={idx} style={{ background: SURFACE, padding: 16, cursor: "pointer", transition: "background 0.18s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = `color-mix(in srgb, ${PURPLE} 6%, var(--color-surface))`}
                                        onMouseLeave={e => e.currentTarget.style.background = SURFACE}
                                        onClick={() => setExpandedDiagnosis(expandedDiagnosis === idx ? null : idx)}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                                            <span style={{ width: 26, height: 26, background: idx === 0 ? PURPLE : SURFACE2, color: idx === 0 ? "#fff" : MUTED, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, flexShrink: 0, border: idx === 0 ? "none" : `1px solid ${BORDER}` }}>{diag.rank}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.3 }}>{diag.display}</p>
                                                <p style={{ fontSize: 10, color: SUBTLE, margin: "2px 0 0", fontFamily: "monospace" }}>{diag.icd10_code}</p>
                                            </div>
                                            <ChevronDown size={14} color={SUBTLE} style={{ flexShrink: 0, marginTop: 2, transform: expandedDiagnosis === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ flex: 1, height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${diag.confidence * 100}%`, background: idx === 0 ? PURPLE : `${PURPLE}60`, borderRadius: 2, transition: "width 0.6s ease" }} />
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, minWidth: 36, textAlign: "right" }}>{(diag.confidence * 100).toFixed(0)}%</span>
                                        </div>

                                        {expandedDiagnosis === idx && (
                                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.2s ease" }}>
                                                <div>
                                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: SUBTLE, margin: "0 0 5px" }}>Clinical Reasoning</p>
                                                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{diag.clinical_reasoning}</p>
                                                </div>
                                                {diag.supporting_evidence?.length > 0 && (
                                                    <div>
                                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 5px" }}>Supporting Evidence</p>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                            {diag.supporting_evidence.map((ev, i) => (
                                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: TEXT }}>
                                                                    <CheckCircle2 size={12} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {diag.against_evidence?.length > 0 && (
                                                    <div>
                                                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 5px" }}>Against Evidence</p>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                                            {diag.against_evidence.map((ev, i) => (
                                                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: TEXT }}>
                                                                    <X size={12} color={RED} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommended next steps */}
                    {displayResult.recommended_next_steps?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
                                <Zap size={13} color={CYAN} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    Recommended Next Steps ({displayResult.recommended_next_steps.length})
                                </span>
                            </div>
                            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                                {displayResult.recommended_next_steps.map((step, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: BG, borderLeft: `3px solid ${CYAN}`, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                                        <div style={{ width: 32, height: 32, background: `${CYAN}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 8 }}>
                                            {step.category === "MEDICATION" ? <Pill size={14} color={CYAN} /> : step.category === "LABORATORY" ? <Activity size={14} color={CYAN} /> : <Clock size={14} color={CYAN} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", background: `${CYAN}18`, color: CYAN, borderRadius: 4 }}>{step.category}</span>
                                                {step.urgency !== "routine" && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", background: `${RED}18`, color: RED, borderRadius: 4 }}>{step.urgency}</span>}
                                            </div>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{step.description}</p>
                                            {step.drug_name && <p style={{ fontSize: 11, color: MUTED, margin: "3px 0 0" }}>{step.drug_name} {step.drug_dose} {step.drug_route && `(${step.drug_route})`}</p>}
                                            {step.rationale && <p style={{ fontSize: 11, color: SUBTLE, margin: "5px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>{step.rationale}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reasoning summary */}
                    {finalResult && displayResult.reasoning_summary && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <BookOpen size={13} color={CYAN} />
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Reasoning Summary</p>
                            </div>
                            <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.8 }}>{displayResult.reasoning_summary}</p>
                        </div>
                    )}

                    {/* FHIR Conditions */}
                    {finalResult && displayResult.fhir_conditions?.length > 0 && (
                        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, background: `color-mix(in srgb, #8B5CF6 6%, var(--color-surface))` }}>
                                <FileWarning size={13} color={PURPLE} />
                                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: TEXT }}>
                                    FHIR Conditions ({displayResult.fhir_conditions.length})
                                </span>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", background: `${PURPLE}18`, color: PURPLE, border: `1px solid ${PURPLE}30`, borderRadius: 4, marginLeft: "auto" }}>Condition</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: BORDER }}>
                                {displayResult.fhir_conditions.map((cond, idx) => {
                                    const coding = cond.code?.coding?.[0];
                                    const status = cond.verificationStatus?.coding?.[0]?.display || "—";
                                    const statusColor = status === "Differential" ? CYAN : status === "Refuted" ? RED : GREEN;
                                    return (
                                        <div key={idx} style={{ background: SURFACE, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 3px" }}>{coding?.display || "—"}</p>
                                                    <p style={{ fontSize: 10, color: SUBTLE, margin: 0, fontFamily: "monospace" }}>{coding?.code} · {coding?.system?.split("/").pop()}</p>
                                                </div>
                                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40`, flexShrink: 0 }}>{status}</span>
                                            </div>
                                            {cond.note?.[0]?.text && (
                                                <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6, fontStyle: "italic", borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
                                                    {cond.note[0].text}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Metadata footer */}
                    {finalResult && (displayResult.request_id || displayResult.rag_mode !== undefined || displayResult.cache_hit !== undefined) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", flexWrap: "wrap" }}>
                            {displayResult.rag_mode && (
                                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>
                                    <Database size={10} color={SUBTLE} />
                                    mode: <span style={{ color: MUTED }}>{displayResult.rag_mode}</span>
                                </span>
                            )}
                            {displayResult.cache_hit !== undefined && (
                                <span style={{ fontSize: 10, color: SUBTLE, fontFamily: "monospace" }}>
                                    cache: <span style={{ color: displayResult.cache_hit ? "#22C55E" : MUTED }}>{displayResult.cache_hit ? "HIT" : "MISS"}</span>
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