import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";
import { Id } from "../../../../packages/backend/convex/_generated/dataModel";
import { Sortable, SortableItem, SortableRenderItemProps } from "react-native-reanimated-dnd";

const { width, height } = Dimensions.get("window");

interface App {
  _id: string;
  displayName: string;
  packageName?: string;
  urlScheme?: string;
}

interface DraggableApp {
  id: string;
  app: App;
  order: number;
}

const WidgetConfigScreen = ({ navigation }) => {
  const selectedApps = useQuery(api.notes.getUserApps) || [];
  const updateAppOrders = useMutation(api.notes.updateAppOrders);

  const [sections, setSections] = useState<DraggableApp[][]>([]);

  // Initialize apps list
  useEffect(() => {
    if (selectedApps.length > 0) {
      const apps: DraggableApp[] = selectedApps
        .map((app, index) => ({
          id: app._id,
          app,
          order: app.order || index,
        }))
        .sort((a, b) => a.order - b.order);

      const chunkedApps = [];
      const chunkSize = 6;
      for (let i = 0; i < apps.length; i += chunkSize) {
        chunkedApps.push(apps.slice(i, i + chunkSize));
      }
      setSections(chunkedApps);
    }
  }, [selectedApps]);

  const handleDragEnd = useCallback((sectionIndex: number, { from, to }: { from: number; to: number }) => {
    if (from === to) return;

    setSections(currentSections => {
      const newSections = [...currentSections];
      const section = [...newSections[sectionIndex]];
      const [movedApp] = section.splice(from, 1);
      section.splice(to, 0, movedApp);
      newSections[sectionIndex] = section;

      // Update order for all apps across all sections
      let order = 0;
      return newSections.map(sec => {
        return sec.map(app => {
          return { ...app, order: order++ };
        });
      });
    });
  }, []);

  const saveAppOrder = async () => {
    try {
      const allApps = sections.flat();
      const appOrders = allApps.map(app => ({
        appId: app.id as Id<"userApps">,
        newOrder: app.order,
      }));
      
      await updateAppOrders({ appOrders });
      
      Alert.alert("Success", "App order saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save app order:', error);
      Alert.alert("Error", "Failed to save app order");
    }
  };

  const renderAppItem = useCallback((props: SortableRenderItemProps<DraggableApp>) => {
    const {
      item,
      id,
      positions,
      lowerBound,
      autoScrollDirection,
      itemsCount,
      itemHeight,
    } = props;

    return (
      <SortableItem
        key={id}
        data={item}
        id={id}
        positions={positions}
        lowerBound={lowerBound}
        autoScrollDirection={autoScrollDirection}
        itemsCount={itemsCount}
        itemHeight={itemHeight}
        style={styles.sortableItem}
      >
        <View style={styles.appItem}>
          <View style={styles.appContent}>
            <View style={styles.appIcon}>
              <Ionicons name="phone-portrait-outline" size={24} color="#172F50" />
            </View>
            <Text style={styles.appText}>{item.app.displayName}</Text>
          </View>
          <View style={styles.dragHandle}>
            <Ionicons name="reorder-three" size={20} color="#666666" />
          </View>
        </View>
      </SortableItem>
    );
  }, []);

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
        <Text style={styles.headerTitle}>Configure Apps</Text>
        <TouchableOpacity
          onPress={saveAppOrder}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Drag and Drop List */}
      <View style={styles.dragDropContainer}>
        <ScrollView>
          {sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.sectionContainer}>
              <Text style={styles.dragDropTitle}>
                Screen {sectionIndex + 1}
              </Text>
              <Sortable
                data={section}
                renderItem={renderAppItem}
                itemHeight={68} // Updated to match actual item height (60 + 8 margin)
                onDragEnd={(result) => handleDragEnd(sectionIndex, result)}
                style={styles.sortableList}
                contentContainerStyle={styles.sortableListContent}
                itemKeyExtractor={(item) => item.id}
              />
            </View>
          ))}
        </ScrollView>
      </View>
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
  dragDropContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  dragDropTitle: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginBottom: 12,
  },
  sortableList: {
    flex: 1,
  },
  sortableListContent: {
    paddingBottom: 16,
  },
  sortableItem: {
    height: 68, // Updated to match itemHeight prop
    backgroundColor: "transparent",
  },
  appItem: {
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 8,
    height: 60,
  },
  appContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  appText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#172F50",
    flex: 1,
  },
  dragHandle: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#F0F0F0",
  },
});

export default WidgetConfigScreen;