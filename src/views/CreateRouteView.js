import { ActionButton } from "@/components/ActionButton";
import { InputField } from "@/components/InputField";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ROUTES } from "@/config/navigation";
import { theme } from "@/config/theme";
import { useCreateRouteController } from "@/controllers/useCreateRouteController";
import { getCurrentUser } from "@/services/authService";
import {
  consumePendingPath,
  consumePendingStops,
  hasPendingPath,
  hasPendingStops,
  setPendingPath,
  setPendingStops,
} from "@/utils/routePathStore";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Paleta de colores profesionales para identificar las rutas
const ROUTE_COLORS = [
  "#f97316", // Naranja
  "#5eead4", // Turquesa
  "#38bdf8", // Celeste
  "#a78bfa", // Morado
  "#f43f5e", // Carmín
  "#22c55e", // Verde
  "#fbbf24", // Ámbar
  "#ec4899", // Rosado
];

// Nombre legible por color para mostrar al usuario
const COLOR_NAMES = {
  "#f97316": "Naranja",
  "#5eead4": "Turquesa",
  "#38bdf8": "Celeste",
  "#a78bfa": "Morado",
  "#f43f5e": "Carmín",
  "#22c55e": "Verde",
  "#fbbf24": "Ámbar",
  "#ec4899": "Rosado",
};

export function CreateRouteView({ routeId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const {
    formData,
    handleInputChange,
    setPathCoordinatesAndStops,
    handleCreateRoute,
    loading,
    error,
  } = useCreateRouteController(routeId);

  // Al enfocar la vista, validar rol del usuario y consumir coordenadas/paraderos del store
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function checkAuthAndConsume() {
        const currentUser = await getCurrentUser();
        if (!active) return;

        setUser(currentUser);
        setAuthLoading(false);

        if (hasPendingPath()) {
          const path = consumePendingPath();
          const stops = hasPendingStops() ? consumePendingStops() : [];
          if (path && path.length >= 2) {
            setPathCoordinatesAndStops(path, stops);
          }
        }
      }

      checkAuthAndConsume();

      return () => {
        active = false;
      };
    }, [setPathCoordinatesAndStops]),
  );

  const onTracePress = () => {
    if (formData.pathCoordinates && formData.pathCoordinates.length > 0) {
      setPendingPath([...formData.pathCoordinates]);
    }
    if (formData.stops && formData.stops.length > 0) {
      setPendingStops([...formData.stops]);
    }
    router.push(ROUTES.createRouteMap());
  };

  const onCreatePress = async () => {
    const resultId = await handleCreateRoute();
    if (resultId) {
      Alert.alert(
        routeId ? "✅ Ruta actualizada" : "✅ Ruta publicada",
        routeId
          ? `La ruta "${formData.name}" ha sido actualizada exitosamente.`
          : `La ruta "${formData.name}" ha sido creada y guardada en el sistema.`,
        [
          {
            text: "Ver Detalles",
            onPress: () => router.replace(ROUTES.routeDetail(resultId)),
          },
          { text: "Ir a Inicio", onPress: () => router.replace("/(tabs)") },
          ...(routeId ? [] : [{ text: "Trazar otra", style: "cancel" }]),
        ],
      );
    }
  };

  const pathCount = formData.pathCoordinates?.length ?? 0;
  const stopsCount = formData.stops?.length ?? 0;
  const hasPath = pathCount >= 2;

  // Pantalla de carga mientras se valida la sesión
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Validando credenciales...</ThemedText>
      </View>
    );
  }

  // Vista de acceso restringido si no es Administrador
  if (user?.role !== "admin") {
    return (
      <ThemedView style={styles.restrictedContainer}>
        <View style={styles.restrictedCard}>
          <ThemedText style={styles.restrictedIcon}>🔒</ThemedText>
          <ThemedText style={styles.restrictedTitle}>Acceso Restringido</ThemedText>
          <ThemedText style={styles.restrictedMessage}>
            Solo los administradores autorizados de transporte pueden trazar y publicar nuevas rutas en la aplicación.
          </ThemedText>
          <ActionButton
            label="Volver al Inicio"
            onPress={() => router.replace("/(tabs)")}
            variant="primary"
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabecera */}
        <View style={styles.header}>
          <ThemedText style={styles.pageTitle}>
            {routeId ? "Editar Ruta" : "Crear Nueva Ruta"}
          </ThemedText>
          <ThemedText style={styles.pageSubtitle}>
            {routeId
              ? "Modifica los campos, cambia el color identificativo o edita el recorrido y paraderos sobre el mapa."
              : "Completa la información, selecciona el color identificativo y traza el recorrido con sus paraderos sobre el mapa."}
          </ThemedText>
        </View>

        {/* Mensaje de Error */}
        {error ? (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
          </View>
        ) : null}

        {/* Tarjeta: Información básica */}
        <View style={styles.formCard}>
          <ThemedText style={styles.sectionTitle}>Detalles de la Línea</ThemedText>

          <InputField
            label="Empresa / Consorcio de Transporte"
            placeholder="Ej: Emtrubapi, Super Rápido, Star"
            value={formData.empresa}
            onChangeText={(v) => handleInputChange("empresa", v)}
            editable={!loading}
          />

          <InputField
            label="Código de Ruta (Identificador) *"
            placeholder="Ej: LD-12, COMBI-STAR"
            value={formData.code}
            onChangeText={(v) => handleInputChange("code", v)}
            editable={!loading}
          />

          <InputField
            label="Nombre de la Ruta (Origen - Destino) *"
            placeholder="Ej: Piura – Castilla (Vía Av. Grau)"
            value={formData.name}
            onChangeText={(v) => handleInputChange("name", v)}
            editable={!loading}
          />

          <InputField
            label="Descripción y Recorrido (opcional)"
            placeholder="Ej: Pasa por el Centro Comercial, Hospital Regional y Terminal Castilla."
            value={formData.description}
            onChangeText={(v) => handleInputChange("description", v)}
            multiline
            editable={!loading}
          />

          <InputField
            label="Tarifa del pasaje sugerida (S/.)"
            placeholder="Ej: 1.50"
            value={formData.fare}
            onChangeText={(v) => handleInputChange("fare", v)}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        {/* Tarjeta: Identificación por Color */}
        <View style={styles.formCard}>
          <ThemedText style={styles.sectionTitle}>Color de la Ruta</ThemedText>
          <ThemedText style={styles.sectionHint}>
            Elige el color con el que se mostrará esta ruta y sus buses en el mapa público.
          </ThemedText>

          <View style={styles.colorPalette}>
            {ROUTE_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorChip,
                  { backgroundColor: color },
                  formData.color === color && styles.colorChipSelected,
                ]}
                onPress={() => handleInputChange("color", color)}
                activeOpacity={0.7}
              />
            ))}
          </View>

          <View style={styles.colorPreviewRow}>
            <View
              style={[
                styles.colorPreviewDot,
                { backgroundColor: formData.color },
              ]}
            />
            <ThemedText style={styles.colorPreviewLabel}>
              {COLOR_NAMES[formData.color] ?? formData.color}
            </ThemedText>
          </View>
        </View>

        {/* Tarjeta: Trazado en mapa */}
        <View style={styles.formCard}>
          <ThemedText style={styles.sectionTitle}>Trazado en el Mapa</ThemedText>
          <ThemedText style={styles.sectionHint}>
            Usa el mapa interactivo para dibujar las calles del recorrido y marcar la ubicación exacta de los paraderos.
          </ThemedText>

          <View
            style={[
              styles.traceStatusBox,
              hasPath ? styles.traceStatusOk : styles.traceStatusEmpty,
            ]}
          >
            <ThemedText
              style={[
                styles.traceStatusText,
                hasPath ? styles.traceStatusTextOk : styles.traceStatusTextEmpty,
              ]}
            >
              {hasPath
                ? `✅ Recorrido listo:\n   • ${pathCount} puntos de trayectoria.\n   • ${stopsCount} paraderos registrados.`
                : "⬜ Falta trazado: Toca el botón de abajo para dibujar el recorrido en el mapa."}
            </ThemedText>
          </View>

          <ActionButton
            label={hasPath ? "✏️ Editar trayectoria y paraderos" : "🗺️ Trazar recorrido en mapa"}
            onPress={onTracePress}
            disabled={loading}
            variant="secondary"
          />
        </View>

        {/* Botón de Publicación */}
        <View style={styles.buttonContainer}>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <ThemedText style={styles.publishingText}>
                Guardando ruta en la base de datos...
              </ThemedText>
            </View>
          )}

          <ActionButton
            label={loading ? "Guardando..." : routeId ? "💾 Guardar Cambios" : "🚌 Publicar Ruta Oficial"}
            onPress={onCreatePress}
            disabled={loading || !hasPath}
            backgroundColor={
              loading || !hasPath ? "#162536" : theme.colors.primary
            }
            variant="primary"
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Helper para arreglar error en JSX
function Paragraph({ children, style }) {
  return <ThemedText style={style}>{children}</ThemedText>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    gap: 16,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "750",
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  restrictedCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 360,
  },
  restrictedIcon: {
    fontSize: 54,
    marginBottom: 8,
  },
  restrictedTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    textAlign: "center",
  },
  restrictedMessage: {
    fontSize: 14,
    color: theme.colors.textSoft,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  header: {
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "950",
    color: theme.colors.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: theme.colors.textSoft,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 14,
    padding: 14,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: "750",
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: theme.colors.textSoft,
    lineHeight: 18,
    marginBottom: 4,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginVertical: 4,
  },
  colorChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: "transparent",
  },
  colorChipSelected: {
    borderColor: theme.colors.text,
    transform: [{ scale: 1.15 }],
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  colorPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  colorPreviewDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  colorPreviewLabel: {
    fontSize: 13,
    color: theme.colors.textSoft,
    fontWeight: "750",
  },
  traceStatusBox: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginVertical: 4,
  },
  traceStatusEmpty: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderColor: "rgba(255,255,255,0.07)",
  },
  traceStatusOk: {
    backgroundColor: "rgba(0, 245, 212, 0.08)",
    borderColor: "rgba(0, 245, 212, 0.25)",
  },
  traceStatusText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "750",
  },
  traceStatusTextEmpty: {
    color: theme.colors.textMuted,
  },
  traceStatusTextOk: {
    color: theme.colors.primary,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 6,
  },
  publishingText: {
    color: theme.colors.textSoft,
    fontSize: 14,
    fontWeight: "750",
  },
});
