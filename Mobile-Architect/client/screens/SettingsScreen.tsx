import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, StyleSheet, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { SettingsRow } from "@/components/SettingsRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getDeviceId } from "@/lib/device";
import { clearAllData, getSavedLocations, getRecentCheckins } from "@/lib/storage";

const SETTINGS_KEY = "@queuesense_settings";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  
  const [deviceId, setDeviceId] = useState<string>("");
  const [lowCrowdAlerts, setLowCrowdAlerts] = useState(false);
  const [savedLocationUpdates, setSavedLocationUpdates] = useState(true);
  const [stats, setStats] = useState({ savedLocations: 0, checkins: 0 });

  const loadSettings = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        setLowCrowdAlerts(settings.lowCrowdAlerts || false);
        setSavedLocationUpdates(settings.savedLocationUpdates !== false);
      }
    } catch {}
  }, []);

  const saveSettings = useCallback(async (updates: { lowCrowdAlerts?: boolean; savedLocationUpdates?: boolean }) => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      const current = saved ? JSON.parse(saved) : {};
      const newSettings = { ...current, ...updates };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch {}
  }, []);

  const loadStats = useCallback(async () => {
    const [locations, checkins] = await Promise.all([
      getSavedLocations(),
      getRecentCheckins(),
    ]);
    setStats({ savedLocations: locations.length, checkins: checkins.length });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  useEffect(() => {
    const loadDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    loadDeviceId();
    loadSettings();
  }, [loadSettings]);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all saved locations and check-in history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Done", "All local data has been cleared.");
          },
        },
      ]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      "Privacy",
      "QueueSense collects anonymous check-in data to help predict wait times. We never collect personal information, and your device ID is stored locally and used only to prevent duplicate check-ins."
    );
  };

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const truncatedDeviceId = deviceId ? `${deviceId.slice(0, 8)}...` : "Loading...";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          NOTIFICATIONS
        </ThemedText>
        <SettingsRow
          icon="bell"
          title="Low Crowd Alerts"
          subtitle="Get notified when wait times are short"
          isSwitch
          switchValue={lowCrowdAlerts}
          onSwitchChange={(value) => {
            setLowCrowdAlerts(value);
            saveSettings({ lowCrowdAlerts: value });
          }}
        />
        <SettingsRow
          icon="heart"
          title="Saved Location Updates"
          subtitle="Updates for your favorite places"
          isSwitch
          switchValue={savedLocationUpdates}
          onSwitchChange={(value) => {
            setSavedLocationUpdates(value);
            saveSettings({ savedLocationUpdates: value });
          }}
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          STATISTICS
        </ThemedText>
        <SettingsRow
          icon="heart"
          title="Saved Locations"
          value={stats.savedLocations.toString()}
          showChevron={false}
        />
        <SettingsRow
          icon="check-circle"
          title="Total Check-ins"
          value={stats.checkins.toString()}
          showChevron={false}
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          PRIVACY
        </ThemedText>
        <SettingsRow
          icon="smartphone"
          title="Device ID"
          value={truncatedDeviceId}
          showChevron={false}
        />
        <SettingsRow
          icon="shield"
          title="How We Protect Your Privacy"
          onPress={handlePrivacyPress}
        />
        <SettingsRow
          icon="trash-2"
          title="Clear All Data"
          subtitle="Remove saved locations and history"
          onPress={handleClearData}
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ABOUT
        </ThemedText>
        <SettingsRow
          icon="info"
          title="Version"
          value={appVersion}
          showChevron={false}
        />
        <SettingsRow
          icon="file-text"
          title="Privacy Policy"
          onPress={() => Alert.alert("Privacy Policy", "Privacy policy would open here.")}
        />
        <SettingsRow
          icon="book"
          title="Terms of Service"
          onPress={() => Alert.alert("Terms of Service", "Terms of service would open here.")}
        />
        <SettingsRow
          icon="star"
          title="Rate QueueSense"
          onPress={() => Alert.alert("Thank You!", "Rating feature would be available on the app store.")}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          QueueSense helps you save time by predicting wait times at banks, hospitals, and government offices.
        </ThemedText>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary, marginTop: Spacing.sm }]}>
          Made with care for your community.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  footer: {
    paddingVertical: Spacing["2xl"],
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
  },
});
