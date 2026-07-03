import { useEffect, useState } from "react";
import { Alert } from "react-native";

import {
  getFavoriteRouteIds,
  toggleRouteFavorite,
} from "@/services/favoriteService";
import { getRouteById, getRouteStops, removeRoute } from "@/services/routeService";
import { getCurrentUser } from "@/services/authService";

export function useRouteDetailController(routeId) {
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVisitor, setIsVisitor] = useState(false);

  async function loadRouteDetail() {
    if (!routeId) {
      setRoute(null);
      setStops([]);
      setIsFavorite(false);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [routeData, stopData, favoriteRouteIds, currentUser] = await Promise.all([
      getRouteById(routeId),
      getRouteStops(routeId),
      getFavoriteRouteIds(),
      getCurrentUser(),
    ]);

    setRoute(routeData);
    setStops(stopData);
    setIsFavorite(favoriteRouteIds.includes(String(routeId)));
    setIsAdmin(currentUser?.role === "admin");
    setIsVisitor(currentUser?.role === "visitante");
    setLoading(false);
  }

  async function toggleFavorite() {
    if (!routeId) return;
    try {
      const result = await toggleRouteFavorite(routeId);
      setIsFavorite(result.isFavorite);
    } catch (error) {
      Alert.alert("Acceso Restringido", error.message);
    }
  }

  async function handleDeleteRoute() {
    if (!routeId) return false;
    try {
      await removeRoute(routeId);
      return true;
    } catch (error) {
      console.error("[useRouteDetailController] Error al eliminar:", error);
      throw error;
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await loadRouteDetail();
      if (!active) return;
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [routeId]);

  return {
    loading,
    route,
    stops,
    isFavorite,
    isAdmin,
    isVisitor,
    reload: loadRouteDetail,
    toggleFavorite,
    handleDeleteRoute,
  };
}
