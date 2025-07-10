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
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const user = useUser();
  const { signOut } = useAuth();
  const selectedApps = useQuery(api.notes.getUserApps) || [];

  const handleAppPress = async (app) => {
    try {
      // Try to open the app using its package name
      const url = Platform.OS === 'ios' 
        ? `${app.packageName}://` 
        : `intent://${app.packageName}#Intent;scheme=package;end`;
      
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback: try to open app settings
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
      }
    } catch (error) {
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
            onPress={() => navigation.navigate("DumbphoneScreen")}
            style={styles.headerButton}
          >
            <Ionicons name="phone-portrait-outline" size={24} color="#172F50" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("InstalledAppsScreen")}
            style={styles.headerButton}
          >
            <Ionicons name="apps-outline" size={24} color="#172F50" />
          </TouchableOpacity>
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
            onPress={() => navigation.navigate("DumbphoneScreen")}
            style={styles.quickAccessButton}
          >
            <Ionicons name="phone-portrait" size={24} color="#172F50" />
            <Text style={styles.quickAccessButtonText}>Dumbphone Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("InstalledAppsScreen")}
            style={styles.quickAccessButton}
          >
            <Ionicons name="list" size={24} color="#172F50" />
            <Text style={styles.quickAccessButtonText}>All Apps</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Apps Grid */}
      <View style={styles.content}>
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
          <FlatList
            data={selectedApps}
            renderItem={renderAppItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.appsGrid}
            showsVerticalScrollIndicator={false}
          />
        )}
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
});

export default HomeScreen; 