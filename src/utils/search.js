import { normalizeText } from "./strings";

export function scoreRouteSearch(route, origin = "", destination = "") {
  const haystack = normalizeText(
    [
      route.code,
      route.name,
      route.shortName,
      route.description,
      route.origin?.label,
      route.destination?.label,
      ...(route.keywords ?? []),
      ...(route.tags ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );

  const terms = [origin, destination]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  if (!terms.length) {
    return route.featuredRank > 0 ? Math.max(1, 100 - route.featuredRank) : 1;
  }

  return terms.reduce((score, term) => {
    if (haystack.includes(term)) {
      return score + 6;
    }

    const pieces = term.split(/\s+/).filter(Boolean);
    const pieceScore = pieces.reduce(
      (subtotal, piece) => subtotal + (haystack.includes(piece) ? 1 : 0),
      0,
    );

    return score + pieceScore;
  }, 0);
}

/**
 * Calcula la distancia en metros entre dos coordenadas geográficas usando la fórmula de Haversine.
 */
export function getDistance(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity;
  
  const lat1 = coord1.latitude;
  const lon1 = coord1.longitude;
  const lat2 = coord2.latitude;
  const lon2 = coord2.longitude;

  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Encuentra la distancia mínima en metros desde una coordenada de referencia 
 * a cualquiera de los puntos de una ruta (trayectoria).
 */
export function getMinDistanceToPath(coordinate, path) {
  if (!coordinate || !path || !path.length) return Infinity;
  
  let minDistance = Infinity;
  for (const point of path) {
    const d = getDistance(coordinate, point);
    if (d < minDistance) {
      minDistance = d;
    }
  }
  return minDistance;
}

/**
 * Calcula la distancia en metros a lo largo de un trazado (path) entre dos índices.
 */
export function getRoutePathDistance(path, startIdx, endIdx) {
  if (!path || path.length === 0 || startIdx === -1 || endIdx === -1) return Infinity;
  let distance = 0;
  const start = Math.min(startIdx, endIdx);
  const end = Math.max(startIdx, endIdx);
  for (let i = start; i < end; i++) {
    distance += getDistance(path[i], path[i + 1]);
  }
  return distance;
}

/**
 * Encuentra el punto óptimo de subida y bajada, y calcula el costo total del trayecto.
 * Costo = Distancia(P, Subida) + DistanciaRuta(Subida, Bajada) + Distancia(Bajada, T)
 */
export function calculateRouteCost(userLocation, destLocation, route) {
  const path = route.pathCoordinates;
  if (!path || path.length === 0 || !userLocation || !destLocation) {
    return {
      cost: Infinity,
      subida: null,
      subidaIdx: -1,
      walkToBoard: Infinity,
      bajada: null,
      bajadaIdx: -1,
      walkToDest: Infinity,
      routeDistance: Infinity,
    };
  }

  // 1. Encontrar el mejor punto de subida (más cercano a userLocation)
  let subida = null;
  let subidaIdx = -1;
  let walkToBoard = Infinity;
  for (let i = 0; i < path.length; i++) {
    const dist = getDistance(userLocation, path[i]);
    if (dist < walkToBoard) {
      walkToBoard = dist;
      subida = path[i];
      subidaIdx = i;
    }
  }

  // 2. Encontrar el mejor punto de bajada (más cercano a destLocation)
  let bajada = null;
  let bajadaIdx = -1;
  let walkToDest = Infinity;
  for (let i = 0; i < path.length; i++) {
    const dist = getDistance(destLocation, path[i]);
    if (dist < walkToDest) {
      walkToDest = dist;
      bajada = path[i];
      bajadaIdx = i;
    }
  }

  // 3. Calcular la distancia en la ruta entre los dos puntos
  const routeDistance = getRoutePathDistance(path, subidaIdx, bajadaIdx);

  // 4. Calcular el costo total (Costo = 3 * CaminataInicial + Viaje + 5 * CaminataFinal)
  const cost = 3 * walkToBoard + routeDistance + 5 * walkToDest;

  return {
    cost,
    subida,
    subidaIdx,
    walkToBoard,
    bajada,
    bajadaIdx,
    walkToDest,
    routeDistance,
  };
}

