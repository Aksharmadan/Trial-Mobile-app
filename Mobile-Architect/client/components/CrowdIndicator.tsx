import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

interface CrowdIndicatorProps {
  queueSize: number;
  size?: number;
  showPulse?: boolean;
}

function getCrowdColor(queueSize: number, theme: Record<string, string>): string {
  if (queueSize < 5) return theme.success;
  if (queueSize < 15) return theme.warning;
  return theme.error;
}

function getCrowdLabel(queueSize: number): string {
  if (queueSize < 5) return "Low";
  if (queueSize < 15) return "Moderate";
  return "Busy";
}

export function CrowdIndicator({ queueSize, size = 14, showPulse = true }: CrowdIndicatorProps) {
  const { theme } = useTheme();
  const color = getCrowdColor(queueSize, theme);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (showPulse) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [showPulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      {showPulse && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
            pulseStyle,
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export function CrowdBadge({ queueSize }: { queueSize: number }) {
  const { theme } = useTheme();
  const color = getCrowdColor(queueSize, theme);
  const label = getCrowdLabel(queueSize);

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <CrowdIndicator queueSize={queueSize} size={8} showPulse={false} />
      <Animated.Text style={[styles.badgeText, { color }]}>{label}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
  },
  dot: {
    position: "absolute",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
