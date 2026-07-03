import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPendingPath, getPendingStops } from "@/utils/routePathStore";

/**
 * Controlador para la pantalla de trazado interactivo de ruta en mapa.
 * Gestiona el recorrido de coordenadas y los paraderos asociados.
 */
export function useCreateRouteMapController({ initialColor = "#5eead4" } = {}) {
  const [pathCoordinates, setPathCoordinates] = useState(() => {
    return getPendingPath() || [];
  });
  const [stops, setStops] = useState(() => {
    return getPendingStops() || [];
  }); // Paraderos creados sobre el mapa
  const [userLocation, setUserLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const mapRef = useRef(null);

  // Piura, Perú como ubicación por defecto si falla el GPS
  const DEFAULT_REGION = {
    latitude: -5.1945,
    longitude: -80.6328,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  // Solicitar ubicación del usuario al montar para centrar el mapa
  useEffect(() => {
    let cancelled = false;

    async function fetchLocation() {
      // Si ya hay puntos en el trazado anterior, enfocar el mapa en el primer punto
      const existingPath = getPendingPath();
      if (existingPath && existingPath.length > 0) {
        if (!cancelled) {
          setInitialRegion({
            latitude: existingPath[0].latitude,
            longitude: existingPath[0].longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
          setLocationLoading(false);
        }
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) {
            setInitialRegion(DEFAULT_REGION);
            setLocationLoading(false);
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          setInitialRegion({
            latitude,
            longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
          setLocationLoading(false);
        }
      } catch {
        if (!cancelled) {
          setInitialRegion(DEFAULT_REGION);
          setLocationLoading(false);
        }
      }
    }

    fetchLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Añade un punto al recorrido (línea) */
  const addPoint = useCallback((coordinate) => {
    setPathCoordinates((prev) => [...prev, coordinate]);
  }, []);

  /** Añade un paradero con su nombre y referencia */
  const addStop = useCallback((coordinate, name, reference) => {
    setStops((prev) => {
      const newStop = {
        id: `stop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim() || `Paradero ${prev.length + 1}`,
        reference: reference.trim(),
        coordinate,
        order: prev.length + 1,
        routeIds: [], // Se enlazará al guardar en el controlador
      };
      return [...prev, newStop];
    });

    // Añadir el paradero también como punto en la polyline para que la línea pase por él
    setPathCoordinates((prev) => [...prev, coordinate]);
  }, []);

  /** Deshace el último punto del trazado */
  const undoLastPoint = useCallback(() => {
    setPathCoordinates((prev) => prev.slice(0, -1));
  }, []);

  /** Deshace el último paradero creado */
  const undoLastStop = useCallback(() => {
    setStops((prev) => prev.slice(0, -1));
  }, []);

  /** Limpia todos los puntos y paraderos */
  const clearAll = useCallback(() => {
    setPathCoordinates([]);
    setStops([]);
  }, []);

  /** Centra el mapa en la ubicación del usuario */
  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        400,
      );
    } else if (mapRef.current) {
      mapRef.current.animateToRegion(DEFAULT_REGION, 400);
    }
  }, [userLocation]);

  return {
    pathCoordinates,
    stops,
    setPathCoordinates,
    setStops,
    userLocation,
    initialRegion,
    locationLoading,
    mapRef,
    addPoint,
    addStop,
    undoLastPoint,
    undoLastStop,
    clearAll,
    centerOnUser,
  };
}
