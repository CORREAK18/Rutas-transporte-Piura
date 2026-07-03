import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/config/theme";
import { formatDistance, formatMinutes, formatMoney } from "@/utils/strings";
import { Card } from "./Card";

export function RouteCard({
  route,
  isFavorite = false,
  onPressDetail,
  onPressMap,
  onToggleFavorite,
}) {
  if (!route) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: route.color }]}>
          <Text style={styles.badgeLabel}>{route.code}</Text>
        </View>
        {onToggleFavorite ? (
          <Pressable
            onPress={() => onToggleFavorite(route.id)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              color={isFavorite ? theme.colors.danger : theme.colors.textSoft}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{route.name}</Text>
        <Text style={styles.subtitle}>
          {route.origin?.label} → {route.destination?.label}
        </Text>
        <Text style={styles.description}>{route.description}</Text>
      </View>

      <View style={styles.metrics}>
        <Metric label="Tarifa" value={formatMoney(route.fare)} />
        <Metric label="Distancia" value={formatDistance(route.distanceKm)} />
        <Metric label="Tiempo" value={formatMinutes(route.estimatedMinutes)} />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => onPressDetail?.(route.id)}
          style={styles.actionPrimary}
        >
          <Text style={styles.actionPrimaryLabel}>Ver detalle</Text>
        </Pressable>
        <Pressable
          onPress={() => onPressMap?.(route.id)}
          style={styles.actionSecondary}
        >
          <Text style={styles.actionSecondaryLabel}>Ver mapa</Text>
        </Pressable>
      </View>
    </Card>
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
  card: {
    gap: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeLabel: {
    color: "#051018",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.backgroundSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  body: {
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  metric: {
    flex: 1,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundSoft,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontSize: 13,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  actionPrimaryLabel: {
    color: "#051018",
    fontWeight: "900",
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.pill,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionSecondaryLabel: {
    color: theme.colors.text,
    fontWeight: "800",
  },
});
