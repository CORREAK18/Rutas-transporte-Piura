import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "@/components/ActionButton";
import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { StopTimeline } from "@/components/StopTimeline";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { theme } from "@/config/theme";
import {
    formatDistance,
    formatMinutes,
    formatMoney,
    formatStopCount,
} from "@/utils/strings";

export function RouteDetailView({
  loading,
  route,
  stops,
  isFavorite,
  isAdmin,
  isVisitor,
  onOpenMap,
  onOpenSearch,
  onToggleFavorite,
  onDeleteRoute,
  onEditRoute,
}) {
  if (loading) {
    return <LoadingOverlay message="Obteniendo información de la ruta..." />;
  }

  if (!route) {
    return (
      <AppScreen>
        <EmptyState
          title="Ruta no encontrada"
          message="La ruta seleccionada no existe o fue removida de la red."
          actionLabel="Buscar otra ruta"
          onAction={onOpenSearch}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Detalle de ruta</Text>
        <Text style={styles.title}>{route.name}</Text>
        <Text style={styles.subtitle}>
          {route.origin?.label} → {route.destination?.label}
        </Text>
      </View>

      <Card style={styles.summaryCard}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: route.color }]}>
            <Text style={styles.badgeLabel}>{route.code}</Text>
          </View>
          {/* Badge de estado favorita — solo para usuarios registrados */}
          {!isVisitor && (
            <Text
              style={[
                styles.favoriteState,
                isFavorite ? styles.favoriteOn : styles.favoriteOff,
              ]}
            >
              {isFavorite
                ? "⭐ Guardada en favoritas"
                : "Agrega esta ruta a tus favoritas"}
            </Text>
          )}
        </View>

        <Text style={styles.description}>{route.description}</Text>

        <View style={styles.metrics}>
          <Metric label="Tarifa" value={formatMoney(route.fare)} />
          <Metric label="Distancia" value={formatDistance(route.distanceKm)} />
          <Metric
            label="Tiempo"
            value={formatMinutes(route.estimatedMinutes)}
          />
          <Metric label="Paraderos" value={formatStopCount(stops.length)} />
        </View>

        <View style={styles.actions}>
          <ActionButton
            label="Ver mapa"
            onPress={onOpenMap}
            style={styles.actionBtn}
          />
          {/* Botón de favoritos — solo para usuarios registrados */}
          {!isVisitor && (
            <ActionButton
              label={isFavorite ? "Quitar favorita" : "Guardar favorita"}
              onPress={onToggleFavorite}
              variant="secondary"
              style={styles.actionBtn}
            />
          )}
          {isAdmin && (
            <>
              <ActionButton
                label="Editar Ruta"
                onPress={onEditRoute}
                variant="secondary"
                style={styles.adminHalfBtn}
              />
              <ActionButton
                label="Eliminar Ruta"
                onPress={onDeleteRoute}
                variant="danger"
                style={styles.adminHalfBtn}
              />
            </>
          )}
        </View>
      </Card>

      <StopTimeline stops={stops} />
    </AppScreen>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.md,
  },
  kicker: {
    color: theme.colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  summaryCard: {
    gap: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeLabel: {
    color: "#030712",
    fontSize: 12,
    fontWeight: "900",
  },
  favoriteState: {
    fontSize: 13,
    fontWeight: "800",
  },
  favoriteOn: {
    color: theme.colors.primary,
  },
  favoriteOff: {
    color: theme.colors.textMuted,
  },
  description: {
    color: theme.colors.textSoft,
    lineHeight: 21,
    fontSize: 14,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  metric: {
    width: "48%",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    minWidth: 140,
  },
  adminActionBtn: {
    width: "100%",
    marginTop: 4,
  },
  adminHalfBtn: {
    flex: 1,
    minWidth: 140,
    marginTop: 4,
  },
});
