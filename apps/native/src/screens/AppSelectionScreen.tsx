import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import useAvailableApps, { AvailableApp } from '../hooks/useAvailableApps';

const SELECTED_APPS_KEY = 'SELECTED_APPS';

const AppSelectionScreen = ({ navigation }) => {
  const { apps, loading, error, refresh, launchApp } = useAvailableApps();
  const [searchText, setSearchText] = useState("");
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [isPersisting, setIsPersisting] = useState(false);

  // Convex mutations
  const upsertApp = useMutation(api.notes.upsertApp);
  const toggleAppSelection = useMutation(api.notes.toggleAppSelection);

  // Load existing user apps from Convex
  const existingUserApps = useQuery(api.notes.getAllUserApps) || [];

  // Load selected apps from AsyncStorage on mount (for backward compatibility)
  useEffect(() => {
    const loadSelectedApps = async () => {
      try {
        const stored = await AsyncStorage.getItem(SELECTED_APPS_KEY);
        if (stored) {
          const storedApps = new Set(JSON.parse(stored) as string[]);
          setSelectedApps(storedApps);
          
          // Migrate stored apps to Convex if they exist
          if (storedApps.size > 0) {
            for (const appId of storedApps) {
              const app = apps.find(a => a.id === appId);
              if (app) {
                await upsertApp({
                  appName: app.name,
                  packageName: app.packageName || app.name,
                  displayName: app.name,
                  isSelected: true,
                  order: 0,
                  urlScheme: app.urlScheme,
                  appStoreUrl: app.appStoreUrl,
                  isThirdParty: app.isThirdParty,
                });
              }
            }
            // Clear AsyncStorage after migration
            await AsyncStorage.removeItem(SELECTED_APPS_KEY);
          }
        }
      } catch (err) {
        console.error('Failed to load selected apps from storage', err);
      }
    };
    loadSelectedApps();
  }, [apps, upsertApp]);

  // Update selected apps state based on Convex data
  useEffect(() => {
    const selectedSet = new Set(
      existingUserApps
        .filter(app => app.isSelected)
        .map(app => app.packageName || app.appName) // Use packageName or fallback to appName
    );
    setSelectedApps(selectedSet);
  }, [existingUserApps]);

  const handleToggle = async (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    // Use packageName as the identifier for consistency with backend
    const identifier = app.packageName || app.name;
    const isCurrentlySelected = selectedApps.has(identifier);

    setIsPersisting(true);
    try {
      // Update local state immediately for better UX
      setSelectedApps(prev => {
        const next = new Set(prev);
        if (isCurrentlySelected) {
          next.delete(identifier);
        } else {
          next.add(identifier);
        }
        return next;
      });

      // Save to Convex backend
      await upsertApp({
        appName: app.name,
        packageName: app.packageName || app.name,
        displayName: app.name,
        isSelected: !isCurrentlySelected,
        order: existingUserApps.length,
        urlScheme: app.urlScheme,
        appStoreUrl: app.appStoreUrl,
        isThirdParty: app.isThirdParty,
      });

      // Note: Widget reorganization will happen automatically when the user navigates back to HomeScreen
      // The HomeScreen has logic to auto-organize apps into widgets when needed
      console.log(`App ${app.name} ${isCurrentlySelected ? 'deselected' : 'selected'}. Widgets will be reorganized on navigation.`);
    } catch (err) {
      console.error('Failed to save app selection', err);
      // Revert local state on error
      setSelectedApps(prev => {
        const next = new Set(prev);
        if (isCurrentlySelected) {
          next.delete(identifier);
        } else {
          next.add(identifier);
        }
        return next;
      });
      Alert.alert("Error", "Failed to save app selection");
    } finally {
      setIsPersisting(false);
    }
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderAppItem = ({ item }: { item: AvailableApp }) => {
    const identifier = item.packageName || item.name;
    return (
      <View style={styles.appItem}>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{item.name}</Text>
          {item.category && <Text style={styles.appCategory}>{item.category}</Text>}
        </View>
        <Switch
          value={selectedApps.has(identifier)}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{ false: "#B3B3B3", true: "#172F50" }}
          thumbColor={selectedApps.has(identifier) ? "#E1E1E1" : "#F7F7F7"}
        />
      </View>
    );
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
        <Text style={styles.headerTitle}>Select Apps</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7A7A7A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#7A7A7A"
        />
      </View>

      {/* Apps List */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading apps...</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Error: {error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Available Apps ({filteredApps.length})
            </Text>
            <FlatList
              data={filteredApps}
              renderItem={renderAppItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.appsList}
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
    fontSize: RFValue(20),
    fontFamily: "MBold",
    color: "#172F50",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1E1E1",
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B3B3B3",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#172F50",
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#7A7A7A",
  },
  retryButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#172F50',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'MRegular',
    fontSize: RFValue(14),
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontFamily: "MBold",
    color: "#172F50",
    marginBottom: 8,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: RFValue(15),
    fontFamily: "MRegular",
    color: "#172F50",
  },
  appCategory: {
    fontSize: RFValue(12),
    color: "#7A7A7A",
    marginTop: 2,
  },
  appsList: {
    paddingBottom: 40,
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: RFValue(13),
    color: '#7A7A7A',
    textAlign: 'center',
  },
  persistingText: {
    fontSize: RFValue(12),
    color: '#B3B3B3',
    marginTop: 4,
  },
});

export default AppSelectionScreen; 