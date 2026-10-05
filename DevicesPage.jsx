import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DeviceCard } from "../components/devices/DeviceCard";
import { SignalingConfigModal } from "../components/devices/SignalingConfigModal";
import { EmptyState } from "../components/common/EmptyState";
import { Radio, Users, Settings, Wifi, Shield, RefreshCw } from "lucide-react";

export function DevicesPage() {
  const {
    deviceId,
    deviceRole,
    roomName,
    peers,
    connectedPeersCount,
    connectPeer,
    internetOnline,
    simulatedInternetOffline,
    localNetworkConnected,
    signalingStatus,
    signalingMode,
    dispatch
  } = useApp();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const isActuallyOnline = internetOnline && !simulatedInternetOffline;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Radio size={22} color="var(--status-accent)" />
            P2P Mesh Network & Nearby Devices
          </h2>
          <div className="page-sub">
            Direct browser-to-browser WebRTC DataChannels over local Wi-Fi or phone hotspot
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => setIsConfigOpen(true)}>
          <Settings size={14} /> Join Network Room
        </button>
      </div>

      {/* Network Architecture Health Card */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <h4 style={{ fontSize: "0.95rem", color: "#fff", marginBottom: "12px" }}>
          Current Unit Telemetry
        </h4>

        <div className="grid-3" style={{ fontSize: "0.82rem" }}>
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "10px", borderRadius: "6px" }}>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Local Identity</span>
            <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{deviceId}</strong>
            <div style={{ color: "var(--status-info)" }}>Role: {deviceRole}</div>
          </div>

          <div style={{ backgroundColor: "var(--bg-surface)", padding: "10px", borderRadius: "6px" }}>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Emergency Mesh Room</span>
            <strong style={{ color: "var(--status-accent)", fontSize: "0.95rem" }}>{roomName}</strong>
            <div style={{ color: "var(--text-dim)" }}>Mode: {signalingMode.toUpperCase()} ({signalingStatus})</div>
          </div>

          <div style={{ backgroundColor: "var(--bg-surface)", padding: "10px", borderRadius: "6px" }}>
            <span style={{ color: "var(--text-muted)", display: "block" }}>Physical Radios</span>
            <div>Local Wi-Fi / Hotspot: <strong style={{ color: "var(--status-safe)" }}>CONNECTED</strong></div>
            <div>Public WAN Internet: <strong style={{ color: isActuallyOnline ? "var(--status-safe)" : "var(--status-critical)" }}>{isActuallyOnline ? "ONLINE" : "OFFLINE"}</strong></div>
          </div>
        </div>
      </div>

      {/* Nearby Peers List */}
      <div className="card-header" style={{ marginTop: "20px" }}>
        <h3 className="card-title">
          <Users size={18} color="var(--status-info)" />
          Discovered Peers ({peers.length} detected, {connectedPeersCount} active DataChannels)
        </h3>
      </div>

      <div className="grid-2">
        {peers.map(peer => (
          <DeviceCard key={peer.peerId} peer={peer} onConnect={connectPeer} />
        ))}
      </div>

      {peers.length === 0 && (
        <EmptyState
          icon={Radio}
          title="No nearby devices found yet"
          description="Open ResQRoute on another browser tab, phone, or laptop connected to the same Wi-Fi/hotspot to establish a peer link."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setIsConfigOpen(true)}>
              Check Room & Server Settings
            </button>
          }
        />
      )}

      <SignalingConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
}
