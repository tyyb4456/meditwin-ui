import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { SectionHeader, Badge } from "./Shared";
import { ACCENT, BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED } from "./tokens";

export default function ClinicalSummaryCard({ finalData }) {
    const agent = finalData?.agent_outputs;
    const dx    = agent?.diagnosis;
    const soap  = finalData?.clinician_output?.soap_note;
    const cons  = finalData?.consensus || finalData?.clinician_output?.confidence_breakdown;
    const flags = finalData?.clinician_output?.risk_flags || [];
    if (!dx && !soap) return null;

    const aggConf    = cons?.aggregate_confidence ?? cons?.overall ?? 0;
    const confColor  = aggConf >= 0.7 ? GREEN : aggConf >= 0.45 ? YELLOW : RED;
    const statusText = cons?.status || cons?.consensus_status || "";

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Clinical Summary" />
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>

                {soap?.clinical_summary_one_liner && (
                    <div style={{ padding: 14, background: BG, borderLeft: `4px solid ${ACCENT}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.6 }}>
                            {soap.clinical_summary_one_liner}
                        </p>
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {dx?.top_diagnosis && (
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Top Diagnosis</p>
                            <p style={{ fontSize: 12, fontWeight: 800, color: TEXT, margin: "0 0 2px" }}>{dx.top_diagnosis}</p>
                            <p style={{ fontSize: 10, color: MUTED, margin: 0, fontFamily: "monospace" }}>{dx.top_icd10_code}</p>
                        </div>
                    )}
                    {aggConf !== undefined && (
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Confidence</p>
                            <p style={{ fontSize: 20, fontWeight: 900, color: confColor, margin: 0, fontFamily: "monospace" }}>
                                {Math.round(aggConf * 100)}%
                            </p>
                        </div>
                    )}
                    {statusText && (
                        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Consensus</p>
                            <p style={{ fontSize: 10, fontWeight: 800, color: statusText === "FULL_CONSENSUS" ? GREEN : YELLOW, margin: 0 }}>
                                {statusText?.replace(/_/g, " ")}
                            </p>
                            {(cons?.conflict_count > 0) && (
                                <p style={{ fontSize: 9, color: RED, margin: "3px 0 0" }}>{cons.conflict_count} conflict{cons.conflict_count !== 1 ? "s" : ""}</p>
                            )}
                        </div>
                    )}
                </div>

                {cons?.summary && (
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 5px" }}>Consensus Summary</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6 }}>{cons.summary}</p>
                    </div>
                )}

                {cons?.human_review_required && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: `${YELLOW}12`, border: `1px solid ${YELLOW}40`, borderRadius: 8 }}>
                        <AlertTriangle size={14} color={YELLOW} />
                        <p style={{ fontSize: 12, color: YELLOW, fontWeight: 700, margin: 0 }}>Human physician review required</p>
                    </div>
                )}

                {flags.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: RED, margin: "0 0 6px" }}>Risk Flags</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {flags.map((f, i) => <Badge key={i} label={typeof f === "string" ? f : f.flag || JSON.stringify(f)} color={RED} />)}
                        </div>
                    </div>
                )}

                {dx?.penicillin_allergy_flagged && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${RED}10`, border: `1px solid ${RED}40`, borderRadius: 8 }}>
                        <AlertTriangle size={13} color={RED} />
                        <p style={{ fontSize: 12, color: RED, fontWeight: 700, margin: 0 }}>Penicillin allergy flagged</p>
                    </div>
                )}

                {dx?.high_suspicion_sepsis && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${RED}10`, border: `1px solid ${RED}40`, borderRadius: 8 }}>
                        <AlertTriangle size={13} color={RED} />
                        <p style={{ fontSize: 12, color: RED, fontWeight: 700, margin: 0 }}>High suspicion of sepsis</p>
                    </div>
                )}
            </div>
        </div>
    );
}
