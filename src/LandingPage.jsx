import { useState, useEffect, useRef } from "react";
import {
  User, Microscope, FlaskConical, Pill, Scan, BarChart2, Scale, FileText,
} from "lucide-react";
import ThemeToggle from "./components/theme/ThemeToggle";

const agents = [
  { id: 1, name: "Patient Context", icon: User, desc: "FHIR R4 data ingestion & normalization", tag: "A2A", input: "Patient ID + SHARP context headers", output: "Normalized FHIR R4 resource bundle", tech: "httpx async + fhirclient", note: "Injects context into all downstream agents via A2A headers." },
  { id: 2, name: "Diagnosis", icon: Microscope, desc: "RAG-based differential diagnosis engine", tag: "A2A", input: "Symptoms, history, lab flags", output: "Ranked differential diagnoses (top 5)", tech: "LangChain + ChromaDB", note: "Retrieves from medical knowledge base; runs concurrently with Lab Analysis." },
  { id: 3, name: "Lab Analysis", icon: FlaskConical, desc: "Abnormality detection via rules engine", tag: "A2A", input: "Lab result values + reference ranges", output: "Flagged abnormalities + severity scores", tech: "Rules engine + LLM reasoning", note: "Parallel execution with Diagnosis via asyncio.gather()." },
  { id: 4, name: "Drug Safety", icon: Pill, desc: "FDA API — interactions & contraindications", tag: "MCP", input: "Current medications + proposed treatment", output: "Interaction warnings + severity grades", tech: "FDA OpenFDA API via MCP server", note: "Only external MCP-served agent; handles live drug database lookups." },
  { id: 5, name: "Imaging Triage", icon: Scan, desc: "CNN-based chest X-ray analysis", tag: "A2A", input: "Chest X-ray DICOM/JPEG attachment", output: "Pathology classification + confidence", tech: "TensorFlow / Keras CNN", note: "Activates conditionally — only fires if imaging is attached to the patient record." },
  { id: 6, name: "Digital Twin", icon: BarChart2, desc: "XGBoost outcome simulation & what-if", tag: "A2A", input: "Patient features + proposed treatments", output: "3 scenario outcome distributions", tech: "XGBoost risk model", note: "Simulates three treatment paths and returns probability distributions per scenario." },
  { id: 7, name: "Consensus", icon: Scale, desc: "Conflict detection & arbitration", tag: "A2A", input: "All specialist agent outputs", output: "Unified recommendation or escalation flag", tech: "LangGraph state + LLM arbiter", note: "Escalates to human clinician if confidence < threshold or agents disagree sharply." },
  { id: 8, name: "Explanation", icon: FileText, desc: "SOAP note + FHIR Bundle generation", tag: "A2A", input: "Consensus output", output: "SOAP note, FHIR Bundle, patient summary", tech: "GPT-4o-mini / Claude Haiku", note: "Generates three output formats: clinician SOAP, structured FHIR, plain-language patient summary." },
];

const questions = [
  { q: "What is happening?", agents: "Diagnosis · Lab · Imaging", detail: "Diagnosis, Lab Analysis, and Imaging Triage agents work in parallel — RAG-based differential, abnormality detection, and CNN X-ray triage all fire simultaneously via asyncio.gather()." },
  { q: "What will happen next?", agents: "Digital Twin", detail: "Digital Twin agent feeds the patient feature vector into an XGBoost model and simulates three treatment scenarios, returning outcome probability distributions for each path." },
  { q: "What should we do?", agents: "Drug Safety · Consensus · Orchestrator", detail: "Drug Safety MCP flags all interactions against the FDA database, Consensus Agent arbitrates disagreements, and the Orchestrator routes to human escalation if confidence is below threshold." },
];

const steps = [
  { n: "01", title: "Patient Input", desc: "Clinician submits a patient ID. SHARP context is injected via A2A headers. The Orchestrator initialises the LangGraph state.", chips: ["Orchestrator", "Patient Context Agent"] },
  { n: "02", title: "Parallel Analysis", desc: "Patient Context Agent fetches FHIR R4 resources. Diagnosis and Lab Analysis agents run concurrently via asyncio.gather() — no waiting.", chips: ["Diagnosis Agent", "Lab Analysis Agent", "asyncio.gather()"] },
  { n: "03", title: "Specialist Review", desc: "Imaging Triage fires if an X-ray is attached. Drug Safety MCP flags interactions. Digital Twin simulates three treatment scenarios in parallel.", chips: ["Imaging Triage", "Drug Safety MCP", "Digital Twin"] },
  { n: "04", title: "Consensus & Output", desc: "Consensus Agent resolves conflicts or escalates to a clinician. Explanation Agent generates SOAP note, FHIR Bundle, and patient summary.", chips: ["Consensus Agent", "Explanation Agent", "SOAP · FHIR · Summary"] },
];

const stack = [
  { label: "Graph Orchestration", val: "LangGraph" },
  { label: "LLM Reasoning", val: "Gemini-flash-2.5" },
  { label: "RAG Pipeline", val: "LangChain + ChromaDB" },
  { label: "Medical Imaging", val: "TensorFlow / Keras CNN" },
  { label: "Risk Modeling", val: "XGBoost" },
  { label: "FHIR Client", val: "httpx async + fhirclient" },
  { label: "Caching", val: "Redis" },
  { label: "API Framework", val: "FastAPI" },
  { label: "Deployment", val: "Docker Compose" },
];

export default function LandingPage() {
  const [visible, setVisible] = useState(false);
  const [activeQ, setActiveQ] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [activeNav, setActiveNav] = useState("agents");
  const qTimerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    startQTimer();
    return () => clearInterval(qTimerRef.current);
  }, []);

  const startQTimer = () => {
    clearInterval(qTimerRef.current);
    qTimerRef.current = setInterval(() => {
      setActiveQ((p) => (p + 1) % 3);
    }, 4500);
  };

  const handleSelectQ = (i) => {
    setActiveQ(i);
    startQTimer();
  };

  const handleSelectAgent = (i) => {
    setSelectedAgent((prev) => (prev === i ? null : i));
  };

  const handleSelectStep = (i) => {
    setActiveStep((prev) => (prev === i ? null : i));
  };

  const scrollToSection = (id, nav) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(nav);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[var(--color-bg)]/90 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-sm flex items-center justify-center">
            <span className="text-[var(--color-bg)] text-xs font-black tracking-tighter">MT</span>
          </div>
          <span className="text-[var(--color-text)] text-sm font-bold tracking-[0.2em] uppercase">MediTwin AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.15em] uppercase">
          {[["agents", "Agents", "agents-section"], ["pipeline", "Pipeline", "how-section"], ["stack", "Stack", "stack-section"]].map(([key, label, id]) => (
            <button
              key={key}
              onClick={() => scrollToSection(id, key)}
              className={`transition-colors pb-0.5 border-b-2 ${activeNav === key ? "text-[var(--color-text)] border-[var(--color-accent)]" : "text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="px-5 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-bold tracking-[0.15em] uppercase hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-all duration-300">
            Launch Demo
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-8 min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{ backgroundImage: "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />

        <div
          className="max-w-6xl mx-auto w-full"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        >
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-accent)]/5">
            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
            <span className="text-[var(--color-text)] text-xs font-bold tracking-[0.2em] uppercase">Agents Assemble · Healthcare AI Hackathon</span>
          </div>

          <h1 className="text-[clamp(52px,9vw,120px)] font-black leading-[0.9] tracking-[-0.02em] uppercase text-[var(--color-text)] mb-6">
            Medi<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px var(--color-text)' }}>Twin</span>
            <span className="text-[var(--color-text)]"> AI</span>
          </h1>

          <p className="max-w-xl text-[var(--color-text-muted)] text-lg font-medium mb-4 leading-relaxed">
            A multi-agent clinical decision support system that mirrors how real clinical teams work — eight specialists, one unified output.
          </p>
          <p className="text-[var(--color-text-subtle)] text-sm font-bold tracking-[0.2em] uppercase mb-12 italic">
            "What is happening? What will happen next? What should we do?"
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="group relative px-10 py-4 bg-[var(--color-accent)] text-[var(--color-bg)] text-sm font-black tracking-[0.2em] uppercase overflow-hidden hover:scale-[1.02] transition-transform duration-300">
              <span className="relative z-10">Get Started →</span>
              <div className="absolute inset-0 bg-[var(--color-accent-hover)] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
            <button
              onClick={() => scrollToSection("how-section", "pipeline")}
              className="px-10 py-4 border-2 border-[var(--color-accent)] text-[var(--color-accent)] text-sm font-black tracking-[0.2em] uppercase hover:bg-[var(--color-accent)]/5 transition-all duration-300"
            >
              View Pipeline
            </button>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-12 gap-y-6 border-t border-[var(--color-border)] pt-10">
            {[["8", "Specialist Agents"], ["3", "Core Questions"], ["< 12s", "End-to-End Latency"], ["FHIR R4", "Standards Compliant"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-[var(--color-text)] text-2xl font-black tracking-tight">{val}</p>
                <p className="text-[var(--color-text-muted)] text-xs font-bold tracking-[0.15em] uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE QUESTIONS */}
      <section className="relative py-20 px-8 overflow-hidden" style={{ background: "var(--color-accent)" }}>
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(var(--color-bg) 1px, transparent 1px), linear-gradient(90deg, var(--color-bg) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Radial glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-8 h-px" style={{ background: "rgba(var(--color-bg-rgb, 245,245,248), 0.3)" }} />
            <p className="text-[var(--color-bg)]/40 text-[10px] font-black tracking-[0.4em] uppercase">The Three Clinical Questions</p>
          </div>

          {/* Question rows */}
          <div className="flex flex-col gap-px">
            {questions.map((item, i) => {
              const isActive = activeQ === i;
              const nums = ["01", "02", "03"];
              const agentList = item.agents.split(" · ");
              return (
                <div key={i}>
                  <button
                    onClick={() => handleSelectQ(i)}
                    className="w-full text-left group transition-all duration-400"
                    style={{
                      padding: "28px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "32px",
                    }}
                  >
                    {/* Big number */}
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: "clamp(36px, 5vw, 56px)",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                        transition: "color 0.35s ease",
                        minWidth: "72px",
                        flexShrink: 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {nums[i]}
                    </span>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <p
                        style={{
                          fontSize: "clamp(18px, 3vw, 26px)",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "-0.01em",
                          lineHeight: 1.1,
                          color: isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.55)",
                          transition: "color 0.35s ease",
                          marginBottom: "12px",
                        }}
                      >
                        {item.q}
                      </p>

                      {/* Agent chips */}
                      <div className="flex flex-wrap gap-2">
                        {agentList.map((ag) => (
                          <span
                            key={ag}
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              border: `1px solid ${isActive ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}`,
                              color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                              transition: "all 0.35s ease",
                              borderRadius: "2px",
                            }}
                          >
                            {ag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        marginTop: "4px",
                        color: isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                        transform: isActive ? "translateX(4px)" : "translateX(0)",
                        transition: "all 0.35s ease",
                      }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>

                  {/* Inline detail */}
                  <div style={{
                    maxHeight: isActive ? "160px" : "0px",
                    opacity: isActive ? 1 : 0,
                    overflow: "hidden",
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                  }}>
                    <div style={{
                      padding: "20px 0 20px 104px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      borderLeft: "2px solid rgba(255,255,255,0.5)",
                      marginLeft: "72px",
                      paddingLeft: "32px",
                    }}>
                      <p style={{
                        fontSize: "13px",
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.65)",
                        maxWidth: "680px",
                      }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AGENTS GRID */}
      <section id="agents-section" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[var(--color-text-subtle)] text-xs font-bold tracking-[0.3em] uppercase mb-3">The Team</p>
              <h2 className="text-5xl font-black uppercase tracking-tight text-[var(--color-text)]">8 Specialist<br />Agents</h2>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="px-3 py-1 bg-[var(--color-accent)] text-[var(--color-bg)] text-xs font-bold">A2A</span>
              <span className="text-[var(--color-text-subtle)] text-xs">Agent-to-Agent</span>
              <span className="px-3 py-1 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-bold ml-3">MCP</span>
              <span className="text-[var(--color-text-subtle)] text-xs">MCP Server</span>
            </div>
          </div>
          <p className="text-[var(--color-text-subtle)] text-xs mb-10">Click any agent to inspect its inputs, outputs, and tech.</p>

          <div className="flex flex-col divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
            {agents.map((agent, i) => {
              const IconComponent = agent.icon;
              const isSelected = selectedAgent === i;
              return (
                <div key={agent.id}>
                  {/* Row header */}
                  <button
                    onClick={() => handleSelectAgent(i)}
                    className={`w-full text-left flex items-center gap-5 px-6 py-5 transition-all duration-300 group ${isSelected ? "bg-[var(--color-accent)]" : "bg-[var(--color-bg)] hover:bg-[var(--color-surface)]"}`}
                  >
                    {/* Number */}
                    <span className={`text-xs font-black tabular-nums shrink-0 w-6 transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]/40" : "text-[var(--color-text-subtle)]"}`}>
                      {String(agent.id).padStart(2, "0")}
                    </span>

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 transition-colors duration-300 ${isSelected ? "bg-[var(--color-bg)]/15" : "bg-[var(--color-accent)]/10 group-hover:bg-[var(--color-accent)]/20"}`}>
                      <IconComponent size={15} className={`transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]" : "text-[var(--color-accent)]"}`} strokeWidth={1.75} />
                    </div>

                    {/* Name + desc */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-sm font-black uppercase tracking-tight transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]" : "text-[var(--color-text)]"}`}>
                          {agent.name}
                        </h3>
                        <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 shrink-0 transition-all duration-300 ${agent.tag === "MCP"
                            ? isSelected ? "border border-[var(--color-bg)] text-[var(--color-bg)]" : "border border-[var(--color-accent)] text-[var(--color-accent)]"
                            : isSelected ? "bg-[var(--color-bg)] text-[var(--color-accent)]" : "bg-[var(--color-accent)] text-[var(--color-bg)]"
                          }`}>
                          {agent.tag}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]/60" : "text-[var(--color-text-muted)]"}`}>
                        {agent.desc}
                      </p>
                    </div>

                    {/* Chevron */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className={`shrink-0 transition-all duration-300 ${isSelected ? "text-[var(--color-bg)]/50 rotate-180" : "text-[var(--color-text-subtle)] rotate-0"}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Inline expanded detail */}
                  <div className={`overflow-hidden transition-all duration-300 ${isSelected ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-6 py-5 bg-[var(--color-surface)] border-t border-[var(--color-border)] grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        ["→ Input", agent.input],
                        ["← Output", agent.output],
                        ["⚙ Tech", agent.tech],
                        ["✎ Note", agent.note],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--color-accent)] mb-2">{label}</p>
                          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-section" className="py-24 px-8 bg-[var(--color-accent)]/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[var(--color-text-subtle)] text-xs font-bold tracking-[0.3em] uppercase mb-3">Workflow</p>
          <h2 className="text-5xl font-black uppercase tracking-tight text-[var(--color-text)] mb-4">Pipeline</h2>
          <p className="text-[var(--color-text-subtle)] text-xs mb-10">Click a step to highlight.</p>

          <div className="space-y-px">
            {steps.map((step, i) => (
              <button
                key={step.n}
                onClick={() => handleSelectStep(i)}
                className={`w-full text-left flex gap-8 p-8 border-l-4 transition-all duration-300 cursor-pointer ${activeStep === i
                  ? "bg-[var(--color-surface)] border-[var(--color-accent)]"
                  : "bg-[var(--color-bg)] border-transparent hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface)]"
                  }`}
              >
                <p className={`text-5xl font-black shrink-0 leading-none transition-colors duration-300 ${activeStep === i ? "text-[var(--color-text)]/20" : "text-[var(--color-text)]/10"}`}>
                  {step.n}
                </p>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-text)] mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xl mb-3">{step.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        className={`text-xs px-2 py-1 font-bold tracking-wide transition-all duration-300 ${activeStep === i
                          ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                          : "bg-[var(--color-accent)]/10 text-[var(--color-text-muted)]"
                          }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section id="stack-section" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-[var(--color-text-subtle)] text-xs font-bold tracking-[0.3em] uppercase mb-3">Technology</p>
          <h2 className="text-5xl font-black uppercase tracking-tight text-[var(--color-text)] mb-16">Stack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border)]">
            {stack.map((item) => (
              <div key={item.label} className="bg-[var(--color-bg)] p-6 hover:bg-[var(--color-surface)] transition-colors duration-200 group">
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--color-text-subtle)] mb-2">{item.label}</p>
                <p className="text-base font-black text-[var(--color-text)] group-hover:translate-x-1 transition-transform duration-200">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 bg-[var(--color-accent)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(var(--color-bg) 1px, transparent 1px), linear-gradient(90deg, var(--color-bg) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-6xl mx-auto relative">
          <p className="text-[var(--color-bg)]/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Ready to Begin</p>
          <h2 className="text-[clamp(36px,6vw,80px)] font-black uppercase tracking-tight text-[var(--color-bg)] leading-[0.9] mb-10">
            One System.<br />Eight Specialists.<br />Three Answers.
          </h2>
          <button className="group px-12 py-5 bg-[var(--color-bg)] text-[var(--color-accent)] text-sm font-black tracking-[0.2em] uppercase hover:bg-[var(--color-bg)]/90 transition-all duration-300 hover:scale-[1.02]">
            Get Started →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-8 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[var(--color-accent)] rounded-sm flex items-center justify-center">
            <span className="text-[var(--color-bg)] text-[9px] font-black">MT</span>
          </div>
          <span className="text-[var(--color-text)] text-xs font-bold tracking-[0.2em] uppercase">MediTwin AI</span>
        </div>
        <p className="text-[var(--color-text-subtle)] text-xs tracking-wide">Agents Assemble · Healthcare AI Endgame Challenge · Tayyab Hussain</p>
        <p className="text-[var(--color-text-subtle)] text-xs">AI-generated clinical outputs require physician review.</p>
      </footer>
    </div>
  );
}