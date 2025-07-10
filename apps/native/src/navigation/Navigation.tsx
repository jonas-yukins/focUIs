import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import AppSelectionScreen from "../screens/AppSelectionScreen";
import SettingsScreen from "../screens/SettingsScreen";
import InstalledAppsScreen from "../screens/InstalledAppsScreen";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined}
        initialRouteName="LoginScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="AppSelectionScreen" component={AppSelectionScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="InstalledAppsScreen" component={InstalledAppsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
