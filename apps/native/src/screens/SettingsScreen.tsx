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

interface UserSettings {
  _id: string;
  _creationTime: number;
  fontSize?: number;
  theme?: string;
  layout?: string;
  fontColor?: string;
  userId: string;
}

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const userSettings = useQuery(api.notes.getUserSettings) as UserSettings | null;
  const updateUserSettings = useMutation(api.notes.updateUserSettings);
  const backgroundUri = useBackgroundAsset();

  // Use local state, initialize from userSettings
  const [fontSize, setFontSize] = useState(userSettings?.fontSize || 20);
  const [theme, setTheme] = useState(userSettings?.theme || "default");
  const [layout, setLayout] = useState(userSettings?.layout || "center");
  const [saving, setSaving] = useState(false);
  const [fontColor, setFontColor] = useState(userSettings?.fontColor || 'white');

  // Update local state when userSettings changes (for Clerk hot reload)
  React.useEffect(() => {
    if (userSettings) {
      setFontSize(userSettings.fontSize || 16);
      setTheme(userSettings.theme || "default");
      setLayout(userSettings.layout || "center");
      // Auto-set fontColor based on theme
      if ((userSettings.theme === 'default' || userSettings.theme === 'dark') || !userSettings.theme) {
        setFontColor('white');
      } else if (userSettings.theme === 'light') {
        setFontColor('black');
      } else {
        setFontColor(userSettings.fontColor || 'white');
      }
    }
  }, [userSettings]);

  // When theme changes, auto-set fontColor (but allow user to override)
  React.useEffect(() => {
    if (theme === 'default' || theme === 'dark') {
      setFontColor('white');
    } else if (theme === 'light') {
      setFontColor('black');
    }
  }, [theme]);

  // Save handler for checkmark
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserSettings({ fontSize, theme, layout, fontColor });
      Alert.alert("Settings Saved", "Your preferences have been updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Reset Styling handler
  const handleResetStyling = () => {
    Alert.alert(
      "Reset Styling",
      "Are you sure you want to reset all styling to default? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setFontSize(20);
            setTheme("default");
            setLayout("center");
            try {
              await updateUserSettings({ fontSize: 20, theme: "default", layout: "center" });
              Alert.alert("Styling Reset", "All styling has been reset to default.");
            } catch (error) {
              Alert.alert("Error", "Failed to reset styling");
            }
          },
        },
      ]
    );
  };

  // Remove mutation from selectors, just update local state
  const handleFontSizeChange = (newSize) => setFontSize(newSize);
  const handleThemeChange = (newTheme) => setTheme(newTheme);
  const handleLayoutChange = (newLayout) => setLayout(newLayout);

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
        {[16, 18, 20, 22, 24].map((size) => (
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
          { id: "default", name: "Default", color: "transparent", outline: true },
          { id: "dark", name: "Dark", color: "#0A1424", outline: false },
          { id: "light", name: "Light", color: "#F7F7F7", outline: false },
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
                themeOption.outline && { borderWidth: 1.5, borderColor: '#FFFFFF' },
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

  const renderFontColorSelector = () => {
    // Recommend font color for theme, but allow manual selection
    let recommendedColor = 'white';
    if (theme === 'light') recommendedColor = 'black';
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Color</Text>
        <View style={styles.fontColorContainer}>
          {[{ id: 'white', name: 'White', color: '#FFFFFF' }, { id: 'black', name: 'Black', color: '#000000' }].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.fontColorButton,
                fontColor === option.id && styles.fontColorButtonActive,
              ]}
              onPress={() => setFontColor(option.id)}
            >
              <View style={[styles.fontColorSwatch, { backgroundColor: option.color }]} />
              <Text
                style={[
                  styles.fontColorButtonText,
                  fontColor === option.id && styles.fontColorButtonTextActive,
                  { color: option.color },
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ color: '#7A7A7A', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          Recommended for this theme: <Text style={{ color: recommendedColor === 'white' ? '#FFFFFF' : '#000000', fontWeight: 'bold' }}>{recommendedColor.charAt(0).toUpperCase() + recommendedColor.slice(1)}</Text>
        </Text>
      </View>
    );
  };

  const renderAlignmentSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Layout</Text>
      <View style={styles.layoutContainer}>
        {[
          { id: "left", name: "Left", icon: "arrow-back" },
          { id: "center", name: "Center", icon: "remove" },
          { id: "right", name: "Right", icon: "arrow-forward" },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.layoutButton,
              layout === option.id && styles.layoutButtonActive,
            ]}
            onPress={() => handleLayoutChange(option.id)}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={layout === option.id ? "#172F50" : "#7A7A7A"}
            />
            <Text
              style={[
                styles.layoutButtonText,
                layout === option.id && styles.layoutButtonTextActive,
              ]}
            >
              {option.name}
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
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerButton}
            disabled={saving}
            accessibilityLabel="Save settings"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark" size={26} color="#28A745" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Appearance */}
          <View style={[styles.section, { backgroundColor: 'transparent' }]}>
            {renderFontSizeSelector()}
            {renderThemeSelector()}
            {renderFontColorSelector()}
            {renderAlignmentSelector()}
          </View>

          {/* Sign Out Button */}
          <View style={[styles.section, { backgroundColor: 'transparent', marginBottom: 20 }]}>
            <View style={styles.horizontalButtonContainer}>
              <TouchableOpacity
                style={[styles.signOutButton, { marginRight: 8, flex: 1 }]}
                onPress={handleResetStyling}
                activeOpacity={0.7}
                accessibilityLabel="Reset all styling to default"
                accessibilityRole="button"
              >
                <Text style={styles.resetStylingButtonText}>Reset Styling</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.signOutButton, { flex: 1 }]}
                onPress={handleSignOut}
                activeOpacity={0.7}
                accessibilityLabel="Sign out of your account"
                accessibilityRole="button"
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Version at the bottom */}
          <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
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
    padding: 15,
    borderRadius: 8,
    // Removed borderWidth, borderColor, and backgroundColor
  },
  fontSizeButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F7F7F7", // white outline
    backgroundColor: "transparent", // transparent when unfocused
    justifyContent: "center", // vertically center text
    alignItems: "center", // horizontally center text
  },
  fontSizeButtonActive: {
    backgroundColor: "#E1E1E1", // gray when focused
    borderColor: "#E1E1E1", // white outline for active
  },
  fontSizeButtonText: {
    fontFamily: "MRegular",
    color: "#7A7A7A",
  },
  fontSizeButtonTextActive: {
    color: "#172F50", // dark blue for visibility on gray background
  },
  themeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 8,
    // Removed borderWidth, borderColor, and backgroundColor
  },
  themeButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F7F7F7", // white outline
    backgroundColor: "transparent", // transparent when unfocused
    flex: 1,
    marginHorizontal: 5,
  },
  themeButtonActive: {
    backgroundColor: "#E1E1E1", // gray when focused
    borderColor: "#E1E1E1", // white outline for active
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
    color: "#172F50", // dark blue for visibility on gray background
  },
  layoutContainer: {
    flexDirection: "row",
    justifyContent: "center", // center the layout alignment buttons
    padding: 15,
    borderRadius: 8,
    // Removed borderWidth, borderColor, and backgroundColor
  },
  layoutButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F7F7F7", // white outline
    backgroundColor: "transparent", // transparent when unfocused
    flex: 1,
    marginHorizontal: 5,
    minWidth: 90, // make buttons wider
  },
  layoutButtonActive: {
    backgroundColor: "#E1E1E1", // gray when focused
    borderColor: "#E1E1E1", // white outline for active
  },
  layoutButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#7A7A7A",
    marginTop: 5,
  },
  layoutButtonTextActive: {
    color: "#172F50", // dark blue for visibility on gray background
  },
  signOutButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 0, // remove outline
    backgroundColor: 'rgba(23, 47, 80, 0.6)', // match section background
    alignItems: "center",
    marginVertical: 5,
  },
  signOutButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#F7F7F7", // light text for contrast on dark background
  },
  resetStylingButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#DC3545", // error red from palette
  },
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  versionText: {
    fontSize: RFValue(12),
    color: '#B3B3B3',
    fontFamily: 'MRegular',
  },
  horizontalButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  fontColorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
  },
  fontColorButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F7F7F7',
    backgroundColor: 'transparent',
    flex: 1,
    marginHorizontal: 5,
  },
  fontColorButtonActive: {
    backgroundColor: '#E1E1E1',
    borderColor: '#E1E1E1',
  },
  fontColorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#B3B3B3',
  },
  fontColorButtonText: {
    fontSize: RFValue(12),
    fontFamily: 'MRegular',
    color: '#7A7A7A',
  },
  fontColorButtonTextActive: {
    color: '#172F50',
  },
});

export default SettingsScreen; 