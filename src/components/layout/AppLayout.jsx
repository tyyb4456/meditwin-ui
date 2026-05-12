import { useState } from "react";
import { Menu, Activity } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 35,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <main className="app-main" style={{
        flex: 1,
        marginLeft: "var(--sidebar-width)",
        minHeight: "100vh",
        overflowX: "hidden",
      }}>
        <div className="mobile-topbar" style={{
          display: "none",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-sidebar)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              borderRadius: 7,
              padding: "6px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Menu size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "var(--color-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Activity size={13} strokeWidth={2.2} style={{ color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>MediTwin</p>
              <p style={{ fontSize: 9, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.12em", textTransform: "uppercase" }}>AI</p>
            </div>
          </div>
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .app-main {
            margin-left: 0 !important;
          }
          .mobile-topbar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
