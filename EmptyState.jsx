import React from "react";
import { Info } from "lucide-react";

export function EmptyState({ icon: Icon = Info, title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
      <Icon size={42} style={{ marginBottom: "12px", opacity: 0.5, color: "var(--status-info)" }} />
      <h4 style={{ color: "#fff", marginBottom: "6px", fontSize: "1.05rem" }}>{title}</h4>
      <p style={{ fontSize: "0.85rem", maxWidth: "400px", margin: "0 auto 16px auto" }}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
