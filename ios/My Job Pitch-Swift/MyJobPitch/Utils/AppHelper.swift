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

    static func instantiate(_ identifier: String) -> UIViewController {
        return UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: identifier)
    }
    
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
    
    
    // ====================== load image ========================
    
    static func loadImageURL(imageUrl: String,
                             imageView: UIImageView,
                             completion: (() -> Void)?) {
        
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
    
    static func removeLoading(imageView: UIImageView) {
        if let indicator = imageView.viewWithTag(1000) {
            indicator.removeFromSuperview()
        }
    }
    
    static func loadLogo(_ object: MJPObject,
                         imageView: UIImageView,
                         completion: (() -> Void)?) {
        var image: Image?

        if let job = object as? Job {
            image = job.getImage()
        } else if let location = object as? Location {
            image = location.getImage()
        } else if let business = object as? Business {
            image = business.getImage()
        }
        
        if let thumbnail = image?.thumbnail {
            AppHelper.loadImageURL(imageUrl: thumbnail, imageView: imageView, completion: completion)
            return
        }
        
        imageView.image = UIImage(named: "default-logo")
        completion?()
    }
    
    static func loadPhoto(_ jobseeker: JobSeeker,
                          imageView: UIImageView,
                          completion: (() -> Void)?) {
        if let avatar = jobseeker.profileThumb {
            AppHelper.loadImageURL(imageUrl: avatar, imageView: imageView, completion: completion)
            return
        }
        
        imageView.image = UIImage(named: "avatar")
        completion?()
    }
        
    
    // ====================== distance ========================
    
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
    
    // ====================== date to string ========================
    
    static func dateToShortString(_ date: Date) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMM dd, HH:mm a"
        return dateFormatter.string(from: date)
    }
    
    static func dateToLongString(_ date: Date) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        
        return String(format: "%@ at %@", dateFormatter.string(from: date), dateFormatter1.string(from: date))
    }
    
    
    
}
