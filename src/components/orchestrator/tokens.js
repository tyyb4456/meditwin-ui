export const BG      = "var(--color-bg)";
export const SURFACE = "var(--color-surface)";
export const BORDER  = "var(--color-border)";
export const TEXT    = "var(--color-text)";
export const MUTED   = "var(--color-text-subtle)";
export const SUBTLE  = "var(--color-text-subtle)";
export const DIM     = "var(--color-border)";
export const ACCENT  = "#6366F1";
export const GREEN   = "#22C55E";
export const YELLOW  = "#EAB308";
export const RED     = "#EF4444";
export const CYAN    = "#06B6D4";
export const PURPLE  = "#8B5CF6";
export const PINK    = "#EC4899";
export const ORANGE  = "#F97316";
export const TEAL    = "#14B8A6";
export const INDIGO  = "#6366F1";
export const TERMINAL_BG = "#07060F";

export const GLOBAL_STYLES = `
    @keyframes spin  { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
    select option { background: var(--color-bg); color: var(--color-text); }
    input:focus, textarea:focus, select:focus { border-color: #6366F1 !important; outline: none; }
    input::placeholder, textarea::placeholder { color: var(--color-text-subtle); opacity: 0.7; }
`;

export const inputStyle = {
    width: "100%", background: BG, border: `1px solid ${BORDER}`,
    color: TEXT, padding: "8px 10px", fontSize: 13, outline: "none",
    fontFamily: "'Space Grotesk', system-ui, sans-serif", borderRadius: 8,
};

export const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 700,
    letterSpacing: "0.15em", textTransform: "uppercase",
    color: MUTED, marginBottom: 6,
};
