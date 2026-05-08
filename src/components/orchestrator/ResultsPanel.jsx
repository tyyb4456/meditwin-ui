import { BarChart3, FileJson, Copy, Check, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import ClinicalSummaryCard from "./ClinicalSummaryCard";
import DiagnosisCard from "./DiagnosisCard";
import LabCard from "./LabCard";
import DrugSafetyCard from "./DrugSafetyCard";
import DigitalTwinCard from "./DigitalTwinCard";
import SOAPNoteCard from "./SOAPNoteCard";
import PatientExplanationCard from "./PatientExplanationCard";
import RiskAttributionCard from "./RiskAttributionCard";
import MetaCard from "./MetaCard";
import ImagingTriageCard from "./ImagingTriageCard";
import { ACCENT, BORDER, BG, TEXT, MUTED, GREEN, RED, YELLOW, SURFACE, TERMINAL_BG } from "./tokens";

function TabBar({ activeTab, setActiveTab, finalData }) {
    const tabs = [
        { id: "structured", label: "Structured Results", icon: BarChart3 },
        { id: "json",       label: "Raw JSON",           icon: FileJson  },
    ];
    return (
        <div style={{ display: "flex", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                    flex: 1, padding: "10px 0", border: "none",
                    borderBottom: activeTab === id ? `2px solid ${ACCENT}` : "2px solid transparent",
                    background:   activeTab === id ? `${ACCENT}10` : SURFACE,
                    color:        activeTab === id ? ACCENT : MUTED,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: id === "structured" && !finalData ? 0.45 : 1,
                    transition: "all 0.2s",
                }}>
                    <Icon size={13} /> {label}
                    {id === "structured" && !finalData && (
                        <span style={{ fontSize: 8, color: MUTED, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>pending</span>
                    )}
                </button>
            ))}
        </div>
    );
}

function JsonTab({ finalData, streamEvents }) {
    const [copied, setCopied] = useState(false);
    const jsonPayload = finalData ?? (() => {
        for (let i = streamEvents.length - 1; i >= 0; i--) {
            const ev = streamEvents[i];
            if (ev.type === "final" && ev.data) return ev.data;
        }
        return null;
    })();
    if (!jsonPayload) return null;
    const jsonText = JSON.stringify(jsonPayload, null, 2);

    return (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", animation: "fadeIn 0.3s ease" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `${ACCENT}08` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FileJson size={13} color={GREEN} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GREEN }}>
                        {finalData ? "Final Response" : "Partial Agent Outputs"}
                    </span>
                </div>
                <button
                    onClick={() => { navigator.clipboard.writeText(jsonText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{ background: "none", border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
                >
                    {copied ? <Check size={10} color={GREEN} /> : <Copy size={10} />} {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <div style={{ padding: 14, maxHeight: 700, overflowY: "auto", background: TERMINAL_BG }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, color: "#9D9DB8", fontFamily: "monospace", lineHeight: 1.6 }}>
                    {jsonText}
                </pre>
            </div>
        </div>
    );
}

export default function ResultsPanel({ finalData, streamEvents, isStreaming, currentStep, error }) {
    const [activeTab, setActiveTab] = useState("structured");
    const hasResults = isStreaming || streamEvents.length > 0;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {currentStep && (
                <div style={{
                    padding: "10px 16px", borderRadius: 8,
                    background: finalData ? `${GREEN}18` : `${ACCENT}18`,
                    border: `1px solid ${finalData ? GREEN : ACCENT}40`,
                    display: "flex", alignItems: "center", gap: 10,
                }}>
                    {finalData
                        ? <CheckCircle2 size={14} color={GREEN} />
                        : <Loader2 size={14} color={ACCENT} style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />}
                    <span style={{ fontSize: 12, fontWeight: 600, color: finalData ? GREEN : TEXT }}>{currentStep}</span>
                    {finalData && <span style={{ fontSize: 11, color: MUTED, marginLeft: "auto" }}>{finalData?.elapsed_seconds}s total</span>}
                </div>
            )}

            {error && (
                <div style={{ padding: "10px 14px", background: `${RED}12`, border: `1px solid ${RED}40`, borderRadius: 8, display: "flex", gap: 8 }}>
                    <AlertCircle size={14} color={RED} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: RED, margin: "0 0 2px" }}>Pipeline Error</p>
                        <p style={{ fontSize: 12, color: RED, margin: 0 }}>{error}</p>
                    </div>
                </div>
            )}

            {(finalData || (!isStreaming && streamEvents.length > 0)) && (
                <>
                    <TabBar activeTab={activeTab} setActiveTab={setActiveTab} finalData={finalData} />

                    {activeTab === "structured" && finalData && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.3s ease" }}>
                            <ClinicalSummaryCard finalData={finalData} />
                            <DiagnosisCard finalData={finalData} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <LabCard finalData={finalData} />
                                <DrugSafetyCard finalData={finalData} />
                            </div>
                            {finalData?.imaging_performed && <ImagingTriageCard finalData={finalData} />}
                            <DigitalTwinCard finalData={finalData} />
                            <SOAPNoteCard finalData={finalData} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <PatientExplanationCard finalData={finalData} />
                                <RiskAttributionCard finalData={finalData} />
                            </div>
                            <MetaCard finalData={finalData} />
                        </div>
                    )}

                    {activeTab === "json" && (
                        <JsonTab finalData={finalData} streamEvents={streamEvents} />
                    )}
                </>
            )}
        </div>
    );
}
