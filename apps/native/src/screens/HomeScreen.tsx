import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  Linking,
  Platform,
  NativeModules,
  ScrollView,
  ImageBackground, // <-- Add this import
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import WidgetPreview from "../components/WidgetPreview";
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';
import localStorageService, { LocalAppSelection, LocalWidgetConfig, LocalUserSettings } from '../services/LocalStorageService';

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [selectedApps, setSelectedApps] = useState<LocalAppSelection[]>([]);
  const [userWidgets, setUserWidgets] = useState<LocalWidgetConfig[]>([]);
  const [userSettings, setUserSettings] = useState<LocalUserSettings>({
    theme: 'default',
    fontSize: 16,
    layout: 'center',
    fontColor: '#FFFFFF',
    verticalAlignment: 'middle'
  });
  const [loading, setLoading] = useState(true);

  const backgroundUri = useBackgroundAsset();

  // Load data from local storage on mount and when screen comes into focus
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Clean up legacy data first
      await localStorageService.cleanupLegacyData();
      
      const [apps, widgets, settings] = await Promise.all([
        localStorageService.getSelectedApps(),
        localStorageService.getWidgetConfigs(),
        localStorageService.getUserSettings()
      ]);
      

      
      setSelectedApps(apps);
      setUserWidgets(widgets);
      setUserSettings(settings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Auto-organize apps into widgets if no widgets exist or if the number of selected apps has changed
  useEffect(() => {
    if (selectedApps.length > 0) {
      // Check if we need to reorganize widgets
      const totalAppsInWidgets = userWidgets.reduce((total, widget) => total + widget.appIds.length, 0);
      const needsReorganization = userWidgets.length === 0 || totalAppsInWidgets !== selectedApps.length;
      
      if (needsReorganization) {
        console.log(`Reorganizing widgets: ${selectedApps.length} selected apps, ${userWidgets.length} existing widgets`);
        organizeAppsIntoWidgets();
      }
    }
  }, [selectedApps, userWidgets]);

  const organizeAppsIntoWidgets = async () => {
    try {
      const appsPerWidget = 6;
      const widgets: LocalWidgetConfig[] = [];
      
      for (let i = 0; i < selectedApps.length; i += appsPerWidget) {
        const widgetApps = selectedApps.slice(i, i + appsPerWidget);
        const widgetId = `widget_${Math.floor(i / appsPerWidget) + 1}`;
        
        widgets.push({
          widgetId,
          appIds: widgetApps.map(app => app.appId).filter(id => id), // Filter out undefined/null IDs
          order: Math.floor(i / appsPerWidget),
        });
      }

      console.log(`Creating ${widgets.length} widgets with ${selectedApps.length} apps:`, widgets);
      if (widgets.length > 0) {
        await localStorageService.reorganizeWidgets(widgets);
        setUserWidgets(widgets);
      }
    } catch (error) {
      console.error('Error organizing widgets:', error);
    }
  };

  const handleAppPress = async (app) => {
    try {
      if (Platform.OS === 'android' && app.packageName) {
        // For Android, use the native module
        const { InstalledAppsModule } = NativeModules;
        if (InstalledAppsModule) {
          await InstalledAppsModule.launchApp(app.packageName);
          return;
        } else {
          // Fallback to intent URL
          const url = `intent://${app.packageName}#Intent;scheme=package;end`;
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
            return;
          }
        }
      } else if (Platform.OS === 'ios' && app.urlScheme) {
        console.log(`Attempting to launch ${app.displayName} with scheme: ${app.urlScheme}`);
        
        // For third-party apps, try to launch directly without checking canOpenURL
        // because iOS restrictions often make canOpenURL return false even for installed apps
        if (app.isThirdParty) {
          console.log(`${app.displayName} is a third-party app, attempting direct launch`);
          try {
            await Linking.openURL(app.urlScheme);
            return;
          } catch (launchError) {
            console.log(`Failed to launch ${app.displayName} directly, trying App Store`);
            if (app.appStoreUrl) {
              await Linking.openURL(app.appStoreUrl);
              return;
            }
          }
        } else {
          // For built-in apps, we can still check canOpenURL
          const canOpen = await Linking.canOpenURL(app.urlScheme);
          console.log(`Can open ${app.displayName}:`, canOpen);
          
          if (canOpen) {
            try {
              await Linking.openURL(app.urlScheme);
              return;
            } catch (launchError) {
              console.log(`Failed to launch ${app.displayName} with scheme, trying App Store`);
              if (app.appStoreUrl) {
                await Linking.openURL(app.appStoreUrl);
                return;
              }
            }
          } else {
            // App not installed, try to open App Store
            if (app.appStoreUrl) {
              await Linking.openURL(app.appStoreUrl);
              return;
            }
          }
        }
      }
      
      // If we get here, we couldn't launch the app
      Alert.alert(
        "App Not Found",
        `Unable to open ${app.displayName}. The app may not be installed.`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Settings", 
            onPress: () => navigation.navigate("AppSelectionScreen") 
          }
        ]
      );
    } catch (error) {
      console.error('Error launching app:', error);
      Alert.alert(
        "Error",
        `Unable to open ${app.displayName}. Please check if the app is installed.`
      );
    }
  };

  const getAppsForWidget = (widget) => {
    const widgetApps = selectedApps.filter(app => 
      widget.appIds.includes(app.appId)
    ).map(app => ({
      _id: app.appId,
      displayName: app.displayName,
      packageName: app.packageName || '',
      urlScheme: app.urlScheme,
      appStoreUrl: app.appStoreUrl,
      isThirdParty: app.isThirdParty,
    }));
    
    // Sort apps by their order within the widget
    // The order is determined by the global order of all apps
    return widgetApps.sort((a, b) => {
      const appA = selectedApps.find(originalApp => originalApp.appId === a._id);
      const appB = selectedApps.find(originalApp => originalApp.appId === b._id);
      return (appA?.order || 0) - (appB?.order || 0);
    });
  };

  const renderWidgetItem = ({ item }) => {
    const widgetApps = getAppsForWidget(item);
    return (
      <View style={styles.widgetContainer}>
        <WidgetPreview
          widgetId={item.widgetId}
          apps={widgetApps}
          onAppPress={handleAppPress}
          isDragging={false}
          showTitle={false}
          fontSize={userSettings.fontSize}
          alignment={userSettings.layout as 'left' | 'center' | 'right'}
          theme={userSettings.theme as 'default' | 'dark' | 'light'}
          fontColor={userSettings.fontColor}
          verticalAlignment={userSettings.verticalAlignment as 'top' | 'middle' | 'bottom'}
        />
      </View>
    );
  };

  const handleWidgetReorder = ({ data }: { data: any[] }) => {
    const updatedWidgets = data.map((widget, index) => ({
      ...widget,
      order: index,
    }));
    
    localStorageService.reorganizeWidgets(updatedWidgets);
    setUserWidgets(updatedWidgets);
  };



  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          {/* Removed AppOrderScreen navigation button */}
          <Text style={styles.headerTitle}>focUIs</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SettingsScreen")}
              style={styles.headerButton}
            >
              <Ionicons name="settings-outline" size={24} color="#F7F7F7" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessContainer}>
          <View style={styles.quickAccessButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SetupScreen")}
              style={styles.quickAccessButton}
            >
              <Ionicons name="information-circle-outline" size={24} color="#F7F7F7" />
              <Text style={styles.quickAccessButtonText}>Guide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("AppSelectionScreen")}
              style={styles.quickAccessButton}
            >
              <Ionicons name="apps-outline" size={24} color="#F7F7F7" />
              <Text style={styles.quickAccessButtonText}>Apps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("WidgetConfigScreen")}
              style={styles.quickAccessButton}
            >
              <Ionicons name="create-outline" size={24} color="#F7F7F7" />
              <Text style={styles.quickAccessButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {selectedApps.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyState}>
              <Ionicons name="phone-portrait-outline" size={64} color="#B3B3B3" style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>No Apps Selected</Text>
              <Text style={styles.emptyStateText}>
                Tap the button below to select which apps to display
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("AppSelectionScreen")}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>Select Apps</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Widget Previews Section */}
            {userWidgets.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Widget Previews</Text>
                </View>
                <FlatList
                  data={userWidgets}
                  keyExtractor={(item) => item.widgetId}
                  renderItem={renderWidgetItem}
                  contentContainerStyle={styles.widgetsList}
                  scrollEnabled={false}
                />
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // subtle overlay for readability
  },
  container: {
    flex: 1,
    // backgroundColor: "#F7F7F7", // REMOVE this line for transparency
  },
  header: {
    backgroundColor: 'transparent', // fully transparent
    paddingTop: 60,
    paddingBottom: 8,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0,
    // borderBottomColor: "#222C3A", // removed dividing line
  },
  headerTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#F7F7F7",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 15,
  },
  headerButton: {
    padding: 8,
  },
  quickAccessContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  quickAccessTitle: {
    fontSize: RFValue(18),
    fontFamily: "MSemiBold",
    color: "#F7F7F7",
    marginBottom: 12,
  },
  quickAccessButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickAccessButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 40, 60, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#23304A",
  },
  quickAccessButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MMedium",
    color: "#F7F7F7",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },

  emptyStateContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 10,
  },
  emptyState: {
    alignItems: "center",
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#F7F7F7",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#C8D2E0",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: 'rgba(23, 47, 80, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6D8AAF',
  },
  emptyStateButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#F7F7F7",
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontFamily: "MBold",
    color: "#7A7A7A",
    textAlign: "center",
    width: '100%',
  },
  sectionSubtitle: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#C8D2E0",
    marginTop: 5,
  },
  widgetsList: {
    paddingBottom: 20,
  },
  widgetContainer: {
    marginBottom: 10,
  },
  });
  
export default HomeScreen; 