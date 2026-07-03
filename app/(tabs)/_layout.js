import { Stack } from "expo-router";
import { theme } from "@/config/theme";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: "900", letterSpacing: 0.3 },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="buscar-ruta" options={{ title: "Buscar ruta" }} />
      <Stack.Screen name="resultados" options={{ title: "Resultados" }} />
      <Stack.Screen name="favoritos" options={{ title: "Favoritos" }} />
      <Stack.Screen name="crear-ruta" options={{ title: "Crear Ruta" }} />
      <Stack.Screen
        name="crear-ruta-mapa"
        options={{ title: "Trazar Ruta en Mapa", headerShown: false }}
      />
      <Stack.Screen
        name="ruta/[routeId]"
        options={{ title: "Detalle de ruta" }}
      />
      <Stack.Screen name="mapa/[routeId]" options={{ title: "Mapa de ruta" }} />
    </Stack>
  );
}

