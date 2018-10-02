//
//  PitchUploader.swift
//  MyJobPitch
//
//  Created by dev on 8/14/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import AWSS3
import AVFoundation

class PitchUploader: NSObject {

    var pitch: PitchObject!
    var progress: ((Float) -> Void)!
    var complete: ((PitchObject?) -> Void)!
    var endpoint: String!
    
    func convertVideo(_ url: URL!) {
        
        let avAsset = AVURLAsset(url: url)
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
                    self.startUpload(URL(string: "file://localhost/private" + mp4Path))
                }
            })
            
        } else {
            startUpload(url)
        }
        
    }
    
    func startUpload(_ url: URL!) {
        
        let expression = AWSS3TransferUtilityUploadExpression()
        
        expression.progressBlock = { (task, progress) in
            DispatchQueue.main.async {
                self.progress(Float(progress.fractionCompleted))
            }
        }
        
        let urlKey = API.apiRoot.absoluteString.replacingOccurrences(of: "/", with: "")
        let keyname = String(format: "%@/%@.%@.%@.%@", urlKey, pitch.token, pitch.id, endpoint, url.lastPathComponent)
        let transferUtility = AWSS3TransferUtility.default()
        (transferUtility.uploadFile(url,
                                    bucket: "mjp-android-uploads",
                                    key: keyname,
                                    contentType: url.lastPathComponent.contains("mp4") ? "video/mp4" : "video/quicktime",
                                    expression: expression) { (taks, error) in
                                        if error == nil {
                                            self.getPitch()
                                        } else {
                                            print(error?.localizedDescription)
                                            self.uploadFailed()
                                        }
                                        
        }).continue({ (task) -> Any? in
            //            if task.error != nil || task.exception != nil {
            if task.error != nil {
                self.uploadFailed()
            }
            return nil
        })
        
    }
    
    func getPitch() {}
    
    func uploadFailed() {
        DispatchQueue.main.async {
            self.complete?(nil)
        }
    }
    
}
