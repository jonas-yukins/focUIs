import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { Sortable, SortableItem, SortableRenderItemProps } from "react-native-reanimated-dnd";

const { width, height } = Dimensions.get("window");

interface App {
  _id: string;
  displayName: string;
  packageName?: string;
  urlScheme?: string;
  order: number;
}

interface DraggableApp {
  id: string;
  app: App;
  order: number;
}

const AppOrderScreen = ({ navigation }) => {
  const selectedApps = useQuery(api.notes.getUserApps) || [];
  const updateAppOrders = useMutation(api.notes.updateAppOrders);

  const [allApps, setAllApps] = useState<DraggableApp[]>([]);

  // Initialize apps list
  useEffect(() => {
    console.log('Initializing apps for ordering:', { selectedApps: selectedApps.length });
    if (selectedApps.length > 0) {
      const apps: DraggableApp[] = selectedApps
        .filter(app => app.isSelected)
        .map((app, index) => ({
          id: app._id,
          app,
          order: app.order || index,
        }))
        .sort((a, b) => a.order - b.order);
      setAllApps(apps);
    }
  }, [selectedApps]);

  const handleDragEnd = useCallback(({ from, to }: { from: number; to: number }) => {
    if (from === to) return;

    setAllApps(currentApps => {
      const newApps = [...currentApps];
      const [movedApp] = newApps.splice(from, 1);
      newApps.splice(to, 0, movedApp);

      // Update order values
      return newApps.map((app, index) => ({
        ...app,
        order: index,
      }));
    });
  }, []);

  const saveAppOrder = async () => {
    try {
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
        <Text style={styles.headerTitle}>App Order</Text>
        <TouchableOpacity
          onPress={saveAppOrder}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {allApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Apps Selected</Text>
            <Text style={styles.emptyStateText}>
              Select some apps first to reorder them
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AppSelectionScreen")}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>Select Apps</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Drag to reorder your apps ({allApps.length})
            </Text>
            <Sortable
              data={allApps}
              renderItem={renderAppItem}
              itemKeyExtractor={(item) => item.id}
              itemHeight={80}
              onDragEnd={handleDragEnd}
              style={styles.sortableContainer}
            />
          </>
        )}
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
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#172F50",
  },
  saveButton: {
    backgroundColor: "#172F50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MMedium",
    color: "#E1E1E1",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginBottom: 16,
  },
  sortableContainer: {
    flex: 1,
  },
  sortableItem: {
    marginBottom: 8,
  },
  appItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appText: {
    fontSize: RFValue(16),
    fontFamily: "MMedium",
    color: "#172F50",
    flex: 1,
  },
  dragHandle: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#172F50",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#7A7A7A",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: "#172F50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MMedium",
    color: "#E1E1E1",
  },
});

export default AppOrderScreen; 