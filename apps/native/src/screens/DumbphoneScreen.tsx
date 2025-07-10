import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import useAvailableApps, { AvailableApp } from '../hooks/useAvailableApps';

interface DumbphoneScreenProps {
  navigation: any;
}

const DumbphoneScreen: React.FC<DumbphoneScreenProps> = ({ navigation }) => {
  const { apps, loading, error, refresh, launchApp } = useAvailableApps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) {
      return apps;
    }
    return apps.filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apps, searchQuery]);

  const handleAppPress = async (app: AvailableApp) => {
    try {
      console.log(`User tapped on app: ${app.name}`);
      console.log(`App details:`, app);
      
      const success = await launchApp(app);
      console.log(`Launch result for ${app.name}:`, success);
      
      if (!success) {
        Alert.alert(
          'Cannot Launch App',
          `Unable to launch ${app.name}. The app may not be installed.`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error(`Error launching ${app.name}:`, err);
      Alert.alert(
        'Error',
        `Failed to launch ${app.name}: ${err instanceof Error ? err.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const toggleAppSelection = (appId: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApps(newSelected);
  };

  const renderAppItem = ({ item }: { item: AvailableApp }) => (
    <TouchableOpacity
      style={[
        styles.appItem,
        selectedApps.has(item.id) && styles.selectedAppItem
      ]}
      onPress={() => handleAppPress(item)}
      onLongPress={() => {
        // Show debug info on long press
        Alert.alert(
          'App Debug Info',
          `Name: ${item.name}\nID: ${item.id}\nURL Scheme: ${item.urlScheme || 'N/A'}\nInstalled: ${item.isInstalled}\nThird-party: ${item.isThirdParty ? 'Yes' : 'No'}\nCategory: ${item.category || 'N/A'}`,
          [{ text: 'OK' }]
        );
      }}
      activeOpacity={0.7}
    >
      <View style={styles.appContent}>
        <Text style={styles.appName}>{item.name}</Text>
        {Platform.OS === 'ios' && (
          <View style={styles.appStatus}>
            {item.isThirdParty ? (
              <Text style={styles.thirdPartyText}>Third-party App</Text>
            ) : item.isInstalled ? (
              <Text style={styles.installedText}>Installed</Text>
            ) : (
              <Text style={styles.notInstalledText}>Not Installed</Text>
            )}
          </View>
        )}
        {item.category && (
          <Text style={styles.categoryText}>{item.category}</Text>
        )}
        {Platform.OS === 'ios' && item.urlScheme && (
          <Text style={styles.urlSchemeText}>{item.urlScheme}</Text>
        )}
      </View>
      {selectedApps.has(item.id) && (
        <Ionicons name="checkmark-circle" size={20} color="#172F50" />
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Dumbphone</Text>
      <Text style={styles.subtitle}>
        {Platform.OS === 'ios' 
          ? 'Tap to launch apps. Long press to select multiple.'
          : 'Tap to launch apps. Long press to select multiple.'
        }
      </Text>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredApps.length} apps
          {searchQuery && ` matching "${searchQuery}"`}
        </Text>
        {selectedApps.size > 0 && (
          <Text style={styles.selectedText}>
            {selectedApps.size} selected
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="phone-portrait" size={64} color="#999" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Apps Found' : 'No Apps Available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No apps match "${searchQuery}"`
          : (error || 'Unable to load apps')
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#172F50" />
          <Text style={styles.loadingText}>Loading apps...</Text>
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
        <Text style={styles.navigationTitle}>Dumbphone</Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => {
            // Test some common URL schemes
            const testSchemes = [
              'whatsapp://', 
              'telegram://', 
              'instagram://', 
              'fb://',
              'facebook://',
              'music://',
              'weather://',
              'tel://',
              'sms://',
              'mailto://',
              'http://'
            ];
            testSchemes.forEach(scheme => {
              Linking.canOpenURL(scheme).then(canOpen => {
                console.log(`Scheme ${scheme} can open:`, canOpen);
              }).catch(err => {
                console.error(`Error testing scheme ${scheme}:`, err);
              });
            });
            
            // Test direct launching of third-party apps
            const testThirdPartyApps = [
              { name: 'WhatsApp', scheme: 'whatsapp://' },
              { name: 'Telegram', scheme: 'telegram://' },
              { name: 'Instagram', scheme: 'instagram://' },
              { name: 'Facebook', scheme: 'fb://' },
              { name: 'Twitter', scheme: 'twitter://' },
              { name: 'Spotify', scheme: 'spotify://' },
              { name: 'YouTube', scheme: 'youtube://' },
              { name: 'Netflix', scheme: 'netflix://' },
              { name: 'Gmail', scheme: 'googlegmail://' },
              { name: 'Google Maps', scheme: 'comgooglemaps://' },
              { name: 'Discord', scheme: 'discord://' },
              { name: 'TikTok', scheme: 'tiktok://' },
              { name: 'Snapchat', scheme: 'snapchat://' },
              { name: 'Zoom', scheme: 'zoomus://' },
              { name: 'Slack', scheme: 'slack://' },
              { name: 'Uber', scheme: 'uber://' },
              { name: 'Lyft', scheme: 'lyft://' },
              { name: 'Amazon', scheme: 'amzn://' },
              { name: 'PayPal', scheme: 'paypal://' },
              { name: 'Venmo', scheme: 'venmo://' }
            ];
            
            testThirdPartyApps.forEach(app => {
              console.log(`Testing direct launch of ${app.name}...`);
              Linking.openURL(app.scheme).then(() => {
                console.log(`Successfully launched ${app.name}`);
              }).catch(err => {
                console.log(`Failed to launch ${app.name}:`, err.message);
              });
            });
            
            Alert.alert('Debug', 'Check console for URL scheme test results and direct launch attempts');
          }}
        >
          <Ionicons name="bug-outline" size={20} color="#172F50" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#ADB5BD"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
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
          <RefreshControl refreshing={loading} onRefresh={refresh} />
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
    backgroundColor: '#FFFFFF',
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  debugButton: {
    padding: 8,
  },
  navigationTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'SemiBold',
    color: '#172F50',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: 'Regular',
    color: '#172F50',
  },
  clearButton: {
    padding: 4,
  },
  header: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Bold',
    color: '#172F50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Regular',
    color: '#6C757D',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Medium',
    color: '#495057',
  },
  selectedText: {
    fontSize: 14,
    fontFamily: 'Medium',
    color: '#172F50',
  },
  listContainer: {
    flexGrow: 1,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
  },
  selectedAppItem: {
    backgroundColor: '#E3F2FD',
  },
  appContent: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontFamily: 'Medium',
    color: '#172F50',
    marginBottom: 4,
  },
  appStatus: {
    marginBottom: 2,
  },
  installedText: {
    fontSize: 12,
    fontFamily: 'Regular',
    color: '#28A745',
  },
  notInstalledText: {
    fontSize: 12,
    fontFamily: 'Regular',
    color: '#DC3545',
  },
  thirdPartyText: {
    fontSize: 12,
    fontFamily: 'Regular',
    color: '#FF9500',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Regular',
    color: '#6C757D',
    textTransform: 'capitalize',
  },
  urlSchemeText: {
    fontSize: 10,
    fontFamily: 'Regular',
    color: '#ADB5BD',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'SemiBold',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Regular',
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#172F50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Medium',
    color: '#FFFFFF',
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
});

export default DumbphoneScreen; 