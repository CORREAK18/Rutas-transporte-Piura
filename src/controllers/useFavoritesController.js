import { useEffect, useState } from "react";

import {
  getFavoriteRoutes,
  toggleRouteFavorite,
} from "@/services/favoriteService";

/**
 * Controlador de la pantalla de rutas favoritas.
 * El userId se resuelve automáticamente desde la sesión activa en favoriteService.
 */
export function useFavoritesController() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);

  async function loadFavorites() {
    setLoading(true);
    // No pasamos userId: favoriteService usa la sesión activa automáticamente
    const favoriteRoutes = await getFavoriteRoutes();
    setRoutes(favoriteRoutes);
    setLoading(false);
  }

  async function toggleFavorite(routeId) {
    await toggleRouteFavorite(routeId);
    await loadFavorites();
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await loadFavorites();
      if (!active) return;
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  return {
    loading,
    routes,
    reload: loadFavorites,
    toggleFavorite,
  };
}
