import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Microscope, FlaskConical, Pill, Scan, BarChart2, Scale, FileText,
  Activity, CheckCircle2, Zap, Shield, Brain, ChevronRight, ArrowRight,
} from "lucide-react";
import ThemeToggle from "./components/theme/ThemeToggle";
import { useTheme } from "./components/theme/ThemeContext";

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

function useCounter(target, active, ms = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const n = parseInt(target, 10);
    if (isNaN(n)) return;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / ms, 1);
      setVal(Math.round(n * (1 - (1 - p) ** 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, ms]);
  return val;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}


const agents = [
  { id: 1, name: "Patient Context", icon: User, desc: "FHIR R4 data ingestion & normalisation", tag: "A2A", input: "Patient ID + SHARP context headers", output: "Normalized FHIR R4 resource bundle", tech: "httpx async + fhirclient", note: "Injects context into all downstream agents via A2A headers." },
  { id: 2, name: "Diagnosis", icon: Microscope, desc: "RAG-based differential diagnosis engine", tag: "A2A", input: "Symptoms, history, lab flags", output: "Ranked differential diagnoses (top 5)", tech: "LangChain + ChromaDB", note: "Retrieves from medical knowledge base; runs concurrently with Lab Analysis." },
  { id: 3, name: "Lab Analysis", icon: FlaskConical, desc: "Abnormality detection via rules engine", tag: "A2A", input: "Lab result values + reference ranges", output: "Flagged abnormalities + severity scores", tech: "Rules engine + LLM reasoning", note: "Parallel execution with Diagnosis via asyncio.gather()." },
  { id: 4, name: "Drug Safety", icon: Pill, desc: "FDA API — interactions & contraindications", tag: "MCP", input: "Current medications + proposed treatment", output: "Interaction warnings + severity grades", tech: "FDA OpenFDA API via MCP server", note: "Only external MCP-served agent; handles live drug database lookups." },
  { id: 5, name: "Imaging Triage", icon: Scan, desc: "CNN-based chest X-ray analysis", tag: "A2A", input: "Chest X-ray DICOM/JPEG attachment", output: "Pathology classification + confidence", tech: "TensorFlow / Keras CNN", note: "Activates conditionally — only fires if imaging is attached to the patient record." },
  { id: 6, name: "Digital Twin", icon: BarChart2, desc: "XGBoost outcome simulation & what-if", tag: "A2A", input: "Patient features + proposed treatments", output: "3 scenario outcome distributions", tech: "XGBoost risk model", note: "Simulates three treatment paths and returns probability distributions per scenario." },
  { id: 7, name: "Consensus", icon: Scale, desc: "Conflict detection & arbitration", tag: "A2A", input: "All specialist agent outputs", output: "Unified recommendation or escalation flag", tech: "LangGraph state + LLM arbiter", note: "Escalates to human clinician if confidence < threshold or agents disagree sharply." },
  { id: 8, name: "Explanation", icon: FileText, desc: "SOAP note + FHIR Bundle generation", tag: "A2A", input: "Consensus output", output: "SOAP note, FHIR Bundle, patient summary", tech: "Gemini-2.5-Flash", note: "Generates three output formats: clinician SOAP, structured FHIR, plain-language patient summary." },
];

const steps = [
  { n: "01", title: "Patient Input", desc: "Clinician submits a patient ID. SHARP context is injected via A2A headers. The Orchestrator initialises the LangGraph state.", chips: ["Orchestrator", "Patient Context Agent"] },
  { n: "02", title: "Parallel Analysis", desc: "Patient Context fetches FHIR R4 resources. Diagnosis and Lab Analysis agents run concurrently via asyncio.gather().", chips: ["Diagnosis Agent", "Lab Analysis Agent", "asyncio.gather()"] },
  { n: "03", title: "Specialist Review", desc: "Imaging Triage fires if an X-ray is attached. Drug Safety MCP flags interactions. Digital Twin simulates three treatment paths.", chips: ["Imaging Triage", "Drug Safety MCP", "Digital Twin"] },
  { n: "04", title: "Consensus & Output", desc: "Consensus Agent resolves conflicts or escalates. Explanation Agent generates SOAP note, FHIR Bundle, and patient summary.", chips: ["Consensus Agent", "Explanation Agent", "SOAP · FHIR · Summary"] },
];

const stack = [
  { label: "Graph Orchestration", val: "LangGraph" },
  { label: "LLM Reasoning", val: "Gemini Flash 2.5" },
  { label: "RAG Pipeline", val: "LangChain + ChromaDB" },
  { label: "Medical Imaging", val: "TensorFlow / Keras CNN" },
  { label: "Risk Modeling", val: "XGBoost" },
  { label: "FHIR Client", val: "httpx async + fhirclient" },
  { label: "Caching", val: "Redis" },
  { label: "API Framework", val: "FastAPI" },
  { label: "Deployment", val: "Docker Compose" },
];

const features = [
  { icon: Zap, title: "Parallel Execution", desc: "Diagnosis, Lab Analysis, and Imaging Triage run concurrently via asyncio.gather() — no serial bottlenecks." },
  { icon: Shield, title: "FHIR R4 Compliant", desc: "Full FHIR R4 resource ingestion via httpx async client. Normalized PatientState shared across all agents." },
  { icon: Brain, title: "Consensus-Driven", desc: "LangGraph state machine arbitrates disagreements and escalates to clinicians when confidence falls below threshold." },
  { icon: Activity, title: "Real-Time SSE", desc: "Every agent streams progress via Server-Sent Events. Watch the pipeline execute live, step by step." },
];

/* ── Hero floating cards ─────────────────────────────────── */
function LiveAnalysisCard() {
  const agentStatuses = [
    { name: "Patient Context", done: true },
    { name: "Diagnosis", done: true },
    { name: "Lab Analysis", done: true },
    { name: "Drug Safety", active: true },
    { name: "Imaging Triage", pending: true },
    { name: "Digital Twin", pending: true },
  ];
  return (
    <div style={{
      background: "rgba(22, 20, 48, 0.95)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(129,140,248,0.25)", borderRadius: 14, padding: "16px 18px",
      minWidth: 240, boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
      animation: "float-card 5s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#818CF8", animation: "pulse-dot 2s infinite" }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#818CF8" }}>
          Live Analysis
        </span>
      </div>
      {agentStatuses.map(a => (
        <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: a.done ? "rgba(238,240,255,0.7)" : a.active ? "#EEF0FF" : "rgba(238,240,255,0.35)", fontWeight: a.active ? 600 : 400 }}>
            {a.name}
          </span>
          {a.done && <CheckCircle2 size={13} style={{ color: "#818CF8" }} />}
          {a.active && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 48, height: 3, background: "rgba(129,140,248,0.2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: "62%", height: "100%", background: "#818CF8", borderRadius: 2, animation: "progress-run 1.8s ease-in-out infinite" }} />
              </div>
            </div>
          )}
          {a.pending && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(238,240,255,0.12)", display: "inline-block" }} />}
        </div>
      ))}
    </div>
  );
}

function PatientCard() {
  return (
    <div style={{
      background: "rgba(30, 28, 58, 0.95)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(129,140,248,0.15)", borderRadius: 14, padding: "14px 16px",
      minWidth: 200, boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
      animation: "float-card 5s ease-in-out infinite 1.5s",
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(238,240,255,0.45)", marginBottom: 10 }}>
        Agent Output
      </p>
      {[
        { label: "Diagnosis", val: "Confirmed", color: "#818CF8" },
        { label: "Lab Flags", val: "3 Abnormal", color: "#F59E0B" },
        { label: "Drug Safety", val: "1 Warning", color: "#EF4444" },
      ].map(row => (
        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(238,240,255,0.6)", fontWeight: 400 }}>{row.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.val}</span>
        </div>
      ))}
      <div style={{
        marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(129,140,248,0.12)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#818CF8" }}>
          SOAP Note generated ✓
        </span>
      </div>
    </div>
  );
}

/* ── Stat item ────────────────────────────────────────────── */
function StatItem({ val, label, active, delay = 0 }) {
  const n = parseInt(val, 10);
  const counted = useCounter(n, active);
  const isNumeric = !isNaN(n);
  return (
    <div style={{
      opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      <p style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
        {isNumeric ? counted : val}
      </p>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginTop: 5 }}>
        {label}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const width = useWindowWidth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [heroVisible, setHeroVisible] = useState(false);
  const [activeQ, setActiveQ] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [activeNav, setActiveNav] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const qTimerRef = useRef(null);

  const [statsRef, statsOn] = useReveal(0.2);
  const [featRef, featOn] = useReveal(0.1);
  const [agentsRef, agentsOn] = useReveal(0.05);
  const [pipeRef, pipeOn] = useReveal(0.05);
  const [stackRef, stackOn] = useReveal(0.05);
  const [imagingRef, imagingOn] = useReveal(0.1);
  const [twinRef, twinOn] = useReveal(0.1);
  const [ctaRef, ctaOn] = useReveal(0.2);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    qTimerRef.current = setInterval(() => setActiveQ(p => (p + 1) % 3), 4500);
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(total > 0 ? (doc.scrollTop || document.body.scrollTop) / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); clearInterval(qTimerRef.current); window.removeEventListener("scroll", onScroll); };
  }, []);

  const scrollTo = (id, nav) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(nav);
  };

  /* ── HERO BG — respects theme ────────────────────────────── */
  const heroBg = isDark
    ? "linear-gradient(135deg, #08061A 0%, #0E0C28 40%, #13113A 70%, #08061A 100%)"
    : "linear-gradient(135deg, #f5f4ff 0%, #ede9fe 40%, #f5f4ff 70%, #eef2ff 100%)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", overflowX: "hidden" }}>

      {/* Scroll progress */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        height: 2, background: "var(--color-accent)",
        transformOrigin: "left", transform: `scaleX(${scrollProgress})`,
        transition: "transform 0.1s linear",
      }} />

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 64,
        background: isDark ? "rgba(8,6,26,0.9)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${isDark ? "rgba(129,140,248,0.12)" : "var(--color-border)"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={16} strokeWidth={2.2} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
            Medi<span style={{ color: "var(--color-accent)" }}>Twin</span> AI
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[["Agents", "agents-section", "agents"], ["Pipeline", "pipeline-section", "pipeline"], ["Stack", "stack-section", "stack"]].map(([label, id, key]) => (
            <button
              key={key}
              onClick={() => scrollTo(id, key)}
              style={{
                border: "none", cursor: "pointer",
                padding: "6px 14px", borderRadius: 20,
                fontSize: 13, fontWeight: 500, letterSpacing: "0.01em",
                color: activeNav === key ? "var(--color-text)" : "var(--color-text-muted)",
                background: activeNav === key ? "var(--color-accent-dim)" : "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface-2)"; e.currentTarget.style.color = "var(--color-text)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = activeNav === key ? "var(--color-accent-dim)" : "transparent"; e.currentTarget.style.color = activeNav === key ? "var(--color-text)" : "var(--color-text-muted)"; }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "9px 22px", background: "var(--color-accent)", color: "#fff",
              border: "none", borderRadius: 24, fontSize: 13, fontWeight: 600, letterSpacing: "0.01em",
              transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

 {/* ══════════════════════════════════════════
    HERO
══════════════════════════════════════════ */}
<section style={{
  background: heroBg, minHeight: "100vh", position: "relative",
  overflow: "hidden", display: "flex", alignItems: "center", paddingTop: 64,
}}>

  {/* Animated grid overlay */}
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: "linear-gradient(rgba(129,140,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.05) 1px, transparent 1px)",
    backgroundSize: "64px 64px", animation: "gridShift 28s linear infinite",
  }} />

  {/* Radial glow */}
  <div style={{
    position: "absolute", top: "20%", right: "15%", width: 500, height: 500,
    borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)",
    pointerEvents: "none", animation: "glow-pulse 6s ease-in-out infinite",
  }} />

  <div style={{
    maxWidth: 1200, margin: "0 auto", width: "100%",
    // ↓ Responsive padding: tighter on mobile
    padding: width < 640 ? "60px 20px 48px" : width < 1024 ? "70px 32px 60px" : "80px 40px",
    // ↓ Single column on mobile/tablet, two columns on desktop
    display: "grid",
    gridTemplateColumns: width < 1024 ? "1fr" : "1fr 1fr",
    gap: width < 1024 ? 40 : 60,
    alignItems: "center",
    position: "relative", zIndex: 1,
    opacity: heroVisible ? 1 : 0,
    transform: heroVisible ? "translateY(0)" : "translateY(28px)",
    transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
  }}>

    {/* LEFT — text */}
    <div>
      {/* Pills */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28,
        animation: "fadeSlideUp 0.8s 0.1s both",
        // ↓ Center pills on mobile
        justifyContent: width < 1024 ? "center" : "flex-start",
      }}>
        {["✦ Multi-Agent", "✦ FHIR R4", "✦ Real-Time SSE"].map(p => (
          <span key={p} style={{
            padding: "5px 14px", borderRadius: 20,
            border: "1px solid rgba(129,140,248,0.3)",
            background: "var(--color-accent-dim)",
            fontSize: 12, fontWeight: 500, color: "var(--color-text-muted)",
          }}>
            {p}
          </span>
        ))}
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: "clamp(36px,6vw,72px)", fontWeight: 700, lineHeight: 1.05,
        letterSpacing: "-0.035em", color: "var(--color-text)", marginBottom: 20,
        animation: "fadeSlideUp 0.9s 0.18s both",
        // ↓ Center text on mobile
        textAlign: width < 1024 ? "center" : "left",
      }}>
        Clinical AI That<br />
        Thinks Like a<br />
        <span style={{ color: "var(--color-accent)" }}>Medical Team</span>
      </h1>

      {/* Subtext */}
      <p style={{
        fontSize: 16, fontWeight: 400, lineHeight: 1.65, color: "var(--color-text-muted)",
        // ↓ Full width + centered on mobile
        maxWidth: width < 1024 ? "100%" : 460,
        marginBottom: 36,
        animation: "fadeSlideUp 0.9s 0.28s both",
        textAlign: width < 1024 ? "center" : "left",
      }}>
        Eight specialist AI agents — from FHIR data ingestion to consensus diagnosis — working
        in parallel to give every clinician a team of experts.
      </p>

      {/* CTAs */}
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap",
        animation: "fadeSlideUp 0.9s 0.38s both",
        // ↓ Center buttons on mobile
        justifyContent: width < 1024 ? "center" : "flex-start",
      }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "13px 28px", background: "var(--color-accent)", color: "#fff",
            border: "none", borderRadius: 26, fontSize: 14, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.22s ease",
            // ↓ Full width on small mobile
            width: width < 480 ? "100%" : "auto",
            justifyContent: "center",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          Launch Demo <ArrowRight size={16} />
        </button>
        <button
          onClick={() => scrollTo("pipeline-section", "pipeline")}
          style={{
            padding: "13px 28px", background: "var(--color-surface)", color: "var(--color-text-muted)",
            border: "1px solid var(--color-border-strong)", borderRadius: 26, fontSize: 14, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.22s ease",
            width: width < 480 ? "100%" : "auto",
            justifyContent: "center",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface-2)"; e.currentTarget.style.borderColor = "var(--color-accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--color-surface)"; e.currentTarget.style.borderColor = "var(--color-border-strong)"; }}
        >
          ▶ View Pipeline
        </button>
      </div>

      {/* Stats */}
      <div ref={statsRef} style={{
        marginTop: 52, paddingTop: 36, borderTop: "1px solid var(--color-border)",
        display: "grid",
        // ↓ 3 cols on tablet+, 3 cols on mobile too but smaller gap
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: width < 480 ? 12 : 24,
      }}>
        {[
          { val: "8", label: "Specialist Agents" },
          { val: "3", label: "Clinical Questions" },
          { val: "FHIR R4", label: "Standards Compliant" },
        ].map(({ val, label }, i) => (
          <StatItem key={label} val={val} label={label} active={statsOn} delay={i * 110} />
        ))}
      </div>
    </div>

    {/* RIGHT — desktop: side-by-side with full floating cards */}
    {width >= 1024 && (
      <div style={{ position: "relative", height: 520 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(129,140,248,0.2)",
          boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.6)" : "0 24px 64px rgba(129,140,248,0.15)",
        }}>
          <img
            src="/hero-doctor.png" alt="Clinical AI"
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              objectPosition: "center top",
              filter: isDark ? "brightness(0.55) saturate(0.8)" : "brightness(0.85) saturate(0.9)",
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: isDark
              ? "linear-gradient(to bottom, transparent 40%, rgba(8,6,26,0.85) 100%)"
              : "linear-gradient(to bottom, transparent 40%, rgba(245,244,255,0.75) 100%)",
          }} />
        </div>
        <div style={{ position: "absolute", top: 24, right: -20, zIndex: 10, animation: "fadeSlideRight 0.8s 0.6s both" }}>
          <LiveAnalysisCard />
        </div>
        <div style={{ position: "absolute", bottom: 32, left: -16, zIndex: 10, animation: "fadeSlideUp 0.8s 0.8s both" }}>
          <PatientCard />
        </div>
      </div>
    )}

    {/* RIGHT — tablet: full-height image with scaled-down cards inside */}
    {width >= 640 && width < 1024 && (
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        minHeight: 340,
        borderRadius: 18, overflow: "hidden",
        border: "1px solid rgba(129,140,248,0.2)",
        boxShadow: isDark ? "0 20px 56px rgba(0,0,0,0.55)" : "0 20px 56px rgba(129,140,248,0.14)",
      }}>
        <img
          src="/hero-doctor.png" alt="Clinical AI"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            filter: isDark ? "brightness(0.55) saturate(0.8)" : "brightness(0.85) saturate(0.9)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: isDark
            ? "linear-gradient(to bottom, transparent 30%, rgba(8,6,26,0.7) 100%)"
            : "linear-gradient(to bottom, transparent 30%, rgba(245,244,255,0.6) 100%)",
        }} />
        <div style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          transform: "scale(0.78)", transformOrigin: "top right",
        }}>
          <LiveAnalysisCard />
        </div>
        <div style={{
          position: "absolute", bottom: 14, left: 14, zIndex: 10,
          transform: "scale(0.78)", transformOrigin: "bottom left",
        }}>
          <PatientCard />
        </div>
      </div>
    )}

    {/* RIGHT — mobile: full-width image, no floating cards */}
    {width < 640 && (
      <div style={{
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: 16, overflow: "hidden",
        border: "1px solid rgba(129,140,248,0.2)",
        boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 16px 48px rgba(129,140,248,0.12)",
        position: "relative",
      }}>
        <img
          src="/hero-doctor.png" alt="Clinical AI"
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            filter: isDark ? "brightness(0.6) saturate(0.8)" : "brightness(0.88) saturate(0.9)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: isDark
            ? "linear-gradient(to bottom, transparent 40%, rgba(8,6,26,0.7) 100%)"
            : "linear-gradient(to bottom, transparent 40%, rgba(245,244,255,0.55) 100%)",
        }} />
      </div>
    )}
  </div>

  {/* Bottom fade into next section */}
  <div style={{
    position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
    background: "linear-gradient(to bottom, transparent, var(--color-bg))",
    pointerEvents: "none",
  }} />
</section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section ref={featRef} style={{ padding: "96px 40px", background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            textAlign: "center", marginBottom: 56,
            opacity: featOn ? 1 : 0, transform: featOn ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 12 }}>
              Why MediTwin
            </p>
            <h2 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1.1 }}>
              Built for clinical speed<br />and accuracy
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{
                    background: "var(--color-surface)", border: "1px solid var(--color-border)",
                    borderRadius: 14, padding: "28px 24px",
                    opacity: featOn ? 1 : 0, transform: featOn ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.5s ease ${i * 80 + 100}ms, transform 0.5s ease ${i * 80 + 100}ms`,
                    cursor: "default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: "var(--color-accent-dim)",
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
                  }}>
                    <Icon size={18} strokeWidth={1.75} style={{ color: "var(--color-accent)" }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 8, letterSpacing: "-0.01em" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, fontWeight: 400 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          THREE CLINICAL QUESTIONS — accent strip
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 40px", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 16 }}>
            The Three Clinical Questions
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 1, background: "var(--color-border)", borderRadius: 14, overflow: "hidden" }}>
            {[
              { n: "01", q: "What is happening?", agents: "Diagnosis · Lab · Imaging", detail: "Diagnosis, Lab Analysis, and Imaging Triage agents work in parallel via asyncio.gather()." },
              { n: "02", q: "What will happen next?", agents: "Digital Twin", detail: "Digital Twin simulates three treatment scenarios using XGBoost, returning probability distributions." },
              { n: "03", q: "What should we do?", agents: "Drug Safety · Consensus", detail: "Drug Safety MCP flags interactions, Consensus arbitrates, Orchestrator escalates if confidence drops." },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: activeQ === i ? "var(--color-accent-dim)" : "var(--color-surface)",
                  padding: "32px 28px", cursor: "pointer", transition: "background 0.25s ease",
                  borderLeft: activeQ === i ? `3px solid var(--color-accent)` : "3px solid transparent",
                }}
                onClick={() => setActiveQ(activeQ === i ? -1 : i)}
                onMouseEnter={e => { if (activeQ !== i) e.currentTarget.style.background = "var(--color-bg)"; }}
                onMouseLeave={e => { if (activeQ !== i) e.currentTarget.style.background = "var(--color-surface)"; }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: 10 }}>{item.n}</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.2 }}>{item.q}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {item.agents.split(" · ").map(ag => (
                    <span key={ag} style={{
                      fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                      background: "var(--color-accent-dim)", color: "var(--color-accent)",
                      letterSpacing: "0.06em",
                    }}>{ag}</span>
                  ))}
                </div>
                {activeQ === i && (
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.65, fontWeight: 400 }}>{item.detail}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          AGENTS GRID
      ══════════════════════════════════════════ */}
      <section id="agents-section" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div ref={agentsRef} style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40,
            opacity: agentsOn ? 1 : 0, transform: agentsOn ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 10 }}>The Team</p>
              <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1 }}>
                8 Specialist Agents
              </h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ padding: "4px 12px", borderRadius: 20, background: "var(--color-accent)", color: "#fff", fontSize: 11, fontWeight: 700 }}>A2A</span>
              <span style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid var(--color-accent)", color: "var(--color-accent)", fontSize: 11, fontWeight: 700 }}>MCP</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent === i;
              return (
                <div key={agent.id} style={{
                  opacity: agentsOn ? 1 : 0, transform: agentsOn ? "translateX(0)" : "translateX(-14px)",
                  transition: `opacity 0.5s ease ${i * 50 + 100}ms, transform 0.5s ease ${i * 50 + 100}ms`,
                }}>
                  <button
                    onClick={() => setSelectedAgent(p => p === i ? null : i)}
                    style={{
                      width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 16, padding: "16px 22px",
                      background: isSelected ? "var(--color-accent-dim)" : "var(--color-surface)",
                      borderRadius: isSelected ? "12px 12px 0 0" : 12,
                      border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                      borderBottom: isSelected ? "none" : `1px solid var(--color-border)`,
                      transition: "all 0.22s ease",
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = "var(--color-surface-2)"; e.currentTarget.style.borderColor = "var(--color-border-strong)"; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = "var(--color-surface)"; e.currentTarget.style.borderColor = "var(--color-border)"; } }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, minWidth: 24, color: "var(--color-text-subtle)", fontVariantNumeric: "tabular-nums" }}>
                      {String(agent.id).padStart(2, "0")}
                    </span>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: isSelected ? "rgba(99,102,241,0.25)" : "var(--color-accent-dim)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.22s",
                    }}>
                      <Icon size={15} strokeWidth={1.75} style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.01em" }}>{agent.name}</h3>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.1em",
                          background: agent.tag === "MCP" ? "transparent" : "var(--color-accent)",
                          border: agent.tag === "MCP" ? "1px solid var(--color-accent)" : "none",
                          color: agent.tag === "MCP" ? "var(--color-accent)" : "#fff",
                        }}>{agent.tag}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 400 }}>{agent.desc}</p>
                    </div>
                    <ChevronRight size={14} style={{
                      color: "var(--color-text-subtle)", transition: "transform 0.25s ease",
                      transform: isSelected ? "rotate(90deg)" : "rotate(0deg)",
                    }} />
                  </button>

                  {isSelected && (
                    <div style={{
                      background: "var(--color-surface-2)",
                      border: `1px solid var(--color-accent)`, borderTop: "none",
                      borderRadius: "0 0 12px 12px", padding: "20px 22px",
                      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20,
                    }}>
                      {[["Input", agent.input], ["Output", agent.output], ["Tech", agent.tech], ["Note", agent.note]].map(([label, val]) => (
                        <div key={label}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 6 }}>{label}</p>
                          <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55, fontWeight: 400 }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PIPELINE
      ══════════════════════════════════════════ */}
      <section id="pipeline-section" style={{ padding: "96px 40px", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div ref={pipeRef} style={{
            opacity: pipeOn ? 1 : 0, transform: pipeOn ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.6s ease, transform 0.6s ease", marginBottom: 48,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 10 }}>Workflow</p>
            <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1 }}>
              The Pipeline
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {steps.map((step, i) => {
              const isActive = activeStep === i;
              return (
                <div key={step.n} style={{
                  opacity: pipeOn ? 1 : 0, transform: pipeOn ? "translateX(0)" : "translateX(-16px)",
                  transition: `opacity 0.5s ease ${i * 90 + 150}ms, transform 0.5s ease ${i * 90 + 150}ms`,
                }}>
                  <button
                    onClick={() => setActiveStep(p => p === i ? null : i)}
                    style={{
                      width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "flex-start", gap: 24, padding: "24px 28px",
                      background: isActive ? "var(--color-accent-dim)" : "transparent",
                      borderRadius: 12, borderLeft: `3px solid ${isActive ? "var(--color-accent)" : "transparent"}`,
                      transition: "all 0.22s ease",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--color-bg)"; e.currentTarget.style.borderLeftColor = "var(--color-border-strong)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; } }}
                  >
                    <p style={{
                      fontSize: "clamp(36px,5vw,56px)", fontWeight: 700, flexShrink: 0, lineHeight: 1,
                      letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums",
                      color: isActive ? "var(--color-accent)" : "var(--color-border-strong)",
                      transition: "color 0.22s",
                    }}>{step.n}</p>
                    <div style={{ paddingTop: 4 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text)", marginBottom: 8, letterSpacing: "-0.01em" }}>{step.title}</h3>
                      <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, maxWidth: 560, marginBottom: 14, fontWeight: 400 }}>{step.desc}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {step.chips.map(chip => (
                          <span key={chip} style={{
                            fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                            background: isActive ? "var(--color-accent)" : "var(--color-accent-dim)",
                            color: isActive ? "#fff" : "var(--color-accent)", transition: "all 0.22s",
                          }}>{chip}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════ */}
      <section id="stack-section" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div ref={stackRef} style={{
            opacity: stackOn ? 1 : 0, transform: stackOn ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.6s ease, transform 0.6s ease", marginBottom: 48,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 10 }}>Technology</p>
            <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)", lineHeight: 1 }}>
              The Stack
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 1, background: "var(--color-border)", borderRadius: 14, overflow: "hidden" }}>
            {stack.map((item, j) => (
              <div
                key={item.label}
                style={{
                  background: "var(--color-surface)", padding: "22px 24px", cursor: "default",
                  opacity: stackOn ? 1 : 0, transform: stackOn ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 0.5s ease ${j * 50 + 150}ms, transform 0.5s ease ${j * 50 + 150}ms`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent-dim)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--color-surface)"; }}
              >
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: 7 }}>{item.label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.01em" }}>{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          IMAGING TRIAGE METRICS
      ══════════════════════════════════════════ */}
      <section id="imaging-metrics" style={{ padding: "96px 40px", background: "var(--color-surface)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div ref={imagingRef} style={{ opacity: imagingOn ? 1 : 0, transform: imagingOn ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: 12 }}>Model Performance</p>
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: 16 }}>Imaging Triage</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: 15, fontWeight: 500, marginBottom: 64, maxWidth: 700 }}>
              Chest X-ray pneumonia detection using deep learning CNNs trained on 5,856 images.
              Production model achieves <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>95.5% accuracy</span> and <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>99.2% AUC</span>.
            </p>
          </div>

          {/* Model comparison grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "var(--color-border)" }}>
            {[
              {
                title: "Custom CNN", subtitle: "Baseline Architecture", production: false, delay: 100, metrics: [
                  { label: "Accuracy", value: "94.69%", raw: 0.9469 },
                  { label: "AUC", value: "98.26%", raw: 0.9826 },
                  { label: "Precision", value: "94.29%", raw: 0.9429 },
                  { label: "Recall", value: "98.73%", raw: 0.9873 },
                ]
              },
              {
                title: "EfficientNetB0", subtitle: "Transfer Learning", production: true, delay: 200, metrics: [
                  { label: "Accuracy", value: "95.52%", raw: 0.9552 },
                  { label: "AUC", value: "99.15%", raw: 0.9915 },
                  { label: "Precision", value: "98.55%", raw: 0.9855 },
                  { label: "Recall", value: "95.27%", raw: 0.9527 },
                ]
              },
            ].map((model) => (
              <div
                key={model.title}
                style={{
                  background: "var(--color-bg)", padding: 32, position: "relative",
                  opacity: imagingOn ? 1 : 0, transform: imagingOn ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.6s ease ${model.delay}ms, transform 0.6s ease ${model.delay}ms`,
                  cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent-dim)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--color-bg)"; }}
              >
                {model.production && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    padding: "3px 10px", background: "var(--color-accent)",
                    color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase",
                    borderRadius: 3,
                  }}>PRODUCTION</div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: "var(--color-text)", marginBottom: 6 }}>{model.title}</h3>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)" }}>{model.subtitle}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {model.metrics.map((metric, i) => (
                    <div key={metric.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{metric.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 128, height: 5, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", background: "var(--color-accent)", borderRadius: 3,
                            width: imagingOn ? `${metric.raw * 100}%` : "0%",
                            transition: `width 1s ease ${i * 100 + model.delay + 100}ms`,
                          }} />
                        </div>
                        <span style={{ fontSize: 17, fontWeight: 900, color: "var(--color-text)", fontVariantNumeric: "tabular-nums", minWidth: 72, textAlign: "right" }}>{metric.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DIGITAL TWIN METRICS
      ══════════════════════════════════════════ */}
      <section id="twin-metrics" style={{ padding: "96px 40px", background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div ref={twinRef} style={{ opacity: twinOn ? 1 : 0, transform: twinOn ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--color-text-subtle)", marginBottom: 12 }}>Synthetic Data Training</p>
            <h2 style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", color: "var(--color-text)", marginBottom: 16 }}>Digital Twin Risk Models</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: 15, fontWeight: 500, marginBottom: 64, maxWidth: 700 }}>
              Five XGBoost classifiers trained on <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>8,000 synthetic patient records</span>{" "}
              with 19 clinical features. 80/20 train-test split for outcome prediction.
            </p>
          </div>

          {/* Risk models grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--color-border)" }}>
            {[
              { name: "30-Day Readmission", auc: 0.727, prevalence: "20.3%", delay: 100 },
              { name: "30-Day Mortality", auc: 0.740, prevalence: "9.9%", delay: 150 },
              { name: "Complication Risk", auc: 0.718, prevalence: "10.6%", delay: 200 },
              { name: "90-Day Readmission", auc: 0.737, prevalence: "47.4%", delay: 250 },
              { name: "1-Year Mortality", auc: 0.804, prevalence: "28.5%", delay: 300 },
            ].map((model) => (
              <div
                key={model.name}
                style={{
                  background: "var(--color-bg)", padding: 24, position: "relative", overflow: "hidden",
                  opacity: twinOn ? 1 : 0, transform: twinOn ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.6s ease ${model.delay}ms, transform 0.6s ease ${model.delay}ms`,
                  cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent-dim)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--color-bg)"; }}
              >
                {/* Corner accent */}
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 0, height: 0,
                  borderStyle: "solid", borderWidth: "0 0 20px 20px",
                  borderColor: `transparent transparent var(--color-accent-dim) transparent`,
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{model.name}</h3>
                    <BarChart2 size={18} style={{ color: "var(--color-accent)", opacity: 0.3, flexShrink: 0 }} />
                  </div>
                  <div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)" }}>AUC</span>
                        <span style={{ fontSize: 24, fontWeight: 900, color: "var(--color-text)", fontVariantNumeric: "tabular-nums" }}>{model.auc.toFixed(3)}</span>
                      </div>
                      <div style={{ width: "100%", height: 4, background: "var(--color-border)", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
                        <div style={{
                          height: "100%", background: "var(--color-accent)", borderRadius: 2,
                          width: twinOn ? `${model.auc * 100}%` : "0%",
                          transition: `width 1s ease ${model.delay + 100}ms`,
                        }} />
                      </div>
                    </div>
                    <div style={{ paddingTop: 10, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text-subtle)" }}>Prevalence</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>{model.prevalence}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section ref={ctaRef} style={{ background: isDark ? "linear-gradient(135deg, #08061A 0%, #0E0C28 50%, #08061A 100%)" : "linear-gradient(135deg, #f5f4ff 0%, #ede9fe 50%, #f5f4ff 100%)", padding: "100px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(129,140,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative",
          opacity: ctaOn ? 1 : 0, transform: ctaOn ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 16 }}>
            Ready to Begin
          </p>
          <h2 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 700, letterSpacing: "-0.035em", color: "var(--color-text)", lineHeight: 1.05, marginBottom: 20 }}>
            One System.<br />Eight Specialists.<br />Three Answers.
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.65, marginBottom: 40, fontWeight: 400 }}>
            Give every clinician a multi-specialist AI team that works in seconds, not days.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "15px 36px", background: "var(--color-accent)", color: "#fff",
              border: "none", borderRadius: 28, fontSize: 15, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.22s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--color-accent-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(99,102,241,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--color-accent)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Launch Demo <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{
        background: "var(--color-surface)", padding: "28px 40px",
        borderTop: "1px solid var(--color-border)",
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={14} strokeWidth={2.2} style={{ color: "#fff" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>MediTwin AI</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-subtle)", fontWeight: 400 }}>
          Agents Assemble · Healthcare AI Endgame Challenge · Tayyab Hussain
        </p>
        <p style={{ fontSize: 12, color: "var(--color-text-subtle)", fontWeight: 400 }}>
          AI-generated clinical outputs require physician review.
        </p>
      </footer>

      <style>{`
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeSlideRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes gridShift{0%{background-position:0 0}100%{background-position:64px 64px}}
        @keyframes glow-pulse{0%,100%{opacity:0.06}50%{opacity:0.14}}
        @keyframes float-card{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}
        @keyframes progress-run{0%{width:0%}50%{width:85%}100%{width:60%}}
      `}</style>
    </div>
  );
}