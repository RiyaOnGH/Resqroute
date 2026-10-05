import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Radio,
  Home,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Navigation
} from "lucide-react";

export function DemoStudioPage() {
  const {
    createAlert,
    resetDemoData,
    calculateRoute,
    roads,
    alerts,
    dispatch
  } = useApp();

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Baseline: Initial Disaster State",
      description: "Disaster scenario: Cyclone/Flood alert in sector. Main Road, School Road, Bridge Road, and River Road are SAFE. Market Road has minor debris (CAUTION).",
      actionText: "Step 1: Responder A reports Bridge Road BLOCKED",
      run: () => {
        resetDemoData();
        setCurrentStep(1);
      }
    },
    {
      title: "Device A (Responder) Broadcasts Hazard",
      description: "Responder A on patrol encounters flash flooding over Bridge Road (~1.2m depth). A creates alert: [Bridge Road → BLOCKED → Flood → HIGH priority].",
      actionText: "Step 2: Simulate Peer Transfer to Volunteer B",
      run: () => {
        createAlert({
          alertType: "ROAD_BLOCKED",
          roadId: "R-04",
          status: "BLOCKED",
          reason: "Flood water over bridge deck (~1.2m depth). Impassable.",
          priority: "HIGH"
        });
        setCurrentStep(2);
      }
    },
    {
      title: "Device B (Volunteer) Stores Alert Locally",
      description: "Volunteer B receives the WebRTC packet from Device A. B stores the alert in browser LocalStorage. Device B verifies hopCount = 1 and marks status locally.",
      actionText: "Step 3: Volunteer B Moves & Forwards to Shelter C",
      run: () => {
        setCurrentStep(3);
      }
    },
    {
      title: "Device C (Shelter) Receives Forwarded Alert",
      description: "Device C was previously out of range of Device A. Volunteer B arrives at Evacuation Centre and relays the cached alert (hopCount = 2). Device C receives the update!",
      actionText: "Step 4: View Map Reroute Avoidance",
      run: () => {
        calculateRoute("LOC-JUNCTION", "LOC-SHELTER-A");
        setCurrentStep(4);
      }
    },
    {
      title: "Dijkstra Engine Automatically Avoids Blocked Bridge",
      description: "All devices calculate safe routes bypassing Bridge Road. The system notes: 'Bridge Road skipped because it is BLOCKED (Flood)'.",
      actionText: "Restart Scenario",
      run: () => {
        resetDemoData();
        setCurrentStep(0);
      }
    }
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Sparkles size={22} color="var(--status-accent)" />
            3-Device Store-and-Forward Demo Studio
          </h2>
          <div className="page-sub">
            Interactive demonstration walkthrough for hackathon judges
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={resetDemoData}>
          <RotateCcw size={14} /> Reset Demo Data
        </button>
      </div>

      {/* Visual Relay Diagram */}
      <div className="card" style={{ marginBottom: "20px", border: "1px solid var(--status-accent-border)" }}>
        <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "14px" }}>
          Relay Transmission Chain
        </h4>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          {/* Node A */}
          <div style={{ textAlign: "center", flex: "1", minWidth: "140px", padding: "12px", backgroundColor: "var(--bg-surface)", borderRadius: "8px", border: currentStep >= 1 ? "1px solid var(--status-critical)" : "1px solid var(--border-subtle)" }}>
            <Shield size={24} color="var(--status-critical)" style={{ marginBottom: "4px" }} />
            <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>Device A</div>
            <span className="badge badge-info" style={{ marginTop: "4px" }}>RESPONDER</span>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>Originator (Hop 0)</div>
          </div>

          <ArrowRight size={20} color={currentStep >= 2 ? "var(--status-safe)" : "var(--text-dim)"} />

          {/* Node B */}
          <div style={{ textAlign: "center", flex: "1", minWidth: "140px", padding: "12px", backgroundColor: "var(--bg-surface)", borderRadius: "8px", border: currentStep >= 2 ? "1px solid var(--status-warning)" : "1px solid var(--border-subtle)" }}>
            <Radio size={24} color="var(--status-warning)" style={{ marginBottom: "4px" }} />
            <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>Device B</div>
            <span className="badge badge-warning" style={{ marginTop: "4px" }}>VOLUNTEER</span>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>Store & Forward (Hop 1)</div>
          </div>

          <ArrowRight size={20} color={currentStep >= 3 ? "var(--status-safe)" : "var(--text-dim)"} />

          {/* Node C */}
          <div style={{ textAlign: "center", flex: "1", minWidth: "140px", padding: "12px", backgroundColor: "var(--bg-surface)", borderRadius: "8px", border: currentStep >= 3 ? "1px solid var(--status-safe)" : "1px solid var(--border-subtle)" }}>
            <Home size={24} color="var(--status-safe)" style={{ marginBottom: "4px" }} />
            <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>Device C</div>
            <span className="badge badge-safe" style={{ marginTop: "4px" }}>SHELTER</span>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>Recipient (Hop 2)</div>
          </div>
        </div>
      </div>

      {/* Active Step Panel */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span className="badge badge-info">Step {currentStep + 1} of {steps.length}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Simulated Scenario Flow</span>
        </div>

        <h3 style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "8px" }}>
          {steps[currentStep].title}
        </h3>

        <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "20px", lineHeight: 1.5 }}>
          {steps[currentStep].description}
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={steps[currentStep].run}>
            {steps[currentStep].actionText}
          </button>

          {currentStep >= 1 && (
            <button
              className="btn btn-secondary"
              onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "map" })}
            >
              <Navigation size={14} /> View District Map
            </button>
          )}
        </div>
      </div>

      {/* Live Road Network Telemetry */}
      <div className="card">
        <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
          Current Road Network Status
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
          {roads.slice(0, 6).map(r => (
            <div
              key={r.id}
              style={{
                backgroundColor: "var(--bg-surface)",
                padding: "8px 10px",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "#fff" }}>{r.name || r.id}</span>
              <span className={`badge ${
                r.status === "BLOCKED" ? "badge-critical" :
                r.status === "CAUTION" ? "badge-warning" : "badge-safe"
              }`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
