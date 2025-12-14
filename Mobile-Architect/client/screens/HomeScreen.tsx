import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, ScrollView, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { CategoryChip } from "@/components/CategoryChip";
import { LocationCard } from "@/components/LocationCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

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

type QueueStatus = {
  estimatedWaitTime: number;
  currentQueueSize: number;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList & RootStackParamList>>();
  
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [queueStatuses, setQueueStatuses] = useState<Record<string, QueueStatus>>({});
  const [refreshing, setRefreshing] = useState(false);

  const { data: locationTypes = [], isLoading: typesLoading } = useQuery<LocationType[]>({
    queryKey: ["/api/location-types"],
  });

  const { data: locations = [], isLoading: locationsLoading, refetch: refetchLocations } = useQuery<Location[]>({
    queryKey: ["/api/locations", selectedType ? `typeId=${selectedType}` : ""].filter(Boolean),
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/seed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/location-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
  });

  useEffect(() => {
    if (!typesLoading && locationTypes.length === 0) {
      seedMutation.mutate();
    }
  }, [typesLoading, locationTypes.length]);

  const fetchQueueStatuses = useCallback(async () => {
    const statuses: Record<string, QueueStatus> = {};
    for (const loc of locations) {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : ""}/api/locations/${loc.id}/queue-status`);
        if (res.ok) {
          const data = await res.json();
          statuses[loc.id] = {
            estimatedWaitTime: data.estimatedWaitTime,
            currentQueueSize: data.currentQueueSize,
          };
        }
      } catch {}
    }
    setQueueStatuses(statuses);
  }, [locations]);

  useFocusEffect(
    useCallback(() => {
      if (locations.length > 0) {
        fetchQueueStatuses();
      }
    }, [locations, fetchQueueStatuses])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchLocations();
    await fetchQueueStatuses();
    setRefreshing(false);
  };

  const filteredLocations = selectedType
    ? locations.filter((loc) => loc.typeId === selectedType)
    : locations;

  const handleLocationPress = (location: Location) => {
    navigation.navigate("QueueStatus", { locationId: location.id, locationName: location.name });
  };

  const handleFabPress = () => {
    if (filteredLocations.length > 0) {
      const firstLocation = filteredLocations[0];
      navigation.navigate("CheckinModal", { locationId: firstLocation.id, locationName: firstLocation.name });
    }
  };

  const isLoading = typesLoading || locationsLoading || seedMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["4xl"],
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Find a Location
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categories}
              contentContainerStyle={styles.categoriesContent}
            >
              <CategoryChip
                label="All"
                icon="grid"
                isSelected={selectedType === null}
                onPress={() => setSelectedType(null)}
              />
              {locationTypes.map((type) => (
                <CategoryChip
                  key={type.id}
                  label={type.name}
                  icon={type.icon}
                  isSelected={selectedType === type.id}
                  onPress={() => setSelectedType(type.id)}
                />
              ))}
            </ScrollView>
            <ThemedText type="small" style={[styles.resultsText, { color: theme.textSecondary }]}>
              {filteredLocations.length} location{filteredLocations.length !== 1 ? "s" : ""} found
            </ThemedText>
          </View>
        }
        data={filteredLocations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LocationCard
            name={item.name}
            address={item.address}
            waitTime={queueStatuses[item.id]?.estimatedWaitTime}
            queueSize={queueStatuses[item.id]?.currentQueueSize}
            onPress={() => handleLocationPress(item)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading locations...
              </ThemedText>
            </View>
          ) : (
            <EmptyState
              icon="map-pin"
              title="No Locations Found"
              description="Check back later or try a different category."
            />
          )
        }
      />
      {filteredLocations.length > 0 ? (
        <FloatingActionButton
          onPress={handleFabPress}
          icon="plus"
          style={{ bottom: tabBarHeight + Spacing.xl }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  categories: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
  },
  resultsText: {
    marginTop: Spacing.sm,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  loadingText: {
    marginTop: Spacing.md,
  },
});
