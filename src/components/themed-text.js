import { Text } from "react-native";

export function ThemedText({ children, style, ...props }) {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
}
