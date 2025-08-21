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
  ImageBackground,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import useAvailableApps, { AvailableApp } from '../hooks/useAvailableApps';
import { useBackgroundAsset } from '../assets/BackgroundAssetContext';
import localStorageService, { LocalAppSelection } from '../services/LocalStorageService';

const AppSelectionScreen = ({ navigation }) => {
  const backgroundUri = useBackgroundAsset();
  const { apps, loading, error, refresh, launchApp } = useAvailableApps();
  const [searchText, setSearchText] = useState("");
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [isPersisting, setIsPersisting] = useState(false);

  // Load selected apps from local storage on mount
  useEffect(() => {
    const loadSelectedApps = async () => {
      try {
        // Clean up legacy data first
        await localStorageService.cleanupLegacyData();
        
        const storedApps = await localStorageService.getSelectedApps();
        const selectedSet = new Set(storedApps.map(app => app.appId));
        setSelectedApps(selectedSet);
      } catch (err) {
        console.error('Failed to load selected apps from storage', err);
      }
    };
    loadSelectedApps();
  }, []);

  const handleToggle = async (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const isCurrentlySelected = selectedApps.has(appId);

    setIsPersisting(true);
    try {
      // Update local state immediately for better UX
      setSelectedApps(prev => {
        const next = new Set(prev);
        if (isCurrentlySelected) {
          next.delete(appId);
        } else {
          next.add(appId);
        }
        return next;
      });

      // Save to local storage
      await localStorageService.toggleAppSelection(appId, {
        appId: app.id,
        displayName: app.name,
        packageName: app.packageName,
        urlScheme: app.urlScheme,
        appStoreUrl: app.appStoreUrl,
        isThirdParty: app.isThirdParty,
      });
      
    } catch (err) {
      console.error('Failed to save app selection', err);
      // Revert local state on error
      setSelectedApps(prev => {
        const next = new Set(prev);
        if (isCurrentlySelected) {
          next.delete(appId);
        } else {
          next.add(appId);
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
    return (
      <View style={styles.appItem}>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{item.name}</Text>
          {item.category && <Text style={styles.appCategory}>{item.category}</Text>}
        </View>
        <Switch
          value={selectedApps.has(item.id)}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{ false: '#3D3D3D', true: '#172F50' }}
          thumbColor={selectedApps.has(item.id) ? '#E1E1E1' : '#F7F7F7'}
        />
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Select Apps</Text>
          <View style={styles.headerButtons} />
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#C8D2E0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#C8D2E0"
          />
        </View>
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
  container: {
    flex: 1,
    // Remove backgroundColor for transparency
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(23, 47, 80, 0.5)',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#23304A",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#F7F7F7",
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
    color: "#7A7A7A",
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
    color: "#F7F7F7",
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