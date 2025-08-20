import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
    
    // Check for widget launch requests
    checkForWidgetLaunchRequests()
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  private func checkForWidgetLaunchRequests() {
    guard let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis") else { 
      print("AppDelegate: Failed to access UserDefaults with suite name")
      return 
    }
    
    if let launchData = userDefaults.dictionary(forKey: "widgetLaunchRequest") {
      print("AppDelegate: Found widget launch request: \(launchData)")
      
      if let urlScheme = launchData["urlScheme"] as? String, !urlScheme.isEmpty {
        print("AppDelegate: Attempting to launch URL scheme: \(urlScheme)")
        
        if let url = URL(string: urlScheme) {
          print("AppDelegate: Created URL: \(url)")
          DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            print("AppDelegate: Launching URL: \(url)")
            UIApplication.shared.open(url, options: [:]) { success in
              print("AppDelegate: URL launch result: \(success)")
            }
          }
        } else {
          print("AppDelegate: Failed to create URL from scheme: \(urlScheme)")
        }
      } else {
        print("AppDelegate: No valid URL scheme found in launch data")
      }
      
      // Clear the launch request
      userDefaults.removeObject(forKey: "widgetLaunchRequest")
      userDefaults.synchronize()
      print("AppDelegate: Cleared widget launch request")
    } else {
      print("AppDelegate: No widget launch request found")
    }
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    print("AppDelegate: Received URL: \(url)")
    
    // Handle widget deep links
    if url.scheme == "focuis" && url.host == "launch-app" {
      handleWidgetLaunchRequest(url: url)
      return true
    }
    
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }
  
  private func handleWidgetLaunchRequest(url: URL) {
    print("AppDelegate: Handling widget launch request")
    
    guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
          let queryItems = components.queryItems else {
      print("AppDelegate: Invalid URL format")
      return
    }
    
    // Extract app data from URL parameters
    let name = queryItems.first(where: { $0.name == "name" })?.value ?? ""
    let scheme = queryItems.first(where: { $0.name == "scheme" })?.value ?? ""
    let package = queryItems.first(where: { $0.name == "package" })?.value ?? ""
    
    print("AppDelegate: Launching app - Name: \(name), Scheme: \(scheme), Package: \(package)")
    
    // Launch the intended app
    if let appScheme = scheme.isEmpty ? nil : scheme, let appUrl = URL(string: appScheme) {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        print("AppDelegate: Launching URL: \(appUrl)")
        UIApplication.shared.open(appUrl, options: [:]) { success in
          print("AppDelegate: URL launch result: \(success)")
        }
      }
    } else {
      print("AppDelegate: No valid URL scheme to launch")
    }
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
  
  // App becomes active
  public override func applicationDidBecomeActive(_ application: UIApplication) {
    super.applicationDidBecomeActive(application)
    checkForWidgetLaunchRequests()
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
