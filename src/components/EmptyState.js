import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/config/theme";
import { ActionButton } from "./ActionButton";

export function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel ? (
        <ActionButton label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 10,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: theme.colors.textSoft,
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
  },
});
