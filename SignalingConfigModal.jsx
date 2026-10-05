import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useApp } from "../../context/AppContext";
import { Server, Radio, Users } from "lucide-react";

export function SignalingConfigModal({ isOpen, onClose }) {
  const { roomName, joinNetworkRoom, connectToSignalingServer, switchToBroadcastMesh, signalingMode } = useApp();

  const [inputRoom, setInputRoom] = useState(roomName || "RESQ-2026");
  const [serverUrl, setServerUrl] = useState(
    typeof window !== "undefined" ? `http://${window.location.hostname}:3001` : "http://localhost:3001"
  );

  const handleSaveRoom = (e) => {
    e.preventDefault();
    joinNetworkRoom(inputRoom);
    onClose();
  };

  const handleConnectSocket = (e) => {
    e.preventDefault();
    connectToSignalingServer(serverUrl);
    onClose();
  };

  return (
    <Modal title="Join Emergency Network Room" isOpen={isOpen} onClose={onClose}>
      <div style={{ marginBottom: "18px" }}>
        <h4 style={{ fontSize: "0.9rem", color: "#fff", marginBottom: "6px" }}>1. Emergency Room Code</h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
          All responders and volunteers on the same hotspot/Wi-Fi enter this shared code to discover each other.
        </p>
        <form onSubmit={handleSaveRoom} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            className="form-input"
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value.toUpperCase())}
            placeholder="e.g. RESQ-2026"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Join Room
          </button>
        </form>

        <h4 style={{ fontSize: "0.9rem", color: "#fff", marginBottom: "6px" }}>2. Local Hotspot Signaling Server</h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "10px" }}>
          Connect to the Node/Express server running on the host laptop (default port 3001).
        </p>
        <form onSubmit={handleConnectSocket} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="form-input"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://192.168.1.X:3001"
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Connect
          </button>
        </form>

        <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Current mode: <strong>{signalingMode.toUpperCase()}</strong>
          </span>
          {signalingMode === "socketio" && (
            <button className="btn btn-secondary btn-sm" onClick={switchToBroadcastMesh}>
              Switch to Multi-Tab Mesh
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
