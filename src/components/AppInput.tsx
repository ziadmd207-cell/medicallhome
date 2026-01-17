// src/components/AppInput.tsx

import { View, TextInput, StyleSheet, Text } from "react-native";
import { Colors } from "../theme/colors";
import { Typography } from "../theme/typography";
import { Spacing } from "../theme/spacing";


type Props = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  label?: string;
};

export default function AppInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  label,
}: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    color: Colors.textSecondary,
    ...Typography.caption,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    ...Typography.body,
  },
});
