import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface OfflineIndicatorProps {
  message?: string;
}

export function OfflineIndicator({ message = "No internet connection" }: OfflineIndicatorProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.warning + "20", borderColor: theme.warning }]}>
      <Feather name="wifi-off" size={16} color={theme.warning} />
      <ThemedText style={[styles.text, { color: theme.warning }]}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
});

