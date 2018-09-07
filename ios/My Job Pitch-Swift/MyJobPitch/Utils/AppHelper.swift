//
//  AppHelper.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import CoreLocation
import Nuke

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
    
    static func loadImageURL(imageUrl: String,
                             imageView: UIImageView,
                             completion: (() -> Void)!) {
        
        removeLoading(imageView: imageView)
        
        let indicator = UIActivityIndicatorView.init(activityIndicatorStyle: .gray)
        indicator.center = CGPoint(x: imageView.frame.size.width*0.5,
                                   y: imageView.frame.size.height*0.5)
        indicator.startAnimating()
        indicator.tag = 1000
        imageView.addSubview(indicator)
        imageView.image = nil
        Nuke.loadImage(with: URL(string: imageUrl)!, into: imageView) { (result, _) in
            if result.error == nil && imageView.image == nil {
                imageView.image = result.value
            }
            indicator.removeFromSuperview()
            completion?()
        }
    }
    
    static func loadLogo(image: Image?,
                         imageView: UIImageView,
                         completion: (() -> Void)!) {
        if let thumbnail = image?.thumbnail {
            AppHelper.loadImageURL(imageUrl: thumbnail, imageView: imageView, completion: nil)
        } else {
            imageView.image = UIImage(named: "default-logo")
        }
    }
    
    static func loadJobseekerImage(_ jobseeker: JobSeeker,
                                   imageView: UIImageView,
                                   completion: (() -> Void)!) {
        if let image = jobseeker.getPitch()?.thumbnail {
            AppHelper.loadImageURL(imageUrl: image, imageView: imageView, completion: nil)
        } else {
            imageView.image = UIImage(named: "no-img")
        }
    }
    
    static func removeLoading(imageView: UIImageView) {
        if let indicator = imageView.viewWithTag(1000) {
            indicator.removeFromSuperview()
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
    
    static func convertDateToString(_ date: Date) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        
        return String(format: "%@ at %@", dateFormatter.string(from: date), dateFormatter1.string(from: date))
    }
    
}
