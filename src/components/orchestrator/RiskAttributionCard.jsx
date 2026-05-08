import { TrendingUp, TrendingDown } from "lucide-react";
import { SectionHeader, ConfBar } from "./Shared";
import { BORDER, BG, TEXT, MUTED, GREEN, RED } from "./tokens";

export default function RiskAttributionCard({ finalData }) {
    const ra = finalData?.risk_attribution;
    if (!ra) return null;
    const shap = ra.shap_style_breakdown || [];

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Risk Attribution (SHAP)" count={shap.length} />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {ra.readmission_risk_explanation && (
                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.6, padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        {ra.readmission_risk_explanation}
                    </p>
                )}

                {shap.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {shap.map((item, i) => {
                            const isReduce = item.direction === "reduces_risk";
                            const color    = isReduce ? GREEN : RED;
                            return (
                                <div key={i} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        {isReduce
                                            ? <TrendingDown size={13} color={GREEN} />
                                            : <TrendingUp size={13} color={RED} />}
                                        <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, flex: 1 }}>{item.feature}</p>
                                        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>{item.contribution}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 10, color: MUTED }}>Importance</span>
                                        <ConfBar value={item.importance_score || 0} color={color} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ fontSize: 12, color: MUTED, margin: 0, fontStyle: "italic" }}>No SHAP breakdown available.</p>
                )}

                {ra.model_note && (
                    <p style={{ fontSize: 10, color: MUTED, margin: 0, fontStyle: "italic", padding: "6px 10px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 6 }}>
                        {ra.model_note}
                    </p>
                )}
            </div>
        </div>
    );
}
