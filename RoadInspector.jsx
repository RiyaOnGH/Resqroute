import React from "react";
import { useApp } from "../../context/AppContext";
import { AlertTriangle, CheckCircle, ShieldAlert, X } from "lucide-react";

export function RoadInspector({ road, onClose, onCreateAlert }) {
  const { landmarks, createAlert, deviceRole } = useApp();

  if (!road) return null;

  const landmarkMap = new Map();
  landmarks.forEach(l => landmarkMap.set(l.id, l.name));

  const fromName = landmarkMap.get(road.from) || road.from;
  const toName = landmarkMap.get(road.to) || road.to;

  const handleQuickStatus = (newStatus) => {
    createAlert({
      roadId: road.id,
      status: newStatus,
      priority: newStatus === "BLOCKED" ? "HIGH" : "MEDIUM",
      reason: `Quick field status update: ${newStatus}`,
      lat: 0,
      lon: 0
    });
  };

  return (
    <div className="card" style={{ marginTop: "14px", border: "1px solid var(--border-active)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Road Details</span>
          <h3 style={{ fontSize: "1.1rem", color: "#fff" }}>{road.name || road.id}</h3>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "12px", fontSize: "0.8rem" }}>
        <div>
          <span style={{ color: "var(--text-muted)" }}>Current Status: </span>
          <strong style={{ color: road.status === "BLOCKED" ? "var(--status-critical)" : road.status === "SAFE" ? "var(--status-safe)" : "var(--status-warning)" }}>
            {road.status}
          </strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)" }}>Length: </span>
          <strong>{road.distanceKm} km</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)" }}>Connects: </span>
          <span>{fromName} ↔ {toName}</span>
        </div>
      </div>

      {road.reason && (
        <div style={{ fontSize: "0.82rem", color: "var(--text-main)", backgroundColor: "var(--bg-surface)", padding: "8px 10px", borderRadius: "4px", marginBottom: "12px" }}>
          <strong>Reported Condition:</strong> {road.reason}
        </div>
      )}

      {/* Quick Action buttons */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          className="btn btn-emergency btn-sm"
          onClick={() => handleQuickStatus("BLOCKED")}
          title="Mark road as blocked"
        >
          <ShieldAlert size={13} /> Mark BLOCKED
        </button>
        <button
          className="btn btn-safe btn-sm"
          onClick={() => handleQuickStatus("SAFE")}
          title="Mark road as safe"
        >
          <CheckCircle size={13} /> Mark SAFE
        </button>
        {onCreateAlert && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onCreateAlert(road.id)}
          >
            Detailed Report
          </button>
        )}
      </div>
    </div>
  );
}
