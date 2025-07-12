import { View, StatusBar } from "react-native";
import { useFonts } from "expo-font";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from "./src/navigation/Navigation";
import ConvexClientProvider from "./ConvexClientProvider";

export default function App() {
  LogBox.ignoreLogs(["Warning: ..."]);
  LogBox.ignoreAllLogs();

  const [loaded] = useFonts({
    Bold: require("./src/assets/fonts/Inter-Bold.ttf"),
    SemiBold: require("./src/assets/fonts/Inter-SemiBold.ttf"),
    Medium: require("./src/assets/fonts/Inter-Medium.ttf"),
    Regular: require("./src/assets/fonts/Inter-Regular.ttf"),

    MBold: require("./src/assets/fonts/Montserrat-Bold.ttf"),
    MSemiBold: require("./src/assets/fonts/Montserrat-SemiBold.ttf"),
    MMedium: require("./src/assets/fonts/Montserrat-Medium.ttf"),
    MRegular: require("./src/assets/fonts/Montserrat-Regular.ttf"),
    MLight: require("./src/assets/fonts/Montserrat-Light.ttf"),
  });
  if (!loaded) {
    return false;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#172F50"
          translucent={true}
        />
        <ConvexClientProvider>
          <Navigation />
        </ConvexClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
