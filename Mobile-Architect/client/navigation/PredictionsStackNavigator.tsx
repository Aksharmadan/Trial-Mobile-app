import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PredictionsScreen from "@/screens/PredictionsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type PredictionsStackParamList = {
  Predictions: undefined;
};

const Stack = createNativeStackNavigator<PredictionsStackParamList>();

export default function PredictionsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Predictions"
        component={PredictionsScreen}
        options={{
          headerTitle: "Best Times",
        }}
      />
    </Stack.Navigator>
  );
}
