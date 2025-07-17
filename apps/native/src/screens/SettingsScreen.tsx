import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ImageBackground,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useAuth } from "@clerk/clerk-expo";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const userSettings = useQuery(api.notes.getUserSettings);
  const updateUserSettings = useMutation(api.notes.updateUserSettings);
  const backgroundUri = useBackgroundAsset();

  const [fontSize, setFontSize] = useState(userSettings?.fontSize || 16);
  const [theme, setTheme] = useState(userSettings?.theme || "default");
  const [layout, setLayout] = useState(userSettings?.layout || "grid");

  const handleFontSizeChange = async (newSize) => {
    setFontSize(newSize);
    try {
      await updateUserSettings({ fontSize: newSize });
    } catch (error) {
      Alert.alert("Error", "Failed to update font size");
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      await updateUserSettings({ theme: newTheme });
    } catch (error) {
      Alert.alert("Error", "Failed to update theme");
    }
  };

  const handleLayoutChange = async (newLayout) => {
    setLayout(newLayout);
    try {
      await updateUserSettings({ layout: newLayout });
    } catch (error) {
      Alert.alert("Error", "Failed to update layout");
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert("Error", "Failed to sign out");
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = ({ title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#7A7A7A" />
      )}
    </TouchableOpacity>
  );

  const renderFontSizeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Font Size</Text>
      <View style={styles.fontSizeContainer}>
        {[12, 14, 16, 18, 20].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.fontSizeButton,
              fontSize === size && styles.fontSizeButtonActive,
            ]}
            onPress={() => handleFontSizeChange(size)}
          >
            <Text
              style={[
                styles.fontSizeButtonText,
                fontSize === size && styles.fontSizeButtonTextActive,
                { fontSize: size },
              ]}
            >
              Aa
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderThemeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Theme</Text>
      <View style={styles.themeContainer}>
        {[
          { id: "default", name: "Default", color: "#172F50" },
          { id: "dark", name: "Dark", color: "#0A1424" },
          { id: "light", name: "Light", color: "#F7F7F7" },
        ].map((themeOption) => (
          <TouchableOpacity
            key={themeOption.id}
            style={[
              styles.themeButton,
              theme === themeOption.id && styles.themeButtonActive,
            ]}
            onPress={() => handleThemeChange(themeOption.id)}
          >
            <View
              style={[
                styles.themeColor,
                { backgroundColor: themeOption.color },
              ]}
            />
            <Text
              style={[
                styles.themeButtonText,
                theme === themeOption.id && styles.themeButtonTextActive,
              ]}
            >
              {themeOption.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLayoutSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Layout</Text>
      <View style={styles.layoutContainer}>
        {[
          { id: "grid", name: "Grid", icon: "apps" },
          { id: "list", name: "List", icon: "menu" },
        ].map((layoutOption) => (
          <TouchableOpacity
            key={layoutOption.id}
            style={[
              styles.layoutButton,
              layout === layoutOption.id && styles.layoutButtonActive,
            ]}
            onPress={() => handleLayoutChange(layoutOption.id)}
          >
            <Ionicons
              name={layoutOption.icon as any}
              size={24}
              color={layout === layoutOption.id ? "#172F50" : "#7A7A7A"}
            />
            <Text
              style={[
                styles.layoutButtonText,
                layout === layoutOption.id && styles.layoutButtonTextActive,
              ]}
            >
              {layoutOption.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#F7F7F7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerButtons} />
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* App Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Management</Text>
            {renderSettingItem({
              title: "Select Apps",
              subtitle: "Choose which apps to display",
              onPress: () => navigation.navigate("AppSelectionScreen"),
            })}
          </View>

          {/* Appearance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            {renderFontSizeSelector()}
            {renderThemeSelector()}
            {renderLayoutSelector()}
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {renderSettingItem({
              title: "Sign Out",
              subtitle: "Sign out of your account",
              onPress: handleSignOut,
              showArrow: false,
            })}
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            {renderSettingItem({
              title: "Version",
              subtitle: "1.0.0",
              onPress: () => {},
              showArrow: false,
            })}
            {renderSettingItem({
              title: "Privacy Policy",
              subtitle: "Read our privacy policy",
              onPress: () => {},
            })}
            {renderSettingItem({
              title: "Terms of Service",
              subtitle: "Read our terms of service",
              onPress: () => {},
            })}
          </View>
        </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
    // Remove backgroundColor for transparency
  },
  header: {
    backgroundColor: 'rgba(23, 47, 80, 0.7)',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222C3A",
  },
  headerTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#F7F7F7",
  },
  headerButtons: {
    width: 40,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'rgba(23, 47, 80, 0.6)',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontFamily: "MBold",
    color: "#F7F7F7",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E1E1E1",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: RFValue(16),
    fontFamily: "MMedium",
    color: "#172F50",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#7A7A7A",
  },
  fontSizeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E1E1E1",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
  },
  fontSizeButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    backgroundColor: "#F7F7F7",
  },
  fontSizeButtonActive: {
    backgroundColor: "#172F50",
    borderColor: "#172F50",
  },
  fontSizeButtonText: {
    fontFamily: "MRegular",
    color: "#7A7A7A",
  },
  fontSizeButtonTextActive: {
    color: "#E1E1E1",
  },
  themeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E1E1E1",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
  },
  themeButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    backgroundColor: "#F7F7F7",
    flex: 1,
    marginHorizontal: 5,
  },
  themeButtonActive: {
    backgroundColor: "#172F50",
    borderColor: "#172F50",
  },
  themeColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  themeButtonText: {
    fontSize: RFValue(12),
    fontFamily: "MRegular",
    color: "#7A7A7A",
  },
  themeButtonTextActive: {
    color: "#E1E1E1",
  },
  layoutContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E1E1E1",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
  },
  layoutButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    backgroundColor: "#F7F7F7",
    flex: 1,
    marginHorizontal: 5,
  },
  layoutButtonActive: {
    backgroundColor: "#172F50",
    borderColor: "#172F50",
  },
  layoutButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#7A7A7A",
    marginTop: 5,
  },
  layoutButtonTextActive: {
    color: "#E1E1E1",
  },
});

export default SettingsScreen; 