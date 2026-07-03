import { createRoute } from "@/models/route";
import { getRouteById, getRouteStops, saveRoute } from "@/services/routeService";
import { useState, useEffect } from "react";

const INITIAL_FORM = {
  code: "",
  name: "",
  shortName: "",
  description: "",
  fare: "",
  color: "#5eead4",
  empresa: "",
  pathCoordinates: [],
  stops: [],
};

export function useCreateRouteController(routeId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!routeId) {
      setFormData(INITIAL_FORM);
      return;
    }

    let active = true;
    async function loadRoute() {
      setLoading(true);
      try {
        const [route, stops] = await Promise.all([
          getRouteById(routeId),
          getRouteStops(routeId),
        ]);
        if (!active) return;
        if (route) {
          const empresa = route.tags?.find(t => t !== "Transporte" && t !== "Publicada por usuario") || "";
          setFormData({
            id: route.id,
            code: route.code,
            name: route.name,
            shortName: route.shortName,
            description: route.description,
            fare: String(route.fare),
            color: route.color,
            empresa: empresa,
            pathCoordinates: route.pathCoordinates || [],
            stops: stops || [],
          });
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar la ruta para edición.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRoute();

    return () => {
      active = false;
    };
  }, [routeId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const setPathCoordinatesAndStops = (coordinates, stops = []) => {
    setFormData((prev) => ({
      ...prev,
      pathCoordinates: coordinates,
      stops: stops,
    }));
  };

  const validateForm = () => {
    if (!formData.code?.trim()) return "El código de ruta es requerido (Ej. R-10)";
    if (!formData.name?.trim()) return "El nombre de la ruta es requerido (Ej. Piura - Castilla)";
    if (!formData.pathCoordinates || formData.pathCoordinates.length < 2)
      return "Debes trazar el recorrido en el mapa (mínimo 2 puntos)";
    return null;
  };

  const handleCreateRoute = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const path = formData.pathCoordinates;
      const firstPoint = path[0];
      const lastPoint = path[path.length - 1];

      const originLabel = formData.stops.length > 0
        ? formData.stops[0].name
        : "Inicio de Ruta";

      const destinationLabel = formData.stops.length > 1
        ? formData.stops[formData.stops.length - 1].name
        : "Fin de Ruta";

      const targetId = formData.id || `route_${Date.now()}`;

      const routeData = createRoute({
        id: targetId,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        shortName: formData.shortName?.trim() || formData.name.trim(),
        description: formData.description?.trim() || `Ruta de transporte urbano - Empresa ${formData.empresa || "Pública"}`,
        fare: parseFloat(formData.fare) || 1.50,
        distanceKm: parseFloat((path.length * 0.45).toFixed(2)),
        estimatedMinutes: Math.round(path.length * 2.5),
        featuredRank: 99,
        color: formData.color || "#5eead4",
        keywords: [
          formData.code.toLowerCase(),
          formData.name.toLowerCase(),
          formData.empresa ? formData.empresa.toLowerCase() : "",
        ].filter(Boolean),
        tags: [
          formData.empresa ? formData.empresa.trim() : "Transporte",
          "Publicada por usuario",
        ].filter(Boolean),
        origin: {
          label: originLabel,
          coordinate: firstPoint,
        },
        destination: {
          label: destinationLabel,
          coordinate: lastPoint,
        },
        stopIds: [],
        pathCoordinates: path,
      });

      await saveRoute(routeData, formData.stops);

      setFormData(INITIAL_FORM);

      return routeData.id;
    } catch (err) {
      setError(err.message || "Error al guardar la ruta");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleInputChange,
    setPathCoordinates: (coords) => setPathCoordinatesAndStops(coords, formData.stops),
    setPathCoordinatesAndStops,
    handleCreateRoute,
    loading,
    error,
  };
}
