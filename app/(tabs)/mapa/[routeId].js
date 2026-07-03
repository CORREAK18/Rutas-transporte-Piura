import { useLocalSearchParams, useRouter } from "expo-router";

import { useRouteMapController } from "@/controllers/useRouteMapController";
import { RouteMapView } from "@/views/RouteMapView";

function toRouteId(value) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return typeof value === "string" ? value : "";
}

export default function RouteMapRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const routeId = toRouteId(params.routeId);
  const controller = useRouteMapController(routeId);

  return (
    <RouteMapView
      {...controller}
      onBack={() => router.back()}
    />
  );
}
