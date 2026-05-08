import { Info, FileJson } from "lucide-react";
import { SectionHeader, Badge } from "./Shared";
import { BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED, CYAN, ACCENT, TERMINAL_BG } from "./tokens";

function FhirBundleSummary({ bundle }) {
    if (!bundle) return null;
    const entries = bundle.entry || [];
    const byType = entries.reduce((acc, e) => {
        const rt = e.resource?.resourceType || "Unknown";
        acc[rt] = (acc[rt] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="FHIR Bundle" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Type</p>
                        <p style={{ fontSize: 13, fontWeight: 900, color: CYAN, margin: 0, fontFamily: "monospace" }}>{bundle.resourceType}</p>
                    </div>
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Entries</p>
                        <p style={{ fontSize: 18, fontWeight: 900, color: TEXT, margin: 0, fontFamily: "monospace" }}>{bundle._entry_count ?? entries.length}</p>
                    </div>
                    <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>Bundle ID</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: TEXT, margin: 0, fontFamily: "monospace", wordBreak: "break-all" }}>{bundle.id?.slice(0, 14)}…</p>
                    </div>
                </div>

                {Object.keys(byType).length > 0 && (
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Resource Types</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {Object.entries(byType).map(([rt, count]) => (
                                <div key={rt} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, borderRadius: 6 }}>
                                    <FileJson size={10} color={ACCENT} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{rt}</span>
                                    <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {bundle.meta?.tag?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {bundle.meta.tag.map((tag, i) => (
                            <Badge key={i} label={tag.display || tag.code} color={CYAN} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MetaCard({ finalData }) {
    if (!finalData) return null;

    const fields = [
        { label: "Patient ID",  value: finalData.patient_id,                                                                              mono: true  },
        { label: "Elapsed",     value: `${finalData.elapsed_seconds}s`,                                                                    mono: true  },
        { label: "Version",     value: finalData.meditwin_version || "N/A",                                                                mono: true  },
        { label: "Imaging",     value: finalData.imaging_performed ? "Yes" : "No"                                                                     },
        { label: "Timestamp",   value: finalData.analysis_timestamp ? new Date(finalData.analysis_timestamp).toLocaleTimeString() : "N/A"             },
        { label: "Errors",      value: finalData.error_log?.length || 0, color: finalData.error_log?.length > 0 ? RED : GREEN                         },
    ];

    return (
        <>
            <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
                <SectionHeader title="Run Metadata" />
                <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {fields.map(({ label, value, mono, color }) => (
                        <div key={label} style={{ padding: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 3px" }}>{label}</p>
                            <p style={{ fontSize: 12, fontWeight: 700, color: color || TEXT, margin: 0, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{String(value)}</p>
                        </div>
                    ))}
                    {finalData.error_log?.length > 0 && (
                        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 4 }}>
                            {finalData.error_log.map((e, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: 8, background: `${YELLOW}08`, border: `1px solid ${YELLOW}30`, borderRadius: 6 }}>
                                    <Info size={12} color={YELLOW} style={{ flexShrink: 0, marginTop: 1 }} />
                                    <p style={{ fontSize: 11, color: YELLOW, margin: 0 }}>{e}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <FhirBundleSummary bundle={finalData?.fhir_bundle} />
        </>
    );
}
