import React, { useState, useCallback } from "react";
import { View, ScrollView, FlatList, RefreshControl, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getSavedLocations, getRecentCheckins, removeSavedLocation, SavedLocation, RecentCheckin } from "@/lib/storage";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [locations, checkins] = await Promise.all([
      getSavedLocations(),
      getRecentCheckins(),
    ]);
    setSavedLocations(locations);
    setRecentCheckins(checkins);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRemoveSaved = (locationId: string, locationName: string) => {
    Alert.alert(
      "Remove Location",
      `Remove ${locationName} from saved locations?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeSavedLocation(locationId);
            loadData();
          },
        },
      ]
    );
  };

  const handleLocationPress = (location: SavedLocation) => {
    navigation.navigate("QueueStatus", { locationId: location.id, locationName: location.name });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isEmpty = savedLocations.length === 0 && recentCheckins.length === 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
      }
    >
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="clock"
            title="No Activity Yet"
            description="Your saved locations and recent check-ins will appear here."
          />
        </View>
      ) : (
        <>
          {savedLocations.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Saved Locations
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedList}>
                {savedLocations.map((location) => (
                  <Pressable
                    key={location.id}
                    onPress={() => handleLocationPress(location)}
                    onLongPress={() => handleRemoveSaved(location.id, location.name)}
                  >
                    <Card elevation={1} style={styles.savedCard}>
                      <View style={[styles.savedIcon, { backgroundColor: theme.primary + "20" }]}>
                        <Feather name="heart" size={16} color={theme.primary} />
                      </View>
                      <ThemedText style={styles.savedName} numberOfLines={1}>
                        {location.name}
                      </ThemedText>
                      <ThemedText style={[styles.savedAddress, { color: theme.textSecondary }]} numberOfLines={1}>
                        {location.address}
                      </ThemedText>
                    </Card>
                  </Pressable>
                ))}
              </ScrollView>
              <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
                Long press to remove
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Recent Check-ins
            </ThemedText>
            {recentCheckins.length > 0 ? (
              recentCheckins.map((checkin, index) => (
                <Card key={checkin.id || index} elevation={1} style={styles.checkinCard}>
                  <View style={styles.checkinHeader}>
                    <View style={[styles.checkinIcon, { backgroundColor: theme.success + "20" }]}>
                      <Feather name="check" size={16} color={theme.success} />
                    </View>
                    <View style={styles.checkinInfo}>
                      <ThemedText style={styles.checkinLocation}>{checkin.locationName}</ThemedText>
                      <ThemedText style={[styles.checkinTime, { color: theme.textSecondary }]}>
                        {formatDate(checkin.createdAt)}
                      </ThemedText>
                    </View>
                    <View style={[styles.queueBadge, { backgroundColor: theme.backgroundSecondary }]}>
                      <ThemedText style={styles.queueNumber}>{checkin.peopleAhead}</ThemedText>
                      <ThemedText style={[styles.queueLabel, { color: theme.textSecondary }]}>ahead</ThemedText>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <Card elevation={1} style={styles.emptyCard}>
                <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No check-ins yet. Visit a location and check in to help others!
                </ThemedText>
              </Card>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  savedList: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  savedCard: {
    width: 160,
    marginRight: Spacing.md,
    padding: Spacing.lg,
  },
  savedIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  savedName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  savedAddress: {
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  checkinCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  checkinHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkinIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  checkinInfo: {
    flex: 1,
  },
  checkinLocation: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkinTime: {
    fontSize: 12,
    marginTop: 2,
  },
  queueBadge: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  queueNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  queueLabel: {
    fontSize: 10,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
