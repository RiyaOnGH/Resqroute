import React from "react";
import { MessageService } from "../../services/messaging/messageService";
import { AlertTriangle, CheckCircle, Clock, Shield, Radio, Share2 } from "lucide-react";

export function AlertCard({ alert, onSelectRoad }) {
  const freshness = MessageService.getFreshness(alert.createdAt);
  const trust = MessageService.getTrustStatus(alert);

  const formatAge = (ageMinutes) => {
    if (ageMinutes < 1) return "Just now";
    if (ageMinutes < 60) return `${ageMinutes}m ago`;
    const hours = Math.floor(ageMinutes / 60);
    const mins = ageMinutes % 60;
    return `${hours}h ${mins}m ago`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "BLOCKED":
        return <span className="badge badge-critical">BLOCKED</span>;
      case "CAUTION":
        return <span className="badge badge-warning">CAUTION</span>;
      case "SAFE":
        return <span className="badge badge-safe">SAFE</span>;
      default:
        return <span className="badge badge-dim">UNKNOWN</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return <span className="badge badge-critical">CRITICAL</span>;
      case "HIGH":
        return <span className="badge badge-warning">HIGH</span>;
      case "MEDIUM":
        return <span className="badge badge-info">MEDIUM</span>;
      default:
        return <span className="badge badge-dim">LOW</span>;
    }
  };

  return (
    <div className={`card ${alert.status === "BLOCKED" ? "card-blocked" : ""}`} style={{ position: "relative" }}>
      {/* Top Bar: Status, Priority, Freshness */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {getStatusBadge(alert.status)}
          {getPriorityBadge(alert.priority)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className={`badge ${trust.badgeClass}`}>{trust.label}</span>
        </div>
      </div>

      {/* Road & Reason */}
      <div style={{ marginBottom: "12px" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
          Road {alert.roadId}
        </h4>
        <p style={{ fontSize: "0.88rem", color: "var(--text-main)", lineHeight: 1.4 }}>
          {alert.reason}
        </p>
      </div>

      {/* Freshness Outdated Warning */}
      {freshness.status === "OUTDATED" && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid var(--status-critical)",
            borderRadius: "4px",
            padding: "6px 10px",
            fontSize: "0.78rem",
            color: "var(--status-critical)",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <AlertTriangle size={14} />
          <span>⚠ Information may be outdated ({formatAge(freshness.ageMinutes)})</span>
        </div>
      )}

      {/* Metadata Footer */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }} title="Original Source Device">
            <Shield size={12} color="var(--status-info)" />
            <strong>{alert.sourceDevice}</strong>
            <span>({alert.sourceRole})</span>
          </span>

          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }} title="Report Timestamp">
            <Clock size={12} />
            <span>{formatAge(freshness.ageMinutes)}</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="badge badge-dim" title="Relay Hop Count">
            Hop {alert.hopCount}
          </span>
          {onSelectRoad && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: "2px 8px", fontSize: "0.72rem" }}
              onClick={() => onSelectRoad(alert.roadId)}
            >
              View on Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
