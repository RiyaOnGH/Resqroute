import React, { useState } from "react";
import { Modal } from "../common/Modal";

export function UpdateShelterModal({ shelter, isOpen, onClose, onSave }) {
  if (!shelter) return null;

  const [available, setAvailable] = useState(shelter.available);
  const [status, setStatus] = useState(shelter.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(shelter.id, {
      available: Number(available),
      status: Number(available) <= 0 ? "FULL" : status
    });
    onClose();
  };

  return (
    <Modal title={`Update Intake: ${shelter.name}`} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Available Capacity (Total: {shelter.capacity})</label>
          <input
            type="number"
            className="form-input"
            value={available}
            min="0"
            max={shelter.capacity}
            onChange={(e) => setAvailable(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Operational Status</label>
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="OPEN">OPEN (Accepting Evacuees)</option>
            <option value="LIMITED">LIMITED (Priority Intake Only)</option>
            <option value="FULL">FULL (At Maximum Capacity)</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Save & Broadcast
          </button>
        </div>
      </form>
    </Modal>
  );
}
