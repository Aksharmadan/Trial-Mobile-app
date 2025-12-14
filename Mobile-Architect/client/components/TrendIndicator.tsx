import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TrendIndicatorProps {
  trend: "increasing" | "stable" | "decreasing";
}

function getTrendInfo(trend: string, theme: any) {
  switch (trend) {
    case "increasing":
      return { icon: "arrow-up" as const, color: theme.error, label: "Increasing" };
    case "decreasing":
      return { icon: "arrow-down" as const, color: theme.success, label: "Decreasing" };
    default:
      return { icon: "arrow-right" as const, color: theme.info, label: "Stable" };
  }
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  const { theme } = useTheme();
  const info = getTrendInfo(trend, theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name={info.icon} size={18} color={info.color} />
      <ThemedText style={[styles.label, { color: info.color }]}>
        {info.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
