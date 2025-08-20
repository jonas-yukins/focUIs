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
#endif

    // Check for widget launch requests
    checkForWidgetLaunchRequests()

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  
  private func checkForWidgetLaunchRequests() {
    if let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis"),
       let launchData = userDefaults.dictionary(forKey: "widgetLaunchRequest") {
      
      // Clear the launch request
      userDefaults.removeObject(forKey: "widgetLaunchRequest")
      userDefaults.synchronize()
      
      // Handle the launch request
      if let packageName = launchData["packageName"] as? String,
         let urlScheme = launchData["urlScheme"] as? String {
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
          self.handleWidgetLaunch(packageName: packageName, urlScheme: urlScheme)
        }
      }
    }
  }
  
  private func handleWidgetLaunch(packageName: String, urlScheme: String) {
    var urlToOpen: URL?
    
    if !urlScheme.isEmpty {
      urlToOpen = URL(string: urlScheme)
    } else {
      urlToOpen = URL(string: "\(packageName)://")
    }
    
    if let url = urlToOpen, UIApplication.shared.canOpenURL(url) {
      UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
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
  
  // Check for widget launch requests when app becomes active
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
