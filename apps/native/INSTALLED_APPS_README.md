# Installed Apps Feature

This feature allows users to view a list of all installed applications on their device. The implementation handles both Android and iOS platforms with appropriate limitations and permissions.

## Features

- **Cross-platform support**: Works on both Android and iOS
- **Search functionality**: Filter apps by name or bundle identifier
- **App details**: Shows app name, version, bundle identifier, and system app status
- **Real-time filtering**: Search results update as you type
- **Pull-to-refresh**: Refresh the app list by pulling down
- **Error handling**: Graceful fallback when permissions are not available

## Platform Differences

### Android
- **Limited functionality**: In Expo managed workflow, shows current app and common installed apps
- **App information**: Shows app name, version, package name, and system app status
- **Full access**: Requires Expo Development Build or bare workflow to access PackageManager
- **Permissions**: `QUERY_ALL_PACKAGES` permission configured but requires native implementation

### iOS
- **Limited functionality**: Due to App Store restrictions, can only show information about the current app
- **Privacy restrictions**: iOS prevents apps from accessing information about other installed apps
- **Fallback**: Shows current app information and displays a warning about limitations

## Implementation Details

### Files Created/Modified

1. **`src/services/InstalledAppsService.ts`** - Service layer for getting installed apps
2. **`src/screens/InstalledAppsScreen.tsx`** - UI screen for displaying installed apps
3. **`src/navigation/Navigation.tsx`** - Added navigation route
4. **`src/screens/HomeScreen.tsx`** - Added access button in header
5. **`src/screens/SettingsScreen.tsx`** - Added menu item in settings

### Dependencies Added

- `expo-application` - For getting current app information
- `expo-device` - For device-specific functionality

### Permissions

The following permissions are configured in `app.json`:

```json
{
  "android": {
    "permissions": [
      "QUERY_ALL_PACKAGES",
      "PACKAGE_USAGE_STATS"
    ]
  }
}
```

## Usage

### Accessing the Feature

1. **From Home Screen**: Tap the apps icon (📱) in the header
2. **From Settings**: Go to Settings → App Management → Installed Apps

### Features Available

- **Search**: Type in the search bar to filter apps by name or bundle identifier
- **App Details**: Tap on any app to see detailed information
- **Refresh**: Pull down to refresh the app list
- **System Apps**: System apps are clearly labeled with an orange badge

## Technical Notes

### Service Layer

The `InstalledAppsService` provides a unified interface for both platforms:

```typescript
interface InstalledApp {
  id: string;
  name: string;
  version?: string;
  bundleIdentifier?: string;
  icon?: string;
  isSystemApp?: boolean;
}
```

### Error Handling

- Graceful fallback when permissions are not available
- Clear error messages for users
- Platform-specific limitation warnings

### Performance

- Efficient filtering with real-time search
- Lazy loading of app information
- Optimized list rendering with FlatList

## Future Enhancements

1. **Full Android Access**: Use Expo Development Build to access PackageManager for real installed apps
2. **App Icons**: Display actual app icons (requires additional native implementation)
3. **App Categories**: Group apps by category (system, user, etc.)
4. **App Launch**: Direct launch of apps (requires additional permissions)
5. **App Management**: Uninstall or disable apps (requires system permissions)
6. **Export/Import**: Export app list or import from backup

## Troubleshooting

### Common Issues

1. **Limited apps on Android**: This is expected in Expo managed workflow. Use Expo Development Build for full access
2. **Limited functionality on iOS**: This is expected due to iOS privacy restrictions
3. **Search not working**: Ensure the app list has loaded completely
4. **Module resolution errors**: Ensure all dependencies are properly installed

### Debug Information

The service includes console logging for debugging:
- Error messages when getting installed apps fails
- Platform-specific limitation messages
- App count and filtering information

## Security Considerations

- Only reads app information, does not modify or launch apps
- Respects platform privacy restrictions
- No sensitive data is collected or transmitted
- Permissions are minimal and necessary for functionality 