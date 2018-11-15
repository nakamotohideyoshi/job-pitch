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

class PitchController: MJPController {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var playIcon: UIImageView!
    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var uploadButton: GreenButton!
    @IBOutlet weak var skipButton: UIButton!
    @IBOutlet weak var noRecording: UILabel!

    var videoUrl: URL!
    
    var pitch: Pitch!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //imgView.addDotBorder(dotWidth: 4, color: UIColor.black)
        
        uploadButton.isHidden = true

        pitch = AppData.jobseeker.getPitch()
        if let thumbnail = self.pitch?.thumbnail {
            AppHelper.loadImageURL(imageUrl: thumbnail, imageView: self.imgView, completion: {
                self.playIcon.isHidden = false
                self.playButton.isEnabled = true
            })
            skipButton.isHidden = true
        } else {
            noRecording.isHidden = false
            skipButton.isHidden = false
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
    
    @IBAction func playDemoAction(_ sender: Any) {
        UIApplication.shared.openURL(NSURL(string: "https://vimeo.com/255467562")! as URL)
    }
    
    @IBAction func recordVideoAction(_ sender: Any) {
        
        let controller = CameraController.instantiate()
        
        controller.complete = { (videoUrl) in
            
            self.videoUrl = videoUrl
            self.playIcon.isHidden = false
            self.playButton.isEnabled = true
            self.uploadButton.isHidden = false
            self.noRecording.isHidden = true
            
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

    @IBAction func uploadAction(_ sender: Any) {
        
        showLoading("0%", withProgress: 0)
        
        API.shared().savePitch(Pitch()) { (result, error) in
            if error != nil {
                self.handleError(error)
                return
            }
            
            PitchUploader().uploadVideo(self.videoUrl, pitch: result as! Pitch, endpoint: "pitches", progress: { (progress) in
                if progress < 1 {
                    self.showLoading("Uploading Pitch...", withProgress: progress)
                } else {
                    self.showLoading()
                }
            }) { pitch in
                if pitch == nil {
                    self.handleError(error)
                    return
                }

                self.hideLoading()
                self.videoUrl = nil
                self.uploadButton.isHidden = true
                
                self.pitch = pitch
                AppData.jobseeker.pitches = [self.pitch]
                
                PopupController.showGreen("Success!", ok: "OK", okCallback: nil, cancel: nil, cancelCallback: nil)
            }
        }
    }
    
    @IBAction func skipRecord(_ sender: Any) {
        SideMenuController.pushController(id: "find_job")
    }
    
    @IBAction func helpAction(_ sender: Any) {
        let controller = storyboard?.instantiateViewController(withIdentifier: "WebView") as! WebViewController
        controller.navigationItem.title = "Recording Pitch"
        controller.file = "pitch"
        controller.isModal = true
        let navController = UINavigationController(rootViewController: controller)
        present(navController, animated: true, completion: nil)
    }
    
}
