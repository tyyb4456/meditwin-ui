import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, UserCheck, Brain, FlaskConical,
  Shield, Eye, GitBranch, FileText, Cpu, ArrowRight
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import ExplanationHistory from "../components/history/ExplanationHistory";

const agents = [
  { id: "patient-context", number: "01",  title: "Patient Context Agent", type: "A2A", role: "System Entry Point", description: "Fetches FHIR R4 resources in parallel and normalises them into a unified PatientState that every downstream agent relies on.", capabilities: ["Parallel FHIR R4 fetching", "PatientState normalisation", "Redis caching (10 min TTL)"], icon: UserCheck, color: "#6366F1" },
  { id: "diagnosis", number: "02", title: "Diagnosis Agent", type: "A2A", role: "Differential Diagnosis", description: "Runs retrieval-augmented generation over a medical knowledge base to produce a confidence-ranked differential diagnosis list.", capabilities: ["RAG over ChromaDB", "LLM reasoning (Gemini Flash 2.5)", "Confidence-ranked differentials"], icon: Brain, color: "#8B5CF6" },
  { id: "lab-analysis", number: "03", title: "Lab Analysis Agent", type: "A2A", role: "Abnormality Detection", description: "Runs a rules engine over FHIR Observation resources to flag abnormal lab values and produce an annotated clinical lab report.", capabilities: ["Rules-based abnormality flags", "LOINC-coded observations", "Annotated lab reports"], icon: FlaskConical, color: "#06B6D4" },
  { id: "drug-safety", number: "04", title: "Drug Safety Agent", type: "MCP Server", role: "Drug Interactions", description: "Published as a standalone MCP server. Calls FDA OpenFDA and RxNav APIs to surface unsafe drug combinations.", capabilities: ["check_drug_interactions", "get_contraindications", "suggest_alternatives"], icon: Shield, color: "#F59E0B", isMcp: true },
  { id: "imaging-triage", number: "05", title: "Imaging Triage Agent", type: "A2A", role: "X-Ray Analysis", description: "Runs a trained TensorFlow/Keras CNN on chest X-rays to produce a triage priority score and a FHIR DiagnosticReport.", capabilities: ["Pneumonia CNN (95.5% acc.)", "FHIR DiagnosticReport output", "Conditional execution"], icon: Eye, color: "#A78BFA" },
  { id: "digital-twin", number: "06", title: "Digital Twin Agent", type: "A2A", role: "Outcome Simulation", description: "Engineers ML features from FHIR data and runs XGBoost risk models to compare treatment scenarios and generate a FHIR CarePlan.", capabilities: ["XGBoost risk models", "Treatment scenario comparison", "FHIR CarePlan generation"], icon: GitBranch, color: "#3B82F6" },
];

const explanationAgent = { id: "explanation", number: "07", port: 8008, title: "Explanation Agent", type: "A2A", role: "Final Output", description: "Assembles the complete clinical output: SOAP note for clinicians, plain-language summary for patients, and a full FHIR Bundle.", capabilities: ["SOAP note generation", "Patient-friendly summary (Grade 6)", "FHIR Bundle assembly"], icon: FileText, color: "#F97316" };

const routeMap = {
  "patient-context": "/dashboard/microservices/patient-context",
  "diagnosis": "/dashboard/microservices/diagnosis-agent",
  "lab-analysis": "/dashboard/microservices/lab-analysis",
  "drug-safety": "/dashboard/microservices/drug-safety",
  "imaging-triage": "/dashboard/microservices/imaging-triage",
  "digital-twin": "/dashboard/microservices/digital-twin",
};

function AgentCard({ agent, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = agent.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: "left", border: "none", cursor: "pointer",
        background: "var(--color-surface)",
        border: `1px solid ${hovered ? agent.color + "50" : "var(--color-border)"}`,
        borderRadius: 14, overflow: "hidden", padding: 0,
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 40px ${agent.color}18` : "var(--shadow-xs)",
        display: "block", width: "100%",
      }}
    >
      {/* Color bar */}
      <div style={{ height: 3, background: agent.color, opacity: hovered ? 1 : 0.35, transition: "opacity 0.22s" }} />

      <div style={{ padding: "20px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", fontVariantNumeric: "tabular-nums" }}>
              {agent.number}
            </span>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: agent.color + "18",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={16} strokeWidth={1.75} style={{ color: agent.color }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "3px 8px", borderRadius: 20,
              background: agent.isMcp ? "transparent" : agent.color + "18",
              border: agent.isMcp ? `1px solid ${agent.color}50` : "none",
              color: agent.color,
            }}>
              {agent.type}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-subtle)", fontVariantNumeric: "tabular-nums" }}>
              :{agent.port}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em", marginBottom: 3 }}>
          {agent.title}
        </h3>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: 12 }}>
          {agent.role}
        </p>

        {/* Description */}
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--color-text-muted)", marginBottom: 16, fontWeight: 400 }}>
          {agent.description}
        </p>

        {/* Capabilities */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 18 }}>
          {agent.capabilities.map(cap => (
            <div key={cap} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: agent.color, opacity: 0.7, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 500 }}>{cap}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 14, borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.6)", animation: "pulse-dot 2.5s infinite" }} />
            <span style={{ fontSize: 10, color: "var(--color-text-subtle)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ready</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: agent.color }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Open</span>
            <ArrowRight size={13} style={{ transform: hovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.22s" }} />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function MicroservicesAgents() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppLayout>
      <div style={{
        padding: "40px 40px 64px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "all 0.55s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* Page Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "var(--color-accent-dim)", border: "1px solid var(--color-accent)" }}>
              <Cpu size={11} style={{ color: "var(--color-accent)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                7 Agents
              </span>
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1.1, marginBottom: 10 }}>
            Microservices Agents
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: 520, fontWeight: 400 }}>
            Each agent runs as an independent microservice on its own port (8001–8006). Click any card to open its interface.
          </p>
        </div>

        {/* Agent Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginBottom: 32 }}>
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => routeMap[agent.id] && navigate(routeMap[agent.id])}
            />
          ))}
        </div>

        {/* Explanation Agent — full-width */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-text-subtle)" }}>
              Output Layer
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          </div>

          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 14, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 20,
              transition: "all 0.22s ease", cursor: "default",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = explanationAgent.color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${explanationAgent.color}12`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", fontVariantNumeric: "tabular-nums" }}>
                {explanationAgent.number}
              </span>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: explanationAgent.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={16} strokeWidth={1.75} style={{ color: explanationAgent.color }} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>{explanationAgent.title}</h3>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: explanationAgent.color + "18", color: explanationAgent.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {explanationAgent.type}
                </span>
                <span style={{ fontSize: 10, color: "var(--color-text-subtle)", fontWeight: 600 }}>:{explanationAgent.port}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55, fontWeight: 400 }}>{explanationAgent.description}</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
              {explanationAgent.capabilities.map(cap => (
                <span key={cap} style={{
                  fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                  background: explanationAgent.color + "15", color: explanationAgent.color,
                }}>{cap}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Explanation History */}
        <ExplanationHistory />
      </div>

      <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}`}</style>
    </AppLayout>
  );
}
