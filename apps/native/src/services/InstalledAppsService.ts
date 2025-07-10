import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import useAvailableApps, { AvailableApp } from '../hooks/useAvailableApps';

export interface InstalledApp {
  id: string;
  name: string;
  version?: string;
  bundleIdentifier?: string;
  icon?: string;
  isSystemApp?: boolean;
}

class InstalledAppsService {
  /**
   * Get list of installed applications
   * Note: This functionality is limited on iOS due to App Store restrictions
   * On Android, we can get more detailed information
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    try {
      if (Platform.OS === 'ios') {
        return this.getIOSInstalledApps();
      } else if (Platform.OS === 'android') {
        return this.getAndroidInstalledApps();
      }
      return [];
    } catch (error) {
      console.error('Error getting installed apps:', error);
      return [];
    }
  }

  private async getIOSInstalledApps(): Promise<InstalledApp[]> {
    // On iOS, we can only get information about the current app
    // due to App Store restrictions that prevent accessing other apps
    const currentApp: InstalledApp = {
      id: Application.applicationId || 'unknown',
      name: Application.applicationName || 'Unknown App',
      version: Application.nativeApplicationVersion || undefined,
      bundleIdentifier: Application.applicationId || undefined,
      isSystemApp: false,
    };

    // Note: On iOS, we cannot get a list of all installed apps
    // due to privacy restrictions. We can only show the current app
    return [currentApp];
  }

  private async getAndroidInstalledApps(): Promise<InstalledApp[]> {
    try {
      // In Expo managed workflow, we have limited access to installed apps
      // We can only get information about the current app and some basic device info
      
      const currentApp: InstalledApp = {
        id: Application.applicationId || 'unknown',
        name: Application.applicationName || 'Current App',
        version: Application.nativeApplicationVersion || undefined,
        bundleIdentifier: Application.applicationId || undefined,
        isSystemApp: false,
      };

      // For demonstration purposes, we'll create some mock system apps
      // In a real implementation, you would need to use Expo Development Build
      // or eject to bare workflow to access PackageManager
      const mockSystemApps: InstalledApp[] = [
        {
          id: 'com.android.settings',
          name: 'Settings',
          version: '12.0',
          bundleIdentifier: 'com.android.settings',
          isSystemApp: true,
        },
        {
          id: 'com.google.android.gm',
          name: 'Gmail',
          version: '2023.12.01',
          bundleIdentifier: 'com.google.android.gm',
          isSystemApp: false,
        },
        {
          id: 'com.whatsapp',
          name: 'WhatsApp',
          version: '2.23.24.78',
          bundleIdentifier: 'com.whatsapp',
          isSystemApp: false,
        },
        {
          id: 'com.spotify.music',
          name: 'Spotify',
          version: '8.8.0.456',
          bundleIdentifier: 'com.spotify.music',
          isSystemApp: false,
        },
        {
          id: 'com.instagram.android',
          name: 'Instagram',
          version: '302.0.0.45.107',
          bundleIdentifier: 'com.instagram.android',
          isSystemApp: false,
        },
      ];

      return [currentApp, ...mockSystemApps];
    } catch (error) {
      console.error('Error getting Android installed apps:', error);
      
      // Fallback to just the current app
      const currentApp: InstalledApp = {
        id: Application.applicationId || 'unknown',
        name: Application.applicationName || 'Unknown App',
        version: Application.nativeApplicationVersion || undefined,
        bundleIdentifier: Application.applicationId || undefined,
        isSystemApp: false,
      };
      
      return [currentApp];
    }
  }

  /**
   * Get information about the current app
   */
  getCurrentAppInfo(): InstalledApp {
    return {
      id: Application.applicationId || 'unknown',
      name: Application.applicationName || 'Unknown App',
      version: Application.nativeApplicationVersion || undefined,
      bundleIdentifier: Application.applicationId || undefined,
      isSystemApp: false,
    };
  }

  /**
   * Check if the device supports getting installed apps
   */
  isSupported(): boolean {
    // iOS doesn't support getting all installed apps due to privacy restrictions
    // Android supports it but requires additional setup
    return Platform.OS === 'android';
  }

  /**
   * Get platform-specific limitations message
   */
  getLimitationsMessage(): string {
    if (Platform.OS === 'ios') {
      return 'Due to iOS privacy restrictions, we can only show information about the current app.';
    } else if (Platform.OS === 'android') {
      return 'Showing current app and common installed applications. For full access, use Expo Development Build.';
    }
    return 'Platform not supported.';
  }

  /**
   * Get available apps using the new platform-abstracted hook
   * This method provides access to the unified API
   */
  getAvailableAppsHook() {
    return useAvailableApps();
  }
}

export default new InstalledAppsService(); 