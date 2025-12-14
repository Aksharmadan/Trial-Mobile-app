import React, { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming, runOnJS } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { NumberStepper } from "@/components/NumberStepper";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";
import { getDeviceId } from "@/lib/device";
import { addRecentCheckin } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const QUEUE_STAGES = [
  { value: "waiting", label: "Waiting" },
  { value: "in_service", label: "In Service" },
  { value: "completing", label: "Completing" },
];

export default function CheckinModal() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "CheckinModal">>();
  const { locationId, locationName } = route.params;

  const [peopleAhead, setPeopleAhead] = useState(0);
  const [queueStage, setQueueStage] = useState("waiting");
  const [showSuccess, setShowSuccess] = useState(false);

  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const checkinMutation = useMutation({
    mutationFn: async () => {
      const deviceId = await getDeviceId();
      const response = await apiRequest("POST", "/api/checkin", {
        locationId,
        deviceId,
        peopleAhead,
        queueStage,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      await addRecentCheckin({
        id: data.id,
        locationId,
        locationName,
        peopleAhead,
        createdAt: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/locations", locationId] });

      setShowSuccess(true);
      successScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 100 })
      );
      successOpacity.value = withTiming(1, { duration: 200 });

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
    onError: (error: Error) => {
      const message = error.message.includes("429")
        ? "Please wait 15 minutes between check-ins at the same location."
        : "Failed to submit check-in. Please try again.";
      Alert.alert("Error", message);
    },
  });

  const handleSubmit = () => {
    checkinMutation.mutate();
  };

  if (showSuccess) {
    return (
      <ThemedView style={[styles.successContainer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Animated.View style={[styles.successContent, successAnimatedStyle]}>
          <View style={[styles.successIcon, { backgroundColor: theme.success }]}>
            <Feather name="check" size={48} color="#FFFFFF" />
          </View>
          <ThemedText type="h3" style={styles.successTitle}>
            Thank You!
          </ThemedText>
          <ThemedText style={[styles.successMessage, { color: theme.textSecondary }]}>
            Your check-in helps others save time
          </ThemedText>
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: Spacing.xl,
        paddingBottom: insets.bottom + Spacing["3xl"],
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
    >
      <Card elevation={1} style={styles.locationCard}>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={20} color={theme.primary} />
          <View style={styles.locationInfo}>
            <ThemedText style={styles.locationLabel}>Checking in at</ThemedText>
            <ThemedText style={styles.locationName}>{locationName}</ThemedText>
          </View>
        </View>
      </Card>

      <View style={styles.formSection}>
        <ThemedText type="h4" style={styles.questionLabel}>
          How many people are ahead of you?
        </ThemedText>
        <View style={styles.stepperContainer}>
          <NumberStepper
            value={peopleAhead}
            onChange={setPeopleAhead}
            min={0}
            max={200}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <ThemedText type="h4" style={styles.questionLabel}>
          Queue stage (optional)
        </ThemedText>
        <View style={styles.stagesContainer}>
          {QUEUE_STAGES.map((stage) => (
            <Card
              key={stage.value}
              elevation={queueStage === stage.value ? 2 : 1}
              style={[
                styles.stageCard,
                queueStage === stage.value && { borderColor: theme.primary, borderWidth: 2 },
              ]}
              onPress={() => setQueueStage(stage.value)}
            >
              <ThemedText
                style={[
                  styles.stageLabel,
                  queueStage === stage.value && { color: theme.primary, fontWeight: "600" },
                ]}
              >
                {stage.label}
              </ThemedText>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.submitContainer}>
        <Button
          onPress={handleSubmit}
          disabled={checkinMutation.isPending}
          style={styles.submitButton}
        >
          {checkinMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            "Submit Check-in"
          )}
        </Button>
        <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
          Your check-in is anonymous and helps improve predictions for everyone.
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successContent: {
    alignItems: "center",
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  successTitle: {
    marginBottom: Spacing.sm,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
  },
  locationCard: {
    marginBottom: Spacing["2xl"],
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  formSection: {
    marginBottom: Spacing["2xl"],
  },
  questionLabel: {
    marginBottom: Spacing.lg,
  },
  stepperContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  stagesContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  stageCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  stageLabel: {
    fontSize: 14,
  },
  submitContainer: {
    marginTop: "auto",
    paddingTop: Spacing.xl,
  },
  submitButton: {
    marginBottom: Spacing.md,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
  },
});
