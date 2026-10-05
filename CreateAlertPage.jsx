import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ALERT_TYPES, ROAD_STATUSES, PRIORITIES, REASONS } from "../services/messaging/messageService";
import { AlertTriangle, Send, ArrowLeft, Shield } from "lucide-react";

export function CreateAlertPage() {
  const { roads, landmarks, createAlert, deviceId, deviceRole, dispatch } = useApp();

  const [formData, setFormData] = useState({
    alertType: "ROAD_BLOCKED",
    roadId: roads[0]?.id || "R-04",
    status: "BLOCKED",
    reasonCategory: "Flood",
    customReason: "",
    priority: "HIGH",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.roadId) errs.roadId = "Road is required.";
    if (!formData.status) errs.status = "Status is required.";
    if (!formData.priority) errs.priority = "Priority is required.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const fullReason = formData.customReason
      ? `${formData.reasonCategory}: ${formData.customReason}`
      : `${formData.reasonCategory} reported on corridor`;

    const result = createAlert({
      alertType: formData.alertType,
      roadId: formData.roadId,
      status: formData.status,
      priority: formData.priority,
      reason: fullReason,
      notes: formData.notes
    });

    if (result.success) {
      dispatch({ type: "SET_ACTIVE_TAB", payload: "alerts" });
    } else {
      setErrors({ form: result.errors?.join(", ") || "Failed to broadcast alert." });
    }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "alerts" })}
            style={{ marginBottom: "8px" }}
          >
            <ArrowLeft size={14} /> Back to Alerts
          </button>
          <h2 className="page-title">
            <AlertTriangle size={22} color="var(--status-critical)" />
            Broadcast Emergency Alert
          </h2>
          <div className="page-sub">
            Reporting as <strong>{deviceId}</strong> ({deviceRole}) • Transmitted directly over peer mesh
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {errors.form && (
          <div style={{ color: "var(--status-critical)", marginBottom: "12px", fontSize: "0.85rem" }}>
            {errors.form}
          </div>
        )}

        {/* 1. Alert Type */}
        <div className="form-group">
          <label className="form-label">Alert Category</label>
          <select
            className="form-select"
            value={formData.alertType}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              alertType: e.target.value,
              status: e.target.value === "ROAD_SAFE" ? "SAFE" : "BLOCKED"
            }))}
          >
            <option value="ROAD_BLOCKED">Road Blocked (Hazard impassable)</option>
            <option value="ROAD_SAFE">Road Safe (Cleared / verified passage)</option>
            <option value="DANGER_ZONE">Danger Zone (Localized hazard)</option>
            <option value="SHELTER_UPDATE">Shelter Update</option>
            <option value="SOS_PEOPLE_WAITING">SOS / People Waiting for Rescue</option>
            <option value="GENERAL_EMERGENCY">General Emergency</option>
          </select>
        </div>

        {/* 2. Road Selection */}
        <div className="form-group">
          <label className="form-label">Corridor / Road</label>
          <select
            className="form-select"
            value={formData.roadId}
            onChange={(e) => setFormData(prev => ({ ...prev, roadId: e.target.value }))}
          >
            {roads.map(r => (
              <option key={r.id} value={r.id}>
                {r.name || r.id} — Currently {r.status}
              </option>
            ))}
          </select>
          {errors.roadId && <span style={{ color: "var(--status-critical)", fontSize: "0.75rem" }}>{errors.roadId}</span>}
        </div>

        {/* 3. Road Status & Priority in 2-col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="form-group">
            <label className="form-label">Reported Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              {ROAD_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Hazard Reason Category */}
        <div className="form-group">
          <label className="form-label">Hazard Reason</label>
          <select
            className="form-select"
            value={formData.reasonCategory}
            onChange={(e) => setFormData(prev => ({ ...prev, reasonCategory: e.target.value }))}
          >
            {REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* 5. Additional Description */}
        <div className="form-group">
          <label className="form-label">Description / Field Notes</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="e.g. Flash flood water ~1 meter deep over bridge deck. Turn back to West bypass."
            value={formData.customReason}
            onChange={(e) => setFormData(prev => ({ ...prev, customReason: e.target.value }))}
          />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Verification: <strong>{deviceRole === "RESPONDER" ? "VERIFIED" : "UNVERIFIED"}</strong>
          </div>

          <button type="submit" className="btn btn-emergency btn-lg">
            <Send size={16} /> Send Alert
          </button>
        </div>
      </form>
    </div>
  );
}
