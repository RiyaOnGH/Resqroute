import React from "react";
import { useApp } from "../context/AppContext";
import { EmergencyMap } from "../components/map/EmergencyMap";
import { RoadInspector } from "../components/map/RoadInspector";
import { RouteCalculator } from "../components/map/RouteCalculator";
import { Map as MapIcon, PlusCircle } from "lucide-react";

export function MapPage() {
  const { roads, selectedRoadId, dispatch } = useApp();

  const selectedRoad = roads.find(r => r.id === selectedRoadId) || null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <MapIcon size={22} color="var(--status-info)" />
            District Disaster Vector Map
          </h2>
          <div className="page-sub">
            Offline topological road network with live peer-updated hazard overlays
          </div>
        </div>

        <button
          className="btn btn-emergency btn-sm"
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "create-alert" })}
        >
          <PlusCircle size={14} /> Report Hazard
        </button>
      </div>

      {/* SVG Map Canvas */}
      <EmergencyMap
        onSelectRoad={(roadId) => dispatch({ type: "SET_SELECTED_ROAD", payload: roadId })}
        onSelectLandmark={(landmarkId) => {
          dispatch({ type: "SET_DESTINATION", payload: landmarkId });
        }}
      />

      {/* Road Inspector Drawer if selected */}
      {selectedRoad && (
        <RoadInspector
          road={selectedRoad}
          onClose={() => dispatch({ type: "SET_SELECTED_ROAD", payload: null })}
          onCreateAlert={(rId) => {
            dispatch({ type: "SET_ACTIVE_TAB", payload: "create-alert" });
          }}
        />
      )}

      {/* Dijkstra Route Calculator */}
      <div style={{ marginTop: "16px" }}>
        <RouteCalculator />
      </div>
    </div>
  );
}
