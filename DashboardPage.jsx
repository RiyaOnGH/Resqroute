import React from "react";
import { useApp } from "../context/AppContext";
import { AlertCard } from "../components/alerts/AlertCard";
import { ShelterCard } from "../components/shelters/ShelterCard";
import {
  LifeBuoy,
  AlertTriangle,
  Map,
  Radio,
  PlusCircle,
  Shield,
  Home,
  CheckCircle,
  Wifi,
  WifiOff,
  Send,
  Sparkles
} from "lucide-react";

export function DashboardPage() {
  const {
    deviceId,
    deviceRole,
    roomName,
    alerts,
    roads,
    shelters,
    connectedPeersCount,
    outgoingQueue,
    internetOnline,
    simulatedInternetOffline,
    dispatch
  } = useApp();

  const isActuallyOnline = internetOnline && !simulatedInternetOffline;
  const criticalAlerts = alerts.filter(a => a.priority === "CRITICAL" || a.status === "BLOCKED");
  const openShelters = shelters.filter(s => s.status === "OPEN" && s.available > 0);
  const nearestShelter = openShelters[0] || shelters[0];
  const pendingCount = outgoingQueue.filter(q => q.status === "PENDING" || q.status === "RETRY").length;

  return (
    <div>
      {/* 1. Operational Status Hero */}
      <div className="card" style={{ marginBottom: "18px", borderLeft: "4px solid var(--status-critical)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Shield size={20} color="var(--status-critical)" />
              <h2 style={{ fontSize: "1.25rem", color: "#fff" }}>ResQRoute Emergency Command</h2>
              <span className="badge badge-info">{deviceRole}</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Device ID: <strong>{deviceId}</strong> • Network Mesh: <strong>{roomName}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className="btn btn-emergency btn-sm"
              onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "create-alert" })}
            >
              <PlusCircle size={14} /> Create Alert
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "demo" })}
            >
              <Sparkles size={14} /> Run 3-Device Demo
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid-4" style={{ marginTop: "16px" }}>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "10px 12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Internet WAN</div>
            <div style={{ fontSize: "1.05rem", fontWeight: "700", color: isActuallyOnline ? "var(--status-safe)" : "var(--status-critical)", marginTop: "2px" }}>
              {isActuallyOnline ? "ONLINE" : "OFFLINE (Autonomous)"}
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-surface)", padding: "10px 12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Connected Peers</div>
            <div style={{ fontSize: "1.05rem", fontWeight: "700", color: connectedPeersCount > 0 ? "var(--status-accent)" : "var(--status-warning)", marginTop: "2px" }}>
              {connectedPeersCount} Active Device(s)
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-surface)", padding: "10px 12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Active Hazards</div>
            <div style={{ fontSize: "1.05rem", fontWeight: "700", color: criticalAlerts.length > 0 ? "var(--status-critical)" : "var(--status-safe)", marginTop: "2px" }}>
              {alerts.length} Total ({criticalAlerts.length} Critical)
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-surface)", padding: "10px 12px", borderRadius: "6px" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Offline Outbox</div>
            <div style={{ fontSize: "1.05rem", fontWeight: "700", color: pendingCount > 0 ? "var(--status-warning)" : "var(--status-safe)", marginTop: "2px" }}>
              {pendingCount} Messages Stored
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Quick Actions */}
      <div className="grid-4" style={{ marginBottom: "20px" }}>
        <button
          className="card"
          style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border-strong)" }}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "create-alert" })}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--status-critical)", marginBottom: "4px" }}>
            <PlusCircle size={18} />
            <strong style={{ fontSize: "0.95rem" }}>Create Alert</strong>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Broadcast road block, flood, or SOS hazard</span>
        </button>

        <button
          className="card"
          style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border-strong)" }}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "map" })}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--status-info)", marginBottom: "4px" }}>
            <Map size={18} />
            <strong style={{ fontSize: "0.95rem" }}>District Map</strong>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>View offline vector map & Dijkstra safe routes</span>
        </button>

        <button
          className="card"
          style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border-strong)" }}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "alerts" })}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--status-warning)", marginBottom: "4px" }}>
            <AlertTriangle size={18} />
            <strong style={{ fontSize: "0.95rem" }}>View Alerts ({alerts.length})</strong>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Check freshness, trust, and corroboration</span>
        </button>

        <button
          className="card"
          style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border-strong)" }}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "devices" })}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--status-accent)", marginBottom: "4px" }}>
            <Radio size={18} />
            <strong style={{ fontSize: "0.95rem" }}>Nearby Devices</strong>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Manage WebRTC mesh & Room {roomName}</span>
        </button>
      </div>

      {/* 3. Operational Two-Column Summary */}
      <div className="grid-2">
        {/* Left: Critical Emergency Alerts */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "1.05rem", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={16} color="var(--status-critical)" />
              Priority Road Alerts
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "alerts" })}
            >
              All Alerts ({alerts.length})
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {criticalAlerts.slice(0, 3).map((alert) => (
              <AlertCard
                key={alert.messageId}
                alert={alert}
                onSelectRoad={(rId) => {
                  dispatch({ type: "SET_SELECTED_ROAD", payload: rId });
                  dispatch({ type: "SET_ACTIVE_TAB", payload: "map" });
                }}
              />
            ))}
            {criticalAlerts.length === 0 && (
              <div className="card" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                No active critical hazards reported.
              </div>
            )}
          </div>
        </div>

        {/* Right: Shelter Availability */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "1.05rem", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
              <Home size={16} color="var(--status-safe)" />
              Nearest Shelter Status
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "shelters" })}
            >
              All Shelters
            </button>
          </div>

          {nearestShelter && (
            <ShelterCard
              shelter={nearestShelter}
              onEdit={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "shelters" })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
