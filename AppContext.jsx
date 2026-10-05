/**
 * AppContext - Centralized State Management for ResQRoute
 */

import React, { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { storageService } from "../services/storage/storageService";
import { SignalingService } from "../services/signaling/signalingService";
import { WebRTCService } from "../services/webrtc/webrtcService";
import { WebRTCTransport } from "../services/transport/ITransport";
import { MessageService } from "../services/messaging/messageService";
import { RouteService } from "../services/route/routeService";
import {
  INITIAL_LANDMARKS,
  INITIAL_ROADS,
  INITIAL_SHELTERS,
  INITIAL_DANGERS,
  INITIAL_ALERTS
} from "../data/seedData";

const AppContext = createContext(null);

const initialState = {
  // Device Identity
  deviceId: "RESPONDER-DEMO",
  deviceName: "Emergency Unit",
  deviceRole: "RESPONDER",
  roomName: "RESQ-2026",

  // Network & Signaling
  internetOnline: typeof navigator !== "undefined" ? navigator.onLine : false,
  localNetworkConnected: true,
  simulatedInternetOffline: true, // Emergency demo defaults: internet OFF, local ON
  signalingStatus: "STANDBY",
  signalingMode: "broadcast",

  // Peers
  peers: [],
  connectedPeersCount: 0,

  // Alerts
  alerts: [],
  selectedAlert: null,
  activeFilter: "ALL",
  conflicts: [],

  // Queue
  outgoingQueue: [],

  // Map & Routes
  landmarks: INITIAL_LANDMARKS,
  roads: [],
  dangers: INITIAL_DANGERS,
  selectedRoadId: null,
  selectedOrigin: "LOC-EOC",
  selectedDestination: "LOC-SHELTER-A",
  activeRoute: null,

  // Shelters
  shelters: [],
  selectedShelterId: null,

  // Activity Log
  activityLog: [],

  // UI
  activeTab: "dashboard",
  toasts: [],
  modal: null
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_DEVICE_PROFILE":
      return {
        ...state,
        deviceId: action.payload.deviceId,
        deviceName: action.payload.deviceName,
        deviceRole: action.payload.deviceRole,
        roomName: action.payload.roomName || state.roomName
      };

    case "SET_DEVICE_ROLE": {
      const role = action.payload;
      const tag = state.deviceId.includes("-") ? state.deviceId.split("-")[1] : "A7F2";
      const newId = `${role}-${tag}`;
      return {
        ...state,
        deviceRole: role,
        deviceId: newId
      };
    }

    case "SET_ROOM_NAME":
      return { ...state, roomName: action.payload };

    case "SET_INTERNET_STATUS":
      return { ...state, internetOnline: action.payload };

    case "TOGGLE_SIMULATED_INTERNET":
      return { ...state, simulatedInternetOffline: !state.simulatedInternetOffline };

    case "SET_SIGNALING_STATUS":
      return { ...state, signalingStatus: action.payload };

    case "SET_SIGNALING_MODE":
      return { ...state, signalingMode: action.payload };

    case "SET_PEERS": {
      const connectedCount = action.payload.filter(p => p.state === "CONNECTED").length;
      return {
        ...state,
        peers: action.payload,
        connectedPeersCount: connectedCount
      };
    }

    case "SET_ALERTS":
      return { ...state, alerts: action.payload };

    case "SET_SELECTED_ALERT":
      return { ...state, selectedAlert: action.payload };

    case "SET_ACTIVE_FILTER":
      return { ...state, activeFilter: action.payload };

    case "ADD_CONFLICT":
      return { ...state, conflicts: [action.payload, ...state.conflicts] };

    case "SET_QUEUE":
      return { ...state, outgoingQueue: action.payload };

    case "SET_ROADS":
      return { ...state, roads: action.payload };

    case "SET_SELECTED_ROAD":
      return { ...state, selectedRoadId: action.payload };

    case "SET_ORIGIN":
      return { ...state, selectedOrigin: action.payload };

    case "SET_DESTINATION":
      return { ...state, selectedDestination: action.payload };

    case "SET_ACTIVE_ROUTE":
      return { ...state, activeRoute: action.payload };

    case "SET_SHELTERS":
      return { ...state, shelters: action.payload };

    case "SET_SELECTED_SHELTER":
      return { ...state, selectedShelterId: action.payload };

    case "SET_ACTIVITY_LOG":
      return { ...state, activityLog: action.payload };

    case "APPEND_ACTIVITY":
      return { ...state, activityLog: [action.payload, ...state.activityLog] };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    case "SET_MODAL":
      return { ...state, modal: action.payload };

    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, { id: `t-${Date.now()}-${Math.random()}`, ...action.payload }]
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload)
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const signalingRef = useRef(null);
  const webrtcRef = useRef(null);
  const transportRef = useRef(null);
  const messageServiceRef = useRef(null);

  // Initialize
  useEffect(() => {
    const profile = storageService.getDeviceProfile();
    dispatch({ type: "SET_DEVICE_PROFILE", payload: profile });

    const savedAlerts = storageService.getAlerts(INITIAL_ALERTS);
    dispatch({ type: "SET_ALERTS", payload: savedAlerts });

    const savedRoads = storageService.getRoads(INITIAL_ROADS);
    dispatch({ type: "SET_ROADS", payload: savedRoads });

    const savedShelters = storageService.getShelters(INITIAL_SHELTERS);
    dispatch({ type: "SET_SHELTERS", payload: savedShelters });

    const savedQueue = storageService.getOutgoingQueue();
    dispatch({ type: "SET_QUEUE", payload: savedQueue });

    const savedActivity = storageService.getActivityLog();
    dispatch({ type: "SET_ACTIVITY_LOG", payload: savedActivity });

    // Online/Offline detection
    const handleOnline = () => dispatch({ type: "SET_INTERNET_STATUS", payload: true });
    const handleOffline = () => dispatch({ type: "SET_INTERNET_STATUS", payload: false });
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initialize Services
    const signaling = new SignalingService(profile.deviceId, profile.deviceRole, profile.roomName);
    signalingRef.current = signaling;

    signaling.onStatusChange = (st) => dispatch({ type: "SET_SIGNALING_STATUS", payload: st });

    const webrtc = new WebRTCService(profile.deviceId, profile.deviceRole, signaling);
    webrtcRef.current = webrtc;

    transportRef.current = new WebRTCTransport(webrtc);

    webrtc.onPeerConnectionChange = (peersList) => {
      dispatch({ type: "SET_PEERS", payload: peersList });
    };

    const messageService = new MessageService(profile.deviceId, profile.deviceRole, webrtc);
    messageServiceRef.current = messageService;

    messageService.onNewAlert = (newAlert, allAlerts) => {
      dispatch({ type: "SET_ALERTS", payload: allAlerts });

      // If road status updated, sync to road network
      const currentRoads = storageService.getRoads();
      const rIdx = currentRoads.findIndex(r => r.id === newAlert.roadId);
      if (rIdx !== -1) {
        currentRoads[rIdx].status = newAlert.status;
        currentRoads[rIdx].reason = newAlert.reason;
        storageService.saveRoads(currentRoads);
        dispatch({ type: "SET_ROADS", payload: [...currentRoads] });
      }

      dispatch({
        type: "ADD_TOAST",
        payload: {
          title: `Alert Received: ${newAlert.roadId}`,
          message: `${newAlert.status} — ${newAlert.reason} (Hop ${newAlert.hopCount})`,
          type: newAlert.status === "BLOCKED" ? "critical" : "safe"
        }
      });
    };

    messageService.onQueueUpdated = (q) => dispatch({ type: "SET_QUEUE", payload: q });
    messageService.onConflictDetected = (c) => dispatch({ type: "ADD_CONFLICT", payload: c });
    messageService.onActivityLogged = (act) => dispatch({ type: "APPEND_ACTIVITY", payload: act });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      signaling.destroy();
      webrtc.destroy();
    };
  }, []);

  // Update Identity & Room
  const setDeviceRole = (newRole) => {
    dispatch({ type: "SET_DEVICE_ROLE", payload: newRole });
    const tag = state.deviceId.includes("-") ? state.deviceId.split("-")[1] : "A7F2";
    const updatedId = `${newRole}-${tag}`;
    const updatedProfile = {
      ...storageService.getDeviceProfile(),
      deviceId: updatedId,
      deviceRole: newRole
    };
    storageService.saveDeviceProfile(updatedProfile);

    if (signalingRef.current) {
      signalingRef.current.updateLocalIdentity(updatedId, newRole, state.roomName);
    }
    if (webrtcRef.current) {
      webrtcRef.current.localDeviceId = updatedId;
      webrtcRef.current.localRole = newRole;
    }
    if (messageServiceRef.current) {
      messageServiceRef.current.updateLocalIdentity(updatedId, newRole);
    }
  };

  const joinNetworkRoom = (newRoom) => {
    const trimmed = (newRoom || "RESQ-2026").trim().toUpperCase();
    dispatch({ type: "SET_ROOM_NAME", payload: trimmed });
    const profile = { ...storageService.getDeviceProfile(), roomName: trimmed };
    storageService.saveDeviceProfile(profile);

    if (signalingRef.current) {
      signalingRef.current.updateLocalIdentity(state.deviceId, state.deviceRole, trimmed);
      if (signalingRef.current.mode === "broadcast") {
        signalingRef.current.initBroadcastChannel();
      }
    }
  };

  const connectToSignalingServer = (url) => {
    if (signalingRef.current) {
      signalingRef.current.connectSocketIO(url);
      dispatch({ type: "SET_SIGNALING_MODE", payload: "socketio" });
    }
  };

  const switchToBroadcastMesh = () => {
    if (signalingRef.current) {
      signalingRef.current.disconnectSocketIO();
      dispatch({ type: "SET_SIGNALING_MODE", payload: "broadcast" });
    }
  };

  const connectPeer = (peerId) => {
    if (webrtcRef.current) {
      webrtcRef.current.connectToPeer(peerId);
    }
  };

  const createAlert = (alertPayload) => {
    if (!messageServiceRef.current) return { success: false };
    const res = messageServiceRef.current.createAlert(alertPayload);
    if (res.success) {
      // Sync to roads
      const currentRoads = storageService.getRoads();
      const idx = currentRoads.findIndex(r => r.id === res.alert.roadId);
      if (idx !== -1) {
        currentRoads[idx].status = res.alert.status;
        currentRoads[idx].reason = res.alert.reason;
        storageService.saveRoads(currentRoads);
        dispatch({ type: "SET_ROADS", payload: [...currentRoads] });
      }

      dispatch({
        type: "ADD_TOAST",
        payload: {
          title: "Alert Broadcasted",
          message: `${res.alert.roadId} marked as ${res.alert.status}`,
          type: res.alert.status === "BLOCKED" ? "critical" : "safe"
        }
      });
    }
    return res;
  };

  const calculateRoute = (orig = state.selectedOrigin, dest = state.selectedDestination) => {
    const result = RouteService.findSafeRoute(orig, dest, state.landmarks, state.roads);
    dispatch({ type: "SET_ACTIVE_ROUTE", payload: result });
    return result;
  };

  const updateShelter = (shelterId, patch) => {
    const current = [...state.shelters];
    const idx = current.findIndex(s => s.id === shelterId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...patch };
      storageService.saveShelters(current);
      dispatch({ type: "SET_SHELTERS", payload: current });
      dispatch({
        type: "ADD_TOAST",
        payload: {
          title: "Shelter Updated",
          message: `${current[idx].name} updated (${current[idx].available} spots available)`
        }
      });
    }
  };

  const resetDemoData = () => {
    storageService.clearAll();
    dispatch({ type: "SET_ROADS", payload: [...INITIAL_ROADS] });
    dispatch({ type: "SET_SHELTERS", payload: [...INITIAL_SHELTERS] });
    dispatch({ type: "SET_ALERTS", payload: [...INITIAL_ALERTS] });
    dispatch({ type: "SET_QUEUE", payload: [] });
    dispatch({ type: "SET_ACTIVITY_LOG", payload: [] });
    dispatch({ type: "SET_ACTIVE_ROUTE", payload: null });
    dispatch({
      type: "ADD_TOAST",
      payload: {
        title: "Demo Reset Complete",
        message: "Network restored to initial baseline state.",
        type: "safe"
      }
    });
  };

  const value = {
    ...state,
    dispatch,
    setDeviceRole,
    joinNetworkRoom,
    connectToSignalingServer,
    switchToBroadcastMesh,
    connectPeer,
    createAlert,
    calculateRoute,
    updateShelter,
    resetDemoData,
    transport: transportRef.current
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
