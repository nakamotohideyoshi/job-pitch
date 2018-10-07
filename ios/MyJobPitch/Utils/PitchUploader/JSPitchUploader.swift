//
//  JSPitchUploader.swift
//  MyJobPitch
//
//  Created by dev on 8/14/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class JSPitchUploader: PitchUploader {

    func uploadVideo(videoUrl: URL!, complete:((Pitch?) -> Void)!, progress:((Float) -> Void)!) {
        
        self.endpoint = "pitches"
        self.complete = complete
        self.progress = progress
        
        API.shared().savePitch(Pitch(), success: { (data) in
            self.pitch = data as! Pitch!
            self.convertVideo(videoUrl)
        }) { (message, errors) in
            self.uploadFailed()
        }
    }
    
    override func getPitch() {
        
        API.shared().getPitch(pitch.id, success: { (data) in
            let pitch = data as! Pitch
            if pitch.video == nil {
                Thread.sleep(forTimeInterval: 2)
                self.getPitch()
            } else {
                DispatchQueue.main.async {
                    self.complete?(pitch)
                }
            }
        }) { (message, errors) in
            self.uploadFailed()
        }
    }
}
