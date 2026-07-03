import { StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import { ActionButton } from "@/components/ActionButton";
import { AppScreen } from "@/components/AppScreen";
import { Card } from "@/components/Card";
import { InputField } from "@/components/InputField";
import { theme } from "@/config/theme";

export function SearchView({
  origin,
  destination,
  destinationCoordinate,
  userLocation,
  selectDestination,
  canSearch,
  loading,
  onOpenFavorites,
  onSubmitSearch,
}) {
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

  // Coordenadas rápidas para simulación en Web
  const webSimulations = [
    { name: "Mercado Modelo", coordinate: { latitude: -5.195, longitude: -80.6304 } },
    { name: "Hospital Regional", coordinate: { latitude: -5.1914, longitude: -80.6297 } },
    { name: "Plaza de Armas", coordinate: { latitude: -5.1959, longitude: -80.6278 } },
    { name: "Av. Grau", coordinate: { latitude: -5.1938, longitude: -80.6322 } },
  ];

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text style={styles.kicker}>Buscar ruta</Text>
        <Text style={styles.title}>¿A dónde quieres ir?</Text>
        <Text style={styles.subtitle}>
          Selecciona tu destino tocando el mapa. El sistema utilizará tu ubicación GPS actual y buscará la mejor ruta mediante un cálculo de costo total de viaje.
        </Text>
      </View>

      <Card style={styles.formCard}>
        <InputField
          label="Punto de Origen"
          value={origin}
          editable={false}
          style={styles.disabledInput}
        />
        <InputField
          label="Punto de Destino"
          value={destination || "Toca el mapa para seleccionar..."}
          editable={false}
          style={styles.disabledInput}
        />

        <View style={styles.rowActions}>
          <ActionButton
            label="Buscar Ruta"
            onPress={onSubmitSearch}
            disabled={!canSearch || loading}
          />
          <ActionButton
            label="Favoritas"
            onPress={onOpenFavorites}
            variant="secondary"
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Ubicación del Destino</Text>

      {loading ? (
        <Card style={styles.mapLoadingCard}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Obteniendo señal GPS...</Text>
        </Card>
      ) : isWeb ? (
        <Card style={styles.webContainer}>
          <Text style={styles.webTitle}>Simulador de Mapa</Text>
          <Text style={styles.webSubtitle}>
            En la versión web, selecciona uno de los destinos de prueba para simular la selección en el mapa:
          </Text>
          
          <View style={styles.simList}>
            {webSimulations.map((sim) => {
              const isSelected = destinationCoordinate && 
                destinationCoordinate.latitude === sim.coordinate.latitude &&
                destinationCoordinate.longitude === sim.coordinate.longitude;
              return (
                <TouchableOpacity
                  key={sim.name}
                  style={[styles.simButton, isSelected && styles.simButtonSelected]}
                  onPress={() => selectDestination(sim.coordinate)}
                >
                  <Text style={[styles.simButtonText, isSelected && styles.simButtonTextSelected]}>
                    {sim.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {destinationCoordinate && (
            <View style={styles.selectionIndicatorRow}>
              <Ionicons name="pin-sharp" size={16} color={theme.colors.primary} />
              <Text style={styles.selectionIndicator}>
                Destino fijado en: {destinationCoordinate.latitude.toFixed(5)}, {destinationCoordinate.longitude.toFixed(5)}
              </Text>
            </View>
          )}
        </Card>
      ) : (
        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            initialRegion={initialRegion}
            onPress={(e) => selectDestination(e.nativeEvent.coordinate)}
          >
            {/* Ubicación del usuario */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Tu Ubicación"
                description="Origen de la búsqueda"
              >
                <View style={styles.userMarkerOutline}>
                  <View style={styles.userMarkerDot} />
                </View>
              </Marker>
            )}

            {/* Ubicación del destino seleccionado */}
            {destinationCoordinate && (
              <Marker
                coordinate={destinationCoordinate}
                title="Destino Seleccionado"
                description="Punto de llegada"
                pinColor={theme.colors.secondary}
              />
            )}
          </MapView>
          <View style={styles.mapInstruction}>
            <Text style={styles.mapInstructionText}>
              Toca cualquier parte del mapa para marcar tu destino
            </Text>
          </View>
        </View>
      )}
    </AppScreen>
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    gap: theme.spacing.md,
  },
  disabledInput: {
    opacity: 0.7,
  },
  rowActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
  },
  mapLoadingCard: {
    justifyContent: "center",
    alignItems: "center",
    padding: 36,
    gap: 16,
  },
  loadingText: {
    color: theme.colors.textSoft,
    fontSize: 14,
    textAlign: "center",
  },
  mapCard: {
    height: 320,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  map: {
    flex: 1,
  },
  mapInstruction: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(10, 25, 41, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  mapInstructionText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  webContainer: {
    padding: 20,
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
    lineHeight: 18,
  },
  simList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 4,
  },
  simButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
  },
  simButtonSelected: {
    borderColor: theme.colors.secondary,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  simButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  simButtonTextSelected: {
    color: theme.colors.secondary,
    fontWeight: "900",
  },
  selectionIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  selectionIndicator: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "800",
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
