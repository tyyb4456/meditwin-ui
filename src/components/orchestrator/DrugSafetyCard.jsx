import { ShieldCheck, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { SectionHeader, Badge } from "./Shared";
import { BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED, CYAN, ORANGE, ACCENT } from "./tokens";

function InteractionDetail({ inter }) {
    return (
        <div style={{ padding: 12, background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 8, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: RED, margin: 0, flex: 1 }}>
                    {inter.drug_a} + {inter.drug_b || inter.drug_pair || ""}
                </p>
                {inter.severity && <Badge label={inter.severity} color={inter.severity === "CRITICAL" ? RED : inter.severity === "MODERATE" ? ORANGE : YELLOW} />}
            </div>
            {inter.description && <p style={{ fontSize: 11, color: MUTED, margin: "0 0 4px", lineHeight: 1.5 }}>{inter.description}</p>}
            {inter.clinical_recommendation && (
                <p style={{ fontSize: 11, color: TEXT, margin: "0 0 4px", fontWeight: 600 }}>{inter.clinical_recommendation}</p>
            )}
            {inter.time_to_onset && <p style={{ fontSize: 10, color: MUTED, margin: 0, fontFamily: "monospace" }}>Onset: {inter.time_to_onset}</p>}
            {inter.monitoring_parameters?.length > 0 && (
                <div style={{ marginTop: 6 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ORANGE, margin: "0 0 4px" }}>Monitor</p>
                    {inter.monitoring_parameters.map((mp, i) => (
                        <p key={i} style={{ fontSize: 11, color: TEXT, margin: "0 0 2px" }}>• {mp}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function DrugSafetyCard({ finalData }) {
    const drug = finalData?.agent_outputs?.drug_safety;
    if (!drug) return null;
    const isSafe = drug.safety_status === "SAFE";
    const riskProfile = drug.patient_risk_profile || {};
    const fdaWarnings = drug.fda_warnings || {};
    const fdaEntries = Object.entries(fdaWarnings);

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Drug Safety" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>

                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: isSafe ? `${GREEN}10` : `${RED}10`, border: `1px solid ${isSafe ? GREEN : RED}40`, borderRadius: 10 }}>
                    <ShieldCheck size={20} color={isSafe ? GREEN : RED} />
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 900, color: isSafe ? GREEN : RED, margin: 0 }}>{drug.safety_status?.replace(/_/g, " ")}</p>
                        <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                            {drug.approved_medications?.length || 0} approved · {drug.critical_interactions?.length || 0} interactions · {drug.contraindications?.length || 0} contraindications
                        </p>
                    </div>
                </div>

                {riskProfile.overall_risk_level && (
                    <div style={{ padding: 12, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: 0 }}>Patient Risk Profile</p>
                            <Badge label={riskProfile.overall_risk_level} color={riskProfile.overall_risk_level === "HIGH" ? RED : riskProfile.overall_risk_level === "MODERATE" ? ORANGE : GREEN} />
                        </div>
                        {riskProfile.recommended_action && (
                            <p style={{ fontSize: 12, fontWeight: 700, color: ORANGE, margin: "0 0 4px" }}>{riskProfile.recommended_action?.replace(/_/g, " ")}</p>
                        )}
                        {riskProfile.clinical_summary && (
                            <p style={{ fontSize: 11, color: TEXT, margin: 0, lineHeight: 1.5 }}>{riskProfile.clinical_summary}</p>
                        )}
                        {riskProfile.primary_risk_factors?.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                {riskProfile.primary_risk_factors.map((f, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                                        <AlertTriangle size={10} color={ORANGE} style={{ flexShrink: 0, marginTop: 2 }} />
                                        <p style={{ fontSize: 11, color: TEXT, margin: 0 }}>{f}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {drug.approved_medications?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 6px" }}>Approved Medications</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {drug.approved_medications.map((med, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: `${GREEN}10`, border: `1px solid ${GREEN}30`, borderRadius: 7 }}>
                                    <CheckCircle2 size={11} color={GREEN} />
                                    <span style={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{med}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {drug.critical_interactions?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 6px" }}>Drug Interactions</p>
                        {drug.critical_interactions.map((inter, i) => <InteractionDetail key={i} inter={inter} />)}
                    </div>
                )}

                {drug.interaction_risk_narrative && (
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ORANGE}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE, margin: "0 0 5px" }}>Interaction Risk Narrative</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{drug.interaction_risk_narrative}</p>
                    </div>
                )}

                {fdaEntries.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: YELLOW, margin: "0 0 6px" }}>FDA Warnings</p>
                        {fdaEntries.map(([drug_name, warnings], i) => (
                            <div key={i} style={{ padding: 10, background: `${YELLOW}08`, border: `1px solid ${YELLOW}30`, borderRadius: 8, marginBottom: 6 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: YELLOW, margin: "0 0 5px" }}>{drug_name}</p>
                                {warnings.map((w, j) => (
                                    <p key={j} style={{ fontSize: 10, color: TEXT, margin: 0, lineHeight: 1.5 }}>{w}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {drug.contraindications?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 6px" }}>Contraindications</p>
                        {drug.contraindications.map((c, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 8, background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 8, marginBottom: 4 }}>
                                <AlertCircle size={12} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 11, color: TEXT, margin: 0 }}>{typeof c === "string" ? c : JSON.stringify(c)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {drug.alternatives && Object.keys(drug.alternatives).length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CYAN, margin: "0 0 6px" }}>Suggested Alternatives</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {Object.entries(drug.alternatives).map(([k, v], i) => (
                                <Badge key={i} label={typeof v === "string" ? v : k} color={CYAN} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
