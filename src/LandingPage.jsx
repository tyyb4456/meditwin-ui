import { useState, useEffect, useRef } from "react";
import {
  User, Microscope, FlaskConical, Pill, Scan, BarChart2, Scale, FileText,
} from "lucide-react";

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
  { label: "LLM Reasoning", val: "GPT-4o-mini / Claude Haiku" },
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
    <div className="min-h-screen bg-[#F5F5F8] font-sans overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#F5F5F8]/90 backdrop-blur-sm border-b border-[#3D3A5C]/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3D3A5C] rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-black tracking-tighter">MT</span>
          </div>
          <span className="text-[#3D3A5C] text-sm font-bold tracking-[0.2em] uppercase">MediTwin AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.15em] uppercase">
          {[["agents", "Agents", "agents-section"], ["pipeline", "Pipeline", "how-section"], ["stack", "Stack", "stack-section"]].map(([key, label, id]) => (
            <button
              key={key}
              onClick={() => scrollToSection(id, key)}
              className={`transition-colors pb-0.5 border-b-2 ${activeNav === key ? "text-[#3D3A5C] border-[#3D3A5C]" : "text-[#3D3A5C]/50 border-transparent hover:text-[#3D3A5C]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="px-5 py-2 border border-[#3D3A5C] text-[#3D3A5C] text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#3D3A5C] hover:text-white transition-all duration-300">
          Launch Demo
        </button>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-8 min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#3D3A5C 1px, transparent 1px), linear-gradient(90deg, #3D3A5C 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#3D3A5C]/5 rounded-full blur-3xl pointer-events-none" />

        <div
          className="max-w-6xl mx-auto w-full"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        >
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 border border-[#3D3A5C]/20 bg-[#3D3A5C]/5">
            <span className="w-2 h-2 bg-[#3D3A5C] rounded-full animate-pulse" />
            <span className="text-[#3D3A5C] text-xs font-bold tracking-[0.2em] uppercase">Agents Assemble · Healthcare AI Hackathon</span>
          </div>

          <h1 className="text-[clamp(52px,9vw,120px)] font-black leading-[0.9] tracking-[-0.02em] uppercase text-[#3D3A5C] mb-6">
            Medi<br />
            <span className="text-[#F5F5F8] [-webkit-text-stroke:2px_#3D3A5C]">Twin</span>
            <span className="text-[#3D3A5C]"> AI</span>
          </h1>

          <p className="max-w-xl text-[#3D3A5C]/70 text-lg font-medium mb-4 leading-relaxed">
            A multi-agent clinical decision support system that mirrors how real clinical teams work — eight specialists, one unified output.
          </p>
          <p className="text-[#3D3A5C]/40 text-sm font-bold tracking-[0.2em] uppercase mb-12 italic">
            "What is happening? What will happen next? What should we do?"
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="group relative px-10 py-4 bg-[#3D3A5C] text-white text-sm font-black tracking-[0.2em] uppercase overflow-hidden hover:scale-[1.02] transition-transform duration-300">
              <span className="relative z-10">Get Started →</span>
              <div className="absolute inset-0 bg-[#2E2B4A] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
            <button
              onClick={() => scrollToSection("how-section", "pipeline")}
              className="px-10 py-4 border-2 border-[#3D3A5C] text-[#3D3A5C] text-sm font-black tracking-[0.2em] uppercase hover:bg-[#3D3A5C]/5 transition-all duration-300"
            >
              View Pipeline
            </button>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-12 gap-y-6 border-t border-[#3D3A5C]/10 pt-10">
            {[["8", "Specialist Agents"], ["3", "Core Questions"], ["< 12s", "End-to-End Latency"], ["FHIR R4", "Standards Compliant"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-[#3D3A5C] text-2xl font-black tracking-tight">{val}</p>
                <p className="text-[#3D3A5C]/50 text-xs font-bold tracking-[0.15em] uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE QUESTIONS */}
      <section className="bg-[#3D3A5C] py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-8">The Three Clinical Questions</p>
          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            {questions.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSelectQ(i)}
                className={`p-8 text-left transition-all duration-300 ${activeQ === i ? "bg-white/10" : "bg-transparent hover:bg-white/5"}`}
              >
                <div className={`w-full h-0.5 mb-4 transition-all duration-300 ${activeQ === i ? "bg-white" : "bg-transparent"}`} />
                <p className="text-white text-xl font-black uppercase tracking-tight mb-3">{item.q}</p>
                <p className="text-white/50 text-xs font-bold tracking-[0.15em] uppercase">{item.agents}</p>
              </button>
            ))}
          </div>
          <div className="mt-px bg-white/5 px-8 py-5 min-h-18 transition-all duration-300">
            <p className="text-white/70 text-sm leading-relaxed max-w-3xl">{questions[activeQ].detail}</p>
          </div>
        </div>
      </section>

      {/* AGENTS GRID */}
      <section id="agents-section" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#3D3A5C]/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">The Team</p>
              <h2 className="text-5xl font-black uppercase tracking-tight text-[#3D3A5C]">8 Specialist<br />Agents</h2>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="px-3 py-1 bg-[#3D3A5C] text-white text-xs font-bold">A2A</span>
              <span className="text-[#3D3A5C]/40 text-xs">Agent-to-Agent</span>
              <span className="px-3 py-1 border border-[#3D3A5C] text-[#3D3A5C] text-xs font-bold ml-3">MCP</span>
              <span className="text-[#3D3A5C]/40 text-xs">MCP Server</span>
            </div>
          </div>
          <p className="text-[#3D3A5C]/40 text-xs mb-10">Click any agent to inspect its inputs, outputs, and tech.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#3D3A5C]/10">
            {agents.map((agent, i) => {
              const IconComponent = agent.icon;
              const isSelected = selectedAgent === i;
              return (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(i)}
                  className={`group text-left p-6 transition-all duration-300 cursor-pointer relative ${isSelected ? "bg-[#3D3A5C]" : "bg-[#F5F5F8] hover:bg-[#3D3A5C]"}`}
                >
                  {isSelected && <div className="absolute top-0 left-0 right-0 h-0.5 bg-white" />}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-9 h-9 rounded-sm flex items-center justify-center transition-colors duration-300 ${isSelected ? "bg-white/15" : "bg-[#3D3A5C]/10 group-hover:bg-white/15"}`}>
                      <IconComponent size={18} className={`transition-colors duration-300 ${isSelected ? "text-white" : "text-[#3D3A5C] group-hover:text-white"}`} strokeWidth={1.75} />
                    </div>
                    <span className={`text-xs font-bold tracking-widest px-2 py-1 transition-all duration-300 ${
                      agent.tag === "MCP"
                        ? isSelected ? "border border-white text-white" : "border border-[#3D3A5C] text-[#3D3A5C] group-hover:border-white group-hover:text-white"
                        : isSelected ? "bg-white text-[#3D3A5C]" : "bg-[#3D3A5C] text-white group-hover:bg-white group-hover:text-[#3D3A5C]"
                    }`}>
                      {agent.tag}
                    </span>
                  </div>
                  <p className={`text-xs font-bold tracking-[0.15em] uppercase mb-1 transition-colors duration-300 ${isSelected ? "text-white/50" : "text-[#3D3A5C]/40 group-hover:text-white/50"}`}>
                    Agent {String(agent.id).padStart(2, "0")}
                  </p>
                  <h3 className={`text-base font-black uppercase tracking-tight mb-2 transition-colors duration-300 ${isSelected ? "text-white" : "text-[#3D3A5C] group-hover:text-white"}`}>
                    {agent.name}
                  </h3>
                  <p className={`text-xs leading-relaxed transition-colors duration-300 ${isSelected ? "text-white/60" : "text-[#3D3A5C]/50 group-hover:text-white/60"}`}>
                    {agent.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Agent Detail Panel */}
          <div className={`border border-[#3D3A5C]/10 border-t-0 bg-[#3D3A5C]/5 transition-all duration-300 overflow-hidden ${selectedAgent !== null ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            {selectedAgent !== null && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#3D3A5C]">
                    Agent {String(agents[selectedAgent].id).padStart(2, "0")} — {agents[selectedAgent].name}
                  </h3>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-xs text-[#3D3A5C]/50 hover:text-[#3D3A5C] border border-[#3D3A5C]/20 px-3 py-1 transition-colors"
                  >
                    Close ×
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    ["Input", agents[selectedAgent].input],
                    ["Output", agents[selectedAgent].output],
                    ["Tech", agents[selectedAgent].tech],
                    ["Note", agents[selectedAgent].note],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#3D3A5C]/40 mb-2">{label}</p>
                      <p className="text-sm text-[#3D3A5C]/80 leading-relaxed">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-section" className="py-24 px-8 bg-[#3D3A5C]/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#3D3A5C]/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Workflow</p>
          <h2 className="text-5xl font-black uppercase tracking-tight text-[#3D3A5C] mb-4">Pipeline</h2>
          <p className="text-[#3D3A5C]/40 text-xs mb-10">Click a step to highlight.</p>

          <div className="space-y-px">
            {steps.map((step, i) => (
              <button
                key={step.n}
                onClick={() => handleSelectStep(i)}
                className={`w-full text-left flex gap-8 p-8 border-l-4 transition-all duration-300 cursor-pointer ${
                  activeStep === i
                    ? "bg-white border-[#3D3A5C]"
                    : "bg-[#F5F5F8] border-transparent hover:border-[#3D3A5C]/30 hover:bg-white"
                }`}
              >
                <p className={`text-5xl font-black shrink-0 leading-none transition-colors duration-300 ${activeStep === i ? "text-[#3D3A5C]/20" : "text-[#3D3A5C]/10"}`}>
                  {step.n}
                </p>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#3D3A5C] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#3D3A5C]/60 leading-relaxed max-w-xl mb-3">{step.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        className={`text-xs px-2 py-1 font-bold tracking-wide transition-all duration-300 ${
                          activeStep === i
                            ? "bg-[#3D3A5C] text-white"
                            : "bg-[#3D3A5C]/10 text-[#3D3A5C]/60"
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
          <p className="text-[#3D3A5C]/40 text-xs font-bold tracking-[0.3em] uppercase mb-3">Technology</p>
          <h2 className="text-5xl font-black uppercase tracking-tight text-[#3D3A5C] mb-16">Stack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#3D3A5C]/10">
            {stack.map((item) => (
              <div key={item.label} className="bg-[#F5F5F8] p-6 hover:bg-white transition-colors duration-200 group">
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#3D3A5C]/40 mb-2">{item.label}</p>
                <p className="text-base font-black text-[#3D3A5C] group-hover:translate-x-1 transition-transform duration-200">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 bg-[#3D3A5C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-6xl mx-auto relative">
          <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-4">Ready to Begin</p>
          <h2 className="text-[clamp(36px,6vw,80px)] font-black uppercase tracking-tight text-white leading-[0.9] mb-10">
            One System.<br />Eight Specialists.<br />Three Answers.
          </h2>
          <button className="group px-12 py-5 bg-white text-[#3D3A5C] text-sm font-black tracking-[0.2em] uppercase hover:bg-[#F5F5F8] transition-all duration-300 hover:scale-[1.02]">
            Get Started →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-8 border-t border-[#3D3A5C]/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#3D3A5C] rounded-sm flex items-center justify-center">
            <span className="text-white text-[9px] font-black">MT</span>
          </div>
          <span className="text-[#3D3A5C] text-xs font-bold tracking-[0.2em] uppercase">MediTwin AI</span>
        </div>
        <p className="text-[#3D3A5C]/30 text-xs tracking-wide">Agents Assemble · Healthcare AI Endgame Challenge · Tayyab Hussain</p>
        <p className="text-[#3D3A5C]/30 text-xs">AI-generated clinical outputs require physician review.</p>
      </footer>
    </div>
  );
}