import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  ImageBackground,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api";
import { Id } from "../../../../packages/backend/convex/_generated/dataModel";
import { Sortable, SortableItem, SortableRenderItemProps } from "react-native-reanimated-dnd";
import PagerView from 'react-native-pager-view';
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';

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
  const backgroundUri = useBackgroundAsset();
  const selectedApps = useQuery(api.notes.getUserApps);
  // Add a loading state
  const isLoading = selectedApps === undefined;

  const [sections, setSections] = useState<DraggableApp[][]>([]);
  const sectionsRef = useRef<DraggableApp[][]>([]);
  sectionsRef.current = sections;

  // DEBUG: Log when the component renders and what sections contains
  console.log("[DEBUG] WidgetConfigScreen render. sections:", sections);
  const updateAppOrders = useMutation(api.notes.updateAppOrders);
  const reorganizeWidgets = useMutation(api.notes.reorganizeWidgets); // <-- Add this line

  const [currentPage, setCurrentPage] = useState(0);

  // --- Move To Section State ---
  const [moveMode, setMoveMode] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{ sectionIndex: number; appIndex: number } | null>(null);

  // Initialize apps list
  useEffect(() => {
    console.log("[DEBUG] selectedApps changed:", selectedApps);
    if (selectedApps && selectedApps.length > 0) {
      const apps: DraggableApp[] = selectedApps
        .map((app, index) => ({
          id: app._id,
          app,
          order: app.order || index,
        }))
        .sort((a, b) => a.order - b.order);

      console.log("[DEBUG] Mapped and sorted apps:", apps);

      const chunkedApps = [];
      const chunkSize = 6;
      for (let i = 0; i < apps.length; i += chunkSize) {
        chunkedApps.push(apps.slice(i, i + chunkSize));
      }
      console.log("[DEBUG] Chunked apps:", chunkedApps);
      setSections(chunkedApps);
    }
  }, [selectedApps]);

  // Handler to update order only on drop
  const handleDrop = useCallback((sectionIndex: number, itemId: string, to: number) => {
    console.log(`[DEBUG] handleDrop: sectionIndex=${sectionIndex}, itemId=${itemId}, to=${to}`);
    setSections(currentSections => {
      const newSections = [...currentSections];
      const section = [...newSections[sectionIndex]];
      const from = section.findIndex(app => app.id === itemId);
      if (from === -1 || from === to) return currentSections;
      const [movedApp] = section.splice(from, 1);
      section.splice(to, 0, movedApp);
      newSections[sectionIndex] = section;
      // Update order for all apps across all sections
      let order = 0;
      const updatedSections = newSections.map(sec =>
        sec.map(app => ({ ...app, order: order++ }))
      );
      return updatedSections;
    });
  }, []);

  // --- Move To Section Logic ---
  const handleMoveIconPress = (sectionIndex: number, appIndex: number) => {
    console.log(`[DEBUG] handleMoveIconPress: sectionIndex=${sectionIndex}, appIndex=${appIndex}`);
    // If already in move mode and this is the selected app, cancel
    if (moveMode && selectedApp && selectedApp.sectionIndex === sectionIndex && selectedApp.appIndex === appIndex) {
      setMoveMode(false);
      setSelectedApp(null);
      return;
    }
    setMoveMode(true);
    setSelectedApp({ sectionIndex, appIndex });
  };

  const handleAppPressForMove = (sectionIndex: number, appIndex: number) => {
    if (!moveMode || !selectedApp) return;
    // If user taps the selected app again, cancel move mode
    if (selectedApp.sectionIndex === sectionIndex && selectedApp.appIndex === appIndex) {
      setMoveMode(false);
      setSelectedApp(null);
      return;
    }
    // Only allow swap with apps in a different section
    if (selectedApp.sectionIndex !== sectionIndex) {
      setSections(currentSections => {
        const newSections = currentSections.map(section => [...section]);
        const fromSection = newSections[selectedApp.sectionIndex];
        const toSection = newSections[sectionIndex];
        const fromApp = fromSection[selectedApp.appIndex];
        const toApp = toSection[appIndex];
        // Swap the apps
        fromSection[selectedApp.appIndex] = toApp;
        toSection[appIndex] = fromApp;
        // Update order for all apps across all sections
        // Flatten, reassign order, then re-chunk
        const allApps = newSections.flat();
        const updatedApps = allApps.map((app, idx) => ({ ...app, order: idx }));
        const chunkSize = 6;
        const updatedSections: DraggableApp[][] = [];
        for (let i = 0; i < updatedApps.length; i += chunkSize) {
          updatedSections.push(updatedApps.slice(i, i + chunkSize));
        }
        return updatedSections;
      });
      setMoveMode(false);
      setSelectedApp(null);
    }
  };

  const saveAppOrder = async () => {
    try {
      const allApps = sections.flat();
      const appOrders = allApps.map(app => ({
        appId: app.id as Id<"userApps">,
        newOrder: app.order,
      }));
      await updateAppOrders({ appOrders });
      // --- Reorganize widgets after updating app order ---
      // Use the same chunking logic as in HomeScreen
      const appsPerWidget = 6;
      const widgets = [];
      for (let i = 0; i < allApps.length; i += appsPerWidget) {
        const widgetApps = allApps.slice(i, i + appsPerWidget);
        const widgetId = `widget_${Math.floor(i / appsPerWidget) + 1}`;
        widgets.push({
          widgetId,
          appIds: widgetApps.map(app => app.id),
          order: Math.floor(i / appsPerWidget),
        });
      }
      await reorganizeWidgets({ widgets });
      Alert.alert("Success", "App order saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save app order:', error);
      Alert.alert("Error", "Failed to save app order");
    }
  };

  const renderAppItem = useCallback((sectionIndex: number) => (props: SortableRenderItemProps<DraggableApp>) => {
    console.log(`[DEBUG] Rendering app item: sectionIndex=${sectionIndex}, appIndex=${props.index}, app=`, props.item);
    const {
      item,
      id,
      positions,
      lowerBound,
      autoScrollDirection,
      itemsCount,
      itemHeight,
      index: appIndex,
    } = props;
    // Determine if this app is selected for move
    const isSelected = moveMode && selectedApp && selectedApp.sectionIndex === sectionIndex && selectedApp.appIndex === appIndex;
    // Only show swap icon if not in move mode, or if this is the selected app
    const showSwapIcon = !moveMode || isSelected;
    // When in move mode, only allow pressing other apps in other sections
    const isPressableForMove = moveMode && selectedApp && selectedApp.sectionIndex !== sectionIndex;
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
        onDrop={(_id, to) => handleDrop(sectionIndex, _id, to)}
        style={[styles.taskItem, isSelected && styles.selectedTaskItem]}
      >
        <TouchableOpacity
          activeOpacity={isPressableForMove ? 0.7 : 1}
          onPress={isPressableForMove ? () => handleAppPressForMove(sectionIndex, appIndex) : undefined}
          style={{ flex: 1 }}
          disabled={!isPressableForMove}
        >
          <View style={styles.taskContent}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{item.app.displayName}</Text>
            </View>
            {showSwapIcon && (
              <TouchableOpacity
                onPress={() => handleMoveIconPress(sectionIndex, appIndex)}
                style={styles.swapIconButton}
                disabled={moveMode && !isSelected}
              >
                <Ionicons name="swap-horizontal" size={22} color="#4A90E2" />
              </TouchableOpacity>
            )}
            {/* Always render drag handle visually, but only make it functional when not in move mode */}
            {moveMode ? (
              <View style={styles.dragHandle}>
                <View style={styles.dragIconContainer}>
                  <View style={styles.dragColumn}>
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                  </View>
                  <View style={styles.dragColumn}>
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                  </View>
                </View>
              </View>
            ) : (
              <SortableItem.Handle style={styles.dragHandle}>
                <View style={styles.dragIconContainer}>
                  <View style={styles.dragColumn}>
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                  </View>
                  <View style={styles.dragColumn}>
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                    <View style={styles.dragDot} />
                  </View>
                </View>
              </SortableItem.Handle>
            )}
          </View>
        </TouchableOpacity>
      </SortableItem>
    );
  }, [handleDrop, moveMode, selectedApp]);

  if (isLoading) {
    console.log("[DEBUG] Still loading selectedApps...");
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#172F50' }}>
        <Text style={{ color: '#F7F7F7', fontSize: 18 }}>Loading apps...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Configure Apps</Text>
          <TouchableOpacity
            onPress={saveAppOrder}
            style={styles.headerButton}
            accessibilityLabel="Save app order"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark" size={26} color="#28A745" />
          </TouchableOpacity>
        </View>

        {/* Horizontal Pager for Sections */}
        <View style={styles.dragDropContainer}>
          <PagerView
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
          >
            {sections.map((section, sectionIndex) => (
              <View key={sectionIndex} style={{ flex: 1, backgroundColor: "transparent" }}>
                <Text style={styles.dragDropTitle}>
                  Screen {sectionIndex + 1}
                </Text>
                <Sortable
                  data={section}
                  renderItem={renderAppItem(sectionIndex)}
                  itemHeight={80}
                  style={styles.sortableList}
                  contentContainerStyle={styles.sortableListContent}
                  itemKeyExtractor={(item) => item.id}
                />
              </View>
            ))}
          </PagerView>
          {/* Page Indicator Dots */}
          <View style={styles.dotsContainer}>
            {sections.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  currentPage === idx ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
      {/* Instructions Section */}
      <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48, alignItems: 'center' }}>
        <View style={{ backgroundColor: 'rgba(23, 47, 80, 0.92)', borderRadius: 16, padding: 16, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ color: '#F7F7F7', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            Drag the right icon to reorder. Tap the switch to swap. Press ✓ to save.
          </Text>
        </View>
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
    width: 40,
  },
  headerButton: {
    padding: 8,
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
    backgroundColor: "transparent",
  },
  sortableListContent: {
    paddingBottom: 16,
  },
  taskItem: {
    height: 80,
    backgroundColor: "transparent",
  },
  selectedTaskItem: {
    borderWidth: 2,
    borderColor: "#4A90E2",
    backgroundColor: "#E6F0FA",
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  taskInfo: {
    flex: 1,
    paddingRight: 16,
  },
  taskTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
  },
  dragHandle: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  dragIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dragColumn: {
    flexDirection: "column",
    gap: 2,
  },
  dragDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#6D6D70",
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#172F50',
  },
  inactiveDot: {
    backgroundColor: '#B3B3B3',
  },
  swapIconButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WidgetConfigScreen;