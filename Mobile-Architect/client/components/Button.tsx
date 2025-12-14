import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, View, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Feather>["name"];

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 18,
  mass: 0.4,
  stiffness: 180,
  overshootClamping: false,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.975, springConfig);
      pressed.value = withSpring(1, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
      pressed.value = withSpring(0, springConfig);
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundTertiary;
    switch (variant) {
      case "primary":
        return theme.primary;
      case "secondary":
        return theme.primaryLight;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textDisabled;
    switch (variant) {
      case "primary":
        return theme.buttonText;
      case "secondary":
        return theme.primary;
      case "outline":
      case "ghost":
        return theme.primary;
      default:
        return theme.buttonText;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") {
      return disabled ? theme.border : theme.primary;
    }
    return "transparent";
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "sm":
        return { height: 40, paddingHorizontal: Spacing.lg };
      case "lg":
        return { height: 60, paddingHorizontal: Spacing["2xl"] };
      default:
        return { height: 52, paddingHorizontal: Spacing.xl };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 16;
      case "lg":
        return 22;
      default:
        return 18;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const borderColor = getBorderColor();
  const sizeStyles = getSizeStyles();
  const iconSize = getIconSize();
  const fontSize = getFontSize();

  const shadowStyle = variant === "primary" && !disabled ? Shadows.card : Shadows.none;

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        sizeStyles,
        shadowStyle,
        {
          backgroundColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === "left" && (
            <Feather name={icon} size={iconSize} color={textColor} style={styles.iconLeft} />
          )}
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: textColor, fontSize }]}
          >
            {children}
          </ThemedText>
          {icon && iconPosition === "right" && (
            <Feather name={icon} size={iconSize} color={textColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
