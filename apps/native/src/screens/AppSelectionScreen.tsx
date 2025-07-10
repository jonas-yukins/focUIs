import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import * as Application from 'expo-application';

const AppSelectionScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [installedApps, setInstalledApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userApps = useQuery(api.notes.getAllUserApps) || [];
  const upsertApp = useMutation(api.notes.upsertApp);
  const toggleAppSelection = useMutation(api.notes.toggleAppSelection);

  // Common apps that users typically want to access
  const commonApps = [
    { name: "Phone", packageName: "com.android.dialer", displayName: "Phone" },
    { name: "Messages", packageName: "com.android.mms", displayName: "Messages" },
    { name: "Camera", packageName: "com.android.camera", displayName: "Camera" },
    { name: "Settings", packageName: "com.android.settings", displayName: "Settings" },
    { name: "Maps", packageName: "com.google.android.apps.maps", displayName: "Maps" },
    { name: "Calendar", packageName: "com.android.calendar", displayName: "Calendar" },
    { name: "Clock", packageName: "com.android.deskclock", displayName: "Clock" },
    { name: "Calculator", packageName: "com.android.calculator2", displayName: "Calculator" },
    { name: "Notes", packageName: "com.android.notes", displayName: "Notes" },
    { name: "Browser", packageName: "com.android.chrome", displayName: "Browser" },
    { name: "Email", packageName: "com.android.email", displayName: "Email" },
    { name: "Gallery", packageName: "com.android.gallery3d", displayName: "Gallery" },
  ];

  useEffect(() => {
    loadInstalledApps();
  }, []);

  const loadInstalledApps = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'android') {
        // For Android, we'll use the common apps list as a starting point
        // In a real implementation, you'd use PackageManager to get installed apps
        setInstalledApps(commonApps);
      } else {
        // For iOS, we can't get installed apps, so we'll use a predefined list
        const iosApps = [
          { name: "Phone", packageName: "tel://", displayName: "Phone" },
          { name: "Messages", packageName: "sms://", displayName: "Messages" },
          { name: "Camera", packageName: "camera://", displayName: "Camera" },
          { name: "Settings", packageName: "App-Prefs://", displayName: "Settings" },
          { name: "Maps", packageName: "maps://", displayName: "Maps" },
          { name: "Calendar", packageName: "calshow://", displayName: "Calendar" },
          { name: "Clock", packageName: "clock://", displayName: "Clock" },
          { name: "Calculator", packageName: "calculator://", displayName: "Calculator" },
          { name: "Notes", packageName: "mobilenotes://", displayName: "Notes" },
          { name: "Safari", packageName: "x-web-search://", displayName: "Browser" },
          { name: "Mail", packageName: "message://", displayName: "Email" },
          { name: "Photos", packageName: "photos-redirect://", displayName: "Photos" },
        ];
        setInstalledApps(iosApps);
      }
    } catch (error) {
      console.error("Error loading installed apps:", error);
      // Fallback to common apps
      setInstalledApps(commonApps);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppToggle = async (app) => {
    try {
      const isCurrentlySelected = userApps.some(
        userApp => userApp.packageName === app.packageName && userApp.isSelected
      );

      if (isCurrentlySelected) {
        await toggleAppSelection({ packageName: app.packageName });
      } else {
        const nextOrder = userApps.length + 1;
        await upsertApp({
          appName: app.name,
          packageName: app.packageName,
          displayName: app.displayName,
          isSelected: true,
          order: nextOrder,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update app selection");
    }
  };

  const isAppSelected = (app) => {
    return userApps.some(
      userApp => userApp.packageName === app.packageName && userApp.isSelected
    );
  };

  const filteredApps = installedApps.filter(app =>
    app.displayName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderAppItem = ({ item }) => (
    <View style={styles.appItem}>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.displayName}</Text>
        <Text style={styles.appPackage}>{item.packageName}</Text>
      </View>
      <Switch
        value={isAppSelected(item)}
        onValueChange={() => handleAppToggle(item)}
        trackColor={{ false: "#B3B3B3", true: "#172F50" }}
        thumbColor={isAppSelected(item) ? "#E1E1E1" : "#F7F7F7"}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#172F50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Apps</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7A7A7A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#7A7A7A"
        />
      </View>

      {/* Apps List */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading apps...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Available Apps ({filteredApps.length})
            </Text>
            <FlatList
              data={filteredApps}
              renderItem={renderAppItem}
              keyExtractor={(item) => item.packageName}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.appsList}
            />
          </>
        )}
      </View>

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {Platform.OS === 'ios' 
            ? "Note: iOS restrictions limit app detection. You may need to manually add apps."
            : "Selected apps will appear on your home screen."
          }
        </Text>
      </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: RFValue(20),
    fontFamily: "MBold",
    color: "#172F50",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1E1E1",
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#172F50",
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#7A7A7A",
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontFamily: "MMedium",
    color: "#172F50",
    marginBottom: 15,
  },
  appsList: {
    paddingBottom: 20,
  },
  appItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E1E1E1",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: RFValue(16),
    fontFamily: "MMedium",
    color: "#172F50",
    marginBottom: 4,
  },
  appPackage: {
    fontSize: RFValue(12),
    fontFamily: "MRegular",
    color: "#7A7A7A",
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#C8D2E0",
    borderTopWidth: 1,
    borderTopColor: "#B3B3B3",
  },
  infoText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#172F50",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AppSelectionScreen; 