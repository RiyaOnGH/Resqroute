import React from "react";
import { Radio, Shield, CheckCircle, Clock, Send, Wifi } from "lucide-react";

export function DeviceCard({ peer, onConnect }) {
  const isConnected = peer.state === "CONNECTED";

  const getRoleBadge = (role) => {
    switch (role) {
      case "RESPONDER":
        return <span className="badge badge-info">RESPONDER</span>;
      case "SHELTER":
        return <span className="badge badge-safe">SHELTER</span>;
      default:
        return <span className="badge badge-warning">VOLUNTEER</span>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className={`status-dot ${isConnected ? "online" : "warning"}`} />
          <h4 style={{ fontSize: "1rem", color: "#fff" }}>{peer.peerId}</h4>
        </div>
        {getRoleBadge(peer.role)}
      </div>

      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px" }}>
        <div>Connection: <strong style={{ color: isConnected ? "var(--status-safe)" : "var(--status-warning)" }}>{peer.state}</strong></div>
        {peer.messagesSent !== undefined && (
          <div>Traffic: {peer.messagesSent} sent / {peer.messagesReceived} received</div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
          Direct WebRTC DataChannel
        </span>
        {!isConnected && onConnect && (
          <button className="btn btn-primary btn-sm" onClick={() => onConnect(peer.peerId)}>
            Connect Peer
          </button>
        )}
      </div>
    </div>
  );
}
