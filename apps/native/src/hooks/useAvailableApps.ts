import { useState, useEffect, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import { NativeModules } from 'react-native';
import popularApps from '../data/popularApps.json';

export interface AvailableApp {
  id: string;
  name: string;
  packageName?: string; // Android only
  urlScheme?: string; // iOS only
  appStoreUrl?: string; // iOS only
  version?: string;
  isSystemApp?: boolean;
  category?: string;
  isInstalled?: boolean; // iOS only - determined by canOpenURL
  isThirdParty?: boolean; // iOS only - indicates if it's a third-party app
}

interface UseAvailableAppsReturn {
  apps: AvailableApp[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  launchApp: (app: AvailableApp) => Promise<boolean>;
  checkAppInstalled: (app: AvailableApp) => Promise<boolean>;
}

const useAvailableApps = (): UseAvailableAppsReturn => {
  const [apps, setApps] = useState<AvailableApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAndroidApps = useCallback(async (): Promise<AvailableApp[]> => {
    try {
      const { InstalledAppsModule } = NativeModules;
      if (!InstalledAppsModule) {
        throw new Error('InstalledAppsModule not available');
      }

      const appsJson = await InstalledAppsModule.getInstalledApps();
      const androidApps = JSON.parse(appsJson);
      
      return androidApps.map((app: any) => ({
        id: app.id,
        name: app.name,
        packageName: app.packageName,
        version: app.version,
        isSystemApp: app.isSystemApp,
      }));
    } catch (err) {
      console.error('Error getting Android apps:', err);
      throw new Error('Failed to get Android apps');
    }
  }, []);

  const getIOSApps = useCallback(async (): Promise<AvailableApp[]> => {
    try {
      // Start with the static list of popular apps
      const iosApps = popularApps.map((app: any) => ({
        id: app.id,
        name: app.name,
        urlScheme: app.urlScheme,
        appStoreUrl: app.appStoreUrl,
        category: app.category,
        isThirdParty: app.isThirdParty || false,
        isInstalled: false, // Will be checked individually
      }));

      // Check which apps are installed using canOpenURL
      const checkedApps = await Promise.all(
        iosApps.map(async (app) => {
          if (app.urlScheme) {
            if (app.isThirdParty) {
              // For third-party apps, we'll assume they might be installed
              // since canOpenURL often returns false even for installed apps
              console.log(`${app.name} is a third-party app, assuming it might be installed`);
              return { ...app, isInstalled: true };
            } else {
              // For built-in apps, we can still check canOpenURL
              try {
                console.log(`Checking if ${app.name} is installed with scheme: ${app.urlScheme}`);
                const canOpen = await Linking.canOpenURL(app.urlScheme);
                console.log(`${app.name} canOpenURL result:`, canOpen);
                return { ...app, isInstalled: canOpen };
              } catch (err) {
                console.error(`Error checking ${app.name}:`, err);
                return { ...app, isInstalled: false };
              }
            }
          }
          return app;
        })
      );

      return checkedApps;
    } catch (err) {
      console.error('Error getting iOS apps:', err);
      throw new Error('Failed to get iOS apps');
    }
  }, []);

  const loadApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let platformApps: AvailableApp[];
      
      if (Platform.OS === 'android') {
        platformApps = await getAndroidApps();
      } else if (Platform.OS === 'ios') {
        platformApps = await getIOSApps();
      } else {
        platformApps = [];
      }

      setApps(platformApps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading apps:', err);
    } finally {
      setLoading(false);
    }
  }, [getAndroidApps, getIOSApps]);

  const launchApp = useCallback(async (app: AvailableApp): Promise<boolean> => {
    try {
      if (Platform.OS === 'android' && app.packageName) {
        const { InstalledAppsModule } = NativeModules;
        if (InstalledAppsModule) {
          await InstalledAppsModule.launchApp(app.packageName);
          return true;
        }
      } else if (Platform.OS === 'ios' && app.urlScheme) {
        console.log(`Attempting to launch ${app.name} with scheme: ${app.urlScheme}`);
        
        // For third-party apps, we'll try to launch directly without checking canOpenURL
        // because iOS restrictions often make canOpenURL return false even for installed apps
        if (app.isThirdParty) {
          console.log(`${app.name} is a third-party app, attempting direct launch`);
          try {
            await Linking.openURL(app.urlScheme);
            return true;
          } catch (launchError) {
            console.log(`Failed to launch ${app.name} directly, trying App Store`);
            if (app.appStoreUrl) {
              await Linking.openURL(app.appStoreUrl);
              return true;
            }
          }
        } else {
          // For built-in apps, we can still check canOpenURL
          const canOpen = await Linking.canOpenURL(app.urlScheme);
          console.log(`Can open ${app.name}:`, canOpen);
          
          if (canOpen) {
            try {
              await Linking.openURL(app.urlScheme);
              return true;
            } catch (launchError) {
              console.log(`Failed to launch ${app.name} with scheme, trying App Store`);
              if (app.appStoreUrl) {
                await Linking.openURL(app.appStoreUrl);
                return true;
              }
            }
          } else {
            
            if (app.appStoreUrl) {
              await Linking.openURL(app.appStoreUrl);
              return true;
            }
          }
        }
      }
      return false;
    } catch (err) {
      console.error('Error launching app:', err);
      return false;
    }
  }, []);

  const checkAppInstalled = useCallback(async (app: AvailableApp): Promise<boolean> => {
    try {
      if (Platform.OS === 'android' && app.packageName) {
        const { InstalledAppsModule } = NativeModules;
        if (InstalledAppsModule) {
          return await InstalledAppsModule.isAppInstalled(app.packageName);
        }
      } else if (Platform.OS === 'ios' && app.urlScheme) {
        return await Linking.canOpenURL(app.urlScheme);
      }
      return false;
    } catch (err) {
      console.error('Error checking if app is installed:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return {
    apps,
    loading,
    error,
    refresh: loadApps,
    launchApp,
    checkAppInstalled,
  };
};

export default useAvailableApps; 