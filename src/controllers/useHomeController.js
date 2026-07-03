import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { getFavoriteRoutes, toggleRouteFavorite } from "@/services/favoriteService";
import { getFeaturedRoutes, getRoutes } from "@/services/routeService";
import { formatMinutes, formatMoney } from "@/utils/strings";

function buildStats(routes = [], favoriteRoutes = []) {
  const totalFare = routes.reduce(
    (sum, route) => sum + Number(route.fare ?? 0),
    0,
  );
  const totalMinutes = routes.reduce(
    (sum, route) => sum + Number(route.estimatedMinutes ?? 0),
    0,
  );

  return [
    {
      label: "Rutas activas",
      value: String(routes.length),
      hint: "En la ciudad de Piura",
    },
    {
      label: "Favoritas",
      value: String(favoriteRoutes.length),
      hint: "Tus favoritas registradas",
    },
    {
      label: "Tarifa media",
      value: formatMoney(routes.length ? totalFare / routes.length : 0),
      hint: "Costo promedio del pasaje",
    },
    {
      label: "Tiempo medio",
      value: formatMinutes(routes.length ? totalMinutes / routes.length : 0),
      hint: "Duración promedio de viaje",
    },
  ];
}

export function useHomeController() {
  const [state, setState] = useState({
    loading: true,
    routes: [],
    featuredRoutes: [],
    favoriteRoutes: [],
    stats: [],
  });

  async function loadHomeData() {
    setState((current) => ({ ...current, loading: true }));

    const [routes, featuredRoutes, favoriteRoutes] = await Promise.all([
      getRoutes(),
      getFeaturedRoutes(),
      getFavoriteRoutes(),
    ]);

    setState({
      loading: false,
      routes,
      featuredRoutes,
      favoriteRoutes,
      stats: buildStats(routes, favoriteRoutes),
    });
  }

  async function toggleFavorite(routeId) {
    try {
      await toggleRouteFavorite(routeId);
      await loadHomeData();
    } catch (error) {
      Alert.alert("Acceso Restringido", error.message);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await loadHomeData();

      if (!active) {
        return;
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  return {
    loading: state.loading,
    routes: state.routes,
    featuredRoutes: state.featuredRoutes,
    favoriteRoutes: state.favoriteRoutes,
    stats: state.stats,
    reload: loadHomeData,
    toggleFavorite,
  };
}
