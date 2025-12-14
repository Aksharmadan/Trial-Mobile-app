import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface WaitTimeIndicatorProps {
  minutes: number;
  confidence: number;
  size?: number;
}

function getWaitColor(minutes: number, theme: Record<string, string>): string {
  if (minutes < 15) return theme.success;
  if (minutes < 30) return theme.warning;
  return theme.error;
}

function getWaitLabel(minutes: number): string {
  if (minutes < 10) return "Very Short";
  if (minutes < 20) return "Short";
  if (minutes < 35) return "Moderate";
  return "Long";
}

export function WaitTimeIndicator({ minutes, confidence, size = 200 }: WaitTimeIndicatorProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    progress.value = withSpring(Math.min(minutes / 60, 1), { damping: 20, stiffness: 60 });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1500 }),
        withTiming(0.25, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [minutes]);

  const waitColor = getWaitColor(minutes, theme);
  const waitLabel = getWaitLabel(minutes);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const innerSize = size * 0.85;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: size * 0.6,
            backgroundColor: waitColor,
          },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: waitColor,
            backgroundColor: theme.surface,
          },
          Shadows.lg,
          circleStyle,
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: `${waitColor}10`,
            },
          ]}
        >
          <View style={styles.content}>
            <ThemedText style={[styles.minutes, { color: waitColor, fontSize: size * 0.24 }]}>
              {minutes}
            </ThemedText>
            <ThemedText style={[styles.unit, { color: theme.textSecondary }]}>
              min
            </ThemedText>
          </View>
        </View>
      </Animated.View>
      <View style={styles.infoContainer}>
        <View style={[styles.labelBadge, { backgroundColor: `${waitColor}15` }]}>
          <ThemedText style={[styles.labelText, { color: waitColor }]}>
            {waitLabel} Wait
          </ThemedText>
        </View>
        <ThemedText style={[styles.confidence, { color: theme.textSecondary }]}>
          {confidencePercent}% confidence
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
  },
  outerCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
  },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  minutes: {
    fontWeight: "800",
    letterSpacing: -2,
  },
  unit: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: -4,
  },
  infoContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  labelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  confidence: {
    fontSize: 13,
    fontWeight: "500",
  },
});
