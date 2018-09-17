//
//  AppDelegate.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import GoogleMaps
import GooglePlaces
import Google
import GoogleSignIn
import SwiftyDropbox

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?


    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // google service
        GMSServices.provideAPIKey("AIzaSyA6ib_xnG15XZML0NwRusEEnRkZ4OoINDY")
        GMSPlacesClient.provideAPIKey("AIzaSyA6ib_xnG15XZML0NwRusEEnRkZ4OoINDY")
        
        // Initialize google sign-in
        var configureError: NSError?
        GGLContext.sharedInstance().configureWithError(&configureError)
        assert(configureError == nil, "Error configuring Google services: \(configureError)")
        
        // dropbox
        DropboxClientsManager.setupWithAppKey("gpwecvaun9wmvim")
                
        let navigationBarAppearace = UINavigationBar.appearance()
        navigationBarAppearace.tintColor = UIColor.white
        navigationBarAppearace.barTintColor = AppData.darkColor
        navigationBarAppearace.isTranslucent = false
        navigationBarAppearace.titleTextAttributes = [NSForegroundColorAttributeName:UIColor.white]
        navigationBarAppearace.backIndicatorImage = UIImage(named: "nav-back")
        navigationBarAppearace.backIndicatorTransitionMaskImage = UIImage(named: "nav-back")
        return true
    }
    
    func application(_ application: UIApplication, open url: URL, sourceApplication: String?, annotation: Any) -> Bool {
        return GIDSignIn.sharedInstance().handle(url,
                                                 sourceApplication: sourceApplication,
                                                 annotation: annotation)
    }
    
    @available(iOS 9.0, *)
    func application(_ app: UIApplication, open url: URL,
                     options: [UIApplicationOpenURLOptionsKey : Any]) -> Bool {
        if let authResult = DropboxClientsManager.handleRedirectURL(url) {
            switch authResult {
            case .success(let token):
                print("Success! User is logged into Dropbox with token: \(token)")
            case .cancel:
                print("User canceld OAuth flow.")
            case .error(let error, let description):
                print("Error \(error): \(description)")
            }
            return false
        }
        
        let sourceApplication = options[UIApplicationOpenURLOptionsKey.sourceApplication] as? String
        let annotation = options[UIApplicationOpenURLOptionsKey.annotation]
        return GIDSignIn.sharedInstance().handle(url,
                                                 sourceApplication: sourceApplication,
                                                 annotation: annotation)
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

