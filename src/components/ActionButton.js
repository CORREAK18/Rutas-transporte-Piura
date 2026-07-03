import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View, Animated } from "react-native";

import { theme } from "@/config/theme";

const buttonStyles = {
  primary: {
    backgroundColor: theme.colors.primary,
    textColor: "#030712",
    borderColor: "transparent",
  },
  secondary: {
    backgroundColor: theme.colors.surfaceAlt,
    textColor: theme.colors.text,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
    textColor: theme.colors.text,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: "rgba(248, 113, 113, 0.06)",
    textColor: theme.colors.danger,
    borderColor: "rgba(248, 113, 113, 0.25)",
  },
};

export function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  icon,
  style,
}) {
  const styleToken = buttonStyles[variant] ?? buttonStyles.primary;

  // ─── REGLA: un nodo animado = un solo driver, siempre ─────────────────────
  // scaleValue → useNativeDriver: true  (transform: scale)
  // glowValue  → useNativeDriver: false (shadowOpacity, shadowRadius, elevation)
  // Los dos NUNCA se mezclan en el mismo Animated.View
  const scaleValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    // Escala — native driver (offload al hilo nativo)
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 60,
      bounciness: 5,
    }).start();
    // Glow — JS driver (shadow/elevation no son soportados por native driver)
    Animated.timing(glowValue, {
      toValue: 1,
      duration: 120,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
      bounciness: 5,
    }).start();
    Animated.timing(glowValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderGlowColor =
    variant === "primary"
      ? theme.colors.primary
      : variant === "secondary"
      ? theme.colors.secondary
      : variant === "danger"
      ? theme.colors.danger
      : "transparent";

  // Estilos de glow (interpolados desde glowValue — JS driver)
  const glowStyle =
    variant !== "ghost"
      ? {
          shadowColor: borderGlowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.15, 0.65],
          }),
          shadowRadius: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 14],
          }),
          elevation: glowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 6],
          }),
        }
      : {};

  return (
    // Capa exterior: SOLO glow → useNativeDriver: false ✅
    <Animated.View style={[styles.glowWrapper, glowStyle, style]}>
      {/* Capa interior: SOLO escala → useNativeDriver: true ✅ */}
      <Animated.View
        style={[styles.buttonContainer, { transform: [{ scale: scaleValue }] }]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.button,
            {
              backgroundColor: styleToken.backgroundColor,
              borderColor:
                variant === "primary" ? "transparent" : styleToken.borderColor,
              opacity: disabled ? 0.45 : 1,
            },
          ]}
        >
          <View style={styles.content}>
            {icon ? (
              <Text style={[styles.icon, { color: styleToken.textColor }]}>
                {icon}
              </Text>
            ) : null}
            <Text style={[styles.label, { color: styleToken.textColor }]}>
              {label}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowWrapper: {
    borderRadius: theme.radius.pill,
    overflow: "visible",
  },
  buttonContainer: {
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },
  button: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  icon: {
    fontSize: 16,
    fontWeight: "800",
  },
});
