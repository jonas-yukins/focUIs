# Widget Implementation for Plainphone

This document describes the widget implementation for the Plainphone app, which allows users to display their selected apps on their device's home screen.

## Overview

The widget system consists of:
- **Widget Preview**: Shows how widgets will look on the home screen
- **Widget Configuration**: Allows users to organize apps between widgets
- **Widget Setup**: Provides instructions for adding widgets to the home screen
- **Actual Widgets**: iOS and Android widget components

## Features

### Widget Management
- Each widget can display up to 6 apps
- Multiple widgets can be created to display more than 6 apps
- Users can reorder widgets and move apps between widgets
- Widget configurations are saved to the backend

### Widget Types
- **iOS Widget**: Medium-sized widget using iOS WidgetKit
- **Android Widget**: Medium-sized widget using Android AppWidgetProvider

## Implementation Details

### Backend Schema
The widget system uses a new `userWidgets` table in the Convex backend:

```typescript
userWidgets: defineTable({
  userId: v.string(),
  widgetId: v.string(), // "widget_1", "widget_2", etc.
  appIds: v.array(v.string()), // Array of app IDs that belong to this widget
  order: v.number(), // Order of the widget
})
```

### Key Components

#### 1. WidgetPreview Component
- Located in `src/components/WidgetPreview.tsx`
- Shows a preview of how the widget will look
- Displays up to 6 apps in a grid layout
- Shows empty slots when fewer than 6 apps are selected

#### 2. WidgetSetupScreen
- Located in `src/screens/WidgetSetupScreen.tsx`
- Provides step-by-step instructions for adding widgets
- Platform-specific instructions for iOS and Android
- Includes tips and best practices

#### 3. WidgetConfigScreen
- Located in `src/screens/WidgetConfigScreen.tsx`
- Allows users to configure which apps appear in which widgets
- Shows widget previews and available apps
- Enables moving apps between widgets

#### 4. Widget Components
- **iOS**: `src/widgets/PlainphoneWidget.tsx`
- **Android**: `src/widgets/AndroidWidgetProvider.tsx`

### Navigation
The widget screens are integrated into the main navigation:
- `WidgetSetupScreen`: Instructions for adding widgets
- `WidgetConfigScreen`: Configuration and management

### HomeScreen Integration
The HomeScreen now includes:
- Widget previews section
- Quick access buttons for widget setup and configuration
- Automatic widget organization when apps are selected

## Usage Flow

1. **Select Apps**: User selects apps in AppSelectionScreen
2. **Auto-Organization**: Apps are automatically organized into widgets (6 apps per widget)
3. **Configure Widgets**: User can access WidgetConfigScreen to customize widget organization
4. **Add to Home Screen**: User follows instructions in WidgetSetupScreen to add widgets
5. **Use Widgets**: User can tap app names in widgets to launch apps directly

## Widget Configuration

### Widget IDs
Widgets are identified as:
- `widget_1`: First widget
- `widget_2`: Second widget
- etc.

### App Organization
- Apps are automatically distributed across widgets (6 per widget)
- Users can manually move apps between widgets
- Widget order can be changed
- Empty widgets are automatically removed

## Platform-Specific Implementation

### iOS
- Uses iOS WidgetKit framework
- Medium widget size (2x2 grid)
- Supports app launching via URL schemes
- Widget extension handles app launching

### Android
- Uses Android AppWidgetProvider
- Medium widget size
- Supports app launching via package names
- Widget provider handles app launching

## Future Enhancements

1. **Drag and Drop**: Re-enable drag and drop functionality for widget reordering
2. **Widget Sizes**: Support for different widget sizes (small, large)
3. **Customization**: Allow users to customize widget appearance
4. **Widget Stacks**: Support for widget stacks on iOS
5. **Real-time Updates**: Update widgets when app selections change

## Technical Notes

### Dependencies
- `react-native-draggable-flatlist`: For drag and drop functionality (currently disabled due to TypeScript issues)
- `@expo/vector-icons`: For icons in widgets
- Convex backend: For storing widget configurations

### Performance Considerations
- Widget data is cached locally for performance
- Widget updates are batched to reduce backend calls
- Widget previews are rendered efficiently using FlatList

### Security
- Widget configurations are user-specific
- App launching is handled securely through platform APIs
- No sensitive data is exposed in widgets

## Troubleshooting

### Common Issues
1. **Widget not appearing**: Check if widget was added correctly to home screen
2. **Apps not launching**: Verify app is installed and URL scheme/package name is correct
3. **Configuration not saving**: Check network connection and backend status

### Debugging
- Use console logs in widget components for debugging
- Check Convex dashboard for widget data
- Verify app permissions for widget functionality 