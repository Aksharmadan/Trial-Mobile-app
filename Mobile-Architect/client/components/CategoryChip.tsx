import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate, interpolateColor, useAnimatedProps } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Feather>["name"];

interface CategoryChipProps {
  label: string;
  icon: IconName;
  isSelected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryChip({ label, icon, isSelected, onPress }: CategoryChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 18, stiffness: 180 });
    pressed.value = withSpring(1, { damping: 18, stiffness: 180 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 180 });
    pressed.value = withSpring(0, { damping: 18, stiffness: 180 });
  };

  const shadowStyle = isSelected ? Shadows.sm : Shadows.none;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        shadowStyle,
        {
          backgroundColor: isSelected ? theme.primary : theme.surface,
          borderColor: isSelected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name={icon}
        size={16}
        color={isSelected ? "#FFFFFF" : theme.primary}
      />
      <ThemedText
        style={[
          styles.label,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
