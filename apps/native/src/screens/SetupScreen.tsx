import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  ImageBackground,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";

const SetupScreen = ({ navigation }) => {
  const openWidgetSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=NOTIFICATION_ID&path=com.apple.preference.notifications');
    } else if (Platform.OS === 'android') {
      Linking.openURL('android-app://com.android.settings/.widget.SettingsAppWidgetProviderActivity');
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
        "Long-press your home screen",
        "Press and hold anywhere on your home screen until the icons start jiggling."
      )}
      {renderStep(
        "2",
        "Tap the '+' button",
        "Tap the '+' button in the top-left corner of the screen."
      )}
      {renderStep(
        "3",
        "Search for focUIs",
        "Scroll or search for 'focUIs' in the widget list."
      )}
      {renderStep(
        "4",
        "Choose widget size",
        "Select a widget size (small, medium, or large) that fits your needs."
      )}
      {renderStep(
        "5",
        "Add and place widget",
        "Tap 'Add Widget', then place it where you want on your home screen."
      )}
      {renderStep(
        "6",
        "Finish setup",
        "Tap 'Done' in the top-right corner to complete the setup."
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
        </>
      )}
      <View style={styles.colorSection}>
        <Text style={styles.colorTitle}>Suggested Colors:</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: '#E1E1E1' }]} />
          <Text style={styles.colorText}>#E1E1E1 – Light Gray</Text>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: '#172F50' }]} />
          <Text style={styles.colorText}>#172F50 – Deep Navy</Text>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorSwatch, { backgroundColor: '#F7F7F7' }]} />
          <Text style={styles.colorText}>#F7F7F7 – Extra Light Gray</Text>
        </View>
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
      source={require("../../assets/background_gradient.png")}
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
  colorSection: {
    marginTop: 10,
  },
  colorTitle: {
    fontFamily: 'MSemiBold',
    fontSize: RFValue(14),
    color: '#F7F7F7',
    marginBottom: 6,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#B3B3B3',
  },
  colorText: {
    fontFamily: 'MRegular',
    fontSize: RFValue(13),
    color: '#C8D2E0',
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