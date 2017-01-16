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
import AWSS3

class PitchController: MJPController {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var playIcon: UIImageView!
    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var uploadButton: YellowButton!

    var videoUrl: URL!
    
    var pitch: Pitch!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        if let thumbnail = AppData.jobSeeker?.getPitch()?.thumbnail {
            AppHelper.loadImageURL(imageUrl: thumbnail, imageView: imgView, completion: {
                self.playIcon.isHidden = false
                self.playButton.isEnabled = true
            })
        }
        
        pitch = AppData.jobSeeker?.getPitch()
        
    }
    
    @IBAction func playVideoAction(_ sender: Any) {
        
        var url = videoUrl
        
        if url == nil {
            if let video = AppData.jobSeeker?.getPitch()?.video {
                url = URL(string: video)
            }
        }
       
        if url != nil {
            let player = AVPlayer(url: url!)
            let playerController = AVPlayerViewController();
            playerController.player = player
            present(playerController, animated: true, completion: nil)
        }
    }
    
    @IBAction func recordVideoAction(_ sender: Any) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Camera") as! CameraController
        
        controller.complete = { (videoUrl) in
            
            self.videoUrl = videoUrl
            self.playIcon.isHidden = false
            self.playButton.isEnabled = true
            self.uploadButton.alpha = 1
            self.uploadButton.isHidden = false
            
            // get image
            let asset = AVURLAsset(url: videoUrl!)
            let imgGenerator = AVAssetImageGenerator(asset: asset)
            do {
                let cgImage = try imgGenerator.copyCGImage(at: CMTimeMake(0, 1), actualTime: nil)
                self.imgView.image = UIImage(cgImage: cgImage)
                if let indicator = self.imgView.viewWithTag(1000) {
                    indicator.isHidden = true
                }
            } catch {}
            
        }
        
        present(controller, animated: true, completion: nil)
        
    }

    @IBAction func uploadAction(_ sender: Any) {
        
        PitchController.uploadVideo(videoUrl: videoUrl) { (pitch) in
            if pitch != nil {
                self.pitch = pitch
                self.videoUrl = nil
                UIView.animate(withDuration: 0.3, animations: {
                    self.uploadButton.alpha = 0
                }, completion: { (finished) in
                    self.uploadButton.isHidden = true
                })
            }
        }
        
    }
    
    
    // ======================= upload ========================
    
    static var videoUrl: URL!
    static var pitch: Pitch!
    static var completed: ((Pitch?) -> Void)!
    
    static func uploadVideo(videoUrl: URL!, complete:((Pitch?) -> Void)!) {
        
        PitchController.videoUrl = videoUrl
        PitchController.completed = complete
        
        AppHelper.showLoading("Processing...")
        
        API.shared().savePitch(pitch: Pitch(), success: { (data) in
            PitchController.pitch = data as! Pitch!
            PitchController.convertVideo()
        }) { (message, errors) in
            uploadFailed()
        }
    }
    
    static func convertVideo() {
        
        let avAsset = AVURLAsset(url: videoUrl)
        let compatiblePresets = AVAssetExportSession.exportPresets(compatibleWith: avAsset)
        if compatiblePresets.contains(AVAssetExportPresetLowQuality) {
            
            let exportSession = AVAssetExportSession(asset: avAsset, presetName: AVAssetExportPresetLowQuality)!
            let formater = DateFormatter()
            formater.dateFormat = "yyyyMMddHHmmss"
            let mp4Path = NSHomeDirectory().appendingFormat("/Documents/%@.mp4", formater.string(from: Date()))
            exportSession.outputURL = URL(fileURLWithPath: mp4Path)
            exportSession.shouldOptimizeForNetworkUse = true
            exportSession.outputFileType = AVFileTypeMPEG4
            exportSession.exportAsynchronously(completionHandler: {
                if exportSession.status == .completed {
                    DispatchQueue.main.async {
                        PitchController.startUpload(URL(string: "file://localhost/private" + mp4Path))
                    }
                }
            })
            
        } else {
            startUpload(videoUrl)
        }
        
    }
    
    static func startUpload(_ url: URL!) {
        
        let hud = AppHelper.createLoading()
        hud.mode = .determinateHorizontalBar
        hud.label.text = "Uploading..."
        
        let expression = AWSS3TransferUtilityUploadExpression()
        
        expression.progressBlock = { (task, progress) in
            DispatchQueue.main.async {
                hud.progress = Float(progress.fractionCompleted)
            }
        }
        
        let keyname = String(format: "%@/%@.%@.%@", "https:www.sclabs.co.uk", pitch.token, pitch.id, url.lastPathComponent)
        let transferUtility = AWSS3TransferUtility.default()
        (transferUtility.uploadFile(url,
                                    bucket: "mjp-android-uploads",
                                    key: keyname,
                                    contentType: url.lastPathComponent.contains("mp4") ? "video/mp4" : "video/quicktime",
                                    expression: expression) { (taks, error) in
                                        DispatchQueue.main.async {
                                            if error == nil {
                                                AppHelper.showLoading("Processing...")
                                                PitchController.getPitch()
                                            } else {
                                                PitchController.uploadFailed()
                                            }
                                        }
                                        
        }).continue({ (task) -> Any? in
            if task.error != nil || task.exception != nil {
                PitchController.uploadFailed()
            }
            return nil
        })
        
    }
    
    static func getPitch() {
        
        API.shared().getPitch(id: pitch.id, success: { (data) in
            let pitch = data as! Pitch
            if pitch.video == nil {
                Thread.sleep(forTimeInterval: 2)
                PitchController.getPitch()
            } else {
                AppHelper.hideLoading()
                PitchController.completed?(pitch)
                PitchController.pitch = nil
                PitchController.videoUrl = nil
                PitchController.completed = nil
            }
        }) { (message, errors) in
            uploadFailed()
        }
    }
    
    static func uploadFailed() {
        PopupController.showGray("Failed to upload", ok: "OK")
        
        completed?(nil)
        pitch = nil
        videoUrl = nil
        completed = nil
    }
    
}
