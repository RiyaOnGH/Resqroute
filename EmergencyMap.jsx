import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Plus, Minus, RotateCcw, AlertTriangle, Shield, Cross, Home, School, Tent, MapPin, Navigation } from "lucide-react";
import { MapLegend } from "./MapLegend";

export function EmergencyMap({ onSelectRoad, onSelectLandmark }) {
  const { landmarks, roads, dangers, activeRoute, selectedRoadId } = useApp();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState(null);

  const containerRef = useRef(null);

  const viewBoxWidth = 640;
  const viewBoxHeight = 520;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Landmark dictionary
  const landmarkMap = new Map();
  landmarks.forEach(l => landmarkMap.set(l.id, l));

  // Determine road color & width
  const getRoadColor = (status) => {
    switch (status) {
      case "SAFE": return "#10b981"; // green
      case "CAUTION": return "#f59e0b"; // yellow
      case "BLOCKED": return "#ef4444"; // red
      default: return "#64748b"; // gray
    }
  };

  // Check if road is in active route
  const isRoadInActiveRoute = (road) => {
    if (!activeRoute || !activeRoute.pathRoads) return false;
    return activeRoute.pathRoads.some(r => r.id === road.id);
  };

  const getLandmarkIcon = (type) => {
    switch (type) {
      case "BASE": return <Shield size={14} color="#3b82f6" />;
      case "HOSPITAL": return <Cross size={14} color="#ef4444" />;
      case "SHELTER": return <Home size={14} color="#10b981" />;
      case "SCHOOL": return <School size={14} color="#f59e0b" />;
      case "VILLAGE": return <MapPin size={14} color="#06b6d4" />;
      default: return <MapPin size={14} color="#94a3b8" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="map-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom / Pan Controls */}
      <div className="map-controls">
        <button className="map-btn" onClick={handleZoomIn} title="Zoom In">
          <Plus size={16} />
        </button>
        <button className="map-btn" onClick={handleZoomOut} title="Zoom Out">
          <Minus size={16} />
        </button>
        <button className="map-btn" onClick={handleReset} title="Reset View">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* SVG Map Canvas */}
      <svg
        className="map-svg"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid background mesh */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={viewBoxWidth * 2} height={viewBoxHeight * 2} x="-200" y="-200" fill="url(#grid)" />

          {/* 1. Roads */}
          {roads.map((road) => {
            const from = landmarkMap.get(road.from);
            const to = landmarkMap.get(road.to);
            if (!from || !to) return null;

            const isSelected = road.id === selectedRoadId;
            const inRoute = isRoadInActiveRoute(road);
            const strokeColor = getRoadColor(road.status);

            return (
              <g
                key={road.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectRoad) onSelectRoad(road.id);
                }}
                onMouseEnter={() => setHoveredEntity({ type: "ROAD", data: road })}
                onMouseLeave={() => setHoveredEntity(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Thick invisible click target */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="transparent"
                  strokeWidth="20"
                />

                {/* Road Line */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 6 : 4}
                  strokeDasharray={road.status === "CAUTION" ? "6 4" : "none"}
                />

                {/* Active Route Highlight Overlay */}
                {inRoute && (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Road Name Label along midpoint */}
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 6}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {road.name || road.id}
                </text>
              </g>
            );
          })}

          {/* 2. Danger Hazards */}
          {dangers.map((dng) => (
            <g key={dng.id} transform={`translate(${dng.x}, ${dng.y})`}>
              <circle r="16" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
              <circle r="6" fill="#ef4444" />
              <text x="0" y="24" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">
                {dng.title}
              </text>
            </g>
          ))}

          {/* 3. Landmarks / Nodes */}
          {landmarks.map((l) => (
            <g
              key={l.id}
              transform={`translate(${l.x}, ${l.y})`}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectLandmark) onSelectLandmark(l.id);
              }}
              style={{ cursor: "pointer" }}
            >
              {/* Node Outer Ring */}
              <circle
                r="14"
                fill="#131b2e"
                stroke="var(--border-strong)"
                strokeWidth="2"
              />
              {/* Icon Container */}
              <foreignObject x="-7" y="-7" width="14" height="14">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getLandmarkIcon(l.type)}
                </div>
              </foreignObject>
              {/* Label */}
              <text
                x="0"
                y="24"
                fill="#fff"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                {l.name}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* Legend Overlay */}
      <MapLegend />

      {/* Hover Info Tooltip */}
      {hoveredEntity && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "rgba(19, 27, 46, 0.95)",
            border: "1px solid var(--border-active)",
            borderRadius: "6px",
            padding: "8px 12px",
            fontSize: "0.8rem",
            color: "#fff",
            zIndex: 10,
            pointerEvents: "none"
          }}
        >
          <strong>{hoveredEntity.data.name || hoveredEntity.data.id}</strong>
          <div>Status: <span style={{ color: getRoadColor(hoveredEntity.data.status) }}>{hoveredEntity.data.status}</span></div>
          {hoveredEntity.data.reason && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{hoveredEntity.data.reason}</div>}
        </div>
      )}
    </div>
  );
}
