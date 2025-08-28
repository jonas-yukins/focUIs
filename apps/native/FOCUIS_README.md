# focUIs App Implementation

This document describes the implementation of the focUIs app, which provides a minimal, text-only interface for launching apps on iOS. Android is currently disabled and will be reconsidered in the future.

## Overview

The focUIs app provides users with a distraction-free interface to launch their installed applications. Due to platform restrictions, the implementation differs between Android and iOS:

### Android Implementation (disabled)
Android support has been removed for now. The previous native module and Android project have been deleted. If re-enabled in the future, a fresh Android project and native module can be created.

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

### Android Setup (disabled)
Not applicable while Android is disabled.

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

2. **Run on iOS**:
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

#### Android (disabled)
Not applicable while Android is disabled.

#### iOS
- Static app list with 50+ popular apps
- Installation status checking
- App Store fallback
- Category-based organization

## File Structure

```
apps/native/
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

### Android Issues (disabled)
Not applicable while Android is disabled.

### iOS Issues
- **Apps Not Launching**: Verify URL schemes are correct in `popularApps.json`
- **App Store Fallback**: Ensure App Store URLs are valid
- **Permission Issues**: iOS doesn't require special permissions for this functionality

## Contributing

When adding new apps to the iOS static list:
1. Verify the URL scheme works
2. Include a valid App Store URL
3. Add appropriate category
4. Test on iOS

Android native module contribution guidance is omitted while Android is disabled.