/**
 * WebRTC DataChannel Service for ResQRoute
 * Direct device-to-device emergency data transport.
 * No emergency messages flow through cloud or signaling servers.
 */

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

export class WebRTCService {
  constructor(localDeviceId, localRole, signalingService) {
    this.localDeviceId = localDeviceId;
    this.localRole = localRole;
    this.signaling = signalingService;
    
    // Map of peerId -> peerObject
    this.peers = new Map();

    // Callbacks
    this.onPeerConnectionChange = null;
    this.onMessageReceived = null;

    this.bindSignalingEvents();
  }

  bindSignalingEvents() {
    if (!this.signaling) return;

    this.signaling.onPeerDiscovered = (peer) => {
      this.registerDiscoveredPeer(peer.deviceId, peer.role);
    };

    this.signaling.onPeerLeft = (peerId) => {
      this.handlePeerDisconnected(peerId);
    };

    this.signaling.onOfferReceived = async (peerId, offer, role) => {
      await this.handleIncomingOffer(peerId, offer, role);
    };

    this.signaling.onAnswerReceived = async (peerId, answer) => {
      await this.handleIncomingAnswer(peerId, answer);
    };

    this.signaling.onIceCandidateReceived = async (peerId, candidate) => {
      await this.handleIncomingIceCandidate(peerId, candidate);
    };
  }

  registerDiscoveredPeer(peerId, role = "VOLUNTEER") {
    if (peerId === this.localDeviceId) return;

    if (!this.peers.has(peerId)) {
      this.peers.set(peerId, {
        peerId,
        role,
        state: "DISCOVERED",
        pc: null,
        dataChannel: null,
        lastSeen: Date.now(),
        messagesSent: 0,
        messagesReceived: 0,
        bytesSent: 0,
        bytesReceived: 0
      });

      this.notifyPeerChange();

      // Auto-connect if local ID is lexicographically greater (determinate caller role)
      if (this.localDeviceId > peerId) {
        setTimeout(() => this.connectToPeer(peerId), 500);
      }
    } else {
      const peer = this.peers.get(peerId);
      peer.lastSeen = Date.now();
      if (role) peer.role = role;
    }
  }

  async connectToPeer(peerId) {
    let peer = this.peers.get(peerId);
    if (!peer) {
      this.registerDiscoveredPeer(peerId);
      peer = this.peers.get(peerId);
    }

    if (peer.state === "CONNECTED" || peer.state === "CONNECTING") {
      return;
    }

    this.updatePeerState(peerId, "CONNECTING");

    try {
      const pc = this.createPeerConnection(peerId);
      peer.pc = pc;

      // Create data channel
      const dc = pc.createDataChannel("emergency-data", {
        ordered: true
      });
      this.setupDataChannel(peerId, dc);
      peer.dataChannel = dc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.signaling.sendSignal(peerId, "OFFER", offer);
    } catch (err) {
      console.error(`Failed to initiate WebRTC connection to ${peerId}:`, err);
      this.updatePeerState(peerId, "FAILED");
    }
  }

  createPeerConnection(peerId) {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.sendSignal(peerId, "ICE_CANDIDATE", event.candidate);
      }
    };

    pc.ondatachannel = (event) => {
      this.setupDataChannel(peerId, event.channel);
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          this.updatePeerState(peerId, "CONNECTED");
          break;
        case "disconnected":
        case "closed":
          this.handlePeerDisconnected(peerId);
          break;
        case "failed":
          this.updatePeerState(peerId, "FAILED");
          break;
        default:
          break;
      }
    };

    return pc;
  }

  setupDataChannel(peerId, dc) {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    peer.dataChannel = dc;

    dc.onopen = () => {
      this.updatePeerState(peerId, "CONNECTED");
      console.log(`[WebRTC DataChannel] OPEN with peer ${peerId}`);
    };

    dc.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        peer.messagesReceived += 1;
        peer.bytesReceived += (event.data?.length || 0);

        if (this.onMessageReceived) {
          this.onMessageReceived(payload, peerId);
        }
      } catch (err) {
        console.error("Failed to parse incoming peer DataChannel payload:", err);
      }
    };

    dc.onclose = () => {
      this.handlePeerDisconnected(peerId);
    };

    dc.onerror = (err) => {
      console.warn(`DataChannel error with ${peerId}:`, err);
    };
  }

  async handleIncomingOffer(peerId, offer, role) {
    this.registerDiscoveredPeer(peerId, role);
    const peer = this.peers.get(peerId);

    try {
      this.updatePeerState(peerId, "CONNECTING");
      const pc = this.createPeerConnection(peerId);
      peer.pc = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.signaling.sendSignal(peerId, "ANSWER", answer);
    } catch (err) {
      console.error(`Error handling offer from ${peerId}:`, err);
      this.updatePeerState(peerId, "FAILED");
    }
  }

  async handleIncomingAnswer(peerId, answer) {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.pc) return;

    try {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error(`Error handling answer from ${peerId}:`, err);
    }
  }

  async handleIncomingIceCandidate(peerId, candidate) {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.pc) return;

    try {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn(`Error adding ICE candidate from ${peerId}:`, err);
    }
  }

  sendMessageToPeer(peerId, payload) {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== "open") {
      return false;
    }

    try {
      const dataStr = JSON.stringify(payload);
      peer.dataChannel.send(dataStr);
      peer.messagesSent += 1;
      peer.bytesSent += dataStr.length;
      return true;
    } catch (err) {
      console.error(`Failed to send DataChannel message to ${peerId}:`, err);
      return false;
    }
  }

  broadcastMessage(payload) {
    let sentCount = 0;
    this.peers.forEach((peer, peerId) => {
      if (this.sendMessageToPeer(peerId, payload)) {
        sentCount += 1;
      }
    });
    return sentCount;
  }

  updatePeerState(peerId, state) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.state = state;
      this.notifyPeerChange();
    }
  }

  handlePeerDisconnected(peerId) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.state = "DISCONNECTED";
      if (peer.pc) {
        try { peer.pc.close(); } catch {}
        peer.pc = null;
      }
      peer.dataChannel = null;
      this.notifyPeerChange();
    }
  }

  getConnectedPeers() {
    const list = [];
    this.peers.forEach((peer) => {
      if (peer.state === "CONNECTED") {
        list.push({ ...peer });
      }
    });
    return list;
  }

  getAllPeers() {
    return Array.from(this.peers.values());
  }

  notifyPeerChange() {
    if (this.onPeerConnectionChange) {
      this.onPeerConnectionChange(this.getAllPeers());
    }
  }

  destroy() {
    this.peers.forEach((peer) => {
      if (peer.pc) peer.pc.close();
    });
    this.peers.clear();
  }
}
