import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";

import { theme } from "@/config/theme";

// Funciones de easing inline — sin import de Easing (no es export estable en RN 0.76+)
const linear = (t) => t;
const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

export function LoadingOverlay({ message = "Cargando..." }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animación de rotación del spinner
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: linear,
        useNativeDriver: true,
      })
    ).start();

    // Animación de pulso para el contenedor
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          easing: sineInOut,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 800,
          easing: sineInOut,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinAnim, pulseAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 7, 18, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  container: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 28,
    paddingHorizontal: 36,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: "rgba(0, 245, 212, 0.3)",
    alignItems: "center",
    gap: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: "rgba(0, 245, 212, 0.15)",
    borderTopColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
