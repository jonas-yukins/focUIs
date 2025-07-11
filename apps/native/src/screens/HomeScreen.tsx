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
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import WidgetPreview from "../components/WidgetPreview";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const user = useUser();
  const { signOut } = useAuth();
  const selectedApps = useQuery(api.notes.getUserApps) || [];
  const userWidgets = useQuery(api.notes.getUserWidgets) || [];
  
  const reorganizeWidgets = useMutation(api.notes.reorganizeWidgets);
  const upsertWidget = useMutation(api.notes.upsertWidget);

  // Auto-organize apps into widgets if no widgets exist
  useEffect(() => {
    if (selectedApps.length > 0 && userWidgets.length === 0) {
      organizeAppsIntoWidgets();
    }
  }, [selectedApps, userWidgets]);

  const organizeAppsIntoWidgets = () => {
    const appsPerWidget = 6;
    const widgets = [];
    
    for (let i = 0; i < selectedApps.length; i += appsPerWidget) {
      const widgetApps = selectedApps.slice(i, i + appsPerWidget);
      const widgetId = `widget_${Math.floor(i / appsPerWidget) + 1}`;
      
      widgets.push({
        widgetId,
        appIds: widgetApps.map(app => app._id),
        order: Math.floor(i / appsPerWidget),
      });
    }

    if (widgets.length > 0) {
      reorganizeWidgets({ widgets });
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
            console.log(`${app.displayName} is not installed, falling back to App Store`);
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const getAppsForWidget = (widget) => {
    return selectedApps.filter(app => 
      widget.appIds.includes(app._id)
    );
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
        />
      </View>
    );
  };

  const handleWidgetReorder = ({ data }: { data: any[] }) => {
    const updatedWidgets = data.map((widget, index) => ({
      ...widget,
      order: index,
    }));
    
    reorganizeWidgets({ widgets: updatedWidgets });
  };

  const renderAppItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleAppPress(item)}
      style={styles.appItem}
      activeOpacity={0.7}
    >
      <Text style={styles.appText}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dumbphone</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AppSelectionScreen")}
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={24} color="#172F50" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.headerButton}
          >
            <Ionicons name="log-out-outline" size={24} color="#172F50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Access Section */}
      <View style={styles.quickAccessContainer}>
        <Text style={styles.quickAccessTitle}>Quick Access</Text>
        <View style={styles.quickAccessButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AppSelectionScreen")}
            style={styles.quickAccessButton}
          >
            <Ionicons name="settings-outline" size={24} color="#172F50" />
            <Text style={styles.quickAccessButtonText}>Select Apps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("WidgetSetupScreen")}
            style={styles.quickAccessButton}
          >
            <Ionicons name="phone-portrait-outline" size={24} color="#172F50" />
            <Text style={styles.quickAccessButtonText}>Add Widget</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("WidgetConfigScreen")}
            style={styles.quickAccessButton}
          >
            <Ionicons name="grid-outline" size={24} color="#172F50" />
            <Text style={styles.quickAccessButtonText}>Configure</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Apps Selected</Text>
            <Text style={styles.emptyStateText}>
              Tap the settings button to select which apps to display
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AppSelectionScreen")}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>Select Apps</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Widget Previews Section */}
            {userWidgets.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Widget Previews</Text>
                  <Text style={styles.sectionSubtitle}>
                    Long press to reorder widgets. Tap apps to launch them.
                  </Text>
                </View>
                <FlatList
                  data={userWidgets}
                  keyExtractor={(item) => item._id}
                  renderItem={renderWidgetItem}
                  contentContainerStyle={styles.widgetsList}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* All Apps Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Selected Apps</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap any app to launch it
                </Text>
              </View>
              <FlatList
                data={selectedApps}
                renderItem={renderAppItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.appsGrid}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    backgroundColor: "#E1E1E1",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#B3B3B3",
  },
  headerTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#172F50",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 15,
  },
  headerButton: {
    padding: 8,
  },
  quickAccessContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  quickAccessTitle: {
    fontSize: RFValue(18),
    fontFamily: "MSemiBold",
    color: "#172F50",
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
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  quickAccessButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MMedium",
    color: "#172F50",
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  appsGrid: {
    paddingBottom: 20,
  },
  appItem: {
    flex: 1,
    margin: 8,
    padding: 20,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  appText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#172F50",
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#172F50",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#7A7A7A",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: "#172F50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MMedium",
    color: "#E1E1E1",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontFamily: "MBold",
    color: "#172F50",
  },
  sectionSubtitle: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#7A7A7A",
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