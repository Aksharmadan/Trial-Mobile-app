import React from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SettingsRowProps {
  icon?: string;
  title: string;
  subtitle?: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
}

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
}: SettingsRowProps) {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      {icon ? (
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
          <Feather name={icon as any} size={18} color={theme.primary} />
        </View>
      ) : null}
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
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
          trackColor={{ false: theme.backgroundSecondary, true: theme.primary + "80" }}
          thumbColor={switchValue ? theme.primary : theme.backgroundTertiary}
        />
      ) : value ? (
        <ThemedText style={[styles.value, { color: theme.textSecondary }]}>
          {value}
        </ThemedText>
      ) : showChevron ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </View>
  );

  if (onPress && !isSwitch) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
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
    width: 36,
    height: 36,
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
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  value: {
    fontSize: 14,
  },
});
