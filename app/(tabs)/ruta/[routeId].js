import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";

import { ROUTES } from "@/config/navigation";
import { useRouteDetailController } from "@/controllers/useRouteDetailController";
import { RouteDetailView } from "@/views/RouteDetailView";

function toRouteId(value) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return typeof value === "string" ? value : "";
}

export default function RouteDetailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const routeId = toRouteId(params.routeId);
  const controller = useRouteDetailController(routeId);

  const handleDelete = () => {
    Alert.alert(
      "🗑️ Eliminar Ruta",
      "¿Estás seguro de que deseas eliminar esta ruta permanentemente? Se borrarán también los paraderos asociados si no pertenecen a otra ruta.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar permanentemente",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await controller.handleDeleteRoute();
              if (success) {
                Alert.alert("✅ Completado", "La ruta fue eliminada del sistema.");
                router.replace("/(tabs)");
              } else {
                Alert.alert("⚠️ Error", "No se pudo eliminar la ruta.");
              }
            } catch (error) {
              Alert.alert("⚠️ Error", error.message || "Error al intentar eliminar la ruta.");
            }
          },
        },
      ],
    );
  };

  return (
    <RouteDetailView
      {...controller}
      onBack={() => router.back()}
      onOpenMap={() => router.push(ROUTES.routeMap(routeId))}
      onOpenSearch={() => router.push(ROUTES.search())}
      onToggleFavorite={controller.toggleFavorite}
      onDeleteRoute={handleDelete}
      onEditRoute={() => router.push(`${ROUTES.createRoute()}?routeId=${routeId}`)}
    />
  );
}

