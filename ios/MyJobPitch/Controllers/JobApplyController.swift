//
//  PitchController.swift
//  MyJobPitch
//
//  Created by dev on 12/14/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import AVFoundation
import AVKit

class JobApplyController: MJPController {
    
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var playIcon: UIImageView!
    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var applyButton: GreenButton!
    
    public var job: Job!
    public var completeCallback: (() -> Void)?
    
    var videoUrl: URL!
    var pitch: Pitch!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        self.pitch = AppData.jobSeeker.getPitch()
        if let thumbnail = self.pitch?.thumbnail {
            AppHelper.loadImageURL(imageUrl: thumbnail, imageView: self.imgView, completion: {
                self.playIcon.isHidden = false
                self.playButton.isEnabled = true
            })
        } else {
            applyButton.isHidden = job.requiresPitch
        }
    }
    
    @IBAction func playVideoAction(_ sender: Any) {
        
        var url = videoUrl
        
        if url == nil {
            if let video = pitch.video {
                url = URL(string: video)
            }
        }
        
        if url != nil {
            let player = AVPlayer(url: url!)
            let playerController = MJPPlayerController();
            playerController.player = player
            present(playerController, animated: true, completion: nil)
        }
    }
    
    @IBAction func recordVideoAction(_ sender: Any) {
        
        let controller = CameraController.instantiate()
        
        controller.complete = { (videoUrl) in
            
            self.videoUrl = videoUrl
            self.playIcon.isHidden = false
            self.playButton.isEnabled = true
            self.applyButton.isHidden = false
            
            // get image
            
            let asset = AVAsset(url: videoUrl!)
            let assetImageGenerator = AVAssetImageGenerator(asset: asset)
            assetImageGenerator.appliesPreferredTrackTransform = true
            var time = asset.duration
            time.value = min(time.value, 1)
            do {
                let imageRef = try assetImageGenerator.copyCGImage(at: time, actualTime: nil)
                self.imgView.image = UIImage(cgImage: imageRef)
                if let indicator = self.imgView.viewWithTag(1000) {
                    indicator.isHidden = true
                }
            } catch {
                print("error")
            }
            
        }
        
        present(controller, animated: true, completion: nil)
        
    }
    
    @IBAction func applyAction(_ sender: Any) {
        
        let apply = { (pitchId: NSNumber?) in
            
            let application = pitchId == nil ? ApplicationForCreation() : ApplicationForCreationWithPitch()
            application.job = self.job.id
            application.jobSeeker = AppData.jobSeeker.id
            application.pitch = pitchId
            
            API.shared().createApplication(application) {(_, error) in
                if error == nil {
                    self.closeController()
                    self.completeCallback?()
                } else {
                    self.handleError(error)
                }
            }
        }
        
        showLoading()
        
        if self.videoUrl == nil {
            apply(nil)
            return
        }
        
        let specificPitch = SpecificPitchForCreation()
        specificPitch.jobSeeker = AppData.jobSeeker.id
        
        API.shared().saveSpecificPitch(specificPitch) { (result, error) in
            if error != nil {
                self.handleError(error)
                return
            }
            
            PitchUploader().uploadVideo(self.videoUrl, pitch: result as! Pitch, endpoint: "application-pitches", progress: { (progress) in
                if progress < 1 {
                    self.showLoading("Uploading Pitch...", withProgress: progress)
                } else {
                    self.showLoading()
                }
            }) { pitch in
                if pitch == nil {
                    self.handleError(error)
                } else {
                    apply(pitch?.id)
                }
            }
        }
    }
    
    static func instantiate() -> JobApplyController {
        return AppHelper.instantiate("JobApply") as! JobApplyController
    }
    
}
