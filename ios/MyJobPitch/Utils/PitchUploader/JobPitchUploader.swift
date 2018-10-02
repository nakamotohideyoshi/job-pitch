//
//  JobPitchUploader.swift
//  MyJobPitch
//
//  Created by dev on 5/4/18.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class JobPitchUploader: PitchUploader {
    
    func uploadVideo(videoUrl: URL!, job: NSNumber, complete:((PitchObject?) -> Void)!, progress:((Float) -> Void)!) {
        
        self.endpoint = "job-videos"
        self.complete = complete
        self.progress = progress
        
        let pitch = JobPitch()
        pitch.job = job
        API.shared().saveJobPitch(pitch: pitch, success: { (data) in
            self.pitch = data as! JobPitch!
            self.convertVideo(videoUrl)
        }) { (message, errors) in
            self.uploadFailed()
        }
    }
    
    override func getPitch() {
        
        API.shared().getJobPitch(id: pitch.id, success: { (data) in
            let pitch = data as! JobPitch
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
