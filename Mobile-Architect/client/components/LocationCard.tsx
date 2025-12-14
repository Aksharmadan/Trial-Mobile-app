import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { CrowdIndicator } from "@/components/CrowdIndicator";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface LocationCardProps {
  name: string;
  address: string;
  waitTime?: number;
  queueSize?: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LocationCard({ name, address, waitTime, queueSize, onPress }: LocationCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.97]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.985, { damping: 20, stiffness: 200 });
    pressed.value = withSpring(1, { damping: 20, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    pressed.value = withSpring(0, { damping: 20, stiffness: 200 });
  };

  const getWaitTimeColor = () => {
    if (waitTime === undefined) return theme.textSecondary;
    if (waitTime <= 10) return theme.success;
    if (waitTime <= 20) return theme.warning;
    return theme.error;
  };

  const getWaitTimeBgColor = () => {
    if (waitTime === undefined) return theme.backgroundSecondary;
    if (waitTime <= 10) return `${theme.success}15`;
    if (waitTime <= 20) return `${theme.warning}15`;
    return `${theme.error}15`;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        Shadows.card,
        { backgroundColor: theme.surface },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              {queueSize !== undefined && <CrowdIndicator queueSize={queueSize} />}
              <View style={styles.textContainer}>
                <ThemedText style={styles.name} numberOfLines={1}>
                  {name}
                </ThemedText>
                <View style={styles.addressRow}>
                  <Feather name="map-pin" size={12} color={theme.textSecondary} />
                  <ThemedText style={[styles.address, { color: theme.textSecondary }]} numberOfLines={1}>
                    {address}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={[styles.chevronContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="chevron-right" size={18} color={theme.primary} />
            </View>
          </View>
        </View>
        {waitTime !== undefined && (
          <View style={[styles.waitBadge, { backgroundColor: getWaitTimeBgColor() }]}>
            <Feather name="clock" size={14} color={getWaitTimeColor()} />
            <ThemedText style={[styles.waitText, { color: getWaitTimeColor() }]}>
              {waitTime} min wait
            </ThemedText>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  content: {
    padding: Spacing.lg,
  },
  mainContent: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  address: {
    fontSize: 13,
    flex: 1,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  waitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
    marginTop: Spacing.md,
  },
  waitText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
