import React from "react";
import { Modal } from "../common/Modal";
import { AlertTriangle, Shield, CheckCircle } from "lucide-react";

export function ConflictingAlertsModal({ conflict, isOpen, onClose }) {
  if (!conflict) return null;

  const { roadId, newAlert, existingAlert } = conflict;

  return (
    <Modal title={`Conflicting Reports: Road ${roadId}`} isOpen={isOpen} onClose={onClose}>
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          Different devices on the emergency mesh have reported conflicting road conditions.
          The newer verified report is prioritized for routing, but all field reports remain preserved below.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {/* Report 1 */}
          <div className="card" style={{ borderColor: existingAlert.status === "BLOCKED" ? "var(--status-critical)" : "var(--status-safe)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span className={`badge ${existingAlert.status === "BLOCKED" ? "badge-critical" : "badge-safe"}`}>
                {existingAlert.status}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Earlier Report</span>
            </div>
            <div style={{ fontSize: "0.85rem", marginBottom: "4px" }}>{existingAlert.reason}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Reported by: <strong>{existingAlert.sourceDevice}</strong> ({existingAlert.sourceRole})
            </div>
          </div>

          {/* Report 2 */}
          <div className="card" style={{ borderColor: newAlert.status === "BLOCKED" ? "var(--status-critical)" : "var(--status-safe)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span className={`badge ${newAlert.status === "BLOCKED" ? "badge-critical" : "badge-safe"}`}>
                {newAlert.status}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--status-info)" }}>Incoming Report</span>
            </div>
            <div style={{ fontSize: "0.85rem", marginBottom: "4px" }}>{newAlert.reason}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Reported by: <strong>{newAlert.sourceDevice}</strong> ({newAlert.sourceRole})
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid var(--status-info)", borderRadius: "4px", padding: "10px", fontSize: "0.8rem", color: "#fff" }}>
          <strong>Operational Policy:</strong> When conflicts arise, verified Responder updates take precedence over unverified reports. Both reports remain logged.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>
          Acknowledge Conflict
        </button>
      </div>
    </Modal>
  );
}
