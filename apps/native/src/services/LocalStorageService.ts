import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const SELECTED_APPS_KEY = 'selectedApps';
const WIDGET_CONFIG_KEY = 'widgetConfig';
const USER_SETTINGS_KEY = 'userSettings';

// Type definitions
export interface LocalAppSelection {
  appId: string;
  isSelected: boolean;
  order: number;
  displayName: string;
  packageName?: string;
  urlScheme?: string;
  appStoreUrl?: string;
  isThirdParty?: boolean;
}

export interface LocalWidgetConfig {
  widgetId: string;
  appIds: string[];
  order: number;
}

export interface LocalUserSettings {
  theme: string;
  fontSize: number;
  layout: string;
  fontColor: string;
}

// Default values
const DEFAULT_USER_SETTINGS: LocalUserSettings = {
  theme: 'default',
  fontSize: 16,
  layout: 'center',
  fontColor: '#FFFFFF'
};

class LocalStorageService {
  // App Selections
  async getSelectedApps(): Promise<LocalAppSelection[]> {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_APPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting selected apps:', error);
      return [];
    }
  }

  async saveSelectedApps(apps: LocalAppSelection[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SELECTED_APPS_KEY, JSON.stringify(apps));
      
      // Also save to iOS widget storage if on iOS
      if (Platform.OS === 'ios') {
        await this.saveToIOSWidgetStorage(apps);
      }
    } catch (error) {
      console.error('Error saving selected apps:', error);
      throw error;
    }
  }

  async toggleAppSelection(appId: string, appData: Omit<LocalAppSelection, 'isSelected' | 'order'>): Promise<void> {
    try {
      const currentApps = await this.getSelectedApps();
      const existingAppIndex = currentApps.findIndex(app => app.appId === appId);
      
      if (existingAppIndex >= 0) {
        // Remove app if already selected
        currentApps.splice(existingAppIndex, 1);
      } else {
        // Add app if not selected
        const newApp: LocalAppSelection = {
          ...appData,
          isSelected: true,
          order: currentApps.length
        };
        currentApps.push(newApp);
      }
      
      // Reorder apps to ensure sequential order after changes
      currentApps.forEach((app, index) => {
        app.order = index;
      });
      
      await this.saveSelectedApps(currentApps);
    } catch (error) {
      console.error('Error toggling app selection:', error);
      throw error;
    }
  }

  async updateAppOrder(appId: string, newOrder: number): Promise<void> {
    try {
      const currentApps = await this.getSelectedApps();
      const appIndex = currentApps.findIndex(app => app.appId === appId);
      
      if (appIndex >= 0) {
        currentApps[appIndex].order = newOrder;
        await this.saveSelectedApps(currentApps);
      }
    } catch (error) {
      console.error('Error updating app order:', error);
      throw error;
    }
  }

  async updateAppOrders(appOrders: { appId: string; newOrder: number }[]): Promise<void> {
    try {
      const currentApps = await this.getSelectedApps();
      
      for (const { appId, newOrder } of appOrders) {
        const appIndex = currentApps.findIndex(app => app.appId === appId);
        if (appIndex >= 0) {
          currentApps[appIndex].order = newOrder;
        }
      }
      
      await this.saveSelectedApps(currentApps);
    } catch (error) {
      console.error('Error updating app orders:', error);
      throw error;
    }
  }

  // Widget Configurations
  async getWidgetConfigs(): Promise<LocalWidgetConfig[]> {
    try {
      const stored = await AsyncStorage.getItem(WIDGET_CONFIG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting widget configs:', error);
      return [];
    }
  }

  async saveWidgetConfigs(configs: LocalWidgetConfig[]): Promise<void> {
    try {
      await AsyncStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving widget configs:', error);
      throw error;
    }
  }

  async reorganizeWidgets(widgets: LocalWidgetConfig[]): Promise<void> {
    try {
      await this.saveWidgetConfigs(widgets);
    } catch (error) {
      console.error('Error reorganizing widgets:', error);
      throw error;
    }
  }

  // User Settings
  async getUserSettings(): Promise<LocalUserSettings> {
    try {
      const stored = await AsyncStorage.getItem(USER_SETTINGS_KEY);
      return stored ? { ...DEFAULT_USER_SETTINGS, ...JSON.parse(stored) } : DEFAULT_USER_SETTINGS;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return DEFAULT_USER_SETTINGS;
    }
  }

  async saveUserSettings(settings: Partial<LocalUserSettings>): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  // iOS Widget Storage (for native widgets)
  private async saveToIOSWidgetStorage(apps: LocalAppSelection[]): Promise<void> {
    try {
      const { SharedGroupPreferences } = require('react-native-shared-group-preferences');
      const widgetApps = apps.map(app => ({
        id: app.appId,
        displayName: app.displayName,
        packageName: app.packageName || '',
        urlScheme: app.urlScheme || null
      }));
      
      await SharedGroupPreferences.setItem('selectedApps', JSON.stringify(widgetApps), 'group.com.jonasyukins.focuis');
      console.log('Widget data saved successfully to SharedGroupPreferences');
    } catch (error) {
      console.log('SharedGroupPreferences failed:', error);
      // Fallback: just log the data that should be saved
      console.log('Widget apps data that should be saved:', JSON.stringify(apps, null, 2));
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([SELECTED_APPS_KEY, WIDGET_CONFIG_KEY, USER_SETTINGS_KEY]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Clean up legacy data and ensure consistent structure
  async cleanupLegacyData(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_APPS_KEY);
      if (stored) {
        const apps = JSON.parse(stored);
        const cleanedApps = apps
          .filter(app => app.appId || app.id) // Remove entries without proper ID
          .map(app => ({
            appId: app.appId || app.id, // Normalize to appId
            displayName: app.displayName,
            packageName: app.packageName || '',
            urlScheme: app.urlScheme,
            appStoreUrl: app.appStoreUrl,
            isThirdParty: app.isThirdParty,
            isSelected: true,
            order: 0
          }))
          .filter((app, index, array) => 
            array.findIndex(a => a.appId === app.appId) === index // Remove duplicates
          )
          .map((app, index) => ({ ...app, order: index })); // Reorder

        await this.saveSelectedApps(cleanedApps);
        console.log('Cleaned up legacy data:', cleanedApps);
      }
    } catch (error) {
      console.error('Error cleaning up legacy data:', error);
    }
  }

  async getStorageKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;
