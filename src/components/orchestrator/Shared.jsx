import { ACCENT, BORDER, BG, TEXT, MUTED, DIM } from "./tokens";

export function Field({ label, children }) {
    const labelStyle = {
        display: "block", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.15em", textTransform: "uppercase",
        color: MUTED, marginBottom: 6,
    };
    return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

export function SectionHeader({ title, count }) {
    return (
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, background: `${ACCENT}08` }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: TEXT, margin: 0 }}>
                {title}{count !== undefined ? ` (${count})` : ""}
            </p>
        </div>
    );
}

export function Badge({ label, color = ACCENT }) {
    return (
        <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "2px 7px", borderRadius: 5, color,
            background: `${color}18`, border: `1px solid ${color}30`, flexShrink: 0,
        }}>{label}</span>
    );
}

export function ConfBar({ value, color = ACCENT }) {
    const pct = Math.round((value || 0) * 100);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: DIM, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", flexShrink: 0 }}>{pct}%</span>
        </div>
    );
}

export function StatBox({ label, value, color, mono = false }) {
    return (
        <div style={{ padding: 10, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, textAlign: "center" }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: color || TEXT, margin: 0, fontFamily: mono ? "monospace" : "inherit" }}>{value}</p>
        </div>
    );
}

export function InfoRow({ label, value, color }) {
    return (
        <div style={{ padding: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 3px" }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: color || TEXT, margin: 0, wordBreak: "break-all" }}>{String(value ?? "N/A")}</p>
        </div>
    );
}

export function MiniLabel({ children, color }) {
    return (
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: color || MUTED, margin: "0 0 6px" }}>
            {children}
        </p>
    );
}

export function Card({ children, style }) {
    return (
        <div style={{ border: `1px solid ${BORDER}`, background: "var(--color-surface)", borderRadius: 12, overflow: "hidden", ...style }}>
            {children}
        </div>
    );
}
