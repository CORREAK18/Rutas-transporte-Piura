import { View } from "react-native";

export function ThemedView({ children, style, ...props }) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}
