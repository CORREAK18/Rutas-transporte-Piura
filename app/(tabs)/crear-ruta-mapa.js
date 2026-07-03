import { theme } from "@/config/theme";
import { useCreateRouteMapController } from "@/controllers/useCreateRouteMapController";
import { setPendingPath, setPendingStops } from "@/utils/routePathStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

export default function CreateRouteMapPage() {
  const router = useRouter();

  // Estados del controlador
  const {
    pathCoordinates,
    stops,
    userLocation,
    initialRegion,
    locationLoading,
    mapRef,
    addPoint,
    addStop,
    undoLastPoint,
    undoLastStop,
    clearAll,
    centerOnUser,
  } = useCreateRouteMapController();

  // Modo de dibujo: "path" (trazar línea) o "stop" (agregar paradero)
  const [drawMode, setDrawMode] = useState("path");

  // Estados del modal de paraderos
  const [modalVisible, setModalVisible] = useState(false);
  const [tempCoordinate, setTempCoordinate] = useState(null);
  const [stopName, setStopName] = useState("");
  const [stopReference, setStopReference] = useState("");

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    
    if (drawMode === "path") {
      addPoint(coordinate);
    } else {
      // Abrir modal para registrar paradero
      setTempCoordinate(coordinate);
      setStopName(`Paradero ${stops.length + 1}`);
      setStopReference("");
      setModalVisible(true);
    }
  };

  const handleSaveStop = () => {
    if (!stopName.trim()) {
      Alert.alert("Nombre requerido", "Por favor ingresa un nombre para el paradero.");
      return;
    }

    if (tempCoordinate) {
      addStop(tempCoordinate, stopName, stopReference);
    }
    
    setModalVisible(false);
    setTempCoordinate(null);
    setStopName("");
    setStopReference("");
  };

  const handleConfirm = () => {
    if (pathCoordinates.length < 2) {
      Alert.alert(
        "Falta recorrido",
        "Por favor toca el mapa para trazar al menos 2 puntos del recorrido.",
      );
      return;
    }

    // Comunicar datos al store de vuelta al formulario
    setPendingPath([...pathCoordinates]);
    setPendingStops([...stops]);
    router.back();
  };

  const handleClearAll = () => {
    if (pathCoordinates.length === 0 && stops.length === 0) return;
    Alert.alert(
      "Borrar trazado",
      "¿Quieres borrar todo el recorrido y los paraderos creados?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Borrar todo", style: "destructive", onPress: clearAll },
      ],
    );
  };

  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Ubicando tu GPS...</Text>
        <Text style={styles.loadingHint}>Centrando el mapa para iniciar trazado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header flotante */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Trazado en Vivo</Text>
          <Text style={styles.headerSubtitle}>
            {pathCoordinates.length} pts. trayectoria • {stops.length} paraderos
          </Text>
        </View>

        <View style={styles.modeIndicator}>
          <Text style={styles.modeIndicatorText}>
            {drawMode === "path" ? "✏️ Recorrido" : "🚌 Paraderos"}
          </Text>
        </View>
      </View>

      {/* Alternador de Modo Flotante */}
      <View style={styles.modeSelectorRow}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            drawMode === "path" && styles.modeTabActive,
          ]}
          onPress={() => setDrawMode("path")}
        >
          <Text
            style={[
              styles.modeTabText,
              drawMode === "path" && styles.modeTabTextActive,
            ]}
          >
            ✏️ Trazar Línea
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            drawMode === "stop" && styles.modeTabActive,
          ]}
          onPress={() => setDrawMode("stop")}
        >
          <Text
            style={[
              styles.modeTabText,
              drawMode === "stop" && styles.modeTabTextActive,
            ]}
          >
            🚌 Poner Paradero
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mapa interactivo */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {/* Polyline del trazado en tiempo real */}
        {pathCoordinates.length >= 2 && (
          <Polyline
            coordinates={pathCoordinates}
            strokeColor="#38bdf8"
            strokeWidth={5}
          />
        )}

        {/* Marcador de INICIO (primer punto de la línea) — verde */}
        {pathCoordinates.length >= 1 && (
          <Marker
            coordinate={pathCoordinates[0]}
            title="Inicio de recorrido"
            pinColor="green"
            tappable={false}
          />
        )}

        {/* Marcador de FIN (último punto de la línea) — rojo */}
        {pathCoordinates.length >= 2 && (
          <Marker
            coordinate={pathCoordinates[pathCoordinates.length - 1]}
            title="Fin de recorrido"
            pinColor="red"
            tappable={false}
          />
        )}

        {/* Marcadores de paraderos creados — Marcadores oficiales color rosa neón */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={stop.coordinate}
            title={stop.name}
            description={stop.reference || "Sin referencia"}
            pinColor={theme.colors.secondary}
          />
        ))}
      </MapView>

      {/* Controles flotantes (derecha) */}
      <View style={styles.sideControls}>
        {userLocation && (
          <TouchableOpacity style={styles.iconButton} onPress={centerOnUser}>
            <Text style={styles.iconButtonText}>📍</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.iconButton,
            pathCoordinates.length === 0 && styles.iconButtonDisabled,
          ]}
          onPress={drawMode === "path" ? undoLastPoint : undoLastStop}
          disabled={drawMode === "path" ? pathCoordinates.length === 0 : stops.length === 0}
        >
          <Text style={styles.iconButtonText}>↩️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            pathCoordinates.length === 0 && stops.length === 0 && styles.iconButtonDisabled,
          ]}
          onPress={handleClearAll}
          disabled={pathCoordinates.length === 0 && stops.length === 0}
        >
          <Text style={styles.iconButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Barra inferior de confirmación */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Descartar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            pathCoordinates.length < 2 && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>
            ✓ Confirmar ({stops.length} paraderos)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal flotante para crear Paradero */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🚌 Nuevo Paradero</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa los datos para registrar esta parada oficial de la ruta.
            </Text>

            {/* Input: Nombre */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Nombre del paradero *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Paradero Óvalo Grau"
                placeholderTextColor="#64748b"
                value={stopName}
                onChangeText={setStopName}
              />
            </View>

            {/* Input: Referencia */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Referencia visual (opcional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Frente al Banco de la Nación"
                placeholderTextColor="#64748b"
                value={stopReference}
                onChangeText={setStopReference}
              />
            </View>

            {/* Acciones */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setTempCoordinate(null);
                }}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSaveStop}
              >
                <Text style={styles.modalConfirmBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    gap: 12,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "750",
  },
  loadingHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  map: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7, 17, 31, 0.93)",
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 1,
  },
  modeIndicator: {
    backgroundColor: "rgba(94, 234, 212, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(94, 234, 212, 0.3)",
  },
  modeIndicatorText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  modeSelectorRow: {
    position: "absolute",
    top: 116,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    backgroundColor: "#10233d",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: theme.colors.primary,
  },
  modeTabText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "750",
  },
  modeTabTextActive: {
    color: "#07111f",
    fontWeight: "900",
  },
  sideControls: {
    position: "absolute",
    right: 14,
    bottom: 130,
    gap: 10,
    zIndex: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(3, 7, 18, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
  iconButtonText: {
    fontSize: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 36,
    backgroundColor: "rgba(7, 17, 31, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    zIndex: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cancelButtonText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "700",
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: "#1e3a4a",
    shadowOpacity: 0,
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  waypointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#38bdf8",
    borderWidth: 1.5,
    borderColor: "white",
  },
  stopMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  stopMarkerBadge: {
    backgroundColor: "#22c55e",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  stopMarkerEmoji: {
    fontSize: 16,
  },
  stopMarkerPointer: {
    width: 4,
    height: 6,
    backgroundColor: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 17, 31, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#10233d",
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#f8fafc",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 16,
  },
  modalInputGroup: {
    gap: 6,
  },
  modalInputLabel: {
    color: "#b2c6dc",
    fontSize: 12,
    fontWeight: "700",
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalCancelBtnText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "750",
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  modalConfirmBtnText: {
    color: theme.colors.background,
    fontSize: 13,
    fontWeight: "900",
  },
});
