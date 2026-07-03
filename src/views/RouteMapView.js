import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/ActionButton";
import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { MapRoute } from "@/components/MapRoute";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { theme } from "@/config/theme";

export function RouteMapView({ loading, route, stops, region, locationPermission, onBack }) {
  if (loading) {
    return <LoadingOverlay message="Obteniendo coordenadas del mapa..." />;
  }

  if (!route) {
    return (
      <AppScreen>
        <EmptyState
          title="Mapa no disponible"
          message="La ruta solicitada no existe o no pudo cargarse."
        />
      </AppScreen>
    );
  }

  const showUserLocation = locationPermission === "granted";
  const pathCount = route.pathCoordinates?.length ?? 0;

  return (
    <AppScreen scrollable={false} contentStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>Recorrido en mapa</Text>
        <Text style={styles.title}>{route.name}</Text>
        <Text style={styles.subtitle}>
          {showUserLocation
            ? "Visualiza tu posición en tiempo real con respecto al trayecto."
            : "Activa tu ubicación GPS para ver dónde te encuentras con respecto a la ruta."}
        </Text>
      </View>

      {/* Info rápida */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Código</Text>
            <Text style={[styles.infoValue, { color: route.color }]}>{route.code}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Puntos</Text>
            <Text style={styles.infoValue}>{pathCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Paraderos</Text>
            <Text style={styles.infoValue}>{stops.length}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mi ubicación</Text>
            <Text style={[styles.infoValue, { color: showUserLocation ? theme.colors.success : theme.colors.danger }]}>
              {showUserLocation ? "Activa" : "Sin permiso"}
            </Text>
          </View>
        </View>

        {/* Barra de color de la ruta */}
        <View style={[styles.routeColorBar, { backgroundColor: route.color }]} />
      </Card>

      {/* Mapa con la ruta y ubicación del usuario */}
      <MapRoute
        route={route}
        stops={stops}
        region={region}
        showUserLocation={showUserLocation}
      />

      <View style={styles.actions}>
        <ActionButton label="← Volver" onPress={onBack} variant="secondary" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    gap: theme.spacing.md,
  },
  header: {
    gap: 6,
  },
  kicker: {
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 10,
    fontWeight: "800",
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  routeColorBar: {
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  actions: {
    marginTop: theme.spacing.sm,
  },
});
