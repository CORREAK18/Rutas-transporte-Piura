import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { ROUTES } from "@/config/navigation";
import { useHomeController } from "@/controllers/useHomeController";
import { getCurrentUser, logout } from "@/services/authService";
import { HomeView } from "@/views/HomeView";

export default function HomeRoute() {
  const router = useRouter();
  const controller = useHomeController();
  const [currentUser, setCurrentUser] = useState(null);

  // Verificar autenticación y recargar datos cada vez que la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function verifySession() {
        const user = await getCurrentUser();
        if (!active) return;

        if (!user) {
          router.replace("/welcome");
        } else {
          setCurrentUser(user);
          controller.reload();
        }
      }

      verifySession();

      return () => {
        active = false;
      };
    }, [controller.reload]),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/welcome");
  };

  return (
    <HomeView
      {...controller}
      currentUser={currentUser}
      onLogout={handleLogout}
      onOpenSearch={() => router.push(ROUTES.search())}
      onOpenFavorites={() => router.push(ROUTES.favorites())}
      onOpenCreateRoute={() => router.push(ROUTES.createRoute())}
      onOpenRoute={(routeId) => router.push(ROUTES.routeDetail(routeId))}
      onOpenMap={(routeId) => router.push(ROUTES.routeMap(routeId))}
    />
  );
}
