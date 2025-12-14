import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import QueueStatusScreen from "@/screens/QueueStatusScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HomeStackParamList = {
  Home: undefined;
  QueueStatus: { locationId: string; locationName: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="QueueSense" />,
        }}
      />
      <Stack.Screen
        name="QueueStatus"
        component={QueueStatusScreen}
        options={({ route }) => ({
          headerTitle: route.params.locationName,
        })}
      />
    </Stack.Navigator>
  );
}
