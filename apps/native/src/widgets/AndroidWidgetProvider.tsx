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
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF', // fine white outline
    // No shadow
  },
  appsGrid: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  appItem: {
    width: '100%',
    marginVertical: 6,
    height: 32,
    backgroundColor: 'transparent',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  emptySlot: {
    display: 'none',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});

export default AndroidWidgetProvider; 