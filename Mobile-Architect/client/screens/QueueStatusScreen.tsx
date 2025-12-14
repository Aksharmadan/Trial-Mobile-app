import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, RefreshControl, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WaitTimeIndicator } from "@/components/WaitTimeIndicator";
import { TrendIndicator } from "@/components/TrendIndicator";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { isLocationSaved, saveLocation, removeSavedLocation } from "@/lib/storage";

type QueueStatusData = {
  location: {
    id: string;
    name: string;
    address: string;
    typeId: string;
  };
  estimatedWaitTime: number;
  confidence: number;
  trend: "increasing" | "stable" | "decreasing";
  currentQueueSize: number;
  lastUpdated: string;
};

export default function QueueStatusScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList & RootStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "QueueStatus">>();
  const { locationId, locationName } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data, isLoading, refetch } = useQuery<QueueStatusData>({
    queryKey: ["/api/locations", locationId, "queue-status"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    const checkSaved = async () => {
      const saved = await isLocationSaved(locationId);
      setIsSaved(saved);
    };
    checkSaved();
  }, [locationId]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleSave = async () => {
    if (isSaved) {
      await removeSavedLocation(locationId);
      setIsSaved(false);
    } else if (data?.location) {
      await saveLocation({
        id: locationId,
        name: data.location.name,
        address: data.location.address,
        typeId: data.location.typeId,
        savedAt: new Date().toISOString(),
      });
      setIsSaved(true);
    }
  };

  const handleCheckin = () => {
    navigation.navigate("CheckinModal", { locationId, locationName });
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleToggleSave} style={styles.headerButton}>
          <Feather name={isSaved ? "heart" : "heart"} size={22} color={isSaved ? theme.error : theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, isSaved, theme]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
      }
    >
      <View style={styles.heroSection}>
        <WaitTimeIndicator
          minutes={data?.estimatedWaitTime || 0}
          confidence={data?.confidence || 0}
        />
        <View style={styles.trendContainer}>
          <TrendIndicator trend={data?.trend || "stable"} />
        </View>
      </View>

      <Card elevation={1} style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather name="users" size={20} color={theme.primary} />
            <View style={styles.infoText}>
              <ThemedText style={styles.infoValue}>
                {data?.currentQueueSize || 0}
              </ThemedText>
              <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                People in queue
              </ThemedText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoItem}>
            <Feather name="refresh-cw" size={20} color={theme.primary} />
            <View style={styles.infoText}>
              <ThemedText style={styles.infoValue}>
                {data?.lastUpdated ? formatTime(data.lastUpdated) : "--:--"}
              </ThemedText>
              <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Last updated
              </ThemedText>
            </View>
          </View>
        </View>
      </Card>

      <Card elevation={1} style={styles.checkinCard}>
        <View style={styles.checkinContent}>
          <View style={styles.checkinInfo}>
            <Feather name="check-circle" size={24} color={theme.success} />
            <View style={styles.checkinText}>
              <ThemedText style={styles.checkinTitle}>Help others</ThemedText>
              <ThemedText style={[styles.checkinDesc, { color: theme.textSecondary }]}>
                Share your queue position to improve predictions
              </ThemedText>
            </View>
          </View>
          <Button onPress={handleCheckin} style={styles.checkinButton}>
            Check In
          </Button>
        </View>
      </Card>

      {data?.location ? (
        <Card elevation={1} style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Feather name="map-pin" size={20} color={theme.primary} />
            <ThemedText style={styles.locationTitle}>Location Details</ThemedText>
          </View>
          <ThemedText style={[styles.locationAddress, { color: theme.textSecondary }]}>
            {data.location.address}
          </ThemedText>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  trendContainer: {
    marginTop: Spacing.lg,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoText: {},
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  infoLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: Spacing.lg,
  },
  checkinCard: {
    marginBottom: Spacing.lg,
  },
  checkinContent: {
    gap: Spacing.lg,
  },
  checkinInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkinText: {
    flex: 1,
  },
  checkinTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  checkinDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  checkinButton: {
    marginTop: Spacing.sm,
  },
  locationCard: {
    marginBottom: Spacing.lg,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  locationAddress: {
    fontSize: 14,
  },
  headerButton: {
    padding: Spacing.sm,
  },
});
