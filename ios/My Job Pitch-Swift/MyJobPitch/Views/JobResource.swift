//
//  JobResource.swift
//  MyJobPitch
//
//  Created by dev on 5/17/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import JTSImageViewController
import AVFoundation
import AVKit

class JobResource: UIView {
    
    var imageView: UIImageView!
    var playIcon: UIImageView!
    var playButton: UIButton!
    var controller: UIViewController!
    
    var model: JobResourceModel! {
        didSet {
            
            if let thumbnail = model.thumbnail {
                AppHelper.loadImageURL(imageUrl: thumbnail, imageView: imageView, completion: nil)
            } else {
                if model.isLogo {
                     imageView.image = UIImage(named: "default-logo")
                }
            }
  
            let size = self.frame.size
            let d = size.width * 0.25
            if model.isLogo {
                imageView.frame = CGRect(x: size.width / 2 - d / 2, y: size.height / 2 - d / 2, width: d, height: d)
            } else {
                imageView.frame = self.frame
            }
            playButton.frame = imageView.frame
            
            playIcon.isHidden = model.video == nil
        }
    }
    
    func viewAction(_ sender: AnyObject) {
        if let video = model.video {
            let player = AVPlayer(url: URL(string: video)!)
            let playerController = AVPlayerViewController();
            playerController.player = player
            controller.present(playerController, animated: true, completion: nil)
        } else {
            let imageInfo = JTSImageInfo()
            imageInfo.referenceRect = imageView.frame
            imageInfo.referenceView = controller.view
            
             if let image = model.image {
                imageInfo.imageURL = URL(string: image)
            } else {
                imageInfo.image = UIImage(named: "default-logo")
            }
            
            let imageViewer = JTSImageViewController.init(imageInfo: imageInfo, mode: .image, backgroundStyle: .init(rawValue: 0))
            imageViewer?.show(from: controller, transition: .fromOriginalPosition)
        }
    }
    
    class func instanceFromNib(_ frame:CGRect) -> JobResource {
        let view = UINib(nibName: "JobResource", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! UIView
        view.translatesAutoresizingMaskIntoConstraints = false
        
        let jobResource = JobResource(frame: frame)
        jobResource.addSubview(view)
        jobResource.imageView = view.viewWithTag(1) as! UIImageView
        jobResource.imageView.frame = frame
        jobResource.playIcon = view.viewWithTag(2) as! UIImageView
        jobResource.playButton = view.viewWithTag(3) as! UIButton
        jobResource.playButton.addTarget(jobResource, action: #selector(jobResource.viewAction(_:)), for: .touchUpInside)
        
        jobResource.addConstraint(NSLayoutConstraint(item: view, attribute: .leading, relatedBy: .equal, toItem: jobResource, attribute: .leading, multiplier: 1.0, constant: 0))
        jobResource.addConstraint(NSLayoutConstraint(item: view, attribute: .trailing, relatedBy: .equal, toItem: jobResource, attribute: .trailing, multiplier: 1.0, constant: 0))
        jobResource.addConstraint(NSLayoutConstraint(item: view, attribute: .top, relatedBy: .equal, toItem: jobResource, attribute: .top, multiplier: 1.0, constant: 0))
        jobResource.addConstraint(NSLayoutConstraint(item: view, attribute: .bottom, relatedBy: .equal, toItem: jobResource, attribute: .bottom, multiplier: 1.0, constant: 0))
        
        return jobResource
    }
    
}
