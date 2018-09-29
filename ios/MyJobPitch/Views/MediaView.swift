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
    
    @IBOutlet var contentView: UIView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var playIcon: UIImageView!
    @IBOutlet weak var playButton: UIButton!
    
    var controller: UIViewController!
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        loadViewFromNib()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        loadViewFromNib()
    }
    
    var model: MediaModel! {
        didSet {
            
            if model.video == nil {
                let size = frame.size
                let d = size.height * 0.8
                imgView.frame = CGRect(x: size.width / 2 - d / 2, y: size.height / 2 - d / 2, width: d, height: d)
            } else {
                imgView.frame = self.frame
            }
            
            if model.thumbnail != nil {
                AppHelper.loadImageURL(imageUrl: model.thumbnail, imageView: imgView, completion: nil)
                playButton.frame = imgView.frame
            } else if model.defaultImage != nil {
                imgView.image = model.defaultImage
            }
            
            playButton.isHidden = model.thumbnail == nil
            playIcon.isHidden = model.video == nil
        }
    }
    
    @IBAction func clickAction(_ sender: Any) {
        if let video = model.video {
            let player = AVPlayer(url: URL(string: video)!)
            let playerController = AVPlayerViewController();
            playerController.player = player
            controller.present(playerController, animated: true, completion: nil)
        } else {
            let imageInfo = JTSImageInfo()
            imageInfo.referenceRect = imgView.frame
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
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("MediaView", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
    
}
