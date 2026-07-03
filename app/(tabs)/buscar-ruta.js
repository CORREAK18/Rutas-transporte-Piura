import { useLocalSearchParams, useRouter } from "expo-router";

import { ROUTES } from "@/config/navigation";
import { useSearchController } from "@/controllers/useSearchController";
import { SearchView } from "@/views/SearchView";

function toInitialValue(value) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return typeof value === "string" ? value : "";
}

export default function SearchRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const controller = useSearchController({
    initialDestination: toInitialValue(params.destination),
  });

  return (
    <SearchView
      {...controller}
      onOpenFavorites={() => router.push(ROUTES.favorites())}
      onSubmitSearch={() =>
        router.push({
          pathname: ROUTES.results(),
          params: {
            destination: controller.destination.trim(),
            destLat: controller.destinationCoordinate?.latitude,
            destLng: controller.destinationCoordinate?.longitude,
          },
        })
      }
    />
  );
}
