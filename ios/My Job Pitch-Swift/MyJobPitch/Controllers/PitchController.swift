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
    @IBOutlet weak var noRecording: UILabel!

    var videoUrl: URL!
    
    var jobSeeker: JobSeeker!
    var pitch: Pitch!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //imgView.addDotBorder(dotWidth: 4, color: UIColor.black)

        AppHelper.showLoading("Loading...")
        API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
            AppHelper.hideLoading()
            self.jobSeeker = data as! JobSeeker
            AppData.existProfile = self.jobSeeker.profile != nil
            
            self.pitch = self.jobSeeker.getPitch()
            if let thumbnail = self.pitch?.thumbnail {
                AppHelper.loadImageURL(imageUrl: thumbnail, imageView: self.imgView, completion: {
                    self.playIcon.isHidden = false
                    self.playButton.isEnabled = true
                })
            } else {
                self.noRecording.isHidden = false
            }
        }, failure: self.handleErrors)
        
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
        
        PitchController.uploadVideo(videoUrl: videoUrl) { (pitch) in
            if pitch != nil {
                self.pitch = pitch
                self.videoUrl = nil
                UIView.animate(withDuration: 0.3, animations: {
                    self.uploadButton.alpha = 0
                }, completion: { (finished) in
                    self.uploadButton.isHidden = true
                })
                PopupController.showGreen("Success!", ok: "OK", okCallback: nil, cancel: nil, cancelCallback: nil)
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
        
        let urlKey = API.apiRoot.absoluteString.replacingOccurrences(of: "/", with: "")
        let keyname = String(format: "%@/%@.%@.%@", urlKey, pitch.token, pitch.id, url.lastPathComponent)
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
            //            if task.error != nil || task.exception != nil {
            if task.error != nil {
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
