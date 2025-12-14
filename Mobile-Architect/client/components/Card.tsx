import React from "react";
import { StyleSheet, Pressable, ViewStyle, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  interpolate,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface CardProps {
  elevation?: number;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "default" | "outlined" | "filled" | "glass";
  accentColor?: string;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.4,
  stiffness: 200,
  overshootClamping: false,
};

const getBackgroundForVariant = (
  variant: string,
  elevation: number,
  theme: Record<string, string>,
): string => {
  if (variant === "outlined") {
    return "transparent";
  }
  if (variant === "glass") {
    return theme.surfaceElevated || theme.surface;
  }
  switch (elevation) {
    case 1:
      return theme.backgroundDefault;
    case 2:
      return theme.backgroundSecondary;
    case 3:
      return theme.backgroundTertiary;
    default:
      return theme.surface;
  }
};

const getShadowForElevation = (elevation: number) => {
  switch (elevation) {
    case 1:
      return Shadows.sm;
    case 2:
      return Shadows.card;
    case 3:
      return Shadows.md;
    default:
      return Shadows.none;
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  elevation = 1,
  title,
  description,
  children,
  onPress,
  style,
  variant = "default",
  accentColor,
}: CardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const cardBackgroundColor = getBackgroundForVariant(variant, elevation, theme);
  const shadow = variant === "outlined" ? Shadows.none : getShadowForElevation(elevation);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.95]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.985, springConfig);
    pressed.value = withSpring(1, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
    pressed.value = withSpring(0, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[
        styles.card,
        shadow,
        {
          backgroundColor: cardBackgroundColor,
          borderWidth: variant === "outlined" ? 1.5 : 0,
          borderColor: variant === "outlined" ? theme.border : "transparent",
        },
        animatedStyle,
        style,
      ]}
    >
      {accentColor && (
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      )}
      <View style={styles.content}>
        {title ? (
          <ThemedText type="h4" style={styles.cardTitle}>
            {title}
          </ThemedText>
        ) : null}
        {description ? (
          <ThemedText type="small" style={[styles.cardDescription, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        ) : null}
        {children}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  content: {
    padding: Spacing.xl,
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    marginBottom: Spacing.md,
  },
});
