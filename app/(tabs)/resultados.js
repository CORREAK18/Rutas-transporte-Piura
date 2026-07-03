import { useLocalSearchParams, useRouter } from "expo-router";

import { ROUTES } from "@/config/navigation";
import { useResultsController } from "@/controllers/useResultsController";
import { ResultsView } from "@/views/ResultsView";

function toSearchValue(value) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return typeof value === "string" ? value : "";
}

export default function ResultsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const controller = useResultsController({
    destination: toSearchValue(params.destination),
    destLat: toSearchValue(params.destLat),
    destLng: toSearchValue(params.destLng),
  });

  return (
    <ResultsView
      {...controller}
      onOpenFavorites={() => router.push(ROUTES.favorites())}
      onOpenRoute={(routeId) => router.push(ROUTES.routeDetail(routeId))}
      onOpenMap={(routeId) => router.push(ROUTES.routeMap(routeId))}
      onOpenSearch={() => router.push(ROUTES.search())}
      onToggleFavorite={controller.toggleFavorite}
    />
  );
}
