import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    // ── Dev server proxy ──────────────────────────────────────────────────
    // Mirrors the production Nginx config so the same relative API paths
    // (/api/<service>/*) work in both local dev and Docker without any
    // code differences.
    proxy: {
      '/api/orchestrator':       { target: 'http://127.0.0.1:8000', rewrite: path => path.replace(/^\/api\/orchestrator/, ''), changeOrigin: true },
      '/api/patient-context':    { target: 'http://127.0.0.1:8001', rewrite: path => path.replace(/^\/api\/patient-context/, ''), changeOrigin: true },
      '/api/diagnosis':          { target: 'http://127.0.0.1:8002', rewrite: path => path.replace(/^\/api\/diagnosis/, ''), changeOrigin: true },
      '/api/lab-analysis':       { target: 'http://127.0.0.1:8003', rewrite: path => path.replace(/^\/api\/lab-analysis/, ''), changeOrigin: true },
      '/api/drug-safety':        { target: 'http://127.0.0.1:8004', rewrite: path => path.replace(/^\/api\/drug-safety/, ''), changeOrigin: true },
      '/api/imaging-triage':     { target: 'http://127.0.0.1:8005', rewrite: path => path.replace(/^\/api\/imaging-triage/, ''), changeOrigin: true },
      '/api/digital-twin':       { target: 'http://127.0.0.1:8006', rewrite: path => path.replace(/^\/api\/digital-twin/, ''), changeOrigin: true },
      '/api/explanation':        { target: 'http://127.0.0.1:8009', rewrite: path => path.replace(/^\/api\/explanation/, ''), changeOrigin: true },
      '/api/conversative-agent': { target: 'http://127.0.0.1:8010', rewrite: path => path.replace(/^\/api\/conversative-agent/, ''), changeOrigin: true },
    },
  },
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