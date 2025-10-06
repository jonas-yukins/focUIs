import { useEffect, useState } from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { LogBox } from "react-native";
import * as SplashScreen from 'expo-splash-screen';

import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from "./src/navigation/Navigation";
import { Asset } from "expo-asset";
import { BackgroundAssetContext } from "./src/assets/BackgroundAssetContext";

export default function App() {
  LogBox.ignoreLogs(["Warning: ..."]);
  LogBox.ignoreAllLogs();

  // Prevent the splash screen from auto-hiding
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

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

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [backgroundUri, setBackgroundUri] = useState<string | undefined>(undefined);
  const [homeScreenReady, setHomeScreenReady] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        const [asset] = await Asset.loadAsync([
          require("./assets/wallpapers/blue_gradient_wallpaper.webp"),
        ]);
        setBackgroundUri(asset.localUri || asset.uri);
        setAssetsLoaded(true);
      } catch (e) {
        setAssetsLoaded(true);
      }
    }
    loadAssets();
  }, []);

  // Hide splash screen when everything is ready AND HomeScreen has rendered
  useEffect(() => {
    if (loaded && assetsLoaded && backgroundUri && homeScreenReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, assetsLoaded, backgroundUri, homeScreenReady]);

  // Don't render anything until everything is ready - let splash screen handle the loading
  if (!loaded || !assetsLoaded || !backgroundUri) {
    return null;
  }

  return (
    <BackgroundAssetContext.Provider value={backgroundUri}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#172F50"
          translucent={true}
        />
        <Navigation onHomeScreenReady={() => setHomeScreenReady(true)} />
      </SafeAreaProvider>
    </BackgroundAssetContext.Provider>
  );
}
