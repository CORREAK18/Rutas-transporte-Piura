import * as localDb from "./localDb";
import { getCurrentUser } from "./authService";
import { scoreRouteSearch } from "@/utils/search";

export async function getRoutes() {
  return localDb.getRoutes();
}

export async function getFeaturedRoutes() {
  const routes = await localDb.getRoutes();
  return routes.slice(0, 10);
}

export async function getRouteById(routeId) {
  return localDb.getRouteById(routeId);
}

export async function getRouteStops(routeId) {
  return localDb.getStopsByRouteId(routeId);
}

export async function searchRoutes({ origin = "", destination = "" } = {}) {
  const queryOrigin = String(origin).trim();
  const queryDestination = String(destination).trim();

  const routes = await localDb.getRoutes();
  const scoredRoutes = routes.map((route) => ({
    route,
    score: scoreRouteSearch(route, queryOrigin, queryDestination),
  }));

  const hasQuery = Boolean(queryOrigin || queryDestination);

  return scoredRoutes
    .filter(({ score }) => (hasQuery ? score > 0 : true))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return (left.route.featuredRank ?? 99) - (right.route.featuredRank ?? 99);
    })
    .map(({ route }) => route);
}

export async function saveRoute(routeData, stopDataList = []) {
  if (!routeData || !routeData.id) {
    throw new Error("Datos de ruta inválidos");
  }

  if (!routeData.code || !routeData.name) {
    throw new Error("El código y nombre de la ruta son requeridos");
  }

  if (!routeData.pathCoordinates || routeData.pathCoordinates.length < 2) {
    throw new Error("Se necesitan al menos 2 puntos trazados en el mapa");
  }

  const currentUser = await getCurrentUser();
  const enrichedRoute = {
    ...routeData,
    createdBy: currentUser?.id ?? "usr-admin",
  };

  const processedStops = (stopDataList ?? []).map((stop, index) => ({
    ...stop,
    id: stop.id || `stop_${routeData.id}_${index}_${Date.now()}`,
    routeIds: [routeData.id],
    order: index + 1,
  }));

  await localDb.saveRoute(enrichedRoute);

  if (processedStops.length > 0) {
    await localDb.saveStops(processedStops);
    enrichedRoute.stopIds = processedStops.map((s) => s.id);
  } else {
    enrichedRoute.stopIds = [];
  }

  return {
    success: true,
    routeId: enrichedRoute.id,
    message: "¡La ruta y sus paraderos se publicaron exitosamente!",
  };
}

export async function removeRoute(routeId) {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") {
    throw new Error("No tienes autorización para eliminar rutas.");
  }
  return localDb.deleteRoute(routeId);
}
