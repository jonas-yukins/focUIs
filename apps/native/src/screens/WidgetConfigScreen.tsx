import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import DraggableFlatList, { 
  RenderItemParams, 
  ScaleDecorator 
} from "react-native-draggable-flatlist";

const WidgetConfigScreen = ({ navigation }) => {
  const selectedApps = useQuery(api.notes.getUserApps) || [];
  const userWidgets = useQuery(api.notes.getUserWidgets) || [];
  
  const reorganizeWidgets = useMutation(api.notes.reorganizeWidgets);
  const updateAppOrders = useMutation(api.notes.updateAppOrders);

  const [draggableItems, setDraggableItems] = useState([]);

  // Initialize draggable items with widget headers and apps
  useEffect(() => {
    if (selectedApps.length > 0) {
      const items = [];
      
      if (userWidgets.length > 0) {
        // Sort widgets by order
        const sortedWidgets = [...userWidgets].sort((a, b) => a.order - b.order);
        
        sortedWidgets.forEach((widget, widgetIndex) => {
          // Add widget header (unmovable)
          items.push({
            id: `header_${widget.widgetId}`,
            type: 'header',
            widgetId: widget.widgetId,
            title: `Widget ${widgetIndex + 1}`,
            order: widgetIndex,
          });
          
          // Add apps for this widget
          const widgetApps = selectedApps.filter(app => 
            widget.appIds.includes(app._id)
          );
          
          widgetApps.forEach((app, appIndex) => {
            items.push({
              id: app._id,
              type: 'app',
              app: app,
              widgetId: widget.widgetId,
              order: appIndex,
            });
          });
        });
      } else {
        // If no widgets exist, create a default widget with all apps
        items.push({
          id: 'header_widget_1',
          type: 'header',
          widgetId: 'widget_1',
          title: 'Widget 1',
          order: 0,
        });
        
        selectedApps.forEach((app, appIndex) => {
          items.push({
            id: app._id,
            type: 'app',
            app: app,
            widgetId: 'widget_1',
            order: appIndex,
          });
        });
      }
      
      setDraggableItems(items);
    }
  }, [selectedApps, userWidgets]);

  const handleDragEnd = ({ data, from, to }) => {
    setDraggableItems(data);
  };

  const saveWidgetConfigurations = async () => {
    try {
      // Reorganize widgets based on current draggable items
      const newWidgetConfigs = [];
      let currentWidget = null;
      
      draggableItems.forEach((item) => {
        if (item.type === 'header') {
          // Start a new widget
          currentWidget = {
            widgetId: item.widgetId,
            appIds: [],
            order: item.order,
          };
          newWidgetConfigs.push(currentWidget);
        } else if (item.type === 'app' && currentWidget) {
          // Add app to current widget
          currentWidget.appIds.push(item.app._id);
        }
      });
      
      await reorganizeWidgets({ widgets: newWidgetConfigs });
      
      // Update app orders in the database
      const appOrders = draggableItems
        .filter(item => item.type === 'app')
        .map((item, index) => ({
          appId: item.app._id,
          newOrder: index,
        }));
      
      if (appOrders.length > 0) {
        await updateAppOrders({ appOrders });
      }
      
      Alert.alert("Success", "Widget configurations saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save widget configurations:', error);
      Alert.alert("Error", "Failed to save widget configurations");
    }
  };

  const renderItem = ({ item, drag }: RenderItemParams<any>) => {
    if (item.type === 'header') {
      // Calculate app count for this widget
      const appCount = draggableItems.filter(i => i.type === 'app' && i.widgetId === item.widgetId).length;
      
      // Render unmovable widget header
      return (
        <View style={styles.headerItem}>
          <View style={styles.headerContent}>
            <Ionicons name="grid-outline" size={20} color="#172F50" />
            <Text style={styles.headerText}>{item.title}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {appCount} apps
            </Text>
          </View>
        </View>
      );
    } else {
      // Render draggable app item
      return (
        <ScaleDecorator>
          <View
            style={styles.appItem}
          >
            <View style={styles.appContent}>
              <View style={styles.appIcon}>
                <Ionicons name="phone-portrait-outline" size={24} color="#172F50" />
              </View>
              <Text style={styles.appText}>{item.app.displayName}</Text>
            </View>
            <TouchableOpacity
              onPressIn={drag}
              style={styles.dragHandle}
            >
              <Ionicons name="reorder-three" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </ScaleDecorator>
      );
    }
  };

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



      {/* Draggable List */}
      <DraggableFlatList
        data={draggableItems}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerItem: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginLeft: 8,
  },
  headerBadge: {
    backgroundColor: "#172F50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: RFValue(12),
    fontFamily: "MSemiBold",
    color: "#FFFFFF",
  },
  appItem: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  appContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#172F50",
    flex: 1,
  },
  dragHandle: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default WidgetConfigScreen; 