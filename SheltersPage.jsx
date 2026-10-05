import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ShelterCard } from "../components/shelters/ShelterCard";
import { UpdateShelterModal } from "../components/shelters/UpdateShelterModal";
import { Home } from "lucide-react";

export function SheltersPage() {
  const { shelters, updateShelter, dispatch } = useApp();
  const [editingShelter, setEditingShelter] = useState(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <Home size={22} color="var(--status-safe)" />
            Evacuation & Relief Shelters
          </h2>
          <div className="page-sub">
            Real-time intake capacity, supplies, and route safety checks
          </div>
        </div>
      </div>

      <div className="grid-3">
        {shelters.map(shelter => (
          <ShelterCard
            key={shelter.id}
            shelter={shelter}
            onEdit={(s) => setEditingShelter(s)}
          />
        ))}
      </div>

      <UpdateShelterModal
        shelter={editingShelter}
        isOpen={Boolean(editingShelter)}
        onClose={() => setEditingShelter(null)}
        onSave={updateShelter}
      />
    </div>
  );
}
