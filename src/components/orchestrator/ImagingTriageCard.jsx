import { ScanLine, CheckCircle2, AlertCircle, Brain, Layers } from "lucide-react";
import { SectionHeader, Badge, ConfBar, StatBox, MiniLabel } from "./Shared";
import { BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED, CYAN, ORANGE, PURPLE, ACCENT } from "./tokens";

function severityColor(grade) {
    if (!grade) return MUTED;
    const g = String(grade).toUpperCase();
    if (g === "CRITICAL" || g === "4") return RED;
    if (g === "HIGH"     || g === "3") return ORANGE;
    if (g === "MODERATE" || g === "2") return YELLOW;
    return GREEN;
}

function priorityColor(priority) {
    if (!priority) return MUTED;
    const p = String(priority).toUpperCase();
    if (p === "CRITICAL" || p === "P1" || p === "1") return RED;
    if (p === "HIGH"     || p === "P2" || p === "2") return ORANGE;
    if (p === "MODERATE" || p === "P3" || p === "3") return YELLOW;
    return GREEN;
}

export default function ImagingTriageCard({ finalData }) {
    const imaging = finalData?.agent_outputs?.imaging;
    if (!imaging) return null;

    const model      = imaging.model_output      || {};
    const severity   = imaging.severity_assessment || {};
    const findings   = imaging.imaging_findings   || {};
    const llm        = imaging.llm_interpretation || null;
    const actions    = imaging.recommended_actions || [];

    const prediction   = model.predicted_class || model.prediction || "N/A";
    const pneumProb    = model.pneumonia_prob ?? model.pneumonia_probability ?? null;
    const normalProb   = model.normal_prob    ?? model.normal_probability    ?? null;
    const confidence   = model.confidence ?? null;

    const sevGrade     = severity.grade || severity.severity_grade || "";
    const triageLabel  = severity.triage_label || "";
    const triagePri    = severity.triage_priority;
    const urgency      = severity.clinical_urgency || "";

    const pattern      = findings.pattern || "";
    const affectedArea = findings.affected_area || "";
    const bilateral    = findings.bilateral;
    const findingConf  = findings.confidence_in_findings || "";

    const sevCol = severityColor(sevGrade);
    const priCol = priorityColor(triageLabel || String(triagePri));

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Imaging Triage · CNN Chest X-Ray Analysis" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>

                {/* ── Hero banner: prediction + severity ── */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 12, padding: 14,
                    background: `${sevCol}12`, border: `1px solid ${sevCol}40`, borderRadius: 10,
                }}>
                    <ScanLine size={22} color={sevCol} />
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <p style={{ fontSize: 15, fontWeight: 900, color: sevCol, margin: 0, textTransform: "uppercase" }}>
                                {prediction}
                            </p>
                            {triageLabel && <Badge label={triageLabel} color={priCol} />}
                            {sevGrade     && <Badge label={`Grade ${sevGrade}`} color={sevCol} />}
                            {imaging.analysis_mode && (
                                <Badge label={imaging.analysis_mode.toUpperCase()} color={CYAN} />
                            )}
                            {imaging.mock && <Badge label="MOCK" color={MUTED} />}
                        </div>
                        <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                            {urgency || "Clinical urgency not specified"}
                            {imaging.diagnosis_code ? ` · ${imaging.diagnosis_code}` : ""}
                            {imaging.confirms_diagnosis != null
                                ? ` · ${imaging.confirms_diagnosis ? "Confirms working diagnosis" : "Does not confirm working diagnosis"}`
                                : ""}
                        </p>
                    </div>
                    {imaging.confirms_diagnosis != null && (
                        <div style={{ flexShrink: 0 }}>
                            {imaging.confirms_diagnosis
                                ? <CheckCircle2 size={20} color={GREEN} />
                                : <AlertCircle  size={20} color={ORANGE} />}
                        </div>
                    )}
                </div>

                {/* ── CNN probabilities ── */}
                {(pneumProb !== null || normalProb !== null) && (
                    <div>
                        <MiniLabel>CNN Model Probabilities</MiniLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                            {pneumProb !== null && (
                                <StatBox label="Pneumonia" value={`${Math.round(pneumProb * 100)}%`} color={pneumProb > 0.5 ? RED : MUTED} mono />
                            )}
                            {normalProb !== null && (
                                <StatBox label="Normal" value={`${Math.round(normalProb * 100)}%`} color={normalProb > 0.5 ? GREEN : MUTED} mono />
                            )}
                        </div>
                        {confidence !== null && (
                            <div>
                                <p style={{ fontSize: 10, color: MUTED, margin: "0 0 4px" }}>Model confidence</p>
                                <ConfBar value={confidence} color={confidence > 0.8 ? GREEN : confidence > 0.6 ? YELLOW : ORANGE} />
                            </div>
                        )}
                    </div>
                )}

                {/* ── Imaging findings ── */}
                {(pattern || affectedArea || findingConf) && (
                    <div style={{ padding: 12, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <Layers size={13} color={CYAN} />
                            <MiniLabel color={CYAN}>Imaging Findings</MiniLabel>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {pattern      && <div style={{ padding: 8, background: "var(--color-surface)", border: `1px solid ${BORDER}`, borderRadius: 7 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 3px" }}>Pattern</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{pattern}</p>
                            </div>}
                            {affectedArea && <div style={{ padding: 8, background: "var(--color-surface)", border: `1px solid ${BORDER}`, borderRadius: 7 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 3px" }}>Affected Area</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{affectedArea}</p>
                            </div>}
                            {bilateral != null && <div style={{ padding: 8, background: "var(--color-surface)", border: `1px solid ${BORDER}`, borderRadius: 7 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 3px" }}>Bilateral</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: bilateral ? ORANGE : GREEN, margin: 0 }}>{bilateral ? "Yes" : "No"}</p>
                            </div>}
                            {findingConf  && <div style={{ padding: 8, background: "var(--color-surface)", border: `1px solid ${BORDER}`, borderRadius: 7 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 3px" }}>Finding Confidence</p>
                                <Badge label={findingConf} color={findingConf === "HIGH" ? GREEN : findingConf === "MODERATE" ? YELLOW : ORANGE} />
                            </div>}
                        </div>
                    </div>
                )}

                {/* ── Clinical interpretation ── */}
                {imaging.clinical_interpretation && (
                    <div style={{ padding: 12, background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${CYAN}`, borderRadius: 8 }}>
                        <MiniLabel color={CYAN}>Clinical Interpretation</MiniLabel>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65 }}>
                            {imaging.clinical_interpretation}
                        </p>
                    </div>
                )}

                {/* ── LLM interpretation ── */}
                {llm && (
                    <div style={{ padding: 12, background: `${PURPLE}08`, border: `1px solid ${PURPLE}30`, borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <Brain size={13} color={PURPLE} />
                            <MiniLabel color={PURPLE}>Radiologist AI Opinion</MiniLabel>
                        </div>

                        {llm.key_concern && (
                            <div style={{ padding: 8, background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 7, marginBottom: 8 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 3px" }}>Key Concern</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{llm.key_concern}</p>
                            </div>
                        )}

                        {llm.clinical_opinion && (
                            <p style={{ fontSize: 12, color: TEXT, margin: "0 0 10px", lineHeight: 1.65 }}>{llm.clinical_opinion}</p>
                        )}

                        {llm.differential?.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: PURPLE, margin: "0 0 5px" }}>Differentials</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                    {llm.differential.map((d, i) => <Badge key={i} label={d} color={PURPLE} />)}
                                </div>
                            </div>
                        )}

                        {llm.confidence_statement && (
                            <p style={{ fontSize: 10, color: MUTED, margin: "0 0 8px", fontStyle: "italic" }}>{llm.confidence_statement}</p>
                        )}

                        {llm.safety_net && (
                            <div style={{ padding: 8, background: `${YELLOW}08`, border: `1px solid ${YELLOW}30`, borderRadius: 7 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: YELLOW, margin: "0 0 3px" }}>Safety Net</p>
                                <p style={{ fontSize: 11, color: TEXT, margin: 0 }}>{llm.safety_net}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Recommended actions ── */}
                {actions.length > 0 && (
                    <div>
                        <MiniLabel color={ORANGE}>Recommended Actions</MiniLabel>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {actions.map((a, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "flex-start", gap: 8,
                                    padding: "7px 10px",
                                    background: i === 0 ? `${ORANGE}10` : BG,
                                    border: `1px solid ${i === 0 ? ORANGE : BORDER}40`,
                                    borderRadius: 7,
                                }}>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: i === 0 ? ORANGE : MUTED, flexShrink: 0, minWidth: 16 }}>
                                        {i + 1}.
                                    </span>
                                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.5 }}>{a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
