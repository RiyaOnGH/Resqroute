import React from "react";
import { useApp } from "../context/AppContext";
import { EmptyState } from "../components/common/EmptyState";
import { Send, RefreshCw, CheckCircle, Clock } from "lucide-react";

export function QueuePage() {
  const { outgoingQueue, connectedPeersCount, dispatch } = useApp();

  const pendingCount = outgoingQueue.filter(q => q.status === "PENDING" || q.status === "RETRY").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Send size={22} color="var(--status-warning)" />
            Store-and-Forward Outbox Queue
          </h2>
          <div className="page-sub">
            Emergency alerts cached in local storage awaiting peer discovery
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "devices" })}
          >
            Connected Peers: {connectedPeersCount}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>Queue Status:</strong> {pendingCount} Message(s) Waiting in Local Storage
          </div>
          <span className="badge badge-dim">Auto-Sync on Peer Connection</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {outgoingQueue.map(item => (
          <div key={item.messageId} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={`status-dot ${item.status === "SENT" ? "online" : "warning"}`} />
                <strong style={{ color: "#fff" }}>{item.messageId}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>({item.alert.roadId} — {item.alert.status})</span>
              </div>
              <span className={`badge ${item.status === "SENT" ? "badge-safe" : "badge-warning"}`}>
                {item.status}
              </span>
            </div>

            <div style={{ fontSize: "0.82rem", color: "var(--text-main)", marginBottom: "6px" }}>
              {item.alert.reason}
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>Hop Count: {item.alert.hopCount} / {item.alert.maxHops}</span>
              <span>Queued At: {new Date(item.queuedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}

        {outgoingQueue.length === 0 && (
          <EmptyState
            icon={Send}
            title="Outbox is Empty"
            description="All created alerts have been transmitted or no outgoing messages are currently pending."
          />
        )}
      </div>
    </div>
  );
}
