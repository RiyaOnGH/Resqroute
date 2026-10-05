/**
 * ResQRoute Initial Geographic & Emergency Seed Data
 * An offline topological network for a disaster-affected district.
 */

export const INITIAL_LANDMARKS = [
  {
    id: "LOC-EOC",
    name: "Emergency Operations Center",
    type: "BASE",
    x: 120,
    y: 180,
    icon: "ShieldAlert",
    description: "Central command post for disaster response."
  },
  {
    id: "LOC-HOSPITAL",
    name: "District Valley Hospital",
    type: "HOSPITAL",
    x: 420,
    y: 100,
    icon: "Cross",
    description: "Primary trauma and medical emergency facility."
  },
  {
    id: "LOC-RIVER",
    name: "River Bridge Crossing",
    type: "JUNCTION",
    x: 280,
    y: 140,
    icon: "Anchor",
    description: "Major crossing over north river."
  },
  {
    id: "LOC-JUNCTION",
    name: "Central Valley Junction",
    type: "JUNCTION",
    x: 240,
    y: 320,
    icon: "GitMerge",
    description: "Main intersection connecting north and south corridors."
  },
  {
    id: "LOC-SHELTER-A",
    name: "Community Shelter A",
    type: "SHELTER",
    x: 480,
    y: 340,
    icon: "Home",
    description: "Reinforced civic hall with food and power generators."
  },
  {
    id: "LOC-EVAC-WEST",
    name: "Evacuation Centre West",
    type: "SHELTER",
    x: 140,
    y: 440,
    icon: "Tent",
    description: "Large stadium evacuation center."
  },
  {
    id: "LOC-SCHOOL",
    name: "District High School",
    type: "SCHOOL",
    x: 360,
    y: 450,
    icon: "School",
    description: "Emergency shelter gymnasium."
  },
  {
    id: "LOC-VILLAGE",
    name: "Village A (Hillside)",
    type: "VILLAGE",
    x: 520,
    y: 200,
    icon: "MapPin",
    description: "Residential settlement in the eastern hills."
  }
];

export const INITIAL_ROADS = [
  {
    id: "R-01",
    name: "Main Road",
    from: "LOC-EOC",
    to: "LOC-RIVER",
    distanceKm: 2.4,
    status: "SAFE",
    reason: "Clear asphalt, emergency vehicles verified",
    lanes: 2
  },
  {
    id: "R-02",
    name: "River Road",
    from: "LOC-RIVER",
    to: "LOC-HOSPITAL",
    distanceKm: 3.1,
    status: "SAFE",
    reason: "Water levels normal; passable",
    lanes: 2
  },
  {
    id: "R-03",
    name: "South Highway Link",
    from: "LOC-EOC",
    to: "LOC-JUNCTION",
    distanceKm: 1.8,
    status: "SAFE",
    reason: "Open and dry pavement",
    lanes: 4
  },
  {
    id: "R-04",
    name: "Bridge Road",
    from: "LOC-JUNCTION",
    to: "LOC-SHELTER-A",
    distanceKm: 4.2,
    status: "SAFE",
    reason: "Bridge open for emergency traffic",
    lanes: 2
  },
  {
    id: "R-05",
    name: "West Bypass to Evacuation Centre",
    from: "LOC-JUNCTION",
    to: "LOC-EVAC-WEST",
    distanceKm: 3.5,
    status: "SAFE",
    reason: "Elevated bypass road completely free of standing water",
    lanes: 2
  },
  {
    id: "R-06",
    name: "Hospital to Shelter Connector",
    from: "LOC-HOSPITAL",
    to: "LOC-SHELTER-A",
    distanceKm: 2.9,
    status: "SAFE",
    reason: "Paved bypass open",
    lanes: 2
  },
  {
    id: "R-07",
    name: "School Road",
    from: "LOC-EVAC-WEST",
    to: "LOC-SCHOOL",
    distanceKm: 2.2,
    status: "SAFE",
    reason: "Clear and monitored by local volunteers",
    lanes: 2
  },
  {
    id: "R-08",
    name: "Village Access Road",
    from: "LOC-RIVER",
    to: "LOC-VILLAGE",
    distanceKm: 3.8,
    status: "SAFE",
    reason: "Gravel road dry and passable",
    lanes: 1
  },
  {
    id: "R-09",
    name: "Hillside Village to Hospital Ridge",
    from: "LOC-VILLAGE",
    to: "LOC-HOSPITAL",
    distanceKm: 2.1,
    status: "SAFE",
    reason: "Mountain pass open",
    lanes: 1
  },
  {
    id: "R-10",
    name: "Market Road",
    from: "LOC-SCHOOL",
    to: "LOC-SHELTER-A",
    distanceKm: 3.0,
    status: "CAUTION",
    reason: "Tree debris on shoulder; slow traffic",
    lanes: 2
  }
];

export const INITIAL_SHELTERS = [
  {
    id: "S01",
    landmarkId: "LOC-SHELTER-A",
    name: "Community Shelter A (Civic Hall)",
    capacity: 250,
    available: 120,
    status: "OPEN",
    contactPerson: "Capt. Reynolds",
    supplies: ["Clean Water", "Medical Kits", "Generators"]
  },
  {
    id: "S02",
    landmarkId: "LOC-EVAC-WEST",
    name: "Evacuation Centre West (Stadium)",
    capacity: 500,
    available: 185,
    status: "OPEN",
    contactPerson: "Nurse Sarah",
    supplies: ["Blankets", "Field Kitchen", "Cots"]
  },
  {
    id: "S03",
    landmarkId: "LOC-SCHOOL",
    name: "Government School Shelter",
    capacity: 150,
    available: 0,
    status: "FULL",
    contactPerson: "Principal Davis",
    supplies: ["Showers", "Classroom Bunks"]
  }
];

export const INITIAL_DANGERS = [
  {
    id: "DNG-01",
    roadId: "R-04",
    x: 360,
    y: 330,
    title: "River Overflow Risk",
    type: "FLOOD",
    severity: "HIGH",
    description: "Water levels near road shoulder."
  }
];

export const INITIAL_ALERTS = [
  {
    messageId: "MSG-INIT-01",
    type: "ROAD_UPDATE",
    alertType: "ROAD_SAFE",
    roadId: "R-01",
    status: "SAFE",
    reason: "Main Road cleared by municipal team",
    priority: "MEDIUM",
    createdAt: Date.now() - 25 * 60 * 1000,
    expiresAt: Date.now() + 6 * 3600 * 1000,
    sourceDevice: "RESPONDER-HQ01",
    sourceRole: "RESPONDER",
    verified: true,
    hopCount: 0,
    maxHops: 5,
    corroborationCount: 1,
    reportedBy: ["RESPONDER-HQ01"]
  },
  {
    messageId: "MSG-INIT-02",
    type: "ROAD_UPDATE",
    alertType: "ROAD_DAMAGED",
    roadId: "R-10",
    status: "CAUTION",
    reason: "Market Road has debris on shoulder; pass with care",
    priority: "LOW",
    createdAt: Date.now() - 45 * 60 * 1000,
    expiresAt: Date.now() + 4 * 3600 * 1000,
    sourceDevice: "VOLUNTEER-V12B",
    sourceRole: "VOLUNTEER",
    verified: false,
    hopCount: 1,
    maxHops: 5,
    corroborationCount: 1,
    reportedBy: ["VOLUNTEER-V12B"]
  }
];
