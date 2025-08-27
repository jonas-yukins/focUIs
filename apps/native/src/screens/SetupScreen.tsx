import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  ImageBackground,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import PagerView from 'react-native-pager-view';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <View style={styles.instructionSection}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.sectionHeaderTouchable}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
          <View style={styles.chevronContainer}>
            <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#666666" />
          </View>
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const SetupScreen = ({ navigation }) => {
  const backgroundUri = useBackgroundAsset();
  const [currentWallpaperIndex, setCurrentWallpaperIndex] = useState(0);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({ writeOnly: true });
  
  // Wallpaper options with actual images
  const wallpapers = [
    {
      id: 1,
      name: "Light Pink",
      type: "image",
      image: require('../../assets/wallpapers/light_pink_wallpaper.jpg')
    },
    {
      id: 2,
      name: "Black",
      type: "image", 
      image: require('../../assets/wallpapers/black_wallpaper.jpg')
    },
    {
      id: 3,
      name: "White",
      type: "image",
      image: require('../../assets/wallpapers/white_wallpaper.jpg')
    },
    {
      id: 4,
      name: "Dark Gray",
      type: "image",
      image: require('../../assets/wallpapers/dark_gray_wallpaper.jpg')
    }
  ];
  
  const openWidgetSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=NOTIFICATION_ID&path=com.apple.preference.notifications');
    } else if (Platform.OS === 'android') {
      Linking.openURL('android-app://com.android.settings/.widget.SettingsAppProviderActivity');
    }
  };

  const saveWallpaperToPhotos = async () => {
    try {
      // Check and request write-only permissions
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
        return;
      }
      
      const selectedWallpaper = wallpapers[currentWallpaperIndex];
      
      // Use Asset module to download the asset to cache directory
      const asset = Asset.fromModule(selectedWallpaper.image);
      await asset.downloadAsync();
      
      // Save to media library using the downloaded asset URI
      const savedAsset = await MediaLibrary.saveToLibraryAsync(asset.localUri);
      
      Alert.alert(
        'Success!',
        `${selectedWallpaper.name} wallpaper has been saved to your photo library.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error saving wallpaper:', error);
      Alert.alert(
        'Error',
        'Failed to save wallpaper. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const openIosSettings = async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const candidates = [
        'App-prefs://',
        'app-settings:'
      ];
      for (const candidate of candidates) {
        const can = await Linking.canOpenURL(candidate);
        if (can) {
          await Linking.openURL(candidate);
          return;
        }
      }
      Alert.alert('Unavailable', 'Unable to open Settings. Please navigate there manually.');
    } catch (e) {
      Alert.alert('Unavailable', 'Unable to open Settings. Please navigate there manually.');
    }
  };

  const SettingsButton = ({ label = 'Open Settings' }) => (
    Platform.OS === 'ios' ? (
      <TouchableOpacity
        onPress={openIosSettings}
        style={styles.settingsButton}
      >
        <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
        <Text style={styles.settingsButtonText}>{label}</Text>
      </TouchableOpacity>
    ) : null
  );

  const renderStep = (number, title, description, icon = null) => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumber}>{number}</Text>
        </View>
        {icon && <Ionicons name={icon} size={20} color="#172F50" style={styles.stepIcon} />}
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  );

  const renderIOSWidgetInstructions = () => (
    <CollapsibleSection title="Add focUIs Widget">
      {renderStep(
        "1",
        "Open the app widget screen",
        "Long-press on home screen, then tap the edit button in the top left corner."
      )}
      {renderStep(
        "2",
        "Select add widget",
        "Tap the '+' button to add a new widget to your home screen."
      )}
      {renderStep(
        "3",
        "Find focUIs widget",
        "Scroll down or search for 'focUIs' in the widget list, then select it."
      )}
      {renderStep(
        "4",
        "Choose widget",
        "Swipe to desired widget section, then tap 'Add Widget'."
      )}
      {renderStep(
        "5",
        "Widget is now active",
        "The focUIs widget will now appear on your home screen and start working."
      )}
      {renderStep(
        "6",
        "Hide widget titles",
        "Long-press on the home screen, tap 'Edit', then tap 'Customize'."
      )}
      {renderStep(
        "7",
        "Select large size",
        "Choose 'Large' size to hide all widget titles for a cleaner look."
      )}
    </CollapsibleSection>
  );

  const renderAndroidWidgetInstructions = () => (
    <CollapsibleSection title="Add focUIs Widget">
      {renderStep(
        "1",
        "Long-press home screen",
        "Press and hold on an empty space on your home screen."
      )}
      {renderStep(
        "2",
        "Select Widgets",
        "Tap 'Widgets' from the pop-up menu that appears."
      )}
      {renderStep(
        "3",
        "Find focUIs",
        "Find 'focUIs' in the widget list and press and hold it."
      )}
      {renderStep(
        "4",
        "Drag to home screen",
        "Drag the focUIs widget to your home screen and release."
      )}
      {renderStep(
        "5",
        "Resize if needed",
        "Adjust the widget size if needed by dragging the corners."
      )}
    </CollapsibleSection>
  );

  const renderAppSelectionInstructions = () => (
    <CollapsibleSection title="Choose Your Apps">
      {renderStep(
        "1",
        "Open focUIs app",
        "Launch the focUIs app on your device."
      )}
      {renderStep(
        "2",
        "Navigate to Apps tab",
        "Go to the 'Apps' or 'Home View' tab in the app."
      )}
      {renderStep(
        "3",
        "Select your apps",
        Platform.OS === 'ios' 
          ? "Pick from our curated list of popular apps."
          : "Choose from your actual installed apps (auto-detected)."
      )}
      {renderStep(
        "4",
        "Apps appear in widget",
        "Your selected apps will automatically appear in the widget and home view."
      )}
    </CollapsibleSection>
  );

  const renderWallpaperInstructions = () => (
    <CollapsibleSection title="Change Your Wallpaper">
      {Platform.OS === 'ios' ? (
        <>
          {renderStep(
            "1",
            "Go to Settings",
            "Open Settings → Wallpaper → Add New Wallpaper."
          )}
          {renderStep(
            "2",
            "Choose background",
            "Select a solid color or use a focUIs wallpaper."
          )}
          {renderStep(
            "3",
            "Apply to home screen",
            "Tap 'Set as Home Screen Only' to apply."
          )}
          {renderStep(
            "4",
            "Customize home screen",
            "Select 'Customize Home Screen' and set blur to off."
          )}
        </>
      ) : (
        <>
          {renderStep(
            "1",
            "Long-press home screen",
            "Long-press the home screen → Wallpaper & Style."
          )}
          {renderStep(
            "2",
            "Select background",
            "Choose a plain color or focUIs background."
          )}
          {renderStep(
            "3",
            "Apply to home screen",
            "Apply it to the home screen only."
          )}
          {renderStep(
            "4",
            "Customize home screen",
            "Select 'Customize Home Screen' and set blur to off."
          )}
        </>
      )}
      {Platform.OS === 'ios' && (
        <View style={styles.settingsButtonWrapperCentered}>
          <SettingsButton label="Open Settings" />
        </View>
      )}
      <View style={styles.wallpaperSection}>
        <Text style={styles.wallpaperTitle}>Choose Your Wallpaper:</Text>
        <View style={styles.carouselContainer}>
          <PagerView
            style={styles.carousel}
            initialPage={0}
            onPageSelected={(e) => setCurrentWallpaperIndex(e.nativeEvent.position)}
          >
            {wallpapers.map((wallpaper, index) => (
              <View key={wallpaper.id} style={styles.wallpaperSlide}>
                <View style={styles.wallpaperPreview}>
                  <Image 
                    source={wallpaper.image} 
                    style={styles.wallpaperImage}
                    resizeMode="cover"
                  />
                  <View style={styles.wallpaperOverlay}>
                    <Text style={styles.wallpaperName}>{wallpaper.name}</Text>
                  </View>
                </View>
              </View>
            ))}
          </PagerView>
          <View style={styles.dotContainer}>
            {wallpapers.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentWallpaperIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveWallpaperToPhotos}
        >
          <Ionicons 
            name="download-outline" 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.saveButtonText}>Save Wallpaper</Text>
        </TouchableOpacity>
      </View>
    </CollapsibleSection>
  );

  const renderDarkModeInstructions = () => (
    <CollapsibleSection title="Enable Dark Mode">
      {Platform.OS === 'ios' ? (
        <>
          {renderStep(
            "1",
            "Open Display & Brightness",
            "Go to Settings → Display & Brightness."
          )}
          {renderStep(
            "2",
            "Select Dark and turn off Automatic",
            "Choose 'Dark' under Appearance, then switch 'Automatic' off."
          )}
        </>
      ) : (
        <>
          {renderStep(
            "1",
            "Open Display settings",
            "Go to Settings → Display."
          )}
          {renderStep(
            "2",
            "Enable Dark theme and disable scheduling",
            "Turn on 'Dark theme' and set 'Schedule' to off."
          )}
        </>
      )}
      {Platform.OS === 'ios' && (
        <SettingsButton label="Open Settings" />
      )}
    </CollapsibleSection>
  );

  const renderReduceAnimationsInstructions = () => (
    <CollapsibleSection title="Optional: Reduce Animations" defaultOpen={false}>
      {Platform.OS === 'ios' ? (
        <>
          {renderStep(
            "1",
            "Open Accessibility",
            "Go to Settings → Accessibility."
          )}
          {renderStep(
            "2",
            "Open Per‑App Settings",
            "Tap 'Per‑App Settings'."
          )}
          {renderStep(
            "3",
            "Add app",
            "Tap 'Add App'."
          )}
          {renderStep(
            "4",
            "Choose Home Screen & App Library",
            "Select 'Home Screen & App Library'."
          )}
          {renderStep(
            "5",
            "Set Reduce Motion",
            "Tap 'Home Screen & App Library' again, then tap 'Reduce Motion'."
          )}
          {renderStep(
            "6",
            "Turn it on",
            "Set 'Reduce Motion' to 'On'."
          )}
        </>
      ) : (
        <>
          {renderStep(
            "1",
            "Open Accessibility",
            "Go to Settings → Accessibility."
          )}
          {renderStep(
            "2",
            "Reduce animations",
            "Tap 'Reduce animations' (or 'Remove animations') and turn it on."
          )}
        </>
      )}
      {Platform.OS === 'ios' && (
        <SettingsButton label="Open Settings" />
      )}
    </CollapsibleSection>
  );

  const renderMinimizeHomescreenInstructions = () => (
    <CollapsibleSection title="Minimize Homescreen">
      {renderStep(
        "1",
        "Enter edit (jiggle) mode",
        "Long-press the Home Screen, then tap the row of dots."
      )}
      {renderStep(
        "2",
        "Hide extra pages",
        "Uncheck all other Home Screens to hide them."
      )}
      {renderStep(
        "3",
        "Clear the page",
        "Remove all apps from the current Home Screen and dock."
      )}
      {renderStep(
        "4",
        "Add focUIs Spacer widget",
        "Add the focUIs Spacer widget to help center the main widget."
      )}
      {renderStep(
        "5",
        "Position the spacer",
        "Ensure the Spacer widget sits above the main focUIs widget."
      )}
      {renderStep(
        "6",
        "Quick access",
        "Add focUIs to the dock for easy access to more apps."
      )}
      {renderStep(
        "7",
        "Customize the icon",
        "You can adjust the focUIs app icon in Settings → focUIs."
      )}
    </CollapsibleSection>
  );

  const renderScrollableListInstructions = () => (
    <CollapsibleSection title="Optional: Scrollable List" defaultOpen={false}>
      <Text style={{marginTop: 10, marginBottom: 15, color: '#C8D2E0', fontFamily: 'MRegular', fontSize: RFValue(13)}}>
        If you have many apps, you can stack widgets to make the list scrollable.
      </Text>
      {Platform.OS === 'ios' ? (
        <>
          {renderStep(
            "1",
            "Open the add widget screen",
            "Long-press the Home Screen, then tap Edit or the '+' in the top‑left."
          )}
          {renderStep(
            "2",
            "Find focUIs",
            "Scroll down or search for 'focUIs'."
          )}
          {renderStep(
            "3",
            "Create a stack",
            "Swipe to your desired widget, then press‑and‑drag it onto the existing focUIs widget."
          )}
          {renderStep(
            "4",
            "Disable Smart Rotate and suggestions",
            "Turn off 'Smart Rotate' and 'Widget Suggestions'."
          )}
          {renderStep(
            "5",
            "Use the stack",
            "Swipe up or down on the widget stack to move between sections."
          )}
        </>
      ) : (
        <>
          {renderStep(
            "1",
            "Note on Android",
            "Stacked widgets may not be supported on your launcher. Try a launcher that supports stacking or use multiple pages."
          )}
        </>
      )}
    </CollapsibleSection>
  );

  const renderBlockNotifications = () => (
    <CollapsibleSection title="Optional: Block Notifications" defaultOpen={false}>
      <Text style={{marginTop: 10, marginBottom: 15, color: '#C8D2E0', fontFamily: 'MRegular', fontSize: RFValue(13)}}>
        This helps keep your device distraction-free by only allowing important notifications.
      </Text>
      {Platform.OS === 'ios' ? (
        <>
          {renderStep(
            "1",
            "Go to Settings",
            "Open Settings → Notifications."
          )}
          {renderStep(
            "2",
            "Select an app",
            "Tap on any non-essential app you want to silence."
          )}
          {renderStep(
            "3",
            "Turn off notifications",
            "Toggle 'Allow Notifications' off for that app."
          )}
          <SettingsButton label="Open Settings" />
        </>
      ) : (
        <>
          {renderStep(
            "1",
            "Go to Settings",
            "Open Settings → Apps & notifications → See all apps."
          )}
          {renderStep(
            "2",
            "Select an app",
            "Tap on any non-essential app you want to silence."
          )}
          {renderStep(
            "3",
            "Block notifications",
            "Tap 'Notifications' and turn off 'All notifications' for that app."
          )}
        </>
      )}
    </CollapsibleSection>
  );

  

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header (moved outside ScrollView for full width and correct height) */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={24} color="#F7F7F7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Guide</Text>
          <View style={styles.headerButtons} />
        </View>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.introSection}>
            <Ionicons name="phone-portrait-outline" size={48} style={styles.introIcon} />
            <Text style={styles.introTitle}>Transform Your Smartphone</Text>
            <Text style={styles.introText}>
              Follow this guide to create a minimalist, distraction-free experience with focUIs.
            </Text>
          </View>

          {/* Widget Instructions */}
          {Platform.OS === 'ios' ? renderIOSWidgetInstructions() : renderAndroidWidgetInstructions()}

          {/* App Selection */}
          {renderAppSelectionInstructions()}

          {/* Wallpaper Instructions */}
          {renderWallpaperInstructions()}

          {/* Dark Mode Instructions */}
          {renderDarkModeInstructions()}

          {/* Minimize Homescreen */}
          {renderMinimizeHomescreenInstructions()}

          {/* Optional: Scrollable List */}
          {renderScrollableListInstructions()}

          {/* Reduce Animations (Optional) */}
          {renderReduceAnimationsInstructions()}

          {/* Block Notifications */}
          {renderBlockNotifications()}

          

          {/* Completion */}
          <View style={styles.completionSection}>
            <View style={styles.completionHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.completionTitle}>You're All Set!</Text>
            </View>
            <Text style={styles.completionText}>
              You've created a digital space that's minimal, focused, and free of distractions.
            </Text>
            <Text style={[styles.completionText, { marginTop: 20 }]}>
              Return to the focUIs app anytime to update your selected apps or widget setup.
            </Text>
          </View>

          {/* Back to Home Button */}
          <View style={styles.backToHomeContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backToHomeButton}
            >
              <Text style={styles.backToHomeButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          {/* Removed actionSection with Open Widget Settings and Back to Home buttons */}
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
    width: 40, // Ensures the title is centered
  },
  headerButton: {
    padding: 8,
  },
  introSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  introIcon: {
    marginBottom: 12,
    color: '#F7F7F7', // White icon
  },
  introTitle: {
    fontSize: RFValue(22),
    fontFamily: 'MBold',
    color: '#F7F7F7',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  instructionSection: {
    backgroundColor: 'rgba(23, 47, 80, 0.7)',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontFamily: 'MBold',
    color: '#F7F7F7',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: RFValue(18),
    fontFamily: 'MBold',
    color: '#F7F7F7',
    flex: 1,
  },
  sectionHeaderTouchable: {
    paddingVertical: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionContent: {
    marginTop: 8,
  },
  stepContainer: {
    marginBottom: 18,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#172F50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumber: {
    color: '#F7F7F7',
    fontFamily: 'MBold',
    fontSize: RFValue(14),
  },
  stepIcon: {
    marginRight: 8,
    color: '#C8D2E0',
  },
  stepTitle: {
    fontFamily: 'MSemiBold',
    fontSize: RFValue(15),
    color: '#F7F7F7',
  },
  stepDescription: {
    fontFamily: 'MRegular',
    fontSize: RFValue(14),
    color: '#C8D2E0',
    marginLeft: 38,
    marginBottom: 2,
  },
  wallpaperSection: {
    marginTop: 16,
  },
  settingsButtonWrapperCentered: {
    marginTop: 2,
    marginBottom: 8,
    alignItems: 'center',
  },
  wallpaperTitle: {
    fontFamily: 'MSemiBold',
    fontSize: RFValue(14),
    color: '#F7F7F7',
    marginBottom: 12,
  },
  carouselContainer: {
    height: 120,
    marginBottom: 16,
  },
  carousel: {
    flex: 1,
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
  wallpaperSlide: {
    flex: 1,
    paddingHorizontal: 8,
  },
  wallpaperPreview: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C8D2E0',
    overflow: 'hidden',
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
  },
  wallpaperOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(23, 47, 80, 0.8)',
    padding: 8,
    alignItems: 'center',
  },

  wallpaperName: {
    fontFamily: 'MSemiBold',
    fontSize: RFValue(14),
    color: '#F7F7F7',
    textAlign: 'center',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#172F50',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  settingsButtonText: {
    fontFamily: 'MSemiBold',
    fontSize: RFValue(13),
    color: '#FFFFFF',
    marginLeft: 6,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#172F50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  saveButtonText: {
    fontFamily: 'MSemiBold',
    fontSize: RFValue(14),
    color: '#FFFFFF',
    marginLeft: 8,
  },
  backToHomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  backToHomeButton: {
    backgroundColor: 'rgba(23, 47, 80, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6D8AAF',
  },
  backToHomeButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#F7F7F7",
  },
  completionSection: {
    backgroundColor: 'rgba(23, 47, 80, 0.7)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: RFValue(20),
    fontFamily: "MBold",
    color: "#F7F7F7",
    marginLeft: 8,
  },
  completionText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#C8D2E0",
    textAlign: "center",
    lineHeight: 20,
  },
  actionSection: {
    paddingBottom: 30,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#172F50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#172F50",
  },
  secondaryButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#172F50",
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
});

export default SetupScreen; 