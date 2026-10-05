/**
 * Route Service for ResQRoute
 * Implements Dijkstra's Shortest Path Algorithm on the local static road topology.
 * 
 * Rules:
 * - SAFE: low weight multiplier (1.0x distance)
 * - UNKNOWN: medium weight multiplier (2.5x distance)
 * - CAUTION: high weight multiplier (5.0x distance)
 * - BLOCKED: impassable (Infinity weight, strictly excluded from traversal)
 * 
 * Generates transparent operational explanations for avoiding blocked roads.
 */

export class RouteService {
  /**
   * Find safe evacuation route between origin and destination landmarks.
   */
  static findSafeRoute(originId, destinationId, landmarks, roads) {
    if (!originId || !destinationId) {
      return { success: false, reason: "Origin and destination required." };
    }

    if (originId === destinationId) {
      return {
        success: true,
        path: [originId],
        roadsUsed: [],
        totalDistanceKm: 0,
        avoidedRoads: [],
        turnByTurn: ["Origin is destination."]
      };
    }

    // 1. Build adjacency list
    const graph = new Map();
    landmarks.forEach(l => graph.set(l.id, []));

    const blockedRoads = [];
    const cautionRoadsUsed = [];

    roads.forEach(road => {
      if (road.status === "BLOCKED") {
        blockedRoads.push(road);
        return; // Exclude blocked roads entirely
      }

      let multiplier = 1.0;
      if (road.status === "CAUTION") multiplier = 5.0;
      else if (road.status === "UNKNOWN") multiplier = 2.5;

      const edgeWeight = (road.distanceKm || 2.0) * multiplier;

      if (!graph.has(road.from)) graph.set(road.from, []);
      if (!graph.has(road.to)) graph.set(road.to, []);

      // Undirected graph (roads are two-way corridors)
      graph.get(road.from).push({
        node: road.to,
        weight: edgeWeight,
        road
      });
      graph.get(road.to).push({
        node: road.from,
        weight: edgeWeight,
        road
      });
    });

    // 2. Dijkstra Algorithm
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();

    landmarks.forEach(l => {
      distances.set(l.id, Infinity);
      unvisited.add(l.id);
    });

    distances.set(originId, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with lowest distance
      let current = null;
      let lowestDist = Infinity;

      unvisited.forEach(nodeId => {
        const d = distances.get(nodeId);
        if (d < lowestDist) {
          lowestDist = d;
          current = nodeId;
        }
      });

      if (!current || lowestDist === Infinity) {
        break; // Remaining nodes are unreachable
      }

      if (current === destinationId) {
        break; // Destination reached
      }

      unvisited.delete(current);

      const neighbors = graph.get(current) || [];
      neighbors.forEach(edge => {
        if (!unvisited.has(edge.node)) return;

        const candidateDist = distances.get(current) + edge.weight;
        if (candidateDist < distances.get(edge.node)) {
          distances.set(edge.node, candidateDist);
          previous.set(edge.node, { fromNode: current, road: edge.road });
        }
      });
    }

    // 3. Reconstruct path
    if (distances.get(destinationId) === Infinity) {
      return {
        success: false,
        reason: `No safe path available. Blocked roads prevent access from ${originId} to ${destinationId}.`,
        blockedRoadsAvoided: blockedRoads.map(r => `${r.name || r.id} (${r.reason || "BLOCKED"})`)
      };
    }

    const pathNodes = [];
    const pathRoads = [];
    let curr = destinationId;

    while (curr !== originId) {
      pathNodes.unshift(curr);
      const prevData = previous.get(curr);
      if (!prevData) break;
      pathRoads.unshift(prevData.road);
      curr = prevData.fromNode;
    }
    pathNodes.unshift(originId);

    // Compute actual physical distance
    const totalDistanceKm = pathRoads.reduce((sum, r) => sum + (r.distanceKm || 0), 0);

    // Identify which blocked roads were actively circumvented
    const activeExplanations = [];
    blockedRoads.forEach(br => {
      activeExplanations.push(`${br.name || br.id} skipped because it is ${br.status} (${br.reason || "Hazard"}).`);
    });

    const landmarkMap = new Map();
    landmarks.forEach(l => landmarkMap.set(l.id, l.name));

    const turnByTurn = [];
    for (let i = 0; i < pathRoads.length; i++) {
      const road = pathRoads[i];
      const stepFrom = landmarkMap.get(pathNodes[i]) || pathNodes[i];
      const stepTo = landmarkMap.get(pathNodes[i + 1]) || pathNodes[i + 1];
      turnByTurn.push(`Take ${road.name || road.id} (${road.status}) from ${stepFrom} to ${stepTo} [${road.distanceKm} km]`);
    }

    return {
      success: true,
      pathNodes,
      pathRoads,
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      turnByTurn,
      avoidanceExplanations: activeExplanations,
      hasCautionSteps: pathRoads.some(r => r.status === "CAUTION")
    };
  }
}
