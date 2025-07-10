import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import InstalledAppsService, { InstalledApp } from '../services/InstalledAppsService';

interface InstalledAppsScreenProps {
  navigation: any;
}

const InstalledAppsScreen: React.FC<InstalledAppsScreenProps> = ({ navigation }) => {
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInstalledApps();
  }, []);

  const loadInstalledApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const installedApps = await InstalledAppsService.getInstalledApps();
      setApps(installedApps);
      setFilteredApps(installedApps);
    } catch (err) {
      setError('Failed to load installed apps');
      console.error('Error loading installed apps:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterApps = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredApps(apps);
    } else {
      const filtered = apps.filter(app =>
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        (app.bundleIdentifier && app.bundleIdentifier.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredApps(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInstalledApps();
    setRefreshing(false);
  };

  const handleAppPress = (app: InstalledApp) => {
    Alert.alert(
      app.name,
      `Version: ${app.version || 'Unknown'}\nBundle ID: ${app.bundleIdentifier || 'Unknown'}`,
      [{ text: 'OK' }]
    );
  };

  const renderAppItem = ({ item }: { item: InstalledApp }) => (
    <TouchableOpacity
      style={styles.appItem}
      onPress={() => handleAppPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.appIcon}>
        {item.icon ? (
          <Text style={styles.appIconText}>{item.name.charAt(0).toUpperCase()}</Text>
        ) : (
          <Ionicons name="phone-portrait" size={24} color="#172F50" />
        )}
      </View>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        {item.version && (
          <Text style={styles.appVersion}>Version {item.version}</Text>
        )}
        {item.bundleIdentifier && (
          <Text style={styles.appBundleId} numberOfLines={1}>
            {item.bundleIdentifier}
          </Text>
        )}
        {item.isSystemApp && (
          <Text style={styles.systemAppLabel}>System App</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Installed Apps</Text>
      <Text style={styles.subtitle}>
        {InstalledAppsService.getLimitationsMessage()}
      </Text>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredApps.length} of {apps.length} apps
          {searchQuery && ` matching "${searchQuery}"`}
        </Text>
      </View>
      {!InstalledAppsService.isSupported() && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={16} color="#FF9500" />
          <Text style={styles.warningText}>
            Limited functionality on this platform
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="apps" size={64} color="#999" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Apps Found' : 'No Apps Found'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No apps match "${searchQuery}"`
          : (error || 'Unable to load installed apps')
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.retryButton} onPress={loadInstalledApps}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#172F50" />
          <Text style={styles.loadingText}>Loading installed apps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#172F50" />
        </TouchableOpacity>
        <Text style={styles.navigationTitle}>Installed Apps</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={filterApps}
            placeholderTextColor="#ADB5BD"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => filterApps('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6C757D" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredApps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  navigationTitle: {
    fontSize: 18,
    fontFamily: 'SemiBold',
    color: '#172F50',
  },
  placeholder: {
    width: 40,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Bold',
    color: '#172F50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Regular',
    color: '#6C757D',
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Medium',
    color: '#856404',
    marginLeft: 8,
  },
  listContainer: {
    flexGrow: 1,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontFamily: 'SemiBold',
    color: '#172F50',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Regular',
    color: '#6C757D',
    marginBottom: 2,
  },
  appBundleId: {
    fontSize: 12,
    fontFamily: 'Regular',
    color: '#ADB5BD',
  },
  appIconText: {
    fontSize: 18,
    fontFamily: 'Bold',
    color: '#172F50',
  },
  systemAppLabel: {
    fontSize: 10,
    fontFamily: 'Medium',
    color: '#FF9500',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Medium',
    color: '#6C757D',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'SemiBold',
    color: '#172F50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Regular',
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#172F50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Medium',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Regular',
    color: '#172F50',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  statsContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Medium',
    color: '#6C757D',
    textAlign: 'center',
  },
});

export default InstalledAppsScreen; 