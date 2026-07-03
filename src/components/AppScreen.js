import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/config/theme";

export function AppScreen({
  children,
  scrollable = true,
  contentStyle,
  footer,
}) {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Seno suavizado inline — sin import de Easing, compatible con todas las versiones de RN
  const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 7000,
          easing: sineInOut,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 7000,
          easing: sineInOut,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const scaleTop = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  const translateXTop = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const scaleBottom = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const translateYBottom = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -35],
  });

  const safeBottom = Math.max(insets.bottom, 16);
  const currentFooterStyle = footer
    ? [styles.footer, { paddingBottom: safeBottom }]
    : null;

  const currentContentStyle = [
    scrollable ? styles.scrollContent : styles.staticContent,
    !footer && { paddingBottom: safeBottom + 28 },
    contentStyle,
  ];

  if (!scrollable) {
    return (
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.glowTop,
            { transform: [{ scale: scaleTop }, { translateX: translateXTop }] },
          ]}
        />
        <Animated.View
          style={[
            styles.glowBottom,
            {
              transform: [
                { scale: scaleBottom },
                { translateY: translateYBottom },
              ],
            },
          ]}
        />
        <View style={currentContentStyle}>{children}</View>
        {footer ? <View style={currentFooterStyle}>{footer}</View> : null}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.glowTop,
          { transform: [{ scale: scaleTop }, { translateX: translateXTop }] },
        ]}
      />
      <Animated.View
        style={[
          styles.glowBottom,
          {
            transform: [
              { scale: scaleBottom },
              { translateY: translateYBottom },
            ],
          },
        ]}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={currentContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer ? <View style={currentFooterStyle}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  glowTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(94, 234, 212, 0.14)",
  },
  glowBottom: {
    position: "absolute",
    bottom: 80,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(249, 115, 22, 0.14)",
  },
});

