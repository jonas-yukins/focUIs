import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface App {
  _id: string;
  displayName: string;
  packageName: string;
  urlScheme?: string;
  appStoreUrl?: string;
  isThirdParty?: boolean;
}

interface WidgetPreviewProps {
  widgetId: string;
  apps: App[];
  onAppPress: (app: App) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  showTitle?: boolean;
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

const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  widgetId,
  apps,
  onAppPress,
  onDragStart,
  onDragEnd,
  isDragging = false,
  showTitle = true,
  fontSize = 20,
  alignment = 'center', // Default to center
  theme = 'default', // Default to default
  fontColor = '#FFFFFF', // Default to white
}) => {
  const displayApps = apps.slice(0, 6); // Show max 6 apps
  const hasMoreApps = apps.length > 6;
  const { justifyContent, alignItems, textAlign } = getAlignmentStyles(alignment);
  const { backgroundColor, borderColor, borderWidth } = getWidgetColors(theme);

  return (
    <View style={[styles.container, isDragging && styles.dragging, { backgroundColor, borderColor, borderWidth }]}>
      {/* Widget Header - Only show if showTitle is true */}
      {showTitle && (
        <View style={[styles.header, { justifyContent, alignItems }]}> {/* Dynamic alignment */}
          <View style={[styles.headerLeft, { justifyContent, alignItems }]}> {/* Dynamic alignment */}
            <Ionicons name="phone-portrait-outline" size={16} color={fontColor} />
            <Text style={[styles.widgetTitle, { textAlign, color: fontColor }]}>{widgetId.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
      )}

      {/* Apps Grid */}
      <View style={[styles.appsGrid, { alignItems }]}> {/* Dynamic alignment */}
        {displayApps.map((app, index) => (
          <TouchableOpacity
            key={app._id}
            style={[styles.appItem, { alignItems, justifyContent }]} // Dynamic alignment
            onPress={() => onAppPress(app)}
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
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF', // fine white outline
    // No shadow
    minHeight: 296, // Ensures height matches a widget with 6 apps (header + 6*appItem + margins)
  },
  dragging: {
    // Remove shadow and transform for dragging
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetTitle: {
    fontSize: RFValue(14),
    fontFamily: 'MSemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appCount: {
    fontSize: RFValue(12),
    fontFamily: 'MRegular',
    color: '#FFFFFF',
  },
  moreIndicator: {
    fontSize: RFValue(12),
    fontFamily: 'MSemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
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
    fontSize: RFValue(20),
    fontFamily: 'MSemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  emptySlot: {
    display: 'none',
  },
  emptyText: {
    fontSize: RFValue(16),
    fontFamily: 'MRegular',
    color: '#FFFFFF',
  },
  dragHandle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  dragIndicator: {
    width: 24,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginHorizontal: 2,
  },
});

export default WidgetPreview; 