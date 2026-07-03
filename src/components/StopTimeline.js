import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/config/theme";
import { Card } from "./Card";

export function StopTimeline({ stops }) {
  return (
    <Card>
      <Text style={styles.title}>Paraderos</Text>
      <View style={styles.list}>
        {stops.map((stop, index) => (
          <View key={stop.id} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={styles.dot} />
              {index < stops.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.info}>
              <Text style={styles.stopName}>{stop.name}</Text>
              <Text style={styles.stopMeta}>{stop.reference}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  list: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  markerColumn: {
    width: 16,
    alignItems: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginTop: 4,
  },
  info: {
    flex: 1,
    paddingBottom: 4,
  },
  stopName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  stopMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
});
