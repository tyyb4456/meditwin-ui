import { ChevronRight, AlertTriangle, Info } from "lucide-react";
import { SectionHeader } from "./Shared";
import { BORDER, BG, TEXT, MUTED, GREEN, YELLOW, RED, ACCENT } from "./tokens";

function ReadingLevelBadge({ rl }) {
    if (!rl) return null;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: rl.acceptable ? GREEN : YELLOW, margin: 0, fontFamily: "monospace" }}>G{rl.grade_level?.toFixed(1)}</p>
                <p style={{ fontSize: 9, color: MUTED, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Grade Level</p>
            </div>
            <div style={{ width: 1, height: 30, background: BORDER }} />
            <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: rl.acceptable ? GREEN : YELLOW, margin: 0 }}>
                    {rl.acceptable ? "✓ Reading level acceptable" : "⚠ Reading level too high"}
                </p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Ease score {rl.reading_ease}/100 · Target grade {rl.target}</p>
            </div>
        </div>
    );
}

function TextBlock({ label, text, color }) {
    if (!text) return null;
    return (
        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: color || MUTED, margin: "0 0 5px" }}>{label}</p>
            <p style={{ fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.6 }}>{text}</p>
        </div>
    );
}

function BulletList({ label, items, icon: Icon, iconColor }) {
    if (!items?.length) return null;
    return (
        <div style={{ padding: 10, background: Icon === AlertTriangle ? `${RED}08` : BG, border: `1px solid ${Icon === AlertTriangle ? RED + "30" : BORDER}`, borderRadius: 8 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: iconColor || MUTED, margin: "0 0 5px" }}>{label}</p>
            {items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                    <Icon size={11} color={iconColor || ACCENT} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 12, color: TEXT, margin: 0 }}>{item}</p>
                </div>
            ))}
        </div>
    );
}

export default function PatientExplanationCard({ finalData }) {
    const po = finalData?.patient_output;
    if (!po) return null;
    const rl = po.reading_level_check || finalData?.reading_level_check;

    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden" }}>
            <SectionHeader title="Patient Explanation" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <ReadingLevelBadge rl={rl} />
                <TextBlock label="Condition" text={po.condition_explanation} />
                <TextBlock label="Why This Happened" text={po.why_this_happened} color={ACCENT} />
                <TextBlock label="What Happens Next" text={po.what_happens_next} />
                <TextBlock label="Important For You To Know" text={po.important_for_you_to_know} color={YELLOW} />
                <BulletList label="What To Expect" items={po.what_to_expect} icon={ChevronRight} iconColor={ACCENT} />
                <BulletList label="When To Call The Nurse" items={po.when_to_call_the_nurse} icon={AlertTriangle} iconColor={RED} />
            </div>
        </div>
    );
}
