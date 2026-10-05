import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Socket.IO server configured with open CORS for local hotspots/LAN
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory room and peer registry
// roomName -> Map(socketId -> { deviceId, role, deviceName, socketId })
const rooms = new Map();

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push({ iface: name, address: iface.address });
      }
    }
  }
  return addresses;
}

// REST status endpoint
app.get("/api/status", (req, res) => {
  const allPeers = [];
  rooms.forEach((peerMap, roomName) => {
    peerMap.forEach(peer => {
      allPeers.push({ ...peer, room: roomName });
    });
  });

  res.json({
    name: "ResQRoute Local Emergency Signaling Hub",
    status: "ACTIVE",
    timestamp: Date.now(),
    localIps: getLocalIpAddresses(),
    totalConnectedPeers: allPeers.length,
    rooms: Array.from(rooms.keys()),
    peers: allPeers
  });
});

// Static client build hosting fallback
const clientDistPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Socket.IO Signaling logic
io.on("connection", (socket) => {
  let currentRoom = null;
  let currentDeviceId = socket.handshake.query.deviceId || null;
  let currentRole = socket.handshake.query.role || "VOLUNTEER";

  console.log(`[Signaling] Socket connected: ${socket.id} (DeviceId: ${currentDeviceId || "Unknown"})`);

  socket.on("join-room", (data) => {
    const roomName = (data?.room || "RESQ-2026").trim().toUpperCase();
    const deviceId = data?.deviceId || currentDeviceId || `DEV-${socket.id.slice(0, 4)}`;
    const role = data?.role || currentRole || "VOLUNTEER";
    const deviceName = data?.deviceName || deviceId;

    currentRoom = roomName;
    currentDeviceId = deviceId;
    currentRole = role;

    socket.join(roomName);

    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Map());
    }

    const roomPeers = rooms.get(roomName);
    
    // Notify existing peers about this new peer
    socket.to(roomName).emit("peer-joined", {
      deviceId,
      role,
      deviceName,
      socketId: socket.id,
      timestamp: Date.now()
    });

    // Send existing peers list to the newly joined peer
    const existingList = [];
    roomPeers.forEach((peerInfo) => {
      if (peerInfo.deviceId !== deviceId) {
        existingList.push(peerInfo);
      }
    });

    socket.emit("room-peers", {
      room: roomName,
      peers: existingList
    });

    // Store this peer
    roomPeers.set(socket.id, {
      deviceId,
      role,
      deviceName,
      socketId: socket.id,
      joinedAt: Date.now()
    });

    console.log(`[Signaling] Device ${deviceId} (${role}) joined room [${roomName}]. Total room peers: ${roomPeers.size}`);
  });

  // WebRTC Signal Forwarding (Offer, Answer, ICE Candidate)
  socket.on("signal", (payload) => {
    if (!payload || !currentRoom) return;

    const { targetPeerId } = payload;
    const roomPeers = rooms.get(currentRoom);

    if (targetPeerId && roomPeers) {
      let targetSocketId = null;
      for (const [sId, pInfo] of roomPeers.entries()) {
        if (pInfo.deviceId === targetPeerId) {
          targetSocketId = sId;
          break;
        }
      }

      if (targetSocketId) {
        io.to(targetSocketId).emit("signal", payload);
      } else {
        socket.to(currentRoom).emit("signal", payload);
      }
    } else {
      socket.to(currentRoom).emit("signal", payload);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Signaling] Socket disconnected: ${socket.id} (${currentDeviceId})`);
    if (currentRoom && rooms.has(currentRoom)) {
      const roomPeers = rooms.get(currentRoom);
      roomPeers.delete(socket.id);
      if (roomPeers.size === 0) {
        rooms.delete(currentRoom);
      } else {
        socket.to(currentRoom).emit("peer-left", currentDeviceId);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIpAddresses();
  console.log("\n=======================================================");
  console.log("       ResQRoute Emergency Signaling Server             ");
  console.log("=======================================================");
  console.log(` Server active on port: ${PORT}`);
  console.log(" Local access:        http://localhost:" + PORT);
  if (ips.length > 0) {
    console.log(" Network/Hotspot URLs:");
    ips.forEach(ip => {
      console.log(`   - http://${ip.address}:${PORT} (Signaling)`);
      console.log(`   - http://${ip.address}:5173 (Client Web App)`);
    });
  } else {
    console.log(" Connect your laptop/phone to a Wi-Fi hotspot to demo across 3 devices.");
  }
  console.log(" Default Room: RESQ-2026");
  console.log("=======================================================\n");
});
