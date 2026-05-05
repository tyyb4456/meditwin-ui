import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: "var(--sidebar-width)",
        minHeight: "100vh",
        overflowX: "hidden",
      }}>
        {children}
      </main>
    </div>
  );
}
