import { useEffect, useState } from "react";
import * as Location from "expo-location";

// Centro de Piura por defecto
const DEFAULT_COORDINATE = { latitude: -5.1945, longitude: -80.6328 };

export function useSearchController({
  initialDestination = "",
} = {}) {
  const [origin] = useState("Mi ubicación actual");
  const [destination, setDestination] = useState(initialDestination);
  const [destinationCoordinate, setDestinationCoordinate] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUserLocation() {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (active) {
            const coords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setUserLocation(coords);
          }
        } else {
          if (active) {
            setUserLocation(DEFAULT_COORDINATE);
          }
        }
      } catch (error) {
        console.error("Error al obtener la ubicación en SearchView:", error);
        if (active) {
          setUserLocation(DEFAULT_COORDINATE);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUserLocation();

    return () => {
      active = false;
    };
  }, []);

  const selectDestination = (coordinate) => {
    setDestinationCoordinate(coordinate);
    setDestination("Destino marcado en el mapa");
  };

  const canSearch = Boolean(destinationCoordinate);

  return {
    loading,
    origin,
    destination,
    setDestination,
    destinationCoordinate,
    userLocation,
    selectDestination,
    canSearch,
    popularDestinations: [], // Ya no se usan sugerencias
  };
}

