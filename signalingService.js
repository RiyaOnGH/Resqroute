/**
 * Signaling Service for ResQRoute
 * Manages peer discovery and SDP/ICE signaling for establishing WebRTC connections.
 * 
 * Supports:
 * 1. BroadcastChannel (immediate multi-tab mesh testing without external server)
 * 2. Socket.IO (connects to local/hotspot Node signaling server on port 3001)
 */

import { io } from "socket.io-client";

export class SignalingService {
  constructor(localDeviceId, localRole, roomName = "RESQ-2026") {
    this.localDeviceId = localDeviceId;
    this.localRole = localRole;
    this.roomName = roomName;
    this.socket = null;
    this.broadcastChannel = null;
    this.heartbeatTimer = null;
    this.mode = "broadcast"; // "broadcast" | "socketio"
    this.signalingStatus = "STANDBY";
    this.serverUrl = typeof window !== "undefined" ? `http://${window.location.hostname}:3001` : "http://localhost:3001";

    // Callbacks
    this.onPeerDiscovered = null;
    this.onPeerLeft = null;
    this.onOfferReceived = null;
    this.onAnswerReceived = null;
    this.onIceCandidateReceived = null;
    this.onStatusChange = null;

    this.initBroadcastChannel();
  }

  updateLocalIdentity(deviceId, role, roomName) {
    this.localDeviceId = deviceId;
    this.localRole = role;
    if (roomName) this.roomName = roomName;
    this.broadcastPresence();
    if (this.socket && this.socket.connected) {
      this.socket.emit("join-room", {
        room: this.roomName,
        deviceId: this.localDeviceId,
        role: this.localRole
      });
    }
  }

  // --- 1. BroadcastChannel Mode ---
  initBroadcastChannel() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        if (this.broadcastChannel) {
          this.broadcastChannel.close();
        }
        this.broadcastChannel = new BroadcastChannel(`resqroute-signaling-${this.roomName}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingSignal(event.data);
        };
        this.setStatus("CONNECTED");
        this.broadcastPresence();

        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
          this.broadcastPresence();
        }, 3000);
      } catch (err) {
        console.warn("BroadcastChannel initialization failed:", err);
      }
    }
  }

  broadcastPresence(isReply = false) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: "PEER_ANNOUNCE",
        senderId: this.localDeviceId,
        role: this.localRole,
        room: this.roomName,
        isReply,
        timestamp: Date.now()
      });
    }
  }

  // --- 2. Socket.IO Mode ---
  connectSocketIO(url = this.serverUrl) {
    this.serverUrl = url;
    this.mode = "socketio";
    this.setStatus("CONNECTING");

    if (this.socket) {
      this.socket.disconnect();
    }

    try {
      this.socket = io(this.serverUrl, {
        transports: ["websocket", "polling"],
        timeout: 5000,
        reconnectionAttempts: 5,
        autoConnect: true,
        query: {
          deviceId: this.localDeviceId,
          role: this.localRole
        }
      });

      this.socket.on("connect", () => {
        this.setStatus("CONNECTED");
        this.socket.emit("join-room", {
          room: this.roomName,
          deviceId: this.localDeviceId,
          role: this.localRole
        });
      });

      this.socket.on("room-peers", (data) => {
        if (data && Array.isArray(data.peers)) {
          data.peers.forEach((peer) => {
            if (peer.deviceId !== this.localDeviceId && this.onPeerDiscovered) {
              this.onPeerDiscovered(peer);
            }
          });
        }
      });

      this.socket.on("peer-joined", (peer) => {
        if (peer.deviceId !== this.localDeviceId && this.onPeerDiscovered) {
          this.onPeerDiscovered(peer);
        }
      });

      this.socket.on("peer-left", (peerId) => {
        if (this.onPeerLeft) {
          this.onPeerLeft(peerId);
        }
      });

      this.socket.on("signal", (payload) => {
        this.handleIncomingSignal(payload);
      });

      this.socket.on("connect_error", (err) => {
        console.warn("Socket.IO signaling offline or unreachable:", err.message);
        this.setStatus("DISCONNECTED");
      });

      this.socket.on("disconnect", () => {
        this.setStatus("DISCONNECTED");
      });
    } catch (err) {
      console.error("Socket.IO initialization error:", err);
      this.setStatus("ERROR");
    }
  }

  disconnectSocketIO() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.mode = "broadcast";
    this.initBroadcastChannel();
  }

  // --- Core Signal Dispatch & Handling ---
  sendSignal(targetPeerId, signalType, data) {
    const payload = {
      senderId: this.localDeviceId,
      senderRole: this.localRole,
      targetPeerId,
      type: signalType,
      data,
      room: this.roomName,
      timestamp: Date.now()
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(payload);
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit("signal", payload);
    }
  }

  handleIncomingSignal(payload) {
    if (!payload || typeof payload !== "object") return;
    if (payload.senderId === this.localDeviceId) return;

    if (payload.type === "PEER_ANNOUNCE") {
      if (this.onPeerDiscovered) {
        this.onPeerDiscovered({
          deviceId: payload.senderId,
          role: payload.role,
          timestamp: payload.timestamp
        });
      }

      if (!payload.isReply) {
        this.broadcastPresence(true);
      }
      return;
    }

    if (payload.targetPeerId && payload.targetPeerId !== this.localDeviceId) {
      return;
    }

    switch (payload.type) {
      case "OFFER":
        if (this.onOfferReceived) {
          this.onOfferReceived(payload.senderId, payload.data, payload.senderRole);
        }
        break;
      case "ANSWER":
        if (this.onAnswerReceived) {
          this.onAnswerReceived(payload.senderId, payload.data);
        }
        break;
      case "ICE_CANDIDATE":
        if (this.onIceCandidateReceived) {
          this.onIceCandidateReceived(payload.senderId, payload.data);
        }
        break;
      default:
        break;
    }
  }

  setStatus(status) {
    this.signalingStatus = status;
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  destroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
