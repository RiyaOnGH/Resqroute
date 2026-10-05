/**
 * Message Service for ResQRoute
 * Implements validation, deduplication, store-and-forward mesh routing,
 * queue management, retry logic, freshness, trust, and conflict detection.
 */

import { storageService } from "../storage/storageService";

export const ALERT_TYPES = [
  "ROAD_BLOCKED",
  "ROAD_SAFE",
  "DANGER_ZONE",
  "SHELTER_UPDATE",
  "SOS_PEOPLE_WAITING",
  "GENERAL_EMERGENCY"
];

export const ROAD_STATUSES = ["SAFE", "CAUTION", "BLOCKED", "UNKNOWN"];
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const REASONS = ["Flood", "Fire", "Landslide", "Collapsed Road", "Debris", "Other"];
export const MAX_HOPS_LIMIT = 5;

// Freshness thresholds (configurable in minutes)
export const FRESHNESS_CONFIG = {
  FRESH_MINUTES: 30,
  AGING_MINUTES: 120
};

export class MessageService {
  constructor(localDeviceId, localRole, webrtcService) {
    this.localDeviceId = localDeviceId;
    this.localRole = localRole;
    this.webrtc = webrtcService;
    
    this.seenMessageIds = storageService.getSeenMessageIds();
    this.forwardedMessageIds = storageService.getForwardedMessageIds();

    // Callbacks
    this.onNewAlert = null;
    this.onQueueUpdated = null;
    this.onConflictDetected = null;
    this.onActivityLogged = null;

    if (this.webrtc) {
      this.webrtc.onMessageReceived = (message, senderPeerId) => {
        this.processIncomingPeerMessage(message, senderPeerId);
      };

      this.webrtc.onPeerConnectionChange = (peers) => {
        const hasConnectedPeer = peers.some(p => p.state === "CONNECTED");
        if (hasConnectedPeer) {
          this.retryQueuedMessages();
        }
      };
    }
  }

  updateLocalIdentity(deviceId, role) {
    this.localDeviceId = deviceId;
    this.localRole = role;
  }

  // --- Message Validation ---
  validateAlertPayload(data) {
    const errors = [];
    if (!data || typeof data !== "object") {
      return { isValid: false, errors: ["Invalid alert payload format."] };
    }
    if (!data.roadId || typeof data.roadId !== "string" || data.roadId.trim() === "") {
      errors.push("Road ID is required.");
    }
    if (!data.status || !ROAD_STATUSES.includes(data.status)) {
      errors.push(`Status must be one of: ${ROAD_STATUSES.join(", ")}`);
    }
    if (!data.priority || !PRIORITIES.includes(data.priority)) {
      errors.push(`Priority must be one of: ${PRIORITIES.join(", ")}`);
    }
    if (!data.reason || typeof data.reason !== "string" || data.reason.trim().length < 3) {
      errors.push("Reason is required (min 3 characters).");
    }
    return { isValid: errors.length === 0, errors };
  }

  // --- Create & Broadcast Alert ---
  createAlert(data) {
    const validation = this.validateAlertPayload(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const messageId = `MSG-${randomSuffix}`;
    const now = Date.now();
    const isVerified = (this.localRole === "RESPONDER");

    const newAlert = {
      messageId,
      type: "ROAD_UPDATE",
      alertType: data.alertType || (data.status === "BLOCKED" ? "ROAD_BLOCKED" : "ROAD_SAFE"),
      roadId: data.roadId.trim(),
      status: data.status,
      reason: data.reason.trim(),
      lat: data.lat || 0,
      lon: data.lon || 0,
      priority: data.priority,
      createdAt: now,
      expiresAt: now + (data.expiresInHours ? data.expiresInHours * 3600 * 1000 : 12 * 3600 * 1000),
      sourceDevice: this.localDeviceId,
      sourceRole: this.localRole,
      verified: isVerified,
      hopCount: 0,
      maxHops: MAX_HOPS_LIMIT,
      corroborationCount: 1,
      reportedBy: [this.localDeviceId]
    };

    // Mark as seen
    this.seenMessageIds.add(messageId);
    storageService.saveSeenMessageIds(this.seenMessageIds);

    // Save alert locally
    const currentAlerts = storageService.getAlerts();
    const updatedAlerts = [newAlert, ...currentAlerts];
    storageService.saveAlerts(updatedAlerts);

    // Log Activity
    const act = storageService.appendActivity({
      type: "ALERT_CREATED",
      messageId,
      summary: `${this.localRole} created: ${data.roadId} ${data.status} (${data.reason})`,
      sourceDevice: this.localDeviceId,
      role: this.localRole
    });
    if (this.onActivityLogged) this.onActivityLogged(act);

    // Dispatch to context
    if (this.onNewAlert) {
      this.onNewAlert(newAlert, updatedAlerts);
    }

    // Forward to peers or queue
    this.forwardOrQueueMessage(newAlert);

    return { success: true, alert: newAlert };
  }

  // --- Store and Forward Relay ---
  forwardOrQueueMessage(alert) {
    const connectedPeers = this.webrtc ? this.webrtc.getConnectedPeers() : [];

    if (connectedPeers.length > 0) {
      const sentCount = this.webrtc.broadcastMessage(alert);
      this.forwardedMessageIds.add(alert.messageId);
      storageService.saveForwardedMessageIds(this.forwardedMessageIds);

      const act = storageService.appendActivity({
        type: "ALERT_FORWARDED",
        messageId: alert.messageId,
        summary: `Forwarded to ${sentCount} connected peer(s) (Hop ${alert.hopCount})`,
        sourceDevice: this.localDeviceId
      });
      if (this.onActivityLogged) this.onActivityLogged(act);
    } else {
      // No peers connected, queue locally
      this.enqueueOutgoingMessage(alert);
    }
  }

  enqueueOutgoingMessage(alert) {
    const queue = storageService.getOutgoingQueue();
    const existingIndex = queue.findIndex(q => q.messageId === alert.messageId);

    if (existingIndex === -1) {
      queue.push({
        messageId: alert.messageId,
        alert,
        status: "PENDING",
        queuedAt: Date.now(),
        attempts: 0
      });
      storageService.saveOutgoingQueue(queue);

      if (this.onQueueUpdated) this.onQueueUpdated(queue);

      const act = storageService.appendActivity({
        type: "MESSAGE_QUEUED",
        messageId: alert.messageId,
        summary: `Stored in offline outbox queue (${alert.roadId} ${alert.status})`,
        sourceDevice: this.localDeviceId
      });
      if (this.onActivityLogged) this.onActivityLogged(act);
    }
  }

  retryQueuedMessages() {
    const queue = storageService.getOutgoingQueue();
    const pendingItems = queue.filter(q => q.status === "PENDING" || q.status === "RETRY");
    if (pendingItems.length === 0) return;

    const connectedPeers = this.webrtc ? this.webrtc.getConnectedPeers() : [];
    if (connectedPeers.length === 0) return;

    let sentCount = 0;
    const updatedQueue = queue.map(item => {
      if (item.status === "PENDING" || item.status === "RETRY") {
        const success = this.webrtc.broadcastMessage(item.alert) > 0;
        if (success) {
          sentCount++;
          this.forwardedMessageIds.add(item.alert.messageId);
          return { ...item, status: "SENT", sentAt: Date.now() };
        } else {
          return { ...item, attempts: item.attempts + 1, status: "RETRY" };
        }
      }
      return item;
    });

    storageService.saveOutgoingQueue(updatedQueue);
    storageService.saveForwardedMessageIds(this.forwardedMessageIds);

    if (this.onQueueUpdated) this.onQueueUpdated(updatedQueue);

    if (sentCount > 0) {
      const act = storageService.appendActivity({
        type: "QUEUE_DRAINED",
        summary: `Reconnection sync: ${sentCount} queued message(s) forwarded to nearby peers`,
        sourceDevice: this.localDeviceId
      });
      if (this.onActivityLogged) this.onActivityLogged(act);
    }
  }

  // --- Process Incoming Peer Message (A -> B -> C) ---
  processIncomingPeerMessage(message, senderPeerId) {
    if (!message || typeof message !== "object") return;
    const { messageId, roadId, status, hopCount = 0, maxHops = MAX_HOPS_LIMIT } = message;

    // 1. Check if already seen (Deduplication)
    if (this.seenMessageIds.has(messageId)) {
      console.log(`[Mesh] Ignored duplicate message: ${messageId}`);
      return;
    }

    // 2. Mark as seen
    this.seenMessageIds.add(messageId);
    storageService.saveSeenMessageIds(this.seenMessageIds);

    // 3. Check expiration
    if (message.expiresAt && message.expiresAt < Date.now()) {
      console.log(`[Mesh] Expired message ignored: ${messageId}`);
      return;
    }

    // 4. Check & Update Corroboration / Conflicts
    const currentAlerts = storageService.getAlerts();
    const existingForRoad = currentAlerts.find(a => a.roadId === roadId);

    let isConflict = false;
    let corroborationCount = 1;
    let reportedBy = message.reportedBy || [message.sourceDevice];

    if (existingForRoad) {
      if (existingForRoad.status !== status) {
        // Conflicting reports!
        isConflict = true;
        const conflictRecord = {
          roadId,
          newAlert: message,
          existingAlert: existingForRoad,
          timestamp: Date.now()
        };
        if (this.onConflictDetected) {
          this.onConflictDetected(conflictRecord);
        }

        const act = storageService.appendActivity({
          type: "CONFLICT_DETECTED",
          messageId,
          summary: `Conflict on ${roadId}: [${existingForRoad.status} by ${existingForRoad.sourceDevice}] vs [${status} by ${message.sourceDevice}]`,
          sourceDevice: senderPeerId
        });
        if (this.onActivityLogged) this.onActivityLogged(act);
      } else {
        // Same condition confirmed by another device!
        corroborationCount = (existingForRoad.corroborationCount || 1) + 1;
        if (!reportedBy.includes(existingForRoad.sourceDevice)) {
          reportedBy.push(existingForRoad.sourceDevice);
        }
      }
    }

    const receivedAlert = {
      ...message,
      corroborationCount,
      reportedBy,
      isConflict,
      receivedAt: Date.now()
    };

    const updatedAlerts = [receivedAlert, ...currentAlerts.filter(a => a.messageId !== messageId)];
    storageService.saveAlerts(updatedAlerts);

    // Activity Log
    const act = storageService.appendActivity({
      type: "ALERT_RECEIVED",
      messageId,
      summary: `Received alert from ${senderPeerId}: ${roadId} ${status} (Hop ${hopCount})`,
      sourceDevice: senderPeerId
    });
    if (this.onActivityLogged) this.onActivityLogged(act);

    // Dispatch update to React
    if (this.onNewAlert) {
      this.onNewAlert(receivedAlert, updatedAlerts);
    }

    // 5. Forwarding Decision (A -> B -> C Store-and-Forward)
    if (hopCount >= maxHops) {
      console.log(`[Mesh] Max hop count (${maxHops}) reached for ${messageId}. Forwarding stopped.`);
      return;
    }

    // Increment hop count and relay
    const forwardPayload = {
      ...receivedAlert,
      hopCount: hopCount + 1
    };

    this.forwardOrQueueMessage(forwardPayload);
  }

  // --- Freshness Calculation ---
  static getFreshness(timestamp) {
    const ageMinutes = (Date.now() - timestamp) / (60 * 1000);
    if (ageMinutes < FRESHNESS_CONFIG.FRESH_MINUTES) {
      return { status: "FRESH", label: "Fresh", ageMinutes: Math.round(ageMinutes) };
    }
    if (ageMinutes <= FRESHNESS_CONFIG.AGING_MINUTES) {
      return { status: "AGING", label: "Aging", ageMinutes: Math.round(ageMinutes) };
    }
    return { status: "OUTDATED", label: "Outdated", ageMinutes: Math.round(ageMinutes) };
  }

  // --- Trust & Verification Calculation ---
  static getTrustStatus(alert) {
    const freshness = MessageService.getFreshness(alert.createdAt);
    if (freshness.status === "OUTDATED") {
      return { status: "OUTDATED", label: "Outdated", badgeClass: "badge-dim" };
    }
    if (alert.corroborationCount > 1) {
      return { status: "CORROBORATED", label: `Corroborated (${alert.corroborationCount})`, badgeClass: "badge-safe" };
    }
    if (alert.verified || alert.sourceRole === "RESPONDER") {
      return { status: "VERIFIED", label: "Verified (Responder)", badgeClass: "badge-info" };
    }
    return { status: "UNVERIFIED", label: "Unverified (Volunteer)", badgeClass: "badge-warning" };
  }
}
