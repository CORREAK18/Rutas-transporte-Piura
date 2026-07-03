import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { theme } from "@/config/theme";
import { Card } from "./Card";

/**
 * Componente de mapa que dibuja la ruta (polyline + marcadores).
 * Con showUserLocation=true muestra la posición actual del usuario.
 */
export function MapRoute({ route, stops = [], region, showUserLocation = false }) {
  if (!route) {
    return null;
  }

  if (Platform.OS === "web") {
    return (
      <Card style={styles.mapFallback}>
        <Text style={styles.fallbackTitle}>Mapa disponible en Android/iOS</Text>
        <Text style={styles.fallbackText}>
          El recorrido se dibuja como una polyline sobre el mapa en la versión
          móvil.
        </Text>
        <View style={styles.fallbackList}>
          {[
            route.origin,
            ...stops.map((stop) => ({ label: stop.name })),
            route.destination,
          ].map((item, index) => (
            <Text key={`${item.label}-${index}`} style={styles.fallbackItem}>
              • {item.label}
            </Text>
          ))}
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.mapCard}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region ?? undefined}
        mapType="standard"
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
      >
        {/* Marcador de inicio */}
        {route.origin?.coordinate ? (
          <Marker
            coordinate={route.origin.coordinate}
            title="Inicio"
            description={route.origin.label}
            pinColor={theme.colors.success}
          />
        ) : null}

        {/* Marcador de fin */}
        {route.destination?.coordinate ? (
          <Marker
            coordinate={route.destination.coordinate}
            title="Fin"
            description={route.destination.label}
            pinColor={theme.colors.danger}
          />
        ) : null}

        {/* Paraderos intermedios */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={stop.coordinate}
            title={stop.name}
            description={stop.reference}
            pinColor={
              index === 0 ? theme.colors.primary : theme.colors.secondary
            }
          />
        ))}

        {/* Polyline del trazado de la ruta */}
        {route.pathCoordinates?.length ? (
          <Polyline
            coordinates={route.pathCoordinates}
            strokeColor={route.color}
            strokeWidth={5}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    height: 420,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    gap: theme.spacing.md,
  },
  fallbackTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  fallbackText: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  fallbackList: {
    gap: 8,
  },
  fallbackItem: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
