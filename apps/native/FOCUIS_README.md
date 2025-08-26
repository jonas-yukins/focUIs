# focUIs App Implementation

This document describes the implementation of the focUIs app, which provides a minimal, text-only interface for launching apps on both Android and iOS platforms.

## Overview

The focUIs app provides users with a distraction-free interface to launch their installed applications. Due to platform restrictions, the implementation differs between Android and iOS:

### Android Implementation
- Uses a native Android module (`InstalledAppsModule.kt`) to fetch the user's installed apps
- Requests `QUERY_ALL_PACKAGES` permission to access the full list of installed applications
- Uses Android Intents to launch apps via their package names
- Provides real-time access to all user-installed apps

### iOS Implementation
- Uses a static JSON list of popular apps (`popularApps.json`)
- Uses `Linking.openURL()` to launch apps via URL schemes
- Falls back to App Store if an app is not installed (handled by completion handler)
- Compliant with App Store guidelines

## Architecture

### Shared Hook: `useAvailableApps`
The `useAvailableApps` hook provides a unified API that abstracts platform differences:

```typescript
interface UseAvailableAppsReturn {
  apps: AvailableApp[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  launchApp: (app: AvailableApp) => Promise<boolean>;
}
```

### Platform-Specific Implementation

#### Android Native Module
- **File**: `android/app/src/main/java/com/narbhacks/focuis/InstalledAppsModule.kt`
- **Methods**:
  - `getInstalledApps()`: Returns JSON array of installed apps
  - `launchApp(packageName)`: Launches app via Android Intent
  - `isAppInstalled(packageName)`: Checks if app is installed

#### iOS Static Data
- **File**: `src/data/popularApps.json`
- **Contains**: 50+ popular apps with URL schemes and App Store links
- **Categories**: Social, messaging, productivity, entertainment, etc.

### UI Components

#### focUIsScreen
- Minimal, text-only interface
- Search functionality
- App selection via long press
- Platform-specific status indicators (iOS only)
- Pull-to-refresh functionality

## Setup Instructions

### Android Setup

1. **Permissions**: The app requires `QUERY_ALL_PACKAGES` permission in `AndroidManifest.xml`
2. **Native Module**: The `InstalledAppsModule` is automatically registered via `MainApplication.kt`
3. **Build**: Use Expo Development Build or eject to bare workflow for native module support

### iOS Setup

1. **No Special Permissions**: Uses standard iOS APIs
2. **URL Schemes**: Apps are launched via their URL schemes
3. **App Store Compliance**: Fully compliant with App Store guidelines

### Development

1. **Install Dependencies**:
   ```bash
   cd apps/native
   pnpm install
   ```

2. **Run on Android**:
   ```bash
   pnpm android
   ```

3. **Run on iOS**:
   ```bash
   pnpm ios
   ```

## Features

### Core Features
- **Minimal Interface**: Text-only app list with no icons or images
- **Search**: Real-time search through available apps
- **App Launching**: Direct app launching with fallback options
- **Platform Detection**: Automatic platform-specific behavior
- **Error Handling**: Graceful error handling and user feedback

### Platform-Specific Features

#### Android
- Real-time app discovery
- System app filtering
- Package name-based launching
- Version information display

#### iOS
- Static app list with 50+ popular apps
- Installation status checking
- App Store fallback
- Category-based organization

## File Structure

```
apps/native/
├── android/app/src/main/java/com/narbhacks/focuis/
│   ├── InstalledAppsModule.kt      # Android native module
│   ├── InstalledAppsPackage.kt     # Package registration
│   ├── MainActivity.kt             # Main activity
│   └── MainApplication.kt          # Application class
├── android/app/src/main/
│   └── AndroidManifest.xml         # Permissions and app config
├── src/
│   ├── hooks/
│   │   └── useAvailableApps.ts     # Shared platform abstraction
│   ├── data/
│   │   └── popularApps.json        # iOS static app list
│   └── screens/
│       └── focUIsScreen.tsx     # Main UI component
└── package.json                    # Dependencies
```

## Usage

1. **Navigate to focUIs**: Tap the phone icon in the header
2. **Search Apps**: Use the search bar to filter apps
3. **Launch Apps**: Tap any app to launch it
4. **Select Multiple**: Long press to select multiple apps (for future features)
5. **Refresh**: Pull down to refresh the app list

## Future Enhancements

- **Custom App Lists**: Allow users to create custom app lists
- **Favorites**: Mark frequently used apps as favorites
- **Categories**: Filter apps by category
- **App Usage Stats**: Track app usage patterns
- **Parental Controls**: Restrict access to certain apps
- **Dark Mode**: Support for dark theme
- **Accessibility**: Enhanced accessibility features

## Troubleshooting

### Android Issues
- **Permission Denied**: Ensure `QUERY_ALL_PACKAGES` permission is granted
- **Native Module Not Found**: Verify the module is properly registered in `MainApplication.kt`
- **Build Errors**: Use Expo Development Build for native module support

### iOS Issues
- **Apps Not Launching**: Verify URL schemes are correct in `popularApps.json`
- **App Store Fallback**: Ensure App Store URLs are valid
- **Permission Issues**: iOS doesn't require special permissions for this functionality

## Contributing

When adding new apps to the iOS static list:
1. Verify the URL scheme works
2. Include a valid App Store URL
3. Add appropriate category
4. Test on both platforms

When modifying the Android native module:
1. Test permission handling
2. Verify app launching functionality
3. Ensure proper error handling
4. Test on different Android versions 