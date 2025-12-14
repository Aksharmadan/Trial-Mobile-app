import React from "react";
import { StyleSheet, Pressable, ViewStyle, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Shadows, BorderRadius, Spacing } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Feather>["name"];

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: IconName;
  style?: ViewStyle;
  label?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({ onPress, icon = "plus", style, label }: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.95]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 18, stiffness: 180 });
    pressed.value = withSpring(1, { damping: 18, stiffness: 180 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 180 });
    pressed.value = withSpring(0, { damping: 18, stiffness: 180 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        label ? styles.fabExtended : styles.fab,
        { backgroundColor: theme.primary, ...Shadows.fab },
        animatedStyle,
        style,
      ]}
    >
      <Feather name={icon} size={22} color="#FFFFFF" />
      {label && (
        <View style={styles.labelContainer}>
          <Animated.Text style={styles.label}>{label}</Animated.Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: Spacing.xl,
  },
  fabExtended: {
    height: 56,
    paddingHorizontal: Spacing.xl,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
    position: "absolute",
    right: Spacing.xl,
  },
  labelContainer: {
    marginLeft: Spacing.xs,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
