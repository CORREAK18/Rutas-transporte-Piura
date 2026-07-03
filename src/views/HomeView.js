import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ActionButton } from "@/components/ActionButton";
import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { RouteCard } from "@/components/RouteCard";
import { StatsGrid } from "@/components/StatsGrid";
import { theme } from "@/config/theme";

function RouteCardSkeleton({ pulseAnim }) {
  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonBadge} />
      </View>
      <View style={styles.skeletonBody} />
      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonLineMedium} />
      </View>
    </Animated.View>
  );
}

export function HomeView({
  loading,
  stats,
  featuredRoutes,
  favoriteRoutes,
  currentUser,
  onLogout,
  onOpenSearch,
  onOpenFavorites,
  onOpenCreateRoute,
  onOpenRoute,
  onOpenMap,
}) {
  const isAdmin = currentUser?.role === "admin";
  const isVisitor = currentUser?.role === "visitante";
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let anim = null;
    if (loading) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(0.3);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [loading, pulseAnim]);

  return (
    <AppScreen>
      {/* Cabecera superior de usuario */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeKicker}>Rutas de Piura</Text>
          <Text style={styles.welcomeTitle}>
            Hola, {currentUser?.displayName || "Cargando..."}
          </Text>
          <Text style={styles.roleTag}>
            Rol: {currentUser?.role === "admin" ? "Administrador 🛠️" : currentUser?.role === "usuario" ? "Usuario 👤" : "Visitante 🌐"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutBtnText}>Salir 🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Hero / Descripción general dentro de una tarjeta destacada */}
      <Card style={styles.heroCard}>
        <Text style={styles.heroTitle}>
          Encuentra rutas y paraderos de transporte público.
        </Text>
        <Text style={styles.heroSubtitle}>
          Visualiza el trayecto de colectivos, combis y buses de Piura en tiempo real sobre el mapa y descubre tu posición con respecto a su ruta.
        </Text>

        <View style={styles.actions}>
          {/* Solo el Admin puede ver la opción de Crear ruta */}
          {isAdmin && (
            <ActionButton
              label="Crear Nueva Ruta"
              onPress={onOpenCreateRoute}
              variant="primary"
            />
          )}

          <ActionButton
            label="Buscar Ruta"
            onPress={onOpenSearch}
            variant="secondary"
          />

          {/* Solo usuarios registrados pueden ver favoritos */}
          {!isVisitor && (
            <ActionButton
              label="Ver Favoritas"
              onPress={onOpenFavorites}
              variant="secondary"
            />
          )}
        </View>
      </Card>

      {/* Métricas rápidas */}
      <StatsGrid items={stats} />

      {/* Sección: Rutas destacadas */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rutas destacadas</Text>
          <Text style={styles.sectionHint}>
            {loading ? "Cargando paraderos..." : "Red de Piura"}
          </Text>
        </View>

        {loading ? (
          <View style={styles.list}>
            <RouteCardSkeleton pulseAnim={pulseAnim} />
            <RouteCardSkeleton pulseAnim={pulseAnim} />
          </View>
        ) : featuredRoutes.length ? (
          <View style={styles.list}>
            {featuredRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onPressDetail={onOpenRoute}
                onPressMap={onOpenMap}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No hay rutas disponibles"
            message="Registra una ruta desde el menú de administrador para verla listada aquí."
          />
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
    gap: 2,
  },
  welcomeKicker: {
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  welcomeTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "950",
  },
  roleTag: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "rgba(248, 113, 113, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.25)",
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "850",
  },
  heroCard: {
    padding: 22,
    gap: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: "rgba(0, 245, 212, 0.15)",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "950",
  },
  heroSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: 8,
  },
  sectionContainer: {
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "950",
  },
  sectionHint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  list: {
    gap: theme.spacing.md,
  },
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    height: 120,
    gap: 12,
    justifyContent: "space-between",
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonLineShort: {
    backgroundColor: theme.colors.surfaceAlt,
    width: "40%",
    height: 16,
    borderRadius: 8,
  },
  skeletonBadge: {
    backgroundColor: theme.colors.surfaceAlt,
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  skeletonBody: {
    backgroundColor: theme.colors.surfaceAlt,
    width: "85%",
    height: 14,
    borderRadius: 7,
  },
  skeletonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonLineMedium: {
    backgroundColor: theme.colors.surfaceAlt,
    width: "60%",
    height: 14,
    borderRadius: 7,
  },
});

