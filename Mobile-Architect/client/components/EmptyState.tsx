import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Feather>["name"];

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  const { theme } = useTheme();
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    textOpacity.value = withDelay(150, withSpring(1, { damping: 15 }));
    textTranslateY.value = withDelay(150, withSpring(0, { damping: 15 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.iconContainer, 
          { backgroundColor: `${theme.primary}10` },
          iconStyle,
        ]}
      >
        <View style={[styles.iconInner, { backgroundColor: `${theme.primary}15` }]}>
          <Feather name={icon} size={40} color={theme.primary} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.textContainer, textStyle]}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {description ? (
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    paddingVertical: Spacing["5xl"],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
});
