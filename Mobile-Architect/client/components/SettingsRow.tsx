import React from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Feather>["name"];

interface SettingsRowProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  isSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  showChevron = true,
  destructive = false,
}: SettingsRowProps) {
  const { theme } = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.95]),
  }));

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 20, stiffness: 200 });
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 20, stiffness: 200 });
  };

  const iconColor = destructive ? theme.error : theme.primary;
  const iconBgColor = destructive ? `${theme.error}12` : `${theme.primary}10`;
  const titleColor = destructive ? theme.error : theme.text;

  const content = (
    <View style={[styles.container, Shadows.sm, { backgroundColor: theme.surface }]}>
      {icon ? (
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Feather name={icon} size={18} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: titleColor }]}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.backgroundTertiary, true: `${theme.primary}60` }}
          thumbColor={switchValue ? theme.primary : theme.backgroundSecondary}
          ios_backgroundColor={theme.backgroundTertiary}
        />
      ) : value ? (
        <View style={[styles.valueBadge, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={[styles.value, { color: theme.textSecondary }]}>
            {value}
          </ThemedText>
        </View>
      ) : showChevron ? (
        <View style={[styles.chevronContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="chevron-right" size={16} color={theme.textSecondary} />
        </View>
      ) : null}
    </View>
  );

  if (onPress && !isSwitch) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  valueBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
