import * as localDb from "./localDb";
import { getCurrentUser } from "./authService";

async function getActiveUserId(providedUserId) {
  if (providedUserId) return providedUserId;
  const user = await getCurrentUser();
  if (!user || user.role === "visitante") return null;
  return user.id;
}

export async function getFavoriteRoutes(userId) {
  const activeUserId = await getActiveUserId(userId);
  if (!activeUserId) return [];
  return localDb.getFavoriteRoutes(activeUserId);
}

export async function getFavoriteRouteIds(userId) {
  const activeUserId = await getActiveUserId(userId);
  if (!activeUserId) return [];
  return localDb.getFavoriteRouteIds(activeUserId);
}

export async function isRouteFavorite(routeId, userId) {
  const activeUserId = await getActiveUserId(userId);
  if (!activeUserId) return false;
  const favIds = await localDb.getFavoriteRouteIds(activeUserId);
  return favIds.includes(String(routeId));
}

export async function toggleRouteFavorite(routeId, userId) {
  const user = await getCurrentUser();
  if (!user || user.role === "visitante") {
    throw new Error("Debes crear una cuenta o iniciar sesión para guardar favoritos.");
  }
  const activeUserId = userId || user.id;
  return localDb.toggleFavorite(activeUserId, routeId);
}
