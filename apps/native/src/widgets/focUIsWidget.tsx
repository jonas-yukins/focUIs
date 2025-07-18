import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WidgetProps {
  widgetId: string;
  apps: Array<{
    _id: string;
    displayName: string;
    packageName: string;
    urlScheme?: string;
    appStoreUrl?: string;
    isThirdParty?: boolean;
  }>;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right'; // NEW PROP
  theme?: 'default' | 'dark' | 'light'; // NEW PROP
  fontColor?: string; // NEW PROP
}

// Helper function to get alignment styles
const getAlignmentStyles = (alignment: 'left' | 'center' | 'right' = 'center') => {
  let justifyContent, alignItems, textAlign;
  switch (alignment) {
    case 'left':
      justifyContent = 'flex-start';
      alignItems = 'flex-start';
      textAlign = 'left';
      break;
    case 'right':
      justifyContent = 'flex-end';
      alignItems = 'flex-end';
      textAlign = 'right';
      break;
    case 'center':
    default:
      justifyContent = 'center';
      alignItems = 'center';
      textAlign = 'center';
      break;
  }
  return { justifyContent, alignItems, textAlign };
};

// Add helper for theme-based colors
const getWidgetColors = (theme: 'default' | 'dark' | 'light' = 'default') => {
  switch (theme) {
    case 'dark':
      return { backgroundColor: '#000000', borderColor: 'transparent', borderWidth: 0 };
    case 'light':
      return { backgroundColor: '#FFFFFF', borderColor: 'transparent', borderWidth: 0 };
    case 'default':
    default:
      return { backgroundColor: 'transparent', borderColor: '#FFFFFF', borderWidth: 1 };
  }
};

const focUIsWidget: React.FC<WidgetProps> = ({ widgetId, apps, fontSize = 20, alignment = 'center', theme = 'default', fontColor = '#FFFFFF' }) => {
  const displayApps = apps.slice(0, 6); // Show max 6 apps
  const hasMoreApps = apps.length > 6;
  const { justifyContent, alignItems, textAlign } = getAlignmentStyles(alignment);
  const { backgroundColor, borderColor, borderWidth } = getWidgetColors(theme);

  const handleAppPress = (app: any) => {
    // This will be handled by the widget extension
    // The widget extension will use the URL scheme to launch the app
    
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor, borderWidth }]}>
      {/* Apps Grid */}
      <View style={[styles.appsGrid, { alignItems }]}> {/* Dynamic alignment */}
        {displayApps.map((app, index) => (
          <TouchableOpacity
            key={app._id}
            style={[styles.appItem, { alignItems, justifyContent }]} // Dynamic alignment
            onPress={() => handleAppPress(app)}
            activeOpacity={0.7}
          >
            <Text style={[styles.appName, { fontSize, textAlign, color: fontColor }]} numberOfLines={1}>
              {app.displayName}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Empty slots for visual consistency */}
        {Array.from({ length: Math.max(0, 6 - displayApps.length) }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.emptySlot}>
            <Text style={[styles.emptyText, { color: fontColor }]}>+</Text>
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

export default focUIsWidget; 