import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Network, MessageSquare, Workflow,
  UserCheck, Brain, FlaskConical, Shield, Eye, GitBranch,
  Activity,
} from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";

const mainNav = [
  { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Microservices", icon: Network, path: "/dashboard/microservices" },
  { label: "Chatbot", icon: MessageSquare, path: "/dashboard/chatbot" },
  { label: "Orchestrator", icon: Workflow, path: "/dashboard/orchestrator" },
];

const agentNav = [
  { label: "Patient Context", icon: UserCheck, path: "/dashboard/microservices/patient-context", port: 8001 },
  { label: "Diagnosis", icon: Brain, path: "/dashboard/microservices/diagnosis-agent", port: 8002 },
  { label: "Lab Analysis", icon: FlaskConical, path: "/dashboard/microservices/lab-analysis", port: 8003 },
  { label: "Drug Safety", icon: Shield, path: "/dashboard/microservices/drug-safety", port: 8004 },
  { label: "Imaging Triage", icon: Eye, path: "/dashboard/microservices/imaging-triage", port: 8005 },
  { label: "Digital Twin", icon: GitBranch, path: "/dashboard/microservices/digital-twin", port: 8006 },
];

function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        border: "none",
        background: isActive ? "var(--color-accent-dim)" : "transparent",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = "var(--color-surface-2)";
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon
        size={15}
        strokeWidth={isActive ? 2.2 : 1.75}
        style={{
          color: isActive ? "var(--color-accent)" : "var(--color-text-subtle)",
          flexShrink: 0,
          transition: "color 0.15s",
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
          transition: "color 0.15s",
          flex: 1,
          textAlign: "left",
        }}
      >
        {item.label}
      </span>
      {item.port && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--color-text-subtle)",
            letterSpacing: "0.04em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          :{item.port}
        </span>
      )}
    </button>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = itemPath => {
    if (itemPath === "/dashboard") return path === "/dashboard";
    return path === itemPath || path.startsWith(itemPath + "/");
  };

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "var(--color-sidebar)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--color-border)",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Activity size={16} strokeWidth={2.2} style={{ color: "#fff" }} />
        </div>
        <div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--color-text)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            MediTwin
          </p>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-accent)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            AI
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            padding: "8px 12px 5px",
          }}
        >
          Main
        </p>
        {mainNav.map(item => (
          <NavItem
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}

        <div
          style={{
            height: 1,
            background: "var(--color-border)",
            margin: "10px 4px",
          }}
        />

        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            padding: "4px 12px 5px",
          }}
        >
          Agents
        </p>
        {agentNav.map(item => (
          <NavItem
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div
        style={{
          padding: "12px 12px 16px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Live status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--color-accent-dim)",
            border: "1px solid rgba(129,140,248,0.3)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--color-accent)",
              flexShrink: 0,
              animation: "pulse-dot 2.4s infinite",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-accent)",
            }}
          >
            7 agents ready
          </span>
        </div>

        <ThemeToggle />
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:.45;transform:scale(.82)}
        }
      `}</style>
    </aside>
  );
}
