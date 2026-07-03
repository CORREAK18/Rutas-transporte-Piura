import { StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "@/config/theme";

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundSoft,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    fontSize: 15,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
});
