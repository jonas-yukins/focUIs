import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import AppSelectionScreen from "../screens/AppSelectionScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SetupScreen from "../screens/SetupScreen";
import WidgetConfigScreen from "../screens/WidgetConfigScreen";

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
        <Stack.Screen name="SetupScreen" component={SetupScreen} />
        <Stack.Screen name="WidgetConfigScreen" component={WidgetConfigScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
