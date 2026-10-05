/**
 * Storage Service for ResQRoute
 * Persistent local browser storage using LocalStorage & SessionStorage.
 */

const STORAGE_KEYS = {
  DEVICE_PROFILE: "resqroute_device_profile",
  ALERTS: "resqroute_alerts",
  ROADS: "resqroute_roads",
  SHELTERS: "resqroute_shelters",
  OUTGOING_QUEUE: "resqroute_outgoing_queue",
  SEEN_MESSAGE_IDS: "resqroute_seen_message_ids",
  FORWARDED_MESSAGE_IDS: "resqroute_forwarded_ids",
  ACTIVITY_LOG: "resqroute_activity_log",
  NETWORK_ROOM: "resqroute_network_room"
};

class StorageService {
  constructor() {
    this.memoryFallback = new Map();
    this.isLocalStorageAvailable = this.checkStorageAvailability();
  }

  checkStorageAvailability() {
    try {
      const testKey = "__resqroute_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get(key, defaultValue = null) {
    if (this.isLocalStorageAvailable) {
      try {
        const item = window.localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
      } catch (err) {
        console.error(`StorageService: Error reading key "${key}"`, err);
        return defaultValue;
      }
    }
    return this.memoryFallback.has(key) ? this.memoryFallback.get(key) : defaultValue;
  }

  set(key, value) {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.error(`StorageService: Error writing key "${key}"`, err);
      }
    }
    this.memoryFallback.set(key, value);
    return true;
  }

  remove(key) {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.error(`StorageService: Error removing key "${key}"`, err);
      }
    }
    this.memoryFallback.delete(key);
  }

  // Device Profile: Distinct identity per tab/window for multi-window simulation
  getDeviceProfile(defaultRole = "RESPONDER") {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const sessionProfile = window.sessionStorage.getItem(STORAGE_KEYS.DEVICE_PROFILE);
        if (sessionProfile) {
          return JSON.parse(sessionProfile);
        }
      }
    } catch (e) {
      console.warn("SessionStorage not available for device profile:", e);
    }

    const randomTag = Math.random().toString(36).substring(2, 6).toUpperCase();
    const rolePrefix = (defaultRole || "RESPONDER").toUpperCase();
    const newProfile = {
      deviceId: `${rolePrefix}-${randomTag}`,
      deviceName: `${rolePrefix.charAt(0) + rolePrefix.slice(1).toLowerCase()} Unit ${randomTag}`,
      deviceRole: rolePrefix,
      roomName: "RESQ-2026",
      createdAt: Date.now()
    };

    this.saveDeviceProfile(newProfile);
    return newProfile;
  }

  saveDeviceProfile(profile) {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(STORAGE_KEYS.DEVICE_PROFILE, JSON.stringify(profile));
      }
    } catch (e) {
      console.warn("SessionStorage write failed:", e);
    }
    return this.set(STORAGE_KEYS.DEVICE_PROFILE, profile);
  }

  // Alerts
  getAlerts(seedFallback = []) {
    const alerts = this.get(STORAGE_KEYS.ALERTS);
    if (alerts && Array.isArray(alerts) && alerts.length > 0) {
      return alerts;
    }
    if (seedFallback.length > 0) {
      this.set(STORAGE_KEYS.ALERTS, seedFallback);
      return seedFallback;
    }
    return [];
  }

  saveAlerts(alerts) {
    return this.set(STORAGE_KEYS.ALERTS, alerts);
  }

  // Roads & Shelters
  getRoads(seedFallback = []) {
    const roads = this.get(STORAGE_KEYS.ROADS);
    if (roads && Array.isArray(roads) && roads.length > 0) {
      return roads;
    }
    if (seedFallback.length > 0) {
      this.set(STORAGE_KEYS.ROADS, seedFallback);
      return seedFallback;
    }
    return [];
  }

  saveRoads(roads) {
    return this.set(STORAGE_KEYS.ROADS, roads);
  }

  getShelters(seedFallback = []) {
    const shelters = this.get(STORAGE_KEYS.SHELTERS);
    if (shelters && Array.isArray(shelters) && shelters.length > 0) {
      return shelters;
    }
    if (seedFallback.length > 0) {
      this.set(STORAGE_KEYS.SHELTERS, seedFallback);
      return seedFallback;
    }
    return [];
  }

  saveShelters(shelters) {
    return this.set(STORAGE_KEYS.SHELTERS, shelters);
  }

  // Outbox Queue
  getOutgoingQueue() {
    return this.get(STORAGE_KEYS.OUTGOING_QUEUE, []);
  }

  saveOutgoingQueue(queue) {
    return this.set(STORAGE_KEYS.OUTGOING_QUEUE, queue);
  }

  // Deduplication
  getSeenMessageIds() {
    return new Set(this.get(STORAGE_KEYS.SEEN_MESSAGE_IDS, []));
  }

  saveSeenMessageIds(setOfIds) {
    return this.set(STORAGE_KEYS.SEEN_MESSAGE_IDS, Array.from(setOfIds));
  }

  getForwardedMessageIds() {
    return new Set(this.get(STORAGE_KEYS.FORWARDED_MESSAGE_IDS, []));
  }

  saveForwardedMessageIds(setOfIds) {
    return this.set(STORAGE_KEYS.FORWARDED_MESSAGE_IDS, Array.from(setOfIds));
  }

  // Activity Log
  getActivityLog() {
    return this.get(STORAGE_KEYS.ACTIVITY_LOG, []);
  }

  saveActivityLog(log) {
    const trimmed = log.slice(0, 150);
    return this.set(STORAGE_KEYS.ACTIVITY_LOG, trimmed);
  }

  appendActivity(entry) {
    const log = this.getActivityLog();
    const newEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      ...entry
    };
    log.unshift(newEntry);
    this.saveActivityLog(log);
    return newEntry;
  }

  // Clear demo / Reset all
  clearAll() {
    if (this.isLocalStorageAvailable) {
      try {
        Object.values(STORAGE_KEYS).forEach(k => window.localStorage.removeItem(k));
        if (window.sessionStorage) window.sessionStorage.clear();
      } catch (e) {
        console.error(e);
      }
    }
    this.memoryFallback.clear();
  }
}

export const storageService = new StorageService();
export { STORAGE_KEYS };
