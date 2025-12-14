import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TimeSlotData {
  dayOfWeek: number;
  hour: number;
  averageWaitTime: number;
  sampleCount: number;
}

interface HeatmapGridProps {
  data: TimeSlotData[];
  onCellPress?: (dayOfWeek: number, hour: number, waitTime: number) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

function getHeatColor(waitTime: number, maxWait: number, theme: any): string {
  if (waitTime === 0) return theme.backgroundDefault;
  const intensity = Math.min(waitTime / Math.max(maxWait, 30), 1);
  if (intensity < 0.33) return theme.success + "60";
  if (intensity < 0.66) return theme.warning + "80";
  return theme.error + "A0";
}

export function HeatmapGrid({ data, onCellPress }: HeatmapGridProps) {
  const { theme } = useTheme();

  const dataMap = new Map<string, TimeSlotData>();
  let maxWait = 0;
  data.forEach((slot) => {
    const key = `${slot.dayOfWeek}-${slot.hour}`;
    dataMap.set(key, slot);
    if (slot.averageWaitTime > maxWait) maxWait = slot.averageWaitTime;
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.cornerCell} />
          {HOURS.map((hour) => (
            <View key={hour} style={styles.hourCell}>
              <ThemedText style={[styles.hourLabel, { color: theme.textSecondary }]}>
                {hour > 12 ? hour - 12 : hour}{hour >= 12 ? "p" : "a"}
              </ThemedText>
            </View>
          ))}
        </View>
        {DAYS.map((day, dayIndex) => (
          <View key={day} style={styles.row}>
            <View style={styles.dayCell}>
              <ThemedText style={[styles.dayLabel, { color: theme.textSecondary }]}>
                {day}
              </ThemedText>
            </View>
            {HOURS.map((hour) => {
              const slot = dataMap.get(`${dayIndex}-${hour}`);
              const waitTime = slot?.averageWaitTime || 0;
              return (
                <Pressable
                  key={hour}
                  onPress={() => onCellPress?.(dayIndex, hour, Math.round(waitTime))}
                  style={[
                    styles.cell,
                    { backgroundColor: getHeatColor(waitTime, maxWait, theme) },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  cornerCell: {
    width: 40,
    height: 24,
  },
  hourCell: {
    width: 32,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  hourLabel: {
    fontSize: 10,
  },
  dayCell: {
    width: 40,
    height: 28,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  dayLabel: {
    fontSize: 12,
  },
  cell: {
    width: 28,
    height: 28,
    marginHorizontal: 2,
    borderRadius: BorderRadius.xs,
  },
});
