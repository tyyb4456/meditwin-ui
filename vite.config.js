import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})

// <div style={{ flex: "1 1 380px" }}>
//     <div style={{
//         display: "inline-flex", alignItems: "center", gap: 7,
//         padding: "4px 12px", borderRadius: 20,
//         border: "1px solid var(--color-border)",
//         background: "var(--color-surface)",
//         marginBottom: 14,
//     }}>
//         <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
//         <span style={{ color: "var(--color-text-subtle)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
//             Choose Your Interaction Mode
//         </span>
//     </div>

//     <h1 style={{
//         fontSize: "clamp(40px, 7vw, 90px)", fontWeight: 900,
//         lineHeight: 0.92, letterSpacing: "-0.02em",
//         textTransform: "uppercase", color: "var(--color-text)",
//         marginBottom: 16,
//     }}>
//         Get<br />
//         <span style={{ color: "transparent", WebkitTextStroke: "2px var(--color-text)" }}>Started</span>
//     </h1>

//     <p style={{ color: "var(--color-text-muted)", fontSize: 14, lineHeight: 1.7, maxWidth: 500 }}>
//         Select how you want to interact with MediTwin&apos;s eight specialist agents. Each mode offers a different level of control and abstraction.
//     </p>
// </div>