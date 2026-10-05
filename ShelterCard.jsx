import React from "react";
import { Home, Users, CheckCircle, AlertTriangle, Navigation, Edit3 } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function ShelterCard({ shelter, onSelectRoute, onEdit }) {
  const { roads, landmarks, calculateRoute, dispatch } = useApp();

  const isFull = shelter.available <= 0 || shelter.status === "FULL";
  const capacityPct = Math.round(((shelter.capacity - shelter.available) / shelter.capacity) * 100);

  // Check if incoming roads to this shelter are safe
  const shelterRoads = roads.filter(r => r.to === shelter.landmarkId || r.from === shelter.landmarkId);
  const isAccessible = shelterRoads.some(r => r.status === "SAFE" || r.status === "CAUTION");
  const isFullyBlocked = shelterRoads.length > 0 && shelterRoads.every(r => r.status === "BLOCKED");

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h4 style={{ fontSize: "1.05rem", color: "#fff", marginBottom: "2px" }}>{shelter.name}</h4>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Coordinator: {shelter.contactPerson}</span>
        </div>
        <span className={`badge ${isFull ? "badge-critical" : "badge-safe"}`}>
          {isFull ? "FULL" : "OPEN"}
        </span>
      </div>

      {/* Capacity bar */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
          <span>Intake: {shelter.capacity - shelter.available} / {shelter.capacity}</span>
          <strong style={{ color: isFull ? "var(--status-critical)" : "var(--status-safe)" }}>
            {shelter.available} Spots Available
          </strong>
        </div>
        <div style={{ width: "100%", height: "6px", backgroundColor: "var(--bg-surface)", borderRadius: "3px", overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min(capacityPct, 100)}%`,
              height: "100%",
              backgroundColor: isFull ? "var(--status-critical)" : capacityPct > 80 ? "var(--status-warning)" : "var(--status-safe)"
            }}
          />
        </div>
      </div>

      {/* Supplies */}
      {shelter.supplies && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {shelter.supplies.map((sup, i) => (
            <span key={i} className="badge badge-dim" style={{ fontSize: "0.68rem" }}>
              {sup}
            </span>
          ))}
        </div>
      )}

      {/* Route accessibility badge */}
      <div style={{ fontSize: "0.78rem", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
        {isFullyBlocked ? (
          <span style={{ color: "var(--status-critical)", display: "flex", alignItems: "center", gap: "4px" }}>
            <AlertTriangle size={14} /> Corridors Currently Blocked
          </span>
        ) : (
          <span style={{ color: "var(--status-safe)", display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle size={14} /> Safe Access Corridor Open
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(shelter)}
        >
          <Edit3 size={12} /> Update Intake
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            dispatch({ type: "SET_DESTINATION", payload: shelter.landmarkId });
            calculateRoute(undefined, shelter.landmarkId);
            dispatch({ type: "SET_ACTIVE_TAB", payload: "map" });
          }}
        >
          <Navigation size={12} /> Route Here
        </button>
      </div>
    </div>
  );
}
