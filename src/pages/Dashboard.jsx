import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Network, MessageSquare, Workflow, ChevronRight, Activity, Clock, Cpu } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";

const modes = [
  {
    id: "microservices",
    title: "Microservices",
    subtitle: "Direct Agent API Access",
    icon: Network,
    badge: "Advanced",
    badgeColor: "#6366F1",
    description: "Each AI agent runs as an independent microservice. Direct port-based access (8001–8009) with granular control over every agent.",
    features: ["Direct agent API access", "Independent scaling", "Port-based routing (8001–8009)"],
    stat: { val: "9", label: "Endpoints" },
    accent: "#6366F1",
  },
  {
    id: "chatbot",
    title: "Chatbot",
    subtitle: "Natural Language Interface",
    icon: MessageSquare,
    badge: "Recommended",
    badgeColor: "#6366F1",
    description: "Unified conversational interface that intelligently routes queries to the appropriate specialist agents automatically.",
    features: ["Natural language queries", "Automatic agent routing", "Simplified experience"],
    stat: { val: "8", label: "Agents" },
    accent: "#6366F1",
  },
  {
    id: "orchestrator",
    title: "Orchestrator",
    subtitle: "Full Multi-Agent Coordination",
    icon: Workflow,
    badge: "Powerful",
    badgeColor: "#F59E0B",
    description: "LangGraph-based orchestration triggers all relevant agents, manages inter-agent communication, and delivers comprehensive clinical insights.",
    features: ["Multi-agent coordination", "Parallel execution", "Consensus-driven output"],
    stat: { val: "< 12s", label: "Full Pipeline" },
    accent: "#F59E0B",
  },
];

const recentActivity = [
  { label: "Pipeline run completed", sub: "Patient: example · 8 agents · 8.4s", time: "2m ago", icon: Activity, color: "#6366F1" },
  { label: "Drug Safety check", sub: "Flagged 1 interaction · Severity: moderate", time: "14m ago", icon: Cpu, color: "#F59E0B" },
  { label: "Imaging Triage", sub: "Chest X-ray · Pneumonia: 12% confidence", time: "1h ago", icon: Clock, color: "#6366F1" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [hoveredMode, setHoveredMode] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleModeClick = (modeId) => {
    if (modeId === "microservices") navigate("/dashboard/microservices");
    else if (modeId === "orchestrator") navigate("/dashboard/orchestrator");
    else if (modeId === "chatbot") navigate("/dashboard/chatbot");
  };

  return (
    <AppLayout>
      <div style={{
        padding: "40px 40px 64px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "all 0.55s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", animation: "pulse-dot 2.4s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent)" }}>
              All systems operational
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1.1, marginBottom: 10 }}>
            Choose your mode
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: 460, fontWeight: 400 }}>
            Select how you want to interact with MediTwin's eight specialist agents.
          </p>
        </div>

        {/* Mode Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 40 }}>
          {modes.map((mode, idx) => {
            const Icon = mode.icon;
            const isHovered = hoveredMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode.id)}
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
                style={{
                  textAlign: "left", border: "none", cursor: "pointer", padding: 0,
                  background: "var(--color-surface)",
                  border: `1px solid ${isHovered ? mode.accent + "60" : "var(--color-border)"}`,
                  borderRadius: 14, overflow: "hidden",
                  transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                  transform: isHovered ? "translateY(-5px)" : "translateY(0)",
                  boxShadow: isHovered ? `0 16px 48px ${mode.accent}20` : "var(--shadow-xs)",
                  opacity: visible ? 1 : 0,
                  transitionDelay: `${0.07 + idx * 0.07}s`,
                }}
              >
                {/* Color top bar */}
                <div style={{ height: 3, background: mode.accent, opacity: isHovered ? 1 : 0.4, transition: "opacity 0.22s" }} />

                <div style={{ padding: "24px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: mode.accent + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={20} strokeWidth={1.75} style={{ color: mode.accent }} />
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                      padding: "4px 10px", borderRadius: 20,
                      background: mode.accent + "18", color: mode.accent,
                    }}>
                      {mode.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text)", marginBottom: 4, letterSpacing: "-0.02em" }}>{mode.title}</h3>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: 12 }}>{mode.subtitle}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, fontWeight: 400, marginBottom: 18 }}>{mode.description}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                    {mode.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 5, background: mode.accent + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={mode.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ paddingTop: 16, borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1 }}>{mode.stat.val}</p>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-subtle)", marginTop: 3 }}>{mode.stat.label}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: mode.accent }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Launch</span>
                      <ChevronRight size={14} strokeWidth={2.5} style={{ transform: isHovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.22s" }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom row: activity + notice */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

          {/* Recent activity */}
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "22px 22px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: 16 }}>
              Recent Activity
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} strokeWidth={1.75} style={{ color: item.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3, marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 400 }}>{item.sub}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--color-text-subtle)", fontWeight: 400, whiteSpace: "nowrap" }}>{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical notice */}
          <div style={{
            background: "var(--color-accent-dim)",
            border: "1px solid var(--color-accent)",
            borderRadius: 14, padding: "22px 22px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", marginBottom: 10, letterSpacing: "-0.01em" }}>Clinical Safety Notice</p>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.65, fontWeight: 400 }}>
                All AI-generated clinical outputs require physician review. MediTwin augments — it does not replace — licensed clinical decision-making.
              </p>
            </div>
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--color-accent)" }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                For research and clinical support use only
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}`}</style>
    </AppLayout>
  );
}
