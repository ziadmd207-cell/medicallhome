// src/components/AppButton.tsx

import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";
import { Spacing } from "../theme/spacing";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        (disabled || loading) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.textLight} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  text: {
    color: Colors.textLight,
    ...Typography.button,
  },
});
