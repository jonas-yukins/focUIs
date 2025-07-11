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

const WidgetSetupScreen = ({ navigation }) => {
  const openWidgetSettings = () => {
    if (Platform.OS === 'ios') {
      // Open iOS widget settings
      Linking.openURL('App-Prefs:root=NOTIFICATION_ID&path=com.apple.preference.notifications');
    } else if (Platform.OS === 'android') {
      // Open Android widget settings
      Linking.openURL('android-app://com.android.settings/.widget.SettingsAppWidgetProviderActivity');
    }
  };

  const renderIOSInstructions = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>iOS Instructions</Text>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>1</Text>
        <Text style={styles.stepText}>Long press on your home screen</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>2</Text>
        <Text style={styles.stepText}>Tap the "+" button in the top left</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>3</Text>
                      <Text style={styles.stepText}>Search for "Plainphone"</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>4</Text>
        <Text style={styles.stepText}>Choose the medium widget size</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>5</Text>
        <Text style={styles.stepText}>Select which widget number you want</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>6</Text>
        <Text style={styles.stepText}>Tap "Add Widget"</Text>
      </View>
    </View>
  );

  const renderAndroidInstructions = () => (
    <View style={styles.instructionSection}>
      <Text style={styles.sectionTitle}>Android Instructions</Text>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>1</Text>
        <Text style={styles.stepText}>Long press on your home screen</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>2</Text>
        <Text style={styles.stepText}>Tap "Widgets"</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>3</Text>
                      <Text style={styles.stepText}>Find "Plainphone" in the widget list</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>4</Text>
        <Text style={styles.stepText}>Long press and drag to your home screen</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>5</Text>
        <Text style={styles.stepText}>Choose which widget number you want</Text>
      </View>
      <View style={styles.stepContainer}>
        <Text style={styles.stepNumber}>6</Text>
        <Text style={styles.stepText}>Release to place the widget</Text>
      </View>
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
        <Text style={styles.headerTitle}>Add Widget</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Ionicons name="phone-portrait-outline" size={48} color="#172F50" />
          <Text style={styles.introTitle}>Add Widget to Home Screen</Text>
          <Text style={styles.introText}>
            Follow the instructions below to add a Plainphone widget to your home screen. 
            The widget will display up to 6 of your selected apps for quick access.
          </Text>
        </View>

        {/* Platform-specific instructions */}
        {Platform.OS === 'ios' ? renderIOSInstructions() : renderAndroidInstructions()}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={20} color="#172F50" />
            <Text style={styles.tipText}>
              You can add multiple widgets to display more than 6 apps
            </Text>
          </View>
          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={20} color="#172F50" />
            <Text style={styles.tipText}>
              Tap on app names in the widget to launch them directly
            </Text>
          </View>
          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={20} color="#172F50" />
            <Text style={styles.tipText}>
              Use the app settings to organize which apps appear in each widget
            </Text>
          </View>
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
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#172F50",
    color: "#FFFFFF",
    fontSize: RFValue(14),
    fontFamily: "MBold",
    textAlign: "center",
    lineHeight: 28,
    marginRight: 12,
  },
  stepText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#333333",
    flex: 1,
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  tipText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#666666",
    flex: 1,
    marginLeft: 8,
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

export default WidgetSetupScreen; 