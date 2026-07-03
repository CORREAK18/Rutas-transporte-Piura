import { useRouter } from "expo-router";

import { ROUTES } from "@/config/navigation";
import { useFavoritesController } from "@/controllers/useFavoritesController";
import { FavoritesView } from "@/views/FavoritesView";

export default function FavoritesRoute() {
  const router = useRouter();
  const controller = useFavoritesController();

  return (
    <FavoritesView
      {...controller}
      onBack={() => router.back()}
      onOpenRoute={(routeId) => router.push(ROUTES.routeDetail(routeId))}
      onOpenMap={(routeId) => router.push(ROUTES.routeMap(routeId))}
      onToggleFavorite={controller.toggleFavorite}
    />
  );
}
