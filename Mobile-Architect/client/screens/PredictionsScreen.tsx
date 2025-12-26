import React, { useState, useCallback, useEffect } from "react";
import { View, ScrollView, RefreshControl, StyleSheet, Alert, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { HeatmapGrid } from "@/components/HeatmapGrid";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getSavedLocations, SavedLocation } from "@/lib/storage";

type LocationType = {
  id: string;
  name: string;
  icon: string;
};

type Location = {
  id: string;
  name: string;
  address: string;
  typeId: string;
};

type TimeSlotData = {
  dayOfWeek: number;
  hour: number;
  averageWaitTime: number;
  sampleCount: number;
};

type BestTimeData = {
  hour: number;
  dayOfWeek: number;
  estimatedWait: number;
};

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PredictionsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  const { data: locationTypes = [] } = useQuery<LocationType[]>({
    queryKey: ["/api/location-types"],
  });

  const { data: allLocations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const loadSavedLocations = useCallback(async () => {
    const locations = await getSavedLocations();
    setSavedLocations(locations);
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [selectedLocationId]);

  useFocusEffect(
    useCallback(() => {
      loadSavedLocations();
    }, [loadSavedLocations])
  );

  const { data: timeSlots = [], refetch: refetchSlots } = useQuery<TimeSlotData[]>({
    queryKey: ["/api/locations", selectedLocationId, "history"],
    enabled: !!selectedLocationId,
  });

  const { data: bestTimes = [], refetch: refetchBestTimes } = useQuery<BestTimeData[]>({
    queryKey: ["/api/locations", selectedLocationId, "best-time"],
    enabled: !!selectedLocationId,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSavedLocations();
    if (selectedLocationId) {
      await refetchSlots();
      await refetchBestTimes();
    }
    setRefreshing(false);
  };

  const handleCellPress = (dayOfWeek: number, hour: number, waitTime: number) => {
    const day = DAYS_FULL[dayOfWeek];
    const time = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? "12:00 PM" : `${hour}:00 AM`;
    Alert.alert(
      `${day} at ${time}`,
      waitTime > 0 ? `Average wait: ${waitTime} minutes` : "No data available for this time slot"
    );
  };

  const formatHour = (hour: number) => {
    if (hour === 12) return "12:00 PM";
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  const selectedLocation = savedLocations.find((l) => l.id === selectedLocationId) || 
    allLocations.find((l) => l.id === selectedLocationId);

  const handleLocationSelect = (location: Location | SavedLocation) => {
    setSelectedLocationId(location.id);
    setShowLocationPicker(false);
  };

  useEffect(() => {
    if (!selectedLocationId && (savedLocations.length > 0 || allLocations.length > 0)) {
      const defaultLocation = savedLocations[0] || allLocations[0];
      if (defaultLocation) {
        setSelectedLocationId(defaultLocation.id);
      }
    }
  }, [selectedLocationId, savedLocations, allLocations]);

  if (savedLocations.length === 0 && allLocations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={{ paddingTop: headerHeight + Spacing["3xl"], flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon="heart"
            title="No Locations Available"
            description="Locations will appear here once they're available."
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
      }
    >
      <Pressable 
        onPress={() => setShowLocationPicker(true)}
        style={[styles.locationHeader, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <Feather name="map-pin" size={16} color={theme.primary} />
        <ThemedText style={styles.locationName} numberOfLines={1}>
          {selectedLocation ? selectedLocation.name : "Select Location"}
        </ThemedText>
        <Feather name="chevron-down" size={16} color={theme.textSecondary} />
      </Pressable>

      {bestTimes.length > 0 ? (
        <Card elevation={1} style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <View style={[styles.recommendationBadge, { backgroundColor: theme.success + "20" }]}>
              <Feather name="clock" size={16} color={theme.success} />
            </View>
            <ThemedText style={styles.recommendationTitle}>Best Time to Visit</ThemedText>
          </View>
          <View style={styles.bestTimesList}>
            {bestTimes.slice(0, 3).map((bt, index) => (
              <View key={index} style={[styles.bestTimeItem, { backgroundColor: theme.backgroundDefault }]}>
                <View style={styles.bestTimeInfo}>
                  <ThemedText style={styles.bestTimeDay}>{DAYS_FULL[bt.dayOfWeek]}</ThemedText>
                  <ThemedText style={[styles.bestTimeHour, { color: theme.textSecondary }]}>
                    {formatHour(bt.hour)}
                  </ThemedText>
                </View>
                <View style={[styles.waitBadge, { backgroundColor: theme.success + "20" }]}>
                  <ThemedText style={[styles.waitText, { color: theme.success }]}>
                    ~{bt.estimatedWait} min
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </Card>
      ) : (
        <Card elevation={1} style={styles.recommendationCard}>
          <View style={styles.noDataContent}>
            <Feather name="bar-chart-2" size={32} color={theme.textSecondary} />
            <ThemedText style={[styles.noDataText, { color: theme.textSecondary }]}>
              Not enough data yet. Check in to help build predictions!
            </ThemedText>
          </View>
        </Card>
      )}

      <ThemedText type="h4" style={styles.sectionTitle}>
        Weekly Patterns
      </ThemedText>
      <Card elevation={1} style={styles.heatmapCard}>
        {timeSlots.length > 0 ? (
          <HeatmapGrid data={timeSlots} onCellPress={handleCellPress} />
        ) : (
          <View style={styles.noDataContent}>
            <ThemedText style={[styles.noDataText, { color: theme.textSecondary }]}>
              No historical data available yet
            </ThemedText>
          </View>
        )}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.success + "60" }]} />
            <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>Low wait</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.warning + "80" }]} />
            <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>Medium</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.error + "A0" }]} />
            <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>High wait</ThemedText>
          </View>
        </View>
      </Card>

      <Modal
        visible={showLocationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowLocationPicker(false)}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <ThemedText type="h4">Select Location</ThemedText>
              <Pressable onPress={() => setShowLocationPicker(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {savedLocations.length > 0 && (
                <>
                  <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                    Saved Locations
                  </ThemedText>
                  {savedLocations.map((loc) => (
                    <Pressable
                      key={loc.id}
                      onPress={() => handleLocationSelect(loc)}
                      style={[
                        styles.locationItem,
                        { 
                          backgroundColor: selectedLocationId === loc.id ? theme.primary + "15" : "transparent",
                          borderBottomColor: theme.border 
                        }
                      ]}
                    >
                      <View style={styles.locationItemContent}>
                        <Feather name="heart" size={16} color={selectedLocationId === loc.id ? theme.primary : theme.textSecondary} />
                        <View style={styles.locationItemText}>
                          <ThemedText style={styles.locationItemName}>{loc.name}</ThemedText>
                          <ThemedText style={[styles.locationItemAddress, { color: theme.textSecondary }]}>
                            {loc.address}
                          </ThemedText>
                        </View>
                      </View>
                      {selectedLocationId === loc.id && (
                        <Feather name="check" size={20} color={theme.primary} />
                      )}
                    </Pressable>
                  ))}
                </>
              )}
              {allLocations.length > 0 && (
                <>
                  <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: savedLocations.length > 0 ? Spacing.lg : 0 }]}>
                    All Locations
                  </ThemedText>
                  {allLocations
                    .filter(loc => !savedLocations.some(saved => saved.id === loc.id))
                    .map((loc) => (
                      <Pressable
                        key={loc.id}
                        onPress={() => handleLocationSelect(loc)}
                        style={[
                          styles.locationItem,
                          { 
                            backgroundColor: selectedLocationId === loc.id ? theme.primary + "15" : "transparent",
                            borderBottomColor: theme.border 
                          }
                        ]}
                      >
                        <View style={styles.locationItemContent}>
                          <Feather 
                            name={locationTypes.find(t => t.id === loc.typeId)?.icon || "map-pin"} 
                            size={16} 
                            color={selectedLocationId === loc.id ? theme.primary : theme.textSecondary} 
                          />
                          <View style={styles.locationItemText}>
                            <ThemedText style={styles.locationItemName}>{loc.name}</ThemedText>
                            <ThemedText style={[styles.locationItemAddress, { color: theme.textSecondary }]}>
                              {loc.address}
                            </ThemedText>
                          </View>
                        </View>
                        {selectedLocationId === loc.id && (
                          <Feather name="check" size={20} color={theme.primary} />
                        )}
                      </Pressable>
                    ))}
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  recommendationCard: {
    marginBottom: Spacing["2xl"],
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  recommendationBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  bestTimesList: {
    gap: Spacing.sm,
  },
  bestTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  bestTimeInfo: {},
  bestTimeDay: {
    fontSize: 14,
    fontWeight: "500",
  },
  bestTimeHour: {
    fontSize: 12,
    marginTop: 2,
  },
  waitBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  waitText: {
    fontSize: 12,
    fontWeight: "500",
  },
  noDataContent: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  noDataText: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  heatmapCard: {
    marginBottom: Spacing.lg,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalList: {
    maxHeight: 500,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  locationItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  locationItemText: {
    flex: 1,
  },
  locationItemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  locationItemAddress: {
    fontSize: 13,
    marginTop: 2,
  },
});
