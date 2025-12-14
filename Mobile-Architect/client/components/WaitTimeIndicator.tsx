import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface WaitTimeIndicatorProps {
  minutes: number;
  confidence: number;
  size?: number;
}

function getWaitColor(minutes: number, theme: any): string {
  if (minutes < 15) return theme.success;
  if (minutes < 30) return theme.warning;
  return theme.error;
}

export function WaitTimeIndicator({ minutes, confidence, size = 180 }: WaitTimeIndicatorProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(Math.min(minutes / 60, 1), { damping: 15, stiffness: 80 });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [minutes]);

  const waitColor = getWaitColor(minutes, theme);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const progressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, 360]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.backgroundDefault,
            borderColor: waitColor,
            borderWidth: 4,
          },
          circleStyle,
        ]}
      >
        <View style={styles.content}>
          <ThemedText style={[styles.minutes, { color: waitColor, fontSize: size * 0.28 }]}>
            {minutes}
          </ThemedText>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            min wait
          </ThemedText>
        </View>
      </Animated.View>
      <View style={styles.confidenceContainer}>
        <ThemedText style={[styles.confidence, { color: theme.textSecondary }]}>
          {Math.round(confidence * 100)}% confident
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
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  minutes: {
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  confidenceContainer: {
    marginTop: Spacing.md,
  },
  confidence: {
    fontSize: 14,
  },
});
