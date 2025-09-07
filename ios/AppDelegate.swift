import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    self.moduleName = "detective"
    self.dependencyProvider = RCTAppDependencyProvider()
 
    self.initialProps = [:]
    FirebaseApp.configure()
    FirebaseApp.initialize()
    
    let center = UNUserNotificationCenter.current()
    center.delegate = self
    
    let authOptions: UNAuthorizationOptions = [.alert, .sound, .badge]

    center.requestAuthorization(options: authOptions) { granted, error in
        if granted {
            print("✅ Notification permission granted")
        } else {
            print("❌ Notification permission denied")
        }
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

extension AppDelegate : UNUserNotificationCenterDelegate {
  func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) { 
    completionHandler([.badge, .badge,.sound, .list])
  }
}
