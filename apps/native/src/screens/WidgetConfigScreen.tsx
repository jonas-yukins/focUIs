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
  Platform,
  Modal,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { Sortable, SortableItem, SortableRenderItemProps } from "react-native-reanimated-dnd";
import PagerView from 'react-native-pager-view';
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';
import localStorageService, { LocalAppSelection, LocalWidgetConfig } from '../services/LocalStorageService';

const { width, height } = Dimensions.get("window");

interface App {
  _id: string;
  displayName: string;
  packageName?: string;
  urlScheme?: string;
  appStoreUrl?: string;
}

interface DraggableApp {
  id: string;
  app: App;
  order: number;
}

const WidgetConfigScreen = ({ navigation }) => {
  const backgroundUri = useBackgroundAsset();
  const [selectedApps, setSelectedApps] = useState<LocalAppSelection[]>([]);


  const [sections, setSections] = useState<DraggableApp[][]>([]);
  const sectionsRef = useRef<DraggableApp[][]>([]);
  sectionsRef.current = sections;



  const [currentPage, setCurrentPage] = useState(0);

  // --- Move To Section State ---
  const [moveMode, setMoveMode] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{ sectionIndex: number; appIndex: number } | null>(null);
  
  // --- Info Popup State ---
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // Load data from local storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const apps = await localStorageService.getSelectedApps();
        setSelectedApps(apps);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Initialize apps list
  useEffect(() => {
    if (selectedApps && selectedApps.length > 0) {
              const apps: DraggableApp[] = selectedApps
          .map((app, index) => ({
            id: app.appId,
            app: {
              _id: app.appId,
              displayName: app.displayName,
              packageName: app.packageName,
              urlScheme: app.urlScheme,
              appStoreUrl: app.appStoreUrl,
            },
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

  // Handler to update order only on drop
  const handleDrop = useCallback((sectionIndex: number, itemId: string, to: number) => {
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
        appId: app.id,
        newOrder: app.order,
      }));
      await localStorageService.updateAppOrders(appOrders);
      
      // --- Reorganize widgets after updating app order ---
      // Use the same chunking logic as in HomeScreen
      const appsPerWidget = 6;
      const widgets: LocalWidgetConfig[] = [];
      for (let i = 0; i < allApps.length; i += appsPerWidget) {
        const widgetApps = allApps.slice(i, i + appsPerWidget);
        const widgetId = `widget_${Math.floor(i / appsPerWidget) + 1}`;
        widgets.push({
          widgetId,
          appIds: widgetApps.map(app => app.id),
          order: Math.floor(i / appsPerWidget),
        });
      }
      await localStorageService.reorganizeWidgets(widgets);
      
              // Save apps to UserDefaults for widget access
        try {
          const widgetApps = allApps.map(app => ({
            id: app.id,
            displayName: app.app.displayName,
            packageName: app.app.packageName || '',
            urlScheme: app.app.urlScheme || null,
            appStoreUrl: app.app.appStoreUrl || null
          }));
        
        // Use AsyncStorage to save the apps data
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('selectedApps', JSON.stringify(widgetApps));
        
        // Also save to UserDefaults for iOS widget access using a simpler approach
        if (Platform.OS === 'ios') {
          try {
            const { SharedGroupPreferences } = require('react-native-shared-group-preferences');
            await SharedGroupPreferences.setItem('selectedApps', JSON.stringify(widgetApps), 'group.com.jonasyukins.focuis');
            console.log('Widget data saved successfully to SharedGroupPreferences');
          } catch (sharedGroupError) {
            console.log('SharedGroupPreferences failed, trying alternative method:', sharedGroupError);
            // Fallback: try to use a different approach or just log the data
            console.log('Widget apps data that should be saved:', JSON.stringify(widgetApps, null, 2));
          }
        }
      } catch (error) {
        console.error('Error saving widget data:', error);
      }
      
      Alert.alert("Success", "App order saved successfully!");
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save app order:', error);
      Alert.alert("Error", "Failed to save app order");
    }
  };

  const renderAppItem = useCallback((sectionIndex: number) => (props: SortableRenderItemProps<DraggableApp>) => {
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
          <View style={styles.headerButton}>
            <TouchableOpacity
              onPress={selectedApps.length > 0 ? saveAppOrder : undefined}
              accessibilityLabel="Save app order"
              accessibilityRole="button"
              disabled={selectedApps.length === 0}
            >
              <Ionicons 
                name="checkmark" 
                size={26} 
                color={selectedApps.length > 0 ? "#28A745" : "transparent"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Pager for Sections */}
        <View style={styles.dragDropContainer}>
          {selectedApps.length === 0 ? (
            <View style={[styles.emptyStateContainer, { paddingBottom: 100 }]}>
              <Ionicons name="apps-outline" size={64} color="#B3B3B3" style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>No Apps Selected</Text>
              <Text style={styles.emptyStateSubtitle}>
                Go back and select some apps to configure them here
              </Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <PagerView
                style={{ flex: 1 }}
                initialPage={0}
                onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
              >
                {sections.map((section, sectionIndex) => (
                  <View key={sectionIndex} style={{ flex: 1, backgroundColor: "transparent" }}>
                    <View style={styles.widgetTitleContainer}>
                      <Text style={styles.dragDropTitle}>
                        Section {sectionIndex + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowInfoPopup(true)}
                        style={styles.infoButton}
                      >
                        <View style={styles.infoIconContainer}>
                          <Ionicons name="information-circle-outline" size={20} color="#7A7A7A" />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <Sortable
                      data={section}
                      renderItem={renderAppItem(sectionIndex)}
                      itemHeight={80}
                      style={styles.sortableList}
                      contentContainerStyle={styles.sortableListContent}
                      itemKeyExtractor={(item) => item.id}
                    >
                      {/* In the PagerView section, when rendering each Sortable, pass fontSize={widgetFontSize} to the widget preview component (focUIsWidget or WidgetPreview) if used.
                      If you use a custom preview, pass fontSize={widgetFontSize} to the Text displaying app names. */}
                    </Sortable>
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
            </>
          )}
        </View>
        {/* Instructions Section */}
        {selectedApps.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48, alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(23, 47, 80, 0.92)', borderRadius: 16, padding: 16, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ color: '#F7F7F7', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                Drag the right icon to reorder. Tap the switch to swap. Press ✓ to save.
              </Text>
            </View>
          </View>
        )}
        
        {/* Info Popup Modal */}
        <Modal
          visible={showInfoPopup}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInfoPopup(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowInfoPopup(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="information-circle" size={24} color="#F7F7F7" />
                <Text style={styles.modalTitle}>App Sections</Text>
              </View>
              <Text style={styles.modalText}>
                Apps are organized into sections to fit within the home screen widget display. Each section can contain up to 6 apps.
              </Text>
              <Text style={styles.modalText}>
                To access a specific section on your home screen, add the corresponding widget to your device's home screen.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowInfoPopup(false)}
              >
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
  widgetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  dragDropTitle: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#7A7A7A",
    marginRight: 8,
  },
  infoButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
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
    backgroundColor: "transparent",
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
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
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: RFValue(24),
    fontFamily: "MBold",
    color: "#F7F7F7",
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#B3B3B3",
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: 'rgba(23, 47, 80, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6D8AAF',
  },
  emptyStateButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#F7F7F7",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(23, 47, 80, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#6D8AAF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontFamily: "MBold",
    color: "#F7F7F7",
    marginLeft: 8,
  },
  modalText: {
    fontSize: RFValue(14),
    fontFamily: "MRegular",
    color: "#C8D2E0",
    lineHeight: 20,
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#6D8AAF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: RFValue(16),
    fontFamily: "MSemiBold",
    color: "#F7F7F7",
  },
});

export default WidgetConfigScreen;