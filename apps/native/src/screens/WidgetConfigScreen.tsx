import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { FlatList } from "react-native";
import WidgetPreview from "../components/WidgetPreview";

const WidgetConfigScreen = ({ navigation }) => {
  const selectedApps = useQuery(api.notes.getUserApps) || [];
  const userWidgets = useQuery(api.notes.getUserWidgets) || [];
  
  const reorganizeWidgets = useMutation(api.notes.reorganizeWidgets);
  const upsertWidget = useMutation(api.notes.upsertWidget);

  const [availableApps, setAvailableApps] = useState([]);
  const [widgetConfigs, setWidgetConfigs] = useState([]);

  // Initialize widget configurations
  useEffect(() => {
    if (selectedApps.length > 0) {
      const appsPerWidget = 6;
      const widgets = [];
      
      for (let i = 0; i < selectedApps.length; i += appsPerWidget) {
        const widgetApps = selectedApps.slice(i, i + appsPerWidget);
        const widgetId = `widget_${Math.floor(i / appsPerWidget) + 1}`;
        
        widgets.push({
          widgetId,
          appIds: widgetApps.map(app => app._id),
          order: Math.floor(i / appsPerWidget),
        });
      }

      setWidgetConfigs(widgets);
      setAvailableApps(selectedApps);
    }
  }, [selectedApps]);

  const getAppsForWidget = (widgetId) => {
    const widget = widgetConfigs.find(w => w.widgetId === widgetId);
    if (!widget) return [];
    
    return availableApps.filter(app => 
      widget.appIds.includes(app._id)
    );
  };

  const moveAppToWidget = (appId, fromWidgetId, toWidgetId) => {
    const updatedConfigs = [...widgetConfigs];
    
    // Remove from source widget
    const fromWidget = updatedConfigs.find(w => w.widgetId === fromWidgetId);
    if (fromWidget) {
      fromWidget.appIds = fromWidget.appIds.filter(id => id !== appId);
    }
    
    // Add to target widget
    const toWidget = updatedConfigs.find(w => w.widgetId === toWidgetId);
    if (toWidget) {
      toWidget.appIds.push(appId);
    }
    
    setWidgetConfigs(updatedConfigs);
  };

  const saveWidgetConfigurations = async () => {
    try {
      await reorganizeWidgets({ widgets: widgetConfigs });
      Alert.alert("Success", "Widget configurations saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save widget configurations:', error);
      Alert.alert("Error", "Failed to save widget configurations");
    }
  };

  const renderWidgetItem = ({ item }) => {
    const widgetApps = getAppsForWidget(item.widgetId);
    
    return (
      <View style={styles.widgetContainer}>
        <WidgetPreview
          widgetId={item.widgetId}
          apps={widgetApps}
          onAppPress={() => {}} // No app launching in config mode
          isDragging={false}
        />
      </View>
    );
  };

  const handleWidgetReorder = ({ data }: { data: any[] }) => {
    const updatedWidgets = data.map((widget, index) => ({
      ...widget,
      order: index,
    }));
    
    setWidgetConfigs(updatedWidgets);
  };

  const renderAvailableApp = ({ item }) => (
    <TouchableOpacity
      style={styles.availableAppItem}
      onPress={() => {
        // Show widget selection dialog
        Alert.alert(
          "Move App",
          `Move "${item.displayName}" to which widget?`,
          widgetConfigs.map(widget => ({
            text: widget.widgetId.replace('_', ' ').toUpperCase(),
            onPress: () => {
              // Find current widget and move to new widget
              const currentWidget = widgetConfigs.find(w => 
                w.appIds.includes(item._id)
              );
              if (currentWidget) {
                moveAppToWidget(item._id, currentWidget.widgetId, widget.widgetId);
              }
            }
          })).concat([
            { text: "Cancel", onPress: () => {} }
          ])
        );
      }}
    >
      <Text style={styles.availableAppText}>{item.displayName}</Text>
      <Ionicons name="arrow-forward" size={16} color="#666666" />
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Configure Widgets</Text>
        <TouchableOpacity
          onPress={saveWidgetConfigurations}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>How to configure widgets:</Text>
          <Text style={styles.instructionsText}>
            • Long press widgets to reorder them
          </Text>
          <Text style={styles.instructionsText}>
            • Tap on apps in the "Available Apps" section to move them between widgets
          </Text>
          <Text style={styles.instructionsText}>
            • Each widget can display up to 6 apps
          </Text>
        </View>

        {/* Widget Previews */}
        {widgetConfigs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Widget Previews</Text>
            <FlatList
              data={widgetConfigs}
              keyExtractor={(item) => item.widgetId}
              renderItem={renderWidgetItem}
              contentContainerStyle={styles.widgetsList}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Available Apps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Apps</Text>
          <Text style={styles.sectionSubtitle}>
            Tap an app to move it to a different widget
          </Text>
          {availableApps.map((app) => renderAvailableApp({ item: app }))}
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
  saveButton: {
    backgroundColor: "#172F50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: RFValue(14),
    fontFamily: "MSemiBold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionsSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#666666",
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#666666",
    marginBottom: 12,
  },
  widgetsList: {
    paddingBottom: 20,
  },
  widgetContainer: {
    marginBottom: 10,
  },
  availableAppItem: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  availableAppText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#172F50",
  },
});

export default WidgetConfigScreen; 