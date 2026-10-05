import React from "react";
import { X } from "lucide-react";

export function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="card-header" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
          <h3 className="card-title">{title}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
