import React from "react";
import { useApp } from "../../context/AppContext";
import { Wifi, WifiOff, Radio, Send, Users, Shield, RefreshCw } from "lucide-react";

export function ConnectionStatus() {
  const {
    deviceId,
    deviceRole,
    roomName,
    internetOnline,
    simulatedInternetOffline,
    localNetworkConnected,
    connectedPeersCount,
    outgoingQueue,
    signalingStatus,
    signalingMode,
    dispatch
  } = useApp();

  const isActuallyOnline = internetOnline && !simulatedInternetOffline;
  const pendingCount = outgoingQueue.filter(q => q.status === "PENDING" || q.status === "RETRY").length;

  return (
    <div className="connection-bar" role="status" aria-label="System Connectivity Monitor">
      <div className="conn-indicators">
        {/* Device Profile */}
        <div className="device-badge-tag">
          <Shield size={12} style={{ color: "var(--status-critical)" }} />
          <strong>{deviceId}</strong>
          <span style={{ color: "var(--text-muted)" }}>({deviceRole})</span>
        </div>

        {/* Room Code */}
        <div
          className="device-badge-tag"
          style={{ cursor: "pointer" }}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "devices" })}
          title="Click to change emergency room"
        >
          <span style={{ color: "var(--text-muted)" }}>Mesh:</span>
          <span style={{ color: "var(--status-accent)", fontWeight: "bold" }}>{roomName}</span>
        </div>

        {/* Internet Status */}
        <div className="conn-item" title="Public Cloud WAN connectivity">
          <span className={`status-dot ${isActuallyOnline ? "online" : "offline"}`} />
          <span>Internet: {isActuallyOnline ? "ONLINE" : "OFFLINE"}</span>
        </div>

        {/* Local Network */}
        <div className="conn-item" title="Local Wi-Fi / Hotspot Router Link">
          <span className={`status-dot ${localNetworkConnected ? "online" : "offline"}`} />
          <span>Local Network: {localNetworkConnected ? "CONNECTED" : "DISCONNECTED"}</span>
        </div>

        {/* Peer Connection */}
        <div className="conn-item" title="WebRTC DataChannel P2P Status">
          <span className={`status-dot ${connectedPeersCount > 0 ? "active" : "warning"}`} />
          <span>
            Peers: {connectedPeersCount > 0 ? `${connectedPeersCount} ACTIVE` : "SEARCHING"}
          </span>
        </div>

        {/* Outbox Queue */}
        {pendingCount > 0 && (
          <div
            className="conn-item"
            style={{ color: "var(--status-warning)", cursor: "pointer" }}
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "queue" })}
            title="Messages stored offline awaiting peer discovery"
          >
            <Send size={12} />
            <span>Outbox: {pendingCount} Pending</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Internet Toggle for Field Testing */}
        <button
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "0.72rem", padding: "2px 8px" }}
          onClick={() => dispatch({ type: "TOGGLE_SIMULATED_INTERNET" })}
          title="Toggle simulated Internet outage to test offline store-and-forward"
        >
          {simulatedInternetOffline ? <WifiOff size={11} color="#ef4444" /> : <Wifi size={11} color="#10b981" />}
          <span>{simulatedInternetOffline ? "Sim: WAN Off" : "Sim: WAN On"}</span>
        </button>
      </div>
    </div>
  );
}
