import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Microscope, FlaskConical, Pill, Scan, BarChart2, Scale, FileText,
} from "lucide-react";
import ThemeToggle from "./components/theme/ThemeToggle";

/* ════════════════════════════════════════════════
   HOOKS
════════════════════════════════════════════════ */

/** Fires once when element enters viewport */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, on];
}

/** Counts up from 0 → target with ease-out-cubic */
function useCounter(target, active, ms = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const n = parseInt(target, 10);
    if (isNaN(n)) return;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / ms, 1);
      const eased = 1 - (1 - p) ** 3;
      setVal(Math.round(n * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, ms]);
  return val;
}

/* ════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════ */

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

// ── Stack now includes Frontend entries ──────────────────
const stack = [
  // Backend
  { label: "Graph Orchestration", val: "LangGraph", cat: "Backend" },
  { label: "LLM Reasoning", val: "Gemini Flash 2.5", cat: "Backend" },
  { label: "RAG Pipeline", val: "LangChain + ChromaDB", cat: "Backend" },
  { label: "Medical Imaging", val: "TensorFlow / Keras CNN", cat: "Backend" },
  { label: "Risk Modeling", val: "XGBoost", cat: "Backend" },
  { label: "FHIR Client", val: "httpx async + fhirclient", cat: "Backend" },
  { label: "Caching", val: "Redis", cat: "Backend" },
  { label: "API Framework", val: "FastAPI", cat: "Backend" },
  { label: "Deployment", val: "Docker Compose", cat: "Backend" },
  // Frontend
  { label: "UI Framework", val: "React + Vite", cat: "Frontend" },
  { label: "Styling", val: "Tailwind CSS v4", cat: "Frontend" },
  { label: "Icons", val: "Lucide React", cat: "Frontend" },
];

/* ════════════════════════════════════════════════
   STAT COUNTER ITEM
════════════════════════════════════════════════ */
function StatItem({ val, label, active, delay = 0 }) {
  const numericVal = parseInt(val, 10);
  const isNumeric = !isNaN(numericVal);
  const counted = useCounter(numericVal, active);

  return (
    <div
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <p className="text-[var(--color-text)] text-2xl font-black tracking-tight tabular-nums">
        {isNumeric ? counted : val}
      </p>
      <p className="text-[var(--color-text-muted)] text-xs font-bold tracking-[0.15em] uppercase mt-1">
        {label}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();

  // hero entrance
  const [heroVisible, setHeroVisible] = useState(false);

  // rotating clinical questions
  const [activeQ, setActiveQ] = useState(0);
  const qTimerRef = useRef(null);

  // expandable agent rows
  const [selectedAgent, setSelectedAgent] = useState(null);

  // expandable pipeline steps
  const [activeStep, setActiveStep] = useState(null);

  // active nav tab
  const [activeNav, setActiveNav] = useState("agents");

  // scroll progress (0–1)
  const [scrollProgress, setScrollProgress] = useState(0);

  // section reveal hooks
  const [statsRef, statsOn] = useReveal(0.2);
  const [questRef, questOn] = useReveal(0.1);
  const [agentsRef, agentsOn] = useReveal(0.05);
  const [pipeRef, pipeOn] = useReveal(0.05);
  const [stackRef, stackOn] = useReveal(0.05);
  const [ctaRef, ctaOn] = useReveal(0.2);

  /* ── lifecycle ──────────────────────────────── */
  useEffect(() => {
    const heroTimer = setTimeout(() => setHeroVisible(true), 80);

    // auto-cycle questions
    startQTimer();

    // scroll progress
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? scrolled / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(heroTimer);
      clearInterval(qTimerRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const startQTimer = () => {
    clearInterval(qTimerRef.current);
    qTimerRef.current = setInterval(
      () => setActiveQ((p) => (p + 1) % 3),
      4500
    );
  };

  const handleSelectQ = (i) => { setActiveQ(i); startQTimer(); };
  const handleSelectAgent = (i) => setSelectedAgent((p) => (p === i ? null : i));
  const handleSelectStep = (i) => setActiveStep((p) => (p === i ? null : i));
  const scrollToSection = (id, nav) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(nav);
  };

  /* ── group stack by category ────────────────── */
  const stackByCategory = stack.reduce((acc, item) => {
    acc[item.cat] = acc[item.cat] || [];
    acc[item.cat].push(item);
    return acc;
  }, {});

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans overflow-x-hidden">

      {/* ── SCROLL PROGRESS BAR ─────────────────── */}
      <div
        className="fixed top-0 left-0 z-[999] h-[2px] bg-[var(--color-accent)] origin-left"
        style={{
          transform: `scaleX(${scrollProgress})`,
          transition: "transform 0.1s linear",
          transformOrigin: "left",
          width: "100%",
        }}
      />

      {/* ── NAV ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[var(--color-bg)]/90 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-sm flex items-center justify-center">
            <span className="text-[var(--color-bg)] text-xs font-black tracking-tighter">MT</span>
          </div>
          <span className="text-[var(--color-text)] text-sm font-bold tracking-[0.2em] uppercase">
            MediTwin AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.15em] uppercase">
          {[
            ["agents", "Agents", "agents-section"],
            ["pipeline", "Pipeline", "how-section"],
            ["stack", "Stack", "stack-section"],
          ].map(([key, label, id]) => (
            <button
              key={key}
              onClick={() => scrollToSection(id, key)}
              className={`transition-colors pb-0.5 border-b-2 ${activeNav === key
                ? "text-[var(--color-text)] border-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text)]"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-bold tracking-[0.15em] uppercase hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-all duration-300"
          >
            Launch Demo
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-8 min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Animated grid bg */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridShift 20s linear infinite",
          }}
        />

        {/* Doctor image — constrained to right 55% only */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0, overflow: "hidden" }}  // ← clips at page edge only
        >
          <div
            className="absolute top-0 bottom-0"
            style={{ left: "45%", right: "0", overflow: "visible" }}  // ← blur bleeds left freely
          >
            <img
              src="/hero-doctor.png"
              alt=""
              className="w-full h-full object-cover"
              style={{
                objectPosition: "30% center",
                filter: "blur(2.5px) brightness(0.70) saturate(1.0)",
              }}
            />
            {/* Solid left fade — covers the bleed zone completely */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, var(--color-bg) 0%, var(--color-bg) 20%, transparent 55%)",
                left: "-80px",  // ← extends past div left edge to cover blurred bleed
              }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to left, var(--color-bg) 0%, transparent 8%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-bg) 0%, transparent 12%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, transparent 15%)" }} />
          </div>
        </div>

        {/* Accent glow — keep but softer since image is present */}
        <div
          className="absolute bottom-1/4 -left-24 w-80 h-80 pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
            opacity: 0.03,
            animation: "pulse 8s ease-in-out infinite reverse",
            zIndex: 0,
          }}
        />

        <div
          className="max-w-6xl mx-auto w-full relative"
          style={{
            zIndex: 1,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-[var(--color-border)] bg-[var(--color-accent)]/5">
            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" />
            <span className="text-[var(--color-text)] text-xs font-bold tracking-[0.2em] uppercase">
              Agents Assemble · Healthcare AI Hackathon
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(52px,9vw,120px)] font-black leading-[0.9] tracking-[-0.02em] uppercase text-[var(--color-text)] mb-6"
            style={{ animation: "fadeSlideUp 0.9s 0.15s both" }}
          >
            Medi<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px var(--color-text)" }}>
              Twin
            </span>
            <span className="text-[var(--color-text)]"> AI</span>
          </h1>

          {/* Sub */}
          <p
            className="max-w-xl text-[var(--color-text-muted)] text-lg font-medium mb-4 leading-relaxed"
            style={{ animation: "fadeSlideUp 0.9s 0.3s both" }}
          >
            A multi-agent clinical decision support system that mirrors how real clinical teams work — eight specialists, one unified output.
          </p>
          <p
            className="text-[var(--color-text-subtle)] text-sm font-bold tracking-[0.2em] uppercase mb-12 italic"
            style={{ animation: "fadeSlideUp 0.9s 0.45s both" }}
          >
            "What is happening? What will happen next? What should we do?"
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap gap-4"
            style={{ animation: "fadeSlideUp 0.9s 0.55s both" }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="group relative px-10 py-4 bg-[var(--color-accent)] text-[var(--color-bg)] text-sm font-black tracking-[0.2em] uppercase overflow-hidden hover:scale-[1.02] transition-transform duration-300"
            >
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

          {/* Stats — animated counters */}
          <div
            ref={statsRef}
            className="mt-16 flex flex-wrap gap-x-12 gap-y-6 border-t border-[var(--color-border)] pt-10"
          >
            {[
              { val: "8", label: "Specialist Agents" },
              { val: "3", label: "Core Questions" },
              { val: "< 12s", label: "End-to-End Latency" },
              { val: "FHIR R4", label: "Standards Compliant" },
            ].map(({ val, label }, i) => (
              <StatItem key={label} val={val} label={label} active={statsOn} delay={i * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          THREE QUESTIONS
      ══════════════════════════════════════════ */}
      <section
        ref={questRef}
        className="relative py-20 px-8 overflow-hidden"
        style={{ background: "var(--color-accent)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-bg) 1px, transparent 1px), linear-gradient(90deg, var(--color-bg) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
        />

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <div
            className="flex items-center gap-4 mb-12"
            style={{
              opacity: questOn ? 1 : 0,
              transform: questOn ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <p className="text-[var(--color-bg)]/40 text-[10px] font-black tracking-[0.4em] uppercase">
              The Three Clinical Questions
            </p>
          </div>

          <div className="flex flex-col gap-px">
            {questions.map((item, i) => {
              const isActive = activeQ === i;
              const agentList = item.agents.split(" · ");
              return (
                <div
                  key={i}
                  style={{
                    opacity: questOn ? 1 : 0,
                    transform: questOn ? "translateX(0)" : "translateX(-24px)",
                    transition: `opacity 0.6s ease ${i * 120 + 200}ms, transform 0.6s ease ${i * 120 + 200}ms`,
                  }}
                >
                  <button
                    onClick={() => handleSelectQ(i)}
                    className="w-full text-left group"
                    style={{
                      padding: "28px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "32px",
                    }}
                  >
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
                      {["01", "02", "03"][i]}
                    </span>

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

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18" height="18" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        marginTop: "4px",
                        color: isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                        transform: isActive ? "translateX(6px)" : "translateX(0)",
                        transition: "all 0.35s ease",
                      }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>

                  {/* Expanded detail */}
                  <div
                    style={{
                      maxHeight: isActive ? "160px" : "0",
                      opacity: isActive ? 1 : 0,
                      overflow: "hidden",
                      transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    <div
                      style={{
                        padding: "20px 0 20px 32px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        borderLeft: "2px solid rgba(255,255,255,0.5)",
                        marginLeft: "104px",
                      }}
                    >
                      <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.65)", maxWidth: "680px" }}>
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

      {/* ══════════════════════════════════════════
          AGENTS GRID
      ══════════════════════════════════════════ */}
      <section id="agents-section" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div
            ref={agentsRef}
            className="flex items-end justify-between mb-6"
            style={{
              opacity: agentsOn ? 1 : 0,
              transform: agentsOn ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div>
              <p className="text-[var(--color-text-subtle)] text-xs font-bold tracking-[0.3em] uppercase mb-3">The Team</p>
              <h2 className="text-5xl font-black uppercase tracking-tight text-[var(--color-text)]">
                8 Specialist<br />Agents
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="px-3 py-1 bg-[var(--color-accent)] text-[var(--color-bg)] text-xs font-bold">A2A</span>
              <span className="text-[var(--color-text-subtle)] text-xs">Agent-to-Agent</span>
              <span className="px-3 py-1 border border-[var(--color-accent)] text-[var(--color-accent)] text-xs font-bold ml-3">MCP</span>
              <span className="text-[var(--color-text-subtle)] text-xs">MCP Server</span>
            </div>
          </div>
          <p
            className="text-[var(--color-text-subtle)] text-xs mb-10"
            style={{
              opacity: agentsOn ? 1 : 0,
              transition: "opacity 0.7s ease 0.2s",
            }}
          >
            Click any agent to inspect its inputs, outputs, and tech.
          </p>

          {/* Agent rows */}
          <div className="flex flex-col divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
            {agents.map((agent, i) => {
              const IconComponent = agent.icon;
              const isSelected = selectedAgent === i;
              return (
                <div
                  key={agent.id}
                  style={{
                    opacity: agentsOn ? 1 : 0,
                    transform: agentsOn ? "translateX(0)" : "translateX(-20px)",
                    transition: `opacity 0.5s ease ${i * 60 + 100}ms, transform 0.5s ease ${i * 60 + 100}ms`,
                  }}
                >
                  <button
                    onClick={() => handleSelectAgent(i)}
                    className={`w-full text-left flex items-center gap-5 px-6 py-5 transition-all duration-300 group ${isSelected
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-bg)] hover:bg-[var(--color-surface)]"
                      }`}
                  >
                    <span
                      className={`text-xs font-black tabular-nums shrink-0 w-6 transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]/40" : "text-[var(--color-text-subtle)]"
                        }`}
                    >
                      {String(agent.id).padStart(2, "0")}
                    </span>

                    <div
                      className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 transition-all duration-300 ${isSelected
                        ? "bg-[var(--color-bg)]/15"
                        : "bg-[var(--color-accent)]/10 group-hover:bg-[var(--color-accent)]/20"
                        }`}
                    >
                      <IconComponent
                        size={15}
                        className={`transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]" : "text-[var(--color-accent)]"
                          }`}
                        strokeWidth={1.75}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className={`text-sm font-black uppercase tracking-tight transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]" : "text-[var(--color-text)]"
                            }`}
                        >
                          {agent.name}
                        </h3>
                        <span
                          className={`text-[10px] font-black tracking-widest px-2 py-0.5 shrink-0 transition-all duration-300 ${agent.tag === "MCP"
                            ? isSelected
                              ? "border border-[var(--color-bg)] text-[var(--color-bg)]"
                              : "border border-[var(--color-accent)] text-[var(--color-accent)]"
                            : isSelected
                              ? "bg-[var(--color-bg)] text-[var(--color-accent)]"
                              : "bg-[var(--color-accent)] text-[var(--color-bg)]"
                            }`}
                        >
                          {agent.tag}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed transition-colors duration-300 ${isSelected ? "text-[var(--color-bg)]/60" : "text-[var(--color-text-muted)]"
                          }`}
                      >
                        {agent.desc}
                      </p>
                    </div>

                    <svg
                      xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      className={`shrink-0 transition-all duration-300 ${isSelected ? "text-[var(--color-bg)]/50 rotate-180" : "text-[var(--color-text-subtle)] rotate-0"
                        }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Expanded detail */}
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

      {/* ══════════════════════════════════════════
          PIPELINE / HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-section" className="py-24 px-8 bg-[var(--color-accent)]/5">
        <div className="max-w-6xl mx-auto">
          <div
            ref={pipeRef}
            style={{
              opacity: pipeOn ? 1 : 0,
              transform: pipeOn ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <p className="text-[var(--color-text-subtle)] text-xs font-bold tracking-[0.3em] uppercase mb-3">Workflow</p>
            <h2 className="text-5xl font-black uppercase tracking-tight text-[var(--color-text)] mb-4">Pipeline</h2>
            <p className="text-[var(--color-text-subtle)] text-xs mb-10">Click a step to highlight.</p>
          </div>

          <div className="space-y-px">
            {steps.map((step, i) => (
              <div
                key={step.n}
                style={{
                  opacity: pipeOn ? 1 : 0,
                  transform: pipeOn ? "translateX(0)" : "translateX(-24px)",
                  transition: `opacity 0.5s ease ${i * 100 + 200}ms, transform 0.5s ease ${i * 100 + 200}ms`,
                }}
              >
                <button
                  onClick={() => handleSelectStep(i)}
                  className={`w-full text-left flex gap-8 p-8 border-l-4 transition-all duration-300 cursor-pointer ${activeStep === i
                    ? "bg-[var(--color-surface)] border-[var(--color-accent)]"
                    : "bg-[var(--color-bg)] border-transparent hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface)]"
                    }`}
                >
                  <p
                    className={`text-5xl font-black shrink-0 leading-none transition-colors duration-300 ${activeStep === i ? "text-[var(--color-text)]/20" : "text-[var(--color-text)]/10"
                      }`}
                  >
                    {step.n}
                  </p>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-text)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xl mb-3">
                      {step.desc}
                    </p>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TECH STACK  (Backend + Frontend grouped)
      ══════════════════════════════════════════ */}
      <section id="stack-section" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div
            ref={stackRef}
            style={{
              opacity: stackOn ? 1 : 0,
              transform: stackOn ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <p className="text-[var(--color-text-subtle)] text-xs font-bold tracking-[0.3em] uppercase mb-3">Technology</p>
            <h2 className="text-5xl font-black uppercase tracking-tight text-[var(--color-text)] mb-16">Stack</h2>
          </div>

          {Object.entries(stackByCategory).map(([cat, items], catIdx) => (
            <div key={cat} className="mb-12 last:mb-0">
              {/* Category label */}
              <div
                className="flex items-center gap-4 mb-4"
                style={{
                  opacity: stackOn ? 1 : 0,
                  transform: stackOn ? "translateX(0)" : "translateX(-12px)",
                  transition: `opacity 0.5s ease ${catIdx * 150 + 100}ms, transform 0.5s ease ${catIdx * 150 + 100}ms`,
                }}
              >
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[var(--color-accent)]">
                  {cat}
                </span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>

              {/* Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border)]">
                {items.map((item, j) => {
                  const totalDelay = catIdx * 150 + j * 60 + 200;
                  return (
                    <div
                      key={item.label}
                      className="relative bg-[var(--color-bg)] p-6 overflow-hidden group cursor-default"
                      style={{
                        opacity: stackOn ? 1 : 0,
                        transform: stackOn ? "translateY(0)" : "translateY(16px)",
                        transition: `opacity 0.5s ease ${totalDelay}ms, transform 0.5s ease ${totalDelay}ms`,
                      }}
                    >
                      {/* Hover fill */}
                      <div className="absolute inset-0 bg-[var(--color-accent)]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

                      {/* Content */}
                      <div className="relative z-10">
                        <p className="text-xs font-bold tracking-[0.15em] uppercase text-[var(--color-text-subtle)] mb-2">
                          {item.label}
                        </p>
                        <p className="text-base font-black text-[var(--color-text)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all duration-300">
                          {item.val}
                        </p>
                      </div>

                      {/* Corner accent */}
                      <div className="absolute bottom-0 right-0 w-0 h-0 border-[12px] border-transparent border-b-[var(--color-accent)]/10 border-r-[var(--color-accent)]/10 group-hover:border-b-[var(--color-accent)]/20 group-hover:border-r-[var(--color-accent)]/20 transition-colors duration-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="py-24 px-8 bg-[var(--color-accent)] relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-bg) 1px, transparent 1px), linear-gradient(90deg, var(--color-bg) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Animated sweep */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
            animation: "sweep 4s ease-in-out infinite",
          }}
        />

        <div
          className="max-w-6xl mx-auto relative"
          style={{
            opacity: ctaOn ? 1 : 0,
            transform: ctaOn ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <p className="text-[var(--color-bg)]/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Ready to Begin</p>
          <h2 className="text-[clamp(36px,6vw,80px)] font-black uppercase tracking-tight text-[var(--color-bg)] leading-[0.9] mb-10">
            One System.<br />Eight Specialists.<br />Three Answers.
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="group px-12 py-5 bg-[var(--color-bg)] text-[var(--color-accent)] text-sm font-black tracking-[0.2em] uppercase hover:bg-[var(--color-bg)]/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            Get Started →
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────── */}
      <footer className="py-8 px-8 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[var(--color-accent)] rounded-sm flex items-center justify-center">
            <span className="text-[var(--color-bg)] text-[9px] font-black">MT</span>
          </div>
          <span className="text-[var(--color-text)] text-xs font-bold tracking-[0.2em] uppercase">MediTwin AI</span>
        </div>
        <p className="text-[var(--color-text-subtle)] text-xs tracking-wide">
          Agents Assemble · Healthcare AI Endgame Challenge · Tayyab Hussain
        </p>
        <p className="text-[var(--color-text-subtle)] text-xs">
          AI-generated clinical outputs require physician review.
        </p>
      </footer>

      {/* ── GLOBAL KEYFRAMES ────────────────────── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes gridShift {
          0%   { background-position: 0   0;   }
          100% { background-position: 60px 60px; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1);    opacity: 0.04; }
          50%       { transform: scale(1.15); opacity: 0.06; }
        }
        @keyframes sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%);  }
        }
      `}</style>
    </div>
  );
}