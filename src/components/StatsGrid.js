import { FlatList, StyleSheet, Text } from "react-native";

import { theme } from "@/config/theme";
import { Card } from "./Card";

function StatCard({ item }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.value}>{item.value}</Text>
      <Text style={styles.hint}>{item.hint}</Text>
    </Card>
  );
}

export function StatsGrid({ items }) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.label}
      renderItem={({ item }) => <StatCard item={item} />}
      numColumns={2}
      columnWrapperStyle={styles.row}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <Text style={styles.separator} />}
    />
  );
}

const CARD_GAP = 10;

const styles = StyleSheet.create({
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  separator: {
    height: 0,
  },
  card: {
    flex: 1,
    minHeight: 110,
    gap: 4,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "700",
  },
  value: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
  },
  hint: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});

