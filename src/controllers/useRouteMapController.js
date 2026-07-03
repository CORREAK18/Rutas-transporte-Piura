import { useEffect, useState } from "react";

import * as Location from "expo-location";
import { getRouteById, getRouteStops } from "@/services/routeService";
import { getBoundingRegion } from "@/utils/geo";

export function useRouteMapController(routeId) {
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [region, setRegion] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  async function loadRouteMap() {
    if (!routeId) {
      setRoute(null);
      setStops([]);
      setRegion(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Solicitar permisos de ubicación en paralelo con la carga de datos
    const [routeData, stopData, permResult] = await Promise.all([
      getRouteById(routeId),
      getRouteStops(routeId),
      Location.requestForegroundPermissionsAsync().catch(() => ({ status: "denied" })),
    ]);

    setLocationPermission(permResult.status);

    const coordinates = [
      routeData?.origin?.coordinate,
      ...(routeData?.pathCoordinates ?? []),
      routeData?.destination?.coordinate,
      ...stopData.map((stop) => stop.coordinate),
    ].filter(Boolean);

    setRoute(routeData);
    setStops(stopData);
    setRegion(getBoundingRegion(coordinates));
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      await loadRouteMap();
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
    region,
    locationPermission,
    reload: loadRouteMap,
  };
}
