import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AndroidWidgetProps {
  widgetId: string;
  apps: Array<{
    _id: string;
    displayName: string;
    packageName: string;
    urlScheme?: string;
    appStoreUrl?: string;
    isThirdParty?: boolean;
  }>;
}

const AndroidWidgetProvider: React.FC<AndroidWidgetProps> = ({ widgetId, apps }) => {
  const displayApps = apps.slice(0, 6); // Show max 6 apps
  const hasMoreApps = apps.length > 6;

  const handleAppPress = (app: any) => {
    // This will be handled by the Android widget provider
    // The widget provider will use the package name to launch the app
    console.log('App pressed:', app.displayName);
  };

  return (
    <View style={styles.container}>
      {/* Apps Grid */}
      <View style={styles.appsGrid}>
        {displayApps.map((app, index) => (
          <TouchableOpacity
            key={app._id}
            style={styles.appItem}
            onPress={() => handleAppPress(app)}
            activeOpacity={0.7}
          >
            <Text style={styles.appName} numberOfLines={1}>
              {app.displayName}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Empty slots for visual consistency */}
        {Array.from({ length: Math.max(0, 6 - displayApps.length) }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.emptySlot}>
            <Text style={styles.emptyText}>+</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center', // Center the grid
  },
  appItem: {
    width: '30%',
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  appName: {
    fontSize: 12,
    fontWeight: '400',
    color: '#172F50',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  emptySlot: {
    width: '30%',
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#B3B3B3',
  },
});

export default AndroidWidgetProvider; 