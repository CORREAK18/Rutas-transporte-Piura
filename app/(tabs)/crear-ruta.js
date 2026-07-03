import { CreateRouteView } from "@/views/CreateRouteView";
import { useLocalSearchParams } from "expo-router";

export default function CreateRoutePage() {
  const { routeId } = useLocalSearchParams();
  return <CreateRouteView routeId={routeId} />;
}

