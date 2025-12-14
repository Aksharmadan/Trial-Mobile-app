import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StepButton({ icon, onPress, disabled }: { icon: string; onPress: () => void; disabled: boolean }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        { backgroundColor: disabled ? theme.backgroundSecondary : theme.primary },
        animatedStyle,
      ]}
    >
      <Feather name={icon as any} size={24} color={disabled ? theme.textDisabled : "#FFFFFF"} />
    </AnimatedPressable>
  );
}

export function NumberStepper({ value, onChange, min = 0, max = 200, step = 1 }: NumberStepperProps) {
  const { theme } = useTheme();

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      <StepButton icon="minus" onPress={handleDecrement} disabled={value <= min} />
      <View style={[styles.valueContainer, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={styles.value}>{value}</ThemedText>
      </View>
      <StepButton icon="plus" onPress={handleIncrement} disabled={value >= max} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  valueContainer: {
    minWidth: 80,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
  },
});
