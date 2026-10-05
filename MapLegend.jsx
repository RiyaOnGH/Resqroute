import React from "react";

export function MapLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "12px",
        left: "12px",
        backgroundColor: "rgba(12, 17, 28, 0.85)",
        backdropFilter: "blur(4px)",
        border: "1px solid var(--border-strong)",
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "0.75rem",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      }}
    >
      <div style={{ fontWeight: "700", color: "#fff", marginBottom: "2px" }}>Road Status</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "14px", height: "4px", backgroundColor: "var(--status-safe)", borderRadius: "2px" }} />
        <span>SAFE (Passable)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "14px", height: "4px", backgroundColor: "var(--status-warning)", borderRadius: "2px" }} />
        <span>CAUTION (Hazard / Debris)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "14px", height: "4px", backgroundColor: "var(--status-critical)", borderRadius: "2px" }} />
        <span>BLOCKED (Impassable / Flood)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "14px", height: "4px", backgroundColor: "#64748b", borderRadius: "2px" }} />
        <span>UNKNOWN</span>
      </div>
    </div>
  );
}
