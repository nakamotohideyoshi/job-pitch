//
//  MediaView.swift
//  MyJobPitch
//
//  Created by bb on 9/18/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//


import UIKit
import JTSImageViewController
import AVFoundation
import AVKit

class MediaView: UIView {
    
    var imageView: UIImageView!
    var playIcon: UIImageView!
    var playButton: UIButton!
    var controller: UIViewController!
    
    var model: MediaModel! {
        didSet {
            
            if model.video == nil {
                let size = frame.size
                let d = size.height * 0.8
                imageView.frame = CGRect(x: size.width / 2 - d / 2, y: size.height / 2 - d / 2, width: d, height: d)
                imageView.layer.cornerRadius = model.isCircleView ? d / 2 : 0
            } else {
                imageView.frame = self.frame
                imageView.layer.cornerRadius = 0
            }
            
            if model.thumbnail != nil {
                AppHelper.loadImageURL(imageUrl: model.thumbnail, imageView: imageView, completion: nil)
                playButton.frame = imageView.frame
            } else if model.defaultImage != nil {
                imageView.image = model.defaultImage
            }
            
            playButton.isHidden = model.thumbnail == nil
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
                imageInfo.image = model.defaultImage
            }
            
            let imageViewer = JTSImageViewController.init(imageInfo: imageInfo, mode: .image, backgroundStyle: .init(rawValue: 0))
            imageViewer?.show(from: controller, transition: .fromOriginalPosition)
        }
    }
    
    class func instantiate(_ frame:CGRect) -> MediaView {
        let view = UINib(nibName: "MediaView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! UIView
        view.translatesAutoresizingMaskIntoConstraints = false
        
        let mediaView = MediaView(frame: frame)
        mediaView.addSubview(view)
        mediaView.imageView = view.viewWithTag(1) as! UIImageView
        mediaView.imageView.frame = frame
        mediaView.playIcon = view.viewWithTag(2) as! UIImageView
        mediaView.playButton = view.viewWithTag(3) as! UIButton
        mediaView.playButton.addTarget(mediaView, action: #selector(mediaView.viewAction(_:)), for: .touchUpInside)
        
        mediaView.addConstraint(NSLayoutConstraint(item: view, attribute: .leading, relatedBy: .equal, toItem: mediaView, attribute: .leading, multiplier: 1.0, constant: 0))
        mediaView.addConstraint(NSLayoutConstraint(item: view, attribute: .trailing, relatedBy: .equal, toItem: mediaView, attribute: .trailing, multiplier: 1.0, constant: 0))
        mediaView.addConstraint(NSLayoutConstraint(item: view, attribute: .top, relatedBy: .equal, toItem: mediaView, attribute: .top, multiplier: 1.0, constant: 0))
        mediaView.addConstraint(NSLayoutConstraint(item: view, attribute: .bottom, relatedBy: .equal, toItem: mediaView, attribute: .bottom, multiplier: 1.0, constant: 0))
        
        return mediaView
    }
    
}
