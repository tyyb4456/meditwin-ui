import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Network, MessageSquare, Workflow, ArrowLeft, ChevronRight } from "lucide-react";

// ── Breadcrumb nav helper ──────────────────────────────────────────────────────
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
import ThemeToggle from "../theme/ThemeToggle";

const modes = [
    {
        id: "microservices",
        title: "Microservices-Based Agents",
        subtitle: "Direct API Access",
        icon: Network,
        badge: "Advanced",
        description: "Modular architecture where each AI agent operates as an independent microservice with granular control.",
        details: "Direct access to individual agents running on ports 8001–8009. Each agent functions autonomously with its own API endpoints, allowing granular control and custom workflows.",
        features: ["Direct agent API access", "Independent scaling", "Port-based routing (8001–8009)"],
        stat: { val: "9", label: "Endpoints" },
    },
    {
        id: "chatbot",
        title: "Conversational Chatbot",
        subtitle: "Natural Language",
        icon: MessageSquare,
        badge: "Recommended",
        description: "Unified conversational interface with intelligent routing to the appropriate specialists.",
        details: "Agents-as-tools approach where the system intelligently routes queries to the appropriate specialists, delivering a seamless chat experience.",
        features: ["Natural language queries", "Automatic agent routing", "Simplified user experience"],
        stat: { val: "8", label: "Agents" },
    },
    {
        id: "orchestrator",
        title: "Orchestrator Mode",
        subtitle: "Multi-Agent",
        icon: Workflow,
        badge: "Powerful",
        description: "High-level LangGraph orchestration coordinating all agents for comprehensive clinical insights.",
        details: "LangGraph-based orchestration triggers all relevant agents, manages inter-agent communication, and delivers comprehensive clinical insights.",
        features: ["Multi-agent coordination", "Parallel execution", "Consensus-driven output"],
        stat: { val: "< 12s", label: "Latency" },
    },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [hoveredMode, setHoveredMode] = useState(null);
    const [selectedMode, setSelectedMode] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    const handleModeClick = (modeId) => {
        if (modeId === "microservices") {
            navigate("/dashboard/microservices");
        } else {
            setSelectedMode(modeId);
        }
    };

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
                        onClick={() => navigate('/')}
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
                    <div style={{
                        width: 26, height: 26, borderRadius: 4,
                        background: "var(--color-accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <span style={{ color: "var(--color-bg)", fontSize: 9, fontWeight: 900, letterSpacing: "-0.02em" }}>MT</span>
                    </div>

                    <div style={{ width: 1, height: 14, background: "var(--color-border)" }} />

                    {/* Breadcrumbs */}
                    <Breadcrumb items={[
                        { label: "MediTwin AI", onClick: () => navigate("/") },
                        { label: "Dashboard" },
                    ]} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 10px", borderRadius: 2,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                    }}>
                        <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "var(--color-accent)", display: "inline-block",
                            animation: "pulse 2s infinite",
                        }} />
                        <span style={{ color: "var(--color-text-subtle)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            Dashboard
                        </span>
                    </div>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── MAIN CONTENT ── */}
            <div style={{
                position: "relative", zIndex: 1,
                paddingTop: 80, paddingBottom: 64,
                paddingLeft: 28, paddingRight: 28,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
            }}>

                {/* Subtle grid background — from landing page */}
                <div style={{
                    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                    backgroundImage: "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                    opacity: 0.025,
                }} />

                {/* Accent glow orb — from landing page */}
                <div style={{
                    position: "fixed", top: "20%", right: 0,
                    width: 380, height: 380,
                    background: "var(--color-accent)",
                    borderRadius: "50%",
                    filter: "blur(120px)",
                    opacity: 0.04,
                    pointerEvents: "none", zIndex: 0,
                }} />

                <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>

                    {/* ── PAGE HEADER ── */}
                    <div style={{ marginBottom: 40 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "4px 12px",
                            border: "1px solid var(--color-border)",
                            background: "color-mix(in srgb, var(--color-accent) 6%, transparent)",
                            marginBottom: 16,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
                            <span style={{ color: "var(--color-text)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                                Choose your interaction mode
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: "clamp(36px, 7vw, 80px)", fontWeight: 900,
                            lineHeight: 0.92, letterSpacing: "-0.03em",
                            textTransform: "uppercase",
                            color: "var(--color-text)",
                            marginBottom: 16,
                        }}>
                            Get<br />
                            <span style={{ color: "transparent", WebkitTextStroke: "2px var(--color-text)" }}>Started</span>
                        </h1>

                        <p style={{ color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.65, maxWidth: 460 }}>
                            Select how you want to interact with MediTwin&apos;s eight specialist agents. Each mode offers a different level of control and abstraction.
                        </p>
                    </div>

                    {/* ── MODE CARDS ── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: 12,
                        marginBottom: 20,
                    }}>
                        {modes.map((mode, idx) => {
                            const IconComponent = mode.icon;
                            const isActive = selectedMode === mode.id;
                            const isHovered = hoveredMode === mode.id;

                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => handleModeClick(mode.id)}
                                    onMouseEnter={() => setHoveredMode(mode.id)}
                                    onMouseLeave={() => setHoveredMode(null)}
                                    style={{
                                        position: "relative", textAlign: "left",
                                        background: isActive ? "var(--color-accent)" : "var(--color-surface)",
                                        border: `1px solid ${isActive ? "var(--color-accent)" : isHovered ? "var(--color-text-subtle)" : "var(--color-border)"}`,
                                        borderRadius: 0,
                                        cursor: "pointer", padding: 0,
                                        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                                        transform: isActive || isHovered ? "translateY(-3px)" : "translateY(0)",
                                        boxShadow: isActive || isHovered ? "0 8px 32px rgba(0,0,0,0.12)" : "none",
                                        overflow: "hidden",
                                        opacity: visible ? 1 : 0,
                                        transitionDelay: `${0.08 + idx * 0.07}s`,
                                    }}
                                >
                                    {/* Top accent line */}
                                    <div style={{
                                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                                        background: isActive ? "rgba(255,255,255,0.4)" : "var(--color-accent)",
                                        transformOrigin: "left",
                                        transform: isActive || isHovered ? "scaleX(1)" : "scaleX(0)",
                                        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                                    }} />

                                    <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>

                                        {/* Header */}
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 4,
                                                background: isActive ? "rgba(255,255,255,0.15)" : "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "background 0.25s",
                                            }}>
                                                <IconComponent size={18} strokeWidth={1.8} style={{
                                                    color: isActive ? "var(--color-bg)" : "var(--color-accent)",
                                                    transition: "color 0.25s",
                                                }} />
                                            </div>
                                            <span style={{
                                                fontSize: 9, fontWeight: 900, letterSpacing: "0.15em",
                                                textTransform: "uppercase", padding: "3px 8px",
                                                background: isActive ? "rgba(255,255,255,0.2)" : "var(--color-accent)",
                                                color: isActive ? "var(--color-bg)" : "var(--color-bg)",
                                                transition: "all 0.25s",
                                            }}>
                                                {mode.badge}
                                            </span>
                                        </div>

                                        {/* Title + desc */}
                                        <h3 style={{
                                            fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 6,
                                            color: isActive ? "var(--color-bg)" : "var(--color-text)",
                                            transition: "color 0.25s",
                                        }}>{mode.title}</h3>

                                        <p style={{
                                            fontSize: 12, lineHeight: 1.6,
                                            color: isActive ? "rgba(255,255,255,0.65)" : "var(--color-text-muted)",
                                            transition: "color 0.25s",
                                        }}>{mode.description}</p>

                                        {/* Features */}
                                        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 5 }}>
                                            {mode.features.map(f => (
                                                <div key={f} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                                    <div style={{
                                                        width: 14, height: 14, borderRadius: 2, flexShrink: 0,
                                                        background: isActive ? "rgba(255,255,255,0.18)" : "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        transition: "background 0.25s",
                                                    }}>
                                                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={isActive ? "rgba(255,255,255,0.8)" : "var(--color-accent)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.25s" }}>
                                                            <polyline points="2 6 5 9 10 3" />
                                                        </svg>
                                                    </div>
                                                    <span style={{
                                                        fontSize: 11,
                                                        color: isActive ? "rgba(255,255,255,0.65)" : "var(--color-text-subtle)",
                                                        transition: "color 0.25s",
                                                    }}>{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer */}
                                        <div style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            marginTop: 20, paddingTop: 14,
                                            borderTop: `1px solid ${isActive ? "rgba(255,255,255,0.18)" : "var(--color-border)"}`,
                                            transition: "border-color 0.25s",
                                        }}>
                                            <div>
                                                <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1, color: isActive ? "var(--color-bg)" : "var(--color-text)", transition: "color 0.25s" }}>
                                                    {mode.stat.val}
                                                </div>
                                                <div style={{ fontSize: 10, marginTop: 2, color: isActive ? "rgba(255,255,255,0.5)" : "var(--color-text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", transition: "color 0.25s" }}>
                                                    {mode.stat.label}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                                                    color: isActive ? "rgba(255,255,255,0.8)" : "var(--color-accent)",
                                                    transition: "color 0.25s",
                                                }}>Launch mode</span>
                                                <ChevronRight size={12} strokeWidth={2.5} style={{
                                                    color: isActive ? "rgba(255,255,255,0.7)" : "var(--color-accent)",
                                                    transition: "color 0.25s, transform 0.25s",
                                                    transform: isHovered || isActive ? "translateX(3px)" : "translateX(0)",
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── NOTICE ── inspired by landing page CTA banner ── */}
                    <div style={{
                        position: "relative", overflow: "hidden",
                        padding: "20px 24px",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderLeft: "3px solid var(--color-accent)",
                        display: "flex", alignItems: "center", gap: 16,
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 4, flexShrink: 0,
                            background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 4 }}>
                                Important notice
                            </p>
                            <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.65 }}>
                                All AI-generated clinical outputs require physician review. MediTwin is designed to augment, not replace, clinical decision-making by licensed healthcare professionals.
                            </p>
                        </div>
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