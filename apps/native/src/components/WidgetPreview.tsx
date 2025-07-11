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
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  widgetId,
  apps,
  onAppPress,
  onDragStart,
  onDragEnd,
  isDragging = false,
}) => {
  const displayApps = apps.slice(0, 6); // Show max 6 apps
  const hasMoreApps = apps.length > 6;

  return (
    <View style={[styles.container, isDragging && styles.dragging]}>
      {/* Widget Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="phone-portrait-outline" size={16} color="#172F50" />
          <Text style={styles.widgetTitle}>{widgetId.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.appCount}>{apps.length} apps</Text>
          {hasMoreApps && (
            <Text style={styles.moreIndicator}>+{apps.length - 6}</Text>
          )}
        </View>
      </View>

      {/* Apps Grid */}
      <View style={styles.appsGrid}>
        {displayApps.map((app, index) => (
          <TouchableOpacity
            key={app._id}
            style={styles.appItem}
            onPress={() => onAppPress(app)}
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

      {/* Drag Handle */}
      <View style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
        <View style={styles.dragIndicator} />
        <View style={styles.dragIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E1E1E1",
  },
  dragging: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  widgetTitle: {
    fontSize: RFValue(14),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  appCount: {
    fontSize: RFValue(12),
    fontFamily: "MRegular",
    color: "#666666",
  },
  moreIndicator: {
    fontSize: RFValue(12),
    fontFamily: "MSemiBold",
    color: "#172F50",
    marginLeft: 4,
  },
  appsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  appItem: {
    width: (width - 80) / 3 - 8, // 3 columns with padding
    height: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  appName: {
    fontSize: RFValue(12),
    fontFamily: "MRegular",
    color: "#172F50",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  emptySlot: {
    width: (width - 80) / 3 - 8,
    height: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: RFValue(16),
    fontFamily: "MRegular",
    color: "#B3B3B3",
  },
  dragHandle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E1E1E1",
  },
  dragIndicator: {
    width: 24,
    height: 3,
    backgroundColor: "#B3B3B3",
    borderRadius: 2,
    marginHorizontal: 2,
  },
});

export default WidgetPreview; 