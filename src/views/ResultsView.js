import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { ActionButton } from "@/components/ActionButton";
import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { RouteCard } from "@/components/RouteCard";
import { theme } from "@/config/theme";

export function ResultsView({
  destination,
  routes = [],
  favoriteRouteIds = [],
  loading,
  userLocation,
  destinationCoordinate,
  locationPermission,
  isVisitor,
  onOpenFavorites,
  onOpenRoute,
  onOpenMap,
  onOpenSearch,
  onToggleFavorite,
  reload,
}) {
  const mapRef = useRef(null);
  const [radarRadius, setRadarRadius] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [discoveredRouteIds, setDiscoveredRouteIds] = useState([]);

  // Ejecutar animación de radar una vez cargadas las coordenadas
  useEffect(() => {
    if (loading || !userLocation) return;

    setRadarRadius(0);
    setIsAnimating(true);
    setDiscoveredRouteIds([]);

    let currentRadius = 0;
    // Calcular el rango dinámico de radar (máxima distancia de las rutas más un margen)
    const maxRouteDist = routes.length > 0
      ? Math.max(...routes.map(r => r.minDistToUser ?? 0))
      : 2000;
    const targetMax = Math.min(Math.max(2000, maxRouteDist + 400), 3000); // Entre 2km y km

    const interval = setInterval(() => {
      currentRadius += 100; // Incrementa 100m por ciclo
      setRadarRadius(currentRadius);

      // Identificar las rutas que ya quedan dentro del radio actual del radar
      const discovered = routes
        .filter(r => (r.minDistToUser ?? Infinity) <= currentRadius)
        .map(r => r.id);

      setDiscoveredRouteIds(discovered);

      // Detener si alcanzamos el radio máximo o si ya encontramos todas las rutas candidatas
      if (currentRadius >= targetMax || (routes.length > 0 && discovered.length === routes.length)) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 45); // ~1.5 segundos en barrer 3000 metros

    return () => clearInterval(interval);
  }, [loading, userLocation, routes]);

  // Encuadrar el mapa cuando la animación de radar se detiene
  useEffect(() => {
    if (!isAnimating && mapRef.current && userLocation && destinationCoordinate) {
      const coordinates = [
        userLocation,
        destinationCoordinate,
        ...routes
          .filter(r => discoveredRouteIds.includes(r.id))
          .flatMap(r => r.pathCoordinates || [])
      ];

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [isAnimating, discoveredRouteIds, userLocation, destinationCoordinate, routes]);

  const hasResults = routes.length > 0;
  const discoveredRoutes = routes.filter((r) => discoveredRouteIds.includes(r.id));
  const isWeb = Platform.OS === "web";

  // Región inicial para centrar el mapa
  const initialRegion = userLocation ? {
    ...userLocation,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : {
    latitude: -5.1945,
    longitude: -80.6328,
    latitudeDelta: 0.025,
    longitudeDelta: 0.025,
  };

  const handleRestartScan = () => {
    if (reload) {
      reload();
    } else {
      setRadarRadius(0);
      setIsAnimating(true);
      setDiscoveredRouteIds([]);
    }
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Buscador de Proximidad</Text>
        <Text style={styles.title}>Resultados con Radar</Text>
        <Text style={styles.subtitle}>
          Buscando ruta a: <Text style={styles.destHighlight}>{destination || "Cualquier destino"}</Text>
        </Text>
      </View>

      <View style={styles.rowActions}>
        <ActionButton
          label="Nueva búsqueda"
          onPress={onOpenSearch}
          variant="secondary"
        />
        {/* Solo usuarios registrados pueden ver favoritos */}
        {!isVisitor && (
          <ActionButton
            label="Favoritas"
            onPress={onOpenFavorites}
            variant="secondary"
          />
        )}
      </View>

      {loading ? (
        <Card style={styles.radarCard}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.radarStatusText}>Ubicando señal GPS y resolviendo coordenadas...</Text>
        </Card>
      ) : (
        <>
          {/* Visualización del Mapa o Fallback Web */}
          {isWeb ? (
            <Card style={styles.webContainer}>
              <Text style={styles.webTitle}>Simulador de Radar</Text>
              <Text style={styles.webSubtitle}>
                {isAnimating
                  ? `Buscando colectivos... Radio expandido: ${radarRadius}m`
                  : "Escaneo de proximidad completado."}
              </Text>
              <View style={styles.webProgressBg}>
                <View
                  style={[
                    styles.webProgressBar,
                    { width: `${Math.min(100, (radarRadius / 3000) * 100)}%` }
                  ]}
                />
              </View>
            </Card>
          ) : (
            <View style={styles.mapCard}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                initialRegion={initialRegion}
                showsUserLocation={false}
                showsMyLocationButton={false}
              >
                {/* Posición del usuario */}
                {userLocation && (
                  <Marker
                    coordinate={userLocation}
                    title="Tu Ubicación"
                    description="Punto de origen de la búsqueda"
                  >
                    <View style={styles.userMarkerOutline}>
                      <View style={styles.userMarkerDot} />
                    </View>
                  </Marker>
                )}

                {/* Coordenada de destino */}
                {destinationCoordinate && (
                  <Marker
                    coordinate={destinationCoordinate}
                    title="Destino Seleccionado"
                    description={destination}
                    pinColor={theme.colors.secondary}
                  />
                )}

                {/* Círculo de Radar animado */}
                {userLocation && (
                  <Circle
                    center={userLocation}
                    radius={radarRadius}
                    strokeColor="rgba(0, 245, 212, 0.45)"
                    fillColor="rgba(0, 245, 212, 0.09)"
                    strokeWidth={2}
                  />
                )}

                {/* Polylines de las rutas descubiertas por el radar */}
                {discoveredRoutes.map((route) => (
                  <Polyline
                    key={`poly-${route.id}`}
                    coordinates={route.pathCoordinates}
                    strokeColor={route.color || theme.colors.primary}
                    strokeWidth={5}
                  />
                ))}
              </MapView>
            </View>
          )}

          {/* Estado del Escaneo */}
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusBadgeContainer}>
                <Text style={[styles.statusBadge, { color: isAnimating ? theme.colors.primary : theme.colors.success }]}>
                  {isAnimating ? "Escaneando..." : "Completado"}
                </Text>
                <Text style={styles.radarDistText}>Radio: {radarRadius} metros</Text>
              </View>
              {!isAnimating && (
                <TouchableOpacity style={styles.rescanBtn} onPress={handleRestartScan}>
                  <Text style={styles.rescanBtnText}>Re-escanear</Text>
                </TouchableOpacity>
              )}
            </View>

            {discoveredRoutes.length > 0 ? (
              <Text style={styles.resultsSummary}>
                Se han localizado <Text style={styles.boldText}>{discoveredRoutes.length}</Text> rutas de transporte que pasan cerca de tu destino y tu ubicación.
              </Text>
            ) : isAnimating ? (
              <Text style={styles.resultsSummary}>Expandiendo ondas de radar en la red de colectivos de Piura...</Text>
            ) : (
              <Text style={styles.errorSummary}>
                No se hallaron rutas directas en un rango de 5km de tu ubicación que conecten con tu destino.
              </Text>
            )}
          </Card>

          {/* Listado de rutas encontradas */}
          {discoveredRoutes.length > 0 && (
            <View style={styles.resultsList}>
              <Text style={styles.listTitle}>Líneas recomendadas por costo de viaje</Text>
              <FlatList
                data={discoveredRoutes}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item, index }) => (
                  <View style={styles.routeCardWrapper}>
                    <View style={styles.proximityHeader}>
                      {index === 0 ? (
                        <View style={styles.bestRouteBadge}>
                          <Text style={styles.bestRouteBadgeText}>Recomendada</Text>
                        </View>
                      ) : (
                        <View />
                      )}
                    </View>

                    {/* Desglose visual del viaje */}
                    <View style={styles.breakdownContainer}>
                      <View style={styles.breakdownStep}>
                        <Ionicons name="walk" size={14} color={theme.colors.textSoft} />
                        <Text style={styles.breakdownText}>{formatDistanceValue(item.walkToBoard)}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={12} color={theme.colors.textMuted} />
                      <View style={styles.breakdownStep}>
                        <Ionicons name="bus" size={14} color={theme.colors.primary} />
                        <Text style={styles.breakdownText}>{formatDistanceValue(item.routeDistance)}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={12} color={theme.colors.textMuted} />
                      <View style={styles.breakdownStep}>
                        <Ionicons name="walk" size={14} color={theme.colors.textSoft} />
                        <Text style={styles.breakdownText}>{formatDistanceValue(item.walkToDest)}</Text>
                      </View>
                    </View>

                    <RouteCard
                      route={item}
                      isFavorite={!isVisitor && favoriteRouteIds.includes(item.id)}
                      onPressDetail={onOpenRoute}
                      onPressMap={onOpenMap}
                      onToggleFavorite={isVisitor ? null : onToggleFavorite}
                    />
                  </View>
                )}
              />
            </View>
          )}
        </>
      )}
    </AppScreen>
  );
}

function formatDistanceValue(meters) {
  if (meters === undefined || meters === null || isNaN(meters)) return "0 m";
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs,
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
  destHighlight: {
    color: theme.colors.secondary,
    fontWeight: "800",
  },
  rowActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  radarCard: {
    justifyContent: "center",
    alignItems: "center",
    padding: 36,
    gap: 16,
  },
  radarStatusText: {
    color: theme.colors.textSoft,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  mapCard: {
    height: 300,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  map: {
    flex: 1,
  },
  statusCard: {
    gap: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadgeContainer: {
    gap: 2,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  radarDistText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  rescanBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
  },
  rescanBtnText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  resultsSummary: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  errorSummary: {
    color: theme.colors.danger,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  boldText: {
    fontWeight: "900",
    color: theme.colors.primary,
  },
  resultsList: {
    gap: theme.spacing.md,
    marginTop: 6,
  },
  listTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    paddingHorizontal: 4,
  },
  separator: {
    height: theme.spacing.lg,
  },
  routeCardWrapper: {
    gap: 8,
  },
  proximityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  proximityInfoText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  breakdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  breakdownStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  breakdownIcon: {
    fontSize: 14,
  },
  breakdownText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  breakdownArrow: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "400",
  },
  bestRouteBadge: {
    backgroundColor: "rgba(241, 91, 181, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(241, 91, 181, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestRouteBadgeText: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontWeight: "800",
  },
  webContainer: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  webTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  webSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  webProgressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    width: "100%",
    overflow: "hidden",
  },
  webProgressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  userMarkerOutline: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(56, 189, 248, 0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0ea5e9",
    borderWidth: 1.5,
    borderColor: "white",
  },
});
