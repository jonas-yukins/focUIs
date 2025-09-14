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
import PagerView from 'react-native-pager-view';
import { Ionicons } from "@expo/vector-icons";
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';
import localStorageService, { LocalUserSettings } from '../services/LocalStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const backgroundUri = useBackgroundAsset();

  // Use local state, initialize with defaults
  const [fontSize, setFontSize] = useState(20);
  const [layout, setLayout] = useState("center");
  const [saving, setSaving] = useState(false);
  const [fontColor, setFontColor] = useState('white');
  const [verticalAlignment, setVerticalAlignment] = useState('middle'); // NEW
  const [loading, setLoading] = useState(true);
  // NEW: decoupled background/outline
  const [backgroundStyle, setBackgroundStyle] = useState<'default' | 'blue' | 'white' | 'pink' | 'gray' | 'camel' | 'mintGreen' | 'orange' | 'raspberry' | 'sageGreen' | 'warmYellow'>('default');
  const [outlineEnabled, setOutlineEnabled] = useState<boolean>(true);
  const [outlineColor, setOutlineColor] = useState<'white' | 'black'>('white');
  // Track if user has interacted with background carousel to enable dynamic suggestions
  const [hasSwipedBackground, setHasSwipedBackground] = useState<boolean>(false);

  // Load settings from local storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await localStorageService.getUserSettings();
        
        setFontSize(settings.fontSize ?? 20);
        setLayout(settings.layout ?? "center");
        setVerticalAlignment(settings.verticalAlignment ?? "middle"); // NEW
        setBackgroundStyle((settings as any).backgroundStyle ?? 'default');
        setOutlineEnabled((settings as any).outlineEnabled ?? true);
        setOutlineColor((settings as any).outlineColor ?? 'white');
        // Use stored fontColor exactly on initial load (better UX). Normalize hex to names.
        const storedFontColor = (settings as any).fontColor;
        if (storedFontColor === '#FFFFFF') {
          setFontColor('white');
        } else if (storedFontColor === '#000000') {
          setFontColor('black');
        } else if (storedFontColor === 'white' || storedFontColor === 'black') {
          setFontColor(storedFontColor);
        } else {
          // Fallback to a sensible default if missing/unknown
          setFontColor('white');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // When backgroundStyle changes after user interaction, auto-set recommended fontColor
  useEffect(() => {
    if (!hasSwipedBackground) return;
    if (backgroundStyle === 'pink' || backgroundStyle === 'white' || backgroundStyle === 'camel' || backgroundStyle === 'mintGreen' || backgroundStyle === 'orange' || backgroundStyle === 'raspberry' || backgroundStyle === 'sageGreen' || backgroundStyle === 'warmYellow') {
      setFontColor('black');
    } else {
      setFontColor('white');
    }
  }, [backgroundStyle, hasSwipedBackground]);

  // When backgroundStyle changes after user interaction, auto-set recommended outlineColor if outline is enabled
  useEffect(() => {
    if (!hasSwipedBackground || !outlineEnabled) return;
    // All new colors should use black outline for better contrast
    if (backgroundStyle === 'white' || backgroundStyle === 'pink' || backgroundStyle === 'camel' || backgroundStyle === 'mintGreen' || backgroundStyle === 'orange' || backgroundStyle === 'raspberry' || backgroundStyle === 'sageGreen' || backgroundStyle === 'warmYellow') {
      setOutlineColor('black');
    } else {
      setOutlineColor('white');
    }
  }, [backgroundStyle, hasSwipedBackground, outlineEnabled]);

  // Removed legacy theme sync. Theme removed from model.

  // Save handler for checkmark
  const handleSave = async () => {
    setSaving(true);
    try {
      await localStorageService.saveUserSettings({ fontSize, layout, fontColor, verticalAlignment, backgroundStyle, outlineEnabled, outlineColor });
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
            setLayout("center");
            setVerticalAlignment("middle"); // NEW
            setBackgroundStyle('default');
            setOutlineEnabled(true);
            setOutlineColor('white');
            try {
              await localStorageService.saveUserSettings({ fontSize: 20, layout: "center", fontColor: "white", verticalAlignment: "middle", backgroundStyle: 'default', outlineEnabled: true, outlineColor: 'white' });
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

  const renderBackgroundSelector = () => {
    const options = [
      { id: 'default', name: 'Default', color: '#000000', outline: false },
      { id: 'white', name: 'White', color: '#F7F7F7', outline: false },
      { id: 'blue', name: 'Blue', color: '#10243c', outline: false },
      { id: 'pink', name: 'Pink', color: '#FFB7D5', outline: false },
      { id: 'gray', name: 'Gray', color: '#242424', outline: false },
      { id: 'camel', name: 'Camel', color: '#c09a6b', outline: false },
      { id: 'mintGreen', name: 'Mint Green', color: '#34CEB2', outline: false },
      { id: 'orange', name: 'Orange', color: '#E1863F', outline: false },
      { id: 'raspberry', name: 'Raspberry', color: '#E30B5C', outline: false },
      { id: 'sageGreen', name: 'Sage Green', color: '#B6C5B0', outline: false },
      { id: 'warmYellow', name: 'Warm Yellow', color: '#FEFACD', outline: false },
    ] as const;
    const currentIndex = Math.max(0, options.findIndex(o => o.id === backgroundStyle));
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background</Text>
        <View style={styles.backgroundContent}>
          <PagerView
            key={`background-${currentIndex}`}
            style={styles.carousel}
            initialPage={currentIndex}
            onPageSelected={(e) => {
              const idx = e.nativeEvent.position;
              const sel = options[idx];
              // Mark that user has interacted with background carousel
              if (sel && sel.id !== backgroundStyle) {
                setHasSwipedBackground(true);
              }
              if (sel) setBackgroundStyle(sel.id as any);
            }}
          >
            {options.map((opt, idx) => (
              <View key={opt.id} style={styles.backgroundSlide}>
                <View style={styles.backgroundPreview}>
                  <View
                    style={[
                      styles.backgroundColor,
                      { backgroundColor: opt.color },
                      opt.outline && { borderWidth: 2, borderColor: '#C8D2E0' }
                    ]}
                  />
                  <View style={styles.backgroundOverlay}>
                    <Text style={styles.backgroundName}>{opt.name}</Text>
                  </View>
                </View>
              </View>
            ))}
          </PagerView>
          <View style={styles.dotContainer}>
            {options.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
          <Text style={{ color: '#7A7A7A', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
            Download matching wallpaper color in <Text style={{ color: '#C8D2E0', textDecorationLine: 'underline' }} onPress={() => navigation.navigate("SetupScreen")}>Guide</Text>
          </Text>
        </View>
      </View>
    );
  };

  const renderOutlineSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Outline</Text>
      <View style={styles.fontColorContainer}>
        <TouchableOpacity
          style={[styles.fontColorButton, outlineEnabled && styles.fontColorButtonActive]}
          onPress={() => setOutlineEnabled(!outlineEnabled)}
        >
          <Text style={[styles.fontColorButtonText, outlineEnabled && styles.fontColorButtonTextActive]}>
            {outlineEnabled ? 'On' : 'Off'}
          </Text>
        </TouchableOpacity>
      </View>
      {outlineEnabled && (
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.settingSubtitle, { color: '#F7F7F7', marginBottom: 8 }]}>Outline Color</Text>
          <View style={styles.fontColorContainer}>
            {[{ id: 'white', name: 'White', color: '#FFFFFF' }, { id: 'black', name: 'Black', color: '#000000' }].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.fontColorButton, outlineColor === option.id && styles.fontColorButtonActive]}
                onPress={() => setOutlineColor(option.id as 'white' | 'black')}
              >
                <View style={[styles.fontColorSwatch, { backgroundColor: option.color }]} />
                <Text
                  style={[styles.fontColorButtonText, outlineColor === option.id && styles.fontColorButtonTextActive, { color: option.color }]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Recommendation, gated by interaction like font color */}
          <Text style={{ color: '#7A7A7A', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
            Recommended for this background: <Text style={{ color: (backgroundStyle === 'white' || backgroundStyle === 'pink' || backgroundStyle === 'camel' || backgroundStyle === 'mintGreen' || backgroundStyle === 'orange' || backgroundStyle === 'raspberry' || backgroundStyle === 'sageGreen' || backgroundStyle === 'warmYellow') ? '#000000' : '#FFFFFF', fontWeight: 'bold' }}>{(backgroundStyle === 'white' || backgroundStyle === 'pink' || backgroundStyle === 'camel' || backgroundStyle === 'mintGreen' || backgroundStyle === 'orange' || backgroundStyle === 'raspberry' || backgroundStyle === 'sageGreen' || backgroundStyle === 'warmYellow') ? 'Black' : 'White'}</Text>
          </Text>
        </View>
      )}
    </View>
  );

  const renderFontColorSelector = () => {
    // Recommend font color based on backgroundStyle and theme
    let recommendedColor = 'white';
    if (backgroundStyle === 'pink' || backgroundStyle === 'white' || backgroundStyle === 'camel' || backgroundStyle === 'mintGreen' || backgroundStyle === 'orange' || backgroundStyle === 'raspberry' || backgroundStyle === 'sageGreen' || backgroundStyle === 'warmYellow') {
      recommendedColor = 'black';
    } else if (backgroundStyle === 'blue' || backgroundStyle === 'gray' || backgroundStyle === 'default') {
      recommendedColor = 'white';
    }
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
          Recommended for this background: <Text style={{ color: recommendedColor === 'white' ? '#FFFFFF' : '#000000', fontWeight: 'bold' }}>{recommendedColor.charAt(0).toUpperCase() + recommendedColor.slice(1)}</Text>
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
    <View style={[styles.section, { marginBottom: 0 }]}>
      <Text style={styles.sectionTitle}>Vertical Layout</Text>
      <View style={styles.layoutContainer}>
        {[
          { id: "top", name: "Top", icon: "arrow-up" },
          { id: "middle", name: "Middle", icon: "remove" },
          { id: "bottom", name: "Down", icon: "arrow-down" },
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
            {renderBackgroundSelector()}
            {renderOutlineSelector()}
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
    paddingTop: 60,
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
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C8D2E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#F7F7F7',
  },
  carouselContainer: {
    height: 120,
  },
  backgroundContent: {
    height: 120,
    marginTop: 10,
  },
  carousel: {
    flex: 1,
  },
  backgroundSlide: {
    flex: 1,
    paddingHorizontal: 8,
  },
  backgroundPreview: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C8D2E0',
    overflow: 'hidden',
  },
  backgroundColor: {
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(23, 47, 80, 0.8)',
    padding: 8,
    alignItems: 'center',
  },
  backgroundName: {
    fontFamily: 'MSemiBold',
    fontSize: RFValue(14),
    color: '#F7F7F7',
    textAlign: 'center',
  },

});

export default SettingsScreen; 