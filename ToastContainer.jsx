import React, { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, dispatch } = useApp();

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dispatch({ type: "REMOVE_TOAST", payload: toast.id })} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "critical":
        return <AlertCircle size={16} color="var(--status-critical)" />;
      case "safe":
        return <CheckCircle size={16} color="var(--status-safe)" />;
      default:
        return <Info size={16} color="var(--status-info)" />;
    }
  };

  return (
    <div className={`toast ${toast.type || "info"}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {getIcon()}
          <div>
            <strong style={{ fontSize: "0.85rem", display: "block" }}>{toast.title}</strong>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{toast.message}</span>
          </div>
        </div>
        <button onClick={onDismiss} style={{ color: "var(--text-dim)", padding: "2px" }}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
