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
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Add focUIs Widget</Text>
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
        "Choose widget 1",
        "Swipe to widget 1 (the main focUIs widget), then tap 'Add Widget'."
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
    </View>
  );

  const renderAndroidWidgetInstructions = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Add focUIs Widget</Text>
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
    </View>
  );

  const renderAppSelectionInstructions = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Choose Your Apps</Text>
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
    </View>
  );

  const renderWallpaperInstructions = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Change Your Wallpaper</Text>
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
    </View>
  );

  const renderOptionalSteps = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Optional: Hide Other Apps</Text>
      {Platform.OS === 'ios' ? (
        <>
          {renderStep(
            "1",
            "Long-press app icon",
            "Long-press any app icon you want to hide."
          )}
          {renderStep(
            "2",
            "Remove from home screen",
            "Tap 'Remove App' → 'Remove from Home Screen'."
          )}
        </>
      ) : (
        <>
          {renderStep(
            "1",
            "Long-press app",
            "Long-press any app you want to hide."
          )}
          {renderStep(
            "2",
            "Remove or hide",
            "Tap 'Remove' or 'Hide App' (option varies by launcher)."
          )}
        </>
      )}
    </View>
  );

  const renderBlockNotifications = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Optional: Block Notifications from Non-Essential Apps</Text>
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
      <Text style={{marginTop: 10, color: '#C8D2E0', fontFamily: 'MRegular', fontSize: RFValue(13)}}>
        This helps keep your device distraction-free by only allowing important notifications.
      </Text>
    </View>
  );

  const renderFocusModes = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Optional: Use Focus Modes</Text>
      {Platform.OS === 'ios' ? (
        <>
          {renderStep(
            "1",
            "Go to Screen Time",
            "Settings → Screen Time → App Limits."
          )}
          {renderStep(
            "2",
            "Set up Focus Mode",
            "Create a Focus Mode that only shows the focUIs screen."
          )}
        </>
      ) : (
        <>
          {renderStep(
            "1",
            "Digital Wellbeing",
            "Settings → Digital Wellbeing → Focus Mode."
          )}
          {renderStep(
            "2",
            "Consider minimal launcher",
            "Try launchers like Niagara or Ratio for full control."
          )}
        </>
      )}
    </View>
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

          {/* Optional Steps */}
          {renderOptionalSteps()}

          {/* Block Notifications */}
          {renderBlockNotifications()}

          {/* Focus Modes */}
          {renderFocusModes()}

          {/* Completion */}
          <View style={styles.completionSection}>
            <View style={styles.completionHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.completionTitle}>You're All Set!</Text>
            </View>
            <Text style={styles.completionText}>
              You've created a digital space that's minimal, focused, and free of distractions. 
              Return to the focUIs app anytime to update your selected apps or widget setup.
            </Text>
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
  completionSection: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
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
    color: "#2E7D32",
    marginLeft: 8,
  },
  completionText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#2E7D32",
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