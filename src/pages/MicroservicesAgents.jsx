import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, ChevronRight, UserCheck, Brain, FlaskConical,
    Shield, Eye, GitBranch, Scale, FileText, Cpu, Zap
} from "lucide-react";
import ThemeToggle from "../components/theme/ThemeToggle";

const agents = [
    {
        id: "patient-context",
        number: "01",
        port: 8001,
        title: "Patient Context Agent",
        type: "A2A",
        typeBadgeColor: "#6366f1",
        role: "System Entry Point",
        description: "Fetches FHIR R4 resources in parallel and normalises them into a unified PatientState that every downstream agent relies on.",
        capabilities: ["Parallel FHIR R4 fetching", "PatientState normalisation", "Redis caching (10 min TTL)"],
        icon: UserCheck,
        accentHue: "258",
    },
    {
        id: "diagnosis",
        number: "02",
        port: 8002,
        title: "Diagnosis Agent",
        type: "A2A",
        typeBadgeColor: "#8b5cf6",
        role: "Differential Diagnosis",
        description: "Runs retrieval-augmented generation over a medical knowledge base to produce a confidence-ranked differential diagnosis list.",
        capabilities: ["RAG over ChromaDB", "LLM reasoning (GPT-4o-mini)", "Confidence-ranked differentials"],
        icon: Brain,
        accentHue: "270",
    },
    {
        id: "lab-analysis",
        number: "03",
        port: 8003,
        title: "Lab Analysis Agent",
        type: "A2A",
        typeBadgeColor: "#06b6d4",
        role: "Abnormality Detection",
        description: "Runs a rules engine over FHIR Observation resources to flag abnormal lab values and produce an annotated clinical lab report.",
        capabilities: ["Rules-based abnormality flags", "LOINC-coded observations", "Annotated lab reports"],
        icon: FlaskConical,
        accentHue: "192",
    },
    {
        id: "drug-safety",
        number: "04",
        port: 8004,
        title: "Drug Safety Agent",
        type: "MCP Server",
        typeBadgeColor: "#f59e0b",
        role: "Drug Interactions",
        description: "Published as a standalone MCP server on the Marketplace. Calls FDA OpenFDA and RxNav APIs to surface unsafe drug combinations.",
        capabilities: ["check_drug_interactions", "get_contraindications", "suggest_alternatives"],
        icon: Shield,
        accentHue: "38",
        isMcp: true,
    },
    {
        id: "imaging-triage",
        number: "05",
        port: 8005,
        title: "Imaging Triage Agent",
        type: "A2A",
        typeBadgeColor: "#10b981",
        role: "X-Ray Analysis",
        description: "Runs a trained TensorFlow/Keras CNN on chest X-rays to produce a triage priority score and a FHIR DiagnosticReport.",
        capabilities: ["Pneumonia CNN (92.3% acc.)", "FHIR DiagnosticReport output", "Conditional execution"],
        icon: Eye,
        accentHue: "158",
    },
    {
        id: "digital-twin",
        number: "06",
        port: 8006,
        title: "Digital Twin Agent",
        type: "A2A",
        typeBadgeColor: "#3b82f6",
        role: "Outcome Simulation",
        description: "Engineers ML features from FHIR data and runs XGBoost risk models to compare treatment scenarios and generate a FHIR CarePlan.",
        capabilities: ["XGBoost risk models", "Treatment scenario comparison", "FHIR CarePlan generation"],
        icon: GitBranch,
        accentHue: "217",
    },
    {
        id: "consensus",
        number: "07",
        port: 8007,
        title: "Consensus + Escalation Agent",
        type: "A2A · LangGraph",
        typeBadgeColor: "#ec4899",
        role: "Conflict Arbitration",
        description: "Reviews all agent outputs for disagreements, runs tiebreaker logic, and escalates to human review when conflicts are unresolvable.",
        capabilities: ["Cross-agent conflict detection", "Tiebreaker resolution", "Human escalation flag"],
        icon: Scale,
        accentHue: "330",
    },
    {
        id: "explanation",
        number: "08",
        port: 8008,
        title: "Explanation Agent",
        type: "A2A",
        typeBadgeColor: "#f97316",
        role: "Final Output",
        description: "Assembles the complete clinical output: SOAP note for clinicians, plain-language summary for patients, and a full FHIR Bundle.",
        capabilities: ["SOAP note generation", "Patient-friendly summary (Grade 6)", "FHIR Bundle assembly"],
        icon: FileText,
        accentHue: "25",
    },
];

// ── Breadcrumb nav ─────────────────────────────────────────────────────────────
function Breadcrumb({ items }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {items.map((item, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {i > 0 && (
                        <ChevronRight size={10} strokeWidth={2.5} style={{ color: "var(--color-text-subtle)", opacity: 0.5 }} />
                    )}
                    {item.onClick ? (
                        <button
                            onClick={item.onClick}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                                textTransform: "uppercase", color: "var(--color-text-subtle)",
                                transition: "color 0.2s", padding: 0,
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--color-text)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-subtle)"}
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: i === items.length - 1 ? "var(--color-text)" : "var(--color-text-subtle)",
                        }}>
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </div>
    );
}

export default function MicroservicesAgents() {
    const navigate = useNavigate();
    const [hoveredAgent, setHoveredAgent] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{ minHeight: "100vh", fontFamily: "inherit", background: "var(--color-bg)", overflowX: "hidden" }}>

            {/* ── NAV ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 28px", height: 56,
                background: "var(--color-bg)",
                borderBottom: "1px solid var(--color-border)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Back button */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            display: "flex", alignItems: "center", gap: 5,
                            color: "var(--color-text-subtle)", background: "none", border: "none",
                            cursor: "pointer", fontSize: 11, fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--color-text)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-subtle)"}
                    >
                        <ArrowLeft size={11} strokeWidth={2.5} /> Back
                    </button>

                    <div style={{ width: 1, height: 14, background: "var(--color-border)" }} />

                    {/* MT logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: 4,
                            background: "var(--color-accent)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ color: "var(--color-bg)", fontSize: 9, fontWeight: 900, letterSpacing: "-0.02em" }}>MT</span>
                        </div>
                    </div>

                    <div style={{ width: 1, height: 14, background: "var(--color-border)" }} />

                    {/* Breadcrumbs */}
                    <Breadcrumb items={[
                        { label: "MediTwin AI", onClick: () => navigate("/") },
                        { label: "Dashboard", onClick: () => navigate("/dashboard") },
                        { label: "Microservices Agents" },
                    ]} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 10px", borderRadius: 2,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                    }}>
                        <Cpu size={10} style={{ color: "var(--color-accent)" }} />
                        <span style={{ color: "var(--color-text-subtle)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            8 Agents
                        </span>
                    </div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── BACKGROUND DECORATIONS ── */}
            <div style={{
                position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                opacity: 0.025,
            }} />
            <div style={{
                position: "fixed", top: "10%", right: 0,
                width: 500, height: 500,
                background: "var(--color-accent)",
                borderRadius: "50%",
                filter: "blur(140px)",
                opacity: 0.03,
                pointerEvents: "none", zIndex: 0,
            }} />

            {/* ── MAIN CONTENT ── */}
            <div style={{
                position: "relative", zIndex: 1,
                paddingTop: 88, paddingBottom: 64,
                paddingLeft: 28, paddingRight: 28,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.55s cubic-bezier(0.22,1,0.36,1)",
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>

                    {/* ── PAGE HEADER ── */}
                    <div style={{ marginBottom: 44 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "4px 12px",
                            border: "1px solid var(--color-border)",
                            background: "color-mix(in srgb, var(--color-accent) 6%, transparent)",
                            marginBottom: 16,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
                            <span style={{ color: "var(--color-text)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                                Microservices-Based Agents
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: "clamp(32px, 6vw, 72px)", fontWeight: 900,
                            lineHeight: 0.92, letterSpacing: "-0.03em",
                            textTransform: "uppercase",
                            color: "var(--color-text)",
                            marginBottom: 16,
                        }}>
                            Eight<br />
                            <span style={{ color: "transparent", WebkitTextStroke: "2px var(--color-text)" }}>Specialists</span>
                        </h1>

                        <p style={{ color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.65, maxWidth: 520 }}>
                            Each agent operates as an independent microservice on its own port (8001–8008).
                            Click any agent card to inspect its API, capabilities, and live status — coming soon.
                        </p>
                    </div>

                    {/* ── AGENT GRID ── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: 12,
                        marginBottom: 32,
                    }}>
                        {agents.map((agent, idx) => {
                            const IconComponent = agent.icon;
                            const isHovered = hoveredAgent === agent.id;

                            return (
                                <button
                                    key={agent.id}
                                    onMouseEnter={() => setHoveredAgent(agent.id)}
                                    onMouseLeave={() => setHoveredAgent(null)}
                                    onClick={() => {
                                        if (agent.id === "patient-context") {
                                            navigate("/dashboard/microservices/patient-context");
                                        } else if (agent.id === "diagnosis") {
                                            navigate("/dashboard/microservices/diagnosis-agent");
                                        } else if (agent.id === "lab-analysis") {
                                            navigate("/dashboard/microservices/lab-analysis");
                                        } else if (agent.id === "drug-safety") {
                                            navigate("/dashboard/microservices/drug-safety");
                                        } else if (agent.id === "imaging-triage") {
                                            navigate("/dashboard/microservices/imaging-triage");
                                        } else if (agent.id === "digital-twin") {
                                            navigate("/dashboard/microservices/digital-twin");
                                        }
                                    }}
                                    style={{
                                        position: "relative", textAlign: "left",
                                        background: "var(--color-surface)",
                                        border: `1px solid ${isHovered ? "var(--color-text-subtle)" : "var(--color-border)"}`,
                                        borderRadius: 0,
                                        cursor: "pointer", padding: 0,
                                        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                                        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                                        boxShadow: isHovered ? "0 12px 40px rgba(0,0,0,0.14)" : "none",
                                        overflow: "hidden",
                                        opacity: visible ? 1 : 0,
                                        transitionDelay: `${0.05 + idx * 0.05}s`,
                                    }}
                                >
                                    {/* Top accent line */}
                                    <div style={{
                                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                        background: `hsl(${agent.accentHue}, 38%, 50%)`,
                                        transformOrigin: "left",
                                        transform: isHovered ? "scaleX(1)" : "scaleX(0)",
                                        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                                    }} />

                                    <div style={{ padding: 22 }}>

                                        {/* ── Card Header ── */}
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                {/* Number */}
                                                <span style={{
                                                    fontSize: 10, fontWeight: 900, letterSpacing: "0.14em",
                                                    color: "var(--color-text-subtle)", fontVariantNumeric: "tabular-nums",
                                                }}>
                                                    {agent.number}
                                                </span>
                                                {/* Icon box */}
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 4, flexShrink: 0,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    transition: "background 0.25s",
                                                    background: isHovered
                                                        ? `hsl(${agent.accentHue} 35% 50% / 0.16)`
                                                        : `hsl(${agent.accentHue} 35% 50% / 0.08)`,
                                                }}>
                                                    <IconComponent size={17} strokeWidth={1.8} style={{ color: `hsl(${agent.accentHue}, 35%, 55%)` }} />
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                                {/* Type badge */}
                                                <span style={{
                                                    fontSize: 8, fontWeight: 900, letterSpacing: "0.14em",
                                                    textTransform: "uppercase", padding: "3px 7px",
                                                    background: "transparent",
                                                    color: "var(--color-text-subtle)",
                                                    border: "1px solid var(--color-border)",
                                                }}>
                                                    {agent.type}
                                                </span>
                                                {/* Port badge */}
                                                <span style={{
                                                    fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
                                                    color: "var(--color-text-subtle)",
                                                }}>
                                                    :{agent.port}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Title + Role ── */}
                                        <div style={{ marginBottom: 10 }}>
                                            <h3 style={{
                                                fontSize: 14, fontWeight: 800, lineHeight: 1.3, marginBottom: 3,
                                                color: "var(--color-text)",
                                            }}>
                                                {agent.title}
                                            </h3>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                color: "var(--color-text-subtle)",
                                            }}>
                                                {agent.role}
                                            </span>
                                        </div>

                                        {/* ── Description ── */}
                                        <p style={{
                                            fontSize: 12, lineHeight: 1.65,
                                            color: "var(--color-text-muted)",
                                            marginBottom: 16,
                                        }}>
                                            {agent.description}
                                        </p>

                                        {/* ── Capabilities ── */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
                                            {agent.capabilities.map(cap => (
                                                <div key={cap} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{
                                                        width: 4, height: 4, borderRadius: "50%", flexShrink: 0,
                                                        background: "var(--color-text-subtle)",
                                                    }} />
                                                    <span style={{ fontSize: 11, color: "var(--color-text-subtle)" }}>
                                                        {cap}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Footer ── */}
                                        <div style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            paddingTop: 12,
                                            borderTop: "1px solid var(--color-border)",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                <div style={{
                                                    width: 6, height: 6, borderRadius: "50%",
                                                    background: "#10b981",
                                                    boxShadow: "0 0 6px rgba(16,185,129,0.6)",
                                                    animation: "pulse 2s infinite",
                                                }} />
                                                <span style={{ fontSize: 10, color: "var(--color-text-subtle)", fontWeight: 600, letterSpacing: "0.08em" }}>
                                                    ready
                                                </span>
                                            </div>
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                opacity: isHovered ? 1 : 0.4,
                                                transition: "opacity 0.25s",
                                            }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.08em" }}>
                                                    {(agent.id === "patient-context" || agent.id === "diagnosis" || agent.id === "lab-analysis" || agent.id === "drug-safety" || agent.id === "imaging-triage" || agent.id === "digital-twin") ? "Explore" : "Coming soon"}
                                                </span>
                                                <ChevronRight size={10} strokeWidth={2.5} style={{
                                                    color: "var(--color-text-subtle)",
                                                    transform: isHovered ? "translateX(3px)" : "translateX(0)",
                                                    transition: "transform 0.25s",
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── BOTTOM INFO STRIP ── */}
                    <div style={{
                        padding: "16px 24px",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderLeft: "3px solid var(--color-accent)",
                        display: "flex", alignItems: "center", gap: 14,
                    }}>
                        <Zap size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.65 }}>
                            All agents run independently via <strong style={{ color: "var(--color-text)" }}>Docker Compose</strong> on ports 8001–8008.
                            The <strong style={{ color: "var(--color-text)" }}>Drug Safety Agent (port 8004)</strong> is also published as a standalone{" "}
                            <strong style={{ color: "var(--color-text)" }}>MCP server</strong> on the Prompt Opinion Marketplace.
                            Individual agent pages with live API access will be available in a future release.
                        </p>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
