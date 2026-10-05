import React from "react";
import { useApp } from "../context/AppContext";
import { EmptyState } from "../components/common/EmptyState";
import { Activity, Clock, Shield } from "lucide-react";

export function ActivityLogPage() {
  const { activityLog, dispatch } = useApp();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Activity size={22} color="var(--status-info)" />
            Audit & Message Movement Log
          </h2>
          <div className="page-sub">
            Real-time trace of alert generation, peer reception, and store-and-forward hops
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "demo" })}
        >
          View Demo Studio
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {activityLog.map((entry) => (
          <div
            key={entry.id}
            className="card"
            style={{
              padding: "12px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className={`badge ${
                entry.type.includes("CREATED") ? "badge-critical" :
                entry.type.includes("FORWARDED") ? "badge-info" :
                entry.type.includes("RECEIVED") ? "badge-safe" : "badge-dim"
              }`}>
                {entry.type.replace(/_/g, " ")}
              </span>
              <span style={{ fontSize: "0.85rem", color: "#fff" }}>{entry.summary}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {entry.sourceDevice && <span>Device: {entry.sourceDevice}</span>}
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} />
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {activityLog.length === 0 && (
          <EmptyState
            icon={Activity}
            title="No activity recorded yet"
            description="Create an alert or connect to a nearby peer to see message flow events appear here in real time."
          />
        )}
      </div>
    </div>
  );
}
