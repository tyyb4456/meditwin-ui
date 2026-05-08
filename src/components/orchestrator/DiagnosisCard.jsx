import { useState } from "react";
import { ChevronDown, CheckCircle2, X, Pill, FlaskConical, Clock } from "lucide-react";
import { SectionHeader, Badge, ConfBar } from "./Shared";
import { ACCENT, BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED, CYAN } from "./tokens";

const confColor = (c) => c >= 0.7 ? GREEN : c >= 0.45 ? YELLOW : RED;

function DiagnosisItem({ diag, expanded, onToggle }) {
    return (
        <div style={{ border: `1px solid ${BORDER}`, background: BG, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onToggle}>
                <span style={{ width: 22, height: 22, background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 5 }}>{diag.rank}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, margin: 0 }}>{diag.display}</p>
                        <span style={{ fontSize: 9, color: MUTED, fontFamily: "monospace", background: "var(--color-surface)", padding: "1px 5px", border: `1px solid ${BORDER}`, borderRadius: 4 }}>{diag.icd10_code}</span>
                    </div>
                    <ConfBar value={diag.confidence} color={confColor(diag.confidence)} />
                </div>
                <ChevronDown size={14} color={MUTED} style={{ flexShrink: 0, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </div>
            {expanded && (
                <div style={{ padding: "12px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{diag.clinical_reasoning}</p>
                    {diag.supporting_evidence?.length > 0 && (
                        <div>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 5px" }}>Supporting</p>
                            {diag.supporting_evidence.map((ev, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: TEXT, marginBottom: 3 }}>
                                    <CheckCircle2 size={11} color={GREEN} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                </div>
                            ))}
                        </div>
                    )}
                    {diag.against_evidence?.length > 0 && (
                        <div>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 5px" }}>Against</p>
                            {diag.against_evidence.map((ev, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: TEXT, marginBottom: 3 }}>
                                    <X size={11} color={RED} style={{ flexShrink: 0, marginTop: 1 }} /> {ev}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NextStepItem({ step }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 10, background: BG, borderLeft: `3px solid ${CYAN}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <div style={{ width: 26, height: 26, background: `${CYAN}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 6 }}>
                {step.category === "MEDICATION" || step.category === "THERAPEUTIC"
                    ? <Pill size={12} color={CYAN} />
                    : step.category === "INVESTIGATION" || step.category === "DIAGNOSTIC"
                        ? <FlaskConical size={12} color={CYAN} />
                        : <Clock size={12} color={CYAN} />}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                    <Badge label={step.category} color={CYAN} />
                    {step.urgency && step.urgency !== "routine" && step.urgency !== "ROUTINE" && <Badge label={step.urgency} color={RED} />}
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{step.description}</p>
                {step.drug_name && <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0" }}>{step.drug_name} {step.drug_dose} {step.drug_route ? `(${step.drug_route})` : ""}</p>}
                {step.rationale && <p style={{ fontSize: 11, color: MUTED, margin: "2px 0 0", fontStyle: "italic" }}>{step.rationale}</p>}
            </div>
        </div>
    );
}

export default function DiagnosisCard({ finalData }) {
    const dx = finalData?.agent_outputs?.diagnosis;
    const [expanded, setExpanded] = useState(null);
    if (!dx) return null;

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Differential Diagnosis" count={dx.differential_diagnosis?.length} />
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>

                {dx.differential_diagnosis?.map((diag, idx) => (
                    <DiagnosisItem
                        key={idx}
                        diag={diag}
                        expanded={expanded === idx}
                        onToggle={() => setExpanded(expanded === idx ? null : idx)}
                    />
                ))}

                {dx.recommended_next_steps?.length > 0 && (
                    <div style={{ marginTop: 4, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                        <SectionHeader title="Recommended Next Steps" count={dx.recommended_next_steps.length} />
                        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                            {dx.recommended_next_steps.map((step, i) => <NextStepItem key={i} step={step} />)}
                        </div>
                    </div>
                )}

                {dx.reasoning_summary && (
                    <div style={{ padding: 12, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>AI Reasoning</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65 }}>{dx.reasoning_summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
