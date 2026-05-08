import { Badge, ConfBar, SectionHeader } from "./Shared";
import { ACCENT, BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED, CYAN, PINK, ORANGE } from "./tokens";

const riskColor = (r) => r === "HIGH" ? RED : r === "MODERATE" ? YELLOW : GREEN;

function ScenarioItem({ sc, recommended }) {
    const pred = sc.predictions || {};
    const isRec = sc.option_id === recommended;
    const ci = sc.predictions_with_ci || {};

    return (
        <div style={{ padding: 12, background: BG, border: `1px solid ${isRec ? ACCENT : BORDER}`, borderLeft: `4px solid ${isRec ? ACCENT : "var(--color-border)"}`, borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 22, height: 22, background: isRec ? ACCENT : "var(--color-border)", color: isRec ? "#fff" : MUTED, fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5 }}>{sc.option_id}</span>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0, flex: 1 }}>{sc.label}</p>
                {isRec && <Badge label="Recommended" color={ACCENT} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                {pred.recovery_probability_7d != null && (
                    <div style={{ padding: 8, background: "var(--color-surface)", border: `1px solid ${BORDER}`, borderRadius: 6 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 2px" }}>7d Recovery</p>
                        <p style={{ fontSize: 14, fontWeight: 900, color: isRec ? ACCENT : GREEN, margin: 0, fontFamily: "monospace" }}>{(pred.recovery_probability_7d * 100).toFixed(0)}%</p>
                    </div>
                )}
                {pred.mortality_risk_30d != null && (
                    <div style={{ padding: 8, background: "var(--color-surface)", border: `1px solid ${BORDER}`, borderRadius: 6 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 2px" }}>30d Mortality</p>
                        <p style={{ fontSize: 14, fontWeight: 900, color: TEXT, margin: 0, fontFamily: "monospace" }}>{(pred.mortality_risk_30d * 100).toFixed(1)}%</p>
                        {ci.mortality_risk_30d && <p style={{ fontSize: 9, color: MUTED, margin: 0 }}>CI: {(ci.mortality_risk_30d.lower_bound_95ci * 100).toFixed(1)}–{(ci.mortality_risk_30d.upper_bound_95ci * 100).toFixed(1)}%</p>}
                    </div>
                )}
                {pred.readmission_risk_30d != null && (
                    <div style={{ padding: 8, background: "var(--color-surface)", border: `1px solid ${BORDER}`, borderRadius: 6 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 2px" }}>30d Readmit</p>
                        <p style={{ fontSize: 14, fontWeight: 900, color: TEXT, margin: 0, fontFamily: "monospace" }}>{(pred.readmission_risk_30d * 100).toFixed(1)}%</p>
                        {ci.readmission_risk_30d && <p style={{ fontSize: 9, color: MUTED, margin: 0 }}>CI: {(ci.readmission_risk_30d.lower_bound_95ci * 100).toFixed(1)}–{(ci.readmission_risk_30d.upper_bound_95ci * 100).toFixed(1)}%</p>}
                    </div>
                )}
            </div>
            {sc.key_risks?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {sc.key_risks.map((kr, i) => <Badge key={i} label={kr} color={ORANGE} />)}
                </div>
            )}
        </div>
    );
}

function SensitivityRow({ item }) {
    const imp = item.sensitivity_magnitude || 0;
    const color = item.model_sensitivity === "SENSITIVE" ? CYAN : MUTED;
    const impv = item.risk_impact_if_improved_20_percent?.mortality_30d_change;
    return (
        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{item.feature_name}</p>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {impv != null && impv !== 0 && (
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: impv < 0 ? GREEN : RED, fontWeight: 700 }}>
                            {impv < 0 ? "↓" : "↑"}{Math.abs(impv).toFixed(2)}% mort.
                        </span>
                    )}
                    <Badge label={item.model_sensitivity || "?"} color={color} />
                </div>
            </div>
            <ConfBar value={Math.min(imp, 1)} color={color} />
            {item.clinical_intervention && <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0" }}>Intervention: {item.clinical_intervention}</p>}
            {item.insensitive_note && <p style={{ fontSize: 10, color: MUTED, margin: "4px 0 0", fontStyle: "italic" }}>{item.insensitive_note}</p>}
        </div>
    );
}

function CostEffectivenessTable({ ces }) {
    if (!ces?.scenarios?.length) return null;
    return (
        <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>Cost-Effectiveness</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {ces.scenarios.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 20, height: 20, background: c.is_baseline_comparator ? MUTED : ACCENT, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>{c.option_id}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{c.label}</span>
                            {!c.is_baseline_comparator && (
                                <Badge label={c.cost_effective === true ? "Cost-Effective" : "Not cost-effective"} color={c.cost_effective === true ? GREEN : RED} />
                            )}
                            {c.is_baseline_comparator && <Badge label="Baseline" color={MUTED} />}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            {c.estimated_cost_usd != null && <p style={{ fontSize: 13, fontWeight: 900, color: TEXT, margin: 0, fontFamily: "monospace" }}>${c.estimated_cost_usd?.toLocaleString()}</p>}
                            {c.cost_per_qaly != null && !c.is_baseline_comparator && <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>${c.cost_per_qaly?.toFixed(0)}/QALY</p>}
                        </div>
                    </div>
                ))}
            </div>
            {ces.interpretation && (
                <p style={{ fontSize: 10, color: MUTED, margin: "8px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>{ces.interpretation}</p>
            )}
        </div>
    );
}

export default function DigitalTwinCard({ finalData }) {
    const twin = finalData?.agent_outputs?.digital_twin;
    if (!twin) return null;
    const sim = twin.simulation_summary || {};
    const baseline = sim.baseline_risks || {};
    const baseCi = sim.baseline_risks_with_ci || {};
    const sensitivity = twin.sensitivity_analysis || [];

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Digital Twin Simulation" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {[
                        { label: "Risk Profile",    value: sim.patient_risk_profile || "N/A",                                                               color: riskColor(sim.patient_risk_profile) },
                        { label: "30d Mortality",   value: baseline.mortality_30d  != null ? `${(baseline.mortality_30d * 100).toFixed(1)}%`  : "N/A",    color: TEXT },
                        { label: "30d Readmission", value: baseline.readmission_30d != null ? `${(baseline.readmission_30d * 100).toFixed(1)}%` : "N/A",  color: TEXT },
                        { label: "Complication",    value: baseline.complication != null ? `${(baseline.complication * 100).toFixed(1)}%` : "N/A",        color: TEXT },
                        { label: "Rec. Option",     value: sim.recommended_option ? `Option ${sim.recommended_option}` : "N/A",                            color: ACCENT },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, textAlign: "center" }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>{label}</p>
                            <p style={{ fontSize: 14, fontWeight: 900, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
                        </div>
                    ))}
                </div>

                {baseCi.readmission_90d && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                            { label: "90d Readmission", data: baseCi.readmission_90d },
                            { label: "1yr Mortality",   data: baseCi.mortality_1yr },
                        ].filter(x => x.data).map(({ label, data }) => (
                            <div key={label} style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>{label}</p>
                                <p style={{ fontSize: 16, fontWeight: 900, color: TEXT, margin: 0, fontFamily: "monospace" }}>{(data.point_estimate * 100).toFixed(1)}%</p>
                                <p style={{ fontSize: 9, color: MUTED, margin: 0 }}>95% CI: {(data.lower_bound_95ci * 100).toFixed(1)}–{(data.upper_bound_95ci * 100).toFixed(1)}%</p>
                            </div>
                        ))}
                    </div>
                )}

                {twin.scenarios?.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>Treatment Scenarios</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {twin.scenarios.map((sc, i) => (
                                <ScenarioItem key={i} sc={sc} recommended={sim.recommended_option} />
                            ))}
                        </div>
                    </div>
                )}

                <CostEffectivenessTable ces={twin.cost_effectiveness_summary} />

                {twin.what_if_narrative && (
                    <div style={{ padding: 12, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>AI Narrative</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65, whiteSpace: "pre-line" }}>{twin.what_if_narrative}</p>
                    </div>
                )}

                {sensitivity.length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>Sensitivity Analysis</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {sensitivity.map((item, i) => <SensitivityRow key={i} item={item} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
