import { SectionHeader } from "./Shared";
import { BORDER, BG, TEXT, GREEN, CYAN, PURPLE, ORANGE } from "./tokens";

const sections = [
    { key: "subjective", label: "S — Subjective", color: CYAN   },
    { key: "objective",  label: "O — Objective",  color: PURPLE },
    { key: "assessment", label: "A — Assessment", color: ORANGE },
];

export default function SOAPNoteCard({ finalData }) {
    const soap = finalData?.clinician_output?.soap_note;
    if (!soap) return null;

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="SOAP Note" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {sections.map(({ key, label, color }) => soap[key] && (
                    <div key={key} style={{ padding: 12, background: BG, borderLeft: `3px solid ${color}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, margin: "0 0 5px" }}>{label}</p>
                        <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.65 }}>{soap[key]}</p>
                    </div>
                ))}
                {soap.plan?.length > 0 && (
                    <div style={{ padding: 12, background: BG, borderLeft: `3px solid ${GREEN}`, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: GREEN, margin: "0 0 8px" }}>P — Plan</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {soap.plan.map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <span style={{ width: 18, height: 18, background: `${GREEN}20`, color: GREEN, fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, flexShrink: 0 }}>{i + 1}</span>
                                    <p style={{ fontSize: 12, color: TEXT, margin: 0, lineHeight: 1.5 }}>{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
