import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface CrowdIndicatorProps {
  queueSize: number;
  size?: number;
}

function getCrowdColor(queueSize: number, theme: any): string {
  if (queueSize < 5) return theme.success;
  if (queueSize < 15) return theme.warning;
  return theme.error;
}

export function CrowdIndicator({ queueSize, size = 12 }: CrowdIndicatorProps) {
  const { theme } = useTheme();
  const color = getCrowdColor(queueSize, theme);

  return (
    <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
