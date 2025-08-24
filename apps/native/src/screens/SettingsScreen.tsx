import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';
import localStorageService, { LocalUserSettings } from '../services/LocalStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const backgroundUri = useBackgroundAsset();

  // Use local state, initialize with defaults
  const [fontSize, setFontSize] = useState(20);
  const [theme, setTheme] = useState("default");
  const [layout, setLayout] = useState("center");
  const [saving, setSaving] = useState(false);
  const [fontColor, setFontColor] = useState('white');
  const [verticalAlignment, setVerticalAlignment] = useState('middle'); // NEW
  const [loading, setLoading] = useState(true);

  // Load settings from local storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await localStorageService.getUserSettings();
        
        setFontSize(settings.fontSize || 20);
        setTheme(settings.theme || "default");
        setLayout(settings.layout || "center");
        setVerticalAlignment(settings.verticalAlignment || "middle"); // NEW
        
        // Auto-set fontColor based on theme
        if ((settings.theme === 'default' || settings.theme === 'dark') || !settings.theme) {
          setFontColor('white');
        } else if (settings.theme === 'light') {
          setFontColor('black');
        } else {
          setFontColor(settings.fontColor || 'white');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // When theme changes, auto-set fontColor (but allow user to override)
  useEffect(() => {
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
      await localStorageService.saveUserSettings({ fontSize, theme, layout, fontColor, verticalAlignment });
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
            setVerticalAlignment("middle"); // NEW
            try {
              await localStorageService.saveUserSettings({ fontSize: 20, theme: "default", layout: "center", fontColor: "white", verticalAlignment: "middle" });
              Alert.alert("Styling Reset", "All styling has been reset to default.");
              navigation.goBack(); // Navigate back after reset
            } catch (error) {
              Alert.alert("Error", "Failed to reset styling");
            }
          },
        },
      ]
    );
  };

  // Clear All Apps handler
  const handleClearAllApps = () => {
    Alert.alert(
      "Clear All Apps",
      "Are you sure you want to clear all selected apps? This will remove all app selections and widget configurations. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear only app-related data, not settings
              await AsyncStorage.multiRemove(['selectedApps', 'widgetConfig']);
              Alert.alert("Apps Cleared", "All selected apps have been cleared.");
              navigation.goBack(); // Navigate back after clearing
            } catch (error) {
              Alert.alert("Error", "Failed to clear apps");
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

  const renderVerticalAlignmentSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vertical Layout</Text>
      <View style={styles.layoutContainer}>
        {[
          { id: "top", name: "Top", icon: "arrow-up" },
          { id: "middle", name: "Middle", icon: "remove" },
          { id: "bottom", name: "Bottom", icon: "arrow-down" },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.layoutButton,
              verticalAlignment === option.id && styles.layoutButtonActive,
            ]}
            onPress={() => setVerticalAlignment(option.id)}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={verticalAlignment === option.id ? "#172F50" : "#7A7A7A"}
            />
            <Text
              style={[
                styles.layoutButtonText,
                verticalAlignment === option.id && styles.layoutButtonTextActive,
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
          <View style={[styles.section, { backgroundColor: 'transparent', marginBottom: 10 }]}>
            {renderFontSizeSelector()}
            {renderThemeSelector()}
            {renderFontColorSelector()}
            {renderAlignmentSelector()}
            {renderVerticalAlignmentSelector()}
          </View>

          {/* Reset Styling Button */}
          <View style={[styles.section, { backgroundColor: 'transparent', marginBottom: 10 }]}>
            <TouchableOpacity
              style={[styles.signOutButton, { marginBottom: 8 }]}
              onPress={handleResetStyling}
              activeOpacity={0.7}
              accessibilityLabel="Reset all styling to default"
              accessibilityRole="button"
            >
              <Text style={styles.resetStylingButtonText}>Reset Styling</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.signOutButton, {}]}
              onPress={handleClearAllApps}
              activeOpacity={0.7}
              accessibilityLabel="Clear all selected apps"
              accessibilityRole="button"
            >
              <Text style={styles.clearDataButtonText}>Clear All Apps</Text>
            </TouchableOpacity>
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
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F7F7F7", // white outline
    backgroundColor: "transparent", // transparent when unfocused
    flex: 1,
    marginHorizontal: 5,
    minWidth: 90, // make buttons wider so "Center" fits
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    fontFamily: "MSemiBold",
    color: "#DC3545", // error red from palette
  },
  clearDataButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#DC3545", // same red as reset styling
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