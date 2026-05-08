import { CheckCircle2, Loader2 } from "lucide-react";
import {
    HeartPulse, BrainCircuit, FlaskConical, Pill,
    Image as ImageIcon, GitBranch, GitMerge, Workflow
} from "lucide-react";
import {
    ACCENT, BORDER, BG, TEXT, MUTED, DIM,
    CYAN, PURPLE, GREEN, ORANGE, TEAL, PINK, INDIGO
} from "./tokens";

function AgentCell({ title, icon: Icon, color, data, isLoading, children }) {
    const done = !!data;
    return (
        <div style={{
            background: BG, border: `1px solid ${done ? color : BORDER}`,
            borderLeft: `4px solid ${done ? color : DIM}`,
            borderRadius: 10, padding: 14,
            opacity: isLoading || done ? 1 : 0.4,
            transition: "all 0.3s ease",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, background: `${color}18`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={13} color={color} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT }}>{title}</span>
                </div>
                {isLoading && !done && <Loader2 size={12} color={color} style={{ animation: "spin 1s linear infinite" }} />}
                {done && <CheckCircle2 size={12} color={color} />}
            </div>
            <div style={{ minHeight: 36 }}>
                {done ? children : isLoading ? (
                    <div style={{ height: 4, background: DIM, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: "60%", height: "100%", background: color, animation: "pulse 1.5s infinite" }} />
                    </div>
                ) : (
                    <p style={{ fontSize: 11, color: MUTED, margin: 0, fontStyle: "italic" }}>Waiting…</p>
                )}
            </div>
        </div>
    );
}

export function IdlePlaceholder() {
    const agents = [
        { label: "Patient Context", color: CYAN   },
        { label: "Diagnosis",       color: PURPLE },
        { label: "Lab Analysis",    color: GREEN  },
        { label: "Drug Safety",     color: ORANGE },
        { label: "Digital Twin",    color: PINK   },
        { label: "Consensus",       color: INDIGO },
    ];
    return (
        <div style={{ border: `1px solid ${BORDER}`, padding: "64px 32px", textAlign: "center", background: "var(--color-surface)", borderRadius: 12 }}>
            <div style={{
                width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px",
                background: `linear-gradient(135deg, ${ACCENT}18, ${PURPLE}18)`,
                border: `1px solid ${ACCENT}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Workflow size={26} color={ACCENT} strokeWidth={1.5} style={{ opacity: 0.7 }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: MUTED, margin: "0 0 8px" }}>Orchestrator Ready</p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0, maxWidth: 360, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                Fill in the patient payload and press Run Orchestrator to launch all 8 agents in sequence.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
                {agents.map(({ label, color }) => (
                    <span key={label} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 5, color, background: `${color}12`, border: `1px solid ${color}25` }}>{label}</span>
                ))}
            </div>
        </div>
    );
}

export default function AgentStatusGrid({ results, isStreaming, isWorking }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <AgentCell title="Patient Context" icon={HeartPulse} color={CYAN}   isLoading={isWorking(["patient_context"])} data={results.patient_context}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.patient_context?.patient_state?.demographics?.name || "Data Fetched"}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.patient_context?.patient_state?.active_conditions?.length || 0} conditions · {results.patient_context?.patient_state?.lab_results?.length || 0} labs</p>
            </AgentCell>
            <AgentCell title="Diagnosis" icon={BrainCircuit} color={PURPLE} isLoading={isWorking(["diagnosis"])} data={results.diagnosis}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.diagnosis?.top_diagnosis || "N/A"}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.diagnosis?.top_icd10_code} · <span style={{ color: results.diagnosis?.confidence_level === "HIGH" ? GREEN : "#EAB308" }}>{results.diagnosis?.confidence_level}</span></p>
            </AgentCell>
            <AgentCell title="Imaging Triage" icon={ImageIcon} color={TEAL} isLoading={isWorking(["imaging_triage"])} data={results.imaging_triage}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.imaging_triage?.triage_label || results.imaging_triage?.prediction || "Analysed"}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.imaging_triage?.grade || ""}</p>
            </AgentCell>
            <AgentCell title="Lab Analysis" icon={FlaskConical} color={GREEN} isLoading={isWorking(["lab_analysis"])} data={results.lab_analysis}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.lab_analysis?.lab_summary?.overall_severity || "Complete"}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.lab_analysis?.lab_summary?.abnormal_count || 0} abnormal · {results.lab_analysis?.lab_summary?.critical_count || 0} critical</p>
            </AgentCell>
            <AgentCell title="Drug Safety" icon={Pill} color={ORANGE} isLoading={isWorking(["drug_safety"])} data={results.drug_safety}>
                <p style={{ fontSize: 12, fontWeight: 700, color: results.drug_safety?.safety_status === "SAFE" ? GREEN : "#EF4444", margin: 0 }}>{results.drug_safety?.safety_status?.replace(/_/g, " ") || "Checked"}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.drug_safety?.approved_medications?.length || 0} approved · {results.drug_safety?.critical_interactions?.length || 0} interactions</p>
            </AgentCell>
            <AgentCell title="Digital Twin" icon={GitBranch} color={PINK} isLoading={isWorking(["digital_twin"])} data={results.digital_twin}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>Option {results.digital_twin?.simulation_summary?.recommended_option || "?"} Recommended</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{results.digital_twin?.simulation_summary?.patient_risk_profile || "?"} risk profile</p>
            </AgentCell>
            <AgentCell title="Consensus" icon={GitMerge} color={INDIGO} isLoading={isWorking(["consensus"])} data={results.consensus}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, margin: 0 }}>{results.consensus?.consensus_status?.replace(/_/g, " ") || "Resolved"}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{Math.round((results.consensus?.aggregate_confidence || 0) * 100)}% confidence · {results.consensus?.conflict_count || 0} conflicts</p>
            </AgentCell>
        </div>
    );
}
