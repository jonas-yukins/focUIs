import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
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
      <Text style={styles.sectionTitle}>📱 Add Plainphone Widget</Text>
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
        "Search for Plainphone",
        "Scroll or search for 'Plainphone' in the widget list."
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
      <Text style={styles.sectionTitle}>📱 Add Plainphone Widget</Text>
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
        "Find Plainphone",
        "Find 'Plainphone' in the widget list and press and hold it."
      )}
      {renderStep(
        "4",
        "Drag to home screen",
        "Drag the Plainphone widget to your home screen and release."
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
      <Text style={styles.sectionTitle}>🎯 Choose Your Apps</Text>
      {renderStep(
        "1",
        "Open Plainphone app",
        "Launch the Plainphone app on your device."
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
      <Text style={styles.sectionTitle}>🖼️ Change Your Wallpaper</Text>
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
            "Select a solid color or use a Plainphone wallpaper."
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
            "Choose a plain color or Plainphone background."
          )}
          {renderStep(
            "3",
            "Apply to home screen",
            "Apply it to the home screen only."
          )}
        </>
      )}
      <View style={styles.colorSection}>
        <Text style={styles.colorTitle}>🎨 Suggested Colors:</Text>
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
      <Text style={styles.sectionTitle}>🚫 Optional: Hide Other Apps</Text>
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

  const renderFocusModes = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>⏳ Optional: Use Focus Modes</Text>
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
            "Create a Focus Mode that only shows the Plainphone screen."
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#172F50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup Guide</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Ionicons name="phone-portrait-outline" size={48} color="#172F50" />
          <Text style={styles.introTitle}>Transform Your Smartphone</Text>
          <Text style={styles.introText}>
            Follow this guide to create a minimalist, distraction-free experience with Plainphone.
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
            Return to the Plainphone app anytime to update your selected apps or widget setup.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            onPress={openWidgetSettings}
            style={styles.primaryButton}
          >
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Open Widget Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate("HomeScreen")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  introTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#172F50",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  introText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
  },
  instructionSection: {
    marginBottom: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginBottom: 16,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#172F50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: RFValue(14),
    fontFamily: "MBold",
  },
  stepIcon: {
    marginRight: 8,
  },
  stepTitle: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#172F50",
    flex: 1,
  },
  stepDescription: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#666666",
    lineHeight: 20,
    marginLeft: 40,
  },
  colorSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E1E1E1",
  },
  colorTitle: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  colorText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#666666",
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
});

export default SetupScreen; 