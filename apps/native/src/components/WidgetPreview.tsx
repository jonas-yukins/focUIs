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
  onAppPress?: (app: App) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  showTitle?: boolean;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right'; // NEW PROP
  fontColor?: string; // NEW PROP
  verticalAlignment?: 'top' | 'middle' | 'bottom'; // NEW PROP
  // NEW settings
  backgroundStyle?: 'default' | 'blue' | 'white' | 'pink' | 'gray';
  outlineEnabled?: boolean;
  outlineColor?: 'white' | 'black';
}

// Helper function to get alignment styles
const getAlignmentStyles = (alignment: 'left' | 'center' | 'right' = 'center') => {
  let alignItems, textAlign;
  switch (alignment) {
    case 'left':
      alignItems = 'flex-start';
      textAlign = 'left';
      break;
    case 'right':
      alignItems = 'flex-end';
      textAlign = 'right';
      break;
    case 'center':
    default:
      alignItems = 'center';
      textAlign = 'center';
      break;
  }
  return { alignItems, textAlign };
};

// Helper function to get vertical alignment styles
const getVerticalAlignmentStyles = (verticalAlignment: 'top' | 'middle' | 'bottom' = 'middle') => {
  switch (verticalAlignment) {
    case 'top':
      return { justifyContent: 'flex-start' as const };
    case 'bottom':
      return { justifyContent: 'flex-end' as const };
    case 'middle':
    default:
      return { justifyContent: 'center' as const };
  }
};

// Derive colors from canonical background/outline settings
const getWidgetColors = (
  backgroundStyle: 'default' | 'blue' | 'white' | 'pink' | 'gray' = 'default',
  outlineEnabled: boolean = true,
  outlineColor: 'white' | 'black' = 'white'
) => {
  const bg = backgroundStyle;
  const outlineOn = outlineEnabled;
  const outlineClr = outlineColor;

  const backgroundColor =
    bg === 'blue' ? '#10243c' :
    bg === 'white' ? '#F7F7F7' :
    bg === 'pink' ? '#f6ebef' :
    bg === 'gray' ? '#242424' :
    'transparent';
  const borderColor = outlineOn ? (outlineClr === 'black' ? '#000000' : '#FFFFFF') : 'transparent';
  const borderWidth = outlineOn ? 1 : 0;
  return { backgroundColor, borderColor, borderWidth };
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
  fontColor = '#FFFFFF', // Default to white
  verticalAlignment = 'middle', // Default to middle
  backgroundStyle = 'default',
  outlineEnabled = true,
  outlineColor = 'white',
}) => {
  const displayApps = apps.slice(0, 6); // Show max 6 apps
  const hasMoreApps = apps.length > 6;
  const { alignItems, textAlign } = getAlignmentStyles(alignment);
  const { backgroundColor, borderColor, borderWidth } = getWidgetColors(backgroundStyle, outlineEnabled, outlineColor);
  const verticalStyles = getVerticalAlignmentStyles(verticalAlignment);

  return (
    <View style={[styles.container, isDragging && styles.dragging, { backgroundColor, borderColor, borderWidth }]}>
      {/* Widget Header - Only show if showTitle is true */}
      {showTitle && (
        <View style={[styles.header, { justifyContent: 'space-between', alignItems }]}> {/* Dynamic alignment */}
          <View style={[styles.headerLeft, { justifyContent: 'flex-start', alignItems }]}> {/* Dynamic alignment */}
            <Ionicons name="phone-portrait-outline" size={16} color={fontColor} />
            <Text style={[styles.widgetTitle, { textAlign, color: fontColor }]}>{widgetId.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
      )}

      {/* Apps Grid */}
      <View style={[styles.appsGrid, { alignItems, ...verticalStyles }]}> {/* Dynamic alignment */}
        {displayApps.map((app, index) => (
          <View
            key={app._id}
            style={[styles.appItem, { alignItems, justifyContent: 'center' }]} // Dynamic alignment
          >
            <Text style={[styles.appName, { fontSize, textAlign, color: fontColor }]} numberOfLines={1}>
              {app.displayName}
            </Text>
          </View>
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
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
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