declare module 'react-native' {
  interface NativeModulesStatic {
    InstalledAppsModule: {
      getInstalledApps(): Promise<string>;
      launchApp(packageName: string): Promise<boolean>;
      isAppInstalled(packageName: string): Promise<boolean>;
    };
  }
}

export {}; 