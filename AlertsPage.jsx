import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AlertCard } from "../components/alerts/AlertCard";
import { ConflictingAlertsModal } from "../components/alerts/ConflictingAlertsModal";
import { EmptyState } from "../components/common/EmptyState";
import { MessageService } from "../services/messaging/messageService";
import { AlertTriangle, PlusCircle, Filter } from "lucide-react";

export function AlertsPage() {
  const { alerts, conflicts, activeFilter, dispatch } = useApp();
  const [selectedConflict, setSelectedConflict] = useState(null);

  const filterOptions = ["ALL", "CRITICAL", "BLOCKED", "FRESH", "OUTDATED", "VERIFIED"];

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "CRITICAL") return alert.priority === "CRITICAL";
    if (activeFilter === "BLOCKED") return alert.status === "BLOCKED";
    if (activeFilter === "VERIFIED") return alert.verified || alert.sourceRole === "RESPONDER";
    
    const freshness = MessageService.getFreshness(alert.createdAt);
    if (activeFilter === "FRESH") return freshness.status === "FRESH";
    if (activeFilter === "OUTDATED") return freshness.status === "OUTDATED";
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <AlertTriangle size={22} color="var(--status-critical)" />
            Emergency Alerts Feed
          </h2>
          <div className="page-sub">
            Field hazard reports exchanged peer-to-peer across the offline mesh
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {conflicts.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: "var(--status-warning)", borderColor: "var(--status-warning)" }}
              onClick={() => setSelectedConflict(conflicts[0])}
            >
              <AlertTriangle size={14} /> Conflicting Reports ({conflicts.length})
            </button>
          )}

          <button
            className="btn btn-emergency btn-sm"
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "create-alert" })}
          >
            <PlusCircle size={14} /> Broadcast Alert
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "16px", paddingBottom: "4px" }}>
        {filterOptions.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${activeFilter === f ? "btn-primary" : "btn-secondary"}`}
            onClick={() => dispatch({ type: "SET_ACTIVE_FILTER", payload: f })}
          >
            {f} {f === "ALL" ? `(${alerts.length})` : ""}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredAlerts.map(alert => (
          <AlertCard
            key={alert.messageId}
            alert={alert}
            onSelectRoad={(rId) => {
              dispatch({ type: "SET_SELECTED_ROAD", payload: rId });
              dispatch({ type: "SET_ACTIVE_TAB", payload: "map" });
            }}
          />
        ))}

        {filteredAlerts.length === 0 && (
          <EmptyState
            title="No alerts matching this filter"
            description="No field hazards currently match the selected criteria."
            action={
              <button className="btn btn-secondary btn-sm" onClick={() => dispatch({ type: "SET_ACTIVE_FILTER", payload: "ALL" })}>
                Reset Filter
              </button>
            }
          />
        )}
      </div>

      {/* Conflicts Modal */}
      <ConflictingAlertsModal
        conflict={selectedConflict}
        isOpen={Boolean(selectedConflict)}
        onClose={() => setSelectedConflict(null)}
      />
    </div>
  );
}
