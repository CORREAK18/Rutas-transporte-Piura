import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { login, loginAsGuest, register } from "@/services/authService";
import { theme } from "@/config/theme";

// Función de easing sineInOut inline para animaciones fluidas
const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

export default function WelcomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animaciones de entrada
  const brandingOpacity = useRef(new Animated.Value(0)).current;
  const brandingSlide = useRef(new Animated.Value(30)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(50)).current;

  // Animación de pulso para el botón de carga
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación secuencial escalonada
    Animated.sequence([
      Animated.parallel([
        Animated.timing(brandingOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(brandingSlide, {
          toValue: 0,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    let animLoop = null;
    if (loading) {
      animLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 600,
            easing: sineInOut,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 600,
            easing: sineInOut,
            useNativeDriver: true,
          }),
        ])
      );
      animLoop.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [loading]);

  const handleAction = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (isRegistering) {
      const cleanName = displayName.trim();
      if (!cleanName || !cleanEmail || !cleanPassword) {
        Alert.alert("Campos vacíos", "Por favor completa todos los campos.");
        return;
      }

      setLoading(true);
      try {
        await register(cleanName, cleanEmail, cleanPassword);
        router.replace("/(tabs)");
      } catch (error) {
        Alert.alert("Error de registro", error.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!cleanEmail || !cleanPassword) {
        Alert.alert("Campos vacíos", "Por favor ingresa tu correo y contraseña.");
        return;
      }

      setLoading(true);
      try {
        await login(cleanEmail, cleanPassword);
        router.replace("/(tabs)");
      } catch (error) {
        Alert.alert("Error de ingreso", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar sesión como visitante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Fondo Neón Decorativo */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Cabecera / Branding Animada */}
        <Animated.View
          style={[
            styles.brandContainer,
            {
              opacity: brandingOpacity,
              transform: [{ translateY: brandingSlide }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.appIcon}>🚌</Text>
          </View>
          <Text style={styles.brandTitle}>RutasPiura</Text>
          <Text style={styles.brandTagline}>
            El mapa de transporte público de Piura en tus manos
          </Text>
        </Animated.View>

        {/* Caja de login / registro centrada Animada */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardSlide }],
            },
          ]}
        >
          <Text style={styles.cardTitle}>
            {isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isRegistering
              ? "Regístrate para guardar tus rutas favoritas"
              : "Accede para trazar rutas o ver los paraderos oficiales"}
          </Text>

          {/* Input Opcional: Nombre Completo (solo registro) */}
          {isRegistering && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor="#475569"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          )}

          {/* Input: Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@rutas.pe"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Input: Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Botón Principal con animación de pulso */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
              onPress={handleAction}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonPrimaryText}>
                {loading ? "Procesando..." : isRegistering ? "Registrarse" : "Ingresar"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Enlace para cambiar entre Login y Registro */}
          <TouchableOpacity
            style={styles.toggleModeButton}
            onPress={() => setIsRegistering(!isRegistering)}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.toggleModeText}>
              {isRegistering
                ? "¿Ya tienes una cuenta? Inicia sesión"
                : "¿No tienes una cuenta? Regístrate aquí"}
            </Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o también</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón Invitado */}
          <TouchableOpacity
            style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
            onPress={handleGuest}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonSecondaryText}>Entrar como Visitante</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    zIndex: 2,
  },
  glowTop: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(0, 245, 212, 0.12)",
    zIndex: 1,
  },
  glowBottom: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(241, 91, 181, 0.12)",
    zIndex: 1,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 245, 212, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    marginBottom: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  appIcon: {
    fontSize: 40,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "950",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: theme.colors.textSoft,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: "750",
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 15,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPrimaryText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    paddingHorizontal: 12,
  },
  buttonSecondary: {
    backgroundColor: "rgba(241, 91, 181, 0.08)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(241, 91, 181, 0.3)",
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  buttonSecondaryText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  toggleModeButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  toggleModeText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

