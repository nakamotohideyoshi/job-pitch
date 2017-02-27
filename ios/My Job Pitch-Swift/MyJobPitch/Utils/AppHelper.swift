//
//  AppHelper.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import CoreLocation
import MBProgressHUD

class AppHelper: NSObject {

    static func getFrontController() -> UIViewController! {
        
        let revealViewController = UIApplication.shared.keyWindow?.rootViewController as? SWRevealViewController
        var controller = revealViewController?.frontViewController
        
        if let navController = controller as? UINavigationController {
            controller = navController.topViewController
        }
        
        while controller?.presentedViewController != nil {
            controller = controller?.presentedViewController
        }
        
        return controller!
    }
    
    static func getFrontController1() -> UIViewController! {
        
        let revealViewController = UIApplication.shared.keyWindow?.rootViewController as? SWRevealViewController
        var controller = revealViewController?.frontViewController
        
        while controller?.presentedViewController != nil {
            controller = controller?.presentedViewController
        }
        
        return controller!
    }
    
    static var mainStoryboard: UIStoryboard {
        get {
            return UIStoryboard(name: "Main", bundle: nil)
        }
    }
    
    static func showLoading(_ message:String) {
        let hud = createLoading()
        hud.label.text = message
    }
    
    static func createLoading() -> MBProgressHUD {
        
        hideLoading()
        
        let frontController = getFrontController1()
        let hud = MBProgressHUD.showAdded(to: (frontController?.view)!, animated: true)
        hud.backgroundView.color = UIColor(red: 0, green: 0, blue: 0, alpha: 0.65)
        hud.bezelView.style = MBProgressHUDBackgroundStyle.solidColor
        hud.bezelView.backgroundColor = UIColor(red: 35/255.0, green: 35/255.0, blue: 35/255.0, alpha: 0.95)
        hud.contentColor = UIColor.white
        
        return hud
    }
    
    static func hideLoading() {
        let frontController = getFrontController1()
        MBProgressHUD.hide(for: (frontController?.view)!, animated: true)
    }
    
    static func loadImageURL(imageUrl: String,
                             imageView: UIImageView,
                             completion: (() -> Void)!) {
        
        let indicator = UIActivityIndicatorView.init(activityIndicatorStyle: .gray)
        indicator.center = CGPoint(x: imageView.frame.size.width*0.5,
                                   y: imageView.frame.size.height*0.5)
        indicator.startAnimating()
        indicator.tag = 1000
        imageView.addSubview(indicator)
        imageView.image = nil
        NSURLConnection.sendAsynchronousRequest(URLRequest(url: (URL(string:imageUrl))!),
                                                queue: OperationQueue.main) { (response, data, error) in
                                                    if imageView.image == nil && data != nil {
                                                        imageView.image = UIImage(data: data!)
                                                    }
                                                    indicator.removeFromSuperview()
                                                    completion?()
        }
        
    }
    
    static func distance(latitude1: NSNumber, longitude1: NSNumber, latitude2: NSNumber, longitude2: NSNumber) -> String {
        
        let location1 = CLLocation(latitude: CLLocationDegrees(latitude1), longitude: CLLocationDegrees(longitude1))
        let location2 = CLLocation(latitude: CLLocationDegrees(latitude2), longitude: CLLocationDegrees(longitude2))
        let d = location1.distance(from: location2)
        if d < 1000 {
            return String.init(format: "%.0f m", d)
        }
        if d < 10000 {
            return String.init(format: "%.1f km", d/1000)
        }
        return String.init(format: "%.0f km", d/1000)
    }
    
}
