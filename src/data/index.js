import {
    DEMO_USER_ID,
    mockFavorites,
    mockReports,
    mockRoutes,
    mockStops,
    mockUsers,
    mockVehicles,
    toggleMockFavoriteRoute,
} from "./mockData";

const routeById = new Map(mockRoutes.map((route) => [route.id, route]));
const stopById = new Map(mockStops.map((stop) => [stop.id, stop]));

export {
    DEMO_USER_ID,
    mockFavorites,
    mockReports,
    mockRoutes,
    mockStops,
    mockUsers,
    mockVehicles,
    toggleMockFavoriteRoute
};

export function getMockRoutes() {
  return [...mockRoutes];
}

export function getMockRouteById(routeId) {
  return routeById.get(String(routeId)) ?? null;
}

export function getMockStopsByRouteId(routeId) {
  const targetRouteId = String(routeId);
  return mockStops.filter((stop) => stop.routeIds.includes(targetRouteId));
}

export function getMockFavoriteRouteIdsByUserId(userId) {
  const targetUserId = String(userId);
  return mockFavorites
    .filter((favorite) => favorite.userId === targetUserId)
    .map((favorite) => favorite.routeId);
}

export function getMockFavoriteRoutesByUserId(userId) {
  return getMockFavoriteRouteIdsByUserId(userId)
    .map((routeId) => getMockRouteById(routeId))
    .filter(Boolean);
}

export function getMockStopById(stopId) {
  return stopById.get(String(stopId)) ?? null;
}

export function getMockStopsByIds(stopIds = []) {
  return stopIds.map((stopId) => getMockStopById(stopId)).filter(Boolean);
}

export function getMockFeaturedRoutes() {
  return [...mockRoutes].sort(
    (left, right) => left.featuredRank - right.featuredRank,
  );
}

/**
 * Agrega una ruta nueva al catálogo en memoria (runtime).
 * La ruta aparecerá inmediatamente en el catálogo sin reiniciar la app.
 */
export function addMockRoute(route) {
  mockRoutes.push(route);
  routeById.set(String(route.id), route);
}
