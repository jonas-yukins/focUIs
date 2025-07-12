# Widget System

This document describes the widget system implementation for the Plainphone app, which allows users to create customizable home screen widgets with their selected apps.

## Overview

The widget system provides:
- **App Selection**: Users can select apps to include in widgets
- **Widget Configuration**: Drag and drop interface to organize apps into widgets
- **Widget Preview**: Real-time preview of how widgets will appear
- **Cross-platform Support**: iOS and Android widget implementations

## Architecture

### Core Components

1. **WidgetConfigScreen**: Main configuration interface with drag and drop functionality
2. **Widget Preview**: Visual representation of widget layouts
3. **Platform Widgets**: Native widget implementations for iOS and Android

### Data Flow

1. User selects apps in `AppSelectionScreen`
2. Apps are automatically organized into widgets (6 apps per widget)
3. User can customize organization in `WidgetConfigScreen`
4. Widget configurations are saved to Convex backend
5. Native widgets display the configured apps

## Widget Configuration Screen

### Features

- **Drag and Drop Reordering**: Uses `react-native-reanimated-dnd` for smooth, performant drag and drop
- **Real-time Preview**: Shows how widgets will appear as you reorganize apps
- **Auto-organization**: Automatically distributes apps across widgets (6 per widget)
- **Visual Feedback**: Clear drag handles and visual indicators

### Implementation Details

The `WidgetConfigScreen` uses the `react-native-reanimated-dnd` library for drag and drop functionality:

```typescript
import { Sortable, SortableItem, SortableRenderItemProps } from "react-native-reanimated-dnd";

// Sortable list for drag and drop
<Sortable
  data={allApps}
  renderItem={renderAppItem}
  itemHeight={60}
  style={styles.sortableList}
  contentContainerStyle={styles.sortableListContent}
  itemKeyExtractor={(item) => item.id}
/>
```

### Key Features

1. **Vertical Sortable List**: Smooth vertical reordering with auto-scroll
2. **Drag Handles**: Visual drag handles for intuitive interaction
3. **Real-time Updates**: Widget preview updates as you drag and drop
4. **Auto-scroll**: Automatic scrolling when dragging near screen edges
5. **Performance Optimized**: Built with Reanimated 3 for 60fps animations

### Dependencies

- `react-native-reanimated-dnd`: Modern drag and drop library
- `react-native-reanimated`: Animation engine
- `react-native-gesture-handler`: Gesture handling

## Widget Data Structure

### Widget Configuration

```typescript
interface Widget {
  widgetId: string;    // Unique identifier
  appIds: string[];    // Array of app IDs in this widget
  order: number;       // Widget order
}
```

### App Data

```typescript
interface App {
  _id: string;         // Unique identifier
  displayName: string; // App name
  packageName?: string; // Android package name
  urlScheme?: string;  // iOS URL scheme
}
```

## Backend Integration

### Convex Functions

- `getUserApps`: Retrieve user's selected apps
- `getUserWidgets`: Retrieve user's widget configurations
- `reorganizeWidgets`: Save widget configurations
- `updateAppOrders`: Update app ordering within widgets

### Data Persistence

Widget configurations are stored in Convex and synchronized across devices. The system automatically handles:

- Widget creation and deletion
- App reordering within widgets
- Cross-widget app movement
- Widget order management

## Platform-Specific Implementation

### iOS Widgets
- **Location**: `src/widgets/PlainphoneWidget.tsx`
- **Features**: 
  - Medium widget size (2x2 grid)
  - App launching via URL schemes
  - WidgetKit integration

### Android Widgets
- **Location**: `src/widgets/AndroidWidgetProvider.tsx`
- **Features**:
  - Medium widget size
  - App launching via package names
  - AppWidgetProvider implementation

## Navigation

The widget screens are integrated into the main navigation:
- `WidgetConfigScreen`: Configuration and management
- Accessible from `HomeScreen` via configuration button

## Usage Flow

1. **Select Apps**: User selects apps in `AppSelectionScreen`
2. **Auto-Organization**: Apps are automatically organized into widgets (6 apps per widget)
3. **Configure Widgets**: User accesses `WidgetConfigScreen` to customize organization
4. **Drag and Drop**: User drags apps to reorder them within and across widgets
5. **Save Configuration**: Changes are saved to backend
6. **Add to Home Screen**: User follows platform-specific instructions to add widgets
7. **Use Widgets**: User can tap app names in widgets to launch apps directly

## Widget Configuration

### Widget IDs
Widgets are identified as:
- `widget_1`: First widget
- `widget_2`: Second widget
- etc.

### App Organization
- Apps are automatically distributed across widgets (6 per widget)
- Users can manually move apps between widgets using drag and drop
- Widget order can be changed
- Empty widgets are automatically removed

## Drag and Drop Implementation

### Library Choice
We use `react-native-reanimated-dnd` for its:
- **Performance**: Built with Reanimated 3 for smooth 60fps animations
- **Simplicity**: Clean, intuitive API
- **Reliability**: Production-ready with extensive testing
- **Features**: Auto-scroll, drag handles, visual feedback

### Key Components

1. **Sortable**: Main container for the sortable list
2. **SortableItem**: Individual draggable items
3. **SortableRenderItemProps**: Props passed to render function

### Implementation Pattern

```typescript
const renderAppItem = useCallback((props: SortableRenderItemProps<DraggableApp>) => {
  const { item, id, positions, lowerBound, autoScrollDirection, itemsCount, itemHeight } = props;
  
  return (
    <SortableItem
      key={id}
      data={item}
      id={id}
      positions={positions}
      lowerBound={lowerBound}
      autoScrollDirection={autoScrollDirection}
      itemsCount={itemsCount}
      itemHeight={itemHeight}
      onMove={handleMove}
      style={styles.sortableItem}
    >
      {/* App item content */}
    </SortableItem>
  );
}, [handleMove]);
```

## Future Enhancements

1. **Widget Sizes**: Support for different widget sizes (small, large)
2. **Customization**: Allow users to customize widget appearance
3. **Widget Stacks**: Support for widget stacks on iOS
4. **Real-time Updates**: Update widgets when app selections change
5. **Advanced Drag and Drop**: Multi-select, batch operations

## Technical Notes

### Dependencies
- `react-native-reanimated-dnd`: For drag and drop functionality
- `react-native-reanimated`: Animation engine
- `react-native-gesture-handler`: Gesture handling
- `@expo/vector-icons`: For icons in widgets
- Convex backend: For storing widget configurations

### Performance Considerations
- Widget data is cached locally for performance
- Widget updates are batched to reduce backend calls
- Widget previews are rendered efficiently using optimized components
- Drag and drop uses native animations for smooth performance

### Security
- Widget configurations are user-specific
- App launching is handled securely through platform APIs
- No sensitive data is exposed in widgets

## Troubleshooting

### Common Issues
1. **Widget not appearing**: Check if widget was added correctly to home screen
2. **Apps not launching**: Verify app is installed and URL scheme/package name is correct
3. **Configuration not saving**: Check network connection and backend status
4. **Drag and drop not working**: Ensure `react-native-reanimated-dnd` is properly installed

### Debugging
- Use console logs in widget components for debugging
- Check Convex dashboard for widget data
- Verify app permissions for widget functionality
- Test drag and drop functionality in development mode

### Performance Issues
- Ensure Reanimated 3 is properly configured
- Check for memory leaks in drag and drop components
- Monitor widget rendering performance
- Optimize widget data structure if needed 