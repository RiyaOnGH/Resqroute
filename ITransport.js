/**
 * Transport Layer Abstraction for ResQRoute
 * 
 * Concept:
 *       ResQRoute (Core Engine)
 *                  |
 *          Emergency Message
 *                  |
 *         Communication Layer (ITransport)
 *                  |
 * --------------------------------------------
 * | WebRTC (Active) | Bluetooth (Future) | LoRa (Future) |
 * --------------------------------------------
 */

export class ITransport {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.isSupported = false;
    this.onMessageReceived = null; // callback (message, senderPeerId)
    this.onPeerStateChange = null;  // callback (peersList)
  }

  async initialize() {
    throw new Error("Method not implemented.");
  }

  async send(targetPeerId, payload) {
    throw new Error("Method not implemented.");
  }

  async broadcast(payload) {
    throw new Error("Method not implemented.");
  }

  getConnectedPeers() {
    throw new Error("Method not implemented.");
  }

  destroy() {
    throw new Error("Method not implemented.");
  }
}

/**
 * WebRTC DataChannel Transport (Primary Active Transport for MVP)
 */
export class WebRTCTransport extends ITransport {
  constructor(webrtcService) {
    super("WebRTC DataChannel", "WEBRTC");
    this.webrtc = webrtcService;
    this.isSupported = typeof window !== "undefined" && "RTCPeerConnection" in window;

    if (this.webrtc) {
      this.webrtc.onMessageReceived = (msg, sender) => {
        if (this.onMessageReceived) this.onMessageReceived(msg, sender);
      };
      this.webrtc.onPeerConnectionChange = (peers) => {
        if (this.onPeerStateChange) this.onPeerStateChange(peers);
      };
    }
  }

  async initialize() {
    return this.isSupported;
  }

  async send(targetPeerId, payload) {
    if (!this.webrtc) return false;
    return this.webrtc.sendMessageToPeer(targetPeerId, payload);
  }

  async broadcast(payload) {
    if (!this.webrtc) return 0;
    return this.webrtc.broadcastMessage(payload);
  }

  getConnectedPeers() {
    if (!this.webrtc) return [];
    return this.webrtc.getConnectedPeers();
  }

  destroy() {
    if (this.webrtc) this.webrtc.destroy();
  }
}

/**
 * Bluetooth LE Transport Stub (Future Extension)
 */
export class BluetoothTransport extends ITransport {
  constructor() {
    super("Bluetooth LE Mesh", "BLUETOOTH");
    this.isSupported = typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  async initialize() {
    console.info("[Transport] Bluetooth LE transport adapter registered (Future Extension)");
    return this.isSupported;
  }

  async send() {
    throw new Error("Bluetooth LE transport is planned for post-MVP hardware integration.");
  }

  async broadcast() {
    throw new Error("Bluetooth LE transport is planned for post-MVP hardware integration.");
  }

  getConnectedPeers() {
    return [];
  }

  destroy() {}
}

/**
 * LoRa Radio Modem Transport Stub (Future Extension)
 */
export class LoRaTransport extends ITransport {
  constructor() {
    super("LoRa Radio Modem (868/915 MHz)", "LORA");
    this.isSupported = typeof navigator !== "undefined" && "serial" in navigator;
  }

  async initialize() {
    console.info("[Transport] LoRa Serial/UART transport adapter registered (Future Extension)");
    return this.isSupported;
  }

  async send() {
    throw new Error("LoRa transport is planned for post-MVP hardware integration.");
  }

  async broadcast() {
    throw new Error("LoRa transport is planned for post-MVP hardware integration.");
  }

  getConnectedPeers() {
    return [];
  }

  destroy() {}
}
