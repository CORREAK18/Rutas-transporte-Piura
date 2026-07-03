import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

import {
  getFavoriteRouteIds,
  toggleRouteFavorite,
} from "@/services/favoriteService";
import { getCurrentUser } from "@/services/authService";
import { getRoutes } from "@/services/routeService";
import { getStops } from "@/services/localDb";
import { calculateRouteCost } from "@/utils/search";
import { normalizeText } from "@/utils/strings";

const DEFAULT_COORDINATE = { latitude: -5.1945, longitude: -80.6328 };

function normalizeParam(value) {
  return String(value ?? "").trim();
}

function findDestinationCoordinate(destText, routes, stops) {
  if (!destText) return null;
  const query = normalizeText(destText);

  const matchingStop = stops.find((s) => normalizeText(s.name).includes(query));
  if (matchingStop) return matchingStop.coordinate;

  const matchingRoute = routes.find(
    (r) =>
      normalizeText(r.destination?.label).includes(query) ||
      normalizeText(r.name).includes(query) ||
      normalizeText(r.shortName).includes(query),
  );

  if (matchingRoute) {
    return matchingRoute.destination?.coordinate || matchingRoute.origin?.coordinate;
  }

  if (stops.length > 0) return stops[0].coordinate;

  return DEFAULT_COORDINATE;
}

export function useResultsController({ destination = "", destLat = "", destLng = "" } = {}) {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [favoriteRouteIds, setFavoriteRouteIds] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [destinationCoordinate, setDestinationCoordinate] = useState(null);
  const [locationPermission, setLocationPermission] = useState("pending");
  const [isVisitor, setIsVisitor] = useState(false);

  async function loadResults() {
    setLoading(true);

    try {
      let currentCoords = DEFAULT_COORDINATE;
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        currentCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(currentCoords);
      } else {
        setUserLocation(DEFAULT_COORDINATE);
      }

      const [allRoutes, allStops, favoriteIds, currentUser] = await Promise.all([
        getRoutes(),
        getStops(),
        getFavoriteRouteIds(),
        getCurrentUser(),
      ]);

      setFavoriteRouteIds(favoriteIds);
      setIsVisitor(currentUser?.role === "visitante");

      let destCoords = DEFAULT_COORDINATE;
      if (destLat && destLng) {
        destCoords = { latitude: parseFloat(destLat), longitude: parseFloat(destLng) };
      } else {
        destCoords =
          findDestinationCoordinate(destination, allRoutes, allStops) || DEFAULT_COORDINATE;
      }
      setDestinationCoordinate(destCoords);

      const scoredRoutes = allRoutes
        .map((route) => {
          const costData = calculateRouteCost(currentCoords, destCoords, route);
          return {
            ...route,
            ...costData,
            minDistToUser: costData.walkToBoard,
            minDistToDest: costData.walkToDest,
          };
        })
        .filter((route) => route.walkToDest <= 1000)
        .sort((a, b) => a.cost - b.cost);

      setRoutes(scoredRoutes);
    } catch (error) {
      console.error("[useResultsController] Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(routeId) {
    try {
      const result = await toggleRouteFavorite(routeId);

      if (result.isFavorite) {
        setFavoriteRouteIds((current) => [...new Set([...current, String(routeId)])]);
        return;
      }

      setFavoriteRouteIds((current) =>
        current.filter((favId) => favId !== String(routeId)),
      );
    } catch (error) {
      Alert.alert("Acceso Restringido", error.message);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await loadResults();
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [normalizeParam(destination), destLat, destLng]);

  return {
    loading,
    destination: normalizeParam(destination),
    routes,
    favoriteRouteIds,
    userLocation,
    destinationCoordinate,
    locationPermission,
    isVisitor,
    reload: loadResults,
    toggleFavorite,
  };
}
