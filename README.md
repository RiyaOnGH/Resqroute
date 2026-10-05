# ResQRoute

**Offline-First Emergency Route & Information Exchange System**

ResQRoute is an emergency communication system designed for disasters when internet and cellular networks collapse.
It allows responders, volunteers, and evacuation shelters to exchange critical road hazards, flood warnings, and shelter updates peer-to-peer using local WebRTC DataChannels.
Information moves across disconnected sectors using a store-and-forward relay model (**Device A → Device B → Device C**).
The entire system operates 100% offline with zero external cloud APIs, zero maps keys, and zero external databases.

---

## What It Demonstrates

1. **Offline Vector Map**: Interactive local SVG map showing roads, shelters, hospital, school, and villages with zero internet or Google Maps dependencies.
2. **Emergency Alerts**: Standardized structured alerts for road blocks, floods, landslides, shelter capacities, and SOS calls.
3. **Peer-to-Peer Communication**: Direct device-to-device data exchange using browser WebRTC DataChannels over local Wi-Fi or phone hotspots.
4. **Store-and-Forward Mesh Relay**: A moving vehicle or volunteer carries emergency packets between disconnected sectors (**A → B → C**).
5. **Deduplication & Hop Limits**: Prevents broadcast storms using unique `messageId` tracking and a maximum hop limit (`maxHops = 5`).
6. **Alert Freshness & Trust**: Classifies reports as *Fresh* (<30m), *Aging* (30–120m), or *Outdated* (>120m with warnings), and tracks verification (*Verified*, *Unverified*, *Corroborated*).
7. **Conflict Detection**: Preserves competing field updates without silent overwriting when conditions change or reports disagree.
8. **Dijkstra Safe Route Guidance**: Computes evacuation paths that actively circumvent impassable roads and transparently explains why blocked bridges were avoided.
9. **Offline PWA Shell**: Service Worker and Web App Manifest cache the application shell so it reopens and functions without internet.

---

## Technology Stack

* **Frontend**: React 19, Vite, Lucide Icons, Plain CSS Design Tokens
* **Backend**: Node.js, Express, Socket.IO (Local signaling & room coordination)
* **P2P Transport**: WebRTC DataChannels (`RTCDataChannel`, `RTCPeerConnection`)
* **Transport Abstraction**: Pluggable `ITransport` layer (WebRTC active; Bluetooth & LoRa future stubs)
* **Storage**: Browser LocalStorage & SessionStorage (Zero database setup required)
* **PWA**: Cache-first Service Worker (`sw.js`) and Web App Manifest (`manifest.json`)

---

## Project Structure

```text
resqroute/
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── alerts/        # AlertCard, ConflictingAlertsModal
│   │   │   ├── common/        # ConnectionStatus, Modal, ToastContainer, EmptyState
│   │   │   ├── devices/       # DeviceCard, SignalingConfigModal
│   │   │   ├── map/           # EmergencyMap (SVG), RouteCalculator, RoadInspector, MapLegend
│   │   │   └── shelters/      # ShelterCard, UpdateShelterModal
│   │   ├── context/
│   │   │   └── AppContext.jsx # Central state management & actions
│   │   ├── data/
│   │   │   └── seedData.js    # Local topology, roads, landmarks, shelters
│   │   ├── pages/             # Dashboard, Map, Alerts, Devices, Shelters, Queue, Activity, Demo, Settings
│   │   ├── services/
│   │   │   ├── messaging/     # Deduplication, hops, freshness, conflicts
│   │   │   ├── route/         # Dijkstra safe routing engine
│   │   │   ├── signaling/     # Dual-mode (BroadcastChannel + Socket.IO)
│   │   │   ├── storage/       # LocalStorage persistence engine
│   │   │   ├── transport/     # ITransport abstraction layer
│   │   │   └── webrtc/        # WebRTC DataChannel engine
│   │   ├── styles/            # Emergency operations dark theme CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── server.js              # Express + Socket.IO local signaling server
│   └── package.json
├── README.md
└── package.json
```

---

## How to Run

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` installed and available

### 2. Setup & Installation
```bash
# Clone or navigate to the project directory
cd resqroute

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Return to root
cd ..
```

### 3. Starting the Application
You can start the server and client in two terminals, or run them from root:

**Terminal 1 (Signaling Server):**
```bash
npm run server
```
*Starts on port 3001 and displays your local IP addresses.*

**Terminal 2 (Client Web App):**
```bash
npm run client
```
*Starts the Vite dev server with host exposure on `http://localhost:5173`.*

---

## How to Demo on 3 Devices (Hotspot / Local Wi-Fi)

This is the recommended demonstration for hackathon judges:

### Hardware Setup
* 1 Host Laptop (runs the local server and acts as **Device A: Responder**)
* 1 Phone or Laptop (**Device B: Volunteer**)
* 1 Phone or Laptop (**Device C: Shelter / Evacuation Centre**)
* 1 Portable Wi-Fi Router or Phone Hotspot (**WAN Internet turned OFF**)

### Step-by-Step Field Instructions

1. **Connect All Devices to the Same Hotspot**:
   Connect Laptop A, Phone B, and Phone C to the same local Wi-Fi hotspot.
   Turn **OFF mobile data / internet** on the hotspot phone. (Devices only need to talk to each other over local IP, no internet required!)

2. **Start the ResQRoute Server on Laptop A**:
   ```bash
   cd resqroute
   npm run server
   ```
   Note the local IP address displayed in the console, for example: `http://192.168.1.105:3001`.

3. **Start the Client**:
   ```bash
   npm run client
   ```
   The client will be accessible across your local hotspot at `http://192.168.1.105:5173`.

4. **Open ResQRoute on All 3 Devices**:
   * Open `http://localhost:5173` on **Laptop A**.
   * Open `http://192.168.1.105:5173` in the browser on **Phone B**.
   * Open `http://192.168.1.105:5173` in the browser on **Phone C**.

5. **Assign Roles & Join Room**:
   * On **Device A**: In Settings or the top bar, ensure role is **RESPONDER** (Device ID: `RESPONDER-XXXX`).
   * On **Device B**: Change role to **VOLUNTEER** (Device ID: `VOLUNTEER-YYYY`).
   * On **Device C**: Change role to **SHELTER** (Device ID: `SHELTER-ZZZZ`).
   * All devices default to Room **RESQ-2026**.

6. **Demonstrate Store-and-Forward (A → B → C)**:
   * **On Device A (Responder)**:
     Go to **Create Alert**. Select `Bridge Road`, status `BLOCKED`, reason `Flood`, priority `HIGH`. Click **Send Alert**.
     The map updates immediately on Device A.
   * **On Device B (Volunteer)**:
     Device B receives the alert over the WebRTC DataChannel (`hopCount = 1`) and stores it in local storage.
   * **Simulate Device C Joining Out-of-Range**:
     Device B connects to Device C (or Device C enters the room). Device B forwards the cached alert to Device C (`hopCount = 2`).
   * **On Device C (Shelter)**:
     Device C receives the relayed alert! Notice the provenance badge: `Reported by RESPONDER-XXXX (Hop 2)`.
   * **Observe Safe Rerouting on Map**:
     On Device C, open **District Map**. Notice `Bridge Road` is red (`BLOCKED`).
     Click **Calculate Safe Route** from `Central Valley Junction` to `Community Shelter A`.
     The Dijkstra engine automatically routes around the flooded bridge and explicitly states:
     `"Bridge Road skipped because it is BLOCKED (Flood water over bridge deck)."`.

7. **Reset for Next Judge**:
   Click **Reset Demo Data** in the top bar or Demo Studio to restore the starting baseline in one click.

---

## Architectural Transport Layer Abstraction

ResQRoute decouples emergency messaging from the physical transmission layer via the `ITransport` abstraction:

```text
         ResQRoute Application Core
                     │
          Emergency Message Packet
                     │
           ITransport Interface
                     │
   ┌─────────────────┼─────────────────┐
   ▼                 ▼                 ▼
WebRTC DataChannel  Bluetooth LE     LoRa Radio
  (Active MVP)      (Future Plug)   (Future Plug)
```

* **MVP Implementation**: Browser WebRTC DataChannel engine for direct device-to-device transport without cloud servers.
* **Future Hardware Support**: The architecture allows dropping in Web Bluetooth (BLE mesh) or serial LoRa modems without rewriting any routing, deduplication, or UI components.

---

## Technical Honesty & Limitations

* **No Hardware Radio Claims**: This MVP uses standard Wi-Fi/hotspot local IP networking with WebRTC DataChannels. It does not claim direct physical Wi-Fi Direct or hardware LoRa radios at this stage.
* **Signaling**: WebRTC requires an initial signaling exchange (performed locally via BroadcastChannel for multi-tab testing, or the local Node/Socket.IO server for multi-device hotspot setups). Once connected, all emergency data flows directly peer-to-peer.
* **Browser Sandbox**: Operates fully inside modern web browsers with PWA install support.
