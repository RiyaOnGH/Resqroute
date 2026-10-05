import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Navigation, AlertTriangle, CheckCircle, ArrowRight, Info } from "lucide-react";

export function RouteCalculator() {
  const { landmarks, selectedOrigin, selectedDestination, activeRoute, calculateRoute, dispatch } = useApp();

  const [origin, setOrigin] = useState(selectedOrigin || "LOC-VILLAGE");
  const [destination, setDestination] = useState(selectedDestination || "LOC-SHELTER-A");

  const handleCalculate = (e) => {
    e.preventDefault();
    dispatch({ type: "SET_ORIGIN", payload: origin });
    dispatch({ type: "SET_DESTINATION", payload: destination });
    calculateRoute(origin, destination);
  };

  const landmarkMap = new Map();
  landmarks.forEach(l => landmarkMap.set(l.id, l.name));

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Navigation size={18} color="var(--status-info)" />
          Safe Route Recommender
        </h3>
        <span className="badge badge-info">Dijkstra Engine</span>
      </div>

      <form onSubmit={handleCalculate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", alignItems: "end", marginBottom: "14px" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Starting Point</label>
          <select className="form-select" value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {landmarks.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Destination</label>
          <select className="form-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
            {landmarks.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ height: "40px" }}>
          Calculate Route
        </button>
      </form>

      {/* Result Display */}
      {activeRoute && (
        <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "6px", padding: "14px" }}>
          {activeRoute.success ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--status-safe)" }}>
                  <CheckCircle size={16} />
                  <strong>Safe Route Found ({activeRoute.totalDistanceKm} km)</strong>
                </div>
                {activeRoute.hasCautionSteps && (
                  <span className="badge badge-warning">Proceed with Caution</span>
                )}
              </div>

              {/* Path Node Sequence */}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "12px", padding: "8px", backgroundColor: "var(--bg-card)", borderRadius: "4px" }}>
                {activeRoute.pathNodes.map((nId, idx) => (
                  <React.Fragment key={nId}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff" }}>
                      {landmarkMap.get(nId) || nId}
                    </span>
                    {idx < activeRoute.pathNodes.length - 1 && (
                      <ArrowRight size={13} color="var(--status-info)" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Turn-by-Turn directions */}
              <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Turn-by-Turn Guidance:</span>
                <ol style={{ paddingLeft: "18px", fontSize: "0.82rem", color: "var(--text-main)" }}>
                  {activeRoute.turnByTurn.map((step, i) => (
                    <li key={i} style={{ marginBottom: "3px" }}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Hazard Avoidance Explanations */}
              {activeRoute.avoidanceExplanations && activeRoute.avoidanceExplanations.length > 0 && (
                <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--status-critical-border)", borderRadius: "4px", padding: "8px 12px", fontSize: "0.8rem", color: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "var(--status-critical)", marginBottom: "4px" }}>
                    <AlertTriangle size={14} />
                    <span>Avoidance Justification:</span>
                  </div>
                  <ul style={{ paddingLeft: "16px" }}>
                    {activeRoute.avoidanceExplanations.map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "var(--status-critical)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", marginBottom: "6px" }}>
                <AlertTriangle size={16} />
                <span>No Safe Passage Route Available</span>
              </div>
              <p style={{ fontSize: "0.85rem", marginBottom: "8px" }}>{activeRoute.reason}</p>
              {activeRoute.blockedRoadsAvoided && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Blocked barriers: {activeRoute.blockedRoadsAvoided.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
