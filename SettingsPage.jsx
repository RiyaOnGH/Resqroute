import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Settings, Shield, User, Home, RotateCcw, Database } from "lucide-react";

export function SettingsPage() {
  const { deviceId, deviceRole, roomName, setDeviceRole, resetDemoData, alerts, roads, outgoingQueue } = useApp();

  const handleRoleSelect = (role) => {
    setDeviceRole(role);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Settings size={22} color="var(--status-info)" />
            Unit Profile & Configuration
          </h2>
          <div className="page-sub">
            Configure local role, device parameters, and offline storage
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1rem", color: "#fff", marginBottom: "8px" }}>Operational Role</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "14px" }}>
          Select this unit's operational responsibility in the field:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <button
            className={`card ${deviceRole === "RESPONDER" ? "card-active" : ""}`}
            style={{ textAlign: "center", cursor: "pointer", border: deviceRole === "RESPONDER" ? "2px solid var(--status-critical)" : "1px solid var(--border-strong)" }}
            onClick={() => handleRoleSelect("RESPONDER")}
          >
            <Shield size={24} color="var(--status-critical)" style={{ margin: "0 auto 6px auto" }} />
            <strong style={{ display: "block", fontSize: "0.9rem" }}>Responder</strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Can create & verify critical alerts</span>
          </button>

          <button
            className={`card ${deviceRole === "VOLUNTEER" ? "card-active" : ""}`}
            style={{ textAlign: "center", cursor: "pointer", border: deviceRole === "VOLUNTEER" ? "2px solid var(--status-warning)" : "1px solid var(--border-strong)" }}
            onClick={() => handleRoleSelect("VOLUNTEER")}
          >
            <User size={24} color="var(--status-warning)" style={{ margin: "0 auto 6px auto" }} />
            <strong style={{ display: "block", fontSize: "0.9rem" }}>Volunteer</strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Store, forward, & report hazards</span>
          </button>

          <button
            className={`card ${deviceRole === "SHELTER" ? "card-active" : ""}`}
            style={{ textAlign: "center", cursor: "pointer", border: deviceRole === "SHELTER" ? "2px solid var(--status-safe)" : "1px solid var(--border-strong)" }}
            onClick={() => handleRoleSelect("SHELTER")}
          >
            <Home size={24} color="var(--status-safe)" style={{ margin: "0 auto 6px auto" }} />
            <strong style={{ display: "block", fontSize: "0.9rem" }}>Shelter</strong>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Manage intake & receive updates</span>
          </button>
        </div>

        <div style={{ marginTop: "14px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          Current Unit ID: <strong style={{ color: "#fff" }}>{deviceId}</strong>
        </div>
      </div>

      {/* Local Storage Telemetry */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1rem", color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Database size={16} /> Offline Storage Telemetry
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          All alerts and topological updates persist in browser localStorage without external databases.
        </p>

        <div className="grid-3" style={{ fontSize: "0.8rem" }}>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "8px", borderRadius: "4px" }}>
            Alerts in Storage: <strong>{alerts.length}</strong>
          </div>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "8px", borderRadius: "4px" }}>
            Roads Tracked: <strong>{roads.length}</strong>
          </div>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "8px", borderRadius: "4px" }}>
            Queued Packets: <strong>{outgoingQueue.length}</strong>
          </div>
        </div>
      </div>

      {/* Reset Demo Data */}
      <div className="card" style={{ borderColor: "var(--status-critical-border)" }}>
        <h3 style={{ fontSize: "1rem", color: "var(--status-critical)", marginBottom: "6px" }}>
          Reset Demo State
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          Clears all simulated field alerts and resets roads to baseline safe status for a clean hackathon demo presentation.
        </p>

        <button className="btn btn-secondary btn-sm" onClick={resetDemoData}>
          <RotateCcw size={14} /> Reset Demo Data
        </button>
      </div>
    </div>
  );
}
