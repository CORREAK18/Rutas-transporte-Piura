import { FlatList, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/ActionButton";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState } from "@/components/EmptyState";
import { RouteCard } from "@/components/RouteCard";
import { theme } from "@/config/theme";

export function FavoritesView({
  loading,
  routes,
  onBack,
  onOpenRoute,
  onOpenMap,
  onToggleFavorite,
}) {
  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Favoritos</Text>
        <Text style={styles.title}>Tus rutas guardadas.</Text>
        <Text style={styles.subtitle}>
          La pantalla consulta el estado local actual y luego podrá apuntar a
          Firestore sin cambiar el diseño.
        </Text>
      </View>

      <ActionButton label="Volver" onPress={onBack} variant="secondary" />

      {loading ? (
        <EmptyState
          title="Cargando favoritos"
          message="Estamos leyendo tus rutas guardadas."
        />
      ) : routes.length ? (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              isFavorite
              onPressDetail={onOpenRoute}
              onPressMap={onOpenMap}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        />
      ) : (
        <EmptyState
          title="Sin favoritos"
          message="Marca una ruta como favorita desde el detalle o desde los resultados para verla aquí."
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.md,
  },
  kicker: {
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  separator: {
    height: theme.spacing.md,
  },
});
